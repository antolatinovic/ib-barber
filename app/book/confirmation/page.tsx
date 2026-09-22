"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type Service, SERVICES } from "@/types";
import { Grain, GoldGlow } from "@/components/home/BrandAtmosphere";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const firstName = searchParams.get("firstName");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const serviceKey = searchParams.get("service");
  const withGuest = searchParams.get("withGuest") === "1";
  const secondTime = searchParams.get("secondTime");
  const guestFirstName = searchParams.get("guestFirstName");
  const guestServiceKey = searchParams.get("guestService");

  const serviceLabel =
    serviceKey && (serviceKey === "coupe" || serviceKey === "coupe_barbe")
      ? SERVICES[serviceKey as Service].label
      : null;

  const guestServiceLabel =
    guestServiceKey && (guestServiceKey === "coupe" || guestServiceKey === "coupe_barbe")
      ? SERVICES[guestServiceKey as Service].label
      : null;

  const hasDetails = date && time && serviceLabel;
  const timeDisplay = withGuest && secondTime ? `${time} — ${secondTime}` : time;

  return (
    <div className="brand-theme relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <Grain />
      <GoldGlow />
      <div className="relative mx-auto max-w-md text-center">
        {/* Checkmark */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <svg
            className="h-8 w-8 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-3xl uppercase tracking-wide" style={{ fontFamily: "var(--font-bebas)" }}>
          {firstName ? `Merci ${firstName} !` : "Réservation confirmée"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {withGuest
            ? "Vous allez recevoir un email de confirmation chacun avec les détails du rendez-vous."
            : "Tu vas recevoir un email de confirmation avec les détails de ton rendez-vous."}
        </p>

        {hasDetails && (
          <div className="mt-8 rounded-xl border border-border p-4 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heure</span>
                <span className="font-medium">{timeDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestation</span>
                <span className="font-medium">{serviceLabel}</span>
              </div>
              {withGuest && guestFirstName && (
                <>
                  <div className="border-t border-border/50 pt-3">
                    <span className="text-xs font-medium text-muted-foreground">Invité(e)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{guestFirstName}</span>
                  </div>
                  {guestServiceLabel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prestation</span>
                      <span className="font-medium">{guestServiceLabel}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
          <p className="mb-2 text-sm font-semibold text-primary">Consignes</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              En arrivant, envoie un message sur Snapchat à{" "}
              <span className="font-medium text-foreground">@ib-fty</span>{" "}
              pour qu&apos;on vienne t&apos;ouvrir.
            </li>
            <li>
              Tout retard de <span className="font-medium text-foreground">10 min ou plus</span> ne sera pas accepté.
            </li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Pour toutes demandes spécifique contacte moi sur Snapchat
          <br />
          <span className="font-medium text-foreground">@ib-fty</span>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="brand-theme min-h-screen bg-background" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
