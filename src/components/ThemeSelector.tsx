import { themes } from "../utils/theme";
import type { ThemeId } from "../utils/theme";

type ThemeSelectorProps = {
  selectedTheme: ThemeId;
  onSelect: (theme: ThemeId) => void;
};

export default function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
  const selectedThemeOption = themes.find((theme) => theme.id === selectedTheme) ?? themes[0];
  const selectedThemeIndex = themes.findIndex((theme) => theme.id === selectedTheme);
  const nextTheme = themes[(selectedThemeIndex + 1) % themes.length] ?? themes[0];

  return (
    <button
      type="button"
      onClick={() => onSelect(nextTheme.id)}
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-xs font-black text-white sm:px-4 sm:py-3 sm:text-sm"
      aria-label={`테마 변경: 현재 ${selectedThemeOption.label}, 다음 ${nextTheme.label}`}
      title={`Theme: ${selectedThemeOption.label}`}
    >
      <span className="flex h-4 w-4 overflow-hidden rounded-full border border-white/80 shadow-sm" aria-hidden="true">
        <span className="h-full w-1/2" style={{ backgroundColor: selectedThemeOption.primary }} />
        <span className="h-full w-1/2" style={{ backgroundColor: selectedThemeOption.accent }} />
      </span>
      <span className="hidden sm:inline">{selectedThemeOption.label}</span>
    </button>
  );
}
