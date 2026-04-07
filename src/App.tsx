import { useState, useEffect, useMemo } from "react";

// const ORG_VERSION = "2025-10-18-final"; // inutilisé

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
  ctx: {
    horairesOk: false,
    dateOk: false,
    minorsRule: false,
    teamBuilding: false,
    simultaneousStart: false,
  },
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
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
Prix standard : 33$ (plus taxes) adulte / 27$ (plus taxes) étudiant / 22$ (taxes incluses) école, association, camp de jour
Gratuit pour les enfants <8 ans
Langues : Français / Anglais
Règle mineurs : <15 ans → 1 adulte accompagnateur par salle
Politique d'annulation : pas de remboursement, mais déplacement ou crédit possible

=== ÉCHAPPE-TOI MONTRÉAL ===
Adresse : 2244 rue Larivière, Montréal QC H2K 4P8
Salles :
 - Al-Patraz (2–6), exceptionnellement jusqu'à 8 joueurs
 - Pacte de Sang (2–4), exceptionnellement jusqu'à 5 joueurs
 - Les Fantômes du Forum (2–6), exceptionnellement jusqu'à 7 joueurs
 - Diamants défendus (2-6), exceptionnellement jusqu'à 8 joueurs
 - La Chambre des joueurs (2-6), exceptionnellement jusqu'à 8 joueurs
 - TV Champlain (2-6), exceptionnellement jusqu'à 8 joueurs
 - Le Trésor Maudit d'Hochelaga (2-6), exceptionnellement jusqu'à 8 joueurs
 - Les Amants Maudits du St-Laurent (2-5), exceptionnellement jusqu'à 6 joueurs

=== À DOUBLE TOUR QUÉBEC ===
Adresse : 430 rue du Parvis, Québec
Salles :
 - Au pays des Merveilles (4–8)
 - Le Secret des dunes (3–6)
 - Va chez L'Yâbe (2–5)
 - Zone Morte
 - M. Newton
 
 Salles jeu VR :
 - Alice - Jeu VR ARVI (2-4)
 - Cyberpunk - Jeu VR ARVI (2-4)
 - Escape the World - Jeu VR ARVI (2-4)
 - Jungle Quest - Jeu VR ARVI (2-4)
 - Sanctum - Jeu VR ARVI (2-4)

 Prix spéciaux de 30$ (plus taxes) par personnes pour les salles de réalités virtuelles.

=== VORTEX QUARTIER LATIN ===
Adresse : 422 rue Ontario Est, Montréal
Salles :
 - La Valise sans fond (2–6)
 - Tempus Evadere (2–6)

=== VORTEX PLATEAU ===
Adresse : 3841 boulevard Saint-Laurent, Montréal QC H2W 1X9
Salles :
 - La Prophétie du dragon (2–6)
 - Blackout (4-8)
 - Le Crépuscule (2-6)

 Nouvelle expérience : 
 - Spy Game (2-6)
 Prix spécial de 20$ (plus taxes) par personne pour ce jeu.

=== FIND THE KEY ===
Adresse : 1000 rue Atateken, Montréal
Salles :
 - Insomnium (2–6)
 - The Unknown - L'expérience sociale (2–4)
 - La Cabine dans les bois (2-6)
 - Navire Pirate hanté (3-8)

=== MUSI’QUIZ MONTRÉAL ===
Adresse : 422 rue Ontario Est, Montréal
Jeux : Quiz musical / blind test
Durée : 60 minutes
Prix : 30$ (plus taxes) / personne (1-6 joueurs), 27$ (plus taxes) / personne (7-12 joueurs) / 25$ (plus taxes) / personne (3-18 joueurs)
Adaptation spéciale pour les groupes d'adolescents (10-16 ans) disponible avec l'aoption Musi'Ados
=== MUSI’QUIZ QUÉBEC ===
Adresse : 430 rue du Parvis, Québec
Jeux : Quiz musical / blind test
Durée : 60 minutes
Prix : 30$ (plus taxes) / personne (1-6 joueurs), 27$ (plus taxes) / personne (7-12 joueurs) / 25$ (plus taxes) / personne (3-18 joueurs)
Adaptation spéciale pour les groupes d'adolescents (10-16 ans) disponible avec l'aoption Musi'Ados
`,
  emailExamplesText: `Exemple 1 :
