"use client";

import { useEffect } from "react";
import { useSalesDrawer } from "@/context/SalesDrawerContext";

export function useSalesShortcuts() {
  const { openDrawer } = useSalesDrawer();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        openDrawer("walkin");
      }

      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        openDrawer("normal");
      }

      if (e.key === "Escape") {
        e.preventDefault();
        openDrawer(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openDrawer]);
}
