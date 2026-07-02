export const themeStorageKey = "bifc2.theme";

export const themes = [
  { id: "navy", label: "Navy", primary: "#0B2D5C", accent: "#1E88E5" },
  { id: "garden", label: "Garden", primary: "#064E3B", accent: "#10B981" },
  { id: "gray", label: "Gray", primary: "#1F2937", accent: "#64748B" }
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && themes.some((theme) => theme.id === value);
}

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "navy";
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  return isThemeId(storedTheme) ? storedTheme : "navy";
}

export function applyTheme(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = themeId;

  const theme = themes.find((item) => item.id === themeId) ?? themes[0];
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  themeColorMeta?.setAttribute("content", theme.primary);
}
