export type Trip = {
  id: number;
  title: string;
  start_at: string;
  end_at: string;
  note: string;
  created_by: number;
  notify_at?: string | null;
  created_at: string;
  albums?: {
    id: number;
    title: string;
    description: string;
  }[];
  posts?: {
    id: number;
    type: string;
    title: string;
    body: string;
    published_at: string;
  }[];
};

export type ScheduleItem = {
  id?: number;
  localId: string;
  date: string;
  time: string;
  content: string;
};

export type TransportItem = {
  id?: number;
  localId: string;
  mode: string;
  date: string;
  from_location: string;
  to_location: string;
  note: string;
  departure_time: string;
  arrival_time: string;
  route_name: string;
  train_name: string;
  ferry_name: string;
  flight_number: string;
  airline: string;
  terminal: string;
  company_name: string;
  pickup_location: string;
  dropoff_location: string;
  rental_url: string;
  distance_km: string;
  fuel_efficiency_km_per_l: string;
  gasoline_price_yen_per_l: string;
  gasoline_cost_yen: number;
  highway_cost_yen: string;
  rental_fee_yen: string;
  fare_yen: string;
};

export type LodgingItem = {
  id?: number;
  localId: string;
  date: string;
  name: string;
  reservation_url: string;
  address: string;
  check_in: string;
  check_out: string;
  reservation_number: string;
  cost_yen: string;
};

export type BudgetItem = {
  id?: number;
  localId: string;
  name: string;
  cost_yen: string;
};

export type BudgetSummary = {
  transport_total: number;
  lodging_total: number;
  total: number;
};

export type ScheduleRequestItem = {
  date: string;
  time: string;
  content: string;
};

export type TransportRequestItem = {
  mode: string;
  date: string;
  from_location: string;
  to_location: string;
  note: string;
  departure_time: string;
  arrival_time: string;
  route_name: string;
  train_name: string;
  ferry_name: string;
  flight_number: string;
  airline: string;
  terminal: string;
  company_name: string;
  pickup_location: string;
  dropoff_location: string;
  rental_url: string;
  distance_km: number;
  fuel_efficiency_km_per_l: number;
  gasoline_price_yen_per_l: number;
  gasoline_cost_yen: number;
  highway_cost_yen: number;
  rental_fee_yen: number;
  fare_yen: number;
};

export type LodgingRequestItem = {
  date: string;
  name: string;
  reservation_url: string;
  address: string;
  check_in: string;
  check_out: string;
  reservation_number: string;
  cost_yen: number;
};

export type BudgetRequestItem = {
  name: string;
  cost_yen: number;
};

export type ScheduleResponseItem = {
  id: number;
  date: string;
  time: string;
  content: string;
};

export type TransportResponseItem = {
  id: number;
  mode: string;
  date: string;
  from_location: string;
  to_location: string;
  note: string;
  departure_time: string;
  arrival_time: string;
  route_name: string;
  train_name: string;
  ferry_name: string;
  flight_number: string;
  airline: string;
  terminal: string;
  company_name: string;
  pickup_location: string;
  dropoff_location: string;
  rental_url: string;
  distance_km: number;
  fuel_efficiency_km_per_l: number;
  gasoline_price_yen_per_l: number;
  gasoline_cost_yen: number;
  highway_cost_yen: number;
  rental_fee_yen: number;
  fare_yen: number;
};

export type LodgingResponseItem = {
  id: number;
  date: string;
  name: string;
  reservation_url: string;
  address: string;
  check_in: string;
  check_out: string;
  reservation_number: string;
  cost_yen: number;
};

export type BudgetResponseItem = {
  id: number;
  name: string;
  cost_yen: number;
};

export type BudgetResponse = {
  transport_total: number;
  lodging_total: number;
  total: number;
  items: BudgetResponseItem[];
};
