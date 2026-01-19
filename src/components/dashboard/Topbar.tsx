"use client";

import { useState } from "react";
import { Menu, Bell, LogOut, User, Settings } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
}

export default function Topbar({ onMenuClick, collapsed }: TopbarProps) {
  const [openProfile, setOpenProfile] = useState(false);

  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  return (
    <header
      className={`
        fixed top-0 right-0 
        ${collapsed ? "lg:left-20" : "lg:left-64"} 
        left-0
        h-16 z-50 
        bg-white/90 backdrop-blur-md 
        border-b border-gray-200 
        shadow-md px-4 
        flex items-center justify-between
        transition-all duration-300
      `}
    >

      {/* LEFT: Mobile Hamburger */}
      <button
        className="lg:hidden p-2 rounded-md bg-[#009966] text-white"
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>

      {/* BRAND / TITLE */}
      <div className="hidden lg:flex text-lg font-semibold text-gray-800 select-none">
        {/* Dashboard */}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        {/* Notification (future use) */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell size={22} className="text-gray-700" />
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setOpenProfile(!openProfile)}
          >
            <div className="w-9 h-9 bg-[#009966] text-white flex items-center justify-center rounded-full font-semibold">
              {user?.name?.[0] ?? "U"}
            </div>
          </button>

          {openProfile && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border animate-fadeIn z-50"
              onMouseLeave={() => setOpenProfile(false)}
            >
              <div className="px-4 py-3 border-b">
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <ul className="py-2">
                <li>
                  <button className="flex w-full px-4 py-2 gap-2 text-gray-700 hover:bg-gray-100">
                    <User size={18} /> Profile
                  </button>
                </li>

                <li>
                  <button className="flex w-full px-4 py-2 gap-2 text-gray-700 hover:bg-gray-100">
                    <Settings size={18} /> Settings
                  </button>
                </li>

                <li>
                  <button
                    className="flex w-full px-4 py-2 gap-2 text-red-600 hover:bg-red-100"
                    onClick={logout}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
