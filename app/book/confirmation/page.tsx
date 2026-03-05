"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type Service, SERVICES } from "@/types";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const firstName = searchParams.get("firstName");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const serviceKey = searchParams.get("service");

  const serviceLabel =
    serviceKey && (serviceKey === "coupe" || serviceKey === "coupe_barbe")
      ? SERVICES[serviceKey as Service].label
      : null;

  const hasDetails = date && time && serviceLabel;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Checkmark */}
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

        <h1 className="text-2xl font-bold">
          {firstName ? `Merci ${firstName} !` : "Réservation confirmée"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tu vas recevoir un email de confirmation avec les détails de ton rendez-vous.
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
                <span className="font-medium">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prestation</span>
                <span className="font-medium">{serviceLabel}</span>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Pour toutes demandes spécifique contacte moi sur Snapchat
          <br />
          <span className="font-medium text-foreground">@i-ftyyy08</span>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
