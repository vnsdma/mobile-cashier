import { Order, ReceiptSettings } from "../types/transaction";

/**
 * Builds raw ESC/POS command bytes for 58mm/80mm thermal receipt printers.
 */
export class EscPosBuilder {
  private buffer: number[] = [];
  private charWidth: number;

  constructor(paperSize: "58" | "80" = "58") {
    this.charWidth = paperSize === "80" ? 48 : 32;
    this.initialize();
  }

  initialize() {
    this.buffer.push(0x1b, 0x40); // ESC @ (Reset)
    return this;
  }

  alignCenter() {
    this.buffer.push(0x1b, 0x61, 1);
    return this;
  }

  alignLeft() {
    this.buffer.push(0x1b, 0x61, 0);
    return this;
  }

  alignRight() {
    this.buffer.push(0x1b, 0x61, 2);
    return this;
  }

  bold(enable: boolean) {
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  doubleHeight(enable: boolean) {
    this.buffer.push(0x1b, 0x21, enable ? 0x10 : 0x00);
    return this;
  }

  text(str: string) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.buffer.push(code > 127 ? 63 : code); // ASCII fallback
    }
    return this;
  }

  newLine(count = 1) {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  divider() {
    this.alignLeft();
    this.text("-".repeat(this.charWidth));
    this.newLine();
    return this;
  }

  twoColumn(left: string, right: string) {
    const spaceCount = this.charWidth - left.length - right.length;
    if (spaceCount <= 0) {
      this.text(left + " " + right);
    } else {
      this.text(left + " ".repeat(spaceCount) + right);
    }
    this.newLine();
    return this;
  }

  cut() {
    this.buffer.push(0x1d, 0x56, 0x42, 0x00); // GS V 66 0
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Formats an order into an ESC/POS byte array ready to send to a Bluetooth thermal printer.
 */
export function generateEscPosReceipt(order: Order, settings: ReceiptSettings): Uint8Array {
  const builder = new EscPosBuilder(settings.paperSize);

  // Store Header
  builder.alignCenter().bold(true).doubleHeight(true).text(settings.storeName).newLine();
  builder.doubleHeight(false).bold(false);

  if (settings.showAddress && settings.storeAddress) {
    builder.text(settings.storeAddress).newLine();
  }
  if (settings.showPhone && settings.storePhone) {
    builder.text(`Telp: ${settings.storePhone}`).newLine();
  }
  if (settings.headerNote) {
    builder.text(settings.headerNote).newLine();
  }

  builder.divider();

  // Order Metadata
  builder.alignLeft();
  builder.twoColumn(`No: ${order.order_number}`, order.created_at.slice(11, 16));
  if (order.customer_name) {
    builder.text(`Pelanggan: ${order.customer_name}`).newLine();
  }
  builder.divider();

  // Item List
  for (const item of order.items) {
    builder.bold(true).text(item.name).newLine().bold(false);
    const qtyStr =
      item.sell_type === "weight"
        ? `${item.quantity} ${item.weight_unit || "ons"}`
        : `${item.quantity} pcs`;
    const priceStr = item.custom_subtotal
      ? item.discount_note ? `(${item.discount_note})` : "(Harga Paket)"
      : `@ Rp${item.price.toLocaleString("id-ID")}`;
    const subtotalStr = `Rp${item.subtotal.toLocaleString("id-ID")}`;
    builder.twoColumn(`  ${qtyStr} ${priceStr}`, subtotalStr);
  }

  builder.divider();

  // Totals
  builder.bold(true).twoColumn("TOTAL", `Rp${order.total_amount.toLocaleString("id-ID")}`).bold(false);
  builder.twoColumn(
    "Metode Bayar",
    order.payment_method === "cash"
      ? "Tunai"
      : order.payment_method === "qris"
      ? "QRIS"
      : "Transfer"
  );

  if (order.payment_method === "cash" && order.cash_tendered) {
    builder.twoColumn("Bayar", `Rp${order.cash_tendered.toLocaleString("id-ID")}`);
    builder.twoColumn("Kembali", `Rp${(order.change_amount || 0).toLocaleString("id-ID")}`);
  }

  builder.divider();

  // Footer
  builder.alignCenter();
  if (settings.footerNote) {
    builder.text(settings.footerNote).newLine();
  }
  if (settings.storeWebsite && settings.storeWebsite.trim().length > 0) {
    builder.text(settings.storeWebsite.trim()).newLine();
  }
  builder.newLine(3);
  builder.cut();

  return builder.getBytes();
}

/**
 * Formats a clean WhatsApp receipt message string.
 */
export function generateWhatsAppReceiptText(order: Order, settings: ReceiptSettings): string {
  let msg = `*${settings.storeName.toUpperCase()}*\n`;
  if (settings.storeAddress) msg += `${settings.storeAddress}\n`;
  if (settings.storePhone) msg += `Telp: ${settings.storePhone}\n`;
  msg += `------------------------------\n`;
  msg += `No. Nota: ${order.order_number}\n`;
  msg += `Waktu: ${new Date(order.created_at).toLocaleString("id-ID")}\n`;
  if (order.customer_name) msg += `Pelanggan: ${order.customer_name}\n`;
  msg += `------------------------------\n`;

  for (const item of order.items) {
    const qtyStr =
      item.sell_type === "weight"
        ? `${item.quantity} ${item.weight_unit || "ons"}`
        : `${item.quantity} pcs`;
    const priceDetail = item.custom_subtotal
      ? `(${item.discount_note || "Harga Paket"})`
      : `x Rp${item.price.toLocaleString("id-ID")}`;
    msg += `• *${item.name}*\n`;
    msg += `  ${qtyStr} ${priceDetail} = Rp${item.subtotal.toLocaleString("id-ID")}\n`;
  }

  msg += `------------------------------\n`;
  msg += `*TOTAL: Rp${order.total_amount.toLocaleString("id-ID")}*\n`;
  msg += `Metode: ${order.payment_method === "cash" ? "Tunai" : order.payment_method === "qris" ? "QRIS" : "Transfer"}\n`;

  if (order.payment_method === "cash" && order.cash_tendered) {
    msg += `Bayar: Rp${order.cash_tendered.toLocaleString("id-ID")}\n`;
    msg += `Kembali: Rp${(order.change_amount || 0).toLocaleString("id-ID")}\n`;
  }

  msg += `------------------------------\n`;
  if (settings.footerNote) msg += `${settings.footerNote}\n`;

  return msg;
}
