"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isBefore,
  isToday,
  startOfToday,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { toISODate } from "@/lib/utils/dates";
import type { Restaurant } from "@/lib/types";

const WEEKDAY_HEADERS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

interface DateStepProps {
  restaurant: Restaurant;
  selectedDate: string | null;
  onSelect: (isoDate: string) => void;
}

export function DateStep({ restaurant, selectedDate, onSelect }: DateStepProps) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const today = startOfToday();
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Blank cells before the first day (Mon=0 … Sun=6 in our grid)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7; // convert Sun=0 to Mon=0
  const blanks = Array.from({ length: firstDayOfWeek });

  function isDayOpen(date: Date): boolean {
    const jsDay = getDay(date); // 0=Sun … 6=Sat
    return restaurant.open_days.includes(jsDay);
  }

  function isDayDisabled(date: Date): boolean {
    return isBefore(date, today) || !isDayOpen(date);
  }

  const selectedParsed = selectedDate ? new Date(selectedDate + "T00:00:00") : null;

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
        ¿Qué día vienes?
      </h2>
      <p style={{ color: "var(--color-muted)", fontSize: "14px", marginBottom: "32px" }}>
        Selecciona la fecha de tu reserva
      </p>

      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          aria-label="Mes anterior"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
        >
          ←
        </button>
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "15px",
            textTransform: "capitalize",
            color: "var(--color-text)",
            fontWeight: 500,
          }}
        >
          {format(viewDate, "MMMM yyyy", { locale: es })}
        </span>
        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          aria-label="Mes siguiente"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          marginBottom: "8px",
        }}
      >
        {WEEKDAY_HEADERS.map((h) => (
          <div
            key={h}
            style={{
              textAlign: "center",
              fontSize: "11px",
              letterSpacing: "1px",
              color: "var(--color-muted)",
              padding: "4px 0",
              fontFamily: "var(--font-ui)",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const disabled = isDayDisabled(day);
          const selected = selectedParsed ? isSameDay(day, selectedParsed) : false;
          const todayDay = isToday(day);

          return (
            <button
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => onSelect(toISODate(day))}
              aria-label={format(day, "d 'de' MMMM yyyy", { locale: es })}
              aria-pressed={selected}
              style={{
                aspectRatio: "1",
                borderRadius: "8px",
                border: selected
                  ? "1px solid var(--color-accent)"
                  : todayDay
                  ? "1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)"
                  : "1px solid transparent",
                background: selected
                  ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                  : "transparent",
                color: disabled
                  ? "var(--color-border)"
                  : selected
                  ? "var(--color-accent)"
                  : "var(--color-text)",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontFamily: "var(--font-ui)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                fontWeight: selected ? 600 : 400,
                boxShadow: selected ? "0 0 12px color-mix(in srgb, var(--color-accent) 30%, transparent)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.background = "var(--color-bg-elevated)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
