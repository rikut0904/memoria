"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { getCurrentGroupName } from "@/lib/group";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";
import AppHeader from "@/components/AppHeader";
import GroupNavigationMenu from "@/components/GroupNavigationMenu";

type User = {
  display_name: string;
  email: string;
};

type Album = {
  id: number;
  title: string;
  description: string;
};

export default function AlbumsPage() {
  const router = useRouter();
  const params = useParams();
  const groupIdParam = params.groupId as string;
  const [user, setUser] = useState<User | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const [userRes, albumsRes] = await Promise.all([
          api.get("/me"),
          api.get<Album[]>("/albums"),
        ]);
        setUser(userRes.data);
        setAlbums(albumsRes.data || []);
      } catch {
        router.replace(buildLoginUrl(getCurrentPathWithQuery()));
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        displayName={user?.display_name}
        email={user?.email}
        menuItems={<GroupNavigationMenu groupId={groupIdParam} />}
      />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {getCurrentGroupName() && <h1>{getCurrentGroupName()}のアルバム一覧</h1>}
        {albums.length === 0 ? (
          <div className="card text-center text-gray-600">
            アルバムがありません
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <article key={album.id} className="card">
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gray-200 text-4xl">
                  📷
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {album.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {album.description || "説明はありません"}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
