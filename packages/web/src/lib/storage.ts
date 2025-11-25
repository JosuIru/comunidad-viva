/**
 * Safe localStorage wrapper that handles:
 * - SSR (server-side rendering) environments where localStorage is undefined
 * - Safari private mode where localStorage may throw exceptions
 * - Type-safe operations with JSON parsing
 */

import type { User } from '@/types/api';

const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

class SafeStorage {
  private available: boolean;
  private memoryStorage: Map<string, string>;

  constructor() {
    this.available = isLocalStorageAvailable();
    this.memoryStorage = new Map();
  }

  getItem(key: string): string | null {
    if (this.available) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`Failed to get item from localStorage: ${key}`, e);
        return this.memoryStorage.get(key) || null;
      }
    }
    return this.memoryStorage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.available) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn(`Failed to set item in localStorage: ${key}`, e);
      }
    }
    this.memoryStorage.set(key, value);
  }

  removeItem(key: string): void {
    if (this.available) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn(`Failed to remove item from localStorage: ${key}`, e);
      }
    }
    this.memoryStorage.delete(key);
  }

  clear(): void {
    if (this.available) {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.warn('Failed to clear localStorage', e);
      }
    }
    this.memoryStorage.clear();
  }

  /**
   * Get and parse JSON from storage
   */
  getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Failed to parse JSON from localStorage: ${key}`, e);
      return null;
    }
  }

  /**
   * Stringify and save JSON to storage
   */
  setJSON<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized);
    } catch (e) {
      console.warn(`Failed to stringify JSON for localStorage: ${key}`, e);
    }
  }
}

// Singleton instance
export const storage = new SafeStorage();

// Convenience functions for common storage keys
export const storageKeys = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Token management helpers
export const tokenStorage = {
  getAccessToken: (): string | null => storage.getItem(storageKeys.ACCESS_TOKEN),
  setAccessToken: (token: string): void => storage.setItem(storageKeys.ACCESS_TOKEN, token),
  getRefreshToken: (): string | null => storage.getItem(storageKeys.REFRESH_TOKEN),
  setRefreshToken: (token: string): void => storage.setItem(storageKeys.REFRESH_TOKEN, token),
  clearTokens: (): void => {
    storage.removeItem(storageKeys.ACCESS_TOKEN);
    storage.removeItem(storageKeys.REFRESH_TOKEN);
  },
};

// User management helpers
export const userStorage = {
  getUser: (): User | null => storage.getJSON<User>(storageKeys.USER),
  setUser: (user: User): void => storage.setJSON(storageKeys.USER, user),
  clearUser: (): void => storage.removeItem(storageKeys.USER),
  getUserId: (): string | null => {
    const user = storage.getJSON<User>(storageKeys.USER);
    return user?.id || null;
  },
};

export default storage;
