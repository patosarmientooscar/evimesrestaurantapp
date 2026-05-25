import type { Metadata } from "next";
import { getRestaurantBySlug } from "@/lib/reservations/availability";
import { notFound } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params: Promise<{ restaurant_slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurant_slug } = await params;
  const restaurant = await getRestaurantBySlug(restaurant_slug);
  if (!restaurant) return { title: "Restaurante no encontrado" };
  return {
    title: `Reservar en ${restaurant.name}`,
    description: `Reserva mesa en ${restaurant.name}. Rápido, sencillo y sin esperas.`,
  };
}

export default async function RestaurantLayout({ children, params }: Props) {
  const { restaurant_slug } = await params;
  const restaurant = await getRestaurantBySlug(restaurant_slug);
  if (!restaurant) notFound();

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      {/* Minimal top bar */}
      <header
        style={{
          padding: "24px 32px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginBottom: "2px",
              fontFamily: "var(--font-ui)",
            }}
          >
            Reservas
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "22px",
              fontWeight: 400,
              color: "var(--color-text)",
            }}
          >
            {restaurant.name}
          </h1>
        </div>
        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            style={{
              fontSize: "13px",
              color: "var(--color-muted)",
              textDecoration: "none",
              fontFamily: "var(--font-ui)",
              transition: "color 0.2s",
            }}
            onMouseEnter={undefined}
          >
            {restaurant.phone}
          </a>
        )}
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
