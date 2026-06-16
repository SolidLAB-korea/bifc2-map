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
import {
  createStore,
  deleteStore,
  isSupabaseConfigured,
  loadStores,
  resetStores,
  updateStore
} from "../utils/storeRepository";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedFloor, setSelectedFloor] = useState<Floor>("1F");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeItems, setStoreItems] = useState<Store[]>(defaultStores);
  const [storeError, setStoreError] = useState("");
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  useEffect(() => {
    const syncStores = () => {
      setIsStoreLoading(true);
      loadStores(defaultStores)
        .then((nextStores) => {
          setStoreItems(nextStores);
          setStoreError("");
        })
        .catch((error: Error) => {
          setStoreItems(defaultStores);
          setStoreError(error.message);
        })
        .finally(() => setIsStoreLoading(false));
    };

    syncStores();
    window.addEventListener("stores-updated", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
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

  const handleCreateStore = async (store: Store) => {
    try {
      const nextStores = await createStore(store, storeItems);
      setStoreItems(nextStores);
      setStoreError("");
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "매장 추가에 실패했습니다.");
    }
  };

  const handleUpdateStore = async (store: Store) => {
    try {
      const nextStores = await updateStore(store, storeItems);
      setStoreItems(nextStores);
      if (selectedStore?.id === store.id) {
        setSelectedStore(store);
      }
      setStoreError("");
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "매장 수정에 실패했습니다.");
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      const nextStores = await deleteStore(storeId, storeItems);
      setStoreItems(nextStores);
      if (selectedStore?.id === storeId) {
        setSelectedStore(null);
      }
      setStoreError("");
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "매장 삭제에 실패했습니다.");
    }
  };

  const handleResetStores = async () => {
    try {
      const nextStores = await resetStores(defaultStores);
      setStoreItems(nextStores);
      setSelectedStore(null);
      setStoreError("");
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "기본 데이터 복원에 실패했습니다.");
    }
  };

  return (
    <main className="app-container grid gap-2 py-2 sm:gap-4 sm:py-4">
      <section className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-panel sm:p-4" aria-label="스퀘어가든 검색 및 층 선택">
        <h2 className="mb-2 text-base font-black text-primary sm:mb-3 sm:text-xl">BIFC2 스퀘어가든 안내지도</h2>
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-2 sm:mt-4">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>
        <div className="mt-2 sm:mt-4">
          <FloorSelector floors={floors} selectedFloor={selectedFloor} onSelect={setSelectedFloor} />
        </div>
      </section>

      <div className="grid gap-2 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="grid gap-2 sm:gap-4">
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
        <div className="mb-3 grid gap-2">
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">
            데이터 저장소: {isSupabaseConfigured ? "Supabase DB" : "브라우저 localStorage"}
            {isStoreLoading ? " · 불러오는 중" : ""}
          </p>
          {storeError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {storeError}
            </p>
          )}
        </div>
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
