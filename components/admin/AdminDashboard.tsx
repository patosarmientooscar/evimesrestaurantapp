"use client";

import { useRouter, usePathname } from "next/navigation";
import { format, addDays, subDays, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { ReservationRow } from "@/lib/reservations/admin";
import { PushToggle } from "./PushToggle";

interface Props {
  date: string;
  reservations: ReservationRow[];
  restaurantName: string;
  restaurantId: string;
}

export function AdminDashboard({ date, reservations, restaurantName, restaurantId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const current = parseISO(date);

  function goToDate(d: Date) {
    const iso = format(d, "yyyy-MM-dd");
    router.push(`${pathname}?date=${iso}`);
  }

  const lunch = reservations.filter((r) => r.service === "lunch");
  const dinner = reservations.filter((r) => r.service === "dinner");
  const totalCovers = reservations.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <div style={{ padding: "24px 16px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <p style={{ margin: 0, fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--color-muted)", fontFamily: "var(--font-ui)" }}>
          {restaurantName}
        </p>
        <PushToggle restaurantId={restaurantId} />
      </div>

      {/* Date navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <button onClick={() => goToDate(subDays(current, 1))} style={navBtn}>←</button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--color-muted)", fontFamily: "var(--font-ui)" }}>
            {isToday(current) ? "Hoy" : format(current, "EEEE", { locale: es })}
          </p>
          <p style={{ margin: 0, fontSize: "22px", fontFamily: "var(--font-serif)", color: "var(--color-text)", fontWeight: 400 }}>
            {format(current, "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <button onClick={() => goToDate(addDays(current, 1))} style={navBtn}>→</button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        <StatCard label="Total reservas" value={reservations.length} />
        <StatCard label="Total comensales" value={totalCovers} />
        <StatCard label="Comidas" value={lunch.length} />
        <StatCard label="Cenas" value={dinner.length} />
      </div>

      {reservations.length === 0 ? (
        <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "48px 0" }}>
          No hay reservas para este día
        </p>
      ) : (
        <>
          {lunch.length > 0 && <Section title="Comida" rows={lunch} />}
          {dinner.length > 0 && <Section title="Cena" rows={dinner} />}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      flex: 1,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "10px",
      padding: "16px",
      textAlign: "center",
    }}>
      <p style={{ margin: 0, fontSize: "28px", fontFamily: "var(--font-serif)", color: "var(--color-accent)" }}>{value}</p>
      <p style={{ margin: 0, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--color-muted)", fontFamily: "var(--font-ui)", marginTop: "4px" }}>{label}</p>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: ReservationRow[] }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p style={{ margin: "0 0 12px", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--color-muted)", fontFamily: "var(--font-ui)" }}>
        {title}
      </p>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: "10px", overflow: "hidden" }}>
        {rows.map((r, i) => (
          <div key={r.id} style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 80px 120px",
            gap: "16px",
            padding: "14px 20px",
            alignItems: "center",
            borderTop: i > 0 ? "1px solid var(--color-border)" : "none",
            background: "var(--color-bg)",
          }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "15px", color: "var(--color-accent)", fontWeight: 500 }}>{r.slot_time}</span>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--color-text)" }}>{r.customer?.name ?? "—"}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--color-muted)" }}>{r.customer?.phone ?? ""}</p>
            </div>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--color-muted)", textAlign: "center" }}>
              {r.party_size} {r.party_size === 1 ? "persona" : "personas"}
            </span>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "#22c55e",
    cancelled: "#ef4444",
    no_show: "#f59e0b",
  };
  const labels: Record<string, string> = {
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    no_show: "No presentado",
  };
  return (
    <span style={{
      fontFamily: "var(--font-ui)",
      fontSize: "11px",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: colors[status] ?? "var(--color-muted)",
      background: `${colors[status] ?? "var(--color-muted)"}22`,
      padding: "4px 8px",
      borderRadius: "6px",
      textAlign: "center",
    }}>
      {labels[status] ?? status}
    </span>
  );
}

const navBtn: React.CSSProperties = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
  padding: "8px 16px",
  cursor: "pointer",
  fontSize: "16px",
};
