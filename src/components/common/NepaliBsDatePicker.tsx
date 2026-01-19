"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import RawNepaliDatePicker from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import BikramSambat from "bikram-sambat-js";

/**
 * 🔥 FIX: Cast to any because library has broken TS types
 */
const NepaliDatePicker: any = RawNepaliDatePicker;

type Props = {
  value?: string | null; // AD date (YYYY-MM-DD)
  onChange: (adDate: string | null) => void;
};

export default function NepaliBsDatePicker({ value, onChange }: Props) {
  const [bsDate, setBsDate] = useState<string>("");

  // AD → BS
  useEffect(() => {
    if (!value) {
      setBsDate("");
      return;
    }

    const ad = new Date(value);
    const bs = BikramSambat.fromAD(ad);

    setBsDate(
      `${bs.year}-${String(bs.month).padStart(2, "0")}-${String(bs.day).padStart(2, "0")}`
    );
  }, [value]);

  // BS → AD
  const handleChange = (bsValue: string) => {
    setBsDate(bsValue);

    if (!bsValue) {
      onChange(null);
      return;
    }

    const [y, m, d] = bsValue.split("-").map(Number);
    const ad = BikramSambat.toAD({ year: y, month: m, day: d });

    const adFormatted = `${ad.year}-${String(ad.month).padStart(2, "0")}-${String(ad.day).padStart(2, "0")}`;

    onChange(adFormatted);
  };

  return (
    <NepaliDatePicker
      value={bsDate}
      onChange={handleChange}
      inputClassName="w-full px-3 py-2 border rounded-md text-sm"
      options={{
        calenderLocale: "ne",
        valueLocale: "en",
      }}
      placeholder="YYYY-MM-DD (BS)"
    />
  );
}
