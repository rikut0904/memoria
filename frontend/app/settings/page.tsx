"use client";

import { type ChangeEvent, type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";
import AppHeader from "@/components/AppHeader";

interface User { email: string; display_name: string; }
interface Group { id: number; name: string; created_at: string; }
type ModalName = "export" | "import" | null;
type BusyAction = "export" | "import" | null;

function SettingsDialog({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-gray-900/40" onClick={onClose} aria-label="ダイアログを閉じる" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-semibold text-gray-900">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>}</div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" aria-label="閉じる"><span aria-hidden="true" className="text-2xl leading-none">×</span></button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalName>(null);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [error, setError] = useState("");
  const [exportTarget, setExportTarget] = useState<"all" | string>("all");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTarget, setImportTarget] = useState("");

  const refreshGroups = async () => {
    const response = await api.get("/groups");
    setGroups((response.data || []) as Group[]);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [userResponse, groupsResponse] = await Promise.all([api.get("/me"), api.get("/groups")]);
        setUser(userResponse.data);
        setGroups((groupsResponse.data || []) as Group[]);
      } catch (err) {
        router.replace(buildLoginUrl(getCurrentPathWithQuery()));
        setError(getErrorMessage(err, "設定の取得に失敗しました"));
      } finally { setLoading(false); }
    };
    load();
  }, [router]);

  const closeModal = () => {
    if (busy) return;
    setModal(null);
    setImportFile(null);
    setImportTarget("");
  };

  const downloadExport = async () => {
    const groupId = exportTarget === "all" ? undefined : exportTarget;
    setError("");
    setBusy("export");
    try {
      const query = groupId ? `?group_id=${encodeURIComponent(groupId)}` : "";
      const response = await api.get(`/account-data/export${query}`, { responseType: "blob" });
      const disposition = response.headers["content-disposition"] as string | undefined;
      const fallback = groupId ? `memoria-group-${groupId}.json` : "memoria-account.json";
      const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] || fallback;
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setModal(null);
    } catch (err) { setError(getErrorMessage(err, "エクスポートに失敗しました")); }
    finally { setBusy(null); }
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    setImportFile(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const executeImport = async () => {
    if (!importFile) { setError("インポートするJSONファイルを選択してください"); return; }
    setError("");
    setBusy("import");
    try {
      const query = importTarget ? `?group_id=${encodeURIComponent(importTarget)}` : "";
      const response = await api.post(`/account-data/import${query}`, importFile, { headers: { "Content-Type": "application/json" } });
      await refreshGroups();
      setModal(null);
      setImportFile(null);
      setImportTarget("");
      alert(response.data?.group_id ? "新しいグループを作成して復元しました" : "選択したグループにデータを追加しました");
    } catch (err) { setError(getErrorMessage(err, "インポートに失敗しました")); }
    finally { setBusy(null); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-600">読み込み中...</div>;

  const exportGroup = groups.find((group) => String(group.id) === exportTarget);
  const importGroup = groups.find((group) => String(group.id) === importTarget);

  return (
    <div className="min-h-screen">
      <AppHeader displayName={user?.display_name} email={user?.email} />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div><p className="text-sm font-semibold text-primary-700">ACCOUNT SETTINGS</p><h1 className="mt-2">ユーザー設定</h1><p className="mt-3 text-gray-600">アカウントデータとグループデータを管理します。</p></div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <section className="card border border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">アカウント情報</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500">表示名</p><p className="mt-1 font-medium text-gray-800">{user?.display_name || "ユーザー"}</p></div><div className="rounded-lg bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500">メールアドレス</p><p className="mt-1 break-all font-medium text-gray-800">{user?.email}</p></div></div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="card flex flex-col border border-primary-100 bg-white"><div className="flex-1"><h2 className="text-xl font-semibold text-gray-800">データをエクスポート</h2><p className="mt-2 text-sm leading-6 text-gray-600">全体、または選択したグループの情報と記録をJSONファイルに保存します。</p></div><button type="button" onClick={() => { setExportTarget("all"); setModal("export"); }} disabled={busy !== null} className="mt-6 w-full rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">エクスポートする</button></div>
          <div className="card flex flex-col border border-gray-200 bg-white"><div className="flex-1"><h2 className="text-xl font-semibold text-gray-800">データをインポート</h2><p className="mt-2 text-sm leading-6 text-gray-600">既存グループへ追加するか、ファイルのグループ情報から新しいグループを復元します。</p></div><button type="button" onClick={() => { setImportFile(null); setImportTarget(""); setModal("import"); }} disabled={busy !== null} className="mt-6 w-full rounded-lg bg-gray-800 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50">インポートする</button></div>
        </section>

      </main>

      {modal === "export" && <SettingsDialog title="エクスポートする範囲" description="保存したい範囲を選択してください。グループ単位のファイルは、あとで新しいグループとして復元できます。" onClose={closeModal}>
        <div className="space-y-3"><label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 p-4 hover:border-primary-300"><input type="radio" name="export-target" checked={exportTarget === "all"} onChange={() => setExportTarget("all")} className="mt-1" /><span><span className="block font-semibold text-gray-800">アカウント全体</span><span className="mt-1 block text-sm text-gray-500">参加しているすべてのグループを保存</span></span></label><label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 p-4 hover:border-primary-300"><input type="radio" name="export-target" checked={exportTarget !== "all"} onChange={() => setExportTarget(groups[0] ? String(groups[0].id) : "all")} className="mt-1" /><span className="flex-1"><span className="block font-semibold text-gray-800">指定したグループ</span><span className="mt-1 block text-sm text-gray-500">1つのグループと、そのグループの記録を保存</span></span></label>{exportTarget !== "all" && <select value={exportTarget} onChange={(event) => setExportTarget(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"><option value="" disabled>グループを選択してください</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>}{exportTarget !== "all" && !exportGroup && <p className="text-sm text-red-600">エクスポートするグループを選択してください。</p>}<div className="flex justify-end gap-3 pt-3"><button type="button" onClick={closeModal} disabled={busy !== null} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">キャンセル</button><button type="button" onClick={downloadExport} disabled={busy !== null || (exportTarget !== "all" && !exportGroup)} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{busy === "export" ? "準備中..." : "エクスポート"}</button></div></div>
      </SettingsDialog>}

      {modal === "import" && <SettingsDialog title="インポートする" description="既存グループを指定すると内容だけを追加します。指定しない場合は、JSON内のグループ情報から新しいグループを作成します。" onClose={closeModal}>
        <div className="space-y-5"><label className="block cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center hover:border-primary-400 hover:bg-primary-50"><span className="block font-semibold text-gray-800">JSONファイルを選択</span><span className="mt-1 block text-sm text-gray-500">1グループ分のエクスポートファイル</span><input type="file" accept="application/json,.json" onChange={handleImportFile} className="sr-only" />{importFile && <span className="mt-3 block truncate text-sm font-medium text-primary-700">{importFile.name}</span>}</label><div><label htmlFor="import-target" className="block text-sm font-semibold text-gray-700">取り込み先</label><select id="import-target" value={importTarget} onChange={(event) => setImportTarget(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"><option value="">新しいグループとして復元</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}（内容を追加）</option>)}</select><p className="mt-2 text-xs leading-5 text-gray-500">既存グループへの追加は、そのグループの管理者のみ実行できます。{importGroup && ` 対象: ${importGroup.name}`}</p></div><div className="flex justify-end gap-3"><button type="button" onClick={closeModal} disabled={busy !== null} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">キャンセル</button><button type="button" onClick={executeImport} disabled={busy !== null || !importFile} className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50">{busy === "import" ? "取り込み中..." : "インポート"}</button></div></div>
      </SettingsDialog>}

    </div>
  );
}
