import {
  AuthCard,
  AuthLayout,
  authButtonClass,
} from "@/components/auth-layout";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <AuthLayout>
      {!token || error ? (
        <AuthCard
          icon={TriangleAlert}
          tone="error"
          title="This reset link is invalid or has expired"
          description="Password reset links work only once and expire after 1 hour."
          footer="Need a new link? Ask your system administrator to send you another password reset email."
        >
          <Button asChild className={authButtonClass}>
            <Link href="/login">Go to sign in</Link>
          </Button>
        </AuthCard>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthLayout>
  );
}
