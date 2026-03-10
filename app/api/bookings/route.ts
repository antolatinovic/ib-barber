import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { addDays, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = request.nextUrl.searchParams.get("weekStart");
  if (!weekStart) {
    return NextResponse.json({ error: "weekStart is required" }, { status: 400 });
  }

  const endDate = addDays(parseISO(weekStart), 6).toISOString().split("T")[0];

  const serviceClient = createServiceClient();

  // Fetch slots for the week
  const { data: weekSlots, error: slotsError } = await serviceClient
    .from("slots")
    .select("id, date, time")
    .gte("date", weekStart)
    .lte("date", endDate);

  if (slotsError) {
    return NextResponse.json({ error: slotsError.message }, { status: 500 });
  }

  if (!weekSlots || weekSlots.length === 0) {
    return NextResponse.json([]);
  }

  const slotIds = weekSlots.map((s) => s.id);
  const slotMap = new Map(weekSlots.map((s) => [s.id, { date: s.date, time: s.time }]));

  // Fetch bookings for those slots
  const { data: bookings, error: bookingsError } = await serviceClient
    .from("bookings")
    .select("*")
    .in("slot_id", slotIds);

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  // Join and filter in application code
  const data = (bookings ?? [])
    .filter((b) => !b.cancelled_at)
    .map((b) => ({
      ...b,
      slots: slotMap.get(b.slot_id),
    }));

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const {
    slotId, firstName, lastName, snap, email, service,
    secondSlotId, guestFirstName, guestLastName, guestEmail, guestService,
  } = await request.json();

  // Validate required fields
  if (!slotId || !firstName || !lastName || !snap || !email || !service) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (firstName.length > 50 || lastName.length > 50 || snap.length > 50) {
    return NextResponse.json({ error: "Les champs ne doivent pas dépasser 50 caractères" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  if (service !== "coupe" && service !== "coupe_barbe") {
    return NextResponse.json({ error: "Service invalide" }, { status: 400 });
  }

  // Validate guest fields if +1
  const hasGuest = !!secondSlotId;
  if (hasGuest) {
    if (!guestFirstName || !guestLastName || !guestEmail || !guestService) {
      return NextResponse.json({ error: "Champs de l'invité manquants" }, { status: 400 });
    }
    if (guestFirstName.length > 50 || guestLastName.length > 50) {
      return NextResponse.json({ error: "Les champs ne doivent pas dépasser 50 caractères" }, { status: 400 });
    }
    if (!emailRegex.test(guestEmail) || guestEmail.length > 254) {
      return NextResponse.json({ error: "Email de l'invité invalide" }, { status: 400 });
    }
    if (guestService !== "coupe" && guestService !== "coupe_barbe") {
      return NextResponse.json({ error: "Service de l'invité invalide" }, { status: 400 });
    }
  }

  const supabase = createServiceClient();

  // Book first slot
  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .update({ is_booked: true })
    .eq("id", slotId)
    .eq("is_booked", false)
    .select()
    .single();

  if (slotError || !slot) {
    return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
  }

  // Book second slot if +1
  if (hasGuest) {
    const { data: secondSlot, error: secondSlotError } = await supabase
      .from("slots")
      .update({ is_booked: true })
      .eq("id", secondSlotId)
      .eq("is_booked", false)
      .select()
      .single();

    if (secondSlotError || !secondSlot) {
      // Rollback first slot
      await supabase.from("slots").update({ is_booked: false }).eq("id", slotId);
      return NextResponse.json({ error: "Le créneau suivant n'est plus disponible" }, { status: 409 });
    }
  }

  const cancellationToken = crypto.randomUUID();

  const bookingData: Record<string, unknown> = {
    slot_id: slotId,
    first_name: firstName,
    last_name: lastName,
    snap,
    email,
    service,
    cancellation_token: cancellationToken,
  };

  if (hasGuest) {
    bookingData.second_slot_id = secondSlotId;
    bookingData.guest_first_name = guestFirstName;
    bookingData.guest_last_name = guestLastName;
    bookingData.guest_email = guestEmail;
    bookingData.guest_service = guestService;
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert(bookingData)
    .select()
    .single();

  if (bookingError) {
    // Rollback: unbook the slot(s)
    await supabase.from("slots").update({ is_booked: false }).eq("id", slotId);
    if (hasGuest) {
      await supabase.from("slots").update({ is_booked: false }).eq("id", secondSlotId);
    }
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, slot, cancellationToken: booking.cancellation_token });
}
