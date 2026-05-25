import type { Restaurant, ReservationWithDetails } from "@/lib/types";
import { formatDateShort } from "@/lib/utils/dates";

interface WhatsAppParams {
  restaurant: Restaurant;
  reservation: ReservationWithDetails;
}

function buildMessage(r: ReservationWithDetails, restaurant: Restaurant): string {
  const date = formatDateShort(r.date);
  const lines = [
    "🍽️ NUEVA RESERVA",
    "",
    `Fecha: ${date}`,
    `Hora: ${r.time}`,
    `Personas: ${r.party_size}`,
    "",
    `Cliente: ${r.customer.name}`,
    `Teléfono: ${r.customer.phone}`,
  ];
  if (r.notes) lines.push(`Notas: ${r.notes}`);
  lines.push("", `Código: ${r.confirmation_code}`);
  return lines.join("\n");
}

export async function sendWhatsAppToRestaurant({
  restaurant,
  reservation,
}: WhatsAppParams): Promise<void> {
  if (!restaurant.callmebot_api_key || !restaurant.callmebot_phone) {
    console.warn(
      `[whatsapp] callmebot not configured for restaurant "${restaurant.slug}" — skipping`
    );
    return;
  }

  const message = buildMessage(reservation, restaurant);
  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${restaurant.callmebot_phone}&text=${encoded}&apikey=${restaurant.callmebot_api_key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(
        `[whatsapp] CallMeBot returned ${res.status} for restaurant "${restaurant.slug}"`
      );
    }
  } catch (err) {
    console.error("[whatsapp] Fetch error:", err);
  }
}
