"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function LiveForceDark() {
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && theme) {
      previousThemeRef.current = theme;
      initializedRef.current = true;
      setTheme("dark");
    }
  }, [setTheme, theme]);

  useEffect(() => {
    return () => {
      if (previousThemeRef.current) {
        setTheme(previousThemeRef.current);
      }
    };
  }, [setTheme]);

  return null;
}
