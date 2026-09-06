"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const CONTACT_EMAIL = "contact@ml.omoide-memoria.com";

const CATEGORY_OPTIONS = [
  { value: "account", label: "アカウント・ログインに関する質問" },
  { value: "group", label: "グループ・招待に関する質問" },
  { value: "post", label: "投稿・アルバム・写真に関する質問" },
  { value: "travel", label: "旅行計画に関する質問" },
  { value: "bug", label: "不具合・エラーの報告" },
  { value: "feature", label: "機能のリクエスト・改善要望" },
  { value: "general", label: "その他のお問い合わせ" },
];

export default function ContactPage() {
  const [category, setCategory] = useState("account");
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!subject.trim() || !message.trim()) {
      setError("件名と内容を入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category,
          contact_name: name.trim(),
          contact_email: email.trim(),
        }),
      });
      if (!res.ok) throw new Error("送信に失敗しました");
      setFeedback("お問い合わせを送信しました。返信はメールにてお送りします。");
      setShowConfirm(true);
      setSubject("");
      setMessage("");
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing min-h-screen bg-[var(--background)]">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              お問い合わせ
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              memoriaに関するご質問や不具合の報告をお送りください
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  カテゴリ
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  件名
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="例: グループの作成ができない"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  内容
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="できるだけ具体的に状況をご記載ください"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  第三者情報を含む場合は、必要最小限の記載に留めてください。
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    お名前
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 山田 太郎"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    連絡先メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              {feedback && !showConfirm && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {feedback}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "送信中..." : "送信する"}
                </button>
              </div>
            </form>
          </div>

          {/* 送信完了ダイアログ */}
          {showConfirm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setShowConfirm(false)}
            >
              <div
                className="bg-white dark:bg-[#1e1e1e] rounded-xl p-8 max-w-md mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  お問い合わせ受付完了
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  送信内容を確認し、順次対応します。
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                  <p>1週間以内に{email || "ご連絡先"}にて返信します。</p>
                  <p>
                    返信がない場合はお手数ですが{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </a>{" "}
                    にご連絡ください。
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
