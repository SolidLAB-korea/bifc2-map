import type { Store } from "../types/store";

type StoreListProps = {
  stores: Store[];
  selectedStoreId?: string;
  onStoreSelect: (store: Store) => void;
  emptyMessage?: string;
};

export default function StoreList({
  stores,
  selectedStoreId,
  onStoreSelect,
  emptyMessage = "검색 결과가 없습니다."
}: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm font-bold text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          onClick={() => onStoreSelect(store)}
          className={`rounded-lg border bg-white p-4 text-left shadow-sm ${
            selectedStoreId === store.id ? "border-accent ring-2 ring-blue-100" : "border-slate-200"
          }`}
          aria-label={`${store.name} 선택`}
        >
          <span className="flex items-start justify-between gap-3">
            <strong className="min-w-0 break-keep text-base leading-snug text-slate-900">{store.name}</strong>
            <span className="shrink-0 rounded-full bg-primary px-2 py-1 text-xs font-black text-white">{store.floor}</span>
          </span>
          <span className="mt-2 block text-sm font-bold text-accent">{store.category}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-600">{store.location}</span>
        </button>
      ))}
    </div>
  );
}
