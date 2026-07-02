import { themes } from "../utils/theme";
import type { ThemeId } from "../utils/theme";

type ThemeSelectorProps = {
  selectedTheme: ThemeId;
  onSelect: (theme: ThemeId) => void;
};

export default function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
  const selectedThemeOption = themes.find((theme) => theme.id === selectedTheme) ?? themes[0];

  return (
    <label className="grid min-w-0 gap-1 text-xs font-black text-primary sm:w-44">
      <span>테마</span>
      <span className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 flex h-4 w-4 overflow-hidden rounded-full border border-white shadow-sm" aria-hidden="true">
          <span className="h-full w-1/2" style={{ backgroundColor: selectedThemeOption.primary }} />
          <span className="h-full w-1/2" style={{ backgroundColor: selectedThemeOption.accent }} />
        </span>
        <select
          value={selectedTheme}
          onChange={(event) => onSelect(event.target.value as ThemeId)}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm font-black text-slate-800 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          aria-label="테마 선택"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
