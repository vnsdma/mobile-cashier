export type SellType = "pcs" | "weight";
export type WeightUnit = "gram" | "ons" | "kg";

export interface Product {
  id: number;
  name: string;
  price: number;
  in_stock: number;
  category?: string;
  image_url?: string;
  sell_type?: SellType;
  weight_unit?: WeightUnit;
  half_unit_price?: number | null;
  barcode?: string;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductLike {
  id: number;
  name: string;
  price?: number;
  sell_type?: SellType;
  weight_unit?: WeightUnit;
  category?: string;
}
