"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { 
  Eye, 
  EyeOff, 
  Package, 
  ShoppingCart, 
  ReceiptText, 
  PieChart, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  // Already logged-in redirect
  useEffect(() => {
    const hasTokenCookie = document.cookie.includes("token=");
    
    if (user && hasTokenCookie) {
      const role = user.role;
      if (role === "super_admin") window.location.href = "/dashboard/super-admin";
      else if (role === "admin") window.location.href = "/dashboard/admin";
      else if (role === "inventory") window.location.href = "/dashboard/inventory";
      else window.location.href = "/dashboard/staff";
    } else if (user && !hasTokenCookie) {
      useUserStore.getState().logout();
    }
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirmLoading, setIsFirmLoading] = useState(true);
  const [firmInfo, setFirmInfo] = useState<{ firm_name: string; logo: string | null } | null>(null);

  const setAuth = useUserStore((s) => s.setAuth);

  useEffect(() => {
    // Fetch firm info based on hostname
    const fetchFirmInfo = async () => {
      try {
        const res = await api.get(`/system-settings`);
        if (res.data && res.data.firm_name) {
          setFirmInfo({
            firm_name: res.data.firm_name,
            logo: res.data.logo_url || null
          });
        }
      } catch (err) {
        console.error("Failed to fetch firm info:", err);
      } finally {
        setIsFirmLoading(false);
      }
    };
    fetchFirmInfo();
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      toast.success("Logged in successfully");

      document.cookie = `token=${res.data.token}; path=/; SameSite=Lax`;
      document.cookie = `role=${res.data.user.role}; path=/; SameSite=Lax`;

      const role = res.data.user.role;
      setAuth(
        res.data.token,
        res.data.refresh_token,
        res.data.user,
        res.data.user.permissions
      );

      if (role === "super_admin") window.location.href = "/dashboard/super-admin";
      else if (role === "admin") window.location.href = "/dashboard/admin";
      else if (role === "inventory") window.location.href = "/dashboard/inventory";
      else window.location.href = "/dashboard/staff";
    } catch (err: unknown) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  if (isFirmLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e6f7ef] to-[#d1f0e1] relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#009966] opacity-10 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <div className="relative w-24 h-24 mb-8 flex items-center justify-center bg-white/60 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-emerald-200/60 border border-white/80">
            <Loader2 className="w-10 h-10 text-[#009966] animate-spin absolute" />
            <div className="w-4 h-4 bg-[#009966] rounded-full animate-ping opacity-75"></div>
          </div>
          <h2 className="text-2xl font-extrabold text-[#004d33] tracking-tight mb-2 animate-pulse">
            Authenticating Workspace
          </h2>
          <p className="text-[#006644] font-medium text-sm max-w-xs text-center opacity-80">
            Establishing secure connection to your environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#f3fbf7]">
      {/* LEFT COLUMN - Brand & Features (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center relative p-12 xl:p-20 overflow-hidden bg-gradient-to-br from-[#e6f7ef] to-[#d1f0e1]">
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#009966] opacity-10 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 w-full max-w-2xl">
          {/* Logo Area */}
          <div className="flex items-center space-x-4 mb-12">
             <img 
               src={firmInfo?.logo || "/logo.png"} 
               alt="Logo" 
               className="w-16 h-16 object-contain drop-shadow-md" 
             />
             <span className="text-4xl font-extrabold text-[#009966] tracking-tight">
               {firmInfo ? firmInfo.firm_name : "BBMedX+"}
             </span>
          </div>

          <h1 className="text-5xl font-extrabold text-[#004d33] leading-tight mb-4 tracking-tight">
            Smart Medicine.<br/>
            <span className="text-[#009966]">Stronger Business.</span>
          </h1>
          <p className="text-lg text-[#006644] mb-12 max-w-lg">
            Complete Medicine & Inventory Management System for Modern Healthcare Businesses.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm text-[#009966]">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#004d33]">Inventory</h3>
                <p className="text-sm text-[#006644] mt-1 leading-relaxed">Real-time stock tracking</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm text-[#009966]">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#004d33]">Purchase</h3>
                <p className="text-sm text-[#006644] mt-1 leading-relaxed">Manage suppliers & purchases</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm text-[#009966]">
                <ReceiptText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#004d33]">Sales</h3>
                <p className="text-sm text-[#006644] mt-1 leading-relaxed">POS, invoices & returns</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm text-[#009966]">
                <PieChart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#004d33]">Accounting</h3>
                <p className="text-sm text-[#006644] mt-1 leading-relaxed">Journals, ledger & financials</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm text-[#009966]">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#004d33]">Customers</h3>
                <p className="text-sm text-[#006644] mt-1 leading-relaxed">CRM, credit limit & loyalty</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white p-3 rounded-2xl shadow-sm text-[#009966]">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#004d33]">Reports</h3>
                <p className="text-sm text-[#006644] mt-1 leading-relaxed">Analytics & smart insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white lg:bg-transparent lg:shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-20">
        <div className="w-full max-w-md bg-white rounded-3xl lg:shadow-2xl shadow-none p-8 sm:p-10 border border-gray-100/50">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back 👋</h2>
            <p className="text-sm text-gray-500 font-medium">
              Sign in to access your {firmInfo ? firmInfo.firm_name : "BBMedX"} account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                required
                className="h-12 px-4 rounded-xl border-gray-200 focus-visible:ring-[#009966] focus-visible:border-[#009966] focus-visible:ring-1 transition-shadow shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="h-12 px-4 pr-12 rounded-xl border-gray-200 focus-visible:ring-[#009966] focus-visible:border-[#009966] focus-visible:ring-1 transition-shadow shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#009966] focus:ring-[#009966]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-semibold text-[#009966] hover:text-[#007a52] transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-white rounded-xl font-bold text-base bg-[#009966] hover:bg-[#008a5c] shadow-lg shadow-[#009966]/20 transition-all hover:shadow-[#009966]/30 hover:-translate-y-0.5 mt-2"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login →"}
            </Button>
          </form>


          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
             <CheckCircle2 size={14} className="text-[#009966] mr-1.5" />
             Your data is protected with enterprise-grade security
          </div>

        </div>
        
        {/* Absolute Footer */}
        <div className="absolute bottom-6 w-full text-center text-xs text-gray-400 font-medium hidden lg:block">
           © {new Date().getFullYear()} BBMedX — Medicine & Inventory System. All rights reserved.
        </div>
      </div>
    </div>
  );
}
