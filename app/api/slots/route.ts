import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { addDays, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  const weekStart = request.nextUrl.searchParams.get("weekStart");
  if (!weekStart) {
    return NextResponse.json({ error: "weekStart is required" }, { status: 400 });
  }

  const endDate = addDays(parseISO(weekStart), 6).toISOString().split("T")[0];

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .gte("date", weekStart)
    .lte("date", endDate)
    .order("date")
    .order("time");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slots } = await request.json();
  const serviceClient = createServiceClient();

  // Calculer la plage de dates des nouveaux créneaux
  const dates = slots.map((s: { date: string }) => s.date);
  const minDate = dates.reduce((a: string, b: string) => (a < b ? a : b));
  const maxDate = dates.reduce((a: string, b: string) => (a > b ? a : b));

  // Set des nouveaux créneaux pour comparaison rapide
  const newSlotKeys = new Set(
    slots.map((s: { date: string; time: string }) => `${s.date}|${s.time}`)
  );

  // Récupérer les créneaux existants non-réservés dans la plage
  const { data: existing } = await serviceClient
    .from("slots")
    .select("id, date, time")
    .gte("date", minDate)
    .lte("date", maxDate)
    .eq("is_booked", false);

  // Supprimer ceux qui ne sont plus dans la nouvelle config
  if (existing && existing.length > 0) {
    const toDelete = existing
      .filter((s) => !newSlotKeys.has(`${s.date}|${s.time}`))
      .map((s) => s.id);

    if (toDelete.length > 0) {
      await serviceClient
        .from("slots")
        .delete()
        .in("id", toDelete);
    }
  }

  // Upsert les nouveaux créneaux
  const { error } = await serviceClient
    .from("slots")
    .upsert(
      slots.map((s: { date: string; time: string }) => ({
        date: s.date,
        time: s.time,
        is_booked: false,
      })),
      { onConflict: "date,time", ignoreDuplicates: true }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("slots")
    .delete()
    .eq("id", id)
    .eq("is_booked", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
