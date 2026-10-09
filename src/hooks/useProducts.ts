import { useState, useEffect, useCallback, useMemo } from "react";
import { safeStorage } from "../lib/storage-adapter";
import { supabase } from "../lib/supabase";
import { Product } from "../types/product";
import { STORAGE_KEYS } from "../lib/constants";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Load from local offline cache first
  const loadCached = useCallback(async () => {
    try {
      const cached = await safeStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
      if (cached) {
        setProducts(JSON.parse(cached));
      }
    } catch {
      // Ignore cache read errors
    }
  }, []);

  // Fetch from Supabase
  const fetchProducts = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (sbError) {
        throw sbError;
      }

      if (data && data.length > 0) {
        setProducts(data as Product[]);
        // Update offline cache
        await safeStorage.setItem(STORAGE_KEYS.PRODUCTS_CACHE, JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memuat produk dari server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCached().then(() => fetchProducts());
  }, [loadCached, fetchProducts]);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean) as string[])
    );
    return ["Semua", ...list];
  }, [products]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "Semua" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBarcode = p.barcode ? p.barcode.toLowerCase().includes(query) : false;
        const matchesCategory = p.category ? p.category.toLowerCase().includes(query) : false;
        return matchesName || matchesBarcode || matchesCategory;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return {
    products,
    filteredProducts,
    categories,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    refetch: () => fetchProducts(true),
  };
}
