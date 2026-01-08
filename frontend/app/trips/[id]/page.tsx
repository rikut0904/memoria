'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { auth } from '@/lib/firebase'

interface Trip {
  id: number
  title: string
  start_at: string
  end_at: string
  note: string
  created_by: number
  notify_at?: string | null
  created_at: string
  albums?: {
    id: number
    title: string
    description: string
  }[]
  posts?: {
    id: number
    type: string
    title: string
    body: string
    published_at: string
  }[]
}

type ScheduleItem = {
  id?: number
  localId: string
  date: string
  time: string
  content: string
}

type TransportItem = {
  id?: number
  localId: string
  mode: string
  date: string
  from_location: string
  to_location: string
  note: string
  departure_time: string
  arrival_time: string
  route_name: string
  train_name: string
  ferry_name: string
  flight_number: string
  airline: string
  terminal: string
  company_name: string
  pickup_location: string
  dropoff_location: string
  rental_url: string
  distance_km: string
  fuel_efficiency_km_per_l: string
  gasoline_price_yen_per_l: string
  gasoline_cost_yen: number
  highway_cost_yen: string
  rental_fee_yen: string
  fare_yen: string
}

type LodgingItem = {
  id?: number
  localId: string
  date: string
  name: string
  reservation_url: string
  address: string
  check_in: string
  check_out: string
  reservation_number: string
  cost_yen: string
}

type BudgetItem = {
  id?: number
  localId: string
  name: string
  cost_yen: string
}

type BudgetSummary = {
  transport_total: number
  lodging_total: number
  total: number
}

