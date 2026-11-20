# GET Service ↔ GET Booking — Contrat d'intégration (copie Service)

Version: 2026-11-20
Statut: prototype / contrat cible, aucune connexion production active.

## 1. Propriété des données

### GET Service
Propriétaire de :
- conversations;
- tickets;
- emails / chat / appels;
- SLA;
- CRM intégré : accounts, contacts, leads, opportunities, tasks, commercial timeline.

### GET Booking
Propriétaire de :
- catalogue / activités;
- availability;
- holds;
- reservations;
- resources;
- orders / operational invoices;
- payments liés aux réservations;
- vouchers;
- workforce opérationnel;
- game sessions.

GET Service ne doit pas dupliquer le moteur de réservation.
GET Booking ne doit pas dupliquer les conversations ni le pipeline CRM.

## 2. Customer 360

GET Service peut demander une projection Booking limitée au dossier courant.

Réponse cible :

```json
{
  "customer": {},
  "upcomingReservations": [],
  "reservationHistory": [],
  "openQuotes": [],
  "openInvoices": [],
  "balance": 0,
  "lastGameResult": null
}
```

La projection respecte :
- permissions de l'agent;
- centres autorisés;
- champs nécessaires uniquement;
- aucune donnée RH ou finance non requise.

## 3. Commandes supervisées

GET Service peut préparer les commandes suivantes :

- checkAvailability
- prepareQuote
- modifyReservation
- cancelReservation
- sendPaymentLink
- resendVoucher
- addOperationalNote

Format d'enveloppe :

```json
{
  "version": "2026-11-20",
  "sourceApplication": "get_service",
  "targetApplication": "get_booking",
  "command": "modifyReservation",
  "actor": {
    "id": "employee-id",
    "role": "service_agent",
    "team": "Service Client"
  },
  "subject": {
    "customerId": "customer-id",
    "reservationId": "reservation-id",
    "centreCode": "ETM"
  },
  "payload": {},
  "correlationId": "svc-...",
  "mode": "supervised",
  "requiresServerAuthorization": true,
  "directDatabaseWrite": false
}
```

## 4. Réponse GET Booking

Réponse cible :

```json
{
  "correlationId": "svc-...",
  "command": "modifyReservation",
  "status": "success | approval_required | rejected | conflict | error",
  "result": {},
  "warnings": [],
  "auditId": "..."
}
```

### approval_required
Utilisé pour :
- override capacité;
- staffing fragile;
- remise au-delà du plafond;
- annulation hors politique;
- remboursement / geste commercial sensible.

### conflict
Utilisé si la disponibilité a changé entre lecture et validation.

GET Service doit alors rafraîchir le contexte et ne jamais prétendre que l'action est réussie.

## 5. Disponibilité depuis une conversation

Scénario :

1. le client écrit « avez-vous de la place vendredi à 19 h pour 6 ? »;
2. GET Service identifie compte/contact;
3. l'agent ou l'IA prépare `checkAvailability`;
4. GET Booking retourne les créneaux réellement vendables;
5. l'IA formule une réponse basée uniquement sur ces résultats;
6. l'agent valide la réponse;
7. aucune réservation n'est créée tant qu'une commande explicite n'est pas confirmée.

## 6. Modification

1. conversation client liée à une réservation;
2. l'agent demande les alternatives;
3. GET Booking calcule Availability;
4. le client choisit;
5. GET Service prépare `modifyReservation`;
6. GET Booking revalide capacité dans la transaction;
7. résultat retourné;
8. conversation et timeline CRM enregistrent une référence à l'action.

## 7. Paiement

GET Service peut demander `sendPaymentLink`.

Il ne reçoit pas :
- secret Stripe;
- numéro complet de carte;
- credentials PSP.

GET Booking retourne :
- montant;
- statut;
- URL de paiement autorisée / tokenisée lorsqu'elle existera;
- expiration;
- référence.

## 8. Self-service → GET Service

Le portail client Booking route vers GET Service lorsque :
- modification hors délai;
- annulation nécessitant revue;
- incident;
- remboursement exceptionnel;
- politique ambiguë;
- action nécessitant un humain.

Le ticket / conversation doit arriver avec :
- customer_id;
- reservation_id;
- centre_code;
- action demandée;
- politique concernée;
- correlation_id;
- résumé du contexte.

Le client ne doit pas avoir à répéter son numéro de réservation.

## 9. Contexte IA

GET Service peut inclure une projection texte de Booking dans le prompt IA.

Règles :
- données lues uniquement;
- provenance explicite;
- ne jamais inventer une disponibilité;
- ne jamais dire qu'un paiement est reçu sans statut Booking;
- ne jamais dire qu'une réservation est modifiée sans réponse de commande réussie;
- une suggestion IA n'est jamais une mutation.

## 10. Timeline et audit

Chaque commande doit produire le même correlation_id dans :
- GET Service;
- GET Booking;
- logs;
- audit;
- timeline CRM si pertinent.

GET Service conserve :
- qui a déclenché;
- depuis quelle conversation;
- commande;
- résultat.

GET Booking conserve :
- acteur;
- application source;
- objet;
- ancienne/nouvelle valeur lorsque mutation;
- résultat;
- justification / approbation.

## 11. Erreurs

Le contrat doit distinguer :
- permission_denied;
- availability_conflict;
- staffing_shortage;
- invalid_policy;
- customer_mismatch;
- payment_state_conflict;
- reservation_not_modifiable;
- provider_unavailable;
- unknown_error.

Les erreurs techniques ne doivent pas être transformées en confirmation client.

## 12. Phase actuelle

Actuellement :
- Customer 360 = données de démonstration;
- commandes = enveloppes simulées;
- aucune API réseau réelle;
- aucune écriture;
- aucune migration;
- aucune donnée CRM/Booking de production partagée.

Les PR restent Draft jusqu'à décision explicite de passer à la phase suivante.
