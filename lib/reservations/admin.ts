import { createAdminClient } from "@/lib/supabase/admin";

export interface ReservationRow {
  id: string;
  slot_time: string;
  reservation_date: string;
  party_size: number;
  status: string;
  service: string;
  confirmation_code: string;
  notes: string | null;
  customer: {
    name: string;
    phone: string;
    email: string | null;
  } | null;
}

export async function getReservationsByDate(
  restaurantId: string,
  date: string
): Promise<ReservationRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reservations")
    .select("id, slot_time, reservation_date, party_size, status, service, confirmation_code, notes, customer:customers(name, phone, email)")
    .eq("restaurant_id", restaurantId)
    .eq("reservation_date", date)
    .order("slot_time");

  if (error) throw new Error(error.message);
  return (data ?? []) as ReservationRow[];
}
