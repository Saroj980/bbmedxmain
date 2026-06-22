"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function MarginSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    carrier_cost_percentage: 0,
    retail_margin: 0,
    distributor_margin: 0,
    firm_margin: 0,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/margin-settings");
      setSettings({
        carrier_cost_percentage: Number(res.data.carrier_cost_percentage) || 0,
        retail_margin: Number(res.data.retail_margin) || 0,
        distributor_margin: Number(res.data.distributor_margin) || 0,
        firm_margin: Number(res.data.firm_margin) || 0,
      });
    } catch (error) {
      console.error("Failed to fetch margin settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post("/margin-settings", settings);
      toast.success("Margin settings updated successfully");
    } catch (error: any) {
      console.error("Failed to save margin settings:", error);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Settings", href: "/dashboard/admin/settings" },
          { label: "Margin Settings" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Margin Settings</h1>
          <p className="text-gray-500">Configure default percentage values for margins and costs.</p>
        </div>
      </div>

      <Card className="max-w-2xl shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg">Default Percentages</CardTitle>
          <CardDescription>
            These values will be used as defaults across the system when calculating landed costs and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label htmlFor="carrier_cost" className="font-semibold text-gray-700">Carrier Cost (%)</Label>
              <div className="relative">
                <Input
                  id="carrier_cost"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="pr-8"
                  value={settings.carrier_cost_percentage}
                  onChange={(e) => setSettings({ ...settings, carrier_cost_percentage: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500">Default markup percentage for shipping and handling costs.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retail_margin" className="font-semibold text-gray-700">Retail Margin (%)</Label>
              <div className="relative">
                <Input
                  id="retail_margin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="pr-8"
                  value={settings.retail_margin}
                  onChange={(e) => setSettings({ ...settings, retail_margin: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500">Default profit margin applied for retail pricing (MRP).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributor_margin" className="font-semibold text-gray-700">Distributor Margin (%)</Label>
              <div className="relative">
                <Input
                  id="distributor_margin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="pr-8"
                  value={settings.distributor_margin}
                  onChange={(e) => setSettings({ ...settings, distributor_margin: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500">Default profit margin applied for distributor pricing.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firm_margin" className="font-semibold text-gray-700">Firm Margin (%)</Label>
              <div className="relative">
                <Input
                  id="firm_margin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="pr-8"
                  value={settings.firm_margin}
                  onChange={(e) => setSettings({ ...settings, firm_margin: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500">Internal firm profit margin standard.</p>
            </div>

          </div>

          <div className="pt-6 mt-6 border-t flex justify-end">
            <Button
              className="bg-[#009966] text-white hover:bg-[#009966]/90 px-8 font-medium"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
