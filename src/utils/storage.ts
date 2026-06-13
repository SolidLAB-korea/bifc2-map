import type { Store } from "../types/store";

const favoriteStoreKey = "bifc2.favoriteStoreIds";
const storeDataKey = "bifc2.storeData";
const adminSessionKey = "bifc2.adminSession";

export function getStoredStores(defaultStores: Store[]): Store[] {
  try {
    const rawValue = window.localStorage.getItem(storeDataKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    return Array.isArray(parsedValue) ? parsedValue : defaultStores;
  } catch {
    return defaultStores;
  }
}

export function setStoredStores(stores: Store[]) {
  window.localStorage.setItem(storeDataKey, JSON.stringify(stores));
  window.dispatchEvent(new Event("stores-updated"));
}

export function resetStoredStores(defaultStores: Store[]) {
  window.localStorage.removeItem(storeDataKey);
  window.dispatchEvent(new Event("stores-updated"));
  return defaultStores;
}

export function getFavoriteIds(): string[] {
  try {
    const rawValue = window.localStorage.getItem(favoriteStoreKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids: string[]) {
  window.localStorage.setItem(favoriteStoreKey, JSON.stringify(Array.from(new Set(ids))));
}

export function isFavoriteStore(id: string) {
  return getFavoriteIds().includes(id);
}

export function toggleFavoriteStore(id: string) {
  const favorites = getFavoriteIds();
  const nextFavorites = favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id];

  setFavoriteIds(nextFavorites);
  window.dispatchEvent(new Event("favorites-updated"));
  return nextFavorites.includes(id);
}

export function isAdminSignedIn() {
  return window.sessionStorage.getItem(adminSessionKey) === "true";
}

export function setAdminSignedIn(isSignedIn: boolean) {
  if (isSignedIn) {
    window.sessionStorage.setItem(adminSessionKey, "true");
  } else {
    window.sessionStorage.removeItem(adminSessionKey);
  }
  window.dispatchEvent(new Event("admin-session-updated"));
}
