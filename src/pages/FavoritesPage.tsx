import { useEffect, useMemo, useState } from "react";
import FavoriteButton from "../components/FavoriteButton";
import StoreBottomSheet from "../components/StoreBottomSheet";
import StoreList from "../components/StoreList";
import { floors, stores as defaultStores } from "../data/stores";
import { useI18n } from "../i18n";
import type { Floor, Store } from "../types/store";
import { getFavoriteIds } from "../utils/storage";
import { loadStores } from "../utils/storeRepository";

export default function FavoritesPage() {
  const { categoryLabel, storeText, t } = useI18n();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteIds());
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeItems, setStoreItems] = useState<Store[]>(defaultStores);

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
    const syncStores = () => {
      loadStores(defaultStores)
        .then(setStoreItems)
        .catch(() => setStoreItems(defaultStores));
    };
    syncStores();
    window.addEventListener("stores-updated", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
    };
  }, []);

  const favoriteStores = useMemo(
    () => storeItems.filter((store) => floors.includes(store.floor as Floor) && favoriteIds.includes(store.id)),
    [favoriteIds, storeItems]
  );

  return (
    <main className="app-container max-w-4xl py-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{t("savedPlaces")}</p>
            <h2 className="text-2xl font-black text-primary">{t("favoritesPage")}</h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-accent">
            {favoriteStores.length} {t("placesCount")}
          </span>
        </div>

        <StoreList stores={favoriteStores} selectedStoreId={selectedStore?.id} onStoreSelect={setSelectedStore} emptyMessage={t("noFavorites")} />
      </section>

      {selectedStore && (
        <section className="mt-4 hidden rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:block">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-accent">{categoryLabel(selectedStore.category)}</p>
              <h2 className="break-keep text-2xl font-black text-primary">{storeText(selectedStore, "name")}</h2>
            </div>
            <FavoriteButton storeId={selectedStore.id} compact />
          </div>
          <p className="rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{storeText(selectedStore, "description")}</p>
        </section>
      )}

      <StoreBottomSheet store={selectedStore} onClose={() => setSelectedStore(null)} />
    </main>
  );
}
