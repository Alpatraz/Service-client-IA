import { useMemo, useState } from "react";
import { DEMO_BOOKING_CONTEXT, prepareBookingCommand, type BookingCommand, type BookingCommandEnvelope, type BookingCustomer360 } from "./bookingBridge";

const labels: Record<BookingCommand, string> = {
  checkAvailability: "Vérifier disponibilités",
  prepareQuote: "Préparer un devis",
  modifyReservation: "Modifier réservation",
  cancelReservation: "Annuler réservation",
  sendPaymentLink: "Envoyer lien paiement",
  resendVoucher: "Renvoyer certificat",
  addOperationalNote: "Ajouter note",
};

export function BookingContextPanel({
  customer = DEMO_BOOKING_CONTEXT,
  onContextChange,
}: {
  customer?: BookingCustomer360;
  onContextChange?: (context: BookingCustomer360) => void;
}) {
  const [lastCommand, setLastCommand] = useState<BookingCommandEnvelope | null>(null);
  const primaryReservation = customer.upcomingReservations[0] || null;
  const commands = useMemo<BookingCommand[]>(() => [
    "checkAvailability",
    "prepareQuote",
    "modifyReservation",
    "sendPaymentLink",
    "addOperationalNote",
  ], []);

  function prepare(command: BookingCommand) {
    const envelope = prepareBookingCommand({
      command,
      actor: { id: "demo-agent-service", role: "service_agent", team: "Service Client" },
      customerId: customer.customer.id,
      reservationId: ["modifyReservation", "cancelReservation", "addOperationalNote"].includes(command) ? primaryReservation?.id : undefined,
      centreCode: primaryReservation?.centreCode,
      payload: command === "checkAvailability" ? { date: "2026-12-18", participants: 8 } : {},
    });
    setLastCommand(envelope);
    onContextChange?.(customer);
  }

  return (
    <section className="rounded-2xl border border-sky-400/30 bg-slate-950/70 text-slate-100 shadow-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/70 bg-gradient-to-r from-sky-950/70 to-slate-950">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-sky-300">GET Booking · Customer 360</span>
            <span className="rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/20 px-2 py-0.5 text-[10px] font-bold">Prototype</span>
          </div>
          <h2 className="font-bold text-lg mt-1">{customer.customer.displayName}</h2>
          <p className="text-xs text-slate-400">{customer.customer.email} · {customer.customer.phone} · {customer.customer.language.toUpperCase()}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2"><span className="text-slate-500 block">Réservations</span><b>{customer.upcomingReservations.length}</b></div>
          <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2"><span className="text-slate-500 block">Solde</span><b>{customer.balance.toLocaleString("fr-CA",{style:"currency",currency:"CAD"})}</b></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_.8fr]">
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-700/70">
          <h3 className="text-sm font-semibold mb-2">Réservations liées</h3>
          <div className="space-y-2">
            {customer.upcomingReservations.map(reservation => (
              <article key={reservation.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="flex justify-between gap-3">
                  <div><b className="text-sm">{reservation.activityName}</b><p className="text-xs text-slate-400 mt-1">{reservation.reservationNumber} · {reservation.centreCode} · {reservation.participants} joueurs</p></div>
                  <span className="text-[10px] uppercase text-emerald-300 font-bold">{reservation.status}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">{new Date(reservation.startsAt).toLocaleString("fr-CA",{dateStyle:"medium",timeStyle:"short"})}</p>
              </article>
            ))}
          </div>
          {customer.lastGameResult && (
            <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-3 text-xs">
              <b className="text-emerald-300">Dernière expérience</b>
              <p className="mt-1 text-slate-300">{customer.lastGameResult.outcome === "won" ? "Victoire" : "Défaite"} · score {customer.lastGameResult.score ?? "—"} · satisfaction {customer.lastGameResult.satisfaction ?? "—"}/5 {customer.lastGameResult.photoReady ? "· photo disponible" : ""}</p>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold">Actions Booking supervisées</h3>
          <p className="text-[11px] text-slate-400 mt-1">Prépare une commande vers GET Booking. Aucune écriture directe ni action réelle dans ce prototype.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 mt-3">
            {commands.map(command => (
              <button key={command} onClick={() => prepare(command)} className="text-left rounded-xl border border-slate-700 bg-slate-900 hover:border-sky-400/40 hover:bg-sky-950/20 px-3 py-2 text-xs transition">
                {labels[command]}
              </button>
            ))}
          </div>
          {lastCommand && (
            <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-950/20 p-3">
              <b className="text-xs text-sky-300">Commande préparée</b>
              <p className="text-xs mt-1">{labels[lastCommand.command]} · {lastCommand.correlationId}</p>
              <p className="text-[10px] text-slate-400 mt-1">Mode supervisé · autorisation serveur requise · directDatabaseWrite = false</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
