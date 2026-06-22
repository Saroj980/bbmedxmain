"use client";

import { useEffect, useState } from "react";
import { BSToAD, ADToBS } from "bikram-sambat-js";
import dayjs from "dayjs";

interface Props {
  /** BS date string (YYYY-MM-DD). If provided, derive AD from it. */
  bsDate?: string | null;
}

export default function BsAdDateTimeDisplay({ bsDate }: Props) {
  const [time, setTime] = useState(() => dayjs().format("hh:mm A"));

  // Tick every minute
  useEffect(() => {
    const id = setInterval(() => setTime(dayjs().format("hh:mm A")), 60_000);
    return () => clearInterval(id);
  }, []);

  let adDate = "";
  let displayBs = bsDate ?? "";

  if (bsDate) {
    try { adDate = BSToAD(bsDate); } catch { /* ignore */ }
  }

  if (!displayBs) {
    // Fallback: today
    try { displayBs = ADToBS(dayjs().format("YYYY-MM-DD")); } catch { /* ignore */ }
    try { adDate = dayjs().format("YYYY-MM-DD"); } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium mt-1">
      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 tracking-wide">
        BS&nbsp;{displayBs}
      </span>
      <span className="text-gray-300">|</span>
      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 tracking-wide">
        AD&nbsp;{adDate}
      </span>
      <span className="text-gray-300">|</span>
      <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-gray-600 tracking-wide">
        {time}
      </span>
    </div>
  );
}
