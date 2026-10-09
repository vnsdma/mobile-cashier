import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  X,
  Bluetooth,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ReceiptSettings } from "../../types/transaction";
import {
  isRawBtAvailableAsync,
  openRawBtPlayStore,
  printTestViaRawBtAsync,
  printTestViaRawBtTextAsync,
} from "../../lib/thermal-printer";
import { THEME } from "../../lib/theme";

interface BluetoothPrinterModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ReceiptSettings;
}

export function BluetoothPrinterModal({
  visible,
  onClose,
  settings,
}: BluetoothPrinterModalProps) {
  const [hasRawBt, setHasRawBt] = useState(false);
  const [checking, setChecking] = useState(true);
  const [testingPrint, setTestingPrint] = useState(false);

  useEffect(() => {
    if (visible) {
      checkDriver();
    }
  }, [visible]);

  const checkDriver = async () => {
    setChecking(true);
    const available = await isRawBtAvailableAsync();
    setHasRawBt(available);
    setChecking(false);
  };

  const handleTestPrint = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }

    setTestingPrint(true);
    const success = await printTestViaRawBtAsync(settings);
    setTestingPrint(false);

    if (success) {
      setHasRawBt(true);
      Alert.alert(
        "Tes Cetak Terkirim",
        "Perintah tes cetak ESC/POS berhasil dikirim ke RawBT dan diteruskan ke printer Bluetooth Anda."
      );
    } else {
      Alert.alert(
        "Driver Belum Terpasang",
        "Untuk mencetak langsung ke printer Bluetooth tanpa kabel, pasang driver 'RawBT' resmi dari Google Play Store terlebih dahulu.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Buka Play Store",
            onPress: () => openRawBtPlayStore(),
          },
        ]
      );
    }
  };

  const handleTestPrintText = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }

    setTestingPrint(true);
    const success = await printTestViaRawBtTextAsync(settings);
    setTestingPrint(false);

    if (success) {
      setHasRawBt(true);
      Alert.alert(
        "Tes Format Teks Terkirim",
        "Perintah cetak format teks biasa terkirim ke printer Bluetooth."
      );
    } else {
      Alert.alert(
        "Driver Belum Terpasang",
        "Aplikasi RawBT belum terpasang di perangkat.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Buka Play Store",
            onPress: () => openRawBtPlayStore(),
          },
        ]
      );
    }
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
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Bluetooth size={18} color={THEME.colors.primaryMuted} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Printer Thermal Bluetooth</Text>
                <Text style={styles.headerSubtitle}>
                  Koneksi ESC/POS Standar 58mm / 80mm
                </Text>
              </View>
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
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Driver RawBT POS:</Text>
                {checking ? (
                  <ActivityIndicator size="small" color={THEME.colors.primaryMuted} />
                ) : hasRawBt ? (
                  <View style={styles.badgeSuccess}>
                    <CheckCircle2 size={12} color={THEME.colors.emeraldLight} />
                    <Text style={styles.badgeSuccessText}>Driver Aktif</Text>
                  </View>
                ) : (
                  <View style={styles.badgeWarning}>
                    <AlertCircle size={12} color={THEME.colors.amberLight} />
                    <Text style={styles.badgeWarningText}>Belum Terpasang</Text>
                  </View>
                )}
              </View>

              <Text style={styles.statusDesc}>
                {hasRawBt
                  ? "Driver Bluetooth siap! Kasir dapat mencetak struk secara instan ke printer Bluetooth."
                  : "Pasang aplikasi RawBT (gratis & resmi di Google Play Store) agar HP dapat mengirim data cetak struk langsung ke printer Bluetooth."}
              </Text>

              {!hasRawBt && (
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={openRawBtPlayStore}
                  activeOpacity={0.8}
                >
                  <Download size={15} color={THEME.colors.textInverse} />
                  <Text style={styles.downloadBtnText}>
                    Pasang RawBT dari Play Store
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Step-by-step Setup Guide */}
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>Langkah Menghubungkan Printer:</Text>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepHeading}>Nyalakan Printer</Text>
                  <Text style={styles.stepDesc}>
                    Nyalakan printer Bluetooth 58mm/80mm dan pastikan lampu power menyala.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepHeading}>Pairing di Pengaturan Bluetooth HP</Text>
                  <Text style={styles.stepDesc}>
                    Buka Bluetooth di HP Android, cari printer (RPP02, POS-58, MPT-2), masukkan PIN 0000 atau 1234.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepHeading}>Pilih Printer di RawBT</Text>
                  <Text style={styles.stepDesc}>
                    Buka RawBT, pilih printer yang sudah dipairing. Siap mencetak!
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary Test Print Action (ESC/POS Binary) */}
            <TouchableOpacity
              style={[styles.testBtn, testingPrint && styles.btnDisabled]}
              onPress={handleTestPrint}
              disabled={testingPrint}
              activeOpacity={0.8}
            >
              {testingPrint ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Printer size={16} color="#ffffff" />
                  <Text style={styles.testBtnText}>Tes Cetak Struk (ESC/POS)</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Secondary Test Print Action (Plain Text Alternative) */}
            <TouchableOpacity
              style={[styles.testAltBtn, testingPrint && styles.btnDisabled]}
              onPress={handleTestPrintText}
              disabled={testingPrint}
              activeOpacity={0.8}
            >
              <FileText size={15} color={THEME.colors.primaryMuted} />
              <Text style={styles.testAltBtnText}>Tes Format Teks (Alternatif)</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: "90%",
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
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryTint,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
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
  statusCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  badgeSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.emeraldTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.emeraldBorder,
  },
  badgeSuccessText: {
    color: THEME.colors.emeraldLight,
    fontSize: 11,
    fontWeight: "700",
  },
  badgeWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.amberTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.amberBorder,
  },
  badgeWarningText: {
    color: THEME.colors.amberLight,
    fontSize: 11,
    fontWeight: "700",
  },
  statusDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  downloadBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.radius.sm,
  },
  downloadBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 13,
    fontWeight: "700",
  },
  guideCard: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  guideTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.primaryTint,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: THEME.colors.primaryMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepHeading: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  stepDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  testBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.emerald,
    paddingVertical: 13,
    borderRadius: THEME.radius.md,
    marginBottom: 8,
    shadowColor: THEME.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  testBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 14,
    fontWeight: "700",
  },
  testAltBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 11,
    borderRadius: THEME.radius.md,
    marginBottom: 16,
  },
  testAltBtnText: {
    color: THEME.colors.primaryMuted,
    fontSize: 12,
    fontWeight: "600",
  },
});
