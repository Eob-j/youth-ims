import {
  AuthCard,
  AuthLayout,
  authButtonClass,
} from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import Link from "next/link";

export default function EmailVerifiedPage() {
  return (
    <AuthLayout>
      <AuthCard
        icon={CircleCheck}
        tone="success"
        title="Email confirmed"
        description="Your account is now active. Sign in with your email and the password your administrator gave you."
        footer="For your security, change your password after signing in, under Profile → Security."
      >
        <Button asChild className={authButtonClass}>
          <Link href="/login">Sign in</Link>
        </Button>
      </AuthCard>
    </AuthLayout>
  );
}
