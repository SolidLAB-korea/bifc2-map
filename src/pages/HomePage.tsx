import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CategoryFilter from "../components/CategoryFilter";
import FavoriteButton from "../components/FavoriteButton";
import FloorSelector from "../components/FloorSelector";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import StoreBottomSheet, { StoreFacts } from "../components/StoreBottomSheet";
import StoreList from "../components/StoreList";
import StoreManager from "../components/StoreManager";
import { categories, floors, stores as defaultStores } from "../data/stores";
import type { Floor, Store } from "../types/store";
import { getStoredStores, resetStoredStores, setStoredStores } from "../utils/storage";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedFloor, setSelectedFloor] = useState<Floor>("1F");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeItems, setStoreItems] = useState<Store[]>(() => getStoredStores(defaultStores));

  const saveStores = (nextStores: Store[]) => {
    setStoreItems(nextStores);
    setStoredStores(nextStores);
  };

  useEffect(() => {
    const syncStores = () => setStoreItems(getStoredStores(defaultStores));
    window.addEventListener("stores-updated", syncStores);
    window.addEventListener("storage", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
      window.removeEventListener("storage", syncStores);
    };
  }, []);

  useEffect(() => {
    const floorParam = searchParams.get("floor");
    const storeParam = searchParams.get("store");
    const store = storeItems.find((item) => item.id === storeParam);

    if (store) {
      setSelectedFloor(store.floor as Floor);
      setSelectedStore(store);
      return;
    }

    if (floors.includes(floorParam as Floor)) {
      setSelectedFloor(floorParam as Floor);
    }
  }, [searchParams, storeItems]);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleStores = storeItems.filter((store) => floors.includes(store.floor as Floor));

    return visibleStores.filter((store) => {
      const categoryMatched = selectedCategory === "전체" || store.category === selectedCategory;
      const floorMatched = store.floor === selectedFloor;
      const searchTarget = [store.name, store.category, store.floor, store.location, ...store.keywords]
        .join(" ")
        .toLowerCase();
      const queryMatched = normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);

      return categoryMatched && floorMatched && queryMatched;
    });
  }, [query, selectedCategory, selectedFloor, storeItems]);

  const visibleStoreItems = storeItems.filter((store) => floors.includes(store.floor as Floor));
  const floorStores = visibleStoreItems.filter((store) => store.floor === selectedFloor);

  const handleStoreSelect = (store: Store) => {
    setSelectedFloor(store.floor as Floor);
    setSelectedStore(store);
  };

  const handleCreateStore = (store: Store) => {
    saveStores([...storeItems, store]);
  };

  const handleUpdateStore = (store: Store) => {
    saveStores(storeItems.map((item) => (item.id === store.id ? store : item)));
    if (selectedStore?.id === store.id) {
      setSelectedStore(store);
    }
  };

  const handleDeleteStore = (storeId: string) => {
    saveStores(storeItems.filter((store) => store.id !== storeId));
    if (selectedStore?.id === storeId) {
      setSelectedStore(null);
    }
  };

  const handleResetStores = () => {
    setStoreItems(resetStoredStores(defaultStores));
    setSelectedStore(null);
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel" aria-label="상가 검색 및 층 선택">
        <h2 className="mb-3 text-xl font-black text-primary">BIFC2 상가 안내지도</h2>
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-4">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>
        <div className="mt-4">
          <FloorSelector floors={floors} selectedFloor={selectedFloor} onSelect={setSelectedFloor} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="grid gap-4">
          <MapView
            floor={selectedFloor}
            stores={floorStores}
            selectedStoreId={selectedStore?.id}
            highlightedStoreIds={filteredStores.map((store) => store.id)}
            onStoreSelect={handleStoreSelect}
          />

          {selectedStore && (
            <aside className="hidden rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:block" aria-label="선택한 매장 상세 정보">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-accent">{selectedStore.category}</p>
                  <h2 className="break-keep text-2xl font-black text-primary">{selectedStore.name}</h2>
                </div>
                <FavoriteButton storeId={selectedStore.id} compact />
              </div>
              <StoreFacts store={selectedStore} />
              <p className="mt-4 rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{selectedStore.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFloor(selectedStore.floor as Floor)}
                  className="min-h-12 rounded-lg bg-primary px-4 text-sm font-black text-white"
                  aria-label="지도에서 위치 보기"
                >
                  지도에서 위치 보기
                </button>
                <Link
                  to={`/stores/${selectedStore.id}`}
                  className="flex min-h-12 items-center justify-center rounded-lg bg-accent px-4 text-sm font-black text-white"
                  aria-label={`${selectedStore.name} 상세 페이지로 이동`}
                >
                  상세 페이지
                </Link>
              </div>
            </aside>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel lg:sticky lg:top-24" aria-label="검색 결과">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-primary">검색 결과</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-accent">{filteredStores.length}곳</span>
          </div>
          <StoreList stores={filteredStores} selectedStoreId={selectedStore?.id} onStoreSelect={handleStoreSelect} />
        </section>
      </div>

      <section>
        <StoreManager
          stores={visibleStoreItems}
          onCreate={handleCreateStore}
          onUpdate={handleUpdateStore}
          onDelete={handleDeleteStore}
          onReset={handleResetStores}
          onSelectStore={handleStoreSelect}
        />
      </section>

      <StoreBottomSheet store={selectedStore} onClose={() => setSelectedStore(null)} />
    </main>
  );
}
