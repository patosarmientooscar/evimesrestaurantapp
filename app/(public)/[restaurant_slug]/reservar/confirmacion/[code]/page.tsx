import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateDisplay } from "@/lib/utils/dates";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Reservation, Customer, Restaurant } from "@/lib/types";

interface Props {
  params: Promise<{ restaurant_slug: string; code: string }>;
}

// Generates an inline ICS file as a data URI
function buildIcsDataUri(
  restaurant: Restaurant,
  reservation: Reservation
): string {
  const d = (reservation as unknown as Record<string, unknown>).reservation_date as string ?? reservation.date;
  const t = (reservation as unknown as Record<string, unknown>).slot_time as string ?? reservation.time;
  const [year, month, day] = String(d).split("-").map(Number);
  const [hour, minute] = String(t).split(":").map(Number);

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
  // Assume 1.5h duration
  const endHour = hour + 1;
  const endMin = minute + 30;
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(endHour)}${pad(endMin)}00`;
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+/, "");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Evimes Reserva//ES",
    "BEGIN:VEVENT",
    `UID:${reservation.confirmation_code}@evimes.reserva`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Reserva en ${restaurant.name}`,
    `DESCRIPTION:${reservation.party_size} persona${reservation.party_size > 1 ? "s" : ""} · Código: ${reservation.confirmation_code}`,
    restaurant.address ? `LOCATION:${restaurant.address}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

// WhatsApp pre-filled message for modification
function buildWaLink(restaurant: Restaurant, reservation: Reservation): string {
  const msg = `Hola, quiero modificar mi reserva.\nCódigo: ${reservation.confirmation_code}\nFecha: ${reservation.date} ${reservation.time}`;
  const phone = restaurant.callmebot_phone?.replace(/\D/g, "") ?? "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default async function ConfirmacionPage({ params }: Props) {
  const { code } = await params;

  const supabase = createAdminClient();

  const { data: rawReservation } = await supabase
    .from("reservations")
    .select("*, customers(*), restaurants(*)")
    .eq("confirmation_code", code.toUpperCase())
    .single();

  if (!rawReservation) notFound();

  const reservation = rawReservation as Reservation & {
    customers: Customer;
    restaurants: Restaurant;
  };

  const customer = reservation.customers;
  const restaurant = reservation.restaurants;

  const dateStr = (reservation as unknown as Record<string, unknown>).reservation_date as string ?? reservation.date;
  const timeStr = (reservation as unknown as Record<string, unknown>).slot_time as string ?? reservation.time;

  const dateLabel = formatDateDisplay(dateStr);
  const dayName = format(parseISO(String(dateStr)), "EEEE", { locale: es });
  const icsUri = buildIcsDataUri(restaurant, reservation);
  const waLink = buildWaLink(restaurant, reservation);

  return (
    <section
      style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px 64px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Success header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--color-success) 15%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-success) 40%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(26px, 6vw, 36px)",
              fontWeight: 300,
              color: "var(--color-text)",
              margin: "0 0 8px",
            }}
          >
            ¡Reserva confirmada!
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "14px", margin: 0 }}>
            Te hemos enviado un email con los detalles.
          </p>
        </div>

        {/* Ticket */}
        <div
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "32px",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 30%, transparent))",
            }}
          />

          <div style={{ padding: "32px" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "20px",
                fontFamily: "var(--font-ui)",
              }}
            >
              {restaurant.name}
            </p>

            {/* Main details grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    margin: "0 0 4px",
                  }}
                >
                  Día
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "var(--color-text)",
                    textTransform: "capitalize",
                  }}
                >
                  {dayName}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--color-muted)" }}>
                  {dateLabel}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    margin: "0 0 4px",
                  }}
                >
                  Hora
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "var(--color-accent)",
                    letterSpacing: "1px",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {timeStr}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    margin: "0 0 4px",
                  }}
                >
                  Personas
                </p>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--color-text)" }}>
                  {reservation.party_size}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    margin: "0 0 4px",
                  }}
                >
                  A nombre de
                </p>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--color-text)" }}>
                  {customer.name}
                </p>
              </div>
            </div>

            {reservation.notes && (
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--color-bg-elevated)",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    margin: "0 0 4px",
                  }}
                >
                  Notas
                </p>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--color-text)" }}>
                  {reservation.notes}
                </p>
              </div>
            )}

            {/* Dashed divider */}
            <div
              style={{
                borderTop: "1px dashed var(--color-border)",
                marginBottom: "24px",
              }}
            />

            {/* Confirmation code */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  margin: "0 0 8px",
                }}
              >
                Código de confirmación
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                  letterSpacing: "8px",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-ui)",
                  textShadow: "0 0 24px color-mix(in srgb, var(--color-accent) 40%, transparent)",
                }}
              >
                {reservation.confirmation_code}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <a
            href={icsUri}
            download={`reserva-${reservation.confirmation_code}.ics`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 24px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-elevated)",
              color: "var(--color-text)",
              textDecoration: "none",
              fontSize: "15px",
              fontFamily: "var(--font-ui)",
              transition: "border-color 0.2s, color 0.2s",
            }}
          >
            <span>📅</span>
            Añadir al calendario
          </a>

          {restaurant.callmebot_phone && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 24px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-elevated)",
                color: "var(--color-muted)",
                textDecoration: "none",
                fontSize: "15px",
                fontFamily: "var(--font-ui)",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              <span>💬</span>
              Modificar reserva
            </a>
          )}
        </div>

        {restaurant.address && (
          <p
            style={{
              textAlign: "center",
              marginTop: "32px",
              fontSize: "13px",
              color: "var(--color-muted)",
            }}
          >
            📍 {restaurant.address}
          </p>
        )}
      </div>
    </section>
  );
}
