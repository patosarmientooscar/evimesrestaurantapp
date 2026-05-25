import { getRestaurantBySlug } from "@/lib/reservations/availability";
import { notFound } from "next/navigation";
import { ReservationFlow } from "@/components/public/ReservationFlow";

interface Props {
  params: Promise<{ restaurant_slug: string }>;
}

export default async function ReservarPage({ params }: Props) {
  const { restaurant_slug } = await params;
  const restaurant = await getRestaurantBySlug(restaurant_slug);
  if (!restaurant) notFound();

  return (
    <section
      style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px 64px",
      }}
    >
      <ReservationFlow restaurant={restaurant} />
    </section>
  );
}
