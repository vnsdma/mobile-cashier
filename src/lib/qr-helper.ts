import { ProductLike } from "../types/product";

/**
 * Standard prefix for text QR codes: PROD:<id>
 * Structured JSON is also supported: {"type":"prawira_product","id":123,...}
 */
export function generateProductQrValue(product: ProductLike): string {
  return JSON.stringify({
    app: "prawira",
    type: "product",
    id: product.id,
    name: product.name,
  });
}

/**
 * Alternative compact string value suitable for low-density or small labels
 */
export function getProductDisplayCode(id: number): string {
  return `PROD-${String(id).padStart(5, "0")}`;
}

/**
 * Parses any scanned QR or barcode text and matches it to a product in the list.
 * Supports:
 * 1. Structured JSON: {"id": 123} or {"productId": 123}
 * 2. Formatted Prefix: "PROD:123", "PROD-00123", "PRODUCT:123"
 * 3. Plain numeric ID: "123"
 * 4. Barcode exact match: matching p.barcode
 * 5. Name match fallback
 */
export function parseProductFromQr<T extends ProductLike & { barcode?: string }>(
  decodedText: string,
  products: T[]
): T | null {
  if (!decodedText || !products.length) return null;
  const trimmed = decodedText.trim();

  // 1. Check direct barcode field match first
  const barcodeMatch = products.find((p) => p.barcode && p.barcode.trim() === trimmed);
  if (barcodeMatch) return barcodeMatch;

  // 2. Structured JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const targetId = parsed.id ?? parsed.productId ?? parsed.product_id;
      if (targetId !== undefined && targetId !== null) {
        const found = products.find((p) => p.id === Number(targetId));
        if (found) return found;
      }
    } catch {
      // Continue to next strategy
    }
  }

  // 3. Formatted Prefix: PROD-00042, PROD:42, PRODUCT:42
  const prefixMatch = trimmed.match(/^(?:PROD[-:]|PRODUCT[-:])(\d+)$/i);
  if (prefixMatch) {
    const targetId = Number(prefixMatch[1]);
    const found = products.find((p) => p.id === targetId);
    if (found) return found;
  }

  // 4. Plain Numeric ID (e.g. "42")
  if (/^\d+$/.test(trimmed)) {
    const targetId = Number(trimmed);
    const found = products.find((p) => p.id === targetId);
    if (found) return found;
  }

  // 5. Case-insensitive exact name match
  const lower = trimmed.toLowerCase();
  const nameMatch = products.find((p) => p.name.toLowerCase() === lower);
  if (nameMatch) return nameMatch;

  return null;
}
