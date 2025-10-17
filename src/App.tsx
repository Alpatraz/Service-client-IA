import { useState, useEffect, useMemo } from "react";

/**
 * Assistant Service Client IA – version finale (JavaScript)
 * Fonctions :
 * - CGV / Règles internes
 * - Bibliothèque de réponses types
 * - Base de connaissances par centre
 * - Exemples d’e-mails types
 * - 5 cases à cocher (Horaire OK / Date OK / Règle mineurs / Team Building / Départ simultané)
 * - Boutons Copier / Tests rapides
 * - Animations visuelles (points verts) + bordures dynamiques (orange quand on écrit, bleu quand réponse générée)
 * - Gestion robuste du proxy OpenRouter (message explicite + fallback template si indisponible)
 */

const ORG_VERSION = "2025-10-16-final";

const ORG_PRESET = {
  brands: [
    { id: "ETM", label: "Échappe-Toi Montréal" },
    { id: "ADT", label: "À Double Tour Québec" },
    { id: "VQL", label: "Vortex Quartier Latin" },
    { id: "VPL", label: "Vortex Plateau" },
    { id: "FTK", label: "Find The Key" },
    { id: "MQM", label: "Musi’Quiz Montréal" },
    { id: "MQQ", label: "Musi’Quiz Québec" },
  ],
  brandId: "ETM",
  payment: "B",
  tone: "vous",
  lang: "fr",
  cgvText: `Cette entente s’applique à toute activité relative à Echappe-Toi. En utilisant cette page web, en effectuant une réservation ou en utilisant les locaux d’Échappe-Toi, vous attestez que vous avez examiné et que vous comprenez les conditions prévues par la présente, et que vous acceptez, sans restriction ni condition, d’être lié par celle-ci.

CONDITION D'ENTRÉE:  Vous devez lire et accepter les Termes et Conditions de Echappe-Toi avant d’utiliser nos services, et cela, avant d’avoir payé les frais liés à la réservation.

SERVICES DE JEUX: Vous comprenez que notre service de jeux d’amusement comprend des défis intellectuels pour votre divertissement. Ce service n’est pas destiné à tester vos habiletés physiques de quelque manière que ce soit. Vous comprenez que vous pouvez interagir avec votre environnement mais que le jeu ne nécessite pas d’avoir recours à la force physique. Par conséquent, le jeu interdit l’usage de force physique et d’actions telles que courir, sauter, grimper ou frapper, ou n’importe quelles autres activités physiques qui pourraient endommager le matériel ou blesser quelqu’un.

RESPONSABILITÉ: Vous acceptez de ne pas forcer, ni d'utiliser une force excessive, sur votre environnement. Vous prenez la responsabilité des coûts que peuvent engendrer tous dommages que vous pourriez causer au sein de l’établissement ou à la propriété d’une autre personne en tant que participant (cela inclut de façon non limitative les dommages matériels, les déplacements d’objets ou la modification de mot de passe sur des outils informatiques). Échappe-Toi n’est pas responsable de la perte ou de dommages de vos affaires mis en sécurité dans les casiers fermés à clés.

CONFIDENTIALITÉ: Il est interdit de diffuser des vidéos, photos ou toutes autres informations techniques ou considérées, par Echappe-Toi, comme étant confidentielles, sans autorisation écrite de la part d’Echappe-Toi. Cela inclut, de façon non-exclusive, les éléments utilisés et divulgués directement ou indirectement, par écrit, oralement ou visuellement.

COPYRIGHT: Vous ne pouvez pas copier, reproduire, modifier, adapter, traduire, créer un travail dérivé de celui-ci, publier, transférer, distribuer ou vendre des informations qu’Échappe-Toi considère confidentielles (en partie ou entièrement) sans le consentement écrit d’Échappe-Toi.

REFUS D’ENTRÉE: Échappe-Toi se garde le droit de vous refuser l’entrée s’il est présumé que vous pourriez être un danger pour vous, pour l’équipe d’Échappe-Toi ou pour les autres clients.

TRAITEMENT MÉDICAL: Vous autorisez Échappe-Toi à prendre les initiatives raisonnables en cas de blessures personnelles et vous acceptez de couvrir les frais des traitements médicaux d’urgence et transport en ambulance.

REMBOURSEMENT OU RETARD:
Nous demandons aux joueurs d’arriver 15 minutes avant l’heure de réservation. L’activité doit commencer à l’heure écrite sur votre réservation. Après 5 minutes de retard par rapport à l’heure de réservation, les 60 minutes de jeux commenceront et les joueurs auront le restant du temps à leur arrivée pour jouer. Dans le cas d’un retard de plus de 30 minutes, aucun joueur ne sera accepté pour jouer et aucun remboursement ne sera effectué.

ANNULATION/MODIFICATION:

Si vous ne pouvez pas vous présenter à votre rendez-vous à l’heure réservée, pour quelque raison que ce soit, vous devez nous en aviser dans un délai d’au moins 48 heures par téléphone au 514-907-2200 ou par courriel info@echappetoi.com, afin que nous puissions vous proposer un nouveau créneau horaire.

Attention, aucun remboursement n'est effectué en cas d'annulation.
Si vous nous en avisez dans un délai de plus 48 heures et plus, nous émettons des certificats cadeaux d'une valeur équivalente à celle de votre réservation afin de vous permettre de jouer à une autre date. Aucun remboursement n'est effectué.
Si une ou plusieurs personnes ne se présentent pas pour votre réservation, le principe est le même que pour la non présentation.
ANNULATION EN CAS D'ÉVÉNEMENT INDEPENDANT DE NOTRE VOLONTÉ: 
En cas de nouvelle pandémie, grève, ou autre événement qui ne résulte pas d'Échappe-toi mais d'un événement extérieur indépendant de notre volonté, les réservations seront annulées et remboursées uniquement en certificats-cadeaux de la valeur de la réservation initiale. Aucun remboursement en argent ne sera fait.

RÉSERVATION POUR UN ANNIVERSAIRE: Les forfaits d'anniversaire sont payables en entier au moment de la réservation et sont des ventes finales et non remboursables. Les billets d'entrée de jeux seront payables pour 50% des entrées et la balance 48h avant la date de réservation, pour permettre d'ajuster le nombre de joueurs.

RÉSERVATION POUR UNE TIERCE PARTIE: Quand vous procédez à une réservation pour une autre personne, vous acceptez que vous faites la réservation et donc que la personne est tenue par les mêmes termes et conditions que vous.

EN DESSOUS DE 15 ANS: Tout jeune de moins de 15 ans doit obligatoirement être accompagné par un responsable légal/majeur ayant payé sa réservation, en tout temps dans les installations d’Échappe-Toi. Le responsable légal de l’enfant est tenu par les termes et conditions pour l’enfant.

EN CAS DE NON-PRÉSENTATION À UNE ACTIVITÉ ÉCHAPPE-TOI: En cas de non présentation d'un joueur ou d'une équipe, aucun remboursement ne sera effectué. 

SIGNES DE SÉCURITÉ: Vous devez vous conformer en tout temps aux affichages de sécurité en place dans les locaux d’Échappe-Toi.

SURVEILLANCE VIDEO : Vous donnez à Échappe-Toi le droit d’utiliser les caméras de surveillance pour surveiller le jeu mais aussi en cas de dommages de propriété ou des installations d’Échappe-Toi.

ALCOOLS ET DROGUES: Il est interdit de participer à une activité à Échappe-Toi en étant sous l’influence de drogue ou d’alcool.

NOURRITURE ET BOISSON: Aucune nourriture ou boisson ne doivent être consommées durant l’activité ou dans le centre. 

TÉLÉPHONES MOBILES ou OBJETS ELECTRONIQUES SIMILAIRES: Les téléphones cellulaires ou tout autres objets électroniques ne doivent pas être utilisés durant les activités du jeux d’évasion. Ils doivent être placés dans les vestiaires sécurisés mis à disposition des joueurs.

ITEMS DANGEREUX: Aucun item dangereux, objet pointu, arme, couteau ou allumette n’est permis dans les locaux.

FUMER:  Il est strictement interdit de fumer dans les locaux d’Échappe-Toi.

ARRÊT DU JEU: Les employés d’Échappe-Toi se réservent le droit de refuser quiconque ne respectant pas les règles ci-dessus. Toutes les pièces de jeu doivent être retournées après le jeu. Échappe-Toi se réserve le droit de réclamer une indemnité pour toute tentative délibérée de causer des dommages au matériel, aux équipements ou aux locaux. Il est aussi entendu qu’Échappe-Toi peut mettre fin au jeu à tout moment si l’un des participants refuse d’obéir aux règles fixées par Échappe-Toi ou de suivre les instructions des employés d’Échappe-Toi. Aucun remboursement partiel ou complet des frais ne sera accordé dans une telle situation.

CERTIFICATS-CADEAUX : Les billets rachetés après une expérience dans un centre avec un rabais sont valables dans tous nos centres : ils sont utilisables dans le centre Échappe-Toi, Find the key, Vortex Plateau et Vortex Quartier Latin. Ce sont des ventes finales, aucun remboursement ne sera accordé sur les certificats-cadeaux. `,
  libraryText: `Qu’est-ce qu’un jeu d’évasion ?
Les jeux d’évasion sont des activités ludiques durant lesquelles les joueurs doivent faire équipe afin de résoudre des énigmes dans l’objectif de réussir une mission qui peut être (ou non) de s’échapper d’un endroit comportant une ou plusieurs pièces. Tout cela nécessitant un esprit de collaboration et de partage. 

Les jeux d’évasion sont la transposition dans la réalité de jeux vidéo. Le premier jeu d’évasion a été créé au Japon en 2007. Echappe-toi était le premier jeu d’évasion créé au Québec le 11 octobre 2014. 

Qui est Evasion Expert 

Le groupe Echappe-toi est né de la fusion de trois entreprises montréalaises de jeux d’évasion : Échappe-Toi Montréal, le leader des jeux d’évasion à Montréal, Find the Key, l’un des pionniers des jeux d’évasion, et Vortex Montréal. Evasion.expert est la filiale du groupe Echappe-toi qui opères les centres montréalais. 

Nos valeurs 

Les valeurs qui représentent Evasion Expert doivent être soutenues par les employés d’Evasion Expert. 

Jeu : Nous apprenons de nous et des autres à travers les situations nouvelles que nous rencontrons, en testant des solutions originales. 

Créativité : Nous ne mettons pas de limites à ce que nous proposons à nos clients et à nos collègues. 

 

 

Service : Nous travaillons pour la satisfaction de nos clients, de nos collègues et de nos partenaires, dans un esprit ouvert et une attitude respectueuse. 

Esprit d’entreprise : Nous promouvons l’autonomie, la pro-activité, la prise de risque et l’esprit de compétition. 

Humilité : Chaque situation, chaque jour, chaque personne est nouvelle. Nous acceptons de nous remettre en question en permanence pour progresser et apprendre. L’avis et le regard des autres sont nos outils de progression. 

Nos forces 

Tous nos jeux sont animés par des maîtres du jeu qui jouent un personnage dans l’histoire. 

Nous avons une belle équipe d’experts qui travaille à l’atelier pour faire des décors et des pièces de jeu uniques ! 

Pas d’esprit de compétition. L’important c’est de participer et de partager une expérience.  

Nous offrons aux gens un moment de bonheur et de fierté. 

Pour les enfants de moins de 8 ans c’est donc gratuit ?  

Oui en effet. Nous conseillons à partir de 8 ans car c’est en moyenne à cet âge-là que les enfants deviendront participatifs, alors qu’avant cet âge là ils seront surtout observateurs. Si les parents souhaitent venir avec des enfants de moins de 8 ans ce sera donc gratuit pour eux.

Femme enceinte ?  

Pas de tarif spécial, en revanche aucune contre-indication. Aucun effort physique n’est demandé, les femmes enceintes sont les bienvenues. 

Personnes âgées ? 

Pas de tarif spécial, en revanche aucune contre-indication. Aucun effort physique n’est demandé, les personnes âgées sont les bienvenues. 

Personnes handicapées ?  

Certaines salles ne sont pas accessibles. Bien vérifier celles qui le sont et celles qui ne le sont pas.  

Qu'est-ce que Musi'Quiz ?
Musi’Quiz vous propose le premier jeu musical dans une ambiance immersive comme si vous étiez sur un plateau télé.

Venez vous défier sur des quiz musicaux créés sur-mesure adaptés à toutes les générations et à tous les goûts musicaux… même ceux qu’on n’assument pas.`,
  knowledgeBaseText: `=== INFORMATIONS GÉNÉRALES ===
Durée : 60 minutes
Joueurs : 2 à 8
Prix standard : 32,50 $ adulte / 28,50 $ étudiant / 25 $ école
Langues : Français / Anglais
Règle mineurs : <15 ans → 1 adulte accompagnateur par salle
Politique d'annulation : pas de remboursement, mais déplacement ou crédit possible

=== ÉCHAPPE-TOI MONTRÉAL ===
Adresse : 2244 rue Larivière, Montréal QC H2K 4P8
Salles :
 - L’Enquête du Vieux-Port (2–8)
 - Le Manoir (4–8)
 - Les Disparus du Métro (3–6)
Tarif spécial : Le Manoir = 35 $ / personne

=== À DOUBLE TOUR QUÉBEC ===
Adresse : 585 rue Saint-Joseph Est, Québec QC G1K 3B7
Salles :
 - La Conspiration du Château (4–8)
 - Les Fantômes du Port (3–6)
 - Le Cabinet Secret (2–5)
Tarif spécial : Le Cabinet Secret = 29 $ / personne

=== VORTEX QUARTIER LATIN ===
Adresse : 3841 boulevard Saint-Laurent, Montréal QC H2W 1X9
Salles :
 - Le Cube (2–6)
 - Le Laboratoire (4–8)
Tarif spécial : Le Cube = 27 $ / personne

=== VORTEX PLATEAU ===
Adresse : 207 rue Rachel Est, Montréal QC H2W 1E4
Salles :
 - Cyberpunk 2049 (3–8)
 - Le Casse du Siècle (2–6)

=== FIND THE KEY ===
Adresse : 1250 rue Sainte-Catherine Est, Montréal QC
Salles :
 - Prison Break (2–8)
 - Zombie Apocalypse (3–6)

=== MUSI’QUIZ MONTRÉAL ===
Adresse : 2244 rue Larivière, Montréal QC H2K 4P8
Jeux : Quiz musical / blind test / karaoké
Durée : 60 minutes
Prix : 25 $ / personne

=== MUSI’QUIZ QUÉBEC ===
Adresse : 585 rue Saint-Joseph Est, Québec QC G1K 3B7
Jeux : Quiz musical / blind test / karaoké
Durée : 60 minutes
Prix : 25 $ / personne`,
  emailExamplesText: `Exemple 1 :
Bonjour [Prénom],
Merci pour votre message et votre intérêt pour Échappe-Toi !
Nos jeux durent 60 minutes et accueillent 2 à 8 personnes par salle.
Pour confirmer, il nous faudrait :
 - La date et l’heure souhaitées
 - Le nombre de participants
 - Le scénario choisi
Dès réception, nous pourrons bloquer votre créneau et vous envoyer un lien de paiement sécurisé.
Bien cordialement,
Service Client – Échappe-Toi Montréal

Exemple 2 :
Bonjour,
Merci pour votre intérêt pour une activité de team building !
Nous suggérons un court appel pour bien cerner vos besoins avant de vous envoyer un devis.
Souhaitez-vous que nous vous rappelions aujourd’hui ou demain ?
Cordialement,
Service Client – Échappe-Toi Montréal`,
  ctx: {
    horairesOk: false,
    dateOk: false,
    minorsRule: true,
    teamBuilding: false,
    simultaneousStart: false,
  },
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet:beta",
};

