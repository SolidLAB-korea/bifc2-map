import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import FavoriteButton from "../components/FavoriteButton";
import MapView from "../components/MapView";
import { StoreFacts } from "../components/StoreBottomSheet";
import { floors, stores as defaultStores } from "../data/stores";
import type { Floor, Store } from "../types/store";
import { getStoredStores } from "../utils/storage";

export default function StoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [storeItems, setStoreItems] = useState<Store[]>(() => getStoredStores(defaultStores));
  const store = storeItems.find((item) => item.id === id);

  useEffect(() => {
    const syncStores = () => setStoreItems(getStoredStores(defaultStores));
    window.addEventListener("stores-updated", syncStores);
    window.addEventListener("storage", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
      window.removeEventListener("storage", syncStores);
    };
  }, []);

  if (!store || !floors.includes(store.floor as Floor)) {
    return <Navigate to="/" replace />;
  }

  const sameFloorStores = storeItems.filter((item) => item.floor === store.floor && floors.includes(item.floor as Floor));

  const handleStoreSelect = (selectedStore: Store) => {
    navigate(`/stores/${selectedStore.id}`);
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        {store.image && (
          <img
            src={store.image}
            alt={`${store.name} 대표 이미지`}
            className="mb-4 h-44 w-full rounded-lg object-cover"
          />
        )}
        <p className="text-sm font-black text-accent">{store.category}</p>
        <h2 className="mt-1 break-keep text-3xl font-black text-primary">{store.name}</h2>
        <p className="mt-4 rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{store.description}</p>

        <div className="mt-4">
          <StoreFacts store={store} />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <FavoriteButton storeId={store.id} />
          <Link
            to={`/?floor=${store.floor}&store=${store.id}`}
            className="flex min-h-12 items-center justify-center rounded-lg bg-accent px-4 text-sm font-black text-white"
            aria-label={`${store.name} 지도에서 위치 보기`}
          >
            지도에서 위치 보기
          </Link>
        </div>
      </section>

      <MapView
        floor={store.floor as Floor}
        stores={sameFloorStores}
        selectedStoreId={store.id}
        highlightedStoreIds={[store.id]}
        onStoreSelect={handleStoreSelect}
      />
    </main>
  );
}
