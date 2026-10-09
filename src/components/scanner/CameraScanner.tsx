import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import {
  Zap,
  ZapOff,
  Camera,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { Product } from "../../types/product";
import { useScannerThrottle } from "../../hooks/useScannerThrottle";
import { THEME } from "../../lib/theme";

interface CameraScannerProps {
  products: Product[];
  onProductDetected: (product: Product) => void;
  onManualSearchPress?: () => void;
}

export function CameraScanner({
  products,
  onProductDetected,
  onManualSearchPress,
}: CameraScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [detectedToast, setDetectedToast] = useState<{
    name: string;
    price?: number;
    isError?: boolean;
  } | null>(null);

  const {
    handleBarcodeScanned,
    flashOn,
    setFlashOn,
    isScanningActive,
    setIsScanningActive,
  } = useScannerThrottle({
    throttleMs: 1400,
    products,
    onProductDetected: (prod) => {
      setDetectedToast({ name: prod.name, price: prod.price, isError: false });
      onProductDetected(prod);
      setTimeout(() => setDetectedToast(null), 2500);
    },
    onUnknownCode: (code) => {
      setDetectedToast({ name: `Barcode tidak terdaftar: ${code}`, isError: true });
      setTimeout(() => setDetectedToast(null), 3000);
    },
  });

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={THEME.colors.primaryLight} size="small" />
        <Text style={styles.permissionText}>Menyiapkan sensor kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconCircle}>
          <Camera color={THEME.colors.textSecondary} size={28} />
        </View>
        <Text style={styles.permissionTitle}>Akses Kamera Diperlukan</Text>
        <Text style={styles.permissionDesc}>
          Izinkan akses kamera untuk pemindaian barcode produk dan QR kasir secara kontinu.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionBtnText}>Beri Izin Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "code128",
            "code39",
            "upc_a",
            "upc_e",
          ],
        }}
        onBarcodeScanned={isScanningActive ? handleBarcodeScanned : undefined}
      />

      {/* Dark vignette mask outside reticle */}
      <View style={styles.overlayMask}>
        {/* Top Control Bar */}
        <View style={styles.topControlBar}>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isScanningActive
                    ? THEME.colors.emerald
                    : THEME.colors.danger,
                },
              ]}
            />
            <Text style={styles.badgeText}>
              {isScanningActive ? "AUTO SCAN AKTIF" : "SCAN JEDA"}
            </Text>
          </View>

          <View style={styles.actionButtonsRow}>
            {onManualSearchPress && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onManualSearchPress}
                activeOpacity={0.7}
                accessibilityLabel="Cari Produk Manual"
              >
                <Search color={THEME.colors.textPrimary} size={16} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.iconBtn, flashOn && styles.iconBtnFlashActive]}
              onPress={() => setFlashOn((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityLabel="Nyalakan Lampu Senter"
            >
              {flashOn ? (
                <Zap color={THEME.colors.amberLight} size={16} />
              ) : (
                <ZapOff color={THEME.colors.textSecondary} size={16} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconBtn,
                !isScanningActive && styles.iconBtnPaused,
              ]}
              onPress={() => setIsScanningActive((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityLabel="Jeda atau Lanjutkan Scan"
            >
              <RefreshCw
                color={
                  isScanningActive
                    ? THEME.colors.textPrimary
                    : THEME.colors.dangerLight
                }
                size={16}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reticle Focus Area */}
        <View style={styles.reticleFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* High-visibility Laser Scan Line */}
          <View
            style={[
              styles.laserLine,
              {
                backgroundColor: isScanningActive
                  ? THEME.colors.emerald
                  : THEME.colors.danger,
              },
            ]}
          />
        </View>

        {/* Bottom Feedback Toast Banner */}
        <View style={styles.feedbackContainer}>
          {detectedToast ? (
            <View
              style={[
                styles.scannedToast,
                detectedToast.isError
                  ? styles.scannedToastError
                  : styles.scannedToastSuccess,
              ]}
            >
              {detectedToast.isError ? (
                <AlertCircle color={THEME.colors.dangerLight} size={15} />
              ) : (
                <CheckCircle2 color={THEME.colors.emeraldLight} size={15} />
              )}
              <View style={styles.toastTextColumn}>
                <Text
                  style={[
                    styles.scannedToastTitle,
                    detectedToast.isError && styles.scannedToastTitleError,
                  ]}
                  numberOfLines={1}
                >
                  {detectedToast.name}
                </Text>
                {detectedToast.price !== undefined && !detectedToast.isError && (
                  <Text style={styles.scannedToastSubtitle}>
                    +Rp{detectedToast.price.toLocaleString("id-ID")} ditambahkan ke keranjang
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.helperPill}>
              <Text style={styles.helperText}>
                Arahkan kamera ke QR / Barcode produk
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: THEME.colors.canvas,
    overflow: "hidden",
  },
  overlayMask: {
    flex: 1,
    backgroundColor: "rgba(6, 9, 15, 0.42)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  topControlBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 15, 24, 0.88)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    color: THEME.colors.textPrimary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(16, 23, 38, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  iconBtnFlashActive: {
    backgroundColor: THEME.colors.amberTint,
    borderColor: THEME.colors.amberBorder,
  },
  iconBtnPaused: {
    borderColor: THEME.colors.dangerBorder,
  },
  reticleFrame: {
    width: 220,
    height: 125,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: THEME.colors.primaryMuted,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  laserLine: {
    width: "88%",
    height: 2,
    opacity: 0.85,
  },
  feedbackContainer: {
    width: "100%",
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
  },
  helperPill: {
    backgroundColor: "rgba(10, 15, 24, 0.75)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  helperText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  scannedToast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    maxWidth: "92%",
    gap: 8,
  },
  scannedToastSuccess: {
    backgroundColor: "rgba(10, 15, 24, 0.95)",
    borderColor: THEME.colors.emeraldBorder,
  },
  scannedToastError: {
    backgroundColor: "rgba(10, 15, 24, 0.95)",
    borderColor: THEME.colors.dangerBorder,
  },
  toastTextColumn: {
    flexShrink: 1,
  },
  scannedToastTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  scannedToastTitleError: {
    color: THEME.colors.dangerLight,
  },
  scannedToastSubtitle: {
    color: THEME.colors.emeraldLight,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },
  permissionContainer: {
    height: "100%",
    backgroundColor: THEME.colors.canvas,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.surfaceCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
  },
  permissionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  permissionDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  permissionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: THEME.radius.md,
  },
  permissionBtnText: {
    color: THEME.colors.textInverse,
    fontSize: 13,
    fontWeight: "700",
  },
  permissionText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 10,
  },
});