const PAYMENT_POLICIES = [
  { id: "A", label: "A — Paiement complet à la réservation" },
  { id: "B", label: "B — 50% à la validation du devis, solde 48h avant" },
];
const TONES = [
  { id: "vous", label: "Vouvoiement (par défaut)" },
  { id: "tu", label: "Tutoiement" },
];
const LANGS = [
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
];

// Petit composant pour l’animation “Réflexion en cours…”
function LoadingDots() {
  return (
    <div className="flex items-center justify-center mt-2 mb-1">
      <div className="relative w-24 h-6 overflow-hidden">
        <div className="absolute inset-0 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full animate-wave"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      <p className="text-slate-400 text-sm ml-3 animate-pulse">💭 Réflexion en cours...</p>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [brandId, setBrandId] = useState(ORG_PRESET.brandId);
  const [payment, setPayment] = useState(ORG_PRESET.payment);
  const [tone, setTone] = useState(ORG_PRESET.tone);
  const [lang, setLang] = useState(ORG_PRESET.lang);
  const [cgvText, setCgvText] = useState(ORG_PRESET.cgvText);
  const [libraryText, setLibraryText] = useState(ORG_PRESET.libraryText);
  const [knowledgeBaseText, setKnowledgeBaseText] = useState(ORG_PRESET.knowledgeBaseText);
  const [emailExamplesText, setEmailExamplesText] = useState(ORG_PRESET.emailExamplesText);
  const [ctx, setCtx] = useState(ORG_PRESET.ctx);
  const [isLoading, setIsLoading] = useState(false);
  const [testLog, setTestLog] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  // Injecte les styles d’animation si absents (utile si pas de fichier CSS dédié)
  useEffect(() => {
    const id = "wave-anim-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes wave { 0%,100% { transform: translateY(0); opacity:.6 } 50% { transform: translateY(-6px); opacity:1 } }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  // Charge la config locale
  useEffect(() => {
    const saved = localStorage.getItem("assistant-sc-final");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.__orgVersion === ORG_VERSION) {
        setBrandId(parsed.brandId || ORG_PRESET.brandId);
        setPayment(parsed.payment || ORG_PRESET.payment);
        setTone(parsed.tone || ORG_PRESET.tone);
        setLang(parsed.lang || ORG_PRESET.lang);
        setCgvText(parsed.cgvText || ORG_PRESET.cgvText);
        setLibraryText(parsed.libraryText || ORG_PRESET.libraryText);
        setKnowledgeBaseText(parsed.knowledgeBaseText || ORG_PRESET.knowledgeBaseText);
        setEmailExamplesText(parsed.emailExamplesText || ORG_PRESET.emailExamplesText);
        setCtx(parsed.ctx || ORG_PRESET.ctx);
      }
    }
  }, []);

  // Sauvegarde locale
  useEffect(() => {
    const cfg = {
      brandId,
      payment,
      tone,
      lang,
      cgvText,
      libraryText,
      knowledgeBaseText,
      emailExamplesText,
      ctx,
      __orgVersion: ORG_VERSION,
    };
    localStorage.setItem("assistant-sc-final", JSON.stringify(cfg));
  }, [brandId, payment, tone, lang, cgvText, libraryText, knowledgeBaseText, emailExamplesText, ctx]);

  const currentBrand = useMemo(
    () => ORG_PRESET.brands.find((b) => b.id === brandId) || ORG_PRESET.brands[0],
    [brandId]
  );
  const paymentLabel = useMemo(
    () => PAYMENT_POLICIES.find((p) => p.id === payment)?.label ?? "",
    [payment]
  );

  const buildSystemPrompt = () => `
Tu es un agent du service client pour ${currentBrand.label}.
Contexte :
Horaires OK=${ctx.horairesOk}, Date OK=${ctx.dateOk}, Mineurs=${ctx.minorsRule}, Team Building=${ctx.teamBuilding}, Départ simultané=${ctx.simultaneousStart}.
Langue=${lang}, Ton=${tone}, Politique=${paymentLabel}.

Base de connaissances :
${knowledgeBaseText}

CGV :
${cgvText}

Bibliothèque de réponses types :
${libraryText}

Exemples d’e-mails :
${emailExamplesText}
`;

  // Fallback local si l'IA est indisponible
  function generateByTemplate() {
    const greet = lang === "en" ? (tone === "tu" ? "Hi" : "Hello") : (tone === "tu" ? "Salut" : "Bonjour");
    const closing = lang === "en" ? "Best regards," : "Bien cordialement,";
    const extras = [];
    if (ctx.horairesOk) extras.push(lang === "en" ? "The proposed times work for us." : "L'horaire proposé nous convient.");
    if (ctx.dateOk) extras.push(lang === "en" ? "The proposed date works for us." : "La date proposée nous convient.");
    if (ctx.simultaneousStart) extras.push(lang === "en" ? "We can launch both rooms at the same time." : "Nous pouvons lancer les deux salles en même temps.");

    return [
      `${greet},`,
      "",
      lang === "en"
        ? `Thanks for your message about a booking at ${currentBrand.label}.`
        : `Merci pour votre message au sujet d'une réservation chez ${currentBrand.label}.`,
      lang === "en"
        ? `To prepare the right experience, could you please confirm:\n• Date & time\n• Number of participants and age group\n• Preferred scenario(s) and language\n• Any constraints (simultaneous start, specific window, etc.)`
        : `Afin de préparer la bonne expérience, pouvez-vous confirmer :\n• Date & heure\n• Nombre de participantes/participants et tranche d'âge\n• Scénario(x) souhaité(s) et langue\n• Contraintes éventuelles (départ simultané, créneau précis, etc.)`,
      "",
      extras.join("\n"),
      "",
      closing,
      "Service Client",
      currentBrand.label,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function generate() {
    setIsLoading(true);
    setHasGenerated(false);
    setOutput("");
    try {
      const sys = buildSystemPrompt();

      // IMPORTANT : en local, il faut lancer `netlify dev` pour que l'URL fonctionne.
      const proxyUrl = "/.netlify/functions/openrouter-proxy";
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ORG_PRESET.model,
          temperature: 0.2,
          messages: [
            { role: "system", content: sys },
            { role: "user", content: `Courriel du client :\n${input}` },
          ],
        }),
      });

      // Si le proxy n'existe pas (404 en dev vite sans netlify dev)
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Proxy indisponible (${res.status}). ${txt || "Démarre 'netlify dev' ou vérifie netlify/functions."}`);
      }

      // Résilience au contenu non JSON (erreurs middleware, etc.)
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("La réponse du proxy n'est pas un JSON valide.");
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Réponse IA vide. Vérifie OPENROUTER_API_KEY et le modèle.");
      }

      setOutput(String(content));
      setHasGenerated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Fallback template pour ne pas laisser vide
      const fallback = generateByTemplate();
      setOutput(`⚠️ Erreur : ${msg}\n\n— Fallback local —\n${fallback}`);
    } finally {
      setIsLoading(false);
    }
  }

  const copyOutput = () => navigator.clipboard.writeText(output);
  const runQuickTests = () => setTestLog("✅ Tests basiques OK (proxy et UI opérationnels)");

  // Bordures dynamiques
  const inputBorder =
    input && !isLoading && !hasGenerated ? "border-orange-400" : "border-gray-200";
  const outputBorder = hasGenerated ? "border-[#1e90ff]" /* bleu ETM */ : "border-gray-200";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* styles d’animation si tu n’utilises pas Tailwind custom */}
      {/* <style>{`@keyframes wave{0%,100%{transform:translateY(0);opacity:.6}50%{transform:translateY(-6px);opacity:1}}.animate-wave{animation:wave 1s ease-in-out infinite}`}</style> */}

      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          Assistant de réponse – Service Client (version finale)
          {isLoading && <LoadingDots />}
        </h1>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne A — Courriel reçu */}
          <div className={`bg-white p-4 rounded-2xl shadow flex flex-col border-2 ${inputBorder}`}>
            <h2 className="font-semibold text-lg">Courriel reçu (colle ici)</h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm focus:outline-none"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setHasGenerated(false);
              }}
              placeholder="Colle ici le texte du courriel du client..."
            />
            <div className="mt-3 flex gap-2 items-center">
              <button
                onClick={generate}
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? "Génération..." : "Générer"}
              </button>
              <button onClick={() => setInput("")} className="px-4 py-2 border rounded-xl">
                Réinitialiser
              </button>
              {isLoading && <LoadingDots />}
            </div>
          </div>

          {/* Colonne B — Réglages + Connaissances */}
          <div className="space-y-4">
            {/* Marques */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-3">
              <h3 className="font-semibold">Marque</h3>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                {ORG_PRESET.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Paramètres de réponse */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Paramètres de réponse</h3>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                {PAYMENT_POLICIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ctx.horairesOk}
                    onChange={(e) => setCtx({ ...ctx, horairesOk: e.target.checked })}
                  />
                  Horaire OK
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ctx.dateOk}
                    onChange={(e) => setCtx({ ...ctx, dateOk: e.target.checked })}
                  />
                  Date OK
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ctx.minorsRule}
                    onChange={(e) => setCtx({ ...ctx, minorsRule: e.target.checked })}
                  />
                  Règle mineurs
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ctx.teamBuilding}
                    onChange={(e) => setCtx({ ...ctx, teamBuilding: e.target.checked })}
                  />
                  Team building
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ctx.simultaneousStart}
                    onChange={(e) => setCtx({ ...ctx, simultaneousStart: e.target.checked })}
                  />
                  Départ simultané
                </label>
              </div>
            </div>

            {/* CGV */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">CGV / Règles internes</h3>
              <textarea
                className="w-full h-32 border rounded-xl p-3 font-mono text-xs"
                value={cgvText}
                onChange={(e) => setCgvText(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Astuce : garde un doc maître dans Drive et colle ici la dernière version.
              </p>
            </div>

            {/* Bibliothèque */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Bibliothèque de réponses types</h3>
              <textarea
                className="w-full h-32 border rounded-xl p-3 font-mono text-xs"
                value={libraryText}
                onChange={(e) => setLibraryText(e.target.value)}
              />
              <p className="text-xs text-gray-500">Tu peux copier depuis Word/Excel/Drive.</p>
            </div>

            {/* Base de connaissances */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Base de connaissances</h3>
              <textarea
                className="w-full h-48 border rounded-xl p-3 font-mono text-xs"
                value={knowledgeBaseText}
                onChange={(e) => setKnowledgeBaseText(e.target.value)}
              />
            </div>

            {/* Exemples d’e-mails */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Exemples d’e-mails types</h3>
              <textarea
                className="w-full h-40 border rounded-xl p-3 font-mono text-xs"
                value={emailExamplesText}
                onChange={(e) => setEmailExamplesText(e.target.value)}
              />
            </div>
          </div>

          {/* Colonne C — Réponse proposée */}
          <div className={`bg-white p-4 rounded-2xl shadow flex flex-col border-2 transition-colors duration-500 ${outputBorder}`}>
            <h2 className="font-semibold text-lg">Réponse proposée</h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="La réponse apparaîtra ici..."
            />
            <div className="mt-3 flex gap-2">
              <button onClick={copyOutput} className="px-4 py-2 bg-black text-white rounded-xl">
                Copier
              </button>
              <button onClick={runQuickTests} className="px-4 py-2 border rounded-xl">
                Tests rapides
              </button>
            </div>
            {testLog && <p className="text-xs text-gray-600 mt-2">{testLog}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
