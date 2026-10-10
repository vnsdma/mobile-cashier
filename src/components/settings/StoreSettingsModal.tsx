import React, { useState, useEffect } from "react";
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
  Store,
  Printer,
  Building2,
  Save,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ReceiptSettings } from "../../types/transaction";
import { THEME } from "../../lib/theme";

interface StoreSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ReceiptSettings;
  onSave: (newSettings: ReceiptSettings) => void;
}

export function StoreSettingsModal({
  visible,
  onClose,
  settings,
  onSave,
}: StoreSettingsModalProps) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [storeWebsite, setStoreWebsite] = useState(settings.storeWebsite || "");
  const [headerNote, setHeaderNote] = useState(settings.headerNote);
  const [footerNote, setFooterNote] = useState(settings.footerNote);
  const [paperSize, setPaperSize] = useState<"58" | "80">(settings.paperSize);
  const [showAddress, setShowAddress] = useState(settings.showAddress);
  const [showPhone, setShowPhone] = useState(settings.showPhone);
  const [bankName, setBankName] = useState(settings.bankName || "BCA");
  const [bankAccountNumber, setBankAccountNumber] = useState(
    settings.bankAccountNumber || ""
  );
  const [bankAccountHolder, setBankAccountHolder] = useState(
    settings.bankAccountHolder || ""
  );
  const [qrisNote, setQrisNote] = useState(
    settings.qrisNote || "Pindai QRIS di meja kasir untuk menyelesaikan pembayaran"
  );

  // Sync state when opened or settings change
  useEffect(() => {
    if (visible) {
      setStoreName(settings.storeName);
      setStoreAddress(settings.storeAddress);
      setStorePhone(settings.storePhone);
      setStoreWebsite(settings.storeWebsite || "");
      setHeaderNote(settings.headerNote);
      setFooterNote(settings.footerNote);
      setPaperSize(settings.paperSize);
      setShowAddress(settings.showAddress);
      setShowPhone(settings.showPhone);
      setBankName(settings.bankName || "BCA");
      setBankAccountNumber(settings.bankAccountNumber || "");
      setBankAccountHolder(settings.bankAccountHolder || "");
      setQrisNote(
        settings.qrisNote || "Pindai QRIS di meja kasir untuk menyelesaikan pembayaran"
      );
    }
  }, [visible, settings]);

  const handleSave = () => {
    if (!storeName.trim()) {
      Alert.alert("Validasi", "Nama toko tidak boleh kosong.");
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }

    const updated: ReceiptSettings = {
      storeName: storeName.trim(),
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.trim(),
      storeWebsite: storeWebsite.trim(),
      headerNote: headerNote.trim(),
      footerNote: footerNote.trim(),
      paperSize,
      showAddress,
      showPhone,
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountHolder: bankAccountHolder.trim(),
      qrisNote: qrisNote.trim(),
    };

    onSave(updated);
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
            <View style={styles.headerTitleRow}>
              <Store size={18} color={THEME.colors.primaryMuted} />
              <Text style={styles.headerTitle}>Pengaturan Toko & Kasir</Text>
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
            {/* Section 1: Profil Toko */}
            <View style={styles.sectionHeader}>
              <Store size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Identitas & Profil Usaha</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Toko / Brand *</Text>
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="Contoh: Toko Kopi Aroma"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Alamat Lengkap</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={storeAddress}
                onChangeText={setStoreAddress}
                placeholder="Contoh: Jl. Sudirman No. 45, Jakarta"
                placeholderTextColor={THEME.colors.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nomor WhatsApp / Telp</Text>
              <TextInput
                style={styles.input}
                value={storePhone}
                onChangeText={setStorePhone}
                placeholder="Contoh: 0812-3456-7890"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Website / Instagram (Opsional)</Text>
              <TextInput
                style={styles.input}
                value={storeWebsite}
                onChangeText={setStoreWebsite}
                placeholder="Contoh: www.tokoanda.id atau @tokoanda"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* Section 2: Format Struk Thermal & Kertas */}
            <View style={styles.sectionHeader}>
              <Printer size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Format Cetak Struk (ESC/POS)</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Ukuran Kertas Thermal</Text>
              <View style={styles.paperToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.paperOption,
                    paperSize === "58" && styles.paperOptionActive,
                  ]}
                  onPress={() => setPaperSize("58")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.paperOptionText,
                      paperSize === "58" && styles.paperOptionTextActive,
                    ]}
                  >
                    58 mm (Mini / Portabel)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paperOption,
                    paperSize === "80" && styles.paperOptionActive,
                  ]}
                  onPress={() => setPaperSize("80")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.paperOptionText,
                      paperSize === "80" && styles.paperOptionTextActive,
                    ]}
                  >
                    80 mm (Lebar Desktop)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Catatan Header Struk</Text>
              <TextInput
                style={styles.input}
                value={headerNote}
                onChangeText={setHeaderNote}
                placeholder="Contoh: Kualitas & Pelayanan Terbaik"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Catatan Footer Struk</Text>
              <TextInput
                style={styles.input}
                value={footerNote}
                onChangeText={setFooterNote}
                placeholder="Contoh: Barang yang dibeli tidak dapat ditukar"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Cetak Alamat di Struk</Text>
                <Text style={styles.switchSublabel}>Tampilkan baris alamat pada struk thermal</Text>
              </View>
              <Switch
                value={showAddress}
                onValueChange={setShowAddress}
                trackColor={{
                  false: THEME.colors.surfaceCard,
                  true: THEME.colors.primary,
                }}
                thumbColor={THEME.colors.textInverse}
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Cetak Telepon di Struk</Text>
                <Text style={styles.switchSublabel}>Tampilkan kontak toko pada struk thermal</Text>
              </View>
              <Switch
                value={showPhone}
                onValueChange={setShowPhone}
                trackColor={{
                  false: THEME.colors.surfaceCard,
                  true: THEME.colors.primary,
                }}
                thumbColor={THEME.colors.textInverse}
              />
            </View>

            {/* Section 3: Pembayaran & Perbankan */}
            <View style={styles.sectionHeader}>
              <Building2 size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Rekening & Pembayaran Non-Tunai</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Bank</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Contoh: BCA / Mandiri / BRI / BNI"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nomor Rekening Bank</Text>
              <TextInput
                style={styles.input}
                value={bankAccountNumber}
                onChangeText={setBankAccountNumber}
                placeholder="Contoh: 123-456-7890"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Pemilik Rekening (A/N)</Text>
              <TextInput
                style={styles.input}
                value={bankAccountHolder}
                onChangeText={setBankAccountHolder}
                placeholder="Contoh: Toko Kopi Sejahtera"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Instruksi Pindai QRIS</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={qrisNote}
                onChangeText={setQrisNote}
                placeholder="Contoh: Pindai kode QRIS di meja kasir"
                placeholderTextColor={THEME.colors.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Save size={16} color={THEME.colors.textInverse} />
              <Text style={styles.saveBtnText}>Simpan Pengaturan Toko</Text>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
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
  textArea: {
    height: 64,
    textAlignVertical: "top",
  },
  paperToggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  paperOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: "center",
  },
  paperOptionActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  paperOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  paperOptionTextActive: {
    color: THEME.colors.textInverse,
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
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textInverse,
  },
});
