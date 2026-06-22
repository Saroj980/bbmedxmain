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

  const normalizePath = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);

  // Auto expand correct parent
  useEffect(() => {
    let activeParent: string | null = null;
    const currentPath = normalizePath(pathname);
    
    for (const item of sidebarMenu) {
      if (!item.children) continue;

      const isChildActive = item.children.some((child) => {
        const fullHref = normalizePath(buildPath(item.base, child.href));
        const normalizedBasePath = normalizePath(basePath);

        // Dashboard items (no base) should only match exactly to avoid capturing sub-modules
        if (!item.base) {
            return currentPath === fullHref;
        }

        if (fullHref === normalizedBasePath) {
            return currentPath === fullHref;
        }
        return currentPath.startsWith(fullHref);
      });

      if (isChildActive) {
        activeParent = item.label;
      }
    }

    if (activeParent && !openMenus.includes(activeParent)) {
      setOpenMenus([activeParent]);
    }
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? [] : [label]
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
          "fixed left-0 top-0 h-screen z-40 bg-[#009966] text-white shadow-xl flex flex-col",
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
                  const fullHref = normalizePath(buildPath(item.base, child.href));
                  const currentPath = normalizePath(pathname);
                  const normalizedBasePath = normalizePath(basePath);

                  // Dashboard items (no base) should only match exactly to avoid capturing sub-modules
                  if (!item.base) {
                      return currentPath === fullHref;
                  }

                  if (fullHref === normalizedBasePath) {
                      return currentPath === fullHref;
                  }
                  return currentPath.startsWith(fullHref);
                });

              const fullParentHref = item.href ? buildPath(item.base, item.href) : null;
              const isOpen = openMenus.includes(item.label);

              const content = (
                <>
                  <Icon size={22} />
                  {!collapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                  {!collapsed && hasChildren && (
                    <ChevronDown
                      className={cn(
                        "ml-auto transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  )}
                  {collapsed && (
                    <span className="absolute left-20 bg-[#007f56] text-white text-sm px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </>
              );

              const activeClass = isParentActive || (fullParentHref && pathname === fullParentHref) ? "bg-white/20 shadow-inner" : "";

              return (
                <div key={item.label} className="relative">
                  {fullParentHref ? (
                    <Link
                      href={fullParentHref}
                      onClick={() => hasChildren && toggleMenu(item.label)}
                      className={cn(
                        "group flex items-center w-full px-4 py-2 rounded-lg transition-colors hover:bg-white/20",
                        activeClass
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      onClick={() => hasChildren && toggleMenu(item.label)}
                      className={cn(
                        "group flex items-center w-full px-4 py-2 rounded-lg transition-colors hover:bg-white/20",
                        activeClass
                      )}
                    >
                      {content}
                    </button>
                  )}

                  {hasChildren && (
                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen && !collapsed ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                      )}
                    >
                      <div className="overflow-hidden ml-10 space-y-1">
                        {item.children!.map((child) => {
                          if (!permissions.includes(child.permission)) return null;

                          const fullHref = normalizePath(buildPath(item.base, child.href));
                          const currentPath = normalizePath(pathname);
                          const isActive = currentPath === fullHref;

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
                    </div>
                  )}
                </div>
              );
            })}
        </nav>

        {collapsed ? (
          <div className="p-4 border-t border-white/10 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold border border-white/20">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        ) : (
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
