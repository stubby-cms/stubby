"use client";

import { useTheme } from "next-themes";
import clsx from "clsx";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const buttonClassNames = `h-7 w-7 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center rounded-lg`;

  return (
    <div className="theme-toggle flex gap-1">
      <button
        onClick={() => setTheme("light")}
        className={clsx(buttonClassNames)}
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={clsx(buttonClassNames)}
      >
        <Moon size={14} />
      </button>
    </div>
  );
}
