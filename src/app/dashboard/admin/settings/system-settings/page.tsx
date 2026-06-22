"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Receipt, Globe, Image as ImageIcon, Briefcase, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<any>({
    firm_name: "",
    address: "",
    contact_number: "",
    email: "",
    pan_no: "",
    vat_no: "",
    is_vat_registered: false,
    currency: "NPR",
    currency_symbol: "Rs.",
    fiscal_year_start: "",
    fiscal_year_end: "",
    receipt_header: "",
    receipt_footer: "",
    meta: {},
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/system-settings");
      // Sanitize fields to avoid uncontrolled input warnings
      const sanitizedData = {
        ...settings,
        ...res.data,
      };
      
      // Convert null/undefined values; also force is_vat_registered to strict boolean
      Object.keys(sanitizedData).forEach(key => {
        if (key === 'is_vat_registered') {
          sanitizedData[key] = !!sanitizedData[key]; // covers null, 0, 1, true, false
        } else if (sanitizedData[key] === null) {
          if (key === 'meta') {
            sanitizedData[key] = {};
          } else {
            sanitizedData[key] = "";
          }
        }
      });

      setSettings(sanitizedData);
      
      if (res.data.logo) {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");
        setLogoPreview(`${baseUrl}/storage/${res.data.logo}`);
      }
    } catch (err) {
      toast.error("Failed to fetch settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const isChecked = type === "checkbox" ? (e.target as any).checked : false;

    setSettings((prev: any) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? isChecked : value,
      };

      // logic: vat no will be pan no of the firm if registered on vat
      if (updated.is_vat_registered) {
        updated.vat_no = updated.pan_no;
      }

      return updated;
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const skipKeys = ["id", "created_at", "updated_at", "logo"]; // logo handled separately below
    Object.keys(settings).forEach((key) => {
      if (skipKeys.includes(key)) return;
      if (key === "meta") {
        formData.append(key, JSON.stringify(settings[key]));
      } else if (key === "is_vat_registered") {
        formData.append(key, settings[key] ? "1" : "0");
      } else {
        formData.append(key, settings[key] ?? "");
      }
    });

    if (logoFile) {
      formData.append("logo", logoFile); // only append real File objects
    }

    try {
      await api.post("/system-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Settings updated successfully");
      fetchSettings();
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Settings", href: "/dashboard/admin/settings" },
          { label: "System Settings" },
        ]}
      />
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-[#2F3E46]">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure your organization's identity and ERP preferences.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-[#009966] hover:bg-[#008456] text-white px-8 shadow-lg transition-transform hover:scale-105"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Essential Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 size={20} className="text-[#009966]" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firm_name">Firm/Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input 
                      id="firm_name" name="firm_name" value={settings.firm_name} 
                      onChange={handleChange} className="pl-10" placeholder="e.g. HealthCare Pharmacy" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input 
                      id="email" name="email" value={settings.email} 
                      onChange={handleChange} className="pl-10" placeholder="support@firm.com" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <Input 
                    id="address" name="address" value={settings.address} 
                    onChange={handleChange} className="pl-10" placeholder="Street, City, Country" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input 
                      id="contact_number" name="contact_number" value={settings.contact_number} 
                      onChange={handleChange} className="pl-10" placeholder="+977-98XXXXXXXX" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan_no">PAN/Tax Number</Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input 
                      id="pan_no" name="pan_no" value={settings.pan_no} 
                      onChange={handleChange} className="pl-10" placeholder="e.g. 600XXXXXXXX" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase size={20} className="text-[#009966]" />
                Taxation & Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-xl border border-green-100">
                <input 
                  type="checkbox" id="is_vat_registered" name="is_vat_registered"
                  checked={settings.is_vat_registered} onChange={handleChange}
                  className="w-5 h-5 accent-[#009966]"
                />
                <Label htmlFor="is_vat_registered" className="cursor-pointer">
                  This firm is registered for VAT
                </Label>
                {settings.is_vat_registered && (
                  <div className="ml-auto flex items-center gap-2">
                    <Label htmlFor="vat_no">VAT No (Same as PAN):</Label>
                    <Input 
                      id="vat_no" name="vat_no" value={settings.vat_no} 
                      onChange={handleChange} className="w-40 h-8 bg-gray-50" 
                      placeholder="VAT #" disabled
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency Code</Label>
                  <Input id="currency" name="currency" value={settings.currency} onChange={handleChange} placeholder="e.g. NPR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input id="currency_symbol" name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} placeholder="e.g. रु." />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt size={20} className="text-[#009966]" />
                Receipt Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt_header">Header Text (Appears on Billing)</Label>
                <textarea 
                  id="receipt_header" name="receipt_header" value={settings.receipt_header} 
                  onChange={handleChange as any} rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Welcome to our store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt_footer">Footer Text (Appears on Billing)</Label>
                <textarea 
                  id="receipt_footer" name="receipt_footer" value={settings.receipt_footer} 
                  onChange={handleChange as any} rows={2}
                   className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Thank you for your visit!"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Logo & Meta */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon size={20} className="text-[#009966]" />
                Brand Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative group w-48 h-48 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 mb-4 transition-all hover:border-[#009966]">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-[#009966]">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs uppercase font-bold tracking-wider">No Logo</p>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Change Logo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed uppercase font-bold tracking-widest">
                Recommended: Square PNG/SVG<br/>Max size: 2MB
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[#2F3E46] text-white overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium opacity-80">ERP Engine Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-sm font-medium opacity-80">Sync Status: Real-time</span>
              </div>
              <div className="pt-4 mt-6 border-t border-white/10 text-[11px] uppercase tracking-widest font-bold opacity-40">
                Firm ID: {settings.id || 'NEW'}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
