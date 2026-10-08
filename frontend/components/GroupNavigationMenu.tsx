"use client";

import HeaderButton from "@/components/HeaderButton";
import GroupSwitchButton from "@/components/GroupSwitchButton";
import { useRouter } from "next/navigation";

type GroupNavigationMenuProps = {
  groupId: string | number;
};

export default function GroupNavigationMenu({
  groupId,
}: GroupNavigationMenuProps) {
  const router = useRouter();
  const groupPath = `/${groupId}`;

  return (
    <>
      <GroupSwitchButton label="グループ一覧へ" />
      <HeaderButton
        label="ダッシュボード"
        onClick={() => router.push(groupPath)}
      />
      <HeaderButton
        label="投稿一覧"
        onClick={() => router.push(`${groupPath}/posts`)}
      />
      <HeaderButton
        label="アルバム一覧"
        onClick={() => router.push(`${groupPath}/albums`)}
      />
      <HeaderButton
        label="旅行一覧"
        onClick={() => router.push(`${groupPath}/trips`)}
      />
      <HeaderButton
        label="招待・管理"
        onClick={() => router.push(`${groupPath}/manage`)}
      />
    </>
  );
}
