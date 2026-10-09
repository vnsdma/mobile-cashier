-- ============================================================
-- JALANKAN DI: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tambah kolom is_favorite ke tabel products
--    (skip jika sudah ada)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 2. Buat RPC untuk atomic stock decrement
--    Aman dari race condition: langsung UPDATE tanpa SELECT dulu
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id INT, p_qty NUMERIC)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE products
  SET in_stock = GREATEST(0, in_stock - p_qty)
  WHERE id = p_product_id;
$$;

-- 3. Tandai produk favorit (contoh — sesuaikan dengan nama produk kamu)
--    Contoh: tandai semua rokok eceran dan produk kecil sebagai favorit
-- UPDATE products SET is_favorite = true WHERE category = 'Eceran';
-- UPDATE products SET is_favorite = true WHERE name ILIKE '%permen%';
-- UPDATE products SET is_favorite = true WHERE name ILIKE '%korek%';

-- Atau tandai satu per satu lewat Supabase Table Editor:
-- Buka Table Editor → products → edit baris → is_favorite = true
