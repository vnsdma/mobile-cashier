import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Tag,
  RotateCcw,
  Check,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { CartItem } from "../../types/transaction";
import { WeightUnit } from "../../types/product";
import { QUICK_WEIGHTS } from "../../lib/constants";
import { calculateSubtotal } from "../../hooks/useCart";
import { THEME } from "../../lib/theme";

interface EditCartItemModalProps {
  visible: boolean;
  item: CartItem | null;
  onClose: () => void;
  onSave: (
    productId: number,
    updates: {
      quantity: number;
      weight_unit?: WeightUnit;
      custom_subtotal?: number | null;
      discount_note?: string | null;
    }
  ) => void;
}

export function EditCartItemModal({
  visible,
  item,
  onClose,
  onSave,
}: EditCartItemModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("ons");
  const [customSubtotalInput, setCustomSubtotalInput] = useState<string>("");
  const [discountNote, setDiscountNote] = useState<string>("");

  useEffect(() => {
    if (item && visible) {
      setQuantity(item.quantity);
      setWeightUnit(item.weight_unit || "ons");
      setCustomSubtotalInput(
        item.custom_subtotal ? item.custom_subtotal.toString() : ""
      );
      setDiscountNote(item.discount_note || "");
    }
  }, [item, visible]);

  if (!item) return null;

  const isWeight = item.sell_type === "weight";
  const quickWeightOptions = QUICK_WEIGHTS[weightUnit] || [
    { label: "1/2", value: 0.5 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "5", value: 5 },
  ];

  // Standard automatic subtotal calculation
  const normalSubtotal = calculateSubtotal({
    price: item.price,
    quantity,
    sell_type: item.sell_type,
    half_unit_price: item.half_unit_price,
    custom_subtotal: null,
  });

  const parsedCustomSubtotal = customSubtotalInput.trim()
    ? parseInt(customSubtotalInput.replace(/[^0-9]/g, ""), 10)
    : null;

  const finalSubtotal =
    parsedCustomSubtotal && parsedCustomSubtotal > 0
      ? parsedCustomSubtotal
      : normalSubtotal;

  const discountSavings = normalSubtotal - finalSubtotal;

  const handleApplyPresetDiscount = (discountAmount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    const newSubtotal = Math.max(0, normalSubtotal - discountAmount);
    setCustomSubtotalInput(newSubtotal.toString());
    setDiscountNote(`Potongan Rp${discountAmount.toLocaleString("id-ID")}`);
  };

  const handleApplyBundlePrice = (bundlePrice: number, note: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    setCustomSubtotalInput(bundlePrice.toString());
    setDiscountNote(note);
  };

  const handleResetToNormal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    setCustomSubtotalInput("");
    setDiscountNote("");
  };

  const handleSave = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }

    onSave(item.product_id, {
      quantity,
      weight_unit: isWeight ? weightUnit : undefined,
      custom_subtotal:
        parsedCustomSubtotal && parsedCustomSubtotal > 0
          ? parsedCustomSubtotal
          : null,
      discount_note: discountNote.trim() || null,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalBackdrop}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.headerPriceText}>
                Harga Dasar: Rp{item.price.toLocaleString("id-ID")}
                {isWeight ? ` / ${weightUnit}` : " / pcs"}
                {isWeight && item.half_unit_price && (
                  <Text style={styles.halfUnitPriceText}>
                    {" "}(1/2 {weightUnit} = Rp{item.half_unit_price.toLocaleString("id-ID")})
                  </Text>
                )}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Section 1: Kuantitas / Berat */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>
                {isWeight ? "JUMLAH / BERAT" : "JUMLAH KUANTITAS"}
              </Text>

              {isWeight ? (
                <>
                  {/* Weight Quick Chips */}
                  <View style={styles.chipsRow}>
                    {quickWeightOptions.map((opt) => {
                      const isSelected = quantity === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.weightChip,
                            isSelected && styles.weightChipActive,
                          ]}
                          onPress={() => {
                            setQuantity(opt.value);
                            try {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            } catch {
                              // Ignore
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.weightChipText,
                              isSelected && styles.weightChipTextActive,
                            ]}
                          >
                            {opt.label} {weightUnit}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Weight Manual Numeric Input */}
                  <View style={styles.manualInputRow}>
                    <Text style={styles.inputPrefix}>Input Berat:</Text>
                    <TextInput
                      style={styles.numericInput}
                      keyboardType="numeric"
                      value={quantity.toString()}
                      onChangeText={(txt) => {
                        const parsed = parseFloat(txt);
                        setQuantity(isNaN(parsed) ? 0 : parsed);
                      }}
                      placeholder="Contoh: 0.5 atau 1"
                      placeholderTextColor={THEME.colors.textMuted}
                    />
                    <Text style={styles.inputSuffix}>{weightUnit}</Text>
                  </View>
                </>
              ) : (
                <>
                  {/* Pcs Stepper & Quick Quantity */}
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        if (quantity > 1) setQuantity((prev) => prev - 1);
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Minus size={16} color={THEME.colors.textSecondary} />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.stepperTextInput}
                      keyboardType="numeric"
                      value={quantity.toString()}
                      onChangeText={(txt) => {
                        const parsed = parseInt(txt.replace(/[^0-9]/g, ""), 10);
                        setQuantity(isNaN(parsed) ? 1 : Math.max(1, parsed));
                      }}
                    />

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setQuantity((prev) => prev + 1)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Plus size={16} color={THEME.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  {/* Common Pcs Quick Quantity Chips */}
                  <View style={styles.chipsRow}>
                    {[1, 2, 3, 5, 10].map((num) => {
                      const isSelected = quantity === num;
                      return (
                        <TouchableOpacity
                          key={num}
                          style={[
                            styles.quantityChip,
                            isSelected && styles.quantityChipActive,
                          ]}
                          onPress={() => setQuantity(num)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.quantityChipText,
                              isSelected && styles.quantityChipTextActive,
                            ]}
                          >
                            {num} pcs
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>

            {/* Section 2: Custom Price & Bundle Discounts */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.tagIconWrap}>
                  <Tag size={13} color={THEME.colors.primaryMuted} />
                </View>
                <Text style={styles.sectionLabel}>
                  HARGA KUSTOM / DISKON PAKET
                </Text>
              </View>

              <Text style={styles.normalPriceHint}>
                Perhitungan Normal: Rp{normalSubtotal.toLocaleString("id-ID")}
                {" "}({quantity} {isWeight ? weightUnit : "pcs"} x Rp{item.price.toLocaleString("id-ID")})
              </Text>

              {/* Quick suggestions based on quantity */}
              <View style={styles.bundleSuggestionBox}>
                <Text style={styles.bundleSuggestionLabel}>
                  Pintasan Diskon Cepat:
                </Text>
                <View style={styles.chipsRow}>
                  {quantity === 2 && item.price === 3000 && (
                    <TouchableOpacity
                      style={styles.promoChip}
                      onPress={() => handleApplyBundlePrice(5000, "Paket Beli 2 Rp 5.000")}
                      activeOpacity={0.7}
                    >
                      <Sparkles size={11} color={THEME.colors.amberLight} />
                      <Text style={styles.promoChipText}>Beli 2 = Rp 5.000</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.discountChip}
                    onPress={() => handleApplyPresetDiscount(1000)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.discountChipText}>-Rp 1.000</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.discountChip}
                    onPress={() => handleApplyPresetDiscount(2000)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.discountChipText}>-Rp 2.000</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.discountChip}
                    onPress={() => handleApplyPresetDiscount(5000)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.discountChipText}>-Rp 5.000</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Direct Custom Subtotal Input */}
              <View style={styles.customPriceInputBlock}>
                <Text style={styles.fieldSubLabel}>
                  Nominal Subtotal Langsung (Harga Jadi):
                </Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.customPriceInput}
                    keyboardType="numeric"
                    placeholder={normalSubtotal.toString()}
                    placeholderTextColor={THEME.colors.textMuted}
                    value={customSubtotalInput}
                    onChangeText={setCustomSubtotalInput}
                  />
                  {customSubtotalInput.length > 0 && (
                    <TouchableOpacity
                      style={styles.resetBtnInline}
                      onPress={handleResetToNormal}
                    >
                      <RotateCcw size={12} color={THEME.colors.textSecondary} />
                      <Text style={styles.resetBtnText}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Optional Discount Note */}
              <View style={styles.noteInputBlock}>
                <Text style={styles.fieldSubLabel}>Catatan Diskon (Opsional):</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Contoh: Diskon Pelanggan / Paket Khusus"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={discountNote}
                  onChangeText={setDiscountNote}
                />
              </View>
            </View>

            {/* Final Subtotal Display */}
            <View style={styles.finalSubtotalCard}>
              <View>
                <Text style={styles.finalSubtotalLabel}>SUBTOTAL ITEM</Text>
                {discountSavings > 0 ? (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>
                      Hemat Rp{discountSavings.toLocaleString("id-ID")}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.normalStatusText}>Harga Standar</Text>
                )}
              </View>
              <Text style={styles.finalSubtotalAmount}>
                Rp{finalSubtotal.toLocaleString("id-ID")}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Check size={16} color={THEME.colors.textInverse} />
                <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "92%",
    backgroundColor: THEME.colors.surfaceBase,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  headerTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  headerPriceText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  halfUnitPriceText: {
    color: THEME.colors.primaryMuted,
    fontWeight: "600",
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
  sectionCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tagIconWrap: {
    backgroundColor: THEME.colors.primaryTint,
    padding: 4,
    borderRadius: 6,
  },
  sectionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  weightChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  weightChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  weightChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  weightChipTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: "700",
  },
  manualInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 10,
  },
  inputPrefix: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginRight: 8,
  },
  numericInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  inputSuffix: {
    color: THEME.colors.primaryMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 6,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  stepperTextInput: {
    minWidth: 60,
    height: 44,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 10,
  },
  quantityChip: {
    backgroundColor: THEME.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  quantityChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  quantityChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  quantityChipTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: "700",
  },
  normalPriceHint: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  bundleSuggestionBox: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  bundleSuggestionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  promoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.amberTint,
    borderWidth: 1,
    borderColor: THEME.colors.amberBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.xs,
  },
  promoChipText: {
    color: THEME.colors.amberLight,
    fontSize: 11,
    fontWeight: "700",
  },
  discountChip: {
    backgroundColor: THEME.colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  discountChipText: {
    color: THEME.colors.primaryMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  customPriceInputBlock: {
    marginBottom: 10,
  },
  fieldSubLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  currencyPrefix: {
    color: THEME.colors.primaryMuted,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  customPriceInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  resetBtnInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resetBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  noteInputBlock: {
    marginTop: 4,
  },
  noteInput: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    height: 40,
    color: THEME.colors.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  finalSubtotalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  finalSubtotalLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  savingsBadge: {
    backgroundColor: THEME.colors.emeraldTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    alignSelf: "flex-start",
  },
  savingsBadgeText: {
    color: THEME.colors.emeraldLight,
    fontSize: 11,
    fontWeight: "700",
  },
  normalStatusText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  finalSubtotalAmount: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceElevated,
    paddingVertical: 13,
    borderRadius: THEME.radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cancelBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 13,
    borderRadius: THEME.radius.md,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 14,
    fontWeight: "700",
  },
});
