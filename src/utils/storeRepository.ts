import type { Store } from "../types/store";
import { getStoredStores, resetStoredStores, setStoredStores } from "./storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const storesEndpoint = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/rest/v1/stores` : "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function loadStores(defaultStores: Store[]): Promise<Store[]> {
  if (!isSupabaseConfigured) {
    return getStoredStores(defaultStores);
  }

  const stores = await requestSupabase<Store[]>("?select=*&order=floor.asc,name.asc");
  return stores.map(normalizeStore);
}

export async function createStore(store: Store, currentStores: Store[]): Promise<Store[]> {
  if (!isSupabaseConfigured) {
    const nextStores = [...currentStores, store];
    setStoredStores(nextStores);
    return nextStores;
  }

  await upsertStores([store]);
  window.dispatchEvent(new Event("stores-updated"));
  return loadStores(currentStores);
}

export async function updateStore(store: Store, currentStores: Store[]): Promise<Store[]> {
  if (!isSupabaseConfigured) {
    const nextStores = currentStores.map((item) => (item.id === store.id ? store : item));
    setStoredStores(nextStores);
    return nextStores;
  }

  await upsertStores([store]);
  window.dispatchEvent(new Event("stores-updated"));
  return loadStores(currentStores);
}

export async function deleteStore(storeId: string, currentStores: Store[]): Promise<Store[]> {
  if (!isSupabaseConfigured) {
    const nextStores = currentStores.filter((store) => store.id !== storeId);
    setStoredStores(nextStores);
    return nextStores;
  }

  await requestSupabase(`?id=eq.${encodeURIComponent(storeId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
  window.dispatchEvent(new Event("stores-updated"));
  return loadStores(currentStores);
}

export async function resetStores(defaultStores: Store[]): Promise<Store[]> {
  if (!isSupabaseConfigured) {
    return resetStoredStores(defaultStores);
  }

  await requestSupabase("", {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
  window.dispatchEvent(new Event("stores-updated"));
  return [];
}

async function upsertStores(stores: Store[]) {
  await requestSupabase("?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(stores)
  });
}

async function requestSupabase<T>(query: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${storesEndpoint}${query}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase 요청 실패: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function normalizeStore(store: Store): Store {
  return {
    ...store,
    keywords: Array.isArray(store.keywords) ? store.keywords : [],
    links: store.links && typeof store.links === "object" && !Array.isArray(store.links) ? store.links : {},
    translations:
      store.translations && typeof store.translations === "object" && !Array.isArray(store.translations)
        ? store.translations
        : {},
    image: store.image ?? undefined,
    x: Number(store.x),
    y: Number(store.y)
  };
}
