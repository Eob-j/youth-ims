import { AuthCard, AuthLayout } from "@/components/auth-layout";
import { ConfirmEmailButton } from "@/components/forms/confirm-email-button";
import { confirmEmail } from "@/server/actions/verify-email";
import { MailCheck } from "lucide-react";
import { redirect } from "next/navigation";

const steps = [
  "Confirm your email address below.",
  "Sign in with your email and the password your administrator gave you.",
  "Change your password under Profile → Security.",
];

// Opening the invite link only shows this page; the email is verified when
// the button is pressed. Email security scanners that open links
// automatically therefore cannot verify an account on their own.
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/invalid-token");

  return (
    <AuthLayout>
      <AuthCard
        icon={MailCheck}
        tone="info"
        title="Welcome to Youth IMS"
        description="You've been invited to the Youth Information Management System. Confirm your email address to activate your account."
        footer="Not expecting this invite? You can ignore it, or contact your system administrator."
      >
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {index + 1}
              </span>
              <span className="pt-0.5 text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
        <form action={confirmEmail}>
          <input type="hidden" name="token" value={token} />
          <ConfirmEmailButton />
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
