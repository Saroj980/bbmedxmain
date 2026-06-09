"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
// import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { SalesDrawerProvider } from "@/context/SalesDrawerContext";
import { useSalesShortcuts } from "@/hooks/useSalesShortcuts";

import AuthGuard from "@/components/auth/AuthGuard";

function DashboardWrapper({ children }: any) {
  useSalesShortcuts();
  return children;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // useGlobalShortcuts();

  return (
    <AuthGuard>
      <div className="min-h-screen w-full flex">
        <div className="print:hidden">
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        <div
          className={`flex-1 flex flex-col min-h-screen bg-[#F1FAF6] transition-all duration-300
            ${collapsed ? "lg:ml-20" : "lg:ml-64"} ml-0 print:ml-0`}
        >
          <div className="print:hidden">
            <Topbar
              onMenuClick={() => setMobileOpen(true)}
              collapsed={collapsed}
            />
          </div>

          <main className="pt-16 p-6 flex-1 overflow-y-auto print:p-0 print:pt-0">

            <div className="container mx-auto px-4 py-4 print:p-0 print:m-0 print:max-w-none">

             <SalesDrawerProvider>
              <DashboardWrapper>{children}</DashboardWrapper>
            </SalesDrawerProvider>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
