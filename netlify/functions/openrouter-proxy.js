import { useEffect, useMemo, useState } from "react";

/**
 * Assistant de réponse Service Client – v3.1
 * ✅ Base multi-centres
 * ✅ 5 cases à cocher contextuelles
 * ✅ Correction du parsing OpenRouter (404 / JSON vide)
 * ✅ Intégré avec ton proxy Netlify
 */

// ---------------- Types ----------------
type Brand = { id: string; label: string; email?: string; phone?: string; site?: string };
type Ctx = {
  horairesOk: boolean;
  dateOk: boolean;
  minorsRule: boolean;
  teamBuilding: boolean;
  simultaneousStart: boolean;
};

// --------- Version & preset d'équipe ---------
const ORG_VERSION = "2025-10-16.2";
const ORG_PRESET = {
  brands: [
    { id: "ETM", label: "Échappe-Toi Montréal", email: "info@echappetoi.com", phone: "514-907-2200", site: "https://echappetoi.com" },
    { id: "ADT", label: "À Double Tour Québec", email: "info@adoubletour.ca", phone: "418-555-0101", site: "https://adoubletour.ca" },
    { id: "VQL", label: "Vortex Quartier Latin (Montréal)", email: "info@vortex.com", phone: "514-555-0102", site: "https://vortex.com" },
    { id: "VPL", label: "Vortex Plateau", email: "info@vortexplateau.com", phone: "514-555-0103", site: "https://vortexplateau.com" },
    { id: "FTK", label: "Find The Key", email: "info@findthekey.ca", phone: "418-555-0104", site: "https://findthekey.ca" },
    { id: "MQM", label: "Musi'Quiz Montréal", email: "info@musiquiz.ca", phone: "514-555-0105", site: "https://musiquiz.ca" },
    { id: "MQQ", label: "Musi'Quiz Québec", email: "info@musiquiz.ca", phone: "418-555-0106", site: "https://musiquiz.ca" },
  ],
  brandId: "ETM",
  payment: "B",
  tone: "vous",
  lang: "fr",
  cgvText: [
    "• Réservations: confirmées après paiement (A: 100%, B: 50% + solde 48h).",
    "• Annulation par le client:",
    "  - >72h: remboursement intégral ou report gratuit.",
    "  - 72h→48h: frais 25%.",
    "  - <48h ou no-show: non remboursable.",
    "• Modifications: selon disponibilités.",
    "• Mineurs: <15 ans → 1 adulte jouant par salle obligatoire.",
    "• Retard: >10 min peut réduire le temps de jeu ou décaler l’activité.",
    "• Sécurité: respecter les consignes sur place; l’équipe peut interrompre en cas de non-respect.",
  ].join("\n"),
  libraryText: [
    "# Bibliothèque de réponses types",
    "## Devis entreprise",
    "Bonjour, merci pour votre demande. Pour un devis précis, pouvez-vous confirmer : date/heure, nombre de personnes, langue, scénario(s), besoin de départ simultané ?",
    "## Rappel mineurs",
    "Pour les <15 ans, un adulte doit jouer dans chaque salle.",
    "## Team building",
    "On peut faire un court appel (10 min) pour comprendre vos besoins avant de vous envoyer un devis.",
  ].join("\n\n"),
  knowledgeBaseText: [
    "=== INFORMATIONS GÉNÉRALES ===",
    "Durée : 60 minutes",
    "Joueurs : 2 à 8",
    "Prix standard : 32,50 $ adulte / 28,50 $ étudiant / 25 $ école",
    "Langues : Français / Anglais",
    "Règle mineurs : <15 ans → 1 adulte accompagnateur par salle",
    "Politique d'annulation : pas de remboursement, mais déplacement ou crédit possible",
    "",
    "=== ÉCHAPPE-TOI MONTRÉAL ===",
    "Adresse : 2244 rue Larivière, Montréal QC H2K 4P8",
    "Salles : L’Enquête du Vieux-Port, Le Manoir, Les Disparus du Métro",
    "Tarif spécial : Le Manoir = 35 $ / personne",
    "",
    "=== À DOUBLE TOUR QUÉBEC ===",
    "Adresse : 585 rue Saint-Joseph Est, Québec QC G1K 3B7",
    "Salles : La Conspiration du Château, Les Fantômes du Port, Le Cabinet Secret",
    "Tarif spécial : Le Cabinet Secret = 29 $ / personne",
    "",
    "=== VORTEX QUARTIER LATIN ===",
    "Adresse : 3841 boulevard Saint-Laurent, Montréal QC H2W 1X9",
    "Salles : Le Cube, Le Laboratoire",
    "Tarif spécial : Le Cube = 27 $ / personne",
    "",
    "=== VORTEX PLATEAU ===",
    "Adresse : 145 rue Rachel Est, Montréal QC H2W 1E1",
    "Salles : La Zone 51, Le Temple du Temps",
    "",
    "=== FIND THE KEY ===",
    "Adresse : 30 rue Saint-Pierre, Québec QC G1K 3Z2",
    "Salles : Le Musée, Le Train Fantôme",
    "",
    "=== MUSI'QUIZ MONTRÉAL ===",
    "Adresse : 120 rue Prince-Arthur, Montréal QC H2X 1B5",
    "Jeu musical interactif — 1h / 4 à 12 joueurs / tarif 30 $ / pers",
    "",
    "=== MUSI'QUIZ QUÉBEC ===",
    "Adresse : 800 boulevard Charest Est, Québec QC G1K 3J7",
    "Jeu musical interactif — 1h / 4 à 12 joueurs / tarif 30 $ / pers",
  ].join("\n"),
  emailExamplesText: [
    "Bonjour [Prénom],",
    "Merci pour votre message et votre intérêt pour notre centre ! Nos jeux durent 60 minutes et accueillent 2 à 8 joueurs par salle.",
    "Pour confirmer, il nous faudrait :",
    "- la date et l’heure souhaitées",
    "- le nombre de participantes/participants",
    "- le scénario choisi",
    "Dès réception, nous pourrons bloquer votre créneau et vous envoyer un lien de paiement sécurisé.",
    "Bien cordialement,",
    "Service Client",
  ].join("\n\n"),
  ctx: { horairesOk: false, dateOk: false, minorsRule: true, teamBuilding: false, simultaneousStart: false },
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet:beta",
};

