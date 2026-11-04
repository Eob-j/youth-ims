import {
  AuthCard,
  AuthLayout,
  authButtonClass,
} from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function InvalidTokenPage() {
  return (
    <AuthLayout>
      <AuthCard
        icon={TriangleAlert}
        tone="error"
        title="This link is invalid or has expired"
        description="Invite links work only once and expire after 24 hours. If you've already confirmed your email, you can sign in."
        footer="Need a new link? Ask your system administrator to send you a new invite."
      >
        <Button asChild className={authButtonClass}>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthCard>
    </AuthLayout>
  );
}
