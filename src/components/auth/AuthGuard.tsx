"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, hydrated } = useUserStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Only perform check after hydration is complete
    if (!hydrated) return;

    // Helper to get cookie value
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const cookieToken = getCookie("token");
    const cookieRole = getCookie("role");

    // Check if we have everything needed for a valid session
    const hasAuth = !!user && !!token && !!cookieToken && !!cookieRole;

    if (!hasAuth) {
      setAuthorized(false);
      // Clean up any partial state
      logout();
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [user, token, hydrated, pathname, router, logout]);

  // Prevent flicker by showing nothing or a loader while checking auth
  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009966]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
