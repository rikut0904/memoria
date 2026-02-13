import { Trip } from "../types";

type TripHeaderProps = {
  trip: Trip;
  onPost: () => void;
  onAlbum: () => void;
};

export default function TripHeader({ trip, onPost, onAlbum }: TripHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{trip.title}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {new Date(trip.start_at).toLocaleDateString("ja-JP")} 〜{" "}
          {new Date(trip.end_at).toLocaleDateString("ja-JP")}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onPost}
          className="w-24 px-4 py-2 text-sm text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          投稿
        </button>
        <button
          onClick={onAlbum}
          className="w-24 px-4 py-2 text-sm text-center border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50"
        >
          アルバム
        </button>
      </div>
    </div>
  );
}
