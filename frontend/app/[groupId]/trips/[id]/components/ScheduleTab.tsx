import { ScheduleItem } from '../types'

type ScheduleTabProps = {
  tripDates: string[]
  selectedDayIndex: number
  currentDate: string
  scheduleItems: ScheduleItem[]
  hourOptions: string[]
  minuteOptions: string[]
  onSelectDay: (index: number) => void
  onAdd: () => void
  onSave: () => void
  onRemove: (localId: string) => void
  onContentChange: (localId: string, value: string) => void
  onTimePartChange: (localId: string, part: 'hour' | 'minute', value: string) => void
  splitTime: (time: string) => { hour: string; minute: string }
}

export default function ScheduleTab({
  tripDates,
  selectedDayIndex,
  currentDate,
  scheduleItems,
  hourOptions,
  minuteOptions,
  onSelectDay,
  onAdd,
  onSave,
  onRemove,
  onContentChange,
  onTimePartChange,
  splitTime,
}: ScheduleTabProps) {
  const dayItems = scheduleItems
    .filter((item) => item.date === currentDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {tripDates.map((date, index) => (
            <button
              key={date}
              onClick={() => onSelectDay(index)}
              className={`px-3 py-1 text-sm rounded-full border ${
                selectedDayIndex === index
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            >
              {index + 1}日目
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAdd}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            予定を追加
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            保存
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-3">
          {currentDate ? `${currentDate} のスケジュール` : '日程が未設定です'}
        </div>
        <div className="space-y-3">
          {dayItems.map((item) => (
            <div key={item.localId} className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={splitTime(item.time).hour}
                  onChange={(e) => onTimePartChange(item.localId, 'hour', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-lg"
                >
                  {hourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className="text-gray-400">:</span>
                <select
                  value={splitTime(item.time).minute}
                  onChange={(e) => onTimePartChange(item.localId, 'minute', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-lg"
                >
                  {minuteOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={item.content}
                onChange={(e) => onContentChange(item.localId, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="予定の内容を入力"
              />
              <button
                onClick={() => onRemove(item.localId)}
                className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
              >
                削除
              </button>
            </div>
          ))}
          {dayItems.length === 0 && (
            <p className="text-sm text-gray-500">予定が登録されていません</p>
          )}
        </div>
      </div>
    </div>
  )
}
