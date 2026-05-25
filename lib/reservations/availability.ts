import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AvailableSlot,
  AvailabilityResponse,
  Restaurant,
  ServiceType,
} from "@/lib/types";

interface AvailabilityParams {
  restaurantId: string;
  date: string; // YYYY-MM-DD
  partySize: number;
}

export async function getAvailableSlots({
  restaurantId,
  date,
  partySize,
}: AvailabilityParams): Promise<AvailabilityResponse> {
  const supabase = createAdminClient();

  // 1. Fetch active time slots for this restaurant
  const { data: slots, error: slotsError } = await supabase
    .from("time_slots")
    .select("id, time, service, capacity")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("time");

  // Normalise: time_slots uses "time", reservations uses "slot_time"

  if (slotsError) throw new Error(slotsError.message);
  if (!slots || slots.length === 0) return { lunch: [], dinner: [] };

  // 2. Fetch sum of party_sizes for confirmed reservations on this date
  const { data: reservations, error: resError } = await supabase
    .from("reservations")
    .select("slot_time, party_size")
    .eq("restaurant_id", restaurantId)
    .eq("reservation_date", date);

  if (resError) throw new Error(resError.message);

  // Build a map: time → total reserved covers
  const reserved: Record<string, number> = {};
  for (const r of reservations ?? []) {
    reserved[r.slot_time] = (reserved[r.slot_time] ?? 0) + r.party_size;
  }

  const result: AvailabilityResponse = { lunch: [], dinner: [] };

  for (const slot of slots) {
    const usedCapacity = reserved[slot.time] ?? 0;
    const available = slot.capacity - usedCapacity;

    if (available >= partySize) {
      const service = slot.service as ServiceType;
      const availableSlot: AvailableSlot = {
        time: slot.time,
        service,
        available_capacity: available,
      };
      result[service].push(availableSlot);
    }
  }

  return result;
}

export async function isSlotAvailable({
  restaurantId,
  date,
  time,
  partySize,
}: {
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
}): Promise<boolean> {
  const supabase = createAdminClient();

  // Get slot capacity
  const { data: slot } = await supabase
    .from("time_slots")
    .select("capacity")
    .eq("restaurant_id", restaurantId)
    .eq("time", time)
    .eq("is_active", true)
    .single();

  if (!slot) return false;

  // Sum confirmed reservations at this time
  const { data: agg } = await supabase
    .from("reservations")
    .select("party_size")
    .eq("restaurant_id", restaurantId)
    .eq("reservation_date", date)
    .eq("slot_time", time);

  const used = (agg ?? []).reduce((sum, r) => sum + r.party_size, 0);
  return slot.capacity - used >= partySize;
}

export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Restaurant | null;
}
