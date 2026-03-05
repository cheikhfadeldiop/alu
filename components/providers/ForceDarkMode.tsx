"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Global variables to track state across navigation between pages that force dark mode.
 * Using global variables (outside component) ensures they persist during React's mount/unmount cycle.
 */
let forceDarkSessions = 0;
let savedUserTheme: string | null = null;

/**
 * A client component that forces the theme to dark when mounted.
 * It uses a session counter to ensure that moving between "dark-only" pages
 * doesn't cause a flicker back to the user's preferred light/system theme.
 */
export function ForceDarkMode() {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        forceDarkSessions++;

        // If this is the starting session for dark mode
        if (forceDarkSessions === 1) {
            if (theme !== "dark") {
                savedUserTheme = theme || "light";
                setTheme("dark");
            }
        } else {
            // If we are already in dark mode from a previous page, 
            // just ensure we stay there if for some reason it changed.
            if (theme !== "dark") {
                setTheme("dark");
            }
        }

        return () => {
            forceDarkSessions--;

            /**
             * We wait a tiny bit (50ms) before restoring the theme.
             * If another ForceDarkMode component mounts during this time (navigation),
             * the counter will be > 0 and we won't switch back to light mode,
             * preventing the white flash.
             */
            setTimeout(() => {
                if (forceDarkSessions <= 0 && savedUserTheme) {
                    setTheme(savedUserTheme);
                    savedUserTheme = null;
                }
            }, 50);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount/unmount

    return null;
}
