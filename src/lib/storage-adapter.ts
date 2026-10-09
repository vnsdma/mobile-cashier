import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Robust storage adapter with error boundary fallback
 * Prevents unhandled promise crashes if the native storage module has transient initialization delays.
 */
class MemoryStorageFallback {
  private mem = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return this.mem.get(key) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      this.mem.set(key, value);
    } catch {
      this.mem.set(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      this.mem.delete(key);
    } catch {
      this.mem.delete(key);
    }
  }
}

export const safeStorage = new MemoryStorageFallback();
export default safeStorage;

/**
 * Generates a simple UUID v4 tanpa dependency tambahan.
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Mengembalikan device UID yang persisten.
 * Di-generate sekali, disimpan ke AsyncStorage, lalu di-reuse.
 * Dipakai sebagai user_uid pada setiap order agar tiap device/toko bisa diidentifikasi.
 */
export async function getDeviceUid(): Promise<string> {
  const DEVICE_UID_KEY = "prawira_device_uid_v1";
  try {
    const existing = await safeStorage.getItem(DEVICE_UID_KEY);
    if (existing) return existing;
    const newUid = generateUUID();
    await safeStorage.setItem(DEVICE_UID_KEY, newUid);
    return newUid;
  } catch {
    return generateUUID(); // fallback kalau storage error
  }
}
