import { Resend } from "resend";
import type { Restaurant, ReservationWithDetails } from "@/lib/types";
import { formatDateDisplay } from "@/lib/utils/dates";
import { formatPhone } from "@/lib/utils/format";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — emails will be skipped");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface EmailParams {
  to: string | null;
  restaurant: Restaurant;
  reservation: ReservationWithDetails;
}

function buildSubject(restaurant: Restaurant, reservation: ReservationWithDetails): string {
  const date = formatDateDisplay(reservation.date);
  return `Reserva confirmada – ${restaurant.name} · ${date} ${reservation.time} · ${reservation.party_size} persona${reservation.party_size > 1 ? "s" : ""}`;
}

function clientEmailHtml(restaurant: Restaurant, r: ReservationWithDetails): string {
  const date = formatDateDisplay(r.date);
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Reserva confirmada</title>
</head>
<body style="margin:0;padding:0;background:#080b14;font-family:'Inter',Helvetica,Arial,sans-serif;color:#e8eaf0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#0d1120;border-radius:16px;border:1px solid #1e2a40;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 32px;border-bottom:1px solid #1e2a40;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#5a6480;">RESERVA CONFIRMADA</p>
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#ffffff;">${restaurant.name}</h1>
            </td>
          </tr>
          <!-- Ticket body -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">FECHA</p>
                    <p style="margin:0;font-size:18px;color:#ffffff;">${date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">HORA</p>
                    <p style="margin:0;font-size:18px;color:#ffffff;">${r.time}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">PERSONAS</p>
                    <p style="margin:0;font-size:18px;color:#ffffff;">${r.party_size}</p>
                  </td>
                </tr>
                ${r.notes ? `<tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">NOTAS</p>
                    <p style="margin:0;font-size:16px;color:#e8eaf0;">${r.notes}</p>
                  </td>
                </tr>` : ""}
                <!-- Confirmation code -->
                <tr>
                  <td style="padding-top:24px;border-top:1px dashed #1e2a40;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">CÓDIGO DE RESERVA</p>
                    <p style="margin:0;font-size:28px;font-weight:600;letter-spacing:6px;color:#00e5ff;">${r.confirmation_code}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#080b14;border-top:1px solid #1e2a40;">
              <p style="margin:0;font-size:13px;color:#5a6480;">
                Para modificar o cancelar tu reserva, contáctanos en
                <a href="tel:${restaurant.phone}" style="color:#00e5ff;text-decoration:none;"> ${formatPhone(restaurant.phone)}</a>
              </p>
              ${restaurant.address ? `<p style="margin:8px 0 0;font-size:13px;color:#5a6480;">${restaurant.address}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function restaurantEmailHtml(r: ReservationWithDetails): string {
  const date = formatDateDisplay(r.date);
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><title>Nueva reserva</title></head>
<body style="margin:0;padding:0;background:#080b14;font-family:'Inter',Helvetica,Arial,sans-serif;color:#e8eaf0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#0d1120;border-radius:16px;border:1px solid #1e2a40;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #1e2a40;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#00e5ff;">NUEVA RESERVA</p>
              <h1 style="margin:0;font-size:24px;font-weight:400;color:#ffffff;">${date} a las ${r.time}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">CLIENTE</p>
                    <p style="margin:0;font-size:16px;color:#ffffff;">${r.customer.name}</p>
                  </td>
                  <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">PERSONAS</p>
                    <p style="margin:0;font-size:16px;color:#ffffff;">${r.party_size}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">TELÉFONO</p>
                    <p style="margin:0;font-size:16px;color:#ffffff;">${r.customer.phone}</p>
                  </td>
                  <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">CÓDIGO</p>
                    <p style="margin:0;font-size:16px;letter-spacing:3px;color:#00e5ff;">${r.confirmation_code}</p>
                  </td>
                </tr>
                ${r.notes ? `<tr>
                  <td colspan="2" style="padding-top:16px;border-top:1px solid #1e2a40;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a6480;">NOTAS</p>
                    <p style="margin:0;font-size:15px;color:#e8eaf0;">${r.notes}</p>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendReservationEmail({
  to,
  restaurant,
  reservation,
}: EmailParams): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.RESEND_FROM_EMAIL ?? "reservas@evimes.com";
  const subject = buildSubject(restaurant, reservation);

  const emails: Promise<unknown>[] = [];

  // Email to client (if they provided email)
  if (to) {
    emails.push(
      resend.emails.send({
        from,
        to,
        subject,
        html: clientEmailHtml(restaurant, reservation),
      })
    );
  }

  // Email to restaurant
  if (restaurant.email) {
    emails.push(
      resend.emails.send({
        from,
        to: restaurant.email,
        subject: `Nueva reserva – ${formatDateDisplay(reservation.date)} ${reservation.time} · ${reservation.party_size} pax`,
        html: restaurantEmailHtml(reservation),
      })
    );
  }

  const results = await Promise.allSettled(emails);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[email] Failed to send email #${i}:`, r.reason);
    }
  });
}
