import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import Link from "next/link";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-red-50 to-orange-50 p-6">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Invalid or Expired Link
          </h1>
          <p className="text-gray-700 mb-6">
            This password reset link is invalid or has expired. Please contact
            your system administrator to send you a new one.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-block rounded bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}
