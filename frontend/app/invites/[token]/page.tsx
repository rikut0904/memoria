"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { setCurrentGroup } from "@/lib/group";
import {
  buildLoginUrl,
  getCurrentPathWithQuery,
  normalizeBackPath,
} from "@/lib/backPath";

interface InviteInfo {
  email: string;
  expires_at: string;
  status: string;
  group_id: number;
  group_name: string;
  role: string;
  user_exists: boolean;
}

interface MeInfo {
  id: number;
  email: string;
  display_name: string;
  role: string;
}

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const searchParams = useSearchParams();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [me, setMe] = useState<MeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const backPath = normalizeBackPath(searchParams.get("back-path"));

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const res = await api.get(`/invites/${token}`);
        setInviteInfo(res.data);
      } catch (err) {
        setError(getErrorMessage(err, "招待が無効または期限切れです"));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyInvite();
    }
  }, [token]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const meRes = await api.get("/me");
        setMe(meRes.data);
      } catch {
        setMe(null);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (inviteInfo?.user_exists && !me) {
      router.push(buildLoginUrl(getCurrentPathWithQuery()));
    }
  }, [inviteInfo, me, router]);

  const handleAcceptExisting = async () => {
    if (!inviteInfo) return;
    setError("");
    setAccepting(true);
    try {
      await api.post(`/invites/${token}/accept`);
      setCurrentGroup(inviteInfo.group_id, inviteInfo.group_name);
      alert("グループに参加しました！");
      router.push(backPath || `/${inviteInfo.group_id}`);
    } catch (err) {
      console.error("Failed to accept invite:", err);
      setError(getErrorMessage(err, "招待の承認に失敗しました"));
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!inviteInfo) return;
    setError("");
    setDeclining(true);
    try {
      await api.post(`/invites/${token}/decline`);
      alert("招待を拒否しました");
      router.push(backPath || "/");
    } catch (err) {
      console.error("Failed to decline invite:", err);
      setError(getErrorMessage(err, "招待の拒否に失敗しました"));
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">招待を確認中...</p>
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              招待が無効です
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() =>
                router.push(buildLoginUrl(getCurrentPathWithQuery()))
              }
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              ログインページへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel =
    inviteInfo?.role === "manager" ? "グループ管理者" : "通常メンバー";

  const emailMismatch =
    inviteInfo?.user_exists && me && me.email !== inviteInfo?.email;

  if (inviteInfo?.user_exists) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              思い出memoria
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              グループ招待
            </h2>
            <p className="text-gray-600 mt-2">
              {inviteInfo.group_name}（{roleLabel}）
            </p>
          </div>

          {!me && (
            <>
              <p className="text-gray-600 mb-6">
                既にアカウントをお持ちのため、ログインして承認/拒否を選択してください。
              </p>
              <button
                onClick={() =>
                  router.push(buildLoginUrl(getCurrentPathWithQuery()))
                }
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                ログインへ
              </button>
            </>
          )}

          {me && emailMismatch && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ログイン中のメールアドレスと招待先のメールアドレスが一致しません。
            </div>
          )}

          {me && !emailMismatch && (
            <>
              <p className="text-gray-600 mb-4">
                {inviteInfo.email} のアカウントにグループ権限を付与しますか？
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptExisting}
                  disabled={accepting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {accepting ? "承認中..." : "承認"}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={declining}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {declining ? "拒否中..." : "拒否"}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              招待の有効期限:{" "}
              {new Date(inviteInfo.expires_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            思い出memoria
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            招待を受け取りました
          </h2>
          <p className="text-gray-600 mt-2">
            {inviteInfo?.email} でアカウントを作成します
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {inviteInfo?.group_name}（{roleLabel}）
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            アカウント作成とパスワード設定はClerkで行います。登録後、この招待ページに戻って招待を承認してください。
          </p>
          <button
            type="button"
            onClick={() => router.push(buildLoginUrl(getCurrentPathWithQuery()))}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Clerkでログイン・新規登録
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちですか？{" "}
            <button
              onClick={() =>
                router.push(buildLoginUrl(getCurrentPathWithQuery()))
              }
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ログイン
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            招待の有効期限:{" "}
            {new Date(inviteInfo?.expires_at || "").toLocaleDateString("ja-JP")}
          </p>
        </div>
      </div>
    </div>
  );
}
