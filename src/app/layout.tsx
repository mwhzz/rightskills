import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { MAINTENANCE_MODE } from "@/lib/maintenance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bn",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Skills Bangladesh",
    template: "%s · Skills Bangladesh",
  },
  description:
    "Buy job-ready skill courses in Bangladesh. Learn web development, design, English, Excel, and freelance — prices in taka, checkout with bKash or Nagad.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {MAINTENANCE_MODE ? null : <AppHeader />}
        <main className="flex-1">{children}</main>
        {MAINTENANCE_MODE ? null : <SiteFooter />}
      </body>
    </html>
  );
}
