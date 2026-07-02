import { themes } from "../utils/theme";
import type { ThemeId } from "../utils/theme";

type ThemeSelectorProps = {
  selectedTheme: ThemeId;
  onSelect: (theme: ThemeId) => void;
};

export default function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-lg border border-white/20 bg-white/10 p-1 sm:flex sm:flex-none" aria-label="Theme selector">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`flex min-h-9 min-w-0 items-center justify-center gap-1 rounded-md border px-2 text-[11px] font-black text-white transition sm:min-w-24 sm:text-xs ${
            selectedTheme === theme.id ? "border-white bg-white/25 ring-1 ring-white/70" : "border-white/20"
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
