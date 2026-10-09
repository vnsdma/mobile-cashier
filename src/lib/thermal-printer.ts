import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Linking, Alert, Platform } from "react-native";
import { Order, ReceiptSettings } from "../types/transaction";
import {
  generateEscPosReceipt,
  EscPosBuilder,
  generateWhatsAppReceiptText,
} from "./escpos-builder";

/**
 * Pure TypeScript Uint8Array to Base64 encoder (reliable across iOS, Android, and Web)
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < len ? chars[((b2 & 15) << 2) | (b3 >> 6)] : "=";
    result += i + 2 < len ? chars[b3 & 63] : "=";
  }
  return result;
}

/**
 * Generates test ESC/POS bytes for verifying Bluetooth thermal printer connection.
 */
export function generateTestReceipt(settings: ReceiptSettings): Uint8Array {
  const builder = new EscPosBuilder(settings.paperSize);
  builder.alignCenter().bold(true).doubleHeight(true).text(settings.storeName).newLine();
  builder.doubleHeight(false).bold(false);
  builder.text("TES PRINTER BLUETOOTH").newLine();
  builder.divider();
  builder.alignLeft();
  builder.twoColumn("Status", "TERHUBUNG OK");
  builder.twoColumn("Koneksi", "Bluetooth ESC/POS");
  builder.twoColumn("Lebar Kertas", `${settings.paperSize}mm`);
  builder.twoColumn("Waktu", new Date().toLocaleTimeString("id-ID"));
  builder.divider();
  builder.alignCenter();
  builder.bold(true).text("PRINTER SIAP DIGUNAKAN").newLine().bold(false);
  builder.text("Prawira Mobile POS").newLine();
  builder.newLine(3);
  builder.cut();
  return builder.getBytes();
}

/**
 * Checks whether RawBT Bluetooth print service is installed on the Android device.
 */
export async function isRawBtAvailableAsync(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    return await Linking.canOpenURL("rawbt:base64,");
  } catch {
    return false;
  }
}

/**
 * Opens Google Play Store to install the official free RawBT Bluetooth print driver.
 */
export async function openRawBtPlayStore(): Promise<void> {
  const marketUrl = "market://details?id=ru.a402d.rawbtprinter";
  const webUrl = "https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter";
  try {
    await Linking.openURL(marketUrl);
  } catch {
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert("Info", "Buka Google Play Store dan cari aplikasi 'RawBT'");
    }
  }
}

/**
 * Prompts user to install RawBT driver from Play Store for Bluetooth printing.
 */
export function promptInstallRawBt(): void {
  Alert.alert(
    "Driver Printer Bluetooth Diperlukan",
    "Printer thermal Bluetooth 58mm/80mm memerlukan driver 'RawBT' resmi agar HP Android dapat mengirim data struk langsung tanpa kabel.\n\n1. Pasang RawBT dari Google Play Store\n2. Buka RawBT dan pilih printer Bluetooth Anda\n3. Siap cetak struk instan!",
    [
      { text: "Batal", style: "cancel" },
      {
        text: "Pasang RawBT dari Play Store",
        onPress: () => openRawBtPlayStore(),
      },
    ]
  );
}

/**
 * Prints order directly to Bluetooth thermal printer via RawBT protocol.
 * Returns true if the command was dispatched to RawBT, false if driver is missing.
 */
export async function printReceiptViaRawBtAsync(
  order: Order,
  settings: ReceiptSettings
): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const rawBytes = generateEscPosReceipt(order, settings);
    const base64Data = uint8ArrayToBase64(rawBytes);

    // Official RawBT format: rawbt:base64,<BASE64_DATA> (do NOT use rawbt:data:base64 which causes empty print job)
    const rawBtUrl = `rawbt:base64,${base64Data}`;

    try {
      await Linking.openURL(rawBtUrl);
      return true;
    } catch {
      // Fallback: Android explicit Intent URI for RawBT package
      const intentUrl = `intent:base64,${base64Data}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
      await Linking.openURL(intentUrl);
      return true;
    }
  } catch (err) {
    console.warn("RawBT print error:", err);
    return false;
  }
}

/**
 * Prints test slip directly to Bluetooth thermal printer via RawBT.
 */
export async function printTestViaRawBtAsync(
  settings: ReceiptSettings
): Promise<boolean> {
  if (Platform.OS !== "android") return false;

  try {
    const rawBytes = generateTestReceipt(settings);
    const base64Data = uint8ArrayToBase64(rawBytes);

    // Official RawBT format: rawbt:base64,<BASE64_DATA>
    const rawBtUrl = `rawbt:base64,${base64Data}`;

    try {
      await Linking.openURL(rawBtUrl);
      return true;
    } catch {
      // Fallback: Android explicit Intent URI for RawBT package
      const intentUrl = `intent:base64,${base64Data}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
      await Linking.openURL(intentUrl);
      return true;
    }
  } catch (err) {
    console.warn("RawBT test print error:", err);
    return false;
  }
}

/**
 * Prints plain formatted text directly via RawBT (rawbt:<URL_ENCODED_TEXT>).
 * Useful as a secondary alternative for printers that struggle with binary ESC/POS.
 */
export async function printTextViaRawBtAsync(text: string): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const rawBtUrl = `rawbt:${encodeURIComponent(text)}`;
    await Linking.openURL(rawBtUrl);
    return true;
  } catch (err) {
    console.warn("RawBT plain text print error:", err);
    return false;
  }
}

/**
 * Prints a test slip using plain text format via RawBT.
 */
