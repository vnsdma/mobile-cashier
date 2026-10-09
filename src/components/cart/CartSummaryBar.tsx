import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ArrowRight, RotateCcw } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { THEME } from "../../lib/theme";

interface CartSummaryBarProps {
  totalAmount: number;
  itemCount: number;
  onCheckout: () => void;
  onClearCart: () => void;
}

export function CartSummaryBar({
  totalAmount,
  itemCount,
  onCheckout,
  onClearCart,
}: CartSummaryBarProps) {
  const isCartEmpty = itemCount === 0;

  const handleClear = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
    onClearCart();
  };

  const handleCheckoutPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
    onCheckout();
  };

  return (
    <View style={styles.container}>
      {/* Left side: Item count badge & Grand Total */}
      <View style={styles.totalInfoBlock}>
        <View style={styles.headerRow}>
          <Text style={styles.itemCountText}>
            {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
          </Text>
          {!isCartEmpty && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearBtn}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RotateCcw size={11} color={THEME.colors.textMuted} />
              <Text style={styles.clearText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.totalAmountText} numberOfLines={1}>
          Rp{totalAmount.toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Right side: Primary Checkout CTA */}
      <TouchableOpacity
        style={[styles.checkoutBtn, isCartEmpty && styles.checkoutBtnDisabled]}
        onPress={handleCheckoutPress}
        disabled={isCartEmpty}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Lanjut ke Pembayaran"
      >
        <Text style={styles.checkoutBtnText}>BAYAR</Text>
        <View style={styles.arrowCircle}>
          <ArrowRight size={15} color={THEME.colors.textInverse} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surfaceBase,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalInfoBlock: {
    flex: 1,
    marginRight: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  itemCountText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.surfaceCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  clearText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  totalAmountText: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.emerald,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: THEME.radius.md,
    shadowColor: THEME.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnDisabled: {
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
