"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";
import AppHeader from "@/components/AppHeader";
import GroupSwitchButton from "@/components/GroupSwitchButton";

interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
}

type InquiryStatus = "pending" | "in_progress" | "resolved";

interface AdminInquiry {
  id: number;
  subject: string;
  message: string;
  category: string;
  status: InquiryStatus;
  contact_name: string;
  contact_email: string;
  user_id: string;
  user_name: string;
  user_email: string;
  thread_id: string;
  created_at: string;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ja-JP");
};

const statusLabel = (status?: InquiryStatus) => {
  switch (status) {
    case "pending":
      return "対応前";
    case "in_progress":
      return "対応中";
    case "resolved":
      return "対応済み";
    default:
      return "-";
  }
};

const statusBadgeClass = (status?: InquiryStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("");
  const [statusFilters, setStatusFilters] = useState<InquiryStatus[]>([
    "pending",
    "in_progress",
  ]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const meRes = await api.get("/me");
        setCurrentUser(meRes.data);

        if (meRes.data.role !== "admin") {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push(buildLoginUrl(getCurrentPathWithQuery()));
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [router]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;

    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/admin/inquiries");
        setItems(res.data || []);
      } catch (err) {
        console.error("failed to fetch inquiries", err);
        setError("お問い合わせ一覧の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [currentUser]);

  const categoryOptions = useMemo(() => {
    const values = new Set(items.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(values)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = userFilter.trim().toLowerCase();
    const hasQuery = query.length > 0;
    return items.filter((item) => {
      if (!statusFilters.includes(item.status)) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter)
        return false;
      if (!hasQuery) return true;
      const userText = [
        item.user_name,
        item.user_email,
        item.contact_name,
        item.contact_email,
        item.user_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return userText.includes(query);
    });
  }, [items, userFilter, statusFilters, categoryFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [filteredItems, sortDirection]);

  const toggleStatus = (status: InquiryStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((v) => v !== status)
        : [...prev, status],
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin">
      <AppHeader
        displayName={currentUser?.display_name}
        email={currentUser?.email}
        right={<GroupSwitchButton label="グループ一覧へ" />}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            管理トップへ戻る
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            お問い合わせ一覧
          </h2>
          <p className="text-gray-600 mt-1">
            送信されたお問い合わせの内容を確認できます
          </p>
        </div>

        <div className="card">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="space-y-1">
              <label
                htmlFor="inquiry-user-filter"
                className="block text-sm font-medium text-gray-700"
              >
                ユーザー
              </label>
              <input
                id="inquiry-user-filter"
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="名前・メールで検索"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <span className="block text-sm font-medium text-gray-700">
                対応状況
              </span>
              <div className="flex flex-wrap gap-3 text-sm pt-1">
                {(
                  ["pending", "in_progress", "resolved"] as InquiryStatus[]
                ).map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{statusLabel(status)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="inquiry-category-filter"
                className="block text-sm font-medium text-gray-700"
              >
                カテゴリ
              </label>
              <select
                id="inquiry-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "すべて" : option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="block text-sm font-medium text-gray-700">
                表示順
              </span>
              <button
                type="button"
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {sortDirection === "asc" ? "古い順" : "新しい順"}
              </button>
            </div>
          </div>

          {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!isLoading && sortedItems.length === 0 && !error && (
            <p className="text-sm text-gray-500">
              お問い合わせはまだありません
            </p>
          )}

          {sortedItems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600 min-w-[160px]">
                      受信日時
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 min-w-[100px]">
                      対応状況
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 min-w-[120px]">
                      カテゴリ
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 min-w-[200px]">
                      件名
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 min-w-[200px]">
                      ユーザー
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600 min-w-[80px]">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 text-gray-700">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(item.status)}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        {item.category || "-"}
                      </td>
                      <td className="py-3 px-2 text-gray-900">
                        {item.subject || "-"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-gray-900">
                          {item.contact_name ||
                            item.user_name ||
                            item.user_id ||
                            "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.contact_email || item.user_email || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/inquiries/${item.id}`}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
