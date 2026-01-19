"use client";

import { useEffect, useRef } from "react";

type Props = {
  value?: string; // BS date
  onChange: (bsDate: string, adDate: string) => void;
  placeholder?: string;
};

export default function NepaliDateInput({
  value,
  onChange,
  placeholder = "Select Nepali Date",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    @ts-ignore (library is global)
    inputRef.current.nepaliDatePicker({
      dateFormat: "YYYY-MM-DD",
      closeOnDateSelect: true,
      onChange: ({ bs, ad }: any) => {
        onChange(bs, ad);
      },
    });
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      className="w-full border rounded-md px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  );
}