export async function printTestViaRawBtTextAsync(
  settings: ReceiptSettings
): Promise<boolean> {
  const line = "-".repeat(32);
  const text = [
    line,
    `    ${settings.storeName.toUpperCase()}    `,
    "  TES CETAK TEKS BLUETOOTH  ",
    line,
    "Status:     TERHUBUNG OK",
    "Koneksi:    Bluetooth RawBT Text",
    `Lebar:      ${settings.paperSize}mm`,
    `Waktu:      ${new Date().toLocaleTimeString("id-ID")}`,
    line,
    "  PRINTER SIAP DIGUNAKAN!   ",
    "     Prawira Mobile POS     ",
    line,
    "\n\n\n\n",
  ].join("\n");

  return await printTextViaRawBtAsync(text);
}

/**
 * Prints an order using plain text format via RawBT.
 */
export async function printReceiptViaRawBtTextAsync(
  order: Order,
  settings: ReceiptSettings
): Promise<boolean> {
  const text = generateWhatsAppReceiptText(order, settings) + "\n\n\n\n";
  return await printTextViaRawBtAsync(text);
}

/**
 * Generates high-contrast thermal receipt HTML formatted strictly for 58mm / 80mm rolls.
 */
export function generateThermalReceiptHtml(
  order: Order,
  settings: ReceiptSettings
): string {
  const is80mm = settings.paperSize === "80";
  const rollWidth = is80mm ? "72mm" : "54mm";
  const paperWidth = is80mm ? "80mm" : "58mm";

  const dateStr = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = new Date(order.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemsHtml = order.items
    .map((item) => {
      const qtyStr =
        item.sell_type === "weight"
          ? `${item.quantity} ${item.weight_unit || "ons"}`
          : `${item.quantity} pcs`;
      const priceDetail = item.custom_subtotal
        ? `(${item.discount_note || "Harga Paket"})`
        : `@ Rp${item.price.toLocaleString("id-ID")}`;

      return `
        <div style="margin-bottom: 5px;">
          <div style="font-weight: bold; font-size: 11px;">${item.name}</div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #111;">
            <span>${qtyStr} ${priceDetail}</span>
            <span style="font-weight: bold;">Rp${item.subtotal.toLocaleString("id-ID")}</span>
          </div>
        </div>
      `;
    })
    .join("");

  const cashDetailsHtml =
    order.payment_method === "cash" && order.cash_tendered
      ? `
        <div class="row">
          <span>Bayar Tunai:</span>
          <span>Rp${order.cash_tendered.toLocaleString("id-ID")}</span>
        </div>
        <div class="row">
          <span style="font-weight: bold;">Kembalian:</span>
          <span style="font-weight: bold;">Rp${(order.change_amount || 0).toLocaleString("id-ID")}</span>
        </div>
      `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Struk - ${order.order_number}</title>
        <style>
          @page {
            size: ${paperWidth} auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: ${rollWidth};
            max-width: ${paperWidth};
            margin: 0 auto;
            padding: 8px 4px 16px 4px;
            color: #000000;
            background: #ffffff;
            font-size: 10px;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
          }
          .center { text-align: center; }
          .store-name {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .store-meta {
            font-size: 9px;
            color: #222;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            margin-bottom: 2px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            font-weight: 900;
            margin: 4px 0;
          }
          .footer-note {
            font-size: 9px;
            margin-top: 6px;
            text-align: center;
          }
          .brand-watermark {
            font-size: 8px;
            color: #666;
            margin-top: 3px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="center store-name">${settings.storeName}</div>
        ${settings.showAddress && settings.storeAddress ? `<div class="center store-meta">${settings.storeAddress}</div>` : ""}
        ${settings.showPhone && settings.storePhone ? `<div class="center store-meta">Telp: ${settings.storePhone}</div>` : ""}
        ${settings.headerNote ? `<div class="center store-meta" style="margin-top: 2px;">${settings.headerNote}</div>` : ""}

        <div class="divider"></div>

        <div class="row">
          <span>No: ${order.order_number}</span>
          <span>${timeStr}</span>
        </div>
        <div class="row">
          <span>Tanggal: ${dateStr}</span>
        </div>
        ${order.customer_name ? `<div class="row"><span>Plg: ${order.customer_name}</span></div>` : ""}

        <div class="divider"></div>

        ${itemsHtml}

        <div class="divider"></div>

        <div class="total-row">
          <span>TOTAL</span>
          <span>Rp${order.total_amount.toLocaleString("id-ID")}</span>
        </div>

        <div class="row">
          <span>Metode Bayar:</span>
          <span>${order.payment_method === "cash" ? "Tunai" : order.payment_method === "qris" ? "QRIS" : "Transfer"}</span>
        </div>

        ${cashDetailsHtml}

        <div class="divider"></div>

        <div class="footer-note">${settings.footerNote}</div>
        <div class="brand-watermark">Prawira Mobile POS</div>
      </body>
    </html>
  `;
}

/**
 * Native System Print (opens Android Print Spooler / iOS AirPrint).
 */
export async function printReceiptViaSystemAsync(
  order: Order,
  settings: ReceiptSettings
): Promise<void> {
  const html = generateThermalReceiptHtml(order, settings);
  await Print.printAsync({
    html,
  });
}

/**
 * Share Receipt PDF via Native Share Sheet.
 */
export async function shareReceiptPdfAsync(
  order: Order,
  settings: ReceiptSettings
): Promise<void> {
  const html = generateThermalReceiptHtml(order, settings);
  const file = await Print.printToFileAsync({
    html,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Struk Nota ${order.order_number}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    Alert.alert("Info", `File PDF tersimpan di: ${file.uri}`);
  }
}
