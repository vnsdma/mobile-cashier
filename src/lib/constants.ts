import { ReceiptSettings } from "../types/transaction";

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  storeName: "Prawira Tobacco",
  storeAddress: "Jl. Raya Cigombong, Bogor",
  storePhone: "0812-3456-7890",
  headerNote: "Kualitas & Rasa Terbaik",
  footerNote: "Terima kasih atas kunjungan Anda",
  showAddress: true,
  showPhone: true,
  paperSize: "58",
};

export interface QuickWeightOption {
  label: string;
  value: number;
}

export const QUICK_WEIGHTS: Record<string, QuickWeightOption[]> = {
  ons: [
    { label: "1/2", value: 0.5 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "5", value: 5 },
  ],
  gram: [
    { label: "50g", value: 50 },
    { label: "100g", value: 100 },
    { label: "250g", value: 250 },
    { label: "500g", value: 500 },
  ],
  kg: [
    { label: "1/4", value: 0.25 },
    { label: "1/2", value: 0.5 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
  ],
};

export const WEIGHT_UNIT_LABEL: Record<string, string> = {
  gram: "gram",
  ons: "ons",
  kg: "kg",
};

export const QUICK_CASH_AMOUNTS = [
  { label: "Uang Pas", value: 0 },
  { label: "10k", value: 10000 },
  { label: "20k", value: 20000 },
  { label: "50k", value: 50000 },
  { label: "100k", value: 100000 },
];

export const STORAGE_KEYS = {
  PRODUCTS_CACHE: "prawira_products_cache_v1",
  CART: "prawira_cart_v1",
  ORDERS_QUEUE: "prawira_offline_orders_v1",
  RECEIPT_SETTINGS: "prawira_receipt_settings_v1",
  PAIRED_PRINTER: "prawira_paired_printer_v1",
  DEVICE_UID: "prawira_device_uid_v1",
};
