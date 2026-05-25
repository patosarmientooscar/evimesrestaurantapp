import { z } from "zod";

export const availabilityQuerySchema = z.object({
  restaurant: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  party: z.coerce.number().int().min(1).max(20),
});

export const createReservationSchema = z.object({
  restaurant_slug: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  slot_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:mm)"),
  party_size: z.number().int().min(1).max(20),
  customer_name: z.string().min(2).max(100),
  customer_phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+?[\d\s\-()]+$/, "Número de teléfono inválido"),
  customer_email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
