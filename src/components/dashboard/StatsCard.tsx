"use client";

import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | React.ElementType;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  description?: string;
  color?: "emerald" | "blue" | "orange" | "slate";
  compact?: boolean;
}

const colorMap = {
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-200 ring-emerald-100",
  blue: "from-blue-500 to-indigo-600 shadow-blue-200 ring-blue-100",
  orange: "from-orange-500 to-amber-600 shadow-orange-200 ring-amber-100",
  slate: "from-slate-600 to-slate-800 shadow-slate-200 ring-slate-200",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  description,
  color = "emerald",
  compact = false,
}: StatsCardProps) {
  return (
    <Card className={`relative overflow-hidden border-none shadow-premium bg-white transition-all duration-500 group hover:ring-1 hover:ring-slate-100 ${compact ? 'p-0' : ''}`}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`font-bold text-slate-500 tracking-wide uppercase ${compact ? 'text-[9px] mb-0.5' : 'text-xs mb-1'}`}>
              {title}
            </p>
            <h3 className={`font-black text-slate-900 tracking-tighter ${compact ? 'text-xl' : 'text-2xl'}`}>
              {value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ring-4 ring-opacity-20 ${colorMap[color]} text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
            <Icon size={compact ? 18 : 22} strokeWidth={2.5} />
          </div>
        </div>

        <div className={`flex items-center gap-2 ${compact ? 'mt-2' : 'mt-4'}`}>
          {trend && (
            <div
              className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-lg ${
                trendType === "up"
                  ? "bg-emerald-50 text-emerald-600"
                  : trendType === "down"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {trendType === "up" ? (
                <ArrowUpRight size={12} className="mr-0.5" />
              ) : trendType === "down" ? (
                <ArrowDownRight size={12} className="mr-0.5" />
              ) : null}
              {trend}
            </div>
          )}
          {description && (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{description}</span>
          )}
        </div>
      </CardContent>
      
      {/* Decorative backdrop circle */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-slate-50 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10 blur-2xl" />
    </Card>
  );
}
