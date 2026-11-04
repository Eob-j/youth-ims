"use client";

import { AuthCard, authButtonClass } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { passwordForm } from "@/lib/validations/user-management";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

function Requirement({ met, children }: { met: boolean; children: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-sm",
        met ? "text-green-700" : "text-gray-500",
      )}
    >
      {met ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Circle className="size-4" aria-hidden />
      )}
      <span>
        {children}
        <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
      </span>
    </li>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof passwordForm>>({
    resolver: zodResolver(passwordForm),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const [password, confirmPassword] = useWatch({
    control: form.control,
    name: ["password", "confirmPassword"],
  });

  async function onSubmit(values: z.infer<typeof passwordForm>) {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      toast.error(
        error.code === "INVALID_TOKEN"
          ? "This reset link is invalid or has expired. Please ask your administrator for a new one."
          : error.message || "Unable to reset password.",
      );
      return;
    }

    toast.success("Password reset successfully. Please sign in.");
    router.push("/login");
  }

  const inputType = showPassword ? "text" : "password";

  return (
    <AuthCard
      icon={KeyRound}
      tone="info"
      title="Choose a new password"
      description="Your administrator sent you this link to reset your password. Pick a new one to sign in with."
      footer="After resetting, you'll be signed out everywhere and can sign in with the new password."
    >
      <Form {...form}>
        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="text-black">
                <FormLabel>New password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      type={inputType}
                      autoComplete="new-password"
                      className="p-5 pr-12"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="text-black">
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={inputType}
                    autoComplete="new-password"
                    className="p-5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ul className="space-y-1.5 rounded-md bg-gray-50 p-3" aria-live="polite">
            <Requirement met={password.length >= 8 && password.length <= 20}>
              8 to 20 characters
            </Requirement>
            <Requirement
              met={password.length > 0 && password === confirmPassword}
            >
              Both passwords match
            </Requirement>
          </ul>

          <Button
            className={authButtonClass}
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
