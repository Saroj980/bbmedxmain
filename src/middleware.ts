import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const { pathname } = req.nextUrl;

  // 1️⃣ If no token, protect dashboard routes
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2️⃣ Role-based route protection
  if (pathname.startsWith("/dashboard")) {
    // Role: admin
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    // Role: inventory
    if (pathname.startsWith("/dashboard/inventory") && role !== "inventory" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    // Role: staff
    if (pathname.startsWith("/dashboard/staff") && role !== "staff" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
