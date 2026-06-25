import { useI18n } from "../i18n";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useI18n();

  return (
    <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm sm:min-h-14 sm:gap-3 sm:px-4">
      <span className="text-base font-bold text-accent sm:text-xl" aria-hidden="true">
        ⌕
      </span>
      <input
        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-base"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        type="search"
        aria-label={t("searchAria")}
      />
    </label>
  );
}