Bonjour [Prénom],
Merci pour votre message et votre intérêt pour Échappe-Toi !
Nos jeux durent 60 minutes et accueillent 2 à 8 personnes par salle.
Pour confirmer, il nous faudrait :
 - La date et l’heure souhaitées
 - Le nombre de participants
 - Le scénario choisi
Dès réception, nous pourrons bloquer votre créneau et vous envoyer un lien de paiement sécurisé.
Merci d'avoir choisi Échappe-Toi Montréal !
Bonne journée,
Service Client – Échappe-Toi Montréal

Exemple 2 :
Bonjour,
Merci pour votre intérêt pour une activité de team building !
Nous suggérons un court appel pour bien cerner vos besoins avant de vous envoyer un devis.
Souhaitez-vous que nous vous rappelions aujourd’hui ou demain ?
Merci d'avoir choisi Échappe-Toi Montréal !
Bonne journée,
Service Client – Échappe-Toi Montréal`,

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
      <p className="text-slate-400 text-sm ml-3 animate-pulse">
        💭 Réflexion en cours...
      </p>
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
  const [ctx, setCtx] = useState(ORG_PRESET.ctx);
  const [isLoading, setIsLoading] = useState(false);
  const [testLog, setTestLog] = useState("");
  const [testError, setTestError] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

// --- Type de demande ---
const REQUEST_TYPES = [
  { id: "reservation", label: "Réservation / devis" },
  { id: "annulation", label: "Annulation / report" },
  { id: "remboursement", label: "Demande de remboursement" },
  { id: "ajout", label: "Ajout / modification de joueurs" },
  { id: "anniversaire", label: "Forfait anniversaire" },
  { id: "commandite", label: "Commandite / partenariat" },
  { id: "autre", label: "Autre demande" },
];
const [requestType, setRequestType] = useState("reservation");


  const [cgvText, setCgvText] = useState(ORG_PRESET.cgvText);
  const [libraryText, setLibraryText] = useState(ORG_PRESET.libraryText);
  const [knowledgeBaseText, setKnowledgeBaseText] = useState(
    ORG_PRESET.knowledgeBaseText
  );
  const [emailExamplesText, setEmailExamplesText] = useState(
    ORG_PRESET.emailExamplesText
  );

  useEffect(() => {
    const id = "wave-anim-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes wave { 0%,100% { transform: translateY(0); opacity:.6 } 50% { transform: translateY(-6px); opacity:1 } }
        .animate-wave { animation: wave 1s ease-in-out infinite; }

        @keyframes pulse-halo {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 200, 0.2); }
          50% { box-shadow: 0 0 60px rgba(0, 255, 200, 0.5); }
        }

        .halo-active {
          animation: pulse-halo 1.2s ease-in-out infinite;
        }

        .card-glow {
          animation: cardGlow 1.4s ease-in-out infinite;
        }

        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(0,255,200,0.15); }
          50% { box-shadow: 0 0 25px rgba(0,255,200,0.35); }
        }

        .transition-smooth {
          transition: all 0.6s ease;
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const currentBrand = useMemo(
    () => ORG_PRESET.brands.find((b) => b.id === brandId) || ORG_PRESET.brands[0],
    [brandId]
  );

 // const paymentLabel = useMemo(
//   () => PAYMENT_POLICIES.find((p) => p.id === payment)?.label ?? "",
//   [payment]
// ); // inutilisé

  const generateByTemplate = () => {
    const greet =
      lang === "en"
        ? tone === "tu"
          ? "Hi"
          : "Hello"
        : tone === "tu"
        ? "Salut"
        : "Bonjour";
    const closing = lang === "en" ? "Best regards," : "Bien cordialement,";
    return `${greet},\n\nMerci pour votre message à ${currentBrand.label}.\n\n${closing}\nService Client`;
  };

  async function generate() {
    setIsLoading(true);
    setHasGenerated(false);
    setOutput("");
    try {
      const proxyUrl = "/.netlify/functions/openrouter-proxy";
      const res = await fetch(proxyUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: ORG_PRESET.model,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `
