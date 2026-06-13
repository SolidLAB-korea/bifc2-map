import { useEffect, useMemo, useState } from "react";
import FavoriteButton from "../components/FavoriteButton";
import StoreBottomSheet from "../components/StoreBottomSheet";
import StoreList from "../components/StoreList";
import { floors, stores as defaultStores } from "../data/stores";
import type { Floor, Store } from "../types/store";
import { getFavoriteIds, getStoredStores } from "../utils/storage";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteIds());
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeItems, setStoreItems] = useState<Store[]>(() => getStoredStores(defaultStores));

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(getFavoriteIds());
    window.addEventListener("favorites-updated", syncFavorites);
    window.addEventListener("storage", syncFavorites);
    return () => {
      window.removeEventListener("favorites-updated", syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  useEffect(() => {
    const syncStores = () => setStoreItems(getStoredStores(defaultStores));
    window.addEventListener("stores-updated", syncStores);
    window.addEventListener("storage", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
      window.removeEventListener("storage", syncStores);
    };
  }, []);

  const favoriteStores = useMemo(
    () => storeItems.filter((store) => floors.includes(store.floor as Floor) && favoriteIds.includes(store.id)),
    [favoriteIds, storeItems]
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">저장한 장소</p>
            <h2 className="text-2xl font-black text-primary">즐겨찾기</h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-accent">{favoriteStores.length}곳</span>
        </div>

        <StoreList
          stores={favoriteStores}
          selectedStoreId={selectedStore?.id}
          onStoreSelect={setSelectedStore}
          emptyMessage="즐겨찾기한 매장이 없습니다."
        />
      </section>

      {selectedStore && (
        <section className="mt-4 hidden rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:block">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-accent">{selectedStore.category}</p>
              <h2 className="break-keep text-2xl font-black text-primary">{selectedStore.name}</h2>
            </div>
            <FavoriteButton storeId={selectedStore.id} compact />
          </div>
          <p className="rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{selectedStore.description}</p>
        </section>
      )}

      <StoreBottomSheet store={selectedStore} onClose={() => setSelectedStore(null)} />
    </main>
  );
}
