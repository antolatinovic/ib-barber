"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { type Service, SERVICES } from "@/types";
import SlotPicker from "@/components/booking/SlotPicker";
import ServicePicker from "@/components/booking/ServicePicker";
import BookingForm from "@/components/booking/BookingForm";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const STEPS = ["Créneau", "Prestation", "Infos"];

interface SelectedSlot {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
}

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSlotSelect = (slot: SelectedSlot) => {
    setSelectedSlot(slot);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleFormSubmit = async (data: {
    firstName: string;
    lastName: string;
    snap: string;
    email: string;
  }) => {
    if (!selectedSlot || !selectedService) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          firstName: data.firstName,
          lastName: data.lastName,
          snap: data.snap,
          email: data.email,
          service: selectedService,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erreur lors de la réservation");
        setIsLoading(false);
        return;
      }

      // Fire-and-forget: send confirmation email
      fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          date: selectedSlot.date,
          time: selectedSlot.time,
          service: selectedService,
        }),
      }).catch(() => {});

      const params = new URLSearchParams({
        firstName: data.firstName,
        date: format(parseISO(selectedSlot.date), "EEEE d MMMM", { locale: fr }),
        time: selectedSlot.time,
        service: selectedService,
      });

      router.push(`/book/confirmation?${params.toString()}`);
    } catch {
      alert("Erreur de connexion");
      setIsLoading(false);
    }
  };

  const canGoNext =
    (step === 0 && selectedSlot !== null) ||
    (step === 1 && selectedService !== null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-4">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold tracking-tight">IB BARBER</h1>
        </div>
      </header>

      {/* Stepper indicator */}
      <div className="border-b border-border/30 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (i < step) setStep(i);
                }}
                className={cn(
                  "flex items-center gap-1.5 text-sm transition-colors",
                  i === step && "font-medium text-foreground",
                  i < step && "cursor-pointer text-muted-foreground hover:text-foreground",
                  i > step && "text-muted-foreground/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    i === step && "bg-foreground text-background",
                    i < step && "bg-muted-foreground/20 text-foreground",
                    i > step && "bg-muted-foreground/10 text-muted-foreground/40"
                  )}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-px w-6",
                  i < step ? "bg-muted-foreground/30" : "bg-muted-foreground/10"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Récap sélection */}
      {(selectedSlot || selectedService) && step > 0 && (
        <div className="border-b border-border/30 px-4 py-3">
          <div className="mx-auto flex max-w-lg flex-wrap gap-3 text-sm">
            {selectedSlot && (
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                {format(parseISO(selectedSlot.date), "EEE d MMM", { locale: fr })} — {selectedSlot.time}
              </span>
            )}
            {selectedService && step > 1 && (
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                {SERVICES[selectedService].label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6 pb-28">
        {step === 0 && (
          <SlotPicker
            selectedSlotId={selectedSlot?.id ?? null}
            onSelect={handleSlotSelect}
          />
        )}

        {step === 1 && (
          <ServicePicker
            selectedService={selectedService}
            onSelect={handleServiceSelect}
          />
        )}

        {step === 2 && (
          <BookingForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}
      </main>

      {/* Bottom nav */}
      {step < 2 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-lg">
          <div className="mx-auto flex max-w-lg gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Retour
              </button>
            )}
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext}
              className="flex-1 rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
