"use client";

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
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

  const handleClick = () => {
    clearCurrentGroup();
    if (!appBaseUrl) {
      console.warn("NEXT_PUBLIC_APP_BASE_URL is not set");
      return;
    }
    const url = new URL("/", appBaseUrl);
    window.location.href = url.toString();
  };

  return (
    <HeaderButton label={label} onClick={handleClick} className={className} />
  );
}
