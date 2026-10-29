"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearAuthToken, setAuthToken, setAuthTokenProvider } from "@/lib/auth";
import SiteFooter from "@/components/SiteFooter";

function ClerkTokenBridge() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setAuthTokenProvider(null);
      clearAuthToken();
      return;
    }
    setAuthTokenProvider(getToken);
    void getToken().then((token) => {
      if (token) setAuthToken(token);
      else clearAuthToken();
    });

    return () => setAuthTokenProvider(null);
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}

function AuthenticatedFooter() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  if (!isLoaded || !isSignedIn || pathname === "/") return null;
  return <SiteFooter />;
}

export default function ClerkShell({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ClerkTokenBridge />
      {children}
      <AuthenticatedFooter />
    </ClerkProvider>
  );
}
