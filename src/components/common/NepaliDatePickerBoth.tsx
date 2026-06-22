/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

const CSS_URL =
  "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css";
const JS_URL =
  "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js";

let assetsReady = false;
let assetsLoading: Promise<void> | null = null;

function loadPickerAssets(): Promise<void> {
  if (assetsReady) return Promise.resolve();
  if (assetsLoading) return assetsLoading;

  assetsLoading = new Promise<void>((resolve) => {
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }
    if (!document.querySelector(`script[src="${JS_URL}"]`)) {
      const script = document.createElement("script");
      script.src = JS_URL;
      script.onload = () => { assetsReady = true; resolve(); };
      script.onerror = () => resolve();
      document.head.appendChild(script);
    } else {
      assetsReady = true;
      resolve();
    }
  });

  return assetsLoading;
}

type Props = {
  bsValue?: string;
  placeholder?: string;
  onChange: (bs: string, ad: string) => void;
};

export default function NepaliDatePickerBoth({ bsValue, placeholder, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const initialBs = el.value || "";

    const run = () => {
      if (!(el as any).nepaliDatePicker) return;

      // Destroy any existing picker instance to avoid duplicate listeners
      try { (el as any).nepaliDatePicker("destroy"); } catch { /* ok */ }

      const opts: any = {
        dateFormat: "YYYY-MM-DD",
        language: "english",
        // v5 uses `onSelect` (NOT `onChange`) — critical fix
        onSelect: ({ value, year, month, day }: any) => {
          const bs: string = value ?? ""; // already YYYY-MM-DD
          let ad = "";
          try {
            const nf = (window as any).NepaliFunctions;
            // Pass BS date object → get AD date object back
            const adObj = nf.BS2AD({ year, month, day });
            if (adObj?.year) {
              const p = (n: number) => String(n).padStart(2, "0");
              ad = `${adObj.year}-${p(adObj.month)}-${p(adObj.day)}`; // YYYY-MM-DD
            }
          } catch { ad = ""; }
          onChangeRef.current(bs, ad);
        },
      };

      // v5: pre-fill using `value` option (NOT ndpYear/ndpMonth/ndpDay)
      if (initialBs) {
        opts.value = initialBs;
      }

      (el as any).nepaliDatePicker(opts);
    };

    if (assetsReady) {
      run();
    } else {
      loadPickerAssets().then(run);
    }

    return () => {
      // Cleanup on unmount
      try { (el as any).nepaliDatePicker("destroy"); } catch { /* ok */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize ONCE per mount; parent uses key= to remount for edit mode

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={bsValue || ""}
      placeholder={placeholder || "Select BS Date"}
      readOnly
      style={{ fontSize: "12px" }}
      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#009966]/40 focus:bg-white transition cursor-pointer"
    />
  );
}
