import React, { useState, useEffect, useMemo } from "react";
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
  Banknote,
  QrCode,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { PaymentMethod, ReceiptSettings } from "../../types/transaction";
import { THEME } from "../../lib/theme";

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  totalAmount: number;
  settings?: ReceiptSettings;
  onCompleteCheckout: (orderData: {
    paymentMethod: PaymentMethod;
    cashTendered?: number;
    changeAmount?: number;
    customerName?: string;
  }) => void;
}

export function CheckoutModal({
  visible,
  onClose,
  totalAmount,
  settings,
  onCompleteCheckout,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [customerName, setCustomerName] = useState("");

  // Sync cashTendered whenever modal opens or totalAmount changes
  useEffect(() => {
    if (visible) {
      setCashTendered(totalAmount);
      setCustomerName("");
      setPaymentMethod("cash");
    }
  }, [visible, totalAmount]);

  const changeAmount = cashTendered - totalAmount;
  const isCashInsufficient = paymentMethod === "cash" && cashTendered < totalAmount;

  // Smart dynamic cash chips based on totalAmount
  const quickCashChips = useMemo(() => {
    const list = [{ label: "Uang Pas", value: totalAmount }];

    // Standard cash denominations
    const standardDenoms = [10000, 20000, 50000, 100000];

    // If total is large, add intelligent round-up chips
    if (totalAmount > 50000) {
      const next50k = Math.ceil(totalAmount / 50000) * 50000;
      const next100k = Math.ceil(totalAmount / 100000) * 100000;
      if (next50k > totalAmount && !standardDenoms.includes(next50k)) {
        standardDenoms.push(next50k);
      }
      if (next100k > totalAmount && !standardDenoms.includes(next100k)) {
        standardDenoms.push(next100k);
      }
    }

    // Filter denominations greater than or equal to totalAmount or common nearby bills
    const relevant = standardDenoms
      .filter((amt) => amt >= totalAmount || amt === 50000 || amt === 100000)
      .sort((a, b) => a - b);

    // Limit to max 4 unique additional chips
    const unique = Array.from(new Set(relevant)).slice(0, 4);

    unique.forEach((val) => {
      if (val !== totalAmount) {
        const label = val >= 1000 ? `${val / 1000}k` : `Rp${val}`;
        list.push({ label, value: val });
      }
    });

    return list;
  }, [totalAmount]);

  const handleSelectQuickCash = (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    setCashTendered(amount);
  };

  const handleConfirm = () => {
    if (isCashInsufficient) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }

    onCompleteCheckout({
      paymentMethod,
      cashTendered: paymentMethod === "cash" ? cashTendered : undefined,
      changeAmount: paymentMethod === "cash" ? Math.max(0, changeAmount) : 0,
      customerName: customerName.trim() || undefined,
    });
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
            <Text style={styles.headerTitle}>Pembayaran Kasir</Text>
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
            {/* Total Hero Block */}
            <View style={styles.totalHeroBlock}>
              <Text style={styles.totalHeroLabel}>TOTAL TAGIHAN</Text>
              <Text style={styles.totalHeroAmount}>
                Rp{totalAmount.toLocaleString("id-ID")}
              </Text>
            </View>

            {/* Payment Method Selector Tabs */}
            <View style={styles.methodTabsRow}>
              <TouchableOpacity
                style={[
                  styles.methodTab,
                  paymentMethod === "cash" && styles.methodTabActive,
                ]}
                onPress={() => setPaymentMethod("cash")}
                activeOpacity={0.75}
              >
                <Banknote
                  size={16}
                  color={
                    paymentMethod === "cash"
                      ? THEME.colors.textInverse
                      : THEME.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.methodTabText,
                    paymentMethod === "cash" && styles.methodTabTextActive,
                  ]}
                >
                  Tunai
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodTab,
                  paymentMethod === "qris" && styles.methodTabActive,
                ]}
                onPress={() => setPaymentMethod("qris")}
                activeOpacity={0.75}
              >
                <QrCode
                  size={16}
                  color={
                    paymentMethod === "qris"
                      ? THEME.colors.textInverse
                      : THEME.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.methodTabText,
                    paymentMethod === "qris" && styles.methodTabTextActive,
                  ]}
                >
                  QRIS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodTab,
                  paymentMethod === "transfer" && styles.methodTabActive,
                ]}
                onPress={() => setPaymentMethod("transfer")}
                activeOpacity={0.75}
              >
                <Building2
                  size={16}
                  color={
                    paymentMethod === "transfer"
                      ? THEME.colors.textInverse
                      : THEME.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.methodTabText,
                    paymentMethod === "transfer" && styles.methodTabTextActive,
                  ]}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tunai Tender Section */}
            {paymentMethod === "cash" && (
              <View style={styles.cashSection}>
                <Text style={styles.fieldLabel}>Uang Tunai Diterima</Text>

                {/* Quick Denomination Chips */}
                <View style={styles.quickCashGrid}>
                  {quickCashChips.map((item) => {
                    const isSelected = cashTendered === item.value;
                    return (
                      <TouchableOpacity
                        key={item.label}
                        style={[
                          styles.quickCashChip,
                          isSelected && styles.quickCashChipActive,
                        ]}
                        onPress={() => handleSelectQuickCash(item.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.quickCashChipText,
                            isSelected && styles.quickCashChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Cash Input */}
                <View style={styles.inputWrap}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.cashInput}
                    keyboardType="numeric"
                    value={cashTendered ? cashTendered.toString() : ""}
                    onChangeText={(txt) => {
                      const num = parseInt(txt.replace(/[^0-9]/g, ""), 10) || 0;
                      setCashTendered(num);
                    }}
                    placeholder="0"
                    placeholderTextColor={THEME.colors.textMuted}
                    selectTextOnFocus
                  />
                </View>

                {/* Change or Shortfall indicator banner */}
                <View
                  style={[
                    styles.changeBanner,
                    isCashInsufficient
                      ? styles.changeBannerWarning
                      : styles.changeBannerSuccess,
                  ]}
                >
                  {isCashInsufficient ? (
                    <>
                      <AlertCircle size={16} color={THEME.colors.dangerLight} />
                      <Text style={styles.shortfallText}>
                        Kurang Rp{Math.abs(changeAmount).toLocaleString("id-ID")}
                      </Text>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} color={THEME.colors.emeraldLight} />
                      <Text style={styles.changeText}>
                        Kembalian: Rp{changeAmount.toLocaleString("id-ID")}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* QRIS Section */}
            {paymentMethod === "qris" && (
              <View style={styles.infoBanner}>
                <View style={styles.infoBannerIconWrap}>
                  <QrCode size={36} color={THEME.colors.primaryMuted} />
                </View>
                <Text style={styles.infoBannerTitle}>Pindai QRIS Toko</Text>
                <Text style={styles.infoBannerDesc}>
                  {settings?.qrisNote
                    ? settings.qrisNote
                    : `Arahkan pelanggan scan QRIS meja kasir sejumlah Rp ${totalAmount.toLocaleString("id-ID")}.`}
                </Text>
              </View>
            )}

            {/* Transfer Section */}
            {paymentMethod === "transfer" && (
              <View style={styles.infoBanner}>
                <View style={styles.infoBannerIconWrap}>
                  <Building2 size={32} color={THEME.colors.primaryMuted} />
                </View>
                <Text style={styles.infoBannerTitle}>Transfer Bank Toko</Text>
                <Text style={styles.bankAccountText}>
                  {settings?.bankName || "BCA"}: {settings?.bankAccountNumber || "123-456-7890"}
                  {settings?.bankAccountHolder ? ` (${settings.bankAccountHolder})` : ""}
                </Text>
                <Text style={styles.infoBannerDesc}>
                  Pastikan bukti transfer telah terverifikasi sebelum menyelesaikan transaksi.
                </Text>
              </View>
            )}

            {/* Optional Customer Name */}
            <View style={styles.customerFieldWrap}>
              <Text style={styles.fieldLabel}>Nama Pelanggan (Opsional)</Text>
              <TextInput
                style={styles.customerInput}
                placeholder="Contoh: Pak Budi / Langganan"
                placeholderTextColor={THEME.colors.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            {/* Action CTA */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isCashInsufficient && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={isCashInsufficient}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>
                Konfirmasi & Cetak Nota
              </Text>
              <ArrowRight size={16} color={THEME.colors.textInverse} />
            </TouchableOpacity>
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
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
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
  totalHeroBlock: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.lg,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  totalHeroLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  totalHeroAmount: {
    color: THEME.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  methodTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  methodTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.colors.surfaceCard,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  methodTabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  methodTabText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  methodTabTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: "700",
  },
  cashSection: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickCashGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  quickCashChip: {
    backgroundColor: THEME.colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  quickCashChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  quickCashChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  quickCashChipTextActive: {
    color: THEME.colors.textInverse,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
  },
  currencyPrefix: {
    color: THEME.colors.primaryMuted,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
  },
  cashInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  changeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
  },
  changeBannerSuccess: {
    backgroundColor: THEME.colors.emeraldTint,
    borderColor: THEME.colors.emeraldBorder,
  },
  changeBannerWarning: {
    backgroundColor: THEME.colors.dangerTint,
    borderColor: THEME.colors.dangerBorder,
  },
  changeText: {
    color: THEME.colors.emeraldLight,
    fontSize: 14,
    fontWeight: "700",
  },
  shortfallText: {
    color: THEME.colors.dangerLight,
    fontSize: 14,
    fontWeight: "700",
  },
  infoBanner: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.lg,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  infoBannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.primaryTint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoBannerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  bankAccountText: {
    color: THEME.colors.primaryMuted,
    fontSize: 14,
    fontWeight: "700",
    marginVertical: 4,
  },
  infoBannerDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  customerFieldWrap: {
    marginBottom: 18,
  },
  customerInput: {
    backgroundColor: THEME.colors.surfaceCard,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 14,
    height: 44,
    color: THEME.colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  confirmBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.emerald,
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    shadowColor: THEME.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: THEME.colors.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 15,
    fontWeight: "800",
  },
});
