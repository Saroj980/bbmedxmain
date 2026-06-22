"use client";

import { useEffect, useState } from "react";
import { Wallet, Landmark, TrendingUp, History, CreditCard, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Activity {
  id: number;
  type: string;
  ref: string;
  amount: string;
  date: string;
  nepali_date: string;
  status: string;
}

export default function FinancialOverview() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState({
    cashBalance: 0,
    bankBalance: 0,
    apBalance: 0
  });

  const accounts = [
    { name: "Cash in Hand", balance: `रु. ${snapshot.cashBalance.toLocaleString()}`, trend: "+12%", change: "increase", icon: Wallet },
    { name: "Bank Balance", balance: `रु. ${snapshot.bankBalance.toLocaleString()}`, trend: "+4%", change: "increase", icon: Landmark },
    { name: "Accounts Payable", balance: `रु. ${snapshot.apBalance.toLocaleString()}`, trend: "-5%", change: "decrease", icon: CreditCard },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activitiesRes, snapshotRes] = await Promise.all([
        api.get("/dashboard/recent-activities"),
        api.get("/dashboard/financial-snapshot")
      ]);
      setActivities(activitiesRes.data.journals || []);
      setSnapshot(snapshotRes.data || { cashBalance: 0, bankBalance: 0, apBalance: 0 });
    } catch (error) {
      console.error("Error fetching ledger activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="border-none shadow-premium bg-white">
      <CardHeader className="pb-0 border-none">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <TrendingUp size={22} className="text-blue-500" />
          Financial Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 p-4 space-y-6">
        
        {/* Account Summaries */}
        <div className="grid grid-cols-1 gap-3">
          {accounts.map((acc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm text-slate-600">
                  <acc.icon size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{acc.name}</p>
                  <p className="text-sm font-bold text-slate-900">{acc.balance}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                acc.change === "increase" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
              }`}>
                {acc.trend}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Ledger Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History size={14} />
              Recent Ledger Activity
            </h4>
            <span 
              onClick={() => window.location.href = '/dashboard/admin/vouchers/all'} 
              className="text-[10px] font-semibold text-blue-500 cursor-pointer hover:underline"
            >
              View All
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="animate-spin inline-block text-slate-300" size={20} />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center py-8 text-[10px] text-slate-400 font-medium">No recent ledger records.</p>
            ) : (
              activities.map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => window.open(`/dashboard/admin/vouchers/print/${act.id}`, '_blank')}
                  className="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 rounded-full ${
                      act.type === "Journal" ? "bg-emerald-400" : act.type === "Receipt" ? "bg-blue-400" : "bg-amber-400"
                    }`} />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{act.ref}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {act.nepali_date} • {act.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{act.amount}</p>
                    <p className={`text-[9px] font-semibold ${act.status === 'Balanced' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {act.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
