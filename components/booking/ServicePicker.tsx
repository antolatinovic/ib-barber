"use client";

import { cn } from "@/lib/utils";
import { type Service, SERVICES } from "@/types";

interface ServicePickerProps {
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  label?: string;
  subtitle?: string;
}

export default function ServicePicker({ selectedService, onSelect, label, subtitle }: ServicePickerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl uppercase tracking-wide" style={{ fontFamily: "var(--font-bebas)" }}>{label ?? "Choisis ta prestation"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle ?? "Sélectionne le service souhaité"}</p>
      </div>

      <div className="grid gap-3">
        {(Object.entries(SERVICES) as [Service, { label: string; duration: string; price: string }][]).map(
          ([key, { label, duration, price }]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                selectedService === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div>
                <p className="font-medium">{label} ({price})</p>
                <p
                  className={cn(
                    "text-sm",
                    selectedService === key ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {duration}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                  selectedService === key
                    ? "border-primary-foreground bg-primary-foreground"
                    : "border-muted-foreground/40"
                )}
              >
                {selectedService === key && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}
