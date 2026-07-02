import { themes } from "../utils/theme";
import type { ThemeId } from "../utils/theme";

type ThemeSelectorProps = {
  selectedTheme: ThemeId;
  onSelect: (theme: ThemeId) => void;
  tone?: "dark" | "light";
};

export default function ThemeSelector({ selectedTheme, onSelect, tone = "dark" }: ThemeSelectorProps) {
  const isLight = tone === "light";

  return (
    <div
      className={`grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-lg border p-1 sm:flex sm:flex-none ${
        isLight ? "border-slate-200 bg-slate-50" : "border-white/20 bg-white/10"
      }`}
      aria-label="Theme selector"
    >
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`flex min-h-9 min-w-0 items-center justify-center gap-1 rounded-md border px-2 text-[11px] font-black transition sm:min-w-24 sm:text-xs ${
            selectedTheme === theme.id
              ? isLight
                ? "border-accent bg-white text-primary ring-2 ring-accent/20"
                : "border-white bg-white/25 text-white ring-1 ring-white/70"
              : isLight
                ? "border-slate-200 bg-white text-slate-600"
                : "border-white/20 text-white"
          }`}
          aria-label={`${theme.label} theme`}
          aria-pressed={selectedTheme === theme.id}
          title={theme.label}
        >
          <span className="flex h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full border border-white/70 sm:h-4 sm:w-4" aria-hidden="true">
            <span className="h-full w-1/2" style={{ backgroundColor: theme.primary }} />
            <span className="h-full w-1/2" style={{ backgroundColor: theme.accent }} />
          </span>
          <span className="truncate">{theme.label}</span>
        </button>
      ))}
    </div>
  );
}