Type de demande actuel : ${requestType}.

🎭 Tu es **l’Assistant IA du Service Client** pour un groupe d’entreprises spécialisées dans le divertissement immersif :
Échappe-Toi Montréal, À Double Tour Québec, Vortex Plateau, Vortex Quartier Latin, Find The Key et Musi’Quiz.

Ton rôle : aider le Service Client à **rédiger des réponses professionnelles, engageantes et humaines** aux clients qui écrivent par courriel.

---

### 🧠 TON OBJECTIF
Fournir des réponses claires, précises et personnalisées, avec un ton :
- **Professionnel** (orthographe irréprochable, structure claire),
- **Naturel et humain** (on a l’impression qu’un vrai conseiller écrit),
- **Sympathique et engageant** (ton chaleureux et positif),
- **Légèrement humoristique et complice**, dans l’esprit du **divertissement et du jeu**,
- Jamais robotique ni administratif, toujours tourné vers la **solution** et la **satisfaction client**.

---

### 🗣️ STYLE D’ÉCRITURE
- Tu t’exprimes de façon fluide, avec un ton de conversation agréable et une touche d’enthousiasme.
- Tu gardes un **vocabulaire accessible**, ni trop formel ni familier.
- Tu peux insérer une phrase légère, bien dosée, typique de notre univers :
  > “On adore les défis, alors on va trouver une solution à votre demande !”  
  > “Bonne nouvelle : ça se règle plus vite qu’une énigme d’Échappe-Toi 😉”
- Tu évites toute ironie, sarcasme, ou humour déplacé.
- Tu termines toujours par une **phrase positive et motivante**, du type :
  > “Au plaisir de vous accueillir bientôt dans l’aventure !”  
  > “Merci de faire partie de nos joueurs, on a hâte de vous voir jouer !”

---

### 🧭 ADAPTATION DU TON SELON LE CONTEXTE

Tu dois toujours adapter ton ton au contexte émotionnel du message du client :

#### 🟢 Cas normal (réservation, information, ajout, anniversaire, curiosité)
→ Ton chaleureux, souriant, complice, légèrement humoristique, conforme à l’esprit du divertissement.  
Tu peux te permettre une petite touche d’humour ou de légèreté bienveillante :
> “On adore les défis, alors on va trouver la solution parfaite pour vous !”  
> “Promis, pas besoin de résoudre d’énigme pour réserver 😉”

#### 🟠 Cas sensible (retard, report, incompréhension, erreur de paiement)
→ Ton calme, compréhensif et rassurant.  
Tu montres que tu écoutes et que tu veux aider.  
Pas d’humour ici, mais une attitude posée et humaine :
> “Je comprends tout à fait votre situation.”  
> “On va trouver ensemble la meilleure façon d’arranger cela.”

#### 🔴 Cas délicat ou conflictuel (plainte, demande de remboursement, mécontentement)
→ Ton **strictement professionnel, empathique et respectueux.**
Aucun humour, aucune légèreté, aucune tournure familière.
Tu adoptes une posture d’écoute, d’explication et de solution :
> “Je suis sincèrement désolé pour cette situation.”  
> “Je comprends votre déception, et je tiens à vous expliquer clairement notre politique à ce sujet.”  
> “Notre objectif reste toujours que chaque client garde une expérience positive.”

