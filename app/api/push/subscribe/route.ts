import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const { restaurant_id, subscription } = body as {
    restaurant_id?: string;
    subscription?: { endpoint: string; keys: { p256dh: string; auth: string } };
  };

  if (!restaurant_id || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return Response.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      restaurant_id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[push/subscribe]", error);
    return Response.json({ error: "Error al guardar suscripción" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const { endpoint } = body as { endpoint?: string };
  if (!endpoint) {
    return Response.json({ error: "endpoint requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return Response.json({ ok: true });
}
