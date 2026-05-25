import { getRestaurantBySlug } from "@/lib/reservations/availability";
import { getReservationsByDate } from "@/lib/reservations/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SwRegister } from "@/components/admin/SwRegister";
import { notFound } from "next/navigation";
import { format } from "date-fns";

interface Props {
  params: Promise<{ restaurant_slug: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { restaurant_slug } = await params;
  const { date } = await searchParams;

  const restaurant = await getRestaurantBySlug(restaurant_slug);
  if (!restaurant) notFound();

  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = date ?? today;

  const reservations = await getReservationsByDate(restaurant.id, selectedDate);

  return (
    <>
      <SwRegister />
      <AdminDashboard
        date={selectedDate}
        reservations={reservations}
        restaurantName={restaurant.name}
        restaurantId={restaurant.id}
      />
    </>
  );
}
