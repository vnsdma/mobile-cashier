import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  X,
  Plus,
  Package,
  Barcode,
  Sparkles,
  Scale,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Product, SellType, WeightUnit } from "../../types/product";
import { THEME } from "../../lib/theme";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  categories: string[];
  onAddProduct: (productData: Omit<Product, "id">) => Promise<Product | void> | void;
}

export function AddProductModal({
  visible,
  onClose,
  categories,
  onAddProduct,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [sellType, setSellType] = useState<SellType>("pcs");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("ons");
  const [category, setCategory] = useState("");
  const [stockStr, setStockStr] = useState("100");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanCategories = categories.filter((c) => c !== "Semua");

  const handleGenerateBarcode = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    // Generate a typical 12-digit EAN-style SKU code
    const generated = `899${Math.floor(100000000 + Math.random() * 900000000)}`;
    setBarcode(generated);
  };

  const resetForm = () => {
    setName("");
    setBarcode("");
    setPriceStr("");
    setSellType("pcs");
    setWeightUnit("ons");
    setCategory("");
    setStockStr("100");
    setIsFavorite(false);
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Validasi", "Nama produk wajib diisi.");
      return;
    }

    const price = parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
    if (price <= 0) {
      Alert.alert("Validasi", "Harga jual harus lebih dari Rp 0.");
      return;
    }

    const stock = parseInt(stockStr.replace(/[^0-9]/g, ""), 10) || 0;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }

    setIsSubmitting(true);
    try {
      await onAddProduct({
        name: trimmedName,
        price,
        in_stock: stock,
        barcode: barcode.trim() || undefined,
        sell_type: sellType,
        weight_unit: sellType === "weight" ? weightUnit : undefined,
        category: category.trim() || undefined,
        is_favorite: isFavorite,
      });

      resetForm();
      onClose();
    } catch (err: any) {
      Alert.alert("Gagal Menyimpan", err?.message || "Terjadi kesalahan saat menambah produk.");
    } finally {
      setIsSubmitting(false);
    }
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
            <View style={styles.headerTitleRow}>
              <Package size={18} color={THEME.colors.primaryMuted} />
              <Text style={styles.headerTitle}>Tambah Produk Baru</Text>
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

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Nama Produk */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Produk *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Kopi Robusta 250g / Rokok Mild"
                placeholderTextColor={THEME.colors.textMuted}
                autoFocus
              />
            </View>

            {/* Barcode & SKU */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelWithAction}>
                <Text style={styles.fieldLabel}>Barcode / SKU (Opsional)</Text>
                <TouchableOpacity
                  style={styles.generateBtn}
                  onPress={handleGenerateBarcode}
                  activeOpacity={0.7}
                >
                  <Sparkles size={11} color={THEME.colors.primaryMuted} />
                  <Text style={styles.generateBtnText}>Buat Otomatis</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.barcodeInputWrap}>
                <Barcode size={16} color={THEME.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  value={barcode}
                  onChangeText={setBarcode}
                  placeholder="Scan atau ketik kode barcode..."
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Harga Jual */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Harga Jual (Rp) *</Text>
              <View style={styles.priceInputWrap}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={priceStr}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9]/g, "");
                    setPriceStr(clean ? parseInt(clean, 10).toLocaleString("id-ID") : "");
                  }}
                  placeholder="0"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Tipe Penjualan: Satuan vs Timbang */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Tipe Penjualan</Text>
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  style={[
                    styles.segmentOption,
                    sellType === "pcs" && styles.segmentOptionActive,
                  ]}
                  onPress={() => setSellType("pcs")}
                  activeOpacity={0.8}
                >
                  <Package
                    size={14}
                    color={sellType === "pcs" ? THEME.colors.textInverse : THEME.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      sellType === "pcs" && styles.segmentTextActive,
                    ]}
                  >
                    Satuan (Pcs)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentOption,
                    sellType === "weight" && styles.segmentOptionActive,
                  ]}
                  onPress={() => setSellType("weight")}
                  activeOpacity={0.8}
                >
                  <Scale
                    size={14}
                    color={sellType === "weight" ? THEME.colors.textInverse : THEME.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      sellType === "weight" && styles.segmentTextActive,
                    ]}
                  >
                    Timbang (Berat)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Satuan Berat (jika weight) */}
            {sellType === "weight" && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Satuan Berat Acuan</Text>
                <View style={styles.unitsRow}>
                  {(["ons", "gram", "kg"] as WeightUnit[]).map((u) => {
                    const isSelected = weightUnit === u;
                    return (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, isSelected && styles.unitChipActive]}
                        onPress={() => setWeightUnit(u)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.unitChipText,
                            isSelected && styles.unitChipTextActive,
                          ]}
                        >
                          per {u.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Kategori */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Kategori Produk</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Contoh: Minuman, Makanan, Tembakau"
                placeholderTextColor={THEME.colors.textMuted}
              />
              {cleanCategories.length > 0 && (
                <View style={styles.categoryChipsRow}>
                  {cleanCategories.slice(0, 5).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catSuggestionChip,
                        category.toLowerCase() === cat.toLowerCase() && styles.catSuggestionActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.catSuggestionText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Stok Awal */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Stok Inventaris Awal</Text>
              <TextInput
                style={styles.input}
                value={stockStr}
                onChangeText={setStockStr}
                placeholder="100"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            {/* Tandai Favorit */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Jadikan Shortcut Favorit</Text>
                <Text style={styles.switchSublabel}>
                  Tampilkan di rak cepat layar kasir untuk 1-tap input
                </Text>
              </View>
              <Switch
                value={isFavorite}
                onValueChange={setIsFavorite}
                trackColor={{
                  false: THEME.colors.surfaceCard,
                  true: THEME.colors.amber,
                }}
                thumbColor={THEME.colors.textInverse}
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Plus size={16} color={THEME.colors.textInverse} />
              <Text style={styles.submitBtnText}>
                {isSubmitting ? "Menyimpan..." : "Daftarkan Produk Baru"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surfaceBase,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    borderTopWidth: 1,
    borderColor: THEME.colors.border,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  labelWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.xs,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  generateBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.colors.primaryMuted,
  },
  input: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    color: THEME.colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  barcodeInputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 38,
  },
  priceInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.emeraldLight,
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  segmentOptionActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  segmentTextActive: {
    color: THEME.colors.textInverse,
  },
  unitsRow: {
    flexDirection: "row",
    gap: 8,
  },
  unitChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: THEME.radius.xs,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: "center",
  },
  unitChipActive: {
    borderColor: THEME.colors.primaryMuted,
    backgroundColor: THEME.colors.primaryTint,
  },
  unitChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  unitChipTextActive: {
    color: THEME.colors.primaryMuted,
    fontWeight: "700",
  },
  categoryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  catSuggestionChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceCard,
  },
  catSuggestionActive: {
    backgroundColor: THEME.colors.primaryMuted,
  },
  catSuggestionText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  switchSublabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textInverse,
  },
});
