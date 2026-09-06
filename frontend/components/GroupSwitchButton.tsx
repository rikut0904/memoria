"use client";

import { useRouter } from "next/navigation";
import { clearCurrentGroup } from "@/lib/group";
import HeaderButton from "@/components/HeaderButton";

type GroupSwitchButtonProps = {
  label?: string;
  className?: string;
};

export default function GroupSwitchButton({
  label = "グループ一覧",
  className = "",
}: GroupSwitchButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    clearCurrentGroup();
    router.push("/");
  };

  return (
    <HeaderButton label={label} onClick={handleClick} className={className} />
  );
}
