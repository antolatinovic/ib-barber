import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";
import { SERVICE_PRICES, type Service } from "@/types";

interface PeriodStats {
  totalSlots: number;
  bookedSlots: number;
  revenue: number;
  byService: Record<Service, { count: number; revenue: number }>;
}

function emptyByService(): Record<Service, { count: number; revenue: number }> {
  return {
    coupe: { count: 0, revenue: 0 },
    coupe_barbe: { count: 0, revenue: 0 },
  };
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
  const byService = emptyByService();
  if (slotIds.length > 0) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("service, guest_service, cancelled_at")
      .in("slot_id", slotIds);

    for (const b of bookings ?? []) {
      if (b.cancelled_at) continue;

      const servicePrice = SERVICE_PRICES[b.service as Service] ?? 0;
      revenue += servicePrice;
      byService[b.service as Service].count += 1;
      byService[b.service as Service].revenue += servicePrice;

      if (b.guest_service) {
        const guestPrice = SERVICE_PRICES[b.guest_service as Service] ?? 0;
        revenue += guestPrice;
        byService[b.guest_service as Service].count += 1;
        byService[b.guest_service as Service].revenue += guestPrice;
      }
    }
  }

  return { totalSlots, bookedSlots, revenue, byService };
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
