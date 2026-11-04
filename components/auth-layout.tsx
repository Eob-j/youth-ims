import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import type React from "react";

// Shared layout for the sign-in pages (login, verify email, reset password):
// the branding panel on large screens and a card on the right.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
              <Image
                width={600}
                height={600}
                src="/images/moys-logo.jpg"
                alt="Ministry of Youth and Sports Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-800">Youth IMS</h1>
              <p className="text-xl text-gray-600">
                Information Management System
              </p>
              <div className="w-16 h-1 bg-linear-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
            </div>
          </div>
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-semibold text-gray-700">
              Department of Youth and Sports
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Empowering youth through comprehensive data management and
              strategic development initiatives across The Gambia.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Secure • Reliable • Efficient</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-red-800 leading-relaxed">
              Supported by: Actionaid International The Gambia
            </p>
            <p className="text-red-800 leading-relaxed">
              Financed through: The Youth Promotion Initiative (YPI), a
              Peacebuilding Fund (PBF) Project
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}

const tones = {
  info: "bg-blue-100 text-blue-600",
  success: "bg-green-100 text-green-600",
  error: "bg-red-100 text-red-600",
};

// The card on the right of AuthLayout, with an icon whose colour shows what
// kind of page it is.
export function AuthCard({
  icon: Icon,
  tone,
  title,
  description,
  children,
  footer,
}: {
  icon: LucideIcon;
  tone: keyof typeof tones;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 text-center pb-4">
        {/* The branding panel is hidden on small screens, so show the logo. */}
        <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg lg:hidden p-2">
          <Image
            width={600}
            height={600}
            src="/images/moys-logo.jpg"
            alt="Ministry of Youth and Sports Logo"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <div
          className={cn(
            "mx-auto w-14 h-14 rounded-full flex items-center justify-center",
            tones[tone],
          )}
        >
          <Icon className="size-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      {(children || footer) && (
        <CardContent className="space-y-6">
          {children}
          {footer && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              {footer}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// The gradient button used across the sign-in pages.
export const authButtonClass =
  "w-full h-12 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg transition-all duration-200";
