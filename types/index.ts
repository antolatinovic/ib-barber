export type Service = "coupe" | "coupe_barbe";

export interface Slot {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
}

export interface Booking {
  id: string;
  slot_id: string;
  second_slot_id: string | null;
  first_name: string;
  last_name: string;
  snap: string;
  email: string;
  service: Service;
  guest_first_name: string | null;
  guest_last_name: string | null;
  guest_email: string | null;
  guest_service: Service | null;
  cancellation_token: string;
  cancelled_at: string | null;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  created_at: string;
}

export interface Pause {
  id: string;
  start: string;
  end: string;
}

export interface DayConfig {
  date: string;
  dayLabel: string;
  active: boolean;
  startTime: string;
  endTime: string;
  pauses: Pause[];
}

export const SERVICES: Record<Service, { label: string; duration: string; price: string }> = {
  coupe: { label: "Coupe", duration: "30 min", price: "10€" },
  coupe_barbe: { label: "Coupe + Barbe", duration: "30 min", price: "15€" },
};
