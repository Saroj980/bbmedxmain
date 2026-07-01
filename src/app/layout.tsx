import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import "antd/dist/reset.css";

const outfit = localFont({
  src: "../fonts/Outfit/Outfit-VariableFont_wght.ttf",
  variable: "--font-outfit",
  display: "swap",
});

import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const hostname = host.split(":")[0];
  
  let title = "BBMedX";
  let icon = "/logo.png";
  
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/api$/, "");
    const res = await fetch(`${baseUrl}/api/firm-info?domain=${hostname}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (data.firm_name && data.firm_name !== 'BBMedX') {
        title = `BBMedX - ${data.firm_name}`;
      }
      if (data.logo) {
        icon = data.logo;
      }
    }
  } catch (error) {
    console.error("Failed to fetch firm info for metadata", error);
  }

  return {
    title,
    description: "Medicine inventory system",
    icons: {
      icon,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased`}
        style={{
          fontFamily: "var(--font-outfit), sans-serif",
          "--font-title": "var(--font-outfit)",
          "--font-body": "var(--font-outfit)",
        } as React.CSSProperties}
      >
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
