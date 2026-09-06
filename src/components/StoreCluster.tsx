import type { Store } from "../types/store";
import { useI18n } from "../i18n";

type StoreClusterProps = {
  stores: Store[];
  x: number;
  y: number;
  isExpanded: boolean;
  isMobile?: boolean;
  onToggle: () => void;
  onSelect: (store: Store) => void;
};

export default function StoreCluster({ stores, x, y, isExpanded, isMobile = false, onToggle, onSelect }: StoreClusterProps) {
  const { storeText } = useI18n();

  if (isExpanded) {
    return (
      <div
        className={`absolute z-30 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl ${
          isMobile ? "inset-x-2 bottom-2" : "w-52 -translate-x-1/2 -translate-y-full"
        }`}
        style={isMobile ? undefined : { left: `${x}%`, top: `${y}%` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-xs font-black text-primary">겹친 매장 {stores.length}곳</span>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600"
            aria-label="겹친 매장 목록 닫기"
          >
            ×
          </button>
        </div>
        <div className={isMobile ? "flex gap-1 overflow-x-auto pb-0.5" : "grid gap-1"}>
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              onClick={() => onSelect(store)}
              className={`min-h-10 truncate rounded-md px-2 text-left text-xs font-bold text-slate-800 hover:bg-blue-50 ${
                isMobile ? "w-36 shrink-0" : ""
              }`}
              title={storeText(store, "name")}
            >
              {storeText(store, "name")} <span className="text-accent">· {store.floor}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-primary text-xs font-black text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={`겹친 매장 ${stores.length}곳 보기`}
      title={`겹친 매장 ${stores.length}곳`}
    >
      {stores.length}
    </button>
  );
}
