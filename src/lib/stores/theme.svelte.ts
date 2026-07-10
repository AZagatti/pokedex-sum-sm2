const THEME_KEY = "pokedex:theme";

export type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof localStorage === "undefined") {
    return "light";
  }
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

class ThemeStore {
  current = $state<Theme>("light");

  constructor() {
    this.current = getInitialTheme();
  }

  toggle(): void {
    this.set(this.current === "light" ? "dark" : "light");
  }

  set(theme: Theme): void {
    this.current = theme;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, theme);
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }
}

export const themeStore = new ThemeStore();
