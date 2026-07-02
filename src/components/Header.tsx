import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import type { ThemeId } from "../utils/theme";
import ThemeSelector from "./ThemeSelector";

type HeaderProps = {
  selectedTheme: ThemeId;
  onThemeSelect: (theme: ThemeId) => void;
};

export default function Header({ selectedTheme, onThemeSelect }: HeaderProps) {
  const { language, setLanguage, t } = useI18n();
  const nextLanguage = language === "ko" ? "en" : "ko";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-primary text-white shadow-panel">
      <div className="app-container flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-4">
        <Link to="/" className="min-w-0 flex-1" aria-label={t("homeAria")}>
          <p className="text-[10px] font-bold leading-none text-white/75 sm:text-xs">BIFC2</p>
          <h1 className="truncate text-xl font-black leading-tight tracking-normal sm:text-3xl">{t("title")}</h1>
        </Link>
        <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto sm:gap-2">
          <ThemeSelector selectedTheme={selectedTheme} onSelect={onThemeSelect} />
          <button
            type="button"
            onClick={() => setLanguage(nextLanguage)}
            className="min-h-11 shrink-0 rounded-lg border border-white/30 px-3 py-2 text-xs font-black text-white sm:px-4 sm:py-3 sm:text-sm"
            aria-label="Change language"
          >
            {t("languageToggle")}
          </button>
          <Link
            to="/favorites"
            className="hidden rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary sm:flex sm:px-4 sm:py-3 sm:text-sm"
            aria-label={`${t("favorites")} page`}
          >
            {t("favorites")}
          </Link>
        </div>
      </div>
    </header>
  );
}
