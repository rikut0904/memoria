"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  clearCurrentGroup,
  getCurrentGroupId,
  setCurrentGroup,
} from "@/lib/group";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";

type Group = {
  id: number;
  name: string;
};

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.groupId);

  useEffect(() => {
    const syncGroup = async () => {
      if (!groupId || Number.isNaN(groupId)) {
        clearCurrentGroup();
        router.push("/");
        return;
      }

      const currentGroupId = getCurrentGroupId();
      if (currentGroupId !== groupId) {
        setCurrentGroup(groupId);
      }

      try {
        const groupsRes = await api.get<Group[]>("/groups");
        const matched = (groupsRes.data || []).find((g) => g.id === groupId);
        if (!matched) {
          clearCurrentGroup();
          router.push("/");
          return;
        }
        setCurrentGroup(matched.id, matched.name);
      } catch {
        router.push(buildLoginUrl(getCurrentPathWithQuery()));
      }
    };

    syncGroup();
  }, [groupId, router]);

  return <>{children}</>;
}
