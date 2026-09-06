import { Suspense } from "react";
import NewPostClient from "./view";

export default function NewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <NewPostClient />
    </Suspense>
  );
}
