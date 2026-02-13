import { transportModes } from "../constants";
import { TransportItem } from "../types";

type TransportTabProps = {
  transports: TransportItem[];
  openTransports: Set<string>;
  onAdd: () => void;
  onSave: () => void;
  onToggle: (localId: string) => void;
  onRemove: (localId: string) => void;
  onUpdate: (
    localId: string,
    field: keyof TransportItem,
    value: string,
  ) => void;
};

export default function TransportTab({
  transports,
  openTransports,
  onAdd,
  onSave,
  onToggle,
  onRemove,
  onUpdate,
}: TransportTabProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          移動手段を追加
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          保存
        </button>
      </div>

      <div className="space-y-4">
        {transports.map((transport) => {
          const isOpen = openTransports.has(transport.localId);
          return (
            <div
              key={transport.localId}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <select
                    value={transport.mode}
                    onChange={(e) =>
                      onUpdate(transport.localId, "mode", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {transportModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onRemove(transport.localId)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">日付</label>
                    <input
                      type="date"
                      value={transport.date}
                      onChange={(e) =>
                        onUpdate(transport.localId, "date", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-[140px]">
                    <label className="text-xs text-gray-500 mb-1">出発地</label>
                    <input
                      type="text"
                      value={transport.from_location}
                      onChange={(e) =>
                        onUpdate(
                          transport.localId,
                          "from_location",
                          e.target.value,
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="出発地"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-[140px]">
                    <label className="text-xs text-gray-500 mb-1">到着地</label>
                    <input
                      type="text"
                      value={transport.to_location}
                      onChange={(e) =>
                        onUpdate(
                          transport.localId,
                          "to_location",
                          e.target.value,
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="到着地"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggle(transport.localId)}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "折りたたむ" : "開く"}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>

              {isOpen && (
                <>
                  {(transport.mode === "car" ||
                    transport.mode === "rental") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {transport.mode === "rental" && (
                        <>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">
                              レンタカー会社名
                            </label>
                            <input
                              type="text"
                              value={transport.company_name}
                              onChange={(e) =>
                                onUpdate(
                                  transport.localId,
                                  "company_name",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="レンタカー会社名"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">
                              受取場所
                            </label>
                            <input
                              type="text"
                              value={transport.pickup_location}
                              onChange={(e) =>
                                onUpdate(
                                  transport.localId,
                                  "pickup_location",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="受取場所"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">
                              返却場所
                            </label>
                            <input
                              type="text"
                              value={transport.dropoff_location}
                              onChange={(e) =>
                                onUpdate(
                                  transport.localId,
                                  "dropoff_location",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="返却場所"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">
                              予約URL
                            </label>
                            <input
                              type="url"
                              value={transport.rental_url}
                              onChange={(e) =>
                                onUpdate(
                                  transport.localId,
                                  "rental_url",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="予約URL"
                            />
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-2">
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">
                            予想走行距離（km）
                          </label>
                          <input
                            type="number"
                            value={transport.distance_km}
                            onChange={(e) =>
                              onUpdate(
                                transport.localId,
                                "distance_km",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="km"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">
                            燃費（km/L）
                          </label>
                          <input
                            type="number"
                            value={transport.fuel_efficiency_km_per_l}
                            onChange={(e) =>
                              onUpdate(
                                transport.localId,
                                "fuel_efficiency_km_per_l",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="km/L"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">
                            ガソリン単価（円/L）
                          </label>
                          <input
                            type="number"
                            value={transport.gasoline_price_yen_per_l}
                            onChange={(e) =>
                              onUpdate(
                                transport.localId,
                                "gasoline_price_yen_per_l",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="円/L"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          ガソリン代（自動）
                        </label>
                        <input
                          type="text"
                          value={
                            transport.gasoline_cost_yen
                              ? `${transport.gasoline_cost_yen} 円`
                              : "0 円"
                          }
                          readOnly
                          className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                        />
                      </div>
                      {transport.mode === "car" && (
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">
                            高速代（円）
                          </label>
                          <input
                            type="number"
                            value={transport.highway_cost_yen}
                            onChange={(e) =>
                              onUpdate(
                                transport.localId,
                                "highway_cost_yen",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="円"
                          />
                        </div>
                      )}
                      {transport.mode === "rental" && (
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">
                            レンタル費用（円）
                          </label>
                          <input
                            type="number"
                            value={transport.rental_fee_yen}
                            onChange={(e) =>
                              onUpdate(
                                transport.localId,
                                "rental_fee_yen",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="円"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {(transport.mode === "train" || transport.mode === "bus") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          路線名
                        </label>
                        <input
                          type="text"
                          value={transport.route_name}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "route_name",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="路線名"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          出発時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.departure_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "departure_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          到着時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.arrival_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "arrival_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          費用（円）
                        </label>
                        <input
                          type="number"
                          value={transport.fare_yen}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "fare_yen",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="円"
                        />
                      </div>
                    </div>
                  )}

                  {transport.mode === "shinkansen" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          列車名
                        </label>
                        <input
                          type="text"
                          value={transport.train_name}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "train_name",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="列車名"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          出発時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.departure_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "departure_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          到着時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.arrival_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "arrival_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          費用（円）
                        </label>
                        <input
                          type="number"
                          value={transport.fare_yen}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "fare_yen",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="円"
                        />
                      </div>
                    </div>
                  )}

                  {transport.mode === "ferry" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          便名
                        </label>
                        <input
                          type="text"
                          value={transport.ferry_name}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "ferry_name",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="便名"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          出発時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.departure_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "departure_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          到着時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.arrival_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "arrival_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          費用（円）
                        </label>
                        <input
                          type="number"
                          value={transport.fare_yen}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "fare_yen",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="円"
                        />
                      </div>
                    </div>
                  )}

                  {transport.mode === "flight" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          便名
                        </label>
                        <input
                          type="text"
                          value={transport.flight_number}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "flight_number",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="便名"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          航空会社
                        </label>
                        <input
                          type="text"
                          value={transport.airline}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "airline",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="航空会社"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          ターミナル
                        </label>
                        <input
                          type="text"
                          value={transport.terminal}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "terminal",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="ターミナル"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          出発時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.departure_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "departure_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          到着時刻
                        </label>
                        <input
                          type="time"
                          step={600}
                          value={transport.arrival_time}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "arrival_time",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          費用（円）
                        </label>
                        <input
                          type="number"
                          value={transport.fare_yen}
                          onChange={(e) =>
                            onUpdate(
                              transport.localId,
                              "fare_yen",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="円"
                        />
                      </div>
                    </div>
                  )}

                  <textarea
                    value={transport.note}
                    onChange={(e) =>
                      onUpdate(transport.localId, "note", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="メモ（任意）"
                  />
                </>
              )}
            </div>
          );
        })}
        {transports.length === 0 && (
          <p className="text-sm text-gray-500">移動手段が登録されていません</p>
        )}
      </div>
    </div>
  );
}
