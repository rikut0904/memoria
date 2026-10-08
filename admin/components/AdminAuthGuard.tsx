"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get("/me")
      .then((response) => {
        if (!active) return;
        if (response.data?.role !== "admin") {
          window.location.replace(APP_BASE_URL);
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (!active) return;
        router.replace(buildLoginUrl(getCurrentPathWithQuery()));
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">権限を確認しています...</p>
      </div>
    );
  }

  return <>{children}</>;
}
