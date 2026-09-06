const GROUP_ID_KEY = "currentGroupId";
const GROUP_NAME_KEY = "currentGroupName";

export const getCurrentGroupId = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(GROUP_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getCurrentGroupName = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(GROUP_NAME_KEY);
};

export const setCurrentGroup = (groupId: number, groupName?: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GROUP_ID_KEY, String(groupId));
  if (groupName) {
    window.localStorage.setItem(GROUP_NAME_KEY, groupName);
  }
};

export const clearCurrentGroup = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GROUP_ID_KEY);
  window.localStorage.removeItem(GROUP_NAME_KEY);
};
