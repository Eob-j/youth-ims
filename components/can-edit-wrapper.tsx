import { authClient } from "@/lib/auth-client";
import type React from "react";
interface CanEditWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Server component that conditionally renders children based on user's edit permissions
 * Shows children only if user is admin or data_entry
 */
export function CanEditWrapper({
  children,
  fallback = null,
}: CanEditWrapperProps) {
  const { data } = authClient.useSession();
  const role = data?.user?.role as string | undefined;
  const hasPermission = role === "admin" || role === "data_entry";

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Todo: Implement proper permission checks to avoid unnecessary re-renders on the client. later on remove this wrapper from all component using it for permission check.
