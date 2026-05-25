"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ProgressIndicator } from "./ProgressIndicator";
import { DateStep } from "./DateStep";
import { PartySizeStep } from "./PartySizeStep";
import { SlotStep } from "./SlotStep";
import { DetailsStep } from "./DetailsStep";
import { Button } from "@/components/ui/Button";
import type { Restaurant } from "@/lib/types";

type Step = 0 | 1 | 2 | 3;

interface ReservationFlowProps {
  restaurant: Restaurant;
}

export function ReservationFlow({ restaurant }: ReservationFlowProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [partySize, setPartySize] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // GSAP step transition: old content exits left, new content enters from right
  const animateToStep = useCallback((nextStep: Step) => {
    const el = contentRef.current;
    if (!el) {
      setStep(nextStep);
      return;
    }
    const tl = gsap.timeline();
    tl.to(el, { opacity: 0, x: -24, duration: 0.25, ease: "power3.in" })
      .call(() => setStep(nextStep))
      .set(el, { x: 24 })
      .to(el, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" });
  }, []);

  const animateToPrevStep = useCallback((nextStep: Step) => {
    const el = contentRef.current;
    if (!el) {
      setStep(nextStep);
      return;
    }
    const tl = gsap.timeline();
    tl.to(el, { opacity: 0, x: 24, duration: 0.25, ease: "power3.in" })
      .call(() => setStep(nextStep))
      .set(el, { x: -24 })
      .to(el, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" });
  }, []);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null); // reset slot if date changes
    animateToStep(1);
  }

  function handlePartySizeSelect(size: number) {
    setPartySize(size);
    setSelectedSlot(null); // reset slot if party size changes
    animateToStep(2);
  }

  function handleSlotSelect(time: string) {
    setSelectedSlot(time);
    animateToStep(3);
  }

  async function handleConfirm(data: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) {
    if (!selectedDate || !partySize || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_slug: restaurant.slug,
          date: selectedDate,
          slot_time: selectedSlot,
          party_size: partySize,
          customer_name: data.name,
          customer_phone: data.phone,
          customer_email: data.email || undefined,
          notes: data.notes || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setSubmitError(json.error ?? "Error al crear la reserva. Inténtalo de nuevo.");
        return;
      }

      const { confirmation_code } = json.data as { confirmation_code: string };
      router.push(`/${restaurant.slug}/reservar/confirmacion/${confirmation_code}`);
    } catch {
      setSubmitError("Error de conexión. Por favor, inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    if (step > 0) animateToPrevStep((step - 1) as Step);
  }

  const canGoBack = step > 0 && !submitting;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "520px",
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      {/* Progress bar */}
      <div style={{ marginBottom: "48px" }}>
        <ProgressIndicator currentStep={step} />
      </div>

      {/* Step content */}
      <div ref={contentRef}>
        {step === 0 && (
          <DateStep
            restaurant={restaurant}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />
        )}
        {step === 1 && (
          <PartySizeStep
            restaurant={restaurant}
            selected={partySize}
            onSelect={handlePartySizeSelect}
          />
        )}
        {step === 2 && selectedDate && partySize && (
          <SlotStep
            restaurantSlug={restaurant.slug}
            date={selectedDate}
            partySize={partySize}
            selectedSlot={selectedSlot}
            onSelect={handleSlotSelect}
          />
        )}
        {step === 3 && selectedDate && partySize && selectedSlot && (
          <DetailsStep
            restaurant={restaurant}
            date={selectedDate}
            slotTime={selectedSlot}
            partySize={partySize}
            onConfirm={handleConfirm}
            submitting={submitting}
            submitError={submitError}
          />
        )}
      </div>

      {/* Back button */}
      {canGoBack && (
        <div style={{ marginTop: "32px" }}>
          <Button variant="ghost" size="sm" onClick={goBack}>
            ← Volver
          </Button>
        </div>
      )}
    </div>
  );
}
