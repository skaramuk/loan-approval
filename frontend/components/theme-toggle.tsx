"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";

import { Button } from "@/components/ui/button";
import { TEMA } from "@/lib/metinler";
import { THEME_STORAGE_KEY } from "@/lib/theme";

function prefersDark(): boolean {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  // React's dev-mode remount resets <html> attributes; re-apply before paint. No-op in production.
  useLayoutEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", prefersDark());
    } catch {
      // localStorage unavailable: keep the server default.
    }
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Not persisted; the choice still applies to this page view.
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={TEMA.degistir}>
      <Sun className="hidden dark:block" aria-hidden />
      <Moon className="dark:hidden" aria-hidden />
    </Button>
  );
}
