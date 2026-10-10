import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Search, X, Plus, Package, Star, List } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Product } from "../../types/product";
import { THEME } from "../../lib/theme";

interface ProductPickerModalProps {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAddProduct?: () => void;
}

type TabMode = "favorites" | "all";

export function ProductPickerModal({
  visible,
  onClose,
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onOpenAddProduct,
}: ProductPickerModalProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("favorites");

  const favoriteProducts = products.filter((p) => (p as any).is_favorite);
  const hasSearch = searchQuery.trim().length > 0;

  const handleProductPress = (product: Product) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    onSelectProduct(product);
  };

  const handleTabChange = (tab: TabMode) => {
    setActiveTab(tab);
    if (tab === "favorites") onSearchChange("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Katalog & Pencarian Produk</Text>
            <View style={styles.headerRightActions}>
              {onOpenAddProduct && (
                <TouchableOpacity
                  style={styles.addProductBtn}
                  onPress={onOpenAddProduct}
                  activeOpacity={0.75}
                >
                  <Plus size={13} color={THEME.colors.textInverse} />
                  <Text style={styles.addProductBtnText}>+ Produk</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Segmented Tab Bar: Favorit vs Semua */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "favorites" && styles.tabBtnActive]}
              onPress={() => handleTabChange("favorites")}
              activeOpacity={0.75}
            >
              <Star
                size={13}
                color={activeTab === "favorites" ? THEME.colors.amberLight : THEME.colors.textMuted}
                fill={activeTab === "favorites" ? THEME.colors.amberLight : "none"}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "favorites" && styles.tabBtnTextActive,
                ]}
              >
                Favorit Toko
              </Text>
              {favoriteProducts.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{favoriteProducts.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
              onPress={() => handleTabChange("all")}
              activeOpacity={0.75}
            >
              <List
                size={13}
                color={activeTab === "all" ? THEME.colors.primaryMuted : THEME.colors.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "all" && styles.tabBtnTextActive,
                ]}
              >
                Semua Produk ({products.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: FAVORIT (Quick Grid) */}
          {activeTab === "favorites" && (
            <ScrollView
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            >
              {favoriteProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Star size={32} color={THEME.colors.textTertiary} />
                  <Text style={styles.emptyTitle}>Belum ada produk favorit</Text>
                  <Text style={styles.emptySubtitle}>
                    Tandai produk terlaris sebagai favorit di Supabase dengan{" "}
                    <Text style={styles.emptyCode}>is_favorite = true</Text>
                  </Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {favoriteProducts.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.gridCard}
                      onPress={() => handleProductPress(product)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.gridCardTop}>
                        <Text style={styles.gridProductName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <View style={styles.gridAddBtn}>
                          <Plus size={13} color={THEME.colors.textInverse} />
                        </View>
                      </View>
                      <View>
                        <Text style={styles.gridProductPrice}>
                          Rp{product.price.toLocaleString("id-ID")}
                        </Text>
                        {product.category && (
                          <View style={styles.gridCategoryTag}>
                            <Text style={styles.gridCategoryText} numberOfLines={1}>
                              {product.category}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* TAB 2: SEMUA PRODUK (Search + Category + List) */}
          {activeTab === "all" && (
            <>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Search size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari nama produk atau kode barcode..."
                  placeholderTextColor={THEME.colors.textMuted}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => onSearchChange("")}
                    style={styles.clearSearchBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color={THEME.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Categories Pills */}
              {!hasSearch && (
                <View style={styles.categoriesWrapper}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoryListContent}
                    renderItem={({ item }) => {
                      const isActive = item === selectedCategory;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.categoryPill,
                            isActive && styles.categoryPillActive,
                          ]}
                          onPress={() => onSelectCategory(item)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.categoryPillText,
                              isActive && styles.categoryPillTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}

              {/* Products List */}
              <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.productListContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Package size={32} color={THEME.colors.textTertiary} />
                    <Text style={styles.emptyTitle}>Tidak ada produk ditemukan</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productRow}
                    onPress={() => handleProductPress(item)}
                    activeOpacity={0.65}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.badgeRow}>
                        <Text style={styles.productPrice}>
                          Rp{item.price.toLocaleString("id-ID")}
                          {item.sell_type === "weight"
                            ? ` / ${item.weight_unit || "ons"}`
                            : " / pcs"}
                        </Text>
                        {item.category && (
                          <View style={styles.categoryTag}>
                            <Text style={styles.categoryTagText}>
                              {item.category}
                            </Text>
                          </View>
                        )}
                        {(item as any).is_favorite && (
                          <Star size={11} color={THEME.colors.amberLight} fill={THEME.colors.amberLight} />
                        )}
                      </View>
                    </View>

                    <View style={styles.addBtnCircle}>
                      <Plus size={15} color={THEME.colors.textInverse} />
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    height: "86%",
    backgroundColor: THEME.colors.surfaceBase,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.sm,
  },
  addProductBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.sm,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: THEME.radius.xs,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.surfaceElevated,
  },
  tabBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: "700",
  },
  tabBadge: {
    backgroundColor: THEME.colors.amberLight,
    borderRadius: THEME.radius.full,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: THEME.colors.canvas,
    fontSize: 9,
    fontWeight: "800",
  },
  gridContent: {
    padding: 14,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridCard: {
    width: "31.5%",
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    minHeight: 90,
    justifyContent: "space-between",
  },
  gridCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  gridProductName: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    flex: 1,
    marginRight: 4,
  },
  gridAddBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  gridProductPrice: {
    color: THEME.colors.primaryMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  gridCategoryTag: {
    marginTop: 3,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: "flex-start",
  },
  gridCategoryText: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: 20,
  },
  emptyCode: {
    color: THEME.colors.primaryMuted,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceCard,
    marginHorizontal: 16,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 13,
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoriesWrapper: {
    paddingVertical: 10,
  },
  categoryListContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.xs,
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  categoryPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  categoryPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  categoryPillTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: "700",
  },
  productListContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    color: THEME.colors.primaryMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  categoryTag: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  addBtnCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
