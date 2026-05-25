import { NextRequest } from "next/server";
import { availabilityQuerySchema } from "@/lib/reservations/validation";
import {
  getAvailableSlots,
  getRestaurantBySlug,
} from "@/lib/reservations/availability";
import { isValidISODate } from "@/lib/utils/dates";
import { parseISO, isBefore, startOfToday } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = availabilityQuerySchema.safeParse({
    restaurant: searchParams.get("restaurant"),
    date: searchParams.get("date"),
    party: searchParams.get("party"),
  });

  if (!parsed.success) {
    return Response.json(
      { data: null, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { restaurant: slug, date, party } = parsed.data;

  // Validate date is not in the past
  if (!isValidISODate(date)) {
    return Response.json(
      { data: null, error: "Fecha inválida" },
      { status: 400 }
    );
  }
  if (isBefore(parseISO(date), startOfToday())) {
    return Response.json(
      { data: null, error: "No puedes reservar en el pasado" },
      { status: 400 }
    );
  }

  // Fetch restaurant
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return Response.json(
      { data: null, error: "Restaurante no encontrado" },
      { status: 404 }
    );
  }

  // Check if day is open (open_days are 0=Sun … 6=Sat)
  const dayOfWeek = parseISO(date).getDay();
  if (!restaurant.open_days.includes(dayOfWeek)) {
    return Response.json(
      { data: { lunch: [], dinner: [], closed: true }, error: null },
      { status: 200 }
    );
  }

  try {
    const slots = await getAvailableSlots({
      restaurantId: restaurant.id,
      date,
      partySize: party,
    });

    return Response.json({ data: slots, error: null });
  } catch (err) {
    console.error("[availability] Error:", err);
    return Response.json(
      { data: null, error: "Error al obtener disponibilidad" },
      { status: 500 }
    );
  }
}