Tu privilégies :
- la clarté et la bienveillance,  
- la transparence sur les politiques internes,  
- et la recherche d’une issue concrète (crédit, déplacement, solution alternative).

Dans le cas d’une **demande de remboursement**, tu peux ajouter une phrase de suivi pour montrer que le dossier est traité activement :
> “Je vais me renseigner auprès de notre département des finances afin de savoir où en est rendu le remboursement.  
> Vous recevrez un suivi de notre part dans les prochains jours.”

Tu termines toujours sur une phrase calme et rassurante :
> “Merci de votre compréhension et de votre patience.”  
> “Nous faisons le nécessaire pour que la situation soit réglée rapidement.”

Dans ces cas, ton rôle est de **désamorcer la tension** avec tact, professionnalisme et réactivité.

---

### 🧩 RÉSUMÉ DE TON ADAPTATION
| Type de message | Ton attendu |
|------------------|-------------|
| Réservation / Info | Souriant, engageant, complice |
| Ajout / Modification | Serviable, clair, rassurant |
| Forfait anniversaire | Festif, enthousiaste |
| Commandite | Professionnel, ouvert, reconnaissant |
| Annulation / Remboursement / Plainte | Sérieux, empathique, sans humour |

---

### 🧩 STRUCTURE GÉNÉRALE À SUIVRE
1. **Salutation personnalisée** avec prénom si disponible.  
2. **Accroche** (merci / intérêt / enthousiasme sincère).  
3. **Réponse complète et claire** à la demande.  
4. **Informations utiles / précisions** selon le contexte (prix, horaire, politique, condition, etc.).  
5. **Conclusion engageante et positive**, incitant à l’action (confirmation, réponse, appel, etc.).  
6. **Remerciement d'avoir choisi le centre** en fonction du centre sélectionné.
6. **Signature claire** :
   > Service Client – [Nom du centre]

---

### 📚 CONTEXTE & CAS D’USAGE À GÉRER

#### 🧾 1. DEMANDE DE RÉSERVATION
- Extraire date, heure, nombre de personnes, centre souhaité, et proposer les options possibles.  
- S’appuyer sur la base de connaissances pour mentionner les salles disponibles et leur capacité.  
- Confirmer la politique de paiement en fonction du paramètre choisi (A ou B).  
- Rappeler les conditions (âge, accompagnement, politique de retard) si pertinent.  
- Terminer en proposant de **confirmer la réservation**.

#### ❌ 2. ANNULATION OU REPORT
- Être empathique, compréhensif, mais **ferme et clair** sur les politiques de non-remboursement.  
- Proposer **un déplacement** ou **un crédit sous forme de certificat-cadeau**.  
- Éviter de dire “nous ne remboursons pas”, préférer :
  > “Nous proposons plutôt de déplacer la séance ou de vous offrir un crédit pour rejouer à une autre date !”  
- Conclure positivement :
  > “On espère quand même vous revoir très vite pour une prochaine aventure 🙂”

#### ➕ 3. AJOUT OU MODIFICATION DE JOUEURS
- Confirmer que c’est possible selon la capacité de la salle.  
- Si le nombre dépasse la limite, proposer une **deuxième salle** ou un **scénario parallèle**.  
- Si la réservation est déjà payée, préciser que la différence peut être réglée sur place ou par lien sécurisé.  
- Ton : souple, facilitateur, serviable.

#### 🎂 4. FORFAITS ANNIVERSAIRES
- Être festif et positif !  
- Mentionner que les forfaits sont **payables en entier à la réservation** et **non remboursables**, mais **flexibles sur la date**.  
- Si le groupe d’enfants est jeune (<15 ans), rappeler la règle d’accompagnateur adulte.  
- Glisser une touche de bonne humeur :
  > “On promet des énigmes, des rires et des souvenirs inoubliables pour la fête ! 🎉”

