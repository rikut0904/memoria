import { Suspense } from "react";
import NewAlbumClient from "./view";

export default function NewAlbumPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <NewAlbumClient />
    </Suspense>
  );
}
