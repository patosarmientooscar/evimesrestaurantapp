// ─── Database row types ────────────────────────────────────────────────────

export type ServiceType = "lunch" | "dinner";
export type ReservationStatus = "confirmed" | "cancelled" | "no_show";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  max_party_size: number;
  /** WhatsApp phone number in international format, e.g. "+34600000000" */
  callmebot_phone: string | null;
  callmebot_api_key: string | null;
  /** Days of week that are OPEN: 0=Sun 1=Mon … 6=Sat */
  open_days: number[];
  lunch_enabled: boolean;
  dinner_enabled: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  restaurant_id: string;
  /** HH:mm — e.g. "13:00" */
  time: string;
  service: ServiceType;
  /** Max total covers at this time */
  capacity: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_id: string;
  date: string; // ISO date "YYYY-MM-DD"
  time: string; // "HH:mm"
  party_size: number;
  status: ReservationStatus;
  confirmation_code: string;
  notes: string | null;
  service: ServiceType;
  created_at: string;
}

export interface ClosedDate {
  id: string;
  restaurant_id: string;
  date: string;
  reason: string | null;
}

// ─── Business logic types ──────────────────────────────────────────────────

export interface AvailableSlot {
  time: string;
  service: ServiceType;
  available_capacity: number;
}

export interface AvailabilityResponse {
  lunch: AvailableSlot[];
  dinner: AvailableSlot[];
}

export interface ReservationInput {
  restaurant_slug: string;
  date: string; // "YYYY-MM-DD"
  slot_time: string; // "HH:mm"
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  notes?: string;
}

export interface ReservationWithDetails extends Reservation {
  customer: Customer;
  restaurant: Restaurant;
}

// ─── API response shapes ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
