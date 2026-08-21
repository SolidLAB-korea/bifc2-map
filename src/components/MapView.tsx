import { useEffect, useMemo, useState } from "react";
import type { Floor, Store } from "../types/store";
import type { RoutePoint } from "../utils/indoorRoute";
import CorridorOverlay from "./CorridorOverlay";
import RouteOverlay from "./RouteOverlay";
import StoreMarker from "./StoreMarker";
import StoreCluster from "./StoreCluster";
import WalkableMaskEditor from "./WalkableMaskEditor";

type MapViewProps = {
  floor: Floor;
  stores: Store[];
  selectedStoreId?: string;
  highlightedStoreIds?: string[];
  routePoints?: RoutePoint[];
  routeStartLabel?: string;
  showCorridors?: boolean;
  onCorridorPointPick?: (point: RoutePoint) => void;
  onRoutePointPick?: (point: RoutePoint) => void;
  onStoreSelect: (store: Store) => void;
};

const mapAssetVersion = "20260625-floor-upgrade";

const floorImageMap: Record<Floor, string> = {
  "1F": `${import.meta.env.BASE_URL}maps/floor-1f.png?v=${mapAssetVersion}`,
  "2F": `${import.meta.env.BASE_URL}maps/floor-2f.png?v=${mapAssetVersion}`,
  "3F": `${import.meta.env.BASE_URL}maps/floor-3f.png?v=${mapAssetVersion}`
};

const floorAspectRatioMap: Record<Floor, string> = {
  "1F": "1305 / 1205",
  "2F": "1382 / 1138",
  "3F": "1335 / 1178"
};

