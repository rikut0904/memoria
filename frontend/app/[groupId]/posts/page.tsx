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

type Post = {
  id: number;
  title: string;
  body: string;
  published_at: string;
};

export default function PostsPage() {
  const router = useRouter();
  const params = useParams();
  const groupIdParam = params.groupId as string;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          api.get("/me"),
          api.get<Post[]>("/posts"),
        ]);
        setUser(userRes.data);
        setPosts(postsRes.data || []);
      } catch {
        router.replace(buildLoginUrl(getCurrentPathWithQuery()));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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
        {getCurrentGroupName() && <h1>{getCurrentGroupName()}の投稿一覧</h1>}
        {posts.length === 0 ? (
          <div className="card text-center text-gray-600">投稿がありません</div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article key={post.id} className="card">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">
                  {post.title || "(タイトルなし)"}
                </h2>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {post.body}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  {new Date(post.published_at).toLocaleDateString("ja-JP")}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
