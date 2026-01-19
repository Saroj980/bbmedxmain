"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";

export default function LoginPage() {
  // const router = useRouter();

  const router = useRouter();
  const user = useUserStore((s) => s.user);

  // Already logged-in redirect
  useEffect(() => {
    if (user) {
      const role = user.role;

      if (role === "admin") router.replace("/dashboard/admin");
      else if (role === "inventory") router.replace("/dashboard/inventory");
      else router.replace("/dashboard/staff");
    }
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useUserStore((s) => s.setAuth);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });

      toast.success("Logged in successfully");

      document.cookie = `token=${res.data.token}; path=/; SameSite=Lax`;
      document.cookie = `role=${res.data.user.role}; path=/; SameSite=Lax`;


      const role = res.data.user.role;
      // Store in Zustand
      setAuth(
        res.data.token,
        res.data.refresh_token,
        res.data.user,
        res.data.user.permissions
      );

      console.log("User Role:", res.data.user.permissions);

      if (role === "admin") router.push("/dashboard/admin");
      else if (role === "inventory") router.push("/dashboard/inventory");
      else router.push("/dashboard/staff");
    } catch (err: unknown) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-xl border border-border rounded-2xl bg-card">
        <CardHeader className="text-center space-y-3">
          <Image
            src="/logo.png"
            alt="BBMedX Logo"
            width={130}
            height={130}
            className="mx-auto"
          />

          <CardTitle
            className="text-3xl font-heading text-primary"
          >
            BBMedX Login
          </CardTitle>

          <p className="text-muted-foreground text-sm font-sans">
            Access your medical inventory portal
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                required
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white rounded-lg font-medium"
              disabled={loading}
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} BBMedX — Medicine & Inventory System
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
