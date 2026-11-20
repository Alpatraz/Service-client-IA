export type BookingCommand =
  | "checkAvailability"
  | "prepareQuote"
  | "modifyReservation"
  | "cancelReservation"
  | "sendPaymentLink"
  | "resendVoucher"
  | "addOperationalNote";

export type BookingReservationSummary = {
  id: string;
  reservationNumber: string;
  centreCode: string;
  activityName: string;
  startsAt: string;
  participants: number;
  status: string;
  balance?: number;
};

export type BookingCustomer360 = {
  customer: {
    id: string;
    displayName: string;
    email?: string;
    phone?: string;
    language: string;
  };
  upcomingReservations: BookingReservationSummary[];
  balance: number;
  lastGameResult?: {
    outcome?: string;
    score?: number;
    satisfaction?: number;
    photoReady?: boolean;
  };
};

export type BookingCommandEnvelope = {
  version: "2026-11-20";
  sourceApplication: "get_service";
  targetApplication: "get_booking";
  command: BookingCommand;
  actor: { id: string; role: string; team?: string };
  subject: { customerId: string; reservationId?: string; centreCode?: string };
  payload: Record<string, unknown>;
  correlationId: string;
  mode: "supervised";
  requiresServerAuthorization: true;
  directDatabaseWrite: false;
};

export function prepareBookingCommand(args: {
  command: BookingCommand;
  actor: { id: string; role: string; team?: string };
  customerId: string;
  reservationId?: string;
  centreCode?: string;
  payload?: Record<string, unknown>;
}): BookingCommandEnvelope {
  const needsReservation = ["modifyReservation", "cancelReservation", "addOperationalNote"].includes(args.command);
  if (!args.actor?.id) throw new Error("Actor requis");
  if (!args.customerId) throw new Error("Client requis");
  if (needsReservation && !args.reservationId) throw new Error("Réservation requise");
  return {
    version: "2026-11-20",
    sourceApplication: "get_service",
    targetApplication: "get_booking",
    command: args.command,
    actor: args.actor,
    subject: { customerId: args.customerId, reservationId: args.reservationId, centreCode: args.centreCode },
    payload: args.payload || {},
    correlationId: `svc-demo-${Date.now()}`,
    mode: "supervised",
    requiresServerAuthorization: true,
    directDatabaseWrite: false,
  };
}

export function bookingContextForAi(view: BookingCustomer360): string {
  const reservations = view.upcomingReservations.length
    ? view.upcomingReservations.map(r => `${r.reservationNumber} · ${r.activityName} · ${r.centreCode} · ${r.startsAt} · ${r.status}`).join("\n")
    : "Aucune réservation future.";
  return [
    "CONTEXTE GET BOOKING — LECTURE SEULE",
    `Client : ${view.customer.displayName}`,
    `Solde ouvert : ${view.balance.toFixed(2)} CAD`,
    "Réservations futures :",
    reservations,
    view.lastGameResult ? `Dernière partie : ${view.lastGameResult.outcome || "—"} · score ${view.lastGameResult.score ?? "—"} · satisfaction ${view.lastGameResult.satisfaction ?? "—"}/5` : "Aucun résultat de partie.",
    "Ne jamais inventer disponibilité, paiement ou modification. Toute action Booking doit passer par une commande supervisée.",
  ].join("\n");
}

export const DEMO_BOOKING_CONTEXT: BookingCustomer360 = {
  customer: {
    id: "demo-customer-technova",
    displayName: "TechNova Inc. · Camille Moreau",
    email: "camille@example.com",
    phone: "514-555-0184",
    language: "fr",
  },
  upcomingReservations: [
    {
      id: "demo-r1",
      reservationNumber: "R-2404",
      centreCode: "ETM",
      activityName: "Al-Patraz",
      startsAt: "2026-12-18T18:00:00-05:00",
      participants: 8,
      status: "confirmed",
      balance: 2576,
    },
    {
      id: "demo-r2",
      reservationNumber: "R-2405",
      centreCode: "ETM",
      activityName: "Diamants interdits",
      startsAt: "2026-12-18T18:00:00-05:00",
      participants: 8,
      status: "confirmed",
      balance: 0,
    },
  ],
  balance: 2576,
  lastGameResult: { outcome: "won", score: 920, satisfaction: 5, photoReady: true },
};


export type BookingServiceIncident = {
  type: "technical_issue";
  priority: "high" | "normal";
  reservationId: string;
  gameSessionId: string;
  centreCode: string;
  correlationId: string;
  summary: string;
  status: "new" | "linked" | "resolved";
};

export const DEMO_BOOKING_INCIDENT: BookingServiceIncident = {
  type: "technical_issue",
  priority: "high",
  reservationId: "demo-r1",
  gameSessionId: "demo-gs-demo-r1",
  centreCode: "ETM",
  correlationId: "game-demo-gs-demo-r1-evt-issue",
  summary: "Capteur indisponible pendant la partie — revue Service Client recommandée",
  status: "new",
};

export function incidentToServiceContext(incident: BookingServiceIncident, customer: BookingCustomer360) {
  const reservation = customer.upcomingReservations.find(row => row.id === incident.reservationId);
  return {
    sourceApplication: "get_booking",
    targetApplication: "get_service",
    type: incident.type,
    priority: incident.priority,
    customerId: customer.customer.id,
    reservationId: incident.reservationId,
    gameSessionId: incident.gameSessionId,
    centreCode: incident.centreCode,
    correlationId: incident.correlationId,
    summary: incident.summary,
    reservation,
    directDatabaseWrite: false,
  };
}
