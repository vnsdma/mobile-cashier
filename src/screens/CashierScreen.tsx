import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wifi,
  WifiOff,
  ShoppingBag,
  Bluetooth,
  PackageSearch,
  Star,
  Plus,
} from "lucide-react-native";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { CameraScanner } from "../components/scanner/CameraScanner";
import { CartItemRow } from "../components/cart/CartItemRow";
import { CartSummaryBar } from "../components/cart/CartSummaryBar";
import { ProductPickerModal } from "../components/catalog/ProductPickerModal";
import { CheckoutModal } from "../components/checkout/CheckoutModal";
import { ReceiptModal } from "../components/receipt/ReceiptModal";
import { EditCartItemModal } from "../components/cart/EditCartItemModal";
import { BluetoothPrinterModal } from "../components/printer/BluetoothPrinterModal";
import { Order, PaymentMethod, ReceiptSettings } from "../types/transaction";
import { CartItem } from "../types/transaction";
import { Product } from "../types/product";
import { DEFAULT_RECEIPT_SETTINGS, STORAGE_KEYS } from "../lib/constants";
import { supabase } from "../lib/supabase";
import { safeStorage, getDeviceUid } from "../lib/storage-adapter";
import {
  printReceiptViaRawBtAsync,
  promptInstallRawBt,
} from "../lib/thermal-printer";
import { THEME } from "../lib/theme";

