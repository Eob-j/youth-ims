import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";
import { UserProfile } from "@/components/user-profile";
import { SidebarTrigger } from "./ui/sidebar";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { UserProfileWrapper } from "./user-profile-wrapper";

export function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="cursor-pointer" />
      <div className="flex flex-1 items-center gap-4">
        <GlobalSearch isAdmin={isAdmin} />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button> */}
        <Suspense fallback={<Skeleton className="h-9 w-9 rounded-full" />}>
          <UserProfileWrapper />
        </Suspense>
      </div>
    </header>
  );
}
