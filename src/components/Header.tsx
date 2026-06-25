import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function Header() {
  const { language, setLanguage, t } = useI18n();
  const nextLanguage = language === "ko" ? "en" : "ko";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-primary text-white shadow-panel">
      <div className="app-container flex items-center justify-between gap-2 py-3 sm:gap-3 sm:py-4">
        <Link to="/" className="min-w-0" aria-label={t("homeAria")}>
          <p className="text-[10px] font-bold leading-none text-blue-100 sm:text-xs">BIFC2</p>
          <h1 className="truncate text-xl font-black leading-tight tracking-normal sm:text-3xl">{t("title")}</h1>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(nextLanguage)}
            className="rounded-lg border border-white/30 px-3 py-2 text-xs font-black text-white sm:px-4 sm:py-3 sm:text-sm"
            aria-label="Change language"
          >
            {t("languageToggle")}
          </button>
          <Link
            to="/favorites"
            className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary sm:px-4 sm:py-3 sm:text-sm"
            aria-label={`${t("favorites")} page`}
          >
            {t("favorites")}
          </Link>
        </div>
      </div>
    </header>
  );
}
