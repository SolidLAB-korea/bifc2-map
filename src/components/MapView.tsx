import { useState } from "react";
import type { Floor, Store } from "../types/store";
import StoreMarker from "./StoreMarker";

type MapViewProps = {
  floor: Floor;
  stores: Store[];
  selectedStoreId?: string;
  highlightedStoreIds?: string[];
  onStoreSelect: (store: Store) => void;
};

const floorImageMap: Record<Floor, string> = {
  B1: `${import.meta.env.BASE_URL}maps/floor-b1.png`,
  "1F": `${import.meta.env.BASE_URL}maps/floor-1f.png`,
  "2F": `${import.meta.env.BASE_URL}maps/floor-2f.png`,
  "3F": `${import.meta.env.BASE_URL}maps/floor-3f.png`
};

const floorAspectRatioMap: Record<Floor, string> = {
  B1: "16 / 9",
  "1F": "811 / 752",
  "2F": "887 / 730",
  "3F": "840 / 741"
};

export default function MapView({
  floor,
  stores,
  selectedStoreId,
  highlightedStoreIds,
  onStoreSelect
}: MapViewProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const imageSrc = floorImageMap[floor];
  const showPlaceholder = failedImages[floor];
  const highlightedSet = new Set(highlightedStoreIds);
  const shouldDimMarkers = highlightedStoreIds !== undefined;

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
            {stores.map((store) => (
              <StoreMarker
                key={store.id}
                store={store}
                isSelected={store.id === selectedStoreId}
                isDimmed={shouldDimMarkers && !highlightedSet.has(store.id)}
                onSelect={onStoreSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
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
