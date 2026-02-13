import { BudgetItem, BudgetSummary } from "../types";

type BudgetTabProps = {
  summary: BudgetSummary;
  total: number;
  items: BudgetItem[];
  onAdd: () => void;
  onSave: () => void;
  onRemove: (localId: string) => void;
  onUpdate: (localId: string, field: keyof BudgetItem, value: string) => void;
};

export default function BudgetTab({
  summary,
  total,
  items,
  onAdd,
  onSave,
  onRemove,
  onUpdate,
}: BudgetTabProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
        <p className="text-sm text-primary-700">合計予算</p>
        <p className="text-2xl font-semibold text-primary-700">
          {total.toLocaleString("ja-JP")} 円
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">移動手段の合計</p>
          <p className="text-lg font-semibold text-gray-800">
            {summary.transport_total.toLocaleString("ja-JP")} 円
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">宿の合計</p>
          <p className="text-lg font-semibold text-gray-800">
            {summary.lodging_total.toLocaleString("ja-JP")} 円
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          追加費用を追加
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          保存
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.localId} className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate(item.localId, "name", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="項目名"
            />
            <input
              type="number"
              value={item.cost_yen}
              onChange={(e) =>
                onUpdate(item.localId, "cost_yen", e.target.value)
              }
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="費用（円）"
            />
            <button
              onClick={() => onRemove(item.localId)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              削除
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-500">追加費用が登録されていません</p>
        )}
      </div>
    </div>
  );
}
