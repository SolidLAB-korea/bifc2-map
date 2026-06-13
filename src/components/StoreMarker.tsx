import type { Store } from "../types/store";

type StoreMarkerProps = {
  store: Store;
  isSelected: boolean;
  isDimmed?: boolean;
  onSelect: (store: Store) => void;
};

const categoryIconTypes: Record<string, IconType> = {
  음식점: "food",
  한식: "food",
  중식: "food",
  일식: "food",
  양식: "food",
  패스트푸드: "food",
  분식: "food",
  카페: "coffee",
  디저트: "coffee",
  편의점: "store",
  "병원/약국": "medical",
  병원: "medical",
  약국: "pharmacy",
  "금융/ATM": "bank",
  은행: "bank",
  ATM: "bank",
  생활편의: "service",
  "미용/뷰티": "service",
  "회의/업무": "briefcase",
  "안내/관리": "info",
  화장실: "restroom",
  엘리베이터: "elevator",
  에스컬레이터: "elevator",
  계단: "elevator",
  수유실: "service",
  주차장: "parking"
};

type IconType =
  | "food"
  | "coffee"
  | "store"
  | "medical"
  | "pharmacy"
  | "bank"
  | "service"
  | "briefcase"
  | "info"
  | "restroom"
  | "elevator"
  | "parking";

const markerColors: Record<IconType, string> = {
  food: "bg-rose-600",
  coffee: "bg-amber-700",
  store: "bg-emerald-600",
  medical: "bg-red-600",
  pharmacy: "bg-teal-600",
  bank: "bg-blue-700",
  service: "bg-slate-600",
  briefcase: "bg-indigo-700",
  info: "bg-sky-700",
  restroom: "bg-cyan-700",
  elevator: "bg-violet-700",
  parking: "bg-primary"
};

const iconPaths: Record<IconType, string> = {
  food:
    '<path d="M7 3v8"/><path d="M4 3v4a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M16 3v18"/><path d="M16 3c3 2 4 5 2 8h-2"/>',
  coffee:
    '<path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z"/><path d="M16 9h1a3 3 0 0 1 0 6h-1"/><path d="M7 3v2"/><path d="M11 3v2"/>',
  store:
    '<path d="M4 10h16l-2-5H6l-2 5Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/>',
  medical:
    '<path d="M12 3a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7Z"/><path d="M12 7v6"/><path d="M9 10h6"/>',
  pharmacy:
    '<path d="M8 4h8v4H8z"/><path d="M6 8h12v12H6z"/><path d="M12 11v6"/><path d="M9 14h6"/>',
  bank:
    '<path d="M4 10h16"/><path d="M6 10v8"/><path d="M10 10v8"/><path d="M14 10v8"/><path d="M18 10v8"/><path d="M3 20h18"/><path d="M12 4 4 8h16l-8-4Z"/>',
  service:
    '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19 12h2"/><path d="M3 12h2"/><path d="M12 3v2"/><path d="M12 19v2"/><path d="m18 6-1.5 1.5"/><path d="m7.5 16.5-1.5 1.5"/><path d="m6 6 1.5 1.5"/><path d="m16.5 16.5 1.5 1.5"/>',
  briefcase:
    '<path d="M9 7V5h6v2"/><path d="M4 7h16v12H4z"/><path d="M4 12h16"/><path d="M10 12v2h4v-2"/>',
  info:
    '<circle cx="12" cy="12" r="9"/><path d="M12 10v7"/><path d="M12 7h.01"/>',
  restroom:
    '<path d="M8 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M6 10h4l1 10H5l1-10Z"/><path d="M16 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M14 10h4l1 10h-6l1-10Z"/>',
  elevator:
    '<path d="M5 4h14v16H5z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="m10 16 2 2 2-2"/>',
  parking:
    '<path d="M7 20V4h6a5 5 0 0 1 0 10H7"/><path d="M7 14h6"/>'
};

function createIconDataUri(iconType: IconType) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${iconPaths[iconType]}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function StoreMarker({ store, isSelected, isDimmed = false, onSelect }: StoreMarkerProps) {
  const labelPositionClass = store.y > 76 ? "bottom-10" : "top-10";
  const iconType = categoryIconTypes[store.category] ?? "service";

  return (
    <button
      type="button"
      onClick={() => onSelect(store)}
      className={`group absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white text-[11px] font-black text-white shadow-lg transition ${
        isSelected ? "scale-[1.15] bg-accent ring-[3px] ring-amber-300" : markerColors[iconType]
      } ${isDimmed ? "opacity-30" : "opacity-100"}`}
      style={{ left: `${store.x}%`, top: `${store.y}%` }}
      aria-label={`${store.name} 상세 정보 보기`}
      title={store.name}
    >
      <img className="h-[18px] w-[18px]" src={createIconDataUri(iconType)} alt="" aria-hidden="true" />
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