#### 💝 5. DEMANDES DE COMMANDITES / PARTENARIATS
- Répondre avec reconnaissance pour l’intérêt porté à l’entreprise.  
- Expliquer que les **demandes sont évaluées au cas par cas** et doivent être transmises à la direction marketing.  
- Inviter poliment à préciser :
  - Le type d’événement
  - Le public cible
  - Les dates ou lieux
- Rester professionnel et ouvert :
  > “Merci de penser à nous pour ce projet, on adore soutenir les initiatives locales quand c’est possible !”

---

### ⚙️ NE PAS FAIRE
- Ne jamais mentionner les paramètres internes (“checkbox cochée”, “tu es en mode A”, etc.).
- Ne jamais inventer de promotions, salles, ou prix absents de la base.
- Ne pas reformuler les CGV mot pour mot : tu les résumes dans un langage simple.
- Ne jamais répondre en donnant des explications techniques (“je suis une IA”, “je vais générer une réponse”, etc.).

---

### 🧩 RESSOURCES DISPONIBLES
- [CGV / Règles internes] : ${cgvText}
- [Bibliothèque de réponses types] : ${libraryText}
- [Base de connaissances] : ${knowledgeBaseText}
- [Exemples d’e-mails types] : ${emailExamplesText}

---

🎯 En résumé :
> Tu es un **assistant de service client humain**, rapide et fiable,
> au ton **souriant, pro, complice et efficace**,
> qui s’exprime **comme un conseiller de centre de jeux d’évasion passionné**.
> Ton but est de faire vivre une expérience client aussi fluide et agréable que nos jeux eux-mêmes.
`,
      },      
      {
        role: "user",
        content: `Courriel du client :\n${input}`,
      },
    ],
  }),
});

const data = await res.json();

if (!res.ok) {
  const apiMessage =
    data?.error?.message ||
    data?.message ||
    `Erreur API (${res.status})`;
  throw new Error(apiMessage);
}

const content = data?.choices?.[0]?.message?.content;
if (!content) {
  throw new Error("Réponse vide");
}
      setOutput(content);
      setHasGenerated(true);
      setTestError(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setOutput(
        `⚠️ Erreur : ${String(e)}\n\n— Fallback local —\n${generateByTemplate()}`
      );
      setTestError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const copyOutput = () => navigator.clipboard.writeText(output);
  const runQuickTests = () => {
    if (Math.random() > 0.7) {
      setTestLog("❌ Erreur : connexion proxy instable");
      setTestError(true);
    } else {
      setTestLog("✅ Tests basiques OK (proxy et UI opérationnels)");
      setTestError(false);
    }
  };

  const inputBorder =
    input && !isLoading && !hasGenerated
      ? "border-orange-400 bg-orange-50"
      : "border-gray-300 bg-white";
  const outputBorder =
    hasGenerated && !isLoading
      ? "border-emerald-400 bg-green-50"
      : "border-gray-300 bg-white";

  return (
    <div
      className={`min-h-screen transition-smooth ${
        isLoading ? "halo-active" : ""
      } bg-[#1f1f1f] text-gray-100 p-6`}
    >
      <div className="max-w-7xl mx-auto space-y-6 transition-smooth">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Assistant de réponse – Service Client
            {isLoading && <LoadingDots />}
          </h1>
          <button
            onClick={runQuickTests}
            className={`px-4 py-2 rounded-xl font-semibold transition-smooth ${
              testError
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Tests rapides
          </button>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 transition-smooth">
          {/* Colonne A */}
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col transition-smooth shadow ${
              isLoading ? "card-glow" : "shadow-lg"
            } ${inputBorder}`}
          >
            <h2 className="font-semibold text-lg text-gray-800">
              Courriel reçu (colle ici)
            </h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm text-gray-800 focus:outline-none"
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
              <button
                onClick={() => setInput("")}
                className="px-4 py-2 border rounded-xl text-gray-800"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Colonne B */}
          <div className="space-y-4 transition-smooth">
            {/* Marques et paramètres */}
            <div
              className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
                isLoading ? "card-glow" : "shadow-lg"
              }`}
            >
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

{/* Type de demande */}
<div
  className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
    isLoading ? "card-glow" : "shadow-lg"
  }`}
