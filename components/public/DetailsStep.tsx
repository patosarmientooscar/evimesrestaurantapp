"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDateDisplay } from "@/lib/utils/dates";
import type { Restaurant } from "@/lib/types";

interface DetailsStepProps {
  restaurant: Restaurant;
  date: string;
  slotTime: string;
  partySize: number;
  onConfirm: (data: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) => void;
  submitting: boolean;
  submitError: string | null;
}

export function DetailsStep({
  restaurant,
  date,
  slotTime,
  partySize,
  onConfirm,
  submitting,
  submitError,
}: DetailsStepProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "El nombre es obligatorio";
    if (phone.trim().length < 8) next.phone = "El teléfono es obligatorio";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Email inválido";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onConfirm({ name: name.trim(), phone: phone.trim(), email: email.trim(), notes: notes.trim() });
  }

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
        Tus datos
      </h2>
      <p style={{ color: "var(--color-muted)", fontSize: "14px", marginBottom: "32px" }}>
        Confirmaremos la reserva por email y/o WhatsApp
      </p>

      {/* Reservation summary */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-elevated)",
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "8px",
          }}
        >
          {restaurant.name}
        </p>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px", color: "var(--color-text)" }}>
            📅 {formatDateDisplay(date)}
          </span>
          <span style={{ fontSize: "15px", color: "var(--color-accent)", fontWeight: 600 }}>
            🕐 {slotTime}
          </span>
          <span style={{ fontSize: "15px", color: "var(--color-text)" }}>
            👥 {partySize} persona{partySize > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Input
          label="Nombre completo"
          type="text"
          autoComplete="name"
          placeholder="Juan García"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          placeholder="+34 600 000 000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          hint="Con prefijo de país para recibir confirmación por WhatsApp"
          required
        />

        <Input
          label="Email (opcional)"
          type="email"
          autoComplete="email"
          placeholder="juan@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="notes"
            style={{
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            placeholder="Cumpleaños, alergias, peticiones especiales…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            style={{
              width: "100%",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-elevated)",
              color: "var(--color-text)",
              padding: "12px 16px",
              fontSize: "15px",
              fontFamily: "var(--font-ui)",
              outline: "none",
              resize: "vertical",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
        </div>

        {submitError && (
          <p
            role="alert"
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              background: "color-mix(in srgb, var(--color-error) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-error) 40%, transparent)",
              color: "var(--color-error)",
              fontSize: "14px",
            }}
          >
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" loading={submitting}>
          Confirmar reserva
        </Button>
      </form>
    </div>
  );
}
