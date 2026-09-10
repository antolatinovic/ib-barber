import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { SERVICES, type Service } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import ReminderEmail from "@/emails/reminder";

const TIMEZONE = "Europe/Paris";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = toZonedTime(new Date(), TIMEZONE);
  const today = format(now, "yyyy-MM-dd");

  // Fetch all bookings for today that are not cancelled and haven't received a reminder
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, slots!inner(date, time)")
    .is("cancelled_at", null)
    .eq("reminder_1h_sent", false)
    .eq("slots.date", today);

  if (error) {
    console.error("Cron: error fetching bookings", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ib-barber.vercel.app";
  let sentCount = 0;

  for (const booking of bookings) {
    const slot = booking.slots as { date: string; time: string } | null;
    if (!slot) continue;

    const serviceLabel = SERVICES[booking.service as Service]?.label || booking.service;
    const formatted = format(now, "EEEE d MMMM", { locale: fr });
    const formattedDate = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    const formattedTime = slot.time.slice(0, 5);
    const cancelUrl = `${appUrl}/book/cancel/${booking.cancellation_token}`;

    const { error: emailError } = await getResend().emails.send({
      from: process.env.FROM_EMAIL || "IB Barber <reservations@ib-barber.com>",
      to: booking.email,
      subject: `Rappel — Ton RDV aujourd'hui à ${formattedTime}`,
      react: ReminderEmail({
        firstName: booking.first_name,
        date: formattedDate,
        time: formattedTime,
        service: serviceLabel,
        cancelUrl,
      }),
    });

    if (!emailError) {
      await supabase
        .from("bookings")
        .update({ reminder_1h_sent: true })
        .eq("id", booking.id);
      sentCount++;
    } else {
      console.error(`Cron: failed to send reminder for booking ${booking.id}`, emailError);
    }
  }

  return NextResponse.json({ sent: sentCount });
}
