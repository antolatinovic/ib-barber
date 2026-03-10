"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingFormData {
  firstName: string;
  lastName: string;
  snap: string;
  email: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
}

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading: boolean;
  withGuest?: boolean;
}

export default function BookingForm({ onSubmit, isLoading, withGuest }: BookingFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [snap, setSnap] = useState("");
  const [email, setEmail] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const mainValid = firstName.trim() && lastName.trim() && snap.trim() && email.trim();
  const guestValid = !withGuest || (guestFirstName.trim() && guestLastName.trim() && guestEmail.trim());
  const isValid = mainValid && guestValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      firstName,
      lastName,
      snap,
      email,
      ...(withGuest
        ? { guestFirstName, guestLastName, guestEmail }
        : {}),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Tes informations</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pour confirmer ta réservation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="snap">Pseudo Snapchat</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
            <Input
              id="snap"
              placeholder="ton_snap"
              value={snap}
              onChange={(e) => setSnap(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {withGuest && (
          <>
            <div className="mt-6 border-t border-border/50 pt-6">
              <h3 className="text-lg font-semibold">Informations de ton invité(e)</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour la personne qui t&apos;accompagne</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="guestFirstName">Prénom</Label>
                <Input
                  id="guestFirstName"
                  placeholder="Prénom"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestLastName">Nom</Label>
                <Input
                  id="guestLastName"
                  placeholder="Nom"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                type="email"
                placeholder="invité@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="mt-2 w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
        >
          {isLoading ? "Réservation en cours..." : "Confirmer la réservation"}
        </button>
      </form>
    </div>
  );
}
