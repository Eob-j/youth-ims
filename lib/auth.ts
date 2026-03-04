import * as schema from "@/auth-schema";
import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { nextCookies } from "better-auth/next-js";

import { ac, admin, data_entry, viewer } from "./permissions";

import { VerifyEmail } from "@/components/emails/verify-email";
import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await resend.emails.send({
          from: `${env.EMAIL_SENDER_NAME} <${env.EMAIL_SENDER_ADDRESS}>`,
          to: user.email,
          subject: "Verify your email",
          react: VerifyEmail({
            username: user.name,
            verifyUrl: url,
          }),
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true,
  },
  users: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: { admin, data_entry, viewer },
      defaultRole: "viewer" as const,
    }),
    nextCookies(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
});
