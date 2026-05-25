"use client";

import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  prefix?: string;
}

export function Input({
  label,
  error,
  hint,
  prefix,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        style={{
          fontSize: "11px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          fontFamily: "var(--font-ui)",
        }}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: "14px",
              color: "var(--color-muted)",
              fontSize: "14px",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            "w-full rounded-lg border bg-[var(--color-bg-elevated)] text-[var(--color-text)]",
            "px-4 py-3 text-base outline-none transition-all duration-200",
            "placeholder:text-[var(--color-muted)]",
            "focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] hover:border-[color-mix(in_srgb,var(--color-border)_60%,var(--color-accent)_40%)]",
            prefix && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-error)",
          }}
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-muted)",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
