"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const STEPS = ["Fecha", "Personas", "Hora", "Datos"] as const;

interface ProgressIndicatorProps {
  currentStep: number; // 0-indexed
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;
    const pct = (currentStep / (STEPS.length - 1)) * 100;
    gsap.to(lineRef.current, {
      width: `${pct}%`,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [currentStep]);

  return (
    <div className="w-full" aria-label="Progreso de reserva">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {STEPS.map((label, i) => (
          <span
            key={label}
            style={{
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "var(--font-ui)",
              color:
                i <= currentStep
                  ? "var(--color-accent)"
                  : "var(--color-muted)",
              transition: "color 0.3s",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          height: "2px",
          background: "var(--color-border)",
          borderRadius: "1px",
          overflow: "visible",
        }}
      >
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "var(--color-accent)",
            borderRadius: "1px",
            width: "0%",
            boxShadow: "0 0 8px var(--color-accent)",
          }}
        />
        {/* Step dots */}
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: `${(i / (STEPS.length - 1)) * 100}%`,
              transform: "translate(-50%, -50%)",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background:
                i <= currentStep
                  ? "var(--color-accent)"
                  : "var(--color-border)",
              boxShadow:
                i === currentStep
                  ? "0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent)"
                  : "none",
              transition: "background 0.3s, box-shadow 0.3s",
              zIndex: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
