import type { LucideIcon } from "lucide-react";

export interface SidebarChild {
  label: string;
  href: string;        // relative path
  permission: string;
}

export interface SidebarItem {
  label: string;
  icon: LucideIcon;
  permission: string;
  href?: string;
  base?: string;       // base path such as "products" to support /admin/products/*
  children?: SidebarChild[];
}
