import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import type { Store } from "../types/store";
import FavoriteButton from "./FavoriteButton";

type StoreBottomSheetProps = {
  store: Store | null;
  onClose: () => void;
};

export default function StoreBottomSheet({ store, onClose }: StoreBottomSheetProps) {
  const { categoryLabel, storeText, t } = useI18n();
  if (!store) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-20 z-40 lg:hidden" role="dialog" aria-modal="false" aria-labelledby="sheet-title">
      <article className="safe-bottom pointer-events-auto rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sheet backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-accent">{categoryLabel(store.category)}</p>
            <h2 id="sheet-title" className="truncate text-lg font-black leading-tight text-primary">
              {storeText(store, "name")}
            </h2>
            <p className="mt-1 truncate text-xs font-bold text-slate-600">
              {store.floor} - {storeText(store, "location")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 min-w-9 rounded-full bg-slate-100 text-xl font-bold text-slate-700"
            aria-label={t("close")}
          >
            x
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <FavoriteButton storeId={store.id} compact />
          <Link
            to={`/stores/${store.id}`}
            className="flex min-h-10 items-center justify-center rounded-lg bg-accent px-3 text-sm font-black text-white"
            aria-label={`${storeText(store, "name")} ${t("storeInfo")}`}
          >
            {t("storeInfo")}
          </Link>
        </div>
      </article>
    </div>
  );
}

export function StoreFacts({ store }: { store: Store }) {
  const { storeText, t } = useI18n();

  return (
    <dl className="grid grid-cols-2 gap-2">
      <div className="rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">{t("floor")}</dt>
        <dd className="mt-1 font-black text-slate-900">{store.floor}</dd>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">{t("hours")}</dt>
        <dd className="mt-1 font-black text-slate-900">{storeText(store, "hours")}</dd>
      </div>
      <div className="col-span-2 rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">{t("location")}</dt>
        <dd className="mt-1 font-black leading-5 text-slate-900">{storeText(store, "location")}</dd>
      </div>
      <div className="col-span-2 rounded-lg border border-slate-200 p-3">
        <dt className="text-xs font-bold text-slate-500">{t("phone")}</dt>
        <dd className="mt-1 font-black leading-5 text-slate-900">{store.phone}</dd>
      </div>
    </dl>
  );
}
