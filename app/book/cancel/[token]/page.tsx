"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { SERVICES, type Service } from "@/types";

type Status = "loading" | "found" | "not_found" | "already_cancelled" | "cancelled" | "error";

interface BookingDetails {
  firstName: string;
  service: Service;
  date: string;
  time: string;
  canCancel: boolean;
  isPast: boolean;
}

export default function CancelPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/cancel?token=${token}`);
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = await res.json();
        if (data.alreadyCancelled) {
          setStatus("already_cancelled");
          return;
        }
        setBooking(data);
        setStatus("found");
      } catch {
        setStatus("error");
      }
    }
    fetchBooking();
  }, [token]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus("cancelled");
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de l'annulation");
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setIsCancelling(false);
    }
  };

  const formattedDate = booking
    ? (() => {
        const d = format(parseISO(booking.date), "EEEE d MMMM", { locale: fr });
        return d.charAt(0).toUpperCase() + d.slice(1);
      })()
    : "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <Image src="/IMG_8197-removebg-preview.png" alt="IB Barber" width={180} height={60} className="mx-auto mb-8 h-14 w-auto" />

        {status === "loading" && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}

        {status === "not_found" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Réservation introuvable</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ce lien n&apos;est plus valide. La réservation a peut-être déjà été annulée.
            </p>
          </>
        )}

        {status === "found" && booking && (
          <>
            <h1 className="text-xl font-bold">Annuler ta réservation ?</h1>

            <div className="mt-6 rounded-xl border border-border p-4 text-left">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heure</span>
                  <span className="font-medium">{booking.time.slice(0, 5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prestation</span>
                  <span className="font-medium">{SERVICES[booking.service]?.label}</span>
                </div>
              </div>
            </div>

            {booking.canCancel ? (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-6 w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {isCancelling ? "Annulation en cours..." : "Confirmer l'annulation"}
              </button>
            ) : booking.isPast ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Ce rendez-vous est déjà passé.
              </p>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                L&apos;annulation n&apos;est plus possible moins d&apos;1h avant le rendez-vous.
                Contacte-moi sur Snapchat{" "}
                <span className="font-medium text-foreground">@i-ftyyy08</span>
              </p>
            )}
          </>
        )}

        {status === "already_cancelled" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Déjà annulée</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Cette réservation a déjà été annulée.
            </p>
          </>
        )}

        {status === "cancelled" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
              <svg
                className="h-8 w-8 text-background"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Réservation annulée</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ton rendez-vous a bien été annulé. Le créneau est de nouveau disponible.
            </p>
          </>
        )}

        {status === "error" && (
          <p className="text-sm text-muted-foreground">
            Une erreur est survenue. Réessaie ou contacte-moi sur Snapchat{" "}
            <span className="font-medium text-foreground">@i-ftyyy08</span>
          </p>
        )}
      </div>
    </div>
  );
}
