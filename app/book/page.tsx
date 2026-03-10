"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { type Service, SERVICES } from "@/types";
import SlotPicker from "@/components/booking/SlotPicker";
import ServicePicker from "@/components/booking/ServicePicker";
import BookingForm from "@/components/booking/BookingForm";
import Image from "next/image";
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
  const [withGuest, setWithGuest] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedSecondSlot, setSelectedSecondSlot] = useState<SelectedSlot | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [guestService, setGuestService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleGuest = () => {
    setWithGuest((prev) => !prev);
    setSelectedSlot(null);
    setSelectedSecondSlot(null);
  };

  const handleSlotSelect = (slot: SelectedSlot, secondSlot?: SelectedSlot) => {
    setSelectedSlot(slot);
    setSelectedSecondSlot(secondSlot ?? null);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleGuestServiceSelect = (service: Service) => {
    setGuestService(service);
  };

  const handleFormSubmit = async (data: {
    firstName: string;
    lastName: string;
    snap: string;
    email: string;
    guestFirstName?: string;
    guestLastName?: string;
    guestEmail?: string;
  }) => {
    if (!selectedSlot || !selectedService) return;
    if (withGuest && (!selectedSecondSlot || !guestService)) return;
    setIsLoading(true);

    try {
      const body: Record<string, unknown> = {
        slotId: selectedSlot.id,
        firstName: data.firstName,
        lastName: data.lastName,
        snap: data.snap,
        email: data.email,
        service: selectedService,
      };

      if (withGuest && selectedSecondSlot) {
        body.secondSlotId = selectedSecondSlot.id;
        body.guestFirstName = data.guestFirstName;
        body.guestLastName = data.guestLastName;
        body.guestEmail = data.guestEmail;
        body.guestService = guestService;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erreur lors de la réservation");
        setIsLoading(false);
        return;
      }

      const resData = await res.json();

      // Fire-and-forget: send confirmation email to main client
      const emailBody: Record<string, unknown> = {
        email: data.email,
        firstName: data.firstName,
        date: selectedSlot.date,
        time: selectedSlot.time,
        service: selectedService,
        cancellationToken: resData.cancellationToken,
      };

      if (withGuest && selectedSecondSlot) {
        emailBody.secondTime = selectedSecondSlot.time;
        emailBody.guestName = `${data.guestFirstName} ${data.guestLastName}`;
      }

      fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailBody),
      }).catch(() => {});

      // Fire-and-forget: send confirmation email to guest
      if (withGuest && data.guestEmail && selectedSecondSlot) {
        fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.guestEmail,
            firstName: data.guestFirstName,
            date: selectedSlot.date,
            time: selectedSlot.time,
            service: guestService,
            cancellationToken: resData.cancellationToken,
            secondTime: selectedSecondSlot.time,
            isGuest: true,
            mainName: `${data.firstName} ${data.lastName}`,
          }),
        }).catch(() => {});
      }

      const params = new URLSearchParams({
        firstName: data.firstName,
        date: format(parseISO(selectedSlot.date), "EEEE d MMMM", { locale: fr }),
        time: selectedSlot.time,
        service: selectedService,
      });

      if (withGuest && selectedSecondSlot) {
        params.set("withGuest", "1");
        params.set("secondTime", selectedSecondSlot.time);
        params.set("guestFirstName", data.guestFirstName || "");
        params.set("guestService", guestService || "");
      }

      router.push(`/book/confirmation?${params.toString()}`);
    } catch {
      alert("Erreur de connexion");
      setIsLoading(false);
    }
  };

  const canGoNext =
    (step === 0 && selectedSlot !== null) ||
    (step === 1 && selectedService !== null && (!withGuest || guestService !== null));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-4">
        <div className="mx-auto max-w-lg flex justify-center">
          <Image src="/IMG_8197-removebg-preview.png" alt="IB Barber" width={180} height={60} className="h-14 w-auto" />
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
                {withGuest && selectedSecondSlot && ` → ${selectedSecondSlot.time}`}
              </span>
            )}
            {withGuest && step > 0 && (
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                +1 invité
              </span>
            )}
            {selectedService && step > 1 && (
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                {SERVICES[selectedService].label}
              </span>
            )}
            {withGuest && guestService && step > 1 && (
              <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                Invité : {SERVICES[guestService].label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6 pb-28">
        {step === 0 && (
          <div className="space-y-6">
            {/* Toggle +1 */}
            <button
              type="button"
              onClick={handleToggleGuest}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-4 transition-all",
                withGuest
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/50"
              )}
            >
              <div className="text-left">
                <p className="text-sm font-medium">Je viens accompagné(e)</p>
                <p className="text-xs text-muted-foreground">2 créneaux consécutifs seront réservés</p>
              </div>
              <div
                className={cn(
                  "flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors",
                  withGuest ? "bg-foreground" : "bg-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full bg-background transition-transform",
                    withGuest && "translate-x-4"
                  )}
                />
              </div>
            </button>

            <SlotPicker
              selectedSlotId={selectedSlot?.id ?? null}
              withGuest={withGuest}
              onSelect={handleSlotSelect}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <ServicePicker
              selectedService={selectedService}
              onSelect={handleServiceSelect}
              label={withGuest ? "Ta prestation" : undefined}
            />
            {withGuest && (
              <ServicePicker
                selectedService={guestService}
                onSelect={handleGuestServiceSelect}
                label="Prestation de ton invité(e)"
                subtitle="Sélectionne le service pour la personne qui t'accompagne"
              />
            )}
          </div>
        )}

        {step === 2 && (
          <BookingForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            withGuest={withGuest}
          />
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
