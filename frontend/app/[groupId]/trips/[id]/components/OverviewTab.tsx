import { Trip } from "../types";

type OverviewTabProps = {
  trip: Trip;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
};

export default function OverviewTab({
  trip,
  onEdit,
  onDelete,
  deleting,
}: OverviewTabProps) {
  return (
    <div className="mt-6 space-y-4">
      {trip.note && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
          {trip.note}
        </div>
      )}

      {trip.notify_at && (
        <p className="text-sm text-gray-500">
          通知予定: {new Date(trip.notify_at).toLocaleString("ja-JP")}
        </p>
      )}

      {(trip.albums && trip.albums.length > 0) ||
      (trip.posts && trip.posts.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              紐づけたアルバム
            </div>
            {trip.albums && trip.albums.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {trip.albums.map((album) => (
                  <li key={album.id} className="flex items-start gap-2">
                    <div>
                      <p className="font-medium">{album.title}</p>
                      {album.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">紐づけられていません</p>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              紐づけた投稿
            </div>
            {trip.posts && trip.posts.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {trip.posts.map((post) => (
                  <li key={post.id} className="flex items-start gap-2">
                    <div>
                      <p className="font-medium">
                        {post.title || "(タイトルなし)"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.published_at).toLocaleDateString(
                          "ja-JP",
                        )}{" "}
                        / {post.type}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">紐づけられていません</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="pt-2 flex justify-between">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50"
        >
          概要を編集
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {deleting ? "削除中..." : "旅行を削除"}
        </button>
      </div>
    </div>
  );
}
