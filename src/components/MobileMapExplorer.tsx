import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { categories, floors } from "../data/stores";
import { useI18n } from "../i18n";
import type { Floor, Store } from "../types/store";
import type { RoutePoint } from "../utils/indoorRoute";
import { floorAspectRatioMap, floorImageMap } from "./MapView";
import RouteOverlay from "./RouteOverlay";
import StoreMarker from "./StoreMarker";

type MobileMapExplorerProps = {
  floor: Floor;
  stores: Store[];
  results: Store[];
  selectedStore: Store | null;
  query: string;
  selectedCategory: string;
  routePoints?: RoutePoint[];
  routeInstruction?: string;
  isLoading: boolean;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onFloorChange: (floor: Floor) => void;
  onStoreSelect: (store: Store) => void;
  onStoreClear: () => void;
};

type SheetState = "peek" | "list";

export default function MobileMapExplorer({
  floor,
  stores,
  results,
  selectedStore,
  query,
  selectedCategory,
  routePoints,
  routeInstruction,
  isLoading,
  onQueryChange,
  onCategoryChange,
  onFloorChange,
  onStoreSelect,
  onStoreClear
}: MobileMapExplorerProps) {
  const { categoryLabel, language, storeText, t } = useI18n();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sheetState, setSheetState] = useState<SheetState>("peek");
  const [imageFailed, setImageFailed] = useState(false);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    setImageFailed(false);
  }, [floor]);

  const selectStore = (store: Store) => {
    onStoreSelect(store);
    setSheetState("peek");
  };

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const startY = dragStartY.current;
    dragStartY.current = null;
    if (startY === null) return;

    const distance = event.clientY - startY;
    if (distance < -36) setSheetState("list");
    if (distance > 36) setSheetState("peek");
  };

  return (
    <section className="relative h-[calc(100dvh-8.5rem)] min-h-[30rem] overflow-hidden bg-slate-100 sm:hidden" aria-label={`${floor} ${t("map")}`}>
      <TransformWrapper
        key={floor}
        initialScale={1}
        minScale={0.8}
        maxScale={3}
        centerOnInit
        limitToBounds={false}
        panning={{ velocityDisabled: true }}
        wheel={{ step: 0.12 }}
      >
        {({ resetTransform, zoomIn, zoomOut }) => (
          <>
            <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-auto !w-full">
              <div className="relative w-screen bg-white" style={{ aspectRatio: floorAspectRatioMap[floor] }}>
                {!imageFailed ? (
                  <img
                    src={floorImageMap[floor]}
                    alt={`${floor} ${t("floorMap")}`}
                    className="absolute inset-0 h-full w-full object-contain"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-slate-50 text-sm font-bold text-slate-500">{floor} map</div>
                )}
                {routePoints && <RouteOverlay points={routePoints} />}
                {stores.map((store) => (
                  <StoreMarker
                    key={store.id}
                    store={store}
                    isSelected={store.id === selectedStore?.id}
                    isDimmed={results.length > 0 && !results.some((result) => result.id === store.id)}
                    onSelect={selectStore}
                  />
                ))}
              </div>
            </TransformComponent>

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3">
              <div className="pointer-events-auto flex gap-2">
                {isSearchOpen ? (
                  <div className="flex-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="flex items-center gap-2">
                      <label className="flex min-h-10 flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3">
                        <span className="text-base font-black text-accent" aria-hidden="true">⌕</span>
                        <input
                          autoFocus
                          value={query}
                          onChange={(event) => onQueryChange(event.target.value)}
                          placeholder={t("searchPlaceholder")}
                          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                          type="search"
                          aria-label={t("searchAria")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg font-black text-slate-700"
                        aria-label={t("close")}
                      >
                        ×
                      </button>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(event) => onCategoryChange(event.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800"
                      aria-label={t("categorySelect")}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {categoryLabel(category)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-500 shadow-xl"
                    aria-label={t("searchAria")}
                  >
                    <span className="text-lg text-accent" aria-hidden="true">⌕</span>
                    {t("searchPlaceholder")}
                  </button>
                )}
              </div>
            </div>

            <div className="absolute left-3 top-[4.5rem] z-20 grid gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xl" aria-label={t("floorSelect")}>
              {floors.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onFloorChange(item)}
                  className={`h-10 min-w-12 rounded-lg px-2 text-xs font-black ${
                    item === floor ? "bg-primary text-white" : "text-primary"
                  }`}
                  aria-label={`${item} ${t("floorMap")}`}
                  aria-pressed={item === floor}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="absolute right-3 top-[4.5rem] z-20 grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <button type="button" onClick={() => zoomIn()} className="h-10 w-10 text-xl font-black text-primary" aria-label="Zoom in">
                +
              </button>
              <span className="mx-2 h-px bg-slate-200" />
              <button type="button" onClick={() => zoomOut()} className="h-10 w-10 text-xl font-black text-primary" aria-label="Zoom out">
                −
              </button>
              <span className="mx-2 h-px bg-slate-200" />
              <button type="button" onClick={() => resetTransform()} className="h-10 w-10 text-sm font-black text-primary" aria-label="Reset map view">
                ⊙
              </button>
            </div>
          </>
        )}
      </TransformWrapper>

      <section
        className={`absolute inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-slate-200 bg-white shadow-sheet transition-[height] duration-200 ${
          sheetState === "list" ? "h-[58%]" : "h-auto"
        }`}
        aria-label={t("searchResults")}
      >
        <button
          type="button"
          onPointerDown={handleSheetPointerDown}
          onPointerUp={handleSheetPointerUp}
          onClick={() => setSheetState((state) => (state === "peek" ? "list" : "peek"))}
          className="flex w-full touch-none flex-col items-center px-4 pb-2 pt-2"
          aria-expanded={sheetState === "list"}
        >
          <span className="h-1 w-10 rounded-full bg-slate-300" />
          <span className="mt-2 flex w-full items-center justify-between text-left">
            <strong className="text-sm font-black text-primary">{selectedStore ? storeText(selectedStore, "name") : `${floor} ${t("searchResults")}`}</strong>
            <span className="text-xs font-bold text-accent">{isLoading ? "..." : `${results.length} ${t("placesCount")}`}</span>
          </span>
        </button>

        {sheetState === "peek" && selectedStore && (
          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
            <p className="text-xs font-black text-accent">{categoryLabel(selectedStore.category)} · {selectedStore.floor}</p>
            <p className="mt-1 text-sm font-bold text-slate-700">{storeText(selectedStore, "location")}</p>
            {routeInstruction && <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-primary">{routeInstruction}</p>}
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button type="button" onClick={onStoreClear} className="min-h-10 rounded-lg border border-slate-200 text-sm font-black text-slate-700">
                {t("close")}
              </button>
              <Link
                to={`/stores/${selectedStore.id}`}
                className="flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-black text-white"
              >
                {t("storeInfo")}
              </Link>
            </div>
          </div>
        )}

        {sheetState === "list" && (
          <div className="h-[calc(100%-4.25rem)] overflow-y-auto border-t border-slate-100 px-3 pb-4 pt-2">
            {results.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm font-bold text-slate-500">{language === "en" ? "No results found." : "검색 결과가 없습니다."}</p>
            ) : (
              <div className="grid gap-2">
                {results.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => selectStore(store)}
                    className={`rounded-lg border p-3 text-left ${
                      selectedStore?.id === store.id ? "border-accent bg-blue-50" : "border-slate-200"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <strong className="min-w-0 break-keep text-sm leading-snug text-slate-900">{storeText(store, "name")}</strong>
                      <span className="shrink-0 rounded-full bg-primary px-2 py-1 text-[11px] font-black text-white">{store.floor}</span>
                    </span>
                    <span className="mt-1 block text-xs font-bold text-accent">{categoryLabel(store.category)}</span>
                    <span className="mt-1 block text-xs text-slate-600">{storeText(store, "location")}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
