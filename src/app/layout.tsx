import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { headers } from "next/headers";
import { AppChrome } from "@/components/app-chrome";
import { MaintenanceScreen } from "@/components/maintenance-screen";
import { isMaintenanceBypass, MAINTENANCE_MODE } from "@/lib/maintenance";
import { brand } from "@/lib/brand";
import "./globals.css";

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const heading = Bricolage_Grotesque({
  variable: "--font-heading-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");
  const showMaintenance = MAINTENANCE_MODE && !isMaintenanceBypass(pathname);

  return (
    <html
      lang="en"
      className={`${sans.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-full flex-col font-sans">
        {showMaintenance ? (
          <main className="flex-1">
            <MaintenanceScreen />
          </main>
        ) : isAdmin ? (
          <main className="flex h-full min-h-0 flex-1 flex-col">{children}</main>
        ) : (
          <AppChrome>{children}</AppChrome>
        )}
      </body>
    </html>
  );
}
