export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-ui)" }}>
        Evimes Reserva — visita{" "}
        <span style={{ color: "var(--color-accent)" }}>
          /[restaurant_slug]/reservar
        </span>
      </p>
    </main>
  );
}
