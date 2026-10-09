import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Printer,
  Share2,
  CheckCircle2,
  RotateCcw,
  FileText,
  Bluetooth,
  ArrowRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Order, ReceiptSettings } from "../../types/transaction";
import { generateWhatsAppReceiptText } from "../../lib/escpos-builder";
import {
  printReceiptViaRawBtAsync,
  shareReceiptPdfAsync,
  promptInstallRawBt,
} from "../../lib/thermal-printer";
import { THEME } from "../../lib/theme";

interface ReceiptModalProps {
  visible: boolean;
  order: Order | null;
  settings: ReceiptSettings;
  onNewTransaction: () => void;
  onPrintThermal?: (order: Order) => Promise<void> | void;
  onOpenBluetoothSettings?: () => void;
}

export function ReceiptModal({
  visible,
  order,
  settings,
  onNewTransaction,
  onPrintThermal,
  onOpenBluetoothSettings,
}: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  if (!order) return null;

  const handleShareWhatsApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }

    const message = generateWhatsAppReceiptText(order, settings);
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
        );
      }
    } catch {
      Alert.alert("Error", "Tidak dapat membuka aplikasi WhatsApp.");
    }
  };

  const handlePrint = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }

    try {
      setIsPrinting(true);
      if (onPrintThermal) {
        await onPrintThermal(order);
      } else {
        const didPrint = await printReceiptViaRawBtAsync(order, settings);
        if (!didPrint) {
          promptInstallRawBt();
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Gagal Mencetak",
        err?.message || "Terjadi kesalahan saat membuka printer Bluetooth."
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsSharingPdf(true);
      await shareReceiptPdfAsync(order, settings);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Gagal membagikan struk PDF.");
    } finally {
      setIsSharingPdf(false);
    }
  };

  const handleNewTx = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
    onNewTransaction();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleNewTx}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.container}>
          {/* Success Check Banner */}
          <View style={styles.successHeader}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={20} color={THEME.colors.emeraldLight} />
            </View>
            <View>
              <Text style={styles.successHeaderText}>Transaksi Berhasil</Text>
              <Text style={styles.successSubtext}>
                No: {order.order_number}
              </Text>
            </View>
          </View>

          {/* Thermal Paper Slip Preview */}
          <ScrollView
            style={styles.paperScrollView}
            contentContainerStyle={styles.paperContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.thermalPaper}>
              {/* Store Header */}
              <Text style={styles.storeName}>{settings.storeName}</Text>
              {settings.showAddress && (
                <Text style={styles.storeMeta}>{settings.storeAddress}</Text>
              )}
              {settings.showPhone && (
                <Text style={styles.storeMeta}>Telp: {settings.storePhone}</Text>
              )}
              {settings.headerNote ? (
                <Text style={styles.storeHeaderNote}>{settings.headerNote}</Text>
              ) : null}

              <View style={styles.dashedDivider} />

              {/* Order Info */}
              <View style={styles.slipRow}>
                <Text style={styles.slipMetaText}>No: {order.order_number}</Text>
                <Text style={styles.slipMetaText}>
                  {new Date(order.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {order.customer_name ? (
                <Text style={styles.slipMetaText}>
                  Pelanggan: {order.customer_name}
                </Text>
              ) : null}

              <View style={styles.dashedDivider} />

              {/* Items */}
              {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemBlock}>
                  <Text style={styles.itemNameText}>{item.name}</Text>
                  <View style={styles.slipRow}>
                    <Text style={styles.itemDetailText}>
                      {item.quantity}{" "}
                      {item.sell_type === "weight"
                        ? item.weight_unit || "ons"
                        : "pcs"}{" "}
                      {item.custom_subtotal
                        ? `(${item.discount_note || "Harga Paket"})`
                        : `x Rp${item.price.toLocaleString("id-ID")}`}
                    </Text>
                    <Text style={styles.itemSubtotalText}>
                      Rp{item.subtotal.toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.dashedDivider} />

              {/* Total & Payment details */}
              <View style={styles.slipRow}>
                <Text style={styles.grandTotalLabel}>TOTAL</Text>
                <Text style={styles.grandTotalAmount}>
                  Rp{order.total_amount.toLocaleString("id-ID")}
                </Text>
              </View>

              <View style={styles.slipRow}>
                <Text style={styles.paymentMethodLabel}>Metode Bayar</Text>
                <Text style={styles.paymentMethodVal}>
                  {order.payment_method === "cash"
                    ? "Tunai"
                    : order.payment_method === "qris"
                    ? "QRIS"
                    : "Transfer"}
                </Text>
              </View>

              {order.payment_method === "cash" && order.cash_tendered ? (
                <>
                  <View style={styles.slipRow}>
                    <Text style={styles.cashTenderLabel}>Bayar Tunai</Text>
                    <Text style={styles.cashTenderVal}>
                      Rp{order.cash_tendered.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  <View style={styles.slipRow}>
                    <Text style={styles.changeLabel}>Kembalian</Text>
                    <Text style={styles.changeVal}>
                      Rp{(order.change_amount || 0).toLocaleString("id-ID")}
                    </Text>
                  </View>
                </>
              ) : null}

              <View style={styles.dashedDivider} />

              {/* Footer */}
              <Text style={styles.footerNote}>{settings.footerNote}</Text>
              <Text style={styles.footerBrand}>Powered by Prawira POS</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionBlock}>
            {/* Primary Print Button */}
            <TouchableOpacity
              style={[styles.printBtn, isPrinting && styles.btnDisabled]}
              onPress={handlePrint}
              disabled={isPrinting}
              activeOpacity={0.8}
            >
              {isPrinting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Bluetooth size={16} color="#ffffff" />
                  <Text style={styles.printBtnText}>Cetak Thermal Bluetooth</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dualActionRow}>
              {/* WhatsApp Button */}
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShareWhatsApp}
                activeOpacity={0.7}
              >
                <Share2 size={15} color="#25d366" />
                <Text style={styles.shareBtnText}>Kirim WhatsApp</Text>
              </TouchableOpacity>

              {/* PDF Share Button */}
              <TouchableOpacity
                style={[styles.pdfBtn, isSharingPdf && styles.btnDisabled]}
                onPress={handleSharePdf}
                disabled={isSharingPdf}
                activeOpacity={0.7}
              >
                {isSharingPdf ? (
                  <ActivityIndicator size="small" color={THEME.colors.primaryMuted} />
                ) : (
                  <>
                    <FileText size={15} color={THEME.colors.primaryMuted} />
                    <Text style={styles.pdfBtnText}>Bagikan PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Transaksi Baru Big CTA */}
            <TouchableOpacity
              style={styles.newOrderBtn}
              onPress={handleNewTx}
              activeOpacity={0.8}
            >
              <RotateCcw size={15} color={THEME.colors.textPrimary} />
              <Text style={styles.newOrderBtnText}>Mulai Transaksi Baru</Text>
              <ArrowRight size={15} color={THEME.colors.textPrimary} />
            </TouchableOpacity>

            {onOpenBluetoothSettings && (
              <TouchableOpacity
                style={styles.btSettingsLink}
                onPress={onOpenBluetoothSettings}
                activeOpacity={0.7}
              >
                <Bluetooth size={12} color={THEME.colors.primaryMuted} />
                <Text style={styles.btSettingsLinkText}>
                  Pengaturan & Tes Printer Bluetooth
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  container: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: THEME.colors.surfaceBase,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  successIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.emeraldTint,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.emeraldBorder,
  },
  successHeaderText: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  successSubtext: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  paperScrollView: {
    maxHeight: 330,
  },
  paperContent: {
    paddingBottom: 8,
  },
  thermalPaper: {
    backgroundColor: "#fdfbf7",
    borderRadius: THEME.radius.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  storeName: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  storeMeta: {
    fontFamily: "monospace",
    fontSize: 10,
    color: THEME.colors.textTertiary,
    textAlign: "center",
  },
  storeHeaderNote: {
    fontFamily: "monospace",
    fontSize: 9,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  dashedDivider: {
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    marginVertical: 8,
  },
  slipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slipMetaText: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#64748b",
  },
  itemBlock: {
    marginBottom: 6,
  },
  itemNameText: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemDetailText: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#64748b",
  },
  itemSubtotalText: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  grandTotalLabel: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  grandTotalAmount: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  paymentMethodLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#64748b",
  },
  paymentMethodVal: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    color: "#0f172a",
  },
  cashTenderLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#64748b",
  },
  cashTenderVal: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#0f172a",
  },
  changeLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    color: THEME.colors.emeraldReceipt,
  },
  changeVal: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.emeraldReceipt,
  },
  footerNote: {
    fontFamily: "monospace",
    fontSize: 10,
    color: THEME.colors.textMuted,
    textAlign: "center",
  },
  footerBrand: {
    fontFamily: "monospace",
    fontSize: 9,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  actionBlock: {
    marginTop: 12,
    gap: 8,
  },
  printBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.emerald,
    paddingVertical: 13,
    borderRadius: THEME.radius.md,
    shadowColor: THEME.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 14,
    fontWeight: "700",
  },
  dualActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(37, 211, 102, 0.35)",
    paddingVertical: 11,
    borderRadius: THEME.radius.md,
  },
  shareBtnText: {
    color: THEME.colors.whatsapp,
    fontSize: 12,
    fontWeight: "700",
  },
  pdfBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.colors.primaryTint,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    paddingVertical: 11,
    borderRadius: THEME.radius.md,
  },
  pdfBtnText: {
    color: THEME.colors.primaryMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  newOrderBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.surfaceCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
  },
  newOrderBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  btSettingsLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 6,
  },
  btSettingsLinkText: {
    color: THEME.colors.primaryMuted,
    fontSize: 11,
    fontWeight: "600",
  },
});
