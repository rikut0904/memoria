"use client";

import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:23000";
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "http://localhost:23002";

function buildRedirectUrl(returnTo: string | null, backPath: string | null) {
  const fallback = `${APP_BASE_URL.replace(/\/$/, "")}/`;
  if (backPath?.startsWith("/")) return `${APP_BASE_URL.replace(/\/$/, "")}${backPath}`;
  if (!returnTo) return fallback;
  try {
    const url = new URL(returnTo);
    if ([new URL(APP_BASE_URL).origin, new URL(ADMIN_BASE_URL).origin].includes(url.origin)) {
      return url.toString();
    }
  } catch {
    // Invalid or untrusted redirect targets use the application home page.
  }
  return fallback;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = buildRedirectUrl(searchParams.get("return_to"), searchParams.get("back-path"));
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><LoginContent /></Suspense>;
}
