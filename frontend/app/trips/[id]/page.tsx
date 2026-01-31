'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import TripHeader from './components/TripHeader'
import OverviewTab from './components/OverviewTab'
import OverviewModal from './components/OverviewModal'
import ScheduleTab from './components/ScheduleTab'
import TransportTab from './components/TransportTab'
import LodgingTab from './components/LodgingTab'
import BudgetTab from './components/BudgetTab'
import useItineraryState from './hooks/useItineraryState'
import type {
  BudgetResponse,
  BudgetRequestItem,
  LodgingResponseItem,
  LodgingRequestItem,
  ScheduleResponseItem,
  ScheduleRequestItem,
  TransportResponseItem,
  TransportRequestItem,
  Trip,
} from './types'

type ItineraryTab = 'schedule' | 'transport' | 'lodging' | 'budget'

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary'>('overview')
  const [activeItineraryTab, setActiveItineraryTab] = useState<ItineraryTab>('schedule')
  const [overviewSaving, setOverviewSaving] = useState(false)
  const [overviewError, setOverviewError] = useState('')
  const [overviewModalOpen, setOverviewModalOpen] = useState(false)
  const [overviewTitle, setOverviewTitle] = useState('')
  const [overviewStart, setOverviewStart] = useState('')
  const [overviewEnd, setOverviewEnd] = useState('')
  const [overviewNote, setOverviewNote] = useState('')
  const [overviewNotify, setOverviewNotify] = useState('')
  const {
    scheduleItems,
    transports,
    lodgings,
    budgetItems,
    budgetSummary,
    selectedDayIndex,
    openTransports,
    dirtySchedule,
    dirtyTransport,
    dirtyLodging,
    dirtyBudget,
    initialize,
    setSelectedDayIndex,
    addScheduleItem,
    updateScheduleItem,
    updateScheduleTimePart,
    removeScheduleItem,
    markScheduleSaved,
    addTransport,
    updateTransport,
    removeTransport,
    toggleTransport,
    syncTransports,
    addLodging,
    updateLodging,
    removeLodging,
    markLodgingSaved,
    addBudgetItem,
    updateBudgetItem,
    removeBudgetItem,
    markBudgetSaved,
    setBudgetSummary,
    splitTime,
    totalBudget,
  } = useItineraryState()

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        await api.get('/me')
        const [tripRes, scheduleRes, transportRes, lodgingRes, budgetRes] = await Promise.all([
          api.get<Trip>(`/trips/${tripId}`),
          api.get<ScheduleResponseItem[]>(`/trips/${tripId}/schedule`),
          api.get<TransportResponseItem[]>(`/trips/${tripId}/transports`),
          api.get<LodgingResponseItem[]>(`/trips/${tripId}/lodgings`),
          api.get<BudgetResponse>(`/trips/${tripId}/budget`),
        ])

        setTrip(tripRes.data)
        setOverviewTitle(tripRes.data.title || '')
        setOverviewStart(toDateInput(tripRes.data.start_at))
        setOverviewEnd(toDateInput(tripRes.data.end_at))
        setOverviewNote(tripRes.data.note || '')
        setOverviewNotify(tripRes.data.notify_at ? toDateInput(tripRes.data.notify_at) : '')
        const loadedSchedule = (scheduleRes.data || []).map((item) => ({
          id: item.id,
          localId: `schedule-${item.id}`,
          date: item.date,
          time: item.time,
          content: item.content,
        }))

        const loadedTransports = mapTransportResponse(transportRes.data)

        const loadedLodgings = (lodgingRes.data || []).map((item) => ({
          id: item.id,
          localId: `lodging-${item.id}`,
          date: item.date || '',
          name: item.name || '',
          reservation_url: item.reservation_url || '',
          address: item.address || '',
          check_in: item.check_in || '',
          check_out: item.check_out || '',
          reservation_number: item.reservation_number || '',
          cost_yen: item.cost_yen ? String(item.cost_yen) : '',
        }))

        const loadedBudget = (budgetRes.data?.items || []).map((item) => ({
          id: item.id,
          localId: `budget-${item.id}`,
          name: item.name || '',
          cost_yen: item.cost_yen ? String(item.cost_yen) : '',
        }))
        initialize({
          scheduleItems: loadedSchedule,
          transports: loadedTransports,
          lodgings: loadedLodgings,
          budgetItems: loadedBudget,
          budgetSummary: {
            transport_total: budgetRes.data?.transport_total || 0,
            lodging_total: budgetRes.data?.lodging_total || 0,
            total: budgetRes.data?.total || 0,
          },
        })
      } catch (err) {
        console.error('Failed to fetch trip data:', err)
        setError(getErrorMessage(err, '旅行の取得に失敗しました'))
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [router, tripId, initialize])

  const toDateInput = (isoString: string) => {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    return date.toISOString().slice(0, 10)
  }

  const toDateISOString = (value: string) => {
    const parts = value.split('-').map(Number)
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
      return ''
    }
    const [year, month, day] = parts
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.toISOString()
  }

  const mapTransportResponse = (items: TransportResponseItem[]) =>
    (items || []).map((item, index) => ({
      id: item.id,
      localId: item.id ? `transport-${item.id}` : `transport-${Date.now()}-${index}`,
      mode: item.mode || 'car',
      date: item.date || '',
      from_location: item.from_location || '',
      to_location: item.to_location || '',
      note: item.note || '',
      departure_time: item.departure_time || '',
      arrival_time: item.arrival_time || '',
      route_name: item.route_name || '',
      train_name: item.train_name || '',
      ferry_name: item.ferry_name || '',
      flight_number: item.flight_number || '',
      airline: item.airline || '',
      terminal: item.terminal || '',
      company_name: item.company_name || '',
      pickup_location: item.pickup_location || '',
      dropoff_location: item.dropoff_location || '',
      rental_url: item.rental_url || '',
      distance_km: item.distance_km ? String(item.distance_km) : '',
      fuel_efficiency_km_per_l: item.fuel_efficiency_km_per_l ? String(item.fuel_efficiency_km_per_l) : '',
      gasoline_price_yen_per_l: item.gasoline_price_yen_per_l ? String(item.gasoline_price_yen_per_l) : '',
      gasoline_cost_yen: item.gasoline_cost_yen || 0,
      highway_cost_yen: item.highway_cost_yen ? String(item.highway_cost_yen) : '',
      rental_fee_yen: item.rental_fee_yen ? String(item.rental_fee_yen) : '',
      fare_yen: item.fare_yen ? String(item.fare_yen) : '',
    }))

  const tripDates = useMemo(() => {
    if (!trip) {
      return []
    }
    const start = new Date(trip.start_at)
    const end = new Date(trip.end_at)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return []
    }
    const dates: string[] = []
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
    const endDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
    while (cursor <= endDate) {
      const dateStr = cursor.toISOString().slice(0, 10)
      dates.push(dateStr)
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return dates
  }, [trip])

  const currentDate = tripDates[selectedDayIndex] || ''

  const handleTabSwitch = (nextTab: 'overview' | 'itinerary') => {
    if (activeTab === 'itinerary' && isCurrentItineraryTabDirty()) {
      alert('未保存の変更があります。保存してください。')
      return
    }
    setActiveTab(nextTab)
  }

  const handleItineraryTabSwitch = (nextTab: typeof activeItineraryTab) => {
    if (isCurrentItineraryTabDirty()) {
      alert('未保存の変更があります。保存してください。')
      return
    }
    setActiveItineraryTab(nextTab)
  }

  const isCurrentItineraryTabDirty = () => {
    switch (activeItineraryTab) {
      case 'schedule':
        return dirtySchedule
      case 'transport':
        return dirtyTransport
      case 'lodging':
        return dirtyLodging
      case 'budget':
        return dirtyBudget
      default:
        return false
    }
  }

  const handleDelete = async () => {
    if (!trip) {
      return
    }
    if (!confirm(`「${trip.title}」を削除しますか？`)) {
      return
    }

    setDeleting(true)
    try {
      await api.delete(`/trips/${trip.id}`)
      router.push('/trips')
    } catch (err) {
      console.error('Failed to delete trip:', err)
      setError(getErrorMessage(err, '旅行の削除に失敗しました'))
    } finally {
      setDeleting(false)
    }
  }

  const hourOptions = useMemo(() => {
    const options: string[] = []
    for (let hour = 0; hour < 24; hour += 1) {
      options.push(String(hour).padStart(2, '0'))
    }
    return options
  }, [])

  const minuteOptions = useMemo(() => {
    const options: string[] = []
    for (let minute = 0; minute < 60; minute += 10) {
      options.push(String(minute).padStart(2, '0'))
    }
    return options
  }, [])

  const saveSchedule = async () => {
    if (!trip) {
      return
    }
    const payload: ScheduleRequestItem[] = scheduleItems.map((item) => ({
      date: item.date,
      time: item.time,
      content: item.content,
    }))
    await api.put(`/trips/${trip.id}/schedule`, payload)
    markScheduleSaved()
  }

  const saveTransports = async () => {
    if (!trip) {
      return
    }
    const payload: TransportRequestItem[] = transports.map((item) => ({
      mode: item.mode,
      date: item.date,
      from_location: item.from_location,
      to_location: item.to_location,
      note: item.note,
      departure_time: item.departure_time,
      arrival_time: item.arrival_time,
      route_name: item.route_name,
      train_name: item.train_name,
      ferry_name: item.ferry_name,
      flight_number: item.flight_number,
      airline: item.airline,
      terminal: item.terminal,
      company_name: item.company_name,
      pickup_location: item.pickup_location,
      dropoff_location: item.dropoff_location,
      rental_url: item.rental_url,
      distance_km: Number(item.distance_km) || 0,
      fuel_efficiency_km_per_l: Number(item.fuel_efficiency_km_per_l) || 0,
      gasoline_price_yen_per_l: Number(item.gasoline_price_yen_per_l) || 0,
      gasoline_cost_yen: item.gasoline_cost_yen || 0,
      highway_cost_yen: Number(item.highway_cost_yen) || 0,
      rental_fee_yen: Number(item.rental_fee_yen) || 0,
      fare_yen: Number(item.fare_yen) || 0,
    }))
    await api.put(`/trips/${trip.id}/transports`, payload)
    const transportRes = await api.get<TransportResponseItem[]>(`/trips/${trip.id}/transports`)
    syncTransports(mapTransportResponse(transportRes.data))
    const budgetRes = await api.get(`/trips/${trip.id}/budget`)
    setBudgetSummary({
      transport_total: budgetRes.data?.transport_total || 0,
      lodging_total: budgetRes.data?.lodging_total || 0,
      total: budgetRes.data?.total || 0,
    })
  }

  const saveLodgings = async () => {
    if (!trip) {
      return
    }
    const payload: LodgingRequestItem[] = lodgings.map((item) => ({
      date: item.date,
      name: item.name,
      reservation_url: item.reservation_url,
      address: item.address,
      check_in: item.check_in,
      check_out: item.check_out,
      reservation_number: item.reservation_number,
      cost_yen: Number(item.cost_yen) || 0,
    }))
    await api.put(`/trips/${trip.id}/lodgings`, payload)
    const budgetRes = await api.get(`/trips/${trip.id}/budget`)
    setBudgetSummary({
      transport_total: budgetRes.data?.transport_total || 0,
      lodging_total: budgetRes.data?.lodging_total || 0,
      total: budgetRes.data?.total || 0,
    })
    markLodgingSaved()
  }

  const saveBudget = async () => {
    if (!trip) {
      return
    }
    const payload: BudgetRequestItem[] = budgetItems.map((item) => ({
      name: item.name,
      cost_yen: Number(item.cost_yen) || 0,
    }))
    await api.put(`/trips/${trip.id}/budget`, payload)
    const budgetRes = await api.get(`/trips/${trip.id}/budget`)
    setBudgetSummary({
      transport_total: budgetRes.data?.transport_total || 0,
      lodging_total: budgetRes.data?.lodging_total || 0,
      total: budgetRes.data?.total || 0,
    })
    markBudgetSaved()
  }

  const saveOverview = async () => {
    if (!trip) {
      return
    }
    setOverviewError('')

    if (!overviewTitle || !overviewStart || !overviewEnd) {
      setOverviewError('必須項目を入力してください')
      return
    }

    const startISO = toDateISOString(overviewStart)
    const endISO = toDateISOString(overviewEnd)
    if (!startISO || !endISO) {
      setOverviewError('日付の形式が正しくありません')
      return
    }

    const payload: {
      title: string
      start_at: string
      end_at: string
      note: string
      notify_at?: string
    } = {
      title: overviewTitle,
      start_at: startISO,
      end_at: endISO,
      note: overviewNote,
    }
    if (overviewNotify) {
      const notifyISO = toDateISOString(overviewNotify)
      if (!notifyISO) {
        setOverviewError('通知日の形式が正しくありません')
        return
      }
      payload.notify_at = notifyISO
    }

    setOverviewSaving(true)
    try {
      const res = await api.patch(`/trips/${trip.id}`, payload)
      setTrip(res.data)
      setOverviewTitle(res.data.title || '')
      setOverviewStart(toDateInput(res.data.start_at))
      setOverviewEnd(toDateInput(res.data.end_at))
      setOverviewNote(res.data.note || '')
      setOverviewNotify(res.data.notify_at ? toDateInput(res.data.notify_at) : '')
    } catch (err) {
      console.error('Failed to update trip overview:', err)
      setOverviewError(getErrorMessage(err, '概要の更新に失敗しました'))
    } finally {
      setOverviewSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-700">{error || '旅行が見つかりません'}</p>
          <button
            onClick={() => router.push('/trips')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            旅行一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary-600">旅行詳細</h1>
            <button
              onClick={() => router.push('/trips')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              旅行一覧に戻る
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <TripHeader
            trip={trip}
            onPost={() => router.push(`/posts/new?trip_id=${trip.id}&redirect=/trips/${trip.id}`)}
            onAlbum={() => router.push(`/albums/new?trip_id=${trip.id}&redirect=/trips/${trip.id}`)}
          />

          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => handleTabSwitch('overview')}
                className={`border-b-2 py-2 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                概要
              </button>
              <button
                onClick={() => handleTabSwitch('itinerary')}
                className={`border-b-2 py-2 text-sm font-medium ${
                  activeTab === 'itinerary'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                旅程
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <OverviewTab
              trip={trip}
              onEdit={() => setOverviewModalOpen(true)}
              onDelete={handleDelete}
              deleting={deleting}
            />
          )}

          {activeTab === 'itinerary' && (
            <div className="mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-4">
                  {[
                    { key: 'schedule', label: '日程' },
                    { key: 'transport', label: '移動手段' },
                    { key: 'lodging', label: '宿' },
                    { key: 'budget', label: '予算' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleItineraryTabSwitch(tab.key as typeof activeItineraryTab)}
                      className={`border-b-2 py-2 text-sm font-medium ${
                        activeItineraryTab === tab.key
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {activeItineraryTab === 'schedule' && (
                <ScheduleTab
                  tripDates={tripDates}
                  selectedDayIndex={selectedDayIndex}
                  currentDate={currentDate}
                  scheduleItems={scheduleItems}
                  hourOptions={hourOptions}
                  minuteOptions={minuteOptions}
                  onSelectDay={setSelectedDayIndex}
                  onAdd={() => addScheduleItem(currentDate)}
                  onSave={saveSchedule}
                  onRemove={removeScheduleItem}
                  onContentChange={(localId, value) =>
                    updateScheduleItem(localId, 'content', value)
                  }
                  onTimePartChange={updateScheduleTimePart}
                  splitTime={splitTime}
                />
              )}

              {activeItineraryTab === 'transport' && (
                <TransportTab
                  transports={transports}
                  openTransports={openTransports}
                  onAdd={() => addTransport(currentDate || tripDates[0] || '')}
                  onSave={saveTransports}
                  onToggle={toggleTransport}
                  onRemove={removeTransport}
                  onUpdate={updateTransport}
                />
              )}

              {activeItineraryTab === 'lodging' && (
                <LodgingTab
                  lodgings={lodgings}
                  onAdd={() => addLodging(currentDate || tripDates[0] || '')}
                  onSave={saveLodgings}
                  onRemove={removeLodging}
                  onUpdate={updateLodging}
                />
              )}

              {activeItineraryTab === 'budget' && (
                <BudgetTab
                  summary={budgetSummary}
                  total={totalBudget}
                  items={budgetItems}
                  onAdd={addBudgetItem}
                  onSave={saveBudget}
                  onRemove={removeBudgetItem}
                  onUpdate={updateBudgetItem}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <OverviewModal
        open={overviewModalOpen}
        onClose={() => setOverviewModalOpen(false)}
        onSave={saveOverview}
        saving={overviewSaving}
        error={overviewError}
        title={overviewTitle}
        start={overviewStart}
        end={overviewEnd}
        note={overviewNote}
        notify={overviewNotify}
        setTitle={setOverviewTitle}
        setStart={setOverviewStart}
        setEnd={setOverviewEnd}
        setNote={setOverviewNote}
        setNotify={setOverviewNotify}
      />
    </div>
  )
}
