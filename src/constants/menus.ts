import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  ShoppingCart,
  Truck,
  Users,
  BookOpen,
  History,
  Settings,
} from "lucide-react";

export const sidebarMenu = [
  {
    label: "Dashboard",
    base: "dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/admin",
    permission: "dashboard.view",
  },

  {
    label: "Products",
    base: "products",   // ⭐ REQUIRED
    icon: Package,
    permission: "products.view",
    children: [
      { label: "All Products", href: "/", permission: "products.view" },
      // { label: "Add Product", href: "/create", permission: "products.create" },
      { label: "Categories", href: "/categories", permission: "categories.view" },
      { label: "Units", href: "/units", permission: "units.view" },
      { label: "Storage Locations", href: "/locations", permission: "locations.view" },
      { label: "Field Definitions", href: "/product-fields", permission: "products.edit" },
    ],
  },

  {
    label: "Inventory",
    base: "inventory",
    icon: Layers,
    permission: "stock.view",
    children: [
      { label: "Stock Status", href: "/stock", permission: "stock.view" },
      { label: "Stock Adjust", href: "/adjust", permission: "stock.adjust" },
      { label: "Batches", href: "/batches", permission: "batches.view" },
      { label: "Expiry List", href: "/expiry", permission: "expiry.view" },
      {
        label: "Expiry Return",
        href: "/expiry-return",
        permission: "return.expiry.view",
      },
    ],
  },

  {
    label: "Accounting",
    base: "accounting",
    icon: BookOpen,
    permission: "accounting.view",
    children: [
      // { label: "Journal Entries", href: "/journal-entries", permission: "accounting.view" },
      { label: "Accounts", href: "/accounts", permission: "accounting.view" },
      { label: "Parties", href: "/party-ledgers", permission: "accounting.view" },
      // { label: "Party Ledgers", href: "/parties", permission: "accounting.view" },
      { label: "Trial Balance", href: "/trial-balance", permission: "accounting.view" },
      { label: "Profit & Loss", href: "/profit-loss", permission: "accounting.view" },
      {
        label: "Balance Sheet",
        href: "/balance-sheet",
        permission: "accounting.view",
      },
    ],
  },

  {
    label: "Stock Movement",
    base: "stock",
    icon: ClipboardList,
    permission: "stockin.view",
    children: [
      { label: "Stock In / Out", href: "/stock-in-out", permission: "stockin.view" },
      // { label: "Add Stock In", href: "/in/create", permission: "stockin.create" },
      // { label: "Stock Out", href: "/out", permission: "stockout.view" },
      // {
      //   label: "Add Stock Out",
      //   href: "/out/create",
      //   permission: "stockout.create",
      // },
    ],
  },

  {
    label: "Purchase",
    base: "purchases",
    icon: ShoppingCart,
    permission: "purchases.view",
    children: [
      { label: "All Purchases", href: "/", permission: "purchases.view" },
      { label: "New Purchase", href: "/create", permission: "purchases.create" },
      { label: "Suppliers", href: "/suppliers", permission: "suppliers.view" },
      {
        label: "Purchase Returns",
        href: "/returns",
        permission: "return.purchase.view",
      },
      { label: "GRN Management", href: "/grn", permission: "grn.manage" },
    ],
  },

  {
    label: "Sales",
    base: "sales",
    icon: Truck,
    permission: "sales.view",
    children: [
      { label: "All Sales", href: "/", permission: "sales.view" },
      { label: "New Sale", href: "/create", permission: "sales.create" },
      { label: "Customers", href: "/customers", permission: "customers.view" },
      {
        label: "Sales Returns",
        href: "/returns",
        permission: "return.sales.view",
      },
    ],
  },

  {
    label: "Users & Roles",
    base: "users",
    icon: Users,
    permission: "staff.view",
    children: [
      { label: "Staff", href: "/", permission: "staff.view" },
      { label: "Roles", href: "/roles", permission: "roles.view" },
      { label: "Assign Roles", href: "/assign", permission: "roles.assign" },
    ],
  },

  {
    label: "Audit & Logs",
    base: "audit",
    icon: History,
    permission: "audit.view",
    children: [
      { label: "Audit Logs", href: "/", permission: "audit.view" },
      { label: "System Logs", href: "/logs", permission: "logs.view" },
    ],
  },

  {
    label: "Settings",
    base: "settings",
    icon: Settings,
    href: "/",
    permission: "settings.manage",
    children: [
      { label: "Dictionaries", href: "/dictionaries", permission: "settings.manage" },
      { label: "System Settings", href: "/system-settings", permission: "settings.manage" },
    ],
  },
];
