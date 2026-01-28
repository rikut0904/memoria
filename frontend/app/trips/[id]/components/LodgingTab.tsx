import { LodgingItem } from '../types'

type LodgingTabProps = {
  lodgings: LodgingItem[]
  onAdd: () => void
  onSave: () => void
  onRemove: (localId: string) => void
  onUpdate: (localId: string, field: keyof LodgingItem, value: string) => void
}

export default function LodgingTab({ lodgings, onAdd, onSave, onRemove, onUpdate }: LodgingTabProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          宿を追加
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          保存
        </button>
      </div>

      <div className="space-y-4">
        {lodgings.map((lodging) => (
          <div key={lodging.localId} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={lodging.date}
                onChange={(e) => onUpdate(lodging.localId, 'date', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={lodging.name}
                onChange={(e) => onUpdate(lodging.localId, 'name', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                placeholder="宿名"
              />
              <button
                onClick={() => onRemove(lodging.localId)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                削除
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="url"
                value={lodging.reservation_url}
                onChange={(e) => onUpdate(lodging.localId, 'reservation_url', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="予約サイトURL"
              />
              <input
                type="text"
                value={lodging.address}
                onChange={(e) => onUpdate(lodging.localId, 'address', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="住所"
              />
              <input
                type="time"
                step={600}
                value={lodging.check_in}
                onChange={(e) => onUpdate(lodging.localId, 'check_in', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="チェックイン"
              />
              <input
                type="time"
                step={600}
                value={lodging.check_out}
                onChange={(e) => onUpdate(lodging.localId, 'check_out', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="チェックアウト"
              />
              <input
                type="text"
                value={lodging.reservation_number}
                onChange={(e) => onUpdate(lodging.localId, 'reservation_number', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="予約番号"
              />
              <input
                type="number"
                value={lodging.cost_yen}
                onChange={(e) => onUpdate(lodging.localId, 'cost_yen', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="費用（円）"
              />
            </div>
          </div>
        ))}
        {lodgings.length === 0 && <p className="text-sm text-gray-500">宿が登録されていません</p>}
      </div>
    </div>
  )
}
