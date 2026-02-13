"use client";

import { useRouter } from "next/navigation";
import HeaderButton from "@/components/HeaderButton";
import { getCurrentGroupId } from "@/lib/group";

type DashboardButtonProps = {
  label?: string;
  className?: string;
};

export default function DashboardButton({
  label = "ダッシュボードへ",
  className = "",
}: DashboardButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const groupId = getCurrentGroupId();
    if (!groupId) {
      router.push("/");
      return;
    }
    router.push(`/${groupId}`);
  };

  return (
    <HeaderButton label={label} onClick={handleClick} className={className} />
  );
}
