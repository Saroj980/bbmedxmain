import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import "antd/dist/reset.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",

});

const opensans = Open_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body", 
  display: "swap",
});

export const metadata: Metadata = {
  title: "BBMedX",
  description: "Medicine inventory system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${opensans.variable} antialiased`}
      >
        {children}

        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
