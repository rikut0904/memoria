"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { clearAuthToken, setAuthToken } from "@/lib/auth";

function ClerkTokenBridge() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { clearAuthToken(); return; }
    void getToken().then((token) => token ? setAuthToken(token) : clearAuthToken());
  }, [getToken, isLoaded, isSignedIn]);
  return null;
}

export default function ClerkShell({ children }: { children: React.ReactNode }) {
  return <ClerkProvider><ClerkTokenBridge />{children}</ClerkProvider>;
}
