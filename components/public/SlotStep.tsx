"use client";

import { useEffect, useState } from "react";
import type { AvailableSlot } from "@/lib/types";
import { formatDateDisplay } from "@/lib/utils/dates";

interface SlotStepProps {
  restaurantSlug: string;
  date: string;
  partySize: number;
  selectedSlot: string | null;
  onSelect: (time: string) => void;
}

interface SlotsData {
  lunch: AvailableSlot[];
  dinner: AvailableSlot[];
  closed?: boolean;
}

export function SlotStep({
  restaurantSlug,
  date,
  partySize,
  selectedSlot,
  onSelect,
}: SlotStepProps) {
  const [slots, setSlots] = useState<SlotsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `/api/reservations/availability?restaurant=${encodeURIComponent(restaurantSlug)}&date=${date}&party=${partySize}`
    )
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Error desconocido");
        setSlots(json.data as SlotsData);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantSlug, date, partySize]);

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(24px, 5vw, 32px)",
          fontWeight: 300,
          color: "var(--color-text)",
          marginBottom: "8px",
        }}
      >
        Elige tu hora
      </h2>
      <p style={{ color: "var(--color-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {formatDateDisplay(date)} · {partySize} persona{partySize > 1 ? "s" : ""}
      </p>

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "var(--color-muted)",
            fontSize: "14px",
          }}
        >
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Comprobando disponibilidad…
        </div>
      )}

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "14px" }}>{error}</p>
      )}

      {slots?.closed && (
        <p style={{ color: "var(--color-muted)", fontSize: "14px" }}>
          El restaurante está cerrado este día. Por favor elige otra fecha.
        </p>
      )}

      {slots && !slots.closed && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {(["lunch", "dinner"] as const).map((service) => {
            const serviceSlots = slots[service];
            if (serviceSlots.length === 0) return null;

            return (
              <div key={service}>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    marginBottom: "12px",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {service === "lunch" ? "Comida" : "Cena"}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {serviceSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        onClick={() => onSelect(slot.time)}
                        aria-pressed={isSelected}
                        style={{
                          padding: "12px 20px",
                          borderRadius: "10px",
                          border: isSelected
                            ? "1px solid var(--color-accent)"
                            : "1px solid var(--color-border)",
                          background: isSelected
                            ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                            : "var(--color-bg-elevated)",
                          color: isSelected ? "var(--color-accent)" : "var(--color-text)",
                          fontSize: "16px",
                          fontWeight: isSelected ? 600 : 400,
                          fontFamily: "var(--font-ui)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          boxShadow: isSelected
                            ? "0 0 16px color-mix(in srgb, var(--color-accent) 30%, transparent)"
                            : "none",
                          letterSpacing: "1px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "var(--color-accent)";
                            e.currentTarget.style.boxShadow =
                              "0 0 12px color-mix(in srgb, var(--color-accent) 15%, transparent)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "var(--color-border)";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {slots.lunch.length === 0 && slots.dinner.length === 0 && (
            <p style={{ color: "var(--color-muted)", fontSize: "14px" }}>
              No hay disponibilidad para {partySize} personas en esta fecha.
              Prueba con otro día o llámanos:
            </p>
          )}
        </div>
      )}
    </div>
  );
}
