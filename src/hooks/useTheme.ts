import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, themeStorageKey, type ThemeId } from "../utils/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return {
    theme,
    setTheme: setThemeState
  };
}
