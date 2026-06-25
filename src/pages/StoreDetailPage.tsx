import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import FavoriteButton from "../components/FavoriteButton";
import MapView from "../components/MapView";
import { StoreFacts } from "../components/StoreBottomSheet";
import { floors, stores as defaultStores } from "../data/stores";
import { useI18n } from "../i18n";
import type { Floor, Store } from "../types/store";
import { loadStores } from "../utils/storeRepository";

export default function StoreDetailPage() {
  const { categoryLabel, storeText, t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [storeItems, setStoreItems] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const store = storeItems.find((item) => item.id === id);

  useEffect(() => {
    const syncStores = () => {
      setIsLoading(true);
      loadStores(defaultStores)
        .then(setStoreItems)
        .catch(() => setStoreItems(defaultStores))
        .finally(() => setIsLoading(false));
    };

    syncStores();
    window.addEventListener("stores-updated", syncStores);
    return () => {
      window.removeEventListener("stores-updated", syncStores);
    };
  }, []);

  if (isLoading) {
    return (
      <main className="app-container py-4">
        <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 shadow-panel">
          {t("loadingStore")}
        </section>
      </main>
    );
  }

  if (!id || !store || !floors.includes(store.floor as Floor)) {
    return <Navigate to="/" replace />;
  }

  const sameFloorStores = storeItems.filter((item) => item.floor === store.floor && floors.includes(item.floor as Floor));

  const handleStoreSelect = (selectedStore: Store) => {
    navigate(`/stores/${selectedStore.id}`);
  };

  return (
    <main className="app-container grid gap-4 py-4 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        {store.image && (
          <img src={store.image} alt={`${storeText(store, "name")} ${t("representativeImage")}`} className="mb-4 h-44 w-full rounded-lg object-cover" />
        )}
        <p className="text-sm font-black text-accent">{categoryLabel(store.category)}</p>
        <h2 className="mt-1 break-keep text-3xl font-black text-primary">{storeText(store, "name")}</h2>
        <p className="mt-4 rounded-lg bg-appbg p-4 text-sm leading-6 text-slate-700">{storeText(store, "description")}</p>

        <div className="mt-4">
          <StoreFacts store={store} />
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 p-3" aria-label={t("actions")}>
          <h3 className="text-sm font-black text-primary">{t("actions")}</h3>
          <div className="mt-3 grid gap-2">
            <ActionLink label={t("viewOnMap")} href={`/?floor=${store.floor}&store=${store.id}`} internal variant="primary" />
            <ActionLink label={t("call")} href={createPhoneHref(store.phone)} disabled={!createPhoneHref(store.phone)} />
            <ActionLink label={t("naverPlace")} href={store.links?.naverPlace || createNaverSearchUrl(storeText(store, "name"))} external />
            <ActionLink label={t("reservation")} href={store.links?.naverReservation} external disabled={!store.links?.naverReservation} />
            <ActionLink label={t("reviews")} href={store.links?.blogSearch || createNaverBlogSearchUrl(storeText(store, "name"))} external />
            <ActionLink
              label={t("officialChannel")}
              href={store.links?.website || store.links?.instagram}
              external
              disabled={!store.links?.website && !store.links?.instagram}
            />
            <ActionLink label={t("menu")} href={store.links?.menu} external disabled={!store.links?.menu} />
          </div>
        </section>

        <div className="mt-4">
          <FavoriteButton storeId={store.id} />
        </div>
      </section>

      <MapView
        floor={store.floor as Floor}
        stores={sameFloorStores}
        selectedStoreId={store.id}
        highlightedStoreIds={[store.id]}
        onStoreSelect={handleStoreSelect}
      />
    </main>
  );
}

function ActionLink({
  label,
  href,
  external = false,
  internal = false,
  disabled = false,
  variant = "secondary"
}: {
  label: string;
  href?: string;
  external?: boolean;
  internal?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const className = `flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-black ${
    disabled
      ? "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400"
      : variant === "primary"
        ? "bg-accent text-white"
        : "border border-slate-200 bg-white text-primary"
  }`;

  if (disabled || !href) {
    return (
      <button type="button" className={className} disabled>
        {label}
      </button>
    );
  }

  if (internal) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {label}
    </a>
  );
}

function createPhoneHref(phone: string) {
  const phoneNumber = phone.replace(/[^0-9+]/g, "");
  return phoneNumber.length >= 7 ? `tel:${phoneNumber}` : "";
}

function createNaverSearchUrl(storeName: string) {
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(storeName)}`;
}

function createNaverBlogSearchUrl(storeName: string) {
  return `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(storeName)}`;
}
