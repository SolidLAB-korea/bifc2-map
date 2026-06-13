import { Link } from "react-router-dom";
import type { Store } from "../types/store";
import FavoriteButton from "./FavoriteButton";

type StoreBottomSheetProps = {
  store: Store | null;
  onClose: () => void;
};

export default function StoreBottomSheet({ store, onClose }: StoreBottomSheetProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:hidden" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button className="absolute inset-0 bg-slate-950/40" type="button" onClick={onClose} aria-label="매장 상세 정보 닫기" />
      <article className="safe-bottom relative max-h-[86vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-sheet">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-accent">{store.category}</p>
            <h2 id="sheet-title" className="break-keep text-2xl font-black text-primary">
              {store.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-full bg-slate-100 text-2xl font-bold text-slate-700"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <StoreFacts store={store} />

        <p className="mt-4 rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{store.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <FavoriteButton storeId={store.id} />
          <Link
            to={`/stores/${store.id}`}
            className="flex min-h-12 items-center justify-center rounded-lg bg-accent px-4 text-sm font-black text-white"
            aria-label={`${store.name} 상세 페이지로 이동`}
          >
            상세 페이지
          </Link>
        </div>
      </article>
    </div>
  );
}

export function StoreFacts({ store }: { store: Store }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      <div className="rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">층수</dt>
        <dd className="mt-1 font-black text-slate-900">{store.floor}</dd>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">영업시간</dt>
        <dd className="mt-1 font-black text-slate-900">{store.hours}</dd>
      </div>
      <div className="col-span-2 rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">위치</dt>
        <dd className="mt-1 font-black leading-5 text-slate-900">{store.location}</dd>
      </div>
      <div className="col-span-2 rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">전화번호</dt>
        <dd className="mt-1 font-black leading-5 text-slate-900">{store.phone}</dd>
      </div>
    </dl>
  );
}
