import { useState, useEffect, useCallback, useMemo } from "react";
import { safeStorage } from "../lib/storage-adapter";
import { Product, WeightUnit } from "../types/product";
import { CartItem } from "../types/transaction";
import { STORAGE_KEYS } from "../lib/constants";

export function calculateSubtotal(item: {
  price: number;
  quantity: number;
  sell_type: "pcs" | "weight";
  half_unit_price?: number | null;
  custom_subtotal?: number | null;
}): number {
  // If custom subtotal is specified (e.g. promo bundle: 2 lem = Rp 5.000), use it directly
  if (
    item.custom_subtotal !== undefined &&
    item.custom_subtotal !== null &&
    item.custom_subtotal > 0
  ) {
    return Math.round(item.custom_subtotal);
  }

  if (item.sell_type === "pcs") {
    return Math.round(item.price * item.quantity);
  }

  // Weight calculation
  // Check half unit special pricing (e.g. 0.5 ons = 1/2 ons)
  if (item.quantity === 0.5 && item.half_unit_price) {
    return Math.round(item.half_unit_price);
  }

  return Math.round(item.price * item.quantity);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from storage on mount
  useEffect(() => {
    safeStorage
      .getItem(STORAGE_KEYS.CART)
      .then((saved) => {
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch {
            setItems([]);
          }
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // Save to storage on changes
  useEffect(() => {
    if (isLoaded) {
      safeStorage
        .setItem(STORAGE_KEYS.CART, JSON.stringify(items))
        .catch(() => {});
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, customQty?: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product_id === product.id && !i.custom_subtotal
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty =
          product.sell_type === "weight"
            ? customQty !== undefined
              ? customQty
              : existing.quantity + 1
            : existing.quantity + (customQty || 1);

        const updatedItem: CartItem = {
          ...existing,
          quantity: newQty,
          subtotal: calculateSubtotal({
            price: existing.price,
            quantity: newQty,
            sell_type: existing.sell_type,
            half_unit_price: existing.half_unit_price,
            custom_subtotal: existing.custom_subtotal,
          }),
        };

        const next = [...prev];
        next[existingIndex] = updatedItem;
        return next;
      }

      // Add new item
      const defaultQty = customQty !== undefined ? customQty : 1;
      const newItem: CartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: defaultQty,
        sell_type: product.sell_type || "pcs",
        weight_unit: product.weight_unit || "ons",
        half_unit_price: product.half_unit_price,
        subtotal: calculateSubtotal({
          price: product.price,
          quantity: defaultQty,
          sell_type: product.sell_type || "pcs",
          half_unit_price: product.half_unit_price,
        }),
      };

      // Put latest scanned item at top of list
      return [newItem, ...prev];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, newQty: number) => {
    setItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((i) => i.product_id !== productId);
      }

      return prev.map((item) => {
        if (item.product_id === productId) {
          // If changing quantity via stepper, reset custom subtotal if present so calculation matches new quantity
          const customSub = item.custom_subtotal ? null : undefined;
          return {
            ...item,
            quantity: newQty,
            custom_subtotal: customSub ?? undefined,
            discount_note: customSub === null ? undefined : item.discount_note,
            subtotal: calculateSubtotal({
              price: item.price,
              quantity: newQty,
              sell_type: item.sell_type,
              half_unit_price: item.half_unit_price,
              custom_subtotal: customSub,
            }),
          };
        }
        return item;
      });
    });
  }, []);

  const updateWeight = useCallback(
    (productId: number, weightValue: number, unit?: WeightUnit) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.product_id === productId) {
            const nextUnit = unit || item.weight_unit;
            // Reset custom subtotal when choosing a standard weight chip
            return {
              ...item,
              quantity: weightValue,
              weight_unit: nextUnit,
              custom_subtotal: undefined,
              discount_note: undefined,
              subtotal: calculateSubtotal({
                price: item.price,
                quantity: weightValue,
                sell_type: "weight",
                half_unit_price: item.half_unit_price,
              }),
            };
          }
          return item;
        })
      );
    },
    []
  );

  const editItem = useCallback(
    (
      productId: number,
      updates: {
        quantity?: number;
        weight_unit?: WeightUnit;
        custom_subtotal?: number | null;
        discount_note?: string | null;
      }
    ) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.product_id === productId) {
            const nextQty =
              updates.quantity !== undefined ? updates.quantity : item.quantity;
            const nextUnit =
              updates.weight_unit !== undefined
                ? updates.weight_unit
                : item.weight_unit;
            const nextCustomSub =
              updates.custom_subtotal !== undefined
                ? updates.custom_subtotal === null
                  ? undefined
                  : updates.custom_subtotal
                : item.custom_subtotal;
            const nextDiscountNote =
              updates.discount_note !== undefined
                ? updates.discount_note === null
                  ? undefined
                  : updates.discount_note
                : item.discount_note;

            return {
              ...item,
              quantity: nextQty,
              weight_unit: nextUnit,
              custom_subtotal: nextCustomSub,
              discount_note: nextDiscountNote,
              subtotal: calculateSubtotal({
                price: item.price,
                quantity: nextQty,
                sell_type: item.sell_type,
                half_unit_price: item.half_unit_price,
                custom_subtotal: nextCustomSub,
              }),
            };
          }
          return item;
        })
      );
    },
    []
  );

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    safeStorage.removeItem(STORAGE_KEYS.CART).catch(() => {});
  }, []);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const totalItemCount = useMemo(() => {
    return items.reduce((count, item) => {
      return count + (item.sell_type === "pcs" ? item.quantity : 1);
    }, 0);
  }, [items]);

  return {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    updateWeight,
    editItem,
    removeItem,
    clearCart,
    totalAmount,
    totalItemCount,
  };
}
