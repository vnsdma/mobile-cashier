import { useState, useRef, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Product } from "../types/product";
import { parseProductFromQr } from "../lib/qr-helper";

interface ScannerThrottleOptions {
  throttleMs?: number;
  onProductDetected: (product: Product) => void;
  onUnknownCode?: (rawText: string) => void;
  products: Product[];
}

export function useScannerThrottle({
  throttleMs = 1500,
  onProductDetected,
  onUnknownCode,
  products,
}: ScannerThrottleOptions) {
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>("");

  const handleBarcodeScanned = useCallback(
    ({ data, type }: { data: string; type: string }) => {
      if (!isScanningActive || !data) return;

      const now = Date.now();
      const trimmed = data.trim();

      // If same code is scanned within throttle interval, ignore
      if (
        trimmed === lastScannedCodeRef.current &&
        now - lastScanTimeRef.current < throttleMs
      ) {
        return;
      }

      // Update scan memory
      lastScanTimeRef.current = now;
      lastScannedCodeRef.current = trimmed;
      setLastScannedText(trimmed);

      // Attempt to resolve product
      const product = parseProductFromQr(trimmed, products);

      if (product) {
        // Haptic feedback
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Haptics optional on web
        }
        onProductDetected(product);
      } else {
        // Warning haptic
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          // Haptics optional on web
        }
        if (onUnknownCode) {
          onUnknownCode(trimmed);
        }
      }
    },
    [isScanningActive, products, throttleMs, onProductDetected, onUnknownCode]
  );

  const resetThrottle = useCallback(() => {
    lastScannedCodeRef.current = "";
    lastScanTimeRef.current = 0;
  }, []);

  return {
    handleBarcodeScanned,
    isScanningActive,
    setIsScanningActive,
    flashOn,
    setFlashOn,
    lastScannedText,
    resetThrottle,
  };
}
