import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { SERVICES, type Service } from "@/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import CancellationEmail from "@/emails/cancellation";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, date, time, service } = await request.json();

    if (!email || !firstName || !date || !time || !service) {
      return NextResponse.json(
        { error: "Champs manquants" },
        { status: 400 }
      );
    }

    const serviceLabel = SERVICES[service as Service]?.label;
    if (!serviceLabel) {
      return NextResponse.json(
        { error: "Service invalide" },
        { status: 400 }
      );
    }

    const formatted = format(parseISO(date), "EEEE d MMMM", { locale: fr });
    const formattedDate = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    const { error } = await getResend().emails.send({
      from: process.env.FROM_EMAIL || "IB Barber <reservations@ib-barber.com>",
      to: email,
      subject: `Annulation de ton RDV — ${formattedDate} à ${time}`,
      react: CancellationEmail({ firstName, date: formattedDate, time, service: serviceLabel }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-cancellation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
