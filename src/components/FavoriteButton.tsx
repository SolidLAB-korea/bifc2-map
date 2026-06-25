import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { isFavoriteStore, toggleFavoriteStore } from "../utils/storage";

type FavoriteButtonProps = {
  storeId: string;
  compact?: boolean;
};

export default function FavoriteButton({ storeId, compact = false }: FavoriteButtonProps) {
  const { t } = useI18n();
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteStore(storeId));

  useEffect(() => {
    const syncFavorite = () => setIsFavorite(isFavoriteStore(storeId));
    window.addEventListener("favorites-updated", syncFavorite);
    window.addEventListener("storage", syncFavorite);
    return () => {
      window.removeEventListener("favorites-updated", syncFavorite);
      window.removeEventListener("storage", syncFavorite);
    };
  }, [storeId]);

  const label = isFavorite ? t("removeFavorite") : t("addFavorite");

  return (
    <button
      type="button"
      onClick={() => setIsFavorite(toggleFavoriteStore(storeId))}
      className={`rounded-lg border font-black ${
        compact ? "min-h-11 px-3 text-xl" : "min-h-12 px-4 text-base"
      } ${isFavorite ? "border-amber-300 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-600"}`}
      aria-label={label}
      aria-pressed={isFavorite}
    >
      {compact ? (isFavorite ? "★" : "☆") : `${isFavorite ? "★" : "☆"} ${label}`}
    </button>
  );
}
