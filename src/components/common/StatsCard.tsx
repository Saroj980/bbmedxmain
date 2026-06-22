"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color?: string;
  bgGradient?: string;
}

export default function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  color = "#009966",
  bgGradient = "from-[#009966] to-[#33BBA2]" 
}: StatsCardProps) {
  return (
    <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden bg-white py-0">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient} text-white shadow-sm`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-xl font-bold text-gray-800">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