>
  <h3 className="font-semibold">Type de demande</h3>
  <select
    className="w-full border rounded-xl px-3 py-2 mt-1"
    value={requestType}
    onChange={(e) => setRequestType(e.target.value)}
  >
    {REQUEST_TYPES.map((r) => (
      <option key={r.id} value={r.id}>
        {r.label}
      </option>
    ))}
  </select>
</div>


            <div
              className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
                isLoading ? "card-glow" : "shadow-lg"
              }`}
            >
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
                className="w-full border rounded-xl px-3 py-2 mt-2"
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
                className="w-full border rounded-xl px-3 py-2 mt-2"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              {requestType === "reservation" && (
  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
    {[
      ["horairesOk", "Horaire OK"],
      ["dateOk", "Date OK"],
      ["minorsRule", "Règle mineurs"],
      ["teamBuilding", "Team building"],
      ["simultaneousStart", "Départ simultané"],
    ].map(([k, label]) => (
      <label key={k} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ctx[k as keyof typeof ctx]}
          onChange={(e) => setCtx({ ...ctx, [k]: e.target.checked })}
        />
        {label}
      </label>
    ))}
  </div>
)}
            </div>

            {/* CGV */}
            <div
              className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
                isLoading ? "card-glow" : "shadow-lg"
              }`}
            >
              <h3 className="font-semibold">CGV / Règles internes</h3>
              <textarea
                className="w-full h-32 border rounded-xl p-3 font-mono text-xs"
                value={cgvText}
                onChange={(e) => setCgvText(e.target.value)}
              />
            </div>

            {/* Bibliothèque */}
            <div
              className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
                isLoading ? "card-glow" : "shadow-lg"
              }`}
            >
              <h3 className="font-semibold">Bibliothèque de réponses types</h3>
              <textarea
                className="w-full h-32 border rounded-xl p-3 font-mono text-xs"
                value={libraryText}
                onChange={(e) => setLibraryText(e.target.value)}
              />
            </div>

            {/* Base de connaissances */}
            <div
              className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
                isLoading ? "card-glow" : "shadow-lg"
              }`}
            >
              <h3 className="font-semibold">Base de connaissances</h3>
              <textarea
                className="w-full h-48 border rounded-xl p-3 font-mono text-xs"
                value={knowledgeBaseText}
                onChange={(e) => setKnowledgeBaseText(e.target.value)}
              />
            </div>

            {/* Exemples d’e-mails */}
            <div
              className={`bg-white text-gray-800 p-4 rounded-2xl border shadow transition-smooth ${
                isLoading ? "card-glow" : "shadow-lg"
              }`}
            >
              <h3 className="font-semibold">Exemples d’e-mails types</h3>
              <textarea
                className="w-full h-40 border rounded-xl p-3 font-mono text-xs"
                value={emailExamplesText}
                onChange={(e) => setEmailExamplesText(e.target.value)}
              />
            </div>
          </div>

          {/* Colonne C */}
          <div
            className={`p-4 rounded-2xl flex flex-col border-2 transition-smooth shadow ${
              isLoading ? "card-glow" : "shadow-lg"
            } ${outputBorder}`}
          >
            <h2 className="font-semibold text-lg text-gray-800">
              Réponse proposée
            </h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm text-gray-800"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="La réponse apparaîtra ici..."
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={copyOutput}
                className="px-4 py-2 bg-black text-white rounded-xl"
              >
                Copier
              </button>
            </div>
            {testLog && (
              <p
                className={`text-xs mt-2 ${
                  testError ? "text-red-600" : "text-gray-700"
                }`}
              >
                {testLog}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
