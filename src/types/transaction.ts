import { SellType, WeightUnit } from "./product";

export interface CartItem {
  product_id: number;
  name: string;
  price: number; // Unit base price
  quantity: number; // Number of units or decimal weight
  sell_type: SellType;
  weight_unit?: WeightUnit;
  half_unit_price?: number | null;
  manual_price?: boolean;
  custom_subtotal?: number;
  discount_note?: string;
  subtotal: number;
}

export type PaymentMethod = "cash" | "qris" | "transfer";

export interface Order {
  id?: number;
  order_number: string;
  created_at: string;
  customer_name?: string;
  payment_method: PaymentMethod;
  total_amount: number;
  cash_tendered?: number;
  change_amount?: number;
  items: CartItem[];
  synced?: boolean;
}

export interface ReceiptSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeWebsite?: string;
  headerNote: string;
  footerNote: string;
  showAddress: boolean;
  showPhone: boolean;
  paperSize: "58" | "80";
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  qrisNote?: string;
}

