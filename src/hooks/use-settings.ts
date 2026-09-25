import { useCallback, useEffect, useState } from "react";

export interface AppSettings {
  theme: "light" | "dark";
  defaultTone: "Formal" | "Friendly" | "Persuasive";
  defaultPlanMode: "Today" | "This Week";
  notifications: "All" | "Important only" | "None";
}

const DEFAULTS: AppSettings = {
  theme: "light",
  defaultTone: "Formal",
  defaultPlanMode: "Today",
  notifications: "Important only",
};

const KEY = "awpa-settings";

export function readSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function applyTheme(theme: AppSettings["theme"]) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next = readSettings();
    setSettings(next);
    applyTheme(next.theme);
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      if (patch.theme) applyTheme(patch.theme);
      return next;
    });
  }, []);

  return { settings, update, hydrated };
}
