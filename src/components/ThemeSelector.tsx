import { themes } from "../utils/theme";
import type { ThemeId } from "../utils/theme";

type ThemeSelectorProps = {
  selectedTheme: ThemeId;
  onSelect: (theme: ThemeId) => void;
};

export default function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 p-1" aria-label="Theme selector">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`flex h-7 w-7 items-center justify-center rounded-md border transition sm:h-8 sm:w-8 ${
            selectedTheme === theme.id ? "border-white bg-white/20" : "border-white/20"
          }`}
          aria-label={`${theme.label} theme`}
          aria-pressed={selectedTheme === theme.id}
          title={theme.label}
        >
          <span className="flex h-3.5 w-3.5 overflow-hidden rounded-full border border-white/70 sm:h-4 sm:w-4" aria-hidden="true">
            <span className="h-full w-1/2" style={{ backgroundColor: theme.primary }} />
            <span className="h-full w-1/2" style={{ backgroundColor: theme.accent }} />
          </span>
        </button>
      ))}
    </div>
  );
}
