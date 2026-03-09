"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Building, LogOut, Mail, Settings, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoleBadge } from "./role-badge";
import { signOut } from "@/server/actions/auth-actions";

type CurrentUser = (typeof authClient.$Infer)["Session"]["user"];

export function UserProfile({ currentUser }: { currentUser: CurrentUser }) {
  const router = useRouter();
  async function handleLogout() {
    await signOut();
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarFallback className="bg-blue-500 text-white font-semibold">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3 p-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-500 text-white font-semibold text-lg">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentUser.name || "User"}
                </p>
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-gray-500" />
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Role:</span>
                <RoleBadge
                  role={
                    (currentUser.role as "admin" | "data_entry" | "viewer") ||
                    "viewer"
                  }
                />
              </div>

              <div className="flex items-center space-x-1">
                <Building className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  Department of Youth and Sports
                </span>
              </div>

              {currentUser.role === "admin" && (
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">
                    Administrator Privileges
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/profile" className="flex gap-2">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/settings" className="flex gap-2">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
