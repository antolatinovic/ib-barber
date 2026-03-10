import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, first_name, service, cancelled_at, slots(date, time)")
    .eq("cancellation_token", token)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  if (booking.cancelled_at) {
    return NextResponse.json({ alreadyCancelled: true }, { status: 200 });
  }

  const slot = booking.slots as unknown as { date: string; time: string };
  const appointmentTime = parseISO(`${slot.date}T${slot.time}`);
  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();

  return NextResponse.json({
    firstName: booking.first_name,
    service: booking.service,
    date: slot.date,
    time: slot.time,
    canCancel: diffMs > 60 * 60 * 1000,
    isPast: diffMs < 0,
  });
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, slot_id, second_slot_id, first_name, email, service, cancelled_at, slots(date, time)")
    .eq("cancellation_token", token)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  if (booking.cancelled_at) {
    return NextResponse.json({ error: "Cette réservation a déjà été annulée" }, { status: 409 });
  }

  // Check 1h rule server-side
  const slot = booking.slots as unknown as { date: string; time: string };
  const appointmentTime = parseISO(`${slot.date}T${slot.time}`);
  const now = new Date();
  if (appointmentTime.getTime() - now.getTime() <= 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "L'annulation n'est plus possible moins d'1h avant le rendez-vous" },
      { status: 403 }
    );
  }

  // Free the slot(s)
  const { error: slotError } = await supabase
    .from("slots")
    .update({ is_booked: false })
    .eq("id", booking.slot_id);

  if (slotError) {
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  if (booking.second_slot_id) {
    await supabase
      .from("slots")
      .update({ is_booked: false })
      .eq("id", booking.second_slot_id);
  }

  // Soft-delete: mark as cancelled
  const { error: cancelError } = await supabase
    .from("bookings")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", booking.id);

  if (cancelError) {
    // Rollback: re-book the slot(s)
    await supabase.from("slots").update({ is_booked: true }).eq("id", booking.slot_id);
    if (booking.second_slot_id) {
      await supabase.from("slots").update({ is_booked: true }).eq("id", booking.second_slot_id);
    }
    return NextResponse.json({ error: cancelError.message }, { status: 500 });
  }

  // Fire-and-forget: send cancellation confirmation email
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
