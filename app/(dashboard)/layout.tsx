import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getServerSideSession } from "@/lib/auth-helper";
import type React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Decided on the server, so admin-only links never flash for other users.
  const session = await getServerSideSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <SidebarProvider className="flex">
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex-1">
        <Header isAdmin={isAdmin} />
        <main className="overflow-auto p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