export function CashierScreen() {
  const {
    products,
    filteredProducts,
    categories,
    loading: productsLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    error: supabaseError,
    refetch: refetchProducts,
  } = useProducts();

  const {
    items: cartItems,
    addItem: addProductToCart,
    updateQuantity,
    updateWeight,
    editItem,
    removeItem,
    clearCart,
    totalAmount,
    totalItemCount,
  } = useCart();

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [receiptSettings] = useState<ReceiptSettings>(DEFAULT_RECEIPT_SETTINGS);

  // Quick favorite products for fast 1-tap addition
  const favoriteProducts = useMemo(() => {
    const favs = products.filter((p) => (p as any).is_favorite);
    // If no favorites are marked in Supabase yet, show the first 6 products as quick shortcuts
    return favs.length > 0 ? favs.slice(0, 8) : products.slice(0, 6);
  }, [products]);

  const handleCheckoutComplete = async (orderData: {
    paymentMethod: PaymentMethod;
    cashTendered?: number;
    changeAmount?: number;
    customerName?: string;
  }) => {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      customer_name: orderData.customerName,
      payment_method: orderData.paymentMethod,
      total_amount: totalAmount,
      cash_tendered: orderData.cashTendered,
      change_amount: orderData.changeAmount,
      items: [...cartItems],
      synced: false,
    };

    // Close checkout and display receipt slip directly (speed velocity)
    setIsCheckoutOpen(false);
    setCompletedOrder(newOrder);
    setIsReceiptOpen(true);

    const itemsSold = [...cartItems];

    // 1. Atomic decrement of products stock in parallel
    await Promise.all(
      itemsSold.map(async (item) => {
        try {
          const { error: rpcErr } = await supabase.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_qty: item.quantity,
          });

          if (rpcErr) {
            // Fallback read-modify-write if RPC is not present
            const { data: currentProduct, error: pErr } = await supabase
              .from("products")
              .select("in_stock")
              .eq("id", item.product_id)
              .single();

            if (!pErr && currentProduct && currentProduct.in_stock != null) {
              const newStock = Math.max(
                0,
                Number(currentProduct.in_stock) - item.quantity
              );
              await supabase
                .from("products")
                .update({ in_stock: newStock })
                .eq("id", item.product_id);
            }
          }
        } catch (stockErr) {
          console.warn("Gagal mengurangi stok produk:", item.product_id, stockErr);
        }
      })
    );

    // Refresh catalog & stock badges
    refetchProducts();

    // 2. Insert order & order_items to Supabase
    try {
      const deviceUid = await getDeviceUid();

      const { data: insertedOrder, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          total_amount: totalAmount,
          subtotal: totalAmount,
          final_amount: totalAmount,
          payment_method: orderData.paymentMethod,
          payment_status: "paid",
          order_status: "confirmed",
          customer_name: orderData.customerName || null,
          user_uid: deviceUid,
          notes: JSON.stringify({
            cash_tendered: orderData.cashTendered || totalAmount,
            change_amount: orderData.changeAmount || 0,
            source: "prawira-mobile-cashier",
          }),
        })
        .select()
        .single();

      if (orderErr) {
        console.warn("Order insert warning:", orderErr);
      } else if (insertedOrder && itemsSold.length > 0) {
        const itemsToInsert = itemsSold.map((item) => ({
          order_id: insertedOrder.id,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.subtotal,
        }));

        const { error: itemsErr } = await supabase
          .from("order_items")
          .insert(itemsToInsert);

        if (itemsErr) {
          console.warn("Order items insert warning:", itemsErr);
        }
      }
    } catch (orderInsertErr) {
      console.warn("Order sync error, queueing locally:", orderInsertErr);
      // Offline fallback: save to local queue
      try {
        const rawQueue = await safeStorage.getItem(STORAGE_KEYS.ORDERS_QUEUE);
        const queue: Order[] = rawQueue ? JSON.parse(rawQueue) : [];
        queue.push(newOrder);
        await safeStorage.setItem(
          STORAGE_KEYS.ORDERS_QUEUE,
          JSON.stringify(queue)
        );
      } catch {
        // Ignore local storage error
      }
    }
  };

  const handleStartNewTransaction = () => {
    clearCart();
    setCompletedOrder(null);
    setIsReceiptOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.canvas} />

      {/* Top 34%: Precision Optical Scanner Viewfinder */}
      <View style={styles.cameraSection}>
        <CameraScanner
          products={products}
          onProductDetected={(product) => addProductToCart(product)}
          onManualSearchPress={() => setIsCatalogOpen(true)}
        />
      </View>

      {/* Bottom 66%: Cashier Transaction Cockpit */}
      <View style={styles.cartSection}>
        {/* Cockpit Header Bar */}
        <View style={styles.cartHeaderBar}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitleText}>PRAWIRA POS</Text>
            <View style={styles.connectionBadge}>
              {supabaseError ? (
                <>
                  <WifiOff size={11} color={THEME.colors.dangerLight} />
                  <Text style={styles.offlineText}>Offline</Text>
                </>
              ) : (
                <>
                  <Wifi size={11} color={THEME.colors.emeraldLight} />
                  <Text style={styles.onlineText}>Online</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.btHeaderBtn}
              onPress={() => setIsBluetoothModalOpen(true)}
              activeOpacity={0.7}
              accessibilityLabel="Pengaturan Printer Bluetooth"
            >
              <Bluetooth size={13} color={THEME.colors.primaryMuted} />
              <Text style={styles.btHeaderBtnText}>Printer BT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.catalogBtn}
              onPress={() => setIsCatalogOpen(true)}
              activeOpacity={0.7}
              accessibilityLabel="Buka Katalog Produk"
            >
              <PackageSearch size={14} color={THEME.colors.textPrimary} />
              <Text style={styles.catalogBtnText}>Katalog</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Shortcut Shelf (Produk Favorit / Cepat) */}
        {favoriteProducts.length > 0 && (
          <View style={styles.quickShelfContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickShelfContent}
            >
              {favoriteProducts.map((p) => (
                <TouchableOpacity
                  key={`quick-${p.id}`}
                  style={styles.quickProductChip}
                  onPress={() => addProductToCart(p)}
                  activeOpacity={0.7}
                >
                  <Plus size={11} color={THEME.colors.primaryMuted} />
                  <Text style={styles.quickProductText} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.quickProductPrice}>
                    Rp{p.price >= 1000 ? `${Math.round(p.price / 1000)}k` : p.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Cart Item Stream */}
        <FlatList
          data={cartItems}
          keyExtractor={(item) => `${item.product_id}-${item.sell_type}`}
          contentContainerStyle={styles.cartListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCartContainer}>
              <View style={styles.emptyIconCircle}>
                <ShoppingBag size={26} color={THEME.colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>Keranjang Belanja Kosong</Text>
              <Text style={styles.emptySubtitle}>
                Arahkan kamera ke barcode/QR barang untuk scan instan, atau pilih dari shortcut produk dan katalog di atas.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              onUpdateQuantity={(newQty) =>
                updateQuantity(item.product_id, newQty)
              }
              onUpdateWeight={(weight) =>
                updateWeight(item.product_id, weight)
              }
              onEditPress={() => {
                setEditingItem(item);
                setIsEditModalOpen(true);
              }}
              onRemove={() => removeItem(item.product_id)}
            />
          )}
        />

        {/* Sticky Bottom Summary Deck & Payment Action */}
        <CartSummaryBar
          totalAmount={totalAmount}
          itemCount={totalItemCount}
          onCheckout={() => setIsCheckoutOpen(true)}
          onClearCart={clearCart}
        />
      </View>

      {/* Catalog & Manual Picker Modal */}
      <ProductPickerModal
        visible={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        products={filteredProducts}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectProduct={(product) => {
          addProductToCart(product);
          setIsCatalogOpen(false);
        }}
      />

      {/* Checkout & Cash Calculator Tender Modal */}
      <CheckoutModal
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={totalAmount}
        onCompleteCheckout={handleCheckoutComplete}
      />

      {/* Thermal Slip & WhatsApp Receipt Modal */}
      <ReceiptModal
        visible={isReceiptOpen}
        order={completedOrder}
        settings={receiptSettings}
        onNewTransaction={handleStartNewTransaction}
        onOpenBluetoothSettings={() => setIsBluetoothModalOpen(true)}
        onPrintThermal={async (order) => {
          const didPrintRawBt = await printReceiptViaRawBtAsync(
            order,
            receiptSettings
          );
          if (!didPrintRawBt) {
            promptInstallRawBt();
          }
        }}
      />

      {/* Bluetooth Printer Setup & Test Modal */}
      <BluetoothPrinterModal
        visible={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        settings={receiptSettings}
      />

      {/* Edit Cart Item & Custom Price Modal */}
      <EditCartItemModal
        visible={isEditModalOpen}
        item={editingItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(productId, updates) => {
          editItem(productId, updates);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.canvas,
  },
  cameraSection: {
    height: "34%",
    backgroundColor: THEME.colors.canvas,
    overflow: "hidden",
  },
  cartSection: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceBase,
    borderTopLeftRadius: THEME.radius.lg,
    borderTopRightRadius: THEME.radius.lg,
    marginTop: -8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cartHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    backgroundColor: THEME.colors.surfaceBase,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandTitleText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.surfaceCard,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  onlineText: {
    color: THEME.colors.emeraldLight,
    fontSize: 10,
    fontWeight: "700",
  },
  offlineText: {
    color: THEME.colors.dangerLight,
    fontSize: 10,
    fontWeight: "700",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.primaryTint,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  btHeaderBtnText: {
    color: THEME.colors.primaryMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  catalogBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  catalogBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  quickShelfContainer: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    backgroundColor: THEME.colors.surfaceBase,
    paddingVertical: 8,
  },
  quickShelfContent: {
    paddingHorizontal: 14,
    gap: 6,
  },
  quickProductChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: THEME.colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  quickProductText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 110,
  },
  quickProductPrice: {
    color: THEME.colors.primaryMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  cartListContent: {
    padding: 12,
    paddingBottom: 24,
  },
  emptyCartContainer: {
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.surfaceCard,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
});
