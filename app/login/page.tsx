import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
