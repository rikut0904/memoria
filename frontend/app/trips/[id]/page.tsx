'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { auth } from '@/lib/firebase'
import TripHeader from './components/TripHeader'
import OverviewTab from './components/OverviewTab'
import OverviewModal from './components/OverviewModal'
import ScheduleTab from './components/ScheduleTab'
import TransportTab from './components/TransportTab'
import LodgingTab from './components/LodgingTab'
import BudgetTab from './components/BudgetTab'
import type {
  BudgetItem,
  BudgetSummary,
  LodgingItem,
  ScheduleItem,
  TransportItem,
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
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [transports, setTransports] = useState<TransportItem[]>([])
  const [lodgings, setLodgings] = useState<LodgingItem[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    transport_total: 0,
    lodging_total: 0,
    total: 0,
  })
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [dirtySchedule, setDirtySchedule] = useState(false)
  const [dirtyTransport, setDirtyTransport] = useState(false)
  const [dirtyLodging, setDirtyLodging] = useState(false)
  const [dirtyBudget, setDirtyBudget] = useState(false)
  const [overviewSaving, setOverviewSaving] = useState(false)
  const [overviewError, setOverviewError] = useState('')
  const [overviewModalOpen, setOverviewModalOpen] = useState(false)
  const [overviewTitle, setOverviewTitle] = useState('')
  const [overviewStart, setOverviewStart] = useState('')
  const [overviewEnd, setOverviewEnd] = useState('')
  const [overviewNote, setOverviewNote] = useState('')
  const [overviewNotify, setOverviewNotify] = useState('')
  const [openTransports, setOpenTransports] = useState<Set<string>>(new Set())
  const scheduleSnapshot = useRef('')
  const transportSnapshot = useRef('')
  const lodgingSnapshot = useRef('')
  const budgetSnapshot = useRef('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login')
        return
      }

      try {
        const [tripRes, scheduleRes, transportRes, lodgingRes, budgetRes] = await Promise.all([
          api.get(`/trips/${tripId}`),
          api.get(`/trips/${tripId}/schedule`),
          api.get(`/trips/${tripId}/transports`),
          api.get(`/trips/${tripId}/lodgings`),
          api.get(`/trips/${tripId}/budget`),
        ])

        setTrip(tripRes.data)
        setOverviewTitle(tripRes.data.title || '')
        setOverviewStart(toDateInput(tripRes.data.start_at))
        setOverviewEnd(toDateInput(tripRes.data.end_at))
        setOverviewNote(tripRes.data.note || '')
        setOverviewNotify(tripRes.data.notify_at ? toDateInput(tripRes.data.notify_at) : '')
        const loadedSchedule = (scheduleRes.data || []).map((item: any) => ({
          id: item.id,
          localId: `schedule-${item.id}`,
          date: item.date,
          time: item.time,
          content: item.content,
        }))
        setScheduleItems(loadedSchedule)
        scheduleSnapshot.current = serializeSchedule(loadedSchedule)

        const loadedTransports = (transportRes.data || []).map((item: any) => ({
          id: item.id,
          localId: `transport-${item.id}`,
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
        setTransports(loadedTransports)
        transportSnapshot.current = serializeTransports(loadedTransports)

        const loadedLodgings = (lodgingRes.data || []).map((item: any) => ({
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
        setLodgings(loadedLodgings)
        lodgingSnapshot.current = serializeLodgings(loadedLodgings)

        const loadedBudget = (budgetRes.data?.items || []).map((item: any) => ({
          id: item.id,
          localId: `budget-${item.id}`,
          name: item.name || '',
          cost_yen: item.cost_yen ? String(item.cost_yen) : '',
        }))
        setBudgetItems(loadedBudget)
        budgetSnapshot.current = serializeBudgetItems(loadedBudget)
        setBudgetSummary({
          transport_total: budgetRes.data?.transport_total || 0,
          lodging_total: budgetRes.data?.lodging_total || 0,
          total: budgetRes.data?.total || 0,
        })
      } catch (err: any) {
        console.error('Failed to fetch trip data:', err)
        setError(err.response?.data?.message || '旅行の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, tripId])

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

  useEffect(() => {
    if (!scheduleSnapshot.current) {
      return
    }
    setDirtySchedule(serializeSchedule(scheduleItems) !== scheduleSnapshot.current)
  }, [scheduleItems])

  useEffect(() => {
    if (!transportSnapshot.current) {
      return
    }
    setDirtyTransport(serializeTransports(transports) !== transportSnapshot.current)
  }, [transports])

  useEffect(() => {
    if (!lodgingSnapshot.current) {
      return
    }
    setDirtyLodging(serializeLodgings(lodgings) !== lodgingSnapshot.current)
  }, [lodgings])

  useEffect(() => {
    if (!budgetSnapshot.current) {
      return
    }
    setDirtyBudget(serializeBudgetItems(budgetItems) !== budgetSnapshot.current)
  }, [budgetItems])

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
    } catch (err: any) {
      console.error('Failed to delete trip:', err)
      setError(err.response?.data?.message || '旅行の削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  const addScheduleItem = () => {
    if (!currentDate) {
      return
    }
    setScheduleItems((prev) => [
      ...prev,
      {
        localId: `schedule-${Date.now()}`,
        date: currentDate,
        time: '09:00',
        content: '',
      },
    ])
    setDirtySchedule(true)
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

  const splitTime = (time: string) => {
    const parts = time.split(':')
    if (parts.length !== 2) {
      return { hour: '00', minute: '00' }
    }
    return { hour: parts[0], minute: parts[1] }
  }

  const updateScheduleTimePart = (localId: string, part: 'hour' | 'minute', value: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) {
          return item
        }
        const current = splitTime(item.time)
        const nextTime =
          part === 'hour'
            ? `${value}:${current.minute}`
            : `${current.hour}:${value}`
        return { ...item, time: nextTime }
      })
    )
    setDirtySchedule(true)
  }

  const updateScheduleItem = (localId: string, field: keyof ScheduleItem, value: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, [field]: value } : item))
    )
    setDirtySchedule(true)
  }

  const removeScheduleItem = (localId: string) => {
    setScheduleItems((prev) => prev.filter((item) => item.localId !== localId))
    setDirtySchedule(true)
  }

  const addTransport = () => {
    const date = currentDate || tripDates[0] || ''
    const newId = `transport-${Date.now()}`
    setTransports((prev) => [
      ...prev,
      {
        localId: newId,
        mode: 'car',
        date,
        from_location: '',
        to_location: '',
        note: '',
        departure_time: '',
        arrival_time: '',
        route_name: '',
        train_name: '',
        ferry_name: '',
        flight_number: '',
        airline: '',
        terminal: '',
        company_name: '',
        pickup_location: '',
        dropoff_location: '',
        rental_url: '',
        distance_km: '',
        fuel_efficiency_km_per_l: '',
        gasoline_price_yen_per_l: '',
        gasoline_cost_yen: 0,
        highway_cost_yen: '',
        rental_fee_yen: '',
        fare_yen: '',
      },
    ])
    setOpenTransports((prev) => new Set(prev).add(newId))
    setDirtyTransport(true)
  }

  const updateTransport = (localId: string, field: keyof TransportItem, value: string) => {
    setTransports((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) {
          return item
        }
        const next = { ...item, [field]: value }
        if (next.mode === 'car' || next.mode === 'rental') {
          const distance = Number(next.distance_km)
          const efficiency = Number(next.fuel_efficiency_km_per_l)
          const price = Number(next.gasoline_price_yen_per_l)
          if (distance > 0 && efficiency > 0 && price > 0) {
            next.gasoline_cost_yen = Math.round((distance / efficiency) * price)
          } else {
            next.gasoline_cost_yen = 0
          }
        }
        return next
      })
    )
    setDirtyTransport(true)
  }

  const removeTransport = (localId: string) => {
    setTransports((prev) => prev.filter((item) => item.localId !== localId))
    setOpenTransports((prev) => {
      const next = new Set(prev)
      next.delete(localId)
      return next
    })
    setDirtyTransport(true)
  }

  const toggleTransport = (localId: string) => {
    setOpenTransports((prev) => {
      const next = new Set(prev)
      if (next.has(localId)) {
        next.delete(localId)
      } else {
        next.add(localId)
      }
      return next
    })
  }

  const addLodging = () => {
    const date = currentDate || tripDates[0] || ''
    setLodgings((prev) => [
      ...prev,
      {
        localId: `lodging-${Date.now()}`,
        date,
        name: '',
        reservation_url: '',
        address: '',
        check_in: '',
        check_out: '',
        reservation_number: '',
        cost_yen: '',
      },
    ])
    setDirtyLodging(true)
  }

  const updateLodging = (localId: string, field: keyof LodgingItem, value: string) => {
    setLodgings((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, [field]: value } : item))
    )
    setDirtyLodging(true)
  }

  const removeLodging = (localId: string) => {
    setLodgings((prev) => prev.filter((item) => item.localId !== localId))
    setDirtyLodging(true)
  }

  const addBudgetItem = () => {
    setBudgetItems((prev) => [
      ...prev,
      {
        localId: `budget-${Date.now()}`,
        name: '',
        cost_yen: '',
      },
    ])
    setDirtyBudget(true)
  }

  const updateBudgetItem = (localId: string, field: keyof BudgetItem, value: string) => {
    setBudgetItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, [field]: value } : item))
    )
    setDirtyBudget(true)
  }

  const removeBudgetItem = (localId: string) => {
    setBudgetItems((prev) => prev.filter((item) => item.localId !== localId))
    setDirtyBudget(true)
  }

  const saveSchedule = async () => {
    if (!trip) {
      return
    }
    const payload = scheduleItems.map((item) => ({
      date: item.date,
      time: item.time,
      content: item.content,
    }))
    await api.put(`/trips/${trip.id}/schedule`, payload)
    scheduleSnapshot.current = serializeSchedule(scheduleItems)
    setDirtySchedule(false)
  }

  const saveTransports = async () => {
    if (!trip) {
      return
    }
    const payload = transports.map((item) => ({
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
    const budgetRes = await api.get(`/trips/${trip.id}/budget`)
    setBudgetSummary({
      transport_total: budgetRes.data?.transport_total || 0,
      lodging_total: budgetRes.data?.lodging_total || 0,
      total: budgetRes.data?.total || 0,
    })
    transportSnapshot.current = serializeTransports(transports)
    setDirtyTransport(false)
  }

  const saveLodgings = async () => {
    if (!trip) {
      return
    }
    const payload = lodgings.map((item) => ({
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
    lodgingSnapshot.current = serializeLodgings(lodgings)
    setDirtyLodging(false)
  }

  const saveBudget = async () => {
    if (!trip) {
      return
    }
    const payload = budgetItems.map((item) => ({
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
    budgetSnapshot.current = serializeBudgetItems(budgetItems)
    setDirtyBudget(false)
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

    const payload: any = {
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
    } catch (err: any) {
      console.error('Failed to update trip overview:', err)
      setOverviewError(err.response?.data?.message || '概要の更新に失敗しました')
    } finally {
      setOverviewSaving(false)
    }
  }

  const serializeSchedule = (items: ScheduleItem[]) =>
    JSON.stringify(
      items.map((item) => ({
        date: item.date,
        time: item.time,
        content: item.content,
      }))
    )

  const serializeTransports = (items: TransportItem[]) =>
    JSON.stringify(
      items.map((item) => ({
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
        distance_km: item.distance_km,
        fuel_efficiency_km_per_l: item.fuel_efficiency_km_per_l,
        gasoline_price_yen_per_l: item.gasoline_price_yen_per_l,
        gasoline_cost_yen: item.gasoline_cost_yen,
        highway_cost_yen: item.highway_cost_yen,
        rental_fee_yen: item.rental_fee_yen,
        fare_yen: item.fare_yen,
      }))
    )

  const serializeLodgings = (items: LodgingItem[]) =>
    JSON.stringify(
      items.map((item) => ({
        date: item.date,
        name: item.name,
        reservation_url: item.reservation_url,
        address: item.address,
        check_in: item.check_in,
        check_out: item.check_out,
        reservation_number: item.reservation_number,
        cost_yen: item.cost_yen,
      }))
    )

  const serializeBudgetItems = (items: BudgetItem[]) =>
    JSON.stringify(
      items.map((item) => ({
        name: item.name,
        cost_yen: item.cost_yen,
      }))
    )

  const manualTotal = budgetItems.reduce((sum, item) => sum + (Number(item.cost_yen) || 0), 0)
  const totalBudget = budgetSummary.transport_total + budgetSummary.lodging_total + manualTotal

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
                  onAdd={addScheduleItem}
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
                  onAdd={addTransport}
                  onSave={saveTransports}
                  onToggle={toggleTransport}
                  onRemove={removeTransport}
                  onUpdate={updateTransport}
                />
              )}

              {activeItineraryTab === 'lodging' && (
                <LodgingTab
                  lodgings={lodgings}
                  onAdd={addLodging}
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
