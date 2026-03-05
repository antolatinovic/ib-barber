import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { SERVICES, type Service } from "@/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import ReminderEmail from "@/emails/reminder";

const TIMEZONE = "Europe/Paris";

function getAppointmentDate(date: string, time: string): Date {
  // time can be "HH:MM" or "HH:MM:SS"
  const t = time.length === 5 ? time : time.slice(0, 5);
  return new Date(`${date}T${t}:00+01:00`);
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = toZonedTime(new Date(), TIMEZONE);

  // Fetch all upcoming non-cancelled bookings that still need reminders
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, slots(date, time)")
    .is("cancelled_at", null)
    .or("reminder_24h_sent.eq.false,reminder_1h_sent.eq.false");

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

    const appointmentDate = getAppointmentDate(slot.date, slot.time);
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Skip past appointments
    if (diffHours < 0) continue;

    const serviceLabel = SERVICES[booking.service as Service]?.label || booking.service;
    const formatted = format(parseISO(slot.date), "EEEE d MMMM", { locale: fr });
    const formattedDate = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    const formattedTime = slot.time.slice(0, 5);
    const cancelUrl = `${appUrl}/book/cancel/${booking.cancellation_token}`;

    // 24h reminder: send if appointment is in 23h–24h30
    if (!booking.reminder_24h_sent && diffHours >= 23 && diffHours <= 24.5) {
      const { error: emailError } = await resend.emails.send({
        from: process.env.FROM_EMAIL || "IB Barber <reservations@ib-barber.com>",
        to: booking.email,
        subject: `Rappel — Ton RDV demain à ${formattedTime}`,
        react: ReminderEmail({
          firstName: booking.first_name,
          date: formattedDate,
          time: formattedTime,
          service: serviceLabel,
          cancelUrl,
          isOneHour: false,
        }),
      });

      if (!emailError) {
        await supabase
          .from("bookings")
          .update({ reminder_24h_sent: true })
          .eq("id", booking.id);
        sentCount++;
      } else {
        console.error(`Cron: failed to send 24h reminder for booking ${booking.id}`, emailError);
      }
    }

    // 1h reminder: send if appointment is in 45min–1h30
    if (!booking.reminder_1h_sent && diffHours >= 0.75 && diffHours <= 1.5) {
      const { error: emailError } = await resend.emails.send({
        from: process.env.FROM_EMAIL || "IB Barber <reservations@ib-barber.com>",
        to: booking.email,
        subject: `Rappel — Ton RDV dans 1h (${formattedTime})`,
        react: ReminderEmail({
          firstName: booking.first_name,
          date: formattedDate,
          time: formattedTime,
          service: serviceLabel,
          cancelUrl,
          isOneHour: true,
        }),
      });

      if (!emailError) {
        await supabase
          .from("bookings")
          .update({ reminder_1h_sent: true })
          .eq("id", booking.id);
        sentCount++;
      } else {
        console.error(`Cron: failed to send 1h reminder for booking ${booking.id}`, emailError);
      }
    }
  }

  return NextResponse.json({ sent: sentCount });
}
