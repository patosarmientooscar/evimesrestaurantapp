"use client";

import type { Restaurant } from "@/lib/types";

interface PartySizeStepProps {
  restaurant: Restaurant;
  selected: number | null;
  onSelect: (size: number) => void;
}

export function PartySizeStep({ restaurant, selected, onSelect }: PartySizeStepProps) {
  const maxVisible = Math.min(restaurant.max_party_size, 10);
  const sizes = Array.from({ length: maxVisible }, (_, i) => i + 1);

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
        ¿Cuántos seréis?
      </h2>
      <p style={{ color: "var(--color-muted)", fontSize: "14px", marginBottom: "32px" }}>
        Incluye a todos los comensales
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
        }}
      >
        {sizes.map((n) => {
          const isSelected = selected === n;
          return (
            <button
              key={n}
              onClick={() => onSelect(n)}
              aria-pressed={isSelected}
              aria-label={`${n} persona${n > 1 ? "s" : ""}`}
              style={{
                aspectRatio: "1",
                borderRadius: "12px",
                border: isSelected
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border)",
                background: isSelected
                  ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                  : "var(--color-bg-elevated)",
                color: isSelected ? "var(--color-accent)" : "var(--color-text)",
                fontSize: "20px",
                fontWeight: isSelected ? 600 : 400,
                fontFamily: "var(--font-ui)",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isSelected
                  ? "0 0 16px color-mix(in srgb, var(--color-accent) 25%, transparent)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-accent) 50%, var(--color-border) 50%)";
                  e.currentTarget.style.color = "var(--color-accent)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.color = "var(--color-text)";
                }
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Large group message */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-elevated)",
        }}
      >
        <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted)" }}>
          Para grupos de más de {restaurant.max_party_size} personas, contáctanos directamente:{" "}
          <a
            href={`tel:${restaurant.phone}`}
            style={{ color: "var(--color-accent)", textDecoration: "none" }}
          >
            {restaurant.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
