"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Sign in over HTTP so Better Auth's rate limiter applies; it does not run
    // for server-side auth.api calls.
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(
        error.status === 429
          ? "Too many sign-in attempts. Please wait a moment and try again."
          : error.message || "An unknown error occurred.",
      );
    } else {
      toast.success("Signed in successfully.");
      router.push("/dashboard");
    }

    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg lg:hidden p-2">
            <Image
              width={600}
              height={600}
              src="/images/moys-logo.jpg"
              alt="Ministry of Youth and Sports Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to access the Youth Information Management System (The
              Gambia)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="text-black">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="muhammed@example.com"
                              {...field}
                              className="p-5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="text-black">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="********"
                                {...field}
                                type="password"
                                className="p-5"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <button
                        type="button"
                        className="self-end text-sm text-blue-600 hover:underline"
                        onClick={() => setShowForgotPassword((prev) => !prev)}
                        aria-expanded={showForgotPassword}
                        aria-controls="forgot-password-help"
                      >
                        Forgot password?
                      </button>
                      {showForgotPassword && (
                        <p
                          id="forgot-password-help"
                          className="rounded-md bg-blue-50 p-3 text-sm text-gray-700"
                        >
                          Please contact your system administrator to reset
                          your password. They will send you an email with a
                          link to choose a new one.
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg transition-all duration-200"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              <p>
                © {new Date().getFullYear()} Department of Youth and Sports, The
                Gambia
              </p>
              <p className="mt-1">All rights reserved</p>
            </div>
          </Form>
        </CardContent>
      </Card>
      {/* <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div> */}
    </div>
  );
}
