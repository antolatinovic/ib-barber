"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { DayConfig, Pause, Slot } from "@/types";

const DEFAULT_DAYS = [
  { label: "Lundi", active: false, startTime: "09:00", endTime: "18:00" },
  { label: "Mardi", active: false, startTime: "09:00", endTime: "18:00" },
  { label: "Mercredi", active: true, startTime: "12:30", endTime: "20:30" },
  { label: "Jeudi", active: true, startTime: "12:30", endTime: "20:30" },
  { label: "Vendredi", active: true, startTime: "15:00", endTime: "21:30" },
  { label: "Samedi", active: true, startTime: "11:00", endTime: "21:30" },
  { label: "Dimanche", active: true, startTime: "12:00", endTime: "14:30" },
];

function buildDefaultDays(weekStart: Date): DayConfig[] {
  return DEFAULT_DAYS.map((day, i) => ({
    date: format(addDays(weekStart, i), "yyyy-MM-dd"),
    dayLabel: day.label,
    active: day.active,
    startTime: day.startTime,
    endTime: day.endTime,
    pauses: [],
  }));
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generateSlots(days: DayConfig[]): { date: string; time: string }[] {
  const slots: { date: string; time: string }[] = [];

  for (const day of days) {
    if (!day.active) continue;

    let current = parseTimeToMinutes(day.startTime);
    const end = parseTimeToMinutes(day.endTime);

    while (current < end) {
      const timeStr = minutesToTime(current);
      const inPause = day.pauses.some(
        (p) => current >= parseTimeToMinutes(p.start) && current < parseTimeToMinutes(p.end)
      );

      if (!inPause) {
        slots.push({ date: day.date, time: timeStr });
      }
      current += 30;
    }
  }

  return slots;
}

function groupSlotsByDate(slots: Slot[]) {
  const groups: Record<string, Slot[]> = {};
  for (const slot of slots) {
    if (!groups[slot.date]) groups[slot.date] = [];
    groups[slot.date].push(slot);
  }
  return groups;
}

export default function WeekSlotBuilder() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [days, setDays] = useState<DayConfig[]>(() => buildDefaultDays(startOfWeek(new Date(), { weekStartsOn: 1 })));
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 5);
    return `${format(weekStart, "d", { locale: fr })} - ${format(end, "d MMMM yyyy", { locale: fr })}`;
  }, [weekStart]);

  const generatedSlots = useMemo(() => generateSlots(days), [days]);

  const fetchExistingSlots = useCallback(async (start: Date) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/slots?weekStart=${format(start, "yyyy-MM-dd")}`);
      if (res.ok) {
        const data = await res.json();
        setExistingSlots(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExistingSlots(weekStart);
  }, [weekStart, fetchExistingSlots]);

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const isCurrentWeek = weekStart.getTime() <= currentWeekStart.getTime();

  const navigateWeek = (direction: -1 | 1) => {
    if (direction === -1 && isCurrentWeek) return;
    const newStart = addDays(weekStart, direction * 7);
    setWeekStart(newStart);
    setDays(buildDefaultDays(newStart));
  };

  const updateDay = (index: number, updates: Partial<DayConfig>) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...updates } : d)));
  };

  const addPause = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, pauses: [...d.pauses, { id: crypto.randomUUID(), start: "12:00", end: "13:00" }] }
          : d
      )
    );
  };

  const updatePause = (dayIndex: number, pauseId: string, updates: Partial<Pause>) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, pauses: d.pauses.map((p) => (p.id === pauseId ? { ...p, ...updates } : p)) }
          : d
      )
    );
  };

  const removePause = (dayIndex: number, pauseId: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, pauses: d.pauses.filter((p) => p.id !== pauseId) } : d
      )
    );
  };

  const publish = async () => {
    if (generatedSlots.length === 0) return;
    setIsPublishing(true);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: generatedSlots }),
      });
      if (res.ok) {
        await fetchExistingSlots(weekStart);
      } else {
        alert("Erreur lors de la publication des créneaux");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteSlot = async (id: string) => {
    const res = await fetch(`/api/slots?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setExistingSlots((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("Erreur lors de la suppression du créneau");
    }
  };

  const groupedExisting = groupSlotsByDate(existingSlots);

  return (
    <div className="space-y-8">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek(-1)}
          disabled={isCurrentWeek}
          className={cn(
            "rounded-lg p-2 transition-colors",
            isCurrentWeek
              ? "cursor-not-allowed text-muted-foreground/30"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1
          className="text-center text-xl uppercase tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Semaine du {weekLabel}
        </h1>
        <button
          onClick={() => navigateWeek(1)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Day configuration */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Configuration</h2>
        {days.map((day, i) => (
          <div
            key={day.date}
            className={cn(
              "rounded-xl border p-4 transition-all",
              day.active ? "border-border" : "border-border/30 opacity-50"
            )}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateDay(i, { active: !day.active })}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                  day.active
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                )}
              >
                {day.active && (
                  <svg className="size-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <span className="w-20 text-sm font-medium">{day.dayLabel}</span>

              {day.active && (
                <>
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(i, { startTime: e.target.value })}
                    className="w-auto text-sm"
                  />
                  <span className="text-sm text-muted-foreground">-</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(i, { endTime: e.target.value })}
                    className="w-auto text-sm"
                  />
                  <button
                    onClick={() => addPause(i)}
                    className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="size-3" />
                    Pause
                  </button>
                </>
              )}
            </div>

            {day.active && day.pauses.length > 0 && (
              <div className="mt-3 space-y-2 pl-8">
                {day.pauses.map((pause) => (
                  <div key={pause.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Pause :</span>
                    <Input
                      type="time"
                      value={pause.start}
                      onChange={(e) => updatePause(i, pause.id, { start: e.target.value })}
                      className="w-auto text-sm"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <Input
                      type="time"
                      value={pause.end}
                      onChange={(e) => updatePause(i, pause.id, { end: e.target.value })}
                      className="w-auto text-sm"
                    />
                    <button
                      onClick={() => removePause(i, pause.id)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-red-500"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview + Publish */}
      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          {generatedSlots.length} créneau{generatedSlots.length > 1 ? "x" : ""} {generatedSlots.length > 1 ? "seront générés" : "sera généré"}
        </p>
        <button
          onClick={publish}
          disabled={isPublishing || generatedSlots.length === 0}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {isPublishing ? "Publication..." : "Publier la semaine"}
        </button>
      </div>

      {/* Existing slots */}
      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Chargement...</p>
      ) : Object.keys(groupedExisting).length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Créneaux existants</h2>
          {Object.entries(groupedExisting).map(([date, slots]) => (
            <div key={date}>
              <h3 className="mb-2 text-sm font-medium capitalize">
                {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm",
                      slot.is_booked
                        ? "border-border/50 text-muted-foreground/60"
                        : "border-border text-foreground"
                    )}
                  >
                    <span>{slot.time.slice(0, 5)}</span>
                    {slot.is_booked ? (
                      <span className="text-xs text-muted-foreground/40">pris</span>
                    ) : (
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-red-500"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