// ---------------- Constantes UI ----------------
const CHECKBOXES = [
  { id: "horairesOk", label: "Horaire OK" },
  { id: "dateOk", label: "Date OK" },
  { id: "minorsRule", label: "Rappel règle mineurs" },
  { id: "teamBuilding", label: "Team Building" },
  { id: "simultaneousStart", label: "Départ simultané" },
];

// =====================================================
export default function EmailReplyAssistantV3() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [brands, setBrands] = useState<Brand[]>(ORG_PRESET.brands);
  const [brandId, setBrandId] = useState(ORG_PRESET.brandId);
  const [payment, setPayment] = useState(ORG_PRESET.payment);
  const [tone, setTone] = useState(ORG_PRESET.tone);
  const [lang, setLang] = useState(ORG_PRESET.lang);
  const [cgvText, setCgvText] = useState(ORG_PRESET.cgvText);
  const [libraryText, setLibraryText] = useState(ORG_PRESET.libraryText);
  const [knowledgeBaseText, setKnowledgeBaseText] = useState(ORG_PRESET.knowledgeBaseText);
  const [emailExamplesText, setEmailExamplesText] = useState(ORG_PRESET.emailExamplesText);
  const [ctx, setCtx] = useState<Ctx>(ORG_PRESET.ctx);
  const [provider, setProvider] = useState(ORG_PRESET.provider);
  const [model, setModel] = useState(ORG_PRESET.model);
  const [isLoading, setIsLoading] = useState(false);

  const currentBrand = useMemo(() => brands.find((b) => b.id === brandId) || brands[0], [brands, brandId]);

  // --- Génération du prompt IA ---
  function buildSystemPrompt() {
    const ctxFlags = Object.entries(ctx)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join(", ");
    return `You are a polite and concise French customer service email writer for escape rooms in Québec.
Centre: ${currentBrand.label}
Context flags: ${ctxFlags || "none"}
Knowledge base:
"""
${knowledgeBaseText}
"""
CGV:
"""
${cgvText}
"""
Email library:
"""
${libraryText}
"""
Examples:
"""
${emailExamplesText}
"""
Tone=${tone}, Lang=${lang}. Always respond naturally and professionally.`;
  }

  async function generate() {
    setIsLoading(true);
    setOutput("");
    try {
      const res = await fetch("/.netlify/functions/openrouter-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: `Client email:\n"""\n${input}\n"""` },
          ],
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Erreur proxy");
      const data = text ? JSON.parse(text) : null;
      const content = data?.choices?.[0]?.message?.content || "";
      setOutput(content.trim() || "⚠️ Réponse vide reçue.");
    } catch (e: any) {
      setOutput(`⚠️ Erreur : ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Rendu ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Assistant de réponse – Service Client (v3.1)</h1>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* A — Input */}
          <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
            <h2 className="font-semibold text-lg">Courriel reçu</h2>
            <select
              className="mt-2 border rounded-xl px-3 py-2"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Colle ici le message du client..."
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={generate}
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? "Génération..." : "Générer"}
              </button>
              <button
                onClick={() => setInput("")}
                className="px-4 py-2 border rounded-xl"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* B — Réglages */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Paramètres contextuels</h3>
              {CHECKBOXES.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ctx[c.id as keyof Ctx]}
                    onChange={(e) =>
                      setCtx((prev) => ({ ...prev, [c.id]: e.target.checked }))
                    }
                  />
                  {c.label}
                </label>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Base de connaissances</h3>
              <textarea
                className="w-full h-40 border rounded-xl p-3 font-mono text-xs"
                value={knowledgeBaseText}
                onChange={(e) => setKnowledgeBaseText(e.target.value)}
              />
            </div>

            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Exemples d’e-mails types</h3>
              <textarea
                className="w-full h-40 border rounded-xl p-3 font-mono text-xs"
                value={emailExamplesText}
                onChange={(e) => setEmailExamplesText(e.target.value)}
              />
            </div>
          </div>

          {/* C — Output */}
          <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
            <h2 className="font-semibold text-lg">Réponse proposée</h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="La réponse apparaîtra ici..."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
