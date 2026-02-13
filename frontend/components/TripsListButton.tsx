"use client";

import { useRouter } from "next/navigation";
import HeaderButton from "@/components/HeaderButton";
import { getCurrentGroupId } from "@/lib/group";

type TripsListButtonProps = {
  label?: string;
  className?: string;
};

export default function TripsListButton({
  label = "旅行一覧に戻る",
  className = "",
}: TripsListButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const groupId = getCurrentGroupId();
    if (!groupId) {
      router.push("/");
      return;
    }
    router.push(`/${groupId}/trips`);
  };

  return (
    <HeaderButton label={label} onClick={handleClick} className={className} />
  );
}
