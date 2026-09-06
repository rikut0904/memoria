"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import VerticalAd from "@/components/VerticalAd";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
const ADMIN_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "http://localhost:3002";
const HELP_BASE_URL = process.env.NEXT_PUBLIC_HELP_BASE_URL || "";
const INFO_BASE_URL = process.env.NEXT_PUBLIC_INFO_BASE_URL || "";
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "development";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");
const joinPath = (base: string, path: string) => {
  if (!path) return `${base}/`;
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
};

const buildRedirectUrl = (returnTo: string | null, backPath: string | null) => {
  const appBase = trimTrailingSlash(APP_BASE_URL);
  const adminBase = trimTrailingSlash(ADMIN_BASE_URL);
  const helpBase = trimTrailingSlash(HELP_BASE_URL);
  const infoBase = trimTrailingSlash(INFO_BASE_URL);
  if (!returnTo) {
    if (backPath && backPath.startsWith("/")) {
      return joinPath(appBase, backPath);
    }
    return `${appBase}/`;
  }

  const trimmed = returnTo.trim();
  if (trimmed === "") return `${appBase}/`;

  if (trimmed.startsWith("/")) return joinPath(appBase, trimmed);

  try {
    const url = new URL(trimmed);
    const allowedOrigins = new Set<string>([
      new URL(appBase).origin,
      new URL(adminBase).origin,
    ]);
    if (helpBase) allowedOrigins.add(new URL(helpBase).origin);
    if (infoBase) allowedOrigins.add(new URL(infoBase).origin);
    if (allowedOrigins.has(url.origin)) return url.toString();
  } catch {
    // ignore invalid URL
  }

  return `${appBase}/`;
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const rawReturnTo = searchParams.get("return_to");
  const rawBackPath = searchParams.get("back-path");
  const redirectUrl = buildRedirectUrl(rawReturnTo, rawBackPath);

  useEffect(() => {
    api
      .get("/me")
      .then(() => {
        window.location.replace(redirectUrl);
      })
      .catch(() => {});
  }, [redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password, back_path: "" });
      const idToken = res?.data?.id_token as string | undefined;
      const refreshToken = res?.data?.refresh_token as string | undefined;
      if (APP_ENV !== "production" && idToken) {
        const url = new URL(redirectUrl);
        url.searchParams.set("auth_token", idToken);
        if (refreshToken) {
          url.searchParams.set("refresh_token", refreshToken);
        }
        window.location.replace(url.toString());
        return;
      }
      window.location.replace(redirectUrl);
    } catch (err) {
      const code = axios.isAxiosError(err) ? err.response?.data?.code : "";
      const message = getErrorMessage(
        err,
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
      );
      if (code === "EMAIL_NOT_VERIFIED") {
        setInfo(message);
      } else {
        setError(message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 auth-ads-layout">
        <div className="auth-ads-side">
          <VerticalAd />
        </div>
        <div className="card w-full max-w-md auth-ads-main">
          <p className="text-center text-gray-600 mb-8">
            大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                サインアップ
              </button>
            </p>
          </div>
        </div>
        <div className="auth-ads-side">
          <VerticalAd />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
