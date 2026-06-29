import { useI18n } from "../i18n";
import { useMobileDoubleTap } from "../hooks/useMobileDoubleTap";
import type { Store } from "../types/store";

type StoreListProps = {
  stores: Store[];
  selectedStoreId?: string;
  onStoreSelect: (store: Store) => void;
  emptyMessage?: string;
};

export default function StoreList({ stores, selectedStoreId, onStoreSelect, emptyMessage }: StoreListProps) {
  const { categoryLabel, storeText, t } = useI18n();
  const handleMobileDoubleTap = useMobileDoubleTap();

  if (stores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm font-bold text-slate-500">
        {emptyMessage ?? t("noResults")}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          onClick={(event) => handleMobileDoubleTap(store.id, () => onStoreSelect(store), event.detail)}
          className={`rounded-lg border bg-white p-4 text-left shadow-sm ${
            selectedStoreId === store.id ? "border-accent ring-2 ring-blue-100" : "border-slate-200"
          }`}
          aria-label={`${storeText(store, "name")} ${t("storeInfo")}`}
        >
          <span className="flex items-start justify-between gap-3">
            <strong className="min-w-0 break-keep text-base leading-snug text-slate-900">{storeText(store, "name")}</strong>
            <span className="shrink-0 rounded-full bg-primary px-2 py-1 text-xs font-black text-white">{store.floor}</span>
          </span>
          <span className="mt-2 block text-sm font-bold text-accent">{categoryLabel(store.category)}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-600">{storeText(store, "location")}</span>
        </button>
      ))}
    </div>
  );
}
