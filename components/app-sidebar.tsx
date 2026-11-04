"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserMinus,
  Activity,
  FileText,
  BarChart3,
  Building2,
  Trophy,
  GraduationCap,
  Globe,
  UserCircle,
  AlertTriangle,
  Award,
  DollarSign,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-sky-500",
  },
  {
    title: "Youth Population",
    url: "/youth-population",
    icon: Users,
    iconColor: "text-violet-500",
  },
  {
    title: "Youth with Disabilities",
    url: "/youth-with-disabilities",
    icon: UserPlus,
    iconColor: "text-violet-500",
  },
  {
    title: "Youth without Disabilities",
    url: "/youth-without-disabilities",
    icon: UserMinus,
    iconColor: "text-violet-500",
  },
  {
    title: "Human Trafficking",
    url: "/human-trafficking",
    icon: AlertTriangle,
    iconColor: "text-red-500",
  },
  {
    title: "Youth Migration",
    url: "/youth-migration",
    icon: Globe,
    iconColor: "text-red-500",
  },
  {
    title: "NYC",
    url: "/nyc-activities",
    icon: Activity,
    iconColor: "text-blue-500",
  },
  {
    title: "NSC",
    url: "/nsc",
    icon: Trophy,
    iconColor: "text-orange-500",
  },
  {
    title: "NYSS",
    url: "/nyss",
    icon: GraduationCap,
    iconColor: "text-orange-500",
  },
  {
    title: "PIA",
    url: "/pia-students",
    icon: Award,
    iconColor: "text-yellow-500",
  },
  {
    title: "NEDI",
    url: "/nedi-programs",
    icon: Building2,
    iconColor: "text-green-500",
  },
  {
    title: "Indicator Data",
    url: "/indicator-data",
    icon: BarChart3,
    iconColor: "text-green-500",
  },
  {
    title: "Sports Financing",
    url: "/sports-financing",
    icon: DollarSign,
    iconColor: "text-emerald-500",
  },
  // {
  //   title: "Activity Log",
  //   url: "/activity-log",
  //   icon: FileText,
  //   iconColor: "text-gray-500",
  // },
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCircle,
    iconColor: "text-gray-500",
    // Only shown to admins; the page itself also refuses everyone else.
    adminOnly: true,
  },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const visibleItems = navigationItems.filter(
    (item) => isAdmin || !item.adminOnly,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto">
              <Link href="/" className="flex items-center gap-2">
                <div
                  className={cn(
                    " shrink-0 bg-white shadow-sm  rounded-lg ",
                    open ? "size-10 p-1" : "size-5",
                  )}
                >
                  <Image
                    width={200}
                    height={200}
                    src="/images/moys-logo.jpg"
                    alt="Ministry of Youth and Sports Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Youth IMS</h2>
                  <p className="text-xs text-gray-500">
                    Ministry of Youth & Sports
                  </p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-6 py-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-col gap-1 text-xs text-muted-foreground">
            {open && (
              <div className="text-center">
                <div>Ministry of Youth & Sports</div>
                <span>© {new Date().getFullYear()}</span>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
