import { NextRequest } from "next/server";
import { createReservationSchema } from "@/lib/reservations/validation";
import {
  getRestaurantBySlug,
  isSlotAvailable,
} from "@/lib/reservations/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReservationEmail } from "@/lib/notifications/email";
import { sendWhatsAppToRestaurant } from "@/lib/notifications/whatsapp";
import { sendPushToRestaurant } from "@/lib/notifications/push";
import type { Reservation, Customer, ReservationWithDetails } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { data: null, error: "Body inválido" },
      { status: 400 }
    );
  }

  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    restaurant_slug,
    date,
    slot_time,
    party_size,
    customer_name,
    customer_phone,
    customer_email,
    notes,
  } = parsed.data;

  // Fetch restaurant
  const restaurant = await getRestaurantBySlug(restaurant_slug);
  if (!restaurant) {
    return Response.json(
      { data: null, error: "Restaurante no encontrado" },
      { status: 404 }
    );
  }

  // Verify slot is still available (anti race-condition check)
  const available = await isSlotAvailable({
    restaurantId: restaurant.id,
    date,
    time: slot_time,
    partySize: party_size,
  });

  if (!available) {
    return Response.json(
      {
        data: null,
        error:
          "Lo sentimos, este horario ya no está disponible. Por favor elige otro.",
      },
      { status: 409 }
    );
  }

  const supabase = createAdminClient();

  // Upsert customer by phone
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        restaurant_id: restaurant.id,
        phone: customer_phone,
        name: customer_name,
        email: customer_email || null,
      },
      { onConflict: "phone" }
    )
    .select()
    .single();

  if (customerError || !customer) {
    console.error("[create] Customer upsert error:", customerError);
    return Response.json(
      { data: null, error: "Error al registrar el cliente" },
      { status: 500 }
    );
  }

  // Determine service type from time
  const hour = parseInt(slot_time.split(":")[0], 10);
  const service = hour < 17 ? "lunch" : "dinner";

  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurant.id,
      customer_id: customer.id,
      reservation_date: date,
      slot_time,
      party_size,
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      notes: notes || null,
      service,
    })
    .select()
    .single();

  if (resError || !reservation) {
    console.error("[create] Reservation error:", resError);
    return Response.json(
      { data: null, error: "Error al crear la reserva" },
      { status: 500 }
    );
  }

  const fullReservation: ReservationWithDetails = {
    ...(reservation as Reservation),
    customer: customer as Customer,
    restaurant,
  };

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${restaurant_slug}/admin?date=${date}`;

  // Fire notifications in parallel without blocking the response
  Promise.all([
    sendReservationEmail({
      to: customer.email,
      restaurant,
      reservation: fullReservation,
    }),
    sendWhatsAppToRestaurant({ restaurant, reservation: fullReservation }),
    sendPushToRestaurant(restaurant.id, {
      title: `Nueva reserva — ${restaurant.name}`,
      body: `${customer_name} · ${party_size} persona${party_size > 1 ? "s" : ""} · ${slot_time}`,
      url: adminUrl,
    }),
  ]).catch((err) => {
    console.error("[create] Notification error:", err);
  });

  return Response.json(
    { data: { confirmation_code: reservation.confirmation_code }, error: null },
    { status: 201 }
  );
}
