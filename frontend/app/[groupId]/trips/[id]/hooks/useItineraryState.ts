import { useCallback, useMemo, useReducer } from "react";
import type {
  BudgetItem,
  BudgetSummary,
  LodgingItem,
  ScheduleItem,
  TransportItem,
} from "../types";

type ItineraryState = {
  scheduleItems: ScheduleItem[];
  transports: TransportItem[];
  lodgings: LodgingItem[];
  budgetItems: BudgetItem[];
  budgetSummary: BudgetSummary;
  selectedDayIndex: number;
  openTransports: Set<string>;
  dirtySchedule: boolean;
  dirtyTransport: boolean;
  dirtyLodging: boolean;
  dirtyBudget: boolean;
  scheduleSnapshot: string;
  transportSnapshot: string;
  lodgingSnapshot: string;
  budgetSnapshot: string;
};

type InitializePayload = {
  scheduleItems: ScheduleItem[];
  transports: TransportItem[];
  lodgings: LodgingItem[];
  budgetItems: BudgetItem[];
  budgetSummary: BudgetSummary;
};

type SetItemsPayload<T> = {
  items: T[];
  dirty: boolean;
  snapshot?: string;
};

type Action =
  | { type: "initialize"; payload: InitializePayload }
  | { type: "setScheduleItems"; payload: SetItemsPayload<ScheduleItem> }
  | {
      type: "setTransports";
      payload: SetItemsPayload<TransportItem>;
      openTransports?: Set<string>;
    }
  | { type: "setLodgings"; payload: SetItemsPayload<LodgingItem> }
  | { type: "setBudgetItems"; payload: SetItemsPayload<BudgetItem> }
  | { type: "setBudgetSummary"; payload: BudgetSummary }
  | { type: "setSelectedDayIndex"; payload: number }
  | { type: "toggleTransport"; payload: string };

const initialState: ItineraryState = {
  scheduleItems: [],
  transports: [],
  lodgings: [],
  budgetItems: [],
  budgetSummary: {
    transport_total: 0,
    lodging_total: 0,
    total: 0,
  },
  selectedDayIndex: 0,
  openTransports: new Set(),
  dirtySchedule: false,
  dirtyTransport: false,
  dirtyLodging: false,
  dirtyBudget: false,
  scheduleSnapshot: "",
  transportSnapshot: "",
  lodgingSnapshot: "",
  budgetSnapshot: "",
};

const reducer = (state: ItineraryState, action: Action): ItineraryState => {
  switch (action.type) {
    case "initialize": {
      const scheduleSnapshot = serializeSchedule(action.payload.scheduleItems);
      const transportSnapshot = serializeTransports(action.payload.transports);
      const lodgingSnapshot = serializeLodgings(action.payload.lodgings);
      const budgetSnapshot = serializeBudgetItems(action.payload.budgetItems);
      return {
        ...state,
        scheduleItems: action.payload.scheduleItems,
        transports: action.payload.transports,
        lodgings: action.payload.lodgings,
        budgetItems: action.payload.budgetItems,
        budgetSummary: action.payload.budgetSummary,
        scheduleSnapshot,
        transportSnapshot,
        lodgingSnapshot,
        budgetSnapshot,
        dirtySchedule: false,
        dirtyTransport: false,
        dirtyLodging: false,
        dirtyBudget: false,
        openTransports: new Set(),
      };
    }
    case "setScheduleItems":
      return {
        ...state,
        scheduleItems: action.payload.items,
        dirtySchedule: action.payload.dirty,
        scheduleSnapshot: action.payload.snapshot ?? state.scheduleSnapshot,
      };
    case "setTransports":
      return {
        ...state,
        transports: action.payload.items,
        dirtyTransport: action.payload.dirty,
        transportSnapshot: action.payload.snapshot ?? state.transportSnapshot,
        openTransports: action.openTransports ?? state.openTransports,
      };
    case "setLodgings":
      return {
        ...state,
        lodgings: action.payload.items,
        dirtyLodging: action.payload.dirty,
        lodgingSnapshot: action.payload.snapshot ?? state.lodgingSnapshot,
      };
    case "setBudgetItems":
      return {
        ...state,
        budgetItems: action.payload.items,
        dirtyBudget: action.payload.dirty,
        budgetSnapshot: action.payload.snapshot ?? state.budgetSnapshot,
      };
    case "setBudgetSummary":
      return {
        ...state,
        budgetSummary: action.payload,
      };
    case "setSelectedDayIndex":
      return {
        ...state,
        selectedDayIndex: action.payload,
      };
    case "toggleTransport": {
      const next = new Set(state.openTransports);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return {
        ...state,
        openTransports: next,
      };
    }
    default:
      return state;
  }
};

const serializeSchedule = (items: ScheduleItem[]) =>
  JSON.stringify(
    items.map((item) => ({
      date: item.date,
      time: item.time,
      content: item.content,
    })),
  );

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
    })),
  );

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
    })),
  );

