"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarMenu } from "@/constants/menus";
import { roleBasePath } from "@/constants/rolePaths";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const user = useUserStore((s) => s.user);
  const permissions = useUserStore((s) => s.permissions);

  const basePath = roleBasePath[user?.role ?? "staff"];

  const buildPath = (moduleBase: string | undefined, href: string) => {
    const safeBase = moduleBase ? `/${moduleBase}` : "";
    return `${basePath}${safeBase}${href}`.replace("//", "/");
  };

  // Auto expand correct parent
  useEffect(() => {
    sidebarMenu.forEach((item) => {
      if (!item.children) return;

      const isChildActive = item.children.some((child) => {
        const fullHref = buildPath(item.base, child.href);
        return pathname.startsWith(fullHref);
      });

      if (isChildActive && !openMenus.includes(item.label)) {
        setOpenMenus((prev) => [...prev, item.label]);
      }
    });
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-40 bg-[#009966] text-white shadow-xl",
          "border-r border-white/10 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!collapsed && (
            <h1 className="font-bold text-2xl tracking-wide">BBMedX</h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block"
          >
            <Menu />
          </button>

          <button className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {sidebarMenu
            .filter((item) => permissions.includes(item.permission))
            .map((item) => {
              const Icon = item.icon;
              const hasChildren = Array.isArray(item.children);

              // Parent active if pathname starts with module base
              const isParentActive =
                hasChildren &&
                item.children!.some((child) => {
                  const fullHref = buildPath(item.base, child.href);
                  return pathname.startsWith(fullHref); // Parent detection
                });


              const isOpen = openMenus.includes(item.label);

              // FIXED
              const isActuallyOpen = isOpen || isParentActive;

              return (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => hasChildren && toggleMenu(item.label)}
                    className={cn(
                      "group flex items-center w-full px-4 py-2 rounded-lg transition-colors",
                      isParentActive ? "bg-white/20 shadow-inner" : "",
                      "hover:bg-white/20"
                    )}
                  >
                    <Icon size={22} />

                    {!collapsed && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}

                    {!collapsed && hasChildren && (
                      <ChevronDown
                        className={cn(
                          "ml-auto transition-transform",
                          isActuallyOpen && "rotate-180"
                        )}
                      />
                    )}

                    {collapsed && (
                      <span className="absolute left-20 bg-[#007f56] text-white text-sm px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </button>

                  {!collapsed && hasChildren && isActuallyOpen && (
                    <div className="ml-10 mt-1 space-y-1 animate-slideDown">
                      {item.children!.map((child) => {
                        if (!permissions.includes(child.permission)) return null;

                        const fullHref = buildPath(item.base, child.href);
                        // const isActive = pathname.startsWith(fullHref);
                        const isActive = pathname === fullHref;


                        return (
                          <Link
                            href={fullHref}
                            key={child.label}
                            className={cn(
                              "block px-3 py-1.5 text-sm rounded-md transition-colors",
                              isActive
                                ? "bg-white/30 font-semibold"
                                : "hover:bg-white/20 text-white/90"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-white/10">
            <p className="text-sm text-white/70">Logged in as</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
        )}
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#009966] p-2 rounded text-white shadow-lg"
      >
        <Menu />
      </button>
    </>
  );
}
