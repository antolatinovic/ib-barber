import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Check admin auth
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await request.json();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId manquant" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  const { data: booking, error: fetchError } = await serviceClient
    .from("bookings")
    .select("id, slot_id, first_name, email, service, cancelled_at, slots(date, time)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  if (booking.cancelled_at) {
    return NextResponse.json({ error: "Déjà annulée" }, { status: 409 });
  }

  // Free the slot
  const { error: slotError } = await serviceClient
    .from("slots")
    .update({ is_booked: false })
    .eq("id", booking.slot_id);

  if (slotError) {
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  // Soft-delete: mark as cancelled
  const { error: cancelError } = await serviceClient
    .from("bookings")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", booking.id);

  if (cancelError) {
    // Rollback: re-book the slot
    await serviceClient.from("slots").update({ is_booked: true }).eq("id", booking.slot_id);
    return NextResponse.json({ error: cancelError.message }, { status: 500 });
  }

  // Send cancellation email to client
  const slot = booking.slots as unknown as { date: string; time: string };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  fetch(`${baseUrl}/api/send-cancellation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: booking.email,
      firstName: booking.first_name,
      date: slot.date,
      time: slot.time,
      service: booking.service,
    }),
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
