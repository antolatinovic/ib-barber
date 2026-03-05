"use client";

import { useEffect, useState } from "react";
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
  onSelect: (slot: SlotData) => void;
}

function groupByDate(slots: SlotData[]) {
  const groups: Record<string, SlotData[]> = {};
  for (const slot of slots) {
    if (!groups[slot.date]) groups[slot.date] = [];
    groups[slot.date].push(slot);
  }
  return groups;
}

export default function SlotPicker({ selectedSlotId, onSelect }: SlotPickerProps) {
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

  const grouped = groupByDate(slots);

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
        <p className="mt-1 text-sm text-muted-foreground">Sélectionne un jour et un horaire disponible</p>
      </div>

      {Object.entries(grouped).map(([date, dateSlots]) => (
        <div key={date}>
          <h3 className="mb-3 text-sm font-medium capitalize text-muted-foreground">
            {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {dateSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={slot.is_booked}
                onClick={() => onSelect(slot)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  slot.is_booked &&
                    "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through",
                  !slot.is_booked &&
                    selectedSlotId !== slot.id &&
                    "border-border text-foreground hover:border-foreground hover:bg-foreground/5",
                  selectedSlotId === slot.id &&
                    "border-foreground bg-foreground text-background"
                )}
              >
                {slot.time.slice(0, 5)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
