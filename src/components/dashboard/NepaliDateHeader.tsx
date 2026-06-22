"use client";

import { useEffect, useState } from "react";
import NepaliDate from "nepali-date";
import { Calendar } from "lucide-react";

export default function NepaliDateHeader() {
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    // Generate Nepali Date on client mount to avoid hydration mismatch
    const now = new Date();
    const npDate: any = new NepaliDate(now);
    
    // Day names in English-Nepali transliteration or standard English if preferred
    // The user wants impact, so let's make it look professional
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", 
      "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    ];

    const dayName = days[now.getDay()];
    const month = typeof npDate.getMonth === "function" ? npDate.getMonth() : npDate.month;
    const day = typeof npDate.getDate === "function" ? npDate.getDate() : npDate.day;
    const year = typeof npDate.getYear === "function" ? npDate.getYear() : npDate.year;

    const monthName = months[month] || months[0];
    const formattedDate = `${dayName}, ${day} ${monthName} ${year}`;
    
    setDateStr(formattedDate);
  }, []);

  if (!dateStr) return <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl text-emerald-700 text-xs font-bold ring-1 ring-emerald-100 transition-all hover:bg-emerald-100 cursor-default">
      <Calendar size={14} className="text-emerald-500" />
      {dateStr} <span className="ml-1 opacity-50 font-medium">B.S.</span>
    </div>
  );
}
