"use client";

import { useEffect } from "react";
import { clearAuthToken, clearRefreshToken } from "@/lib/auth";
import { readLogoutSignal } from "@/lib/logoutSync";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";

const SEEN_KEY = "memoria_logout_seen";

export default function LogoutSync() {
  useEffect(() => {
    const check = () => {
      const ts = readLogoutSignal();
      if (!ts) return;
      const seen = Number(window.localStorage.getItem(SEEN_KEY) || "0");
      if (ts <= seen) return;

      window.localStorage.setItem(SEEN_KEY, String(ts));
      clearAuthToken();
      clearRefreshToken();

      window.location.replace(buildLoginUrl(getCurrentPathWithQuery()));
    };

    check();
    const id = window.setInterval(check, 2000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
