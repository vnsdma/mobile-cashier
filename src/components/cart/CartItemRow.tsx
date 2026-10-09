import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Plus, Minus, Trash2, Scale, Pencil, Tag } from "lucide-react-native";
import { CartItem } from "../../types/transaction";
import { QUICK_WEIGHTS } from "../../lib/constants";
import { THEME } from "../../lib/theme";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (newQty: number) => void;
  onUpdateWeight: (weight: number) => void;
  onEditPress: () => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onUpdateWeight,
  onEditPress,
  onRemove,
}: CartItemRowProps) {
  const isWeight = item.sell_type === "weight";
  const weightUnit = item.weight_unit || "ons";
  const availableChips = QUICK_WEIGHTS[weightUnit] || [
    { label: "1/2", value: 0.5 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "5", value: 5 },
  ];

  // Calculate standard price subtotal
  const normalPriceSubtotal = isWeight
    ? item.quantity === 0.5 && item.half_unit_price
      ? Math.round(item.half_unit_price)
      : Math.round(item.price * item.quantity)
    : Math.round(item.price * item.quantity);

  const hasCustomPrice =
    item.custom_subtotal !== undefined &&
    item.custom_subtotal !== null &&
    item.custom_subtotal > 0;

  return (
    <View style={styles.card}>
      {/* Top Section: Item Identity & Price Subtotal */}
      <TouchableOpacity
        style={styles.topRow}
        onPress={onEditPress}
        activeOpacity={0.7}
      >
        <View style={styles.nameBlock}>
          <View style={styles.nameHeaderRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            {hasCustomPrice && (
              <View style={styles.discountBadge}>
                <Tag size={10} color={THEME.colors.amberLight} />
                <Text style={styles.discountBadgeText}>
                  {item.discount_note || "Harga Khusus"}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.unitPrice}>
            Rp{item.price.toLocaleString("id-ID")}
            {isWeight ? ` / ${weightUnit}` : " / pcs"}
            {isWeight && item.half_unit_price && (
              <Text style={styles.halfUnitPriceHint}>
                {" "}(1/2 {weightUnit} = Rp{item.half_unit_price.toLocaleString("id-ID")})
              </Text>
            )}
          </Text>
        </View>

        <View style={styles.subtotalBlock}>
          {hasCustomPrice && (
            <Text style={styles.strikethroughPrice}>
              Rp{normalPriceSubtotal.toLocaleString("id-ID")}
            </Text>
          )}
          <Text style={styles.subtotalText}>
            Rp{item.subtotal.toLocaleString("id-ID")}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Section: Tactile Controls */}
      <View style={styles.bottomRow}>
        {isWeight ? (
          /* Weight quick selection chips */
          <View style={styles.weightChipsContainer}>
            <View style={styles.weightBadge}>
              <Scale size={11} color={THEME.colors.primaryMuted} />
              <Text style={styles.weightBadgeText}>{weightUnit}</Text>
            </View>

            {availableChips.map((chip) => {
              const isSelected = item.quantity === chip.value;
              return (
                <TouchableOpacity
                  key={chip.label}
                  style={[
                    styles.chipBtn,
                    isSelected && styles.chipBtnActive,
                  ]}
                  onPress={() => onUpdateWeight(chip.value)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      isSelected && styles.chipBtnTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Standard Pcs quantity stepper */
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateQuantity(item.quantity - 1)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Kurangi jumlah"
            >
              <Minus size={13} color={THEME.colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.quantityNumber}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Tambah jumlah"
            >
              <Plus size={13} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action button row: Edit & Remove */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={onEditPress}
            activeOpacity={0.6}
            accessibilityLabel="Edit Item"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Pencil size={13} color={THEME.colors.primaryMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onRemove}
            activeOpacity={0.6}
            accessibilityLabel="Hapus Item"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Trash2 size={14} color={THEME.colors.dangerLight} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
    marginRight: 10,
  },
  nameHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 2,
  },
  itemName: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: THEME.colors.amberTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.amberBorder,
  },
  discountBadgeText: {
    color: THEME.colors.amberLight,
    fontSize: 10,
    fontWeight: "700",
  },
  unitPrice: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  halfUnitPriceHint: {
    color: THEME.colors.primaryMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  subtotalBlock: {
    alignItems: "flex-end",
  },
  strikethroughPrice: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    textDecorationLine: "line-through",
    marginBottom: 1,
  },
  subtotalText: {
    color: THEME.colors.primaryMuted,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  weightChipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  weightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  weightBadgeText: {
    color: THEME.colors.primaryMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  chipBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minWidth: 32,
    alignItems: "center",
  },
  chipBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  chipBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  chipBtnTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: "800",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: "hidden",
  },
  stepBtn: {
    width: 34,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityNumber: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 8,
    minWidth: 28,
    textAlign: "center",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: THEME.radius.xs,
    backgroundColor: THEME.colors.primaryTint,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: THEME.radius.xs,
    backgroundColor: THEME.colors.dangerTint,
    borderWidth: 1,
    borderColor: THEME.colors.dangerBorder,
  },
});