const transportModes = [
  { value: 'car', label: '自家用車' },
  { value: 'rental', label: 'レンタカー' },
  { value: 'train', label: '電車' },
  { value: 'shinkansen', label: '新幹線/特急' },
  { value: 'ferry', label: '船' },
  { value: 'flight', label: '飛行機' },
  { value: 'bus', label: 'バス' },
]

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary'>('overview')
  const [activeItineraryTab, setActiveItineraryTab] = useState<'schedule' | 'transport' | 'lodging' | 'budget'>('schedule')
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{trip.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(trip.start_at).toLocaleDateString('ja-JP')} 〜{' '}
                {new Date(trip.end_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => router.push(`/posts/new?trip_id=${trip.id}&redirect=/trips/${trip.id}`)}
                className="w-24 px-4 py-2 text-sm text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                投稿
              </button>
              <button
                onClick={() => router.push(`/albums/new?trip_id=${trip.id}&redirect=/trips/${trip.id}`)}
                className="w-24 px-4 py-2 text-sm text-center border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50"
              >
                アルバム
              </button>
            </div>
          </div>

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
            <div className="mt-6 space-y-4">
              {trip.note && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {trip.note}
                </div>
              )}

              {trip.notify_at && (
                <p className="text-sm text-gray-500">
                  通知予定: {new Date(trip.notify_at).toLocaleString('ja-JP')}
                </p>
              )}

              {(trip.albums && trip.albums.length > 0) || (trip.posts && trip.posts.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">紐づけたアルバム</h3>
                    {trip.albums && trip.albums.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-700">
                        {trip.albums.map((album) => (
                          <li key={album.id} className="flex items-start gap-2">
                            <span className="text-gray-400">📷</span>
                            <div>
                              <p className="font-medium">{album.title}</p>
                              {album.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">{album.description}</p>
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">紐づけた投稿</h3>
                    {trip.posts && trip.posts.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-700">
                        {trip.posts.map((post) => (
                          <li key={post.id} className="flex items-start gap-2">
                            <span className="text-gray-400">📝</span>
                            <div>
                              <p className="font-medium">{post.title || '(タイトルなし)'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(post.published_at).toLocaleDateString('ja-JP')} / {post.type}
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
                  onClick={() => setOverviewModalOpen(true)}
                  className="px-4 py-2 text-sm border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50"
                >
                  概要を編集
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deleting ? '削除中...' : '旅行を削除'}
                </button>
              </div>
            </div>
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
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {tripDates.map((date, index) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDayIndex(index)}
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
                        onClick={addScheduleItem}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        予定を追加
                      </button>
                      <button
                        onClick={saveSchedule}
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
                      {scheduleItems
                        .filter((item) => item.date === currentDate)
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => (
                          <div key={item.localId} className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              <select
                                value={splitTime(item.time).hour}
                                onChange={(e) => updateScheduleTimePart(item.localId, 'hour', e.target.value)}
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
                                onChange={(e) => updateScheduleTimePart(item.localId, 'minute', e.target.value)}
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
                              onChange={(e) => updateScheduleItem(item.localId, 'content', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="予定の内容を入力"
                            />
                            <button
                              onClick={() => removeScheduleItem(item.localId)}
                              className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                      {scheduleItems.filter((item) => item.date === currentDate).length === 0 && (
                        <p className="text-sm text-gray-500">予定が登録されていません</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeItineraryTab === 'transport' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={addTransport}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      移動手段を追加
                    </button>
                    <button
                      onClick={saveTransports}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      保存
                    </button>
                  </div>

                  <div className="space-y-4">
                    {transports.map((transport) => {
                      const isOpen = openTransports.has(transport.localId)
                      return (
                        <div key={transport.localId} className="border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <select
                                value={transport.mode}
                                onChange={(e) => updateTransport(transport.localId, 'mode', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              >
                                {transportModes.map((mode) => (
                                  <option key={mode.value} value={mode.value}>
                                    {mode.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeTransport(transport.localId)}
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
                                  onChange={(e) => updateTransport(transport.localId, 'date', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div className="flex flex-col flex-1 min-w-[140px]">
                                <label className="text-xs text-gray-500 mb-1">出発地</label>
                                <input
                                  type="text"
                                  value={transport.from_location}
                                  onChange={(e) => updateTransport(transport.localId, 'from_location', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="出発地"
                                />
                              </div>
                              <div className="flex flex-col flex-1 min-w-[140px]">
                                <label className="text-xs text-gray-500 mb-1">到着地</label>
                                <input
                                  type="text"
                                  value={transport.to_location}
                                  onChange={(e) => updateTransport(transport.localId, 'to_location', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="到着地"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleTransport(transport.localId)}
                                className="w-9 h-9 inline-flex items-center justify-center rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                aria-expanded={isOpen}
                                aria-label={isOpen ? '折りたたむ' : '開く'}
                              >
                                <span
                                  className={`material-symbols-outlined text-[20px] transition-transform ${
                                    isOpen ? 'rotate-180' : ''
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

                        {(transport.mode === 'car' || transport.mode === 'rental') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {transport.mode === 'rental' && (
                              <>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-500 mb-1">レンタカー会社名</label>
                                  <input
                                    type="text"
                                    value={transport.company_name}
                                    onChange={(e) => updateTransport(transport.localId, 'company_name', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="レンタカー会社名"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-500 mb-1">受取場所</label>
                                  <input
                                    type="text"
                                    value={transport.pickup_location}
                                    onChange={(e) => updateTransport(transport.localId, 'pickup_location', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="受取場所"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-500 mb-1">返却場所</label>
                                  <input
                                    type="text"
                                    value={transport.dropoff_location}
                                    onChange={(e) => updateTransport(transport.localId, 'dropoff_location', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="返却場所"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-500 mb-1">予約URL</label>
                                  <input
                                    type="url"
                                    value={transport.rental_url}
                                    onChange={(e) => updateTransport(transport.localId, 'rental_url', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="予約URL"
                                  />
                                </div>
                              </>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-2">
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">予想走行距離（km）</label>
                                <input
                                  type="number"
                                  value={transport.distance_km}
                                  onChange={(e) => updateTransport(transport.localId, 'distance_km', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="km"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">燃費（km/L）</label>
                                <input
                                  type="number"
                                  value={transport.fuel_efficiency_km_per_l}
                                  onChange={(e) => updateTransport(transport.localId, 'fuel_efficiency_km_per_l', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="km/L"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">ガソリン単価（円/L）</label>
                                <input
                                  type="number"
                                  value={transport.gasoline_price_yen_per_l}
                                  onChange={(e) => updateTransport(transport.localId, 'gasoline_price_yen_per_l', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="円/L"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">ガソリン代（自動）</label>
                              <input
                                type="text"
                                value={transport.gasoline_cost_yen ? `${transport.gasoline_cost_yen} 円` : '0 円'}
                                readOnly
                                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                              />
                            </div>
                            {transport.mode === 'car' && (
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">高速代（円）</label>
                                <input
                                  type="number"
                                  value={transport.highway_cost_yen}
                                  onChange={(e) => updateTransport(transport.localId, 'highway_cost_yen', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="円"
                                />
                              </div>
                            )}
                            {transport.mode === 'rental' && (
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">レンタル費用（円）</label>
                                <input
                                  type="number"
                                  value={transport.rental_fee_yen}
                                  onChange={(e) => updateTransport(transport.localId, 'rental_fee_yen', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="円"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {(transport.mode === 'train' || transport.mode === 'bus') && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">路線名</label>
                              <input
                                type="text"
                                value={transport.route_name}
                                onChange={(e) => updateTransport(transport.localId, 'route_name', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="路線名"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">出発時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.departure_time}
                                onChange={(e) => updateTransport(transport.localId, 'departure_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">到着時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.arrival_time}
                                onChange={(e) => updateTransport(transport.localId, 'arrival_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">費用（円）</label>
                              <input
                                type="number"
                                value={transport.fare_yen}
                                onChange={(e) => updateTransport(transport.localId, 'fare_yen', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="円"
                              />
                            </div>
                          </div>
                        )}

                        {transport.mode === 'shinkansen' && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">列車名</label>
                              <input
                                type="text"
                                value={transport.train_name}
                                onChange={(e) => updateTransport(transport.localId, 'train_name', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="列車名"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">出発時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.departure_time}
                                onChange={(e) => updateTransport(transport.localId, 'departure_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">到着時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.arrival_time}
                                onChange={(e) => updateTransport(transport.localId, 'arrival_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">費用（円）</label>
                              <input
                                type="number"
                                value={transport.fare_yen}
                                onChange={(e) => updateTransport(transport.localId, 'fare_yen', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="円"
                              />
                            </div>
                          </div>
                        )}

                        {transport.mode === 'ferry' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">便名</label>
                              <input
                                type="text"
                                value={transport.ferry_name}
                                onChange={(e) => updateTransport(transport.localId, 'ferry_name', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="便名"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">出発時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.departure_time}
                                onChange={(e) => updateTransport(transport.localId, 'departure_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">到着時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.arrival_time}
                                onChange={(e) => updateTransport(transport.localId, 'arrival_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">費用（円）</label>
                              <input
                                type="number"
                                value={transport.fare_yen}
                                onChange={(e) => updateTransport(transport.localId, 'fare_yen', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="円"
                              />
                            </div>
                          </div>
                        )}

                        {transport.mode === 'flight' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">便名</label>
                              <input
                                type="text"
                                value={transport.flight_number}
                                onChange={(e) => updateTransport(transport.localId, 'flight_number', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="便名"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">航空会社</label>
                              <input
                                type="text"
                                value={transport.airline}
                                onChange={(e) => updateTransport(transport.localId, 'airline', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="航空会社"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">ターミナル</label>
                              <input
                                type="text"
                                value={transport.terminal}
                                onChange={(e) => updateTransport(transport.localId, 'terminal', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="ターミナル"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">出発時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.departure_time}
                                onChange={(e) => updateTransport(transport.localId, 'departure_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">到着時刻</label>
                              <input
                                type="time"
                                step={600}
                                value={transport.arrival_time}
                                onChange={(e) => updateTransport(transport.localId, 'arrival_time', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs text-gray-500 mb-1">費用（円）</label>
                              <input
                                type="number"
                                value={transport.fare_yen}
                                onChange={(e) => updateTransport(transport.localId, 'fare_yen', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="円"
                              />
                            </div>
                          </div>
                        )}

                        <textarea
                          value={transport.note}
                          onChange={(e) => updateTransport(transport.localId, 'note', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          rows={2}
                          placeholder="メモ（任意）"
                        />
                            </>
                          )}
                        </div>
                      )
                    })}
                    {transports.length === 0 && (
                      <p className="text-sm text-gray-500">移動手段が登録されていません</p>
                    )}
                  </div>
                </div>
              )}

              {activeItineraryTab === 'lodging' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={addLodging}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      宿を追加
                    </button>
                    <button
                      onClick={saveLodgings}
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
                            onChange={(e) => updateLodging(lodging.localId, 'date', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            value={lodging.name}
                            onChange={(e) => updateLodging(lodging.localId, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                            placeholder="宿名"
                          />
                          <button
                            onClick={() => removeLodging(lodging.localId)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            削除
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="url"
                            value={lodging.reservation_url}
                            onChange={(e) => updateLodging(lodging.localId, 'reservation_url', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="予約サイトURL"
                          />
                          <input
                            type="text"
                            value={lodging.address}
                            onChange={(e) => updateLodging(lodging.localId, 'address', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="住所"
                          />
                          <input
                            type="time"
                            step={600}
                            value={lodging.check_in}
                            onChange={(e) => updateLodging(lodging.localId, 'check_in', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="チェックイン"
                          />
                          <input
                            type="time"
                            step={600}
                            value={lodging.check_out}
                            onChange={(e) => updateLodging(lodging.localId, 'check_out', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="チェックアウト"
                          />
                          <input
                            type="text"
                            value={lodging.reservation_number}
                            onChange={(e) => updateLodging(lodging.localId, 'reservation_number', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="予約番号"
                          />
                          <input
                            type="number"
                            value={lodging.cost_yen}
                            onChange={(e) => updateLodging(lodging.localId, 'cost_yen', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="費用（円）"
                          />
                        </div>
                      </div>
                    ))}
                    {lodgings.length === 0 && (
                      <p className="text-sm text-gray-500">宿が登録されていません</p>
                    )}
                  </div>
                </div>
              )}

              {activeItineraryTab === 'budget' && (
                <div className="mt-6 space-y-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                    <p className="text-sm text-primary-700">合計予算</p>
                    <p className="text-2xl font-semibold text-primary-700">
                      {totalBudget.toLocaleString('ja-JP')} 円
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">移動手段の合計</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {budgetSummary.transport_total.toLocaleString('ja-JP')} 円
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">宿の合計</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {budgetSummary.lodging_total.toLocaleString('ja-JP')} 円
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={addBudgetItem}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      追加費用を追加
                    </button>
                    <button
                      onClick={saveBudget}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      保存
                    </button>
                  </div>

                  <div className="space-y-3">
                    {budgetItems.map((item) => (
                      <div key={item.localId} className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateBudgetItem(item.localId, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="項目名"
                        />
                        <input
                          type="number"
                          value={item.cost_yen}
                          onChange={(e) => updateBudgetItem(item.localId, 'cost_yen', e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="費用（円）"
                        />
                        <button
                          onClick={() => removeBudgetItem(item.localId)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                    {budgetItems.length === 0 && (
                      <p className="text-sm text-gray-500">追加費用が登録されていません</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {overviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">旅行の概要を編集</h2>
              <button
                onClick={() => setOverviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                閉じる
              </button>
            </div>
            {overviewError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {overviewError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">旅行タイトル</label>
                <input
                  type="text"
                  value={overviewTitle}
                  onChange={(e) => setOverviewTitle(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">通知日（任意）</label>
                <input
                  type="date"
                  value={overviewNotify}
                  onChange={(e) => setOverviewNotify(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">開始日</label>
                <input
                  type="date"
                  value={overviewStart}
                  onChange={(e) => setOverviewStart(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">終了日</label>
                <input
                  type="date"
                  value={overviewEnd}
                  onChange={(e) => setOverviewEnd(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm text-gray-600 mb-1">メモ</label>
                <textarea
                  value={overviewNote}
                  onChange={(e) => setOverviewNote(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOverviewModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                キャンセル
              </button>
              <button
                onClick={saveOverview}
                disabled={overviewSaving}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {overviewSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