const serializeBudgetItems = (items: BudgetItem[]) =>
  JSON.stringify(
    items.map((item) => ({
      name: item.name,
      cost_yen: item.cost_yen,
    })),
  );

export default function useItineraryState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const splitTime = useCallback((time: string) => {
    const parts = time.split(":");
    if (parts.length !== 2) {
      return { hour: "00", minute: "00" };
    }
    return { hour: parts[0], minute: parts[1] };
  }, []);

  const initialize = useCallback((payload: InitializePayload) => {
    dispatch({ type: "initialize", payload });
  }, []);

  const setSelectedDayIndex = useCallback((index: number) => {
    dispatch({ type: "setSelectedDayIndex", payload: index });
  }, []);

  const addScheduleItem = useCallback(
    (currentDate: string) => {
      if (!currentDate) {
        return;
      }
      const nextItems = [
        ...state.scheduleItems,
        {
          localId: `schedule-${Date.now()}`,
          date: currentDate,
          time: "09:00",
          content: "",
        },
      ];
      dispatch({
        type: "setScheduleItems",
        payload: {
          items: nextItems,
          dirty: serializeSchedule(nextItems) !== state.scheduleSnapshot,
        },
      });
    },
    [state.scheduleItems, state.scheduleSnapshot],
  );

  const updateScheduleItem = useCallback(
    (localId: string, field: keyof ScheduleItem, value: string) => {
      const nextItems = state.scheduleItems.map((item) =>
        item.localId === localId ? { ...item, [field]: value } : item,
      );
      dispatch({
        type: "setScheduleItems",
        payload: {
          items: nextItems,
          dirty: serializeSchedule(nextItems) !== state.scheduleSnapshot,
        },
      });
    },
    [state.scheduleItems, state.scheduleSnapshot],
  );

  const updateScheduleTimePart = useCallback(
    (localId: string, part: "hour" | "minute", value: string) => {
      const nextItems = state.scheduleItems.map((item) => {
        if (item.localId !== localId) {
          return item;
        }
        const current = splitTime(item.time);
        const nextTime =
          part === "hour"
            ? `${value}:${current.minute}`
            : `${current.hour}:${value}`;
        return { ...item, time: nextTime };
      });
      dispatch({
        type: "setScheduleItems",
        payload: {
          items: nextItems,
          dirty: serializeSchedule(nextItems) !== state.scheduleSnapshot,
        },
      });
    },
    [splitTime, state.scheduleItems, state.scheduleSnapshot],
  );

  const removeScheduleItem = useCallback(
    (localId: string) => {
      const nextItems = state.scheduleItems.filter(
        (item) => item.localId !== localId,
      );
      dispatch({
        type: "setScheduleItems",
        payload: {
          items: nextItems,
          dirty: serializeSchedule(nextItems) !== state.scheduleSnapshot,
        },
      });
    },
    [state.scheduleItems, state.scheduleSnapshot],
  );

  const markScheduleSaved = useCallback(() => {
    const snapshot = serializeSchedule(state.scheduleItems);
    dispatch({
      type: "setScheduleItems",
      payload: { items: state.scheduleItems, dirty: false, snapshot },
    });
  }, [state.scheduleItems]);

  const addTransport = useCallback(
    (date: string) => {
      const newId = `transport-${Date.now()}`;
      const nextItems = [
        ...state.transports,
        {
          localId: newId,
          mode: "car",
          date,
          from_location: "",
          to_location: "",
          note: "",
          departure_time: "",
          arrival_time: "",
          route_name: "",
          train_name: "",
          ferry_name: "",
          flight_number: "",
          airline: "",
          terminal: "",
          company_name: "",
          pickup_location: "",
          dropoff_location: "",
          rental_url: "",
          distance_km: "",
          fuel_efficiency_km_per_l: "",
          gasoline_price_yen_per_l: "",
          gasoline_cost_yen: 0,
          highway_cost_yen: "",
          rental_fee_yen: "",
          fare_yen: "",
        },
      ];
      const nextOpen = new Set(state.openTransports);
      nextOpen.add(newId);
      dispatch({
        type: "setTransports",
        payload: {
          items: nextItems,
          dirty: serializeTransports(nextItems) !== state.transportSnapshot,
        },
        openTransports: nextOpen,
      });
    },
    [state.openTransports, state.transports, state.transportSnapshot],
  );

  const updateTransport = useCallback(
    (localId: string, field: keyof TransportItem, value: string) => {
      const nextItems = state.transports.map((item) => {
        if (item.localId !== localId) {
          return item;
        }
        return { ...item, [field]: value };
      });
      dispatch({
        type: "setTransports",
        payload: {
          items: nextItems,
          dirty: serializeTransports(nextItems) !== state.transportSnapshot,
        },
      });
    },
    [state.transports, state.transportSnapshot],
  );

  const removeTransport = useCallback(
    (localId: string) => {
      const nextItems = state.transports.filter(
        (item) => item.localId !== localId,
      );
      const nextOpen = new Set(state.openTransports);
      nextOpen.delete(localId);
      dispatch({
        type: "setTransports",
        payload: {
          items: nextItems,
          dirty: serializeTransports(nextItems) !== state.transportSnapshot,
        },
        openTransports: nextOpen,
      });
    },
    [state.openTransports, state.transports, state.transportSnapshot],
  );

  const toggleTransport = useCallback((localId: string) => {
    dispatch({ type: "toggleTransport", payload: localId });
  }, []);

  const markTransportSaved = useCallback(() => {
    const snapshot = serializeTransports(state.transports);
    dispatch({
      type: "setTransports",
      payload: { items: state.transports, dirty: false, snapshot },
    });
  }, [state.transports]);

  const syncTransports = useCallback((items: TransportItem[]) => {
    dispatch({
      type: "setTransports",
      payload: {
        items,
        dirty: false,
        snapshot: serializeTransports(items),
      },
      openTransports: new Set(),
    });
  }, []);

  const addLodging = useCallback(
    (date: string) => {
      const nextItems = [
        ...state.lodgings,
        {
          localId: `lodging-${Date.now()}`,
          date,
          name: "",
          reservation_url: "",
          address: "",
          check_in: "",
          check_out: "",
          reservation_number: "",
          cost_yen: "",
        },
      ];
      dispatch({
        type: "setLodgings",
        payload: {
          items: nextItems,
          dirty: serializeLodgings(nextItems) !== state.lodgingSnapshot,
        },
      });
    },
    [state.lodgings, state.lodgingSnapshot],
  );

  const updateLodging = useCallback(
    (localId: string, field: keyof LodgingItem, value: string) => {
      const nextItems = state.lodgings.map((item) =>
        item.localId === localId ? { ...item, [field]: value } : item,
      );
      dispatch({
        type: "setLodgings",
        payload: {
          items: nextItems,
          dirty: serializeLodgings(nextItems) !== state.lodgingSnapshot,
        },
      });
    },
    [state.lodgings, state.lodgingSnapshot],
  );

  const removeLodging = useCallback(
    (localId: string) => {
      const nextItems = state.lodgings.filter(
        (item) => item.localId !== localId,
      );
      dispatch({
        type: "setLodgings",
        payload: {
          items: nextItems,
          dirty: serializeLodgings(nextItems) !== state.lodgingSnapshot,
        },
      });
    },
    [state.lodgings, state.lodgingSnapshot],
  );

  const markLodgingSaved = useCallback(() => {
    const snapshot = serializeLodgings(state.lodgings);
    dispatch({
      type: "setLodgings",
      payload: { items: state.lodgings, dirty: false, snapshot },
    });
  }, [state.lodgings]);

  const addBudgetItem = useCallback(() => {
    const nextItems = [
      ...state.budgetItems,
      {
        localId: `budget-${Date.now()}`,
        name: "",
        cost_yen: "",
      },
    ];
    dispatch({
      type: "setBudgetItems",
      payload: {
        items: nextItems,
        dirty: serializeBudgetItems(nextItems) !== state.budgetSnapshot,
      },
    });
  }, [state.budgetItems, state.budgetSnapshot]);

  const updateBudgetItem = useCallback(
    (localId: string, field: keyof BudgetItem, value: string) => {
      const nextItems = state.budgetItems.map((item) =>
        item.localId === localId ? { ...item, [field]: value } : item,
      );
      dispatch({
        type: "setBudgetItems",
        payload: {
          items: nextItems,
          dirty: serializeBudgetItems(nextItems) !== state.budgetSnapshot,
        },
      });
    },
    [state.budgetItems, state.budgetSnapshot],
  );

  const removeBudgetItem = useCallback(
    (localId: string) => {
      const nextItems = state.budgetItems.filter(
        (item) => item.localId !== localId,
      );
      dispatch({
        type: "setBudgetItems",
        payload: {
          items: nextItems,
          dirty: serializeBudgetItems(nextItems) !== state.budgetSnapshot,
        },
      });
    },
    [state.budgetItems, state.budgetSnapshot],
  );

  const markBudgetSaved = useCallback(() => {
    const snapshot = serializeBudgetItems(state.budgetItems);
    dispatch({
      type: "setBudgetItems",
      payload: { items: state.budgetItems, dirty: false, snapshot },
    });
  }, [state.budgetItems]);

  const setBudgetSummary = useCallback((summary: BudgetSummary) => {
    dispatch({ type: "setBudgetSummary", payload: summary });
  }, []);

  const manualTotal = useMemo(
    () =>
      state.budgetItems.reduce(
        (sum, item) => sum + (Number(item.cost_yen) || 0),
        0,
      ),
    [state.budgetItems],
  );

  const totalBudget = useMemo(
    () =>
      state.budgetSummary.transport_total +
      state.budgetSummary.lodging_total +
      manualTotal,
    [
      manualTotal,
      state.budgetSummary.lodging_total,
      state.budgetSummary.transport_total,
    ],
  );

  return {
    ...state,
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
    markTransportSaved,
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
  };
}
