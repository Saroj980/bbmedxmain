"use client";

import React, { createContext, useContext, useState } from "react";

type SaleType = "walkin" | "normal" | null;

type SalesDrawerContextType = {
  open: boolean;
  type: SaleType;
  openDrawer: (type: SaleType) => void;
  closeDrawer: () => void;
};

const SalesDrawerContext = createContext<SalesDrawerContextType | null>(null);

export function SalesDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SaleType>(null);

  const openDrawer = (t: SaleType) => {
    setType(t);
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    setType(null);
  };

  return (
    <SalesDrawerContext.Provider value={{ open, type, openDrawer, closeDrawer }}>
      {children}
    </SalesDrawerContext.Provider>
  );
}

export function useSalesDrawer() {
  const ctx = useContext(SalesDrawerContext);
  if (!ctx) throw new Error("useSalesDrawer must be used inside SalesDrawerProvider");
  return ctx;
}
