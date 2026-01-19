"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useGlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        router.push("/dashboard/admin/sales/new?type=walkin");
      }

      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        router.push("/dashboard/admin/sales/new");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);
}
