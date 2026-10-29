import { redirect } from "next/navigation";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:23000";

export default function AuthRootPage() {
  redirect(APP_BASE_URL);
}
