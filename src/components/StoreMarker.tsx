import type { Store } from "../types/store";

type StoreMarkerProps = {
  store: Store;
  isSelected: boolean;
  isDimmed?: boolean;
  onSelect: (store: Store) => void;
};

const markerLabels: Record<string, string> = {
  음식점: "식",
  카페: "카",
  편의점: "편",
  "병원/약국": "의",
  "금융/ATM": "금",
  생활편의: "편",
  화장실: "WC",
  엘리베이터: "EV",
  주차장: "P"
};

export default function StoreMarker({ store, isSelected, isDimmed = false, onSelect }: StoreMarkerProps) {
  const labelPositionClass = store.y > 76 ? "bottom-10" : "top-10";

  return (
    <button
      type="button"
      onClick={() => onSelect(store)}
      className={`group absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white text-[11px] font-black text-white shadow-lg transition ${
        isSelected ? "scale-[1.15] bg-accent ring-[3px] ring-amber-300" : "bg-primary"
      } ${isDimmed ? "opacity-30" : "opacity-100"}`}
      style={{ left: `${store.x}%`, top: `${store.y}%` }}
      aria-label={`${store.name} 상세 정보 보기`}
      title={store.name}
    >
      {markerLabels[store.category] ?? "·"}
      <span
        className={`pointer-events-none absolute ${labelPositionClass} hidden max-w-28 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-800 shadow md:group-hover:block md:group-focus-visible:block ${
          isSelected ? "md:block" : ""
        }`}
      >
        {store.name}
      </span>
    </button>
  );
}
