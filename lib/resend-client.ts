import { VerifyEmail } from "@/components/emails/verify-email";
import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (email: string, url: string) => {
  return await resend.emails.send({
    from: `${env.EMAIL_SENDER_NAME} <${env.EMAIL_SENDER_ADDRESS}>`,
    to: email,
    subject: "Verify your email",
    react: VerifyEmail({
      username: email,
      verifyUrl: url,
    }),
  });
};
