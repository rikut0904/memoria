"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getCurrentGroupId, getCurrentGroupName } from "@/lib/group";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";
import GroupSwitchButton from "@/components/GroupSwitchButton";
import DashboardButton from "@/components/DashboardButton";
import AppHeader from "@/components/AppHeader";
import TripsListButton from "@/components/TripsListButton";

type CreateTripRequest = {
  title: string;
  start_at: string;
  end_at: string;
  note: string;
  album_ids: number[];
  post_ids: number[];
  notify_at?: string;
};

export default function NewTripPage() {
  const router = useRouter();
  const params = useParams();
  const groupIdParam = params.groupId as string;
  const [user, setUser] = useState<{
    display_name: string;
    email: string;
  } | null>(null);
  const [albums, setAlbums] = useState<{ id: number; title: string }[]>([]);
  const [posts, setPosts] = useState<
    { id: number; title: string; type: string }[]
  >([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [note, setNote] = useState("");
  const [notifyAt, setNotifyAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const groupId = getCurrentGroupId();
        if (!groupId) {
          router.push("/");
          return;
        }
        const meRes = await api.get("/me");
        setUser(meRes.data);
        const [albumRes, postRes] = await Promise.all([
          api.get("/albums"),
          api.get("/posts"),
        ]);
        setAlbums(albumRes.data || []);
        setPosts(postRes.data || []);
      } catch (err) {
        console.error("Failed to fetch trip relation options:", err);
        router.push(buildLoginUrl(getCurrentPathWithQuery()));
      }
    };
    fetchOptions();
  }, [router]);

  const toDateISOString = (value: string) => {
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
      return "";
    }
    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !startAt || !endAt) {
      setError("必須項目を入力してください");
      return;
    }

    const startISO = toDateISOString(startAt);
    const endISO = toDateISOString(endAt);
    if (!startISO || !endISO) {
      setError("日付の形式が正しくありません");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateTripRequest = {
        title,
        start_at: startISO,
        end_at: endISO,
        note,
        album_ids: selectedAlbumIds,
        post_ids: selectedPostIds,
      };
      if (notifyAt) {
        const notifyISO = toDateISOString(notifyAt);
        if (!notifyISO) {
          setError("通知日時の形式が正しくありません");
          setSaving(false);
          return;
        }
        payload.notify_at = notifyISO;
      }

      const res = await api.post("/trips", payload);
      router.push(`/${groupIdParam}/trips/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create trip:", err);
      setError(getErrorMessage(err, "旅行の作成に失敗しました"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        maxWidthClassName="max-w-4xl"
        displayName={user?.display_name}
        email={user?.email}
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
            <DashboardButton label="ダッシュボードへ" />
            <TripsListButton />
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getCurrentGroupName() && <h1>{getCurrentGroupName()}</h1>}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              旅行タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="例: 京都旅行"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日時
              </label>
              <input
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日時
              </label>
              <input
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通知日（任意）
            </label>
            <input
              type="date"
              value={notifyAt}
              onChange={(e) => setNotifyAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={5}
              placeholder="旅のメモや予定など"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              紐づけるアルバム（任意）
            </label>
            <select
              multiple
              value={selectedAlbumIds.map(String)}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(
                  (option) => Number(option.value),
                );
                setSelectedAlbumIds(values);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {albums.length === 0 && (
                <option value="" disabled>
                  アルバムがありません
                </option>
              )}
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              紐づける投稿（任意）
            </label>
            <select
              multiple
              value={selectedPostIds.map(String)}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(
                  (option) => Number(option.value),
                );
                setSelectedPostIds(values);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {posts.length === 0 && (
                <option value="" disabled>
                  投稿がありません
                </option>
              )}
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title || "(タイトルなし)"} ({post.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <TripsListButton label="キャンセル" />
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "作成中..." : "作成する"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