export default function MapView({
  floor,
  stores,
  selectedStoreId,
  highlightedStoreIds,
  routePoints,
  routeStartLabel,
  showCorridors = false,
  onCorridorPointPick,
  onRoutePointPick,
  onStoreSelect
}: MapViewProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [lastMapPoint, setLastMapPoint] = useState<RoutePoint | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedClusterKey, setExpandedClusterKey] = useState<string | null>(null);
  const imageSrc = floorImageMap[floor];
  const showPlaceholder = failedImages[floor];
  const highlightedSet = new Set(highlightedStoreIds);
  const shouldDimMarkers = highlightedStoreIds !== undefined;
  const markerGroups = useMemo(() => groupStores(stores, isMobile), [isMobile, stores]);
  const storeIdsKey = stores.map((store) => store.id).join("|");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    setExpandedClusterKey(null);
  }, [floor, storeIdsKey]);

  useEffect(() => {
    if (!selectedStoreId) return;
    const selectedGroup = markerGroups.find((group) => group.some((store) => store.id === selectedStoreId));
    if (selectedGroup && selectedGroup.length > 1) {
      setExpandedClusterKey(clusterKey(selectedGroup));
    }
  }, [markerGroups, selectedStoreId]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel" aria-label={`${floor} 지도`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5 sm:px-4 sm:py-3">
        <div>
          <p className="text-[11px] font-bold leading-none text-slate-500 sm:text-xs">현재 층</p>
          <h2 className="text-lg font-black leading-tight text-primary sm:text-2xl">{floor}</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-accent sm:px-3 sm:text-sm">
          {stores.length}곳
        </span>
      </div>

      <div className="overflow-hidden">
        <div
          className="relative m-1 overflow-hidden rounded-md border border-slate-300 bg-slate-50 sm:m-3 sm:rounded-lg sm:border-2"
          style={{ aspectRatio: floorAspectRatioMap[floor] }}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const point = {
              x: Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10,
              y: Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10
            };

            if (showCorridors) {
              setLastMapPoint(point);
              onCorridorPointPick?.(point);
              return;
            }

            onRoutePointPick?.(point);
          }}
        >
          {!showPlaceholder && (
            <img
              src={imageSrc}
              alt={`${floor} 층별 지도`}
              className="absolute inset-0 h-full w-full object-contain"
              onError={() => setFailedImages((previous) => ({ ...previous, [floor]: true }))}
            />
          )}

          {showPlaceholder && <PlaceholderMap floor={floor} />}

          <div className="absolute inset-0">
            {showCorridors && <CorridorOverlay floor={floor} />}
            {routePoints && <RouteOverlay points={routePoints} startLabel={routeStartLabel} />}
            {markerGroups.map((group) => {
              const groupKey = clusterKey(group);
              const shouldCluster = isMobile && group.length > 1;

              if (shouldCluster && expandedClusterKey !== groupKey) {
                const center = getGroupCenter(group);
                return (
                  <StoreCluster
                    key={groupKey}
                    stores={group}
                    x={center.x}
                    y={center.y}
                    isExpanded={false}
                    onToggle={() => setExpandedClusterKey(groupKey)}
                    onSelect={onStoreSelect}
                  />
                );
              }

              if (shouldCluster) {
                const center = getGroupCenter(group);
                return (
                  <StoreCluster
                    key={`${groupKey}-expanded`}
                    stores={group}
                    x={center.x}
                    y={center.y}
                    isExpanded
                    onToggle={() => setExpandedClusterKey(null)}
                    onSelect={onStoreSelect}
                  />
                );
              }

              return group.map((store) => (
                <StoreMarker
                  key={store.id}
                  store={store}
                  isSelected={store.id === selectedStoreId}
                  isDimmed={shouldDimMarkers && !highlightedSet.has(store.id)}
                  onSelect={onStoreSelect}
                />
              ));
            })}
            {showCorridors && <WalkableMaskEditor floor={floor} />}
            {showCorridors && lastMapPoint && (
              <span
                className="pointer-events-none absolute z-[30] -translate-x-1/2 translate-y-3 rounded-md bg-primary px-2 py-1 text-[10px] font-black text-white shadow-panel"
                style={{ left: `${lastMapPoint.x}%`, top: `${lastMapPoint.y}%` }}
              >
                x {lastMapPoint.x}, y {lastMapPoint.y}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function groupStores(stores: Store[], shouldCluster: boolean) {
  if (!shouldCluster) return stores.map((store) => [store]);

  const groups: Store[][] = [];
  const remaining = [...stores];
  const clusterDistance = 5.5;

  while (remaining.length > 0) {
    const seed = remaining.shift();
    if (!seed) break;

    const group = [seed];
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      const candidate = remaining[index];
      if (Math.hypot(candidate.x - seed.x, candidate.y - seed.y) <= clusterDistance) {
        group.push(candidate);
        remaining.splice(index, 1);
      }
    }
    groups.push(group);
  }

  return groups;
}

function getGroupCenter(group: Store[]) {
  return group.reduce(
    (center, store) => ({ x: center.x + store.x / group.length, y: center.y + store.y / group.length }),
    { x: 0, y: 0 }
  );
}

function clusterKey(group: Store[]) {
  return group.map((store) => store.id).sort().join("|");
}

function PlaceholderMap({ floor }: { floor: Floor }) {
  return (
    <div className="absolute inset-0 bg-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.12)_1px,transparent_1px)] bg-[length:48px_48px]" />
      <div className="absolute left-[36%] top-[35%] flex h-[24%] w-[28%] items-center justify-center rounded-lg border border-accent/30 bg-blue-50 text-sm font-black text-primary">
        중앙 로비
      </div>
      <div className="absolute left-[41%] top-[14%] flex h-[15%] w-[18%] items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-600">
        엘리베이터 홀
      </div>
      <div className="absolute bottom-[5%] left-[39%] flex h-[10%] w-[22%] items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-xs font-bold text-slate-700">
        정문
      </div>
      <div className="absolute left-[8%] top-[49%] h-[7%] w-[84%] rounded-lg border border-dashed border-slate-300 bg-slate-100/80" />
      <div className="absolute left-4 top-4 rounded-lg bg-primary px-3 py-2 text-sm font-black text-white">
        {floor} placeholder map
      </div>
    </div>
  );
}
