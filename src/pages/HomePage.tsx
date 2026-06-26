import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CategoryFilter from "../components/CategoryFilter";
import CorridorManager from "../components/CorridorManager";
import FavoriteButton from "../components/FavoriteButton";
import FloorSelector from "../components/FloorSelector";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import StoreBottomSheet, { StoreFacts } from "../components/StoreBottomSheet";
import StoreList from "../components/StoreList";
import StoreManager from "../components/StoreManager";
import { categories, floors, stores as defaultStores } from "../data/stores";
import { useI18n } from "../i18n";
import type { Floor, Store } from "../types/store";
import type { RoutePoint } from "../utils/indoorRoute";
import { createIndoorRoute } from "../utils/indoorRoute";
import { isAdminSignedIn } from "../utils/storage";
import { createStore, deleteStore, loadStores, resetStores, updateStore } from "../utils/storeRepository";

export default function HomePage() {
  const { categoryLabel, language, storeText, t } = useI18n();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedFloor, setSelectedFloor] = useState<Floor>("1F");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showCorridors, setShowCorridors] = useState(false);
  const [pickedCorridorPoint, setPickedCorridorPoint] = useState<RoutePoint | null>(null);
  const [routeGraphVersion, setRouteGraphVersion] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => isAdminSignedIn());
  const [storeItems, setStoreItems] = useState<Store[]>(defaultStores);
  const [storeError, setStoreError] = useState("");

  useEffect(() => {
    const syncStores = () => {
      loadStores(defaultStores)
        .then((nextStores) => {
          setStoreItems(nextStores);
          setStoreError("");
        })
        .catch((error: Error) => {
          setStoreItems(defaultStores);
          setStoreError(error.message);
        });
    };

    syncStores();
    window.addEventListener("stores-updated", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
    };
  }, []);

  useEffect(() => {
    const syncAdminState = () => setIsAdmin(isAdminSignedIn());
    const syncRouteGraph = () => setRouteGraphVersion((version) => version + 1);
    window.addEventListener("admin-session-updated", syncAdminState);
    window.addEventListener("route-graph-updated", syncRouteGraph);
    return () => {
      window.removeEventListener("admin-session-updated", syncAdminState);
      window.removeEventListener("route-graph-updated", syncRouteGraph);
    };
  }, []);

  useEffect(() => {
    const floorParam = searchParams.get("floor");
    const storeParam = searchParams.get("store");
    const store = storeItems.find((item) => item.id === storeParam);

    if (store) {
      setSelectedFloor(store.floor as Floor);
      setSelectedStore(store);
      setIsSheetOpen(true);
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
      const searchTarget = [
        store.name,
        store.translations?.en?.name,
        store.category,
        categoryLabel(store.category),
        store.floor,
        store.location,
        store.translations?.en?.location,
        ...store.keywords,
        ...(store.translations?.en?.keywords ?? [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const queryMatched = normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);

      return categoryMatched && floorMatched && queryMatched;
    });
  }, [query, selectedCategory, selectedFloor, storeItems]);

  const visibleStoreItems = storeItems.filter((store) => floors.includes(store.floor as Floor));
  const floorStores = visibleStoreItems.filter((store) => store.floor === selectedFloor);
  const selectedRoute = selectedStore ? createIndoorRoute(selectedStore, visibleStoreItems) : null;
  const routePoints = selectedRoute?.floor === selectedFloor ? selectedRoute.points : undefined;
  const routeStartLabel =
    selectedRoute?.floor === selectedFloor ? (language === "en" ? selectedRoute.startLabelEn : selectedRoute.startLabelKo) : undefined;

  const handleStoreSelect = (store: Store) => {
    setSelectedFloor(store.floor as Floor);
    setSelectedStore(store);
    setIsSheetOpen(true);
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
        setIsSheetOpen(false);
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
      setIsSheetOpen(false);
      setStoreError("");
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "기본 데이터 복원에 실패했습니다.");
    }
  };

  return (
    <main className="app-container grid min-w-0 gap-2 py-2 sm:gap-4 sm:py-4">
      <section
        className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-2.5 shadow-panel sm:p-4"
        aria-label={t("searchAria")}
      >
        <h2 className="mb-2 text-base font-black text-primary sm:mb-3 sm:text-xl">BIFC2 {t("title")}</h2>
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-2 sm:mt-4">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>
        <div className="mt-2 sm:mt-4">
          <FloorSelector floors={floors} selectedFloor={selectedFloor} onSelect={setSelectedFloor} />
        </div>
      </section>

      <div className="grid min-w-0 gap-2 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="grid min-w-0 gap-2 sm:gap-4">
          {isAdmin && (
            <>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-panel">
                <div>
                  <p className="text-sm font-black text-primary">통로 설정</p>
                  <p className="text-xs font-bold text-slate-500">관리자 전용 통로망 편집 모드입니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCorridors((previous) => !previous)}
                  className={`min-h-10 rounded-lg px-4 text-sm font-black ${
                    showCorridors ? "bg-primary text-white" : "border border-slate-200 bg-white text-primary"
                  }`}
                  aria-pressed={showCorridors}
                >
                  {showCorridors ? "끄기" : "보기"}
                </button>
              </div>

              {showCorridors && (
                <CorridorManager
                  floor={selectedFloor}
                  pickedPoint={pickedCorridorPoint}
                  onSaved={() => setRouteGraphVersion((version) => version + 1)}
                />
              )}
            </>
          )}

          <MapView
            key={`${selectedFloor}-${routeGraphVersion}`}
            floor={selectedFloor}
            stores={floorStores}
            selectedStoreId={selectedStore?.id}
            highlightedStoreIds={filteredStores.map((store) => store.id)}
            routePoints={routePoints}
            routeStartLabel={routeStartLabel}
            showCorridors={isAdmin && showCorridors}
            onCorridorPointPick={setPickedCorridorPoint}
            onStoreSelect={handleStoreSelect}
          />

          {selectedStore && (
            <aside className="hidden rounded-lg border border-slate-200 bg-white p-5 shadow-panel lg:block" aria-label={t("selectedStore")}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-accent">{categoryLabel(selectedStore.category)}</p>
                  <h2 className="break-keep text-2xl font-black text-primary">{storeText(selectedStore, "name")}</h2>
                </div>
                <FavoriteButton storeId={selectedStore.id} compact />
              </div>
              <StoreFacts store={selectedStore} />
              {selectedRoute && (
                <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-bold leading-6 text-primary">
                  {language === "en" ? selectedRoute.instructionEn : selectedRoute.instructionKo}
                </p>
              )}
              <p className="mt-4 rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{storeText(selectedStore, "description")}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFloor(selectedStore.floor as Floor)}
                  className="min-h-12 rounded-lg bg-primary px-4 text-sm font-black text-white"
                  aria-label={t("viewOnMap")}
                >
                  {t("viewOnMap")}
                </button>
                <Link
                  to={`/stores/${selectedStore.id}`}
                  className="flex min-h-12 items-center justify-center rounded-lg bg-accent px-4 text-sm font-black text-white"
                  aria-label={`${storeText(selectedStore, "name")} ${t("storeInfo")}`}
                >
                  {t("storeInfo")}
                </Link>
              </div>
            </aside>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel lg:sticky lg:top-24" aria-label={t("searchResults")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-primary">{t("searchResults")}</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-accent">
              {filteredStores.length} {t("placesCount")}
            </span>
          </div>
          <StoreList stores={filteredStores} selectedStoreId={selectedStore?.id} onStoreSelect={handleStoreSelect} />
        </section>
      </div>

      <section className="grid gap-3 border-t border-slate-200 pt-3 sm:pt-4">
        {storeError && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {storeError}
          </p>
        )}
        <StoreManager
          stores={visibleStoreItems}
          onCreate={handleCreateStore}
          onUpdate={handleUpdateStore}
          onDelete={handleDeleteStore}
          onReset={handleResetStores}
          onSelectStore={handleStoreSelect}
        />
      </section>

      <StoreBottomSheet
        store={isSheetOpen ? selectedStore : null}
        routeInstruction={
          selectedRoute ? (language === "en" ? selectedRoute.instructionEn : selectedRoute.instructionKo) : undefined
        }
        onClose={() => setIsSheetOpen(false)}
      />
    </main>
  );
}
