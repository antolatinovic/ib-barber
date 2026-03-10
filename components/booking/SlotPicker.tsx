"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface SlotData {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
}

interface SlotPickerProps {
  selectedSlotId: string | null;
  withGuest: boolean;
  onSelect: (slot: SlotData, secondSlot?: SlotData) => void;
}

function groupByDate(slots: SlotData[]) {
  const groups: Record<string, SlotData[]> = {};
  for (const slot of slots) {
    if (!groups[slot.date]) groups[slot.date] = [];
    groups[slot.date].push(slot);
  }
  return groups;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60).toString().padStart(2, "0");
  const newM = (total % 60).toString().padStart(2, "0");
  return `${newH}:${newM}`;
}

export default function SlotPicker({ selectedSlotId, withGuest, onSelect }: SlotPickerProps) {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      setIsLoading(true);
      try {
        const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
        const res = await fetch(`/api/slots?weekStart=${format(currentWeek, "yyyy-MM-dd")}`);
        const data = res.ok ? await res.json() : [];

        // Filter out past slots (date + time)
        const now = new Date();
        const today = format(now, "yyyy-MM-dd");
        const currentTime = format(now, "HH:mm");

        const filtered = data.filter((s: SlotData) => {
          if (s.date > today) return true;
          if (s.date === today) return s.time.slice(0, 5) > currentTime;
          return false;
        });

        setSlots(filtered);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSlots();
  }, []);

  // Lookup for finding consecutive slots
  const slotLookup = useMemo(() => {
    const map = new Map<string, SlotData>();
    for (const slot of slots) {
      map.set(`${slot.date}|${slot.time.slice(0, 5)}`, slot);
    }
    return map;
  }, [slots]);

  function getNextSlot(slot: SlotData): SlotData | undefined {
    const nextTime = addMinutes(slot.time, 30);
    return slotLookup.get(`${slot.date}|${nextTime}`);
  }

  function isDisabled(slot: SlotData): boolean {
    if (slot.is_booked) return true;
    if (withGuest) {
      const next = getNextSlot(slot);
      return !next || next.is_booked;
    }
    return false;
  }

  const handleSelect = (slot: SlotData) => {
    if (withGuest) {
      const next = getNextSlot(slot);
      onSelect(slot, next);
    } else {
      onSelect(slot);
    }
  };

  const grouped = groupByDate(slots);

  // Find the second selected slot for visual highlight
  const selectedSecondSlotId = useMemo(() => {
    if (!withGuest || !selectedSlotId) return null;
    const selected = slots.find((s) => s.id === selectedSlotId);
    if (!selected) return null;
    const next = getNextSlot(selected);
    return next?.id ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withGuest, selectedSlotId, slots, slotLookup]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Choisis ton créneau</h2>
          <p className="mt-1 text-sm text-muted-foreground">Chargement des disponibilités...</p>
        </div>
      </div>
    );
  }

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Choisis ton créneau</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aucun créneau disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Choisis ton créneau</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {withGuest
            ? "Sélectionne un horaire — 2 créneaux consécutifs seront réservés"
            : "Sélectionne un jour et un horaire disponible"}
        </p>
      </div>

      {Object.entries(grouped).map(([date, dateSlots]) => (
        <div key={date}>
          <h3 className="mb-3 text-sm font-medium capitalize text-muted-foreground">
            {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {dateSlots.map((slot) => {
              const disabled = isDisabled(slot);
              const isSelected = selectedSlotId === slot.id;
              const isSecondSelected = selectedSecondSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  disabled={disabled}
                  onClick={() => handleSelect(slot)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    disabled &&
                      "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through",
                    !disabled &&
                      !isSelected &&
                      !isSecondSelected &&
                      "border-border text-foreground hover:border-foreground hover:bg-foreground/5",
                    (isSelected || isSecondSelected) &&
                      "border-foreground bg-foreground text-background"
                  )}
                >
                  {slot.time.slice(0, 5)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
