"use client";

import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:23000";
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "http://localhost:23002";

function buildRedirectUrl(returnTo: string | null, backPath: string | null) {
  const appBase = APP_BASE_URL.replace(/\/$/, "");
  const fallback = `${appBase}/`;

  if (backPath?.startsWith("/")) return `${appBase}${backPath}`;
  if (!returnTo) return fallback;

  try {
    const url = new URL(returnTo);
    const allowedOrigins = [
      new URL(APP_BASE_URL).origin,
      new URL(ADMIN_BASE_URL).origin,
    ];
    if (allowedOrigins.includes(url.origin)) return url.toString();
  } catch {
    // Invalid or untrusted redirect targets use the application home page.
  }

  return fallback;
}

function SignupContent() {
  const searchParams = useSearchParams();
  const redirectUrl = buildRedirectUrl(
    searchParams.get("return_to"),
    searchParams.get("back-path"),
  );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignupContent />
    </Suspense>
  );
}
