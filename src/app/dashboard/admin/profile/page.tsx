"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { User, Lock, Save, ShieldCheck, Mail, Briefcase, Check } from "lucide-react";
import { notification } from "antd";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.post("/user/profile", { name, email });
      setUser(res.data.user);
      notification.success({
        message: "Profile Updated",
        description: "Your personal details have been updated successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notification.error({
        message: "Password Mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    if (newPassword.length < 6) {
      notification.error({
        message: "Invalid Password",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoadingPwd(true);
    try {
      await api.post("/user/password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      notification.success({
        message: "Password Updated",
        description: "Your password has been successfully changed.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      notification.error({
        message: "Update Failed",
        description: error.response?.data?.message || "Failed to change password. Please check your current password.",
      });
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Profile" },
          ]}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account details and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Details Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#009966]/20 to-[#009966]/5 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-[#009966] text-white flex items-center justify-center rounded-xl font-bold text-3xl shadow-lg border-4 border-white absolute -top-10">
                {user?.name?.[0] ?? "U"}
              </div>
              <div className="pt-12">
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <div className="flex items-center text-sm text-[#009966] font-medium mt-1">
                  <ShieldCheck size={14} className="mr-1" /> {user?.role?.toUpperCase() || 'USER'}
                </div>

                <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mt-2">
                    <Briefcase size={16} className="text-gray-400 mr-3" />
                    <span className="text-sm capitalize">{user?.role} Access</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingProfile || (name === user?.name && email === user?.email)}
                    className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm flex items-center justify-center"
                  >
                    {loadingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-[#009966] rounded-lg">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Security Settings</h3>
                <p className="text-sm text-gray-500">Update your password to keep your account secure.</p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent transition-all"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loadingPwd}
                    className="flex items-center justify-center w-full px-4 py-2.5 bg-[#009966] text-white rounded-lg hover:bg-[#007f55] transition-colors font-medium disabled:opacity-70"
                  >
                    {loadingPwd ? (
                      <span className="animate-pulse">Updating...</span>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
