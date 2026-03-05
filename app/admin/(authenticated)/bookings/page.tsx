"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, List, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICES, type Service } from "@/types";

type View = "list" | "calendar";

interface BookingWithSlot {
  id: string;
  first_name: string;
  last_name: string;
  snap: string;
  email: string;
  service: Service;
  cancelled_at: string | null;
  created_at: string;
  slots: {
    date: string;
    time: string;
  };
}

// Generate time labels from earliest to latest booking, rounded to 30 min
function getTimeRange(bookings: BookingWithSlot[]): string[] {
  if (bookings.length === 0) return [];

  const minutes = bookings.map((b) => {
    const [h, m] = b.slots.time.split(":").map(Number);
    return h * 60 + m;
  });

  const minTime = Math.floor(Math.min(...minutes) / 30) * 30;
  const maxTime = Math.ceil(Math.max(...minutes) / 30) * 30;

  const times: string[] = [];
  for (let t = minTime; t <= maxTime; t += 30) {
    const h = Math.floor(t / 60).toString().padStart(2, "0");
    const m = (t % 60).toString().padStart(2, "0");
    times.push(`${h}:${m}`);
  }
  return times;
}

export default function AdminDashboardPage() {
  const [view, setView] = useState<View>("list");
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [bookings, setBookings] = useState<BookingWithSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Annuler cette réservation ? Le client recevra un email.")) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/admin/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        fetchBookings(weekStart);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de l'annulation");
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setCancellingId(null);
    }
  };

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    return `${format(weekStart, "d", { locale: fr })} - ${format(end, "d MMMM yyyy", { locale: fr })}`;
  }, [weekStart]);

  const fetchBookings = useCallback(async (start: Date) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings?weekStart=${format(start, "yyyy-MM-dd")}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(weekStart);
  }, [weekStart, fetchBookings]);

  const navigateWeek = (direction: -1 | 1) => {
    setWeekStart((prev) => addDays(prev, direction * 7));
  };

  // Group bookings by date
  const grouped: Record<string, BookingWithSlot[]> = {};
  for (const b of bookings) {
    const date = b.slots.date;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(b);
  }

  // Calendar data
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = getTimeRange(bookings);

  function getBookingAt(date: string, time: string) {
    return bookings.find(
      (b) => b.slots.date === date && b.slots.time.slice(0, 5) === time
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: week nav + view toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek(-1)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-center text-lg font-semibold">
          Semaine du {weekLabel}
        </h1>
        <button
          onClick={() => navigateWeek(1)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
        <button
          onClick={() => setView("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            view === "list"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="size-4" />
          Liste
        </button>
        <button
          onClick={() => setView("calendar")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            view === "calendar"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDays className="size-4" />
          Calendrier
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Chargement...</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Pas de réservation.</p>
      ) : view === "list" ? (
        /* === LIST VIEW === */
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateBookings]) => (
              <div key={date}>
                <h2 className="mb-3 text-sm font-medium capitalize text-muted-foreground">
                  {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
                </h2>
                <div className="space-y-2">
                  {dateBookings
                    .sort((a, b) => a.slots.time.localeCompare(b.slots.time))
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "flex items-center justify-between rounded-xl border border-border p-4",
                          booking.cancelled_at && "opacity-50"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              {booking.slots.time.slice(0, 5)}
                            </span>
                            <span className="text-sm font-medium">
                              {booking.first_name} {booking.last_name}
                            </span>
                            {booking.cancelled_at && (
                              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                                Annulé
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{SERVICES[booking.service]?.label}</span>
                            <span>@{booking.snap}</span>
                            <span>{booking.email}</span>
                          </div>
                        </div>
                        {!booking.cancelled_at && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? "..." : "Annuler"}
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* === CALENDAR VIEW === */
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="min-w-[600px]">
            {/* Day headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 pb-2">
              <div />
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {format(day, "EEE", { locale: fr })}
                  </p>
                  <p className="text-sm font-semibold">{format(day, "d")}</p>
                </div>
              ))}
            </div>

            {/* Time rows */}
            <div className="mt-1">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/20"
                  style={{ minHeight: "48px" }}
                >
                  <div className="flex items-center pr-2 text-xs text-muted-foreground">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const booking = getBookingAt(dateStr, time);
                    return (
                      <div
                        key={dateStr}
                        className="flex items-center border-l border-border/20 px-1 py-1"
                      >
                        {booking && (
                          <div className={cn(
                            "w-full rounded-md px-2 py-1",
                            booking.cancelled_at ? "bg-red-500/10" : "bg-foreground/10"
                          )}>
                            <p className={cn(
                              "truncate text-xs font-medium",
                              booking.cancelled_at && "line-through opacity-60"
                            )}>
                              {booking.first_name} {booking.last_name.charAt(0)}.
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {booking.cancelled_at ? "Annulé" : SERVICES[booking.service]?.label}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
