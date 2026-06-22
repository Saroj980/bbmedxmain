"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-0">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#009966] transition font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-semibold">{item.label}</span>
          )}

          {index < items.length - 1 && (
            <ChevronRight size={16} className="mx-2 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}
