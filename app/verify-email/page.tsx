import { confirmEmail } from "@/server/actions/verify-email";
import { redirect } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Confirm your email</h1>
        <p className="text-gray-700 mb-6">
          You&apos;ve been invited to the Youth Information Management System.
          Confirm your email address to finish setting up your account.
        </p>
        <form action={confirmEmail} className="flex justify-center">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="inline-block rounded bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 transition-colors"
          >
            Confirm my email
          </button>
        </form>
      </div>
    </div>
  );
}
