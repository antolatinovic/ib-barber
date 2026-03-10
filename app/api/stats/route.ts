import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";

const PRICES: Record<string, number> = {
  coupe: 10,
  coupe_barbe: 15,
};

interface PeriodStats {
  totalSlots: number;
  bookedSlots: number;
  revenue: number;
}

async function getStatsForPeriod(
  supabase: ReturnType<typeof createServiceClient>,
  from: string,
  to: string
): Promise<PeriodStats> {
  // Fetch slots for the period
  const { data: slots } = await supabase
    .from("slots")
    .select("id, is_booked")
    .gte("date", from)
    .lte("date", to);

  const allSlots = slots ?? [];
  const slotIds = allSlots.map((s) => s.id);

  const totalSlots = allSlots.length;
  const bookedSlots = allSlots.filter((s) => s.is_booked).length;

  // Fetch bookings for those slots (avoid PostgREST join issues)
  let revenue = 0;
  if (slotIds.length > 0) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("service, guest_service, cancelled_at")
      .in("slot_id", slotIds);

    revenue = (bookings ?? [])
      .filter((b) => !b.cancelled_at)
      .reduce(
        (sum, b) => sum + (PRICES[b.service] ?? 0) + (PRICES[b.guest_service] ?? 0),
        0
      );
  }

  return { totalSlots, bookedSlots, revenue };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const serviceClient = createServiceClient();

  const weekFrom = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekTo = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthFrom = format(startOfMonth(now), "yyyy-MM-dd");
  const monthTo = format(endOfMonth(now), "yyyy-MM-dd");
  const yearFrom = format(startOfYear(now), "yyyy-MM-dd");
  const yearTo = format(endOfYear(now), "yyyy-MM-dd");

  const [week, month, year] = await Promise.all([
    getStatsForPeriod(serviceClient, weekFrom, weekTo),
    getStatsForPeriod(serviceClient, monthFrom, monthTo),
    getStatsForPeriod(serviceClient, yearFrom, yearTo),
  ]);

  return NextResponse.json({ week, month, year });
}
