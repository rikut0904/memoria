"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { setCurrentGroup } from "@/lib/group";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";
import GroupSwitchButton from "@/components/GroupSwitchButton";
import DashboardButton from "@/components/DashboardButton";
import AppHeader from "@/components/AppHeader";

interface User {
  id: number;
  email: string;
  display_name: string;
}

interface Group {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
}

interface Member {
  user_id: number;
  email: string;
  display_name: string;
  role: string;
  joined_at: string;
}

interface Invite {
  id: number;
  email: string;
  token: string;
  status: string;
  role: string;
  expires_at: string;
  invited_by: number;
  created_at: string;
}

type CreateInviteRequest = {
  email: string;
  role: string;
};

export default function GroupManagementPage() {
  const params = useParams();
  const groupId = Number(params.groupId);

  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId || Number.isNaN(groupId)) {
        router.push("/");
        return;
      }

      setCurrentGroup(groupId);

      try {
        const [userRes, groupsRes, membersRes] = await Promise.all([
          api.get("/me"),
          api.get("/groups"),
          api.get(`/groups/${groupId}/members`),
        ]);
        const groups = groupsRes.data as Group[];
        const current = groups.find((g) => g.id === groupId) || null;
        setGroup(current);
        setMembers(membersRes.data || []);
        setUser(userRes.data);
      } catch (err) {
        console.error("Failed to fetch group data:", err);
        setError(getErrorMessage(err, "グループ情報の取得に失敗しました"));
        router.push(buildLoginUrl(getCurrentPathWithQuery()));
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [router, groupId]);

  useEffect(() => {
    if (group) {
      setCurrentGroup(group.id, group.name);
    }
  }, [group]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    setCreating(true);
    try {
      const payload: CreateInviteRequest = {
        email: inviteEmail,
        role: inviteRole,
      };
      await api.post("/invites", payload);
      setInviteEmail("");
      setInviteRole("member");
      const invitesRes = await api.get("/invites");
      setInvites(invitesRes.data || []);
      alert("招待を送信しました");
    } catch (err) {
      console.error("Failed to create invite:", err);
      setError(getErrorMessage(err, "招待の作成に失敗しました"));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInvite = async (inviteId: number) => {
    if (!confirm("この招待を削除しますか？")) return;
    try {
      await api.delete(`/invites/${inviteId}`);
      setInvites(invites.filter((i) => i.id !== inviteId));
    } catch (err) {
      console.error("Failed to delete invite:", err);
      setError(getErrorMessage(err, "招待の削除に失敗しました"));
    }
  };

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
        maxWidthClassName="max-w-6xl"
        displayName={user?.display_name}
        email={user?.email}
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
            <DashboardButton label="ダッシュボードへ" />
          </>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {error && <div className="text-sm text-red-600">{error}</div>}
        {group?.name && <h1>{group.name}</h1>}
        <section className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">一覧</h2>
          {members.length === 0 ? (
            <p className="text-gray-500">メンバーがいません。</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {member.display_name || member.email}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {member.role === "manager" ? "管理者" : "メンバー"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">招待</h2>
          <form
            onSubmit={handleCreateInvite}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="招待するメールアドレス"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="member">通常メンバー</option>
              <option value="manager">グループ管理者</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? "送信中..." : "招待する"}
            </button>
          </form>

          <div className="mt-6">
            <div className="text-lg font-semibold text-gray-800 mb-3">
              招待一覧
            </div>
            {invites.length === 0 ? (
              <p className="text-gray-500">未使用の招待はありません。</p>
            ) : (
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex justify-between items-center border rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {invite.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {invite.role === "manager" ? "管理者" : "メンバー"} /{" "}
                        {invite.status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
