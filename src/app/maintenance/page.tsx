import type { Metadata } from "next";
import { MaintenanceScreen } from "@/components/maintenance-screen";

export const metadata: Metadata = {
  title: "Under maintenance",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return <MaintenanceScreen />;
}
