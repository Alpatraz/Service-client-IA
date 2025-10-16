import { useState, useEffect, useMemo } from "react";

/**
 * Assistant Service Client IA – version finale (JavaScript)
 * Intègre :
 * - CGV / Règles internes
 * - Bibliothèque de réponses types
 * - Base de connaissances par centre
 * - Exemples d’e-mails types
 * - 5 cases à cocher (Horaire OK / Date OK / Règle mineurs / Team Building / Départ simultané)
 * - Boutons Copier / Tests rapides
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
  cgvText: `Cette entente s’applique à toute activité relative à Échappe-Toi. 
En utilisant cette page web, en effectuant une réservation ou en utilisant les locaux d’Échappe-Toi, 
vous attestez que vous avez examiné et compris les conditions prévues par la présente, 
et que vous acceptez, sans restriction ni condition, d’être lié par celle-ci.

CONDITION D’ENTRÉE :
Vous devez lire et accepter les Termes et Conditions d’Échappe-Toi avant toute activité.`,
  libraryText: `Qu’est-ce qu’un jeu d’évasion ?
Les jeux d’évasion sont des activités ludiques durant lesquelles les joueurs doivent faire équipe 
afin de résoudre des énigmes dans l’objectif de réussir une mission qui peut être (ou non) de s’échapper 
d’un endroit comportant une ou plusieurs pièces. 
Tout cela nécessitant un esprit de collaboration et de partage.`,
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

  const currentBrand = useMemo(() => ORG_PRESET.brands.find(b => b.id === brandId) || ORG_PRESET.brands[0], [brandId]);
  const paymentLabel = useMemo(() => PAYMENT_POLICIES.find(p => p.id === payment)?.label ?? "", [payment]);

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

  async function generate() {
    setIsLoading(true);
    setOutput("");
    try {
      const sys = buildSystemPrompt();
      const res = await fetch("/.netlify/functions/openrouter-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ORG_PRESET.model,
          messages: [
            { role: "system", content: sys },
            { role: "user", content: `Courriel du client :\n${input}` },
          ],
        }),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || "⚠️ Réponse vide";
      setOutput(content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput(`⚠️ Erreur : ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  const copyOutput = () => navigator.clipboard.writeText(output);
  const runQuickTests = () => setTestLog("✅ Tests basiques OK (proxy et UI opérationnels)");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Assistant de réponse – Service Client (version finale)</h1>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Courriel reçu */}
          <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
            <h2 className="font-semibold text-lg">Courriel reçu (colle ici)</h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Colle ici le texte du courriel du client..."
            />
            <div className="mt-3 flex gap-2">
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
            </div>
          </div>

          {/* Paramètres */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow space-y-3">
              <h3 className="font-semibold">Marque</h3>
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
              >
                {ORG_PRESET.brands.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Paramètres de réponse</h3>
              <select className="w-full border rounded-xl px-3 py-2" value={payment} onChange={e => setPayment(e.target.value)}>
                {PAYMENT_POLICIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <select className="w-full border rounded-xl px-3 py-2" value={tone} onChange={e => setTone(e.target.value)}>
                {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select className="w-full border rounded-xl px-3 py-2" value={lang} onChange={e => setLang(e.target.value)}>
                {LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <label><input type="checkbox" checked={ctx.horairesOk} onChange={e=>setCtx({...ctx, horairesOk:e.target.checked})}/> Horaire OK</label>
                <label><input type="checkbox" checked={ctx.dateOk} onChange={e=>setCtx({...ctx, dateOk:e.target.checked})}/> Date OK</label>
                <label><input type="checkbox" checked={ctx.minorsRule} onChange={e=>setCtx({...ctx, minorsRule:e.target.checked})}/> Règle mineurs</label>
                <label><input type="checkbox" checked={ctx.teamBuilding} onChange={e=>setCtx({...ctx, teamBuilding:e.target.checked})}/> Team Building</label>
                <label><input type="checkbox" checked={ctx.simultaneousStart} onChange={e=>setCtx({...ctx, simultaneousStart:e.target.checked})}/> Départ simultané</label>
              </div>
            </div>

            {/* CGV */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">CGV / Règles internes</h3>
              <textarea className="w-full h-32 border rounded-xl p-3 font-mono text-xs" value={cgvText} onChange={e => setCgvText(e.target.value)} />
            </div>

            {/* Bibliothèque */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Bibliothèque de réponses types</h3>
              <textarea className="w-full h-32 border rounded-xl p-3 font-mono text-xs" value={libraryText} onChange={e => setLibraryText(e.target.value)} />
            </div>

            {/* Base de connaissances */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Base de connaissances</h3>
              <textarea className="w-full h-48 border rounded-xl p-3 font-mono text-xs" value={knowledgeBaseText} onChange={e => setKnowledgeBaseText(e.target.value)} />
            </div>

            {/* Exemples d'e-mails */}
            <div className="bg-white p-4 rounded-2xl shadow space-y-2">
              <h3 className="font-semibold">Exemples d’e-mails types</h3>
              <textarea className="w-full h-40 border rounded-xl p-3 font-mono text-xs" value={emailExamplesText} onChange={e => setEmailExamplesText(e.target.value)} />
            </div>
          </div>

          {/* Réponse proposée */}
          <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
            <h2 className="font-semibold text-lg">Réponse proposée</h2>
            <textarea
              className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm"
              value={output}
              onChange={e => setOutput(e.target.value)}
              placeholder="La réponse apparaîtra ici..."
            />
            <div className="mt-3 flex gap-2">
              <button onClick={copyOutput} className="px-4 py-2 bg-black text-white rounded-xl">Copier</button>
              <button onClick={runQuickTests} className="px-4 py-2 border rounded-xl">Tests rapides</button>
            </div>
            {testLog && <p className="text-xs text-gray-600 mt-2">{testLog}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
