import AdminGuard from "@/components/dashboard/AdminGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Bible Coloring Journey",
  robots: "noindex",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminGuard>
  );
}
