import { useI18n } from "../i18n";
import type { Store } from "../types/store";

type StoreListProps = {
  stores: Store[];
  selectedStoreId?: string;
  onStoreSelect: (store: Store) => void;
  emptyMessage?: string;
  mobileCarousel?: boolean;
};

export default function StoreList({ stores, selectedStoreId, onStoreSelect, emptyMessage, mobileCarousel = false }: StoreListProps) {
  const { categoryLabel, storeText, t } = useI18n();

  if (stores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm font-bold text-slate-500">
        {emptyMessage ?? t("noResults")}
      </div>
    );
  }

  return (
    <div
      className={
        mobileCarousel
          ? "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:snap-none sm:overflow-visible"
          : "grid gap-2"
      }
    >
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          onClick={() => onStoreSelect(store)}
          className={`${mobileCarousel ? "w-56 shrink-0 snap-start p-3 sm:w-auto sm:p-4" : "p-4"} rounded-lg border bg-white text-left shadow-sm ${
            selectedStoreId === store.id ? "border-accent ring-2 ring-blue-100" : "border-slate-200"
          }`}
          aria-label={`${storeText(store, "name")} ${t("storeInfo")}`}
        >
          <span className="flex items-start justify-between gap-3">
            <strong className="min-w-0 truncate text-sm leading-snug text-slate-900 sm:text-base">{storeText(store, "name")}</strong>
            <span className="shrink-0 rounded-full bg-primary px-2 py-1 text-xs font-black text-white">{store.floor}</span>
          </span>
          <span className="mt-1.5 block text-xs font-bold text-accent sm:mt-2 sm:text-sm">{categoryLabel(store.category)}</span>
          <span className="mt-1 block truncate text-xs leading-5 text-slate-600 sm:text-sm">{storeText(store, "location")}</span>
        </button>
      ))}
    </div>
  );
}
