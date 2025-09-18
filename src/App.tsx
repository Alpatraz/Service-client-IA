import { useEffect, useMemo, useState } from "react";

/**
 * Assistant de réponse Service Client – v2 (aperçu en direct)
 *
 * ✅ Prêt pour OpenRouter via proxy Netlify (clé côté serveur):
 *   - Fonction serverless attendue: /.netlify/functions/openrouter-proxy
 *   - Front n'envoie AUCUNE clé; tout passe par la fonction.
 *   - Si tu choisis "OpenAI" (non recommandé), la clé est requise côté client.
 */

// Types utilitaires
 type Brand = { id: string; label: string; email?: string; phone?: string; site?: string };
 type Ctx = {
   horairesOk: boolean;
   dateOk: boolean;
   minorsRule: boolean;
   teamBuilding: boolean;
   simultaneousStart: boolean;
 };

const DEFAULT_BRANDS: Brand[] = [
  { id: "ETM", label: "Échappe‑Toi Montréal", email: "info@echappetoi.com", phone: "514-907-2200", site: "https://echappetoi.com" },
  { id: "ADT", label: "À Double Tour Québec", email: "info@adoubletour.ca", phone: "418-xxx-xxxx", site: "https://adoubletour.ca" },
  { id: "VQL", label: "Vortex Quartier Latin (Montréal)", email: "info@vortex.com", phone: "514-xxx-xxxx", site: "https://vortex.com" },
];

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

const PROVIDERS = [
  { id: "template", label: "Template (hors IA)" },
  { id: "openrouter", label: "OpenRouter (via Netlify)" },
  { id: "openai", label: "OpenAI (clé locale)" },
];

export default function EmailReplyAssistantV2() {
  // Core states
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  // Brands
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [brandId, setBrandId] = useState("ETM");

  // Policies & language
  const [payment, setPayment] = useState(PAYMENT_POLICIES[0].id);
  const [tone, setTone] = useState(TONES[0].id);
  const [lang, setLang] = useState(LANGS[0].id);

  // Knowledge
  const [cgvText, setCgvText] = useState("");
  const [libraryText, setLibraryText] = useState("");

  // Context flags
  const [ctx, setCtx] = useState<Ctx>({
    horairesOk: false,
    dateOk: false,
    minorsRule: true,
    teamBuilding: false,
    simultaneousStart: false,
  });

  // IA engine (optionnel)
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [model, setModel] = useState("anthropic/claude-3.5-sonnet:beta"); // slug OpenRouter par défaut
  const [apiKey, setApiKey] = useState(""); // seulement pour OpenAI direct
  const [isLoading, setIsLoading] = useState(false);

  // Tests (dev)
  const [testLog, setTestLog] = useState<string>("");

  // Load persisted config
  useEffect(() => {
    const saved = localStorage.getItem("reply-assistant-v2");
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        setBrands(cfg.brands ?? DEFAULT_BRANDS);
        setBrandId(cfg.brandId ?? "ETM");
        setPayment(cfg.payment ?? PAYMENT_POLICIES[0].id);
        setTone(cfg.tone ?? TONES[0].id);
        setLang(cfg.lang ?? LANGS[0].id);
        setCgvText(cfg.cgvText ?? "");
        setLibraryText(cfg.libraryText ?? "");
        setCtx(cfg.ctx ?? ctx);
        setProvider(cfg.provider ?? PROVIDERS[0].id);
        setModel(cfg.model ?? "anthropic/claude-3.5-sonnet:beta");
        setApiKey(cfg.apiKey ?? "");
      } catch {}
    }
  }, []);

  // Persist config
  useEffect(() => {
    const cfg = { brands, brandId, payment, tone, lang, cgvText, libraryText, ctx, provider, model, apiKey };
    localStorage.setItem("reply-assistant-v2", JSON.stringify(cfg));
  }, [brands, brandId, payment, tone, lang, cgvText, libraryText, ctx, provider, model, apiKey]);

  const currentBrand = useMemo(() => brands.find(b => b.id === brandId) || brands[0], [brands, brandId]);
  const paymentLabel = useMemo(() => PAYMENT_POLICIES.find(p => p.id === payment)?.label ?? "", [payment]);

  // Helpers: brand CRUD
  const [newBrand, setNewBrand] = useState<Brand>({ id: "", label: "", email: "", phone: "", site: "" });
  function addBrand() {
    if (!newBrand.id || !newBrand.label) return;
    if (brands.some(b => b.id === newBrand.id)) return alert("ID de marque déjà existant.");
    const updated = [...brands, { ...newBrand }];
    setBrands(updated);
    setNewBrand({ id: "", label: "", email: "", phone: "", site: "" });
    setBrandId(newBrand.id);
  }
  function removeBrand(id: string) {
    const filtered = brands.filter(b => b.id !== id);
    setBrands(filtered.length ? filtered : DEFAULT_BRANDS);
    if (brandId === id) setBrandId((filtered[0]?.id) || DEFAULT_BRANDS[0].id);
  }

  // Prompt builders (IA)
  function buildSystemPrompt() {
    const brandLine = `Brand: ${currentBrand?.label || ""} | Email: ${currentBrand?.email || ""} | Phone: ${currentBrand?.phone || ""} | Site: ${currentBrand?.site || ""}`;
    const ctxLine = `Context flags → horairesOk:${ctx.horairesOk}, dateOk:${ctx.dateOk}, minorsRule:${ctx.minorsRule}, teamBuilding:${ctx.teamBuilding}, simultaneousStart:${ctx.simultaneousStart}`;
    const rules = [
      `- Style: professionnel, chaleureux, concis, orienté solution.`,
      `- Toujours reformuler le besoin (date, heure, participants, âge, lieu, langue).`,
      `- Si mineurs < 15 ans: exiger 1 adulte accompagnateur par salle.`,
      `- Team building: proposer un court appel avant devis.`,
      `- Si horaire exact indispo: proposer 2–3 alternatives proches.`,
      `- Jamais renvoyer juste au site: proposer l'action suivante claire.`,
      `- Politique paiement: ${paymentLabel}.`,
    ].join("\n");

    return `You are a senior CS email writer for escape rooms in Québec. Output a ready-to-send email only (no analysis).\n${brandLine}\n${ctxLine}\nCGV (guidelines, may be long, extract relevant clauses only):\n"""\n${cgvText}\n"""\nExamples library (inspiration only, do not copy verbatim):\n"""\n${libraryText}\n"""\nHouse rules:\n${rules}`;
  }

  function buildUserPrompt() {
    const langTone = `Language: ${lang}; Pronouns: ${tone}.`;
    const extras: string[] = [];
    if (ctx.horairesOk) extras.push(lang === "en" ? "Proposed times are OK for us." : "L'horaire proposé nous convient.");
    if (ctx.dateOk) extras.push(lang === "en" ? "Proposed date is OK for us." : "La date proposée nous convient.");
    if (ctx.simultaneousStart) extras.push(lang === "en" ? "They want both rooms to start at the same time." : "Départ simultané souhaité pour deux salles.");

    return [
      langTone,
      `Draft a full reply with greeting and signature including brand contacts.`,
      `Client email pasted below:`,
      `"""\n${input}\n"""`,
      extras.length ? `Additional constraints:\n- ${extras.join("\n- ")}` : "",
    ].filter(Boolean).join("\n\n");
  }

  async function generate() {
    setIsLoading(true); setOutput("");
    try {
      if (provider === "template") {
        const text = generateByTemplate();
        setOutput(text);
        return;
      }

      const sys = buildSystemPrompt();
      const usr = buildUserPrompt();

      // ➜ OpenRouter via proxy Netlify (AUCUNE clé côté client)
      if (provider === "openrouter") {
        const res = await fetch("/.netlify/functions/openrouter-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model || "anthropic/claude-3.5-sonnet:beta",
            temperature: 0.2,
            messages: [
              { role: "system", content: sys },
              { role: "user", content: usr },
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || JSON.stringify(data));
        const content = data?.choices?.[0]?.message?.content || "";
        setOutput(String(content).trim());
        return;
      }

      // ➜ OpenAI direct (clé requise côté client) – non recommandé
      if (provider === "openai") {
        if (!apiKey) throw new Error("Aucune clé API fournie (OpenAI)");
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: model || "gpt-4.1-mini", temperature: 0.2, messages: [
            { role: "system", content: sys },
            { role: "user", content: usr },
          ] })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
        const content = data?.choices?.[0]?.message?.content || "";
        setOutput(String(content).trim());
        return;
      }
    } catch (e: any) {
      setOutput(`⚠️ Erreur de génération : ${e?.message || String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }

  function generateByTemplate() {
    const greet = lang === "en" ? (tone === "tu" ? "Hi" : "Hello") : (tone === "tu" ? "Salut" : "Bonjour");
    const closing = lang === "en" ? "Best regards," : "Bien cordialement,";

    const policyLine = payment === "A"
      ? (lang === "en" ? "Payment in full is required to confirm the booking." : "Le paiement complet est requis pour confirmer la réservation.")
      : (lang === "en" ? "We can proceed with a 50% deposit upon quote approval and the remaining balance 48h before the activity." : "Nous pouvons procéder avec 50% à la validation du devis et le solde 48h avant l'activité.");

    const adultRule = ctx.minorsRule ? (lang === "en" ? "For participants under 15, one adult must join the group in each room." : "Pour les participantes et participants de moins de 15 ans, un adulte doit accompagner et jouer dans chaque salle.") : "";

    const tbLine = ctx.teamBuilding
      ? (lang === "en" ? "For team building, we suggest a short call to tailor the experience before we send a detailed quote." : "Pour un team building, on suggère un court appel pour cadrer vos besoins avant l'envoi d'un devis détaillé.")
      : "";

    const extras: string[] = [];
    if (ctx.horairesOk) extras.push(lang === "en" ? "The proposed times work for us." : "L'horaire proposé nous convient.");
    if (ctx.dateOk) extras.push(lang === "en" ? "The proposed date works for us." : "La date proposée nous convient.");
    if (ctx.simultaneousStart) extras.push(lang === "en" ? "We can launch both rooms at the same time." : "Nous pouvons lancer les deux salles en même temps.");

    const contacts = [
      currentBrand?.email && `Email: ${currentBrand.email}`,
      currentBrand?.phone && `Tél.: ${currentBrand.phone}`,
      currentBrand?.site && currentBrand.site,
    ].filter(Boolean).join(" • ");

    const cgvClause = cgvText
      ? (lang === "en" ? "Key terms apply as per our conditions of sale (cancellations, changes, responsibilities)." : "Les modalités clés s'appliquent selon nos conditions générales de vente (annulations, modifications, responsabilités).")
      : "";

    return [
      `${greet},`,
      "",
      lang === "en" ? `Thanks for your message about a booking at ${currentBrand?.label}.` : `Merci pour votre message au sujet d'une réservation chez ${currentBrand?.label}.`,
      lang === "en"
        ? `To prepare the right experience, could you please confirm:\n• Date & time\n• Number of participants and age group\n• Preferred scenario(s) and language\n• Any constraints (simultaneous start, specific window, etc.)`
        : `Afin de préparer la bonne expérience, pouvez‑vous confirmer :\n• Date & heure\n• Nombre de participantes/participants et tranche d'âge\n• Scénario(x) souhaité(s) et langue\n• Contraintes éventuelles (départ simultané, créneau précis, etc.)`,
      "",
      extras.join("\n"),
      policyLine,
      adultRule,
      tbLine,
      cgvClause,
      "",
      lang === "en" ? "Would you like us to hold a slot and send a secure payment link, or prepare a quote first?" : "Souhaitez‑vous que l'on bloque un créneau et qu'on vous envoie un lien de paiement sécurisé, ou préférez‑vous un devis d'abord ?",
      "",
      closing,
      "Service Client",
      currentBrand?.label || "",
      contacts,
    ].filter(Boolean).join("\n");
  }

  function copyOutput() { navigator.clipboard.writeText(output || ""); }

  // DEV: tests rapides
  function runQuickTests() {
    try {
      const j1 = ["a", "b"].join("\n");
      if (!j1.includes("\n")) throw new Error("join\\n ne contient pas de saut de ligne");
      const backup: any = { provider, input };
      setProvider("template");
      setInput("Test client message\nNombre: 10\nDate: 12 oct.");
      const txt = generateByTemplate();
      if (!txt || typeof txt !== "string" || txt.length < 20) throw new Error("Texte généré vide ou trop court");
      setProvider(backup.provider);
      setInput(backup.input);
      setTestLog("✅ Tests basiques OK");
    } catch (e: any) {
      setTestLog(`❌ Test échoué: ${e?.message || e}`);
    }
  }

  // UI helpers
  function BrandManager() {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm mb-1">Marque active</label>
            <select className="w-full border rounded-xl px-3 py-2" value={brandId} onChange={e=>setBrandId(e.target.value)}>
              {brands.map(b=> <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </div>
          <div className="col-span-2"><h4 className="font-medium">Ajouter une marque</h4></div>
          <input className="border rounded-xl px-3 py-2" placeholder="ID (ex. ETM)" value={newBrand.id} onChange={e=>setNewBrand({...newBrand, id:e.target.value})} />
          <input className="border rounded-xl px-3 py-2" placeholder="Nom public" value={newBrand.label} onChange={e=>setNewBrand({...newBrand, label:e.target.value})} />
          <input className="border rounded-xl px-3 py-2" placeholder="Courriel" value={newBrand.email} onChange={e=>setNewBrand({...newBrand, email:e.target.value})} />
          <input className="border rounded-xl px-3 py-2" placeholder="Téléphone" value={newBrand.phone} onChange={e=>setNewBrand({...newBrand, phone:e.target.value})} />
          <input className="border rounded-xl px-3 py-2 col-span-2" placeholder="Site web" value={newBrand.site} onChange={e=>setNewBrand({...newBrand, site:e.target.value})} />
          <div className="col-span-2 flex gap-2">
            <button onClick={addBrand} className="px-3 py-2 rounded-xl bg-black text-white">➕ Ajouter</button>
            <button onClick={()=>removeBrand(brandId)} className="px-3 py-2 rounded-xl border">🗑️ Supprimer marque active</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">Assistant de réponse – Service Client (v2)</h1>
          <p className="text-sm text-gray-600">Colle un courriel à gauche, configure au centre, génère la réponse à droite. Tout est mémorisé localement.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne A — Input */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-4 h-full flex flex-col">
              <h2 className="font-semibold text-lg">Courriel reçu (colle ici)</h2>
              <textarea className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm" value={input} onChange={e=>setInput(e.target.value)} placeholder={`Colle ici le texte du courriel du client...`} />
              <div className="mt-3 flex gap-2">
                <button onClick={generate} disabled={isLoading} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">{isLoading? "Génération..." : "Générer"}</button>
                <button onClick={()=>{setInput(""); setOutput("");}} className="px-4 py-2 rounded-xl border">Réinitialiser</button>
              </div>
            </div>
          </div>

          {/* Colonne B — Réglages */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h2 className="font-semibold text-lg">Marques</h2>
              {BrandManager()}
            </div>

            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h3 className="font-semibold">Paramètres de réponse</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Politique de paiement</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={payment} onChange={e=>setPayment(e.target.value)}>
                    {PAYMENT_POLICIES.map(p=> <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Ton</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={tone} onChange={e=>setTone(e.target.value)}>
                    {TONES.map(t=> <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Langue</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={lang} onChange={e=>setLang(e.target.value)}>
                    {LANGS.map(l=> <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.horairesOk} onChange={e=>setCtx({...ctx, horairesOk:e.target.checked})}/> Horaire OK</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.dateOk} onChange={e=>setCtx({...ctx, dateOk:e.target.checked})}/> Date OK</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.minorsRule} onChange={e=>setCtx({...ctx, minorsRule:e.target.checked})}/> Rappel règle mineurs</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.teamBuilding} onChange={e=>setCtx({...ctx, teamBuilding:e.target.checked})}/> Team building</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.simultaneousStart} onChange={e=>setCtx({...ctx, simultaneousStart:e.target.checked})}/> Départ simultané</label>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h3 className="font-semibold">Moteur IA</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Fournisseur</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={provider} onChange={e=>setProvider(e.target.value)}>
                    {PROVIDERS.map(p=> <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Modèle</label>
                  <input className="w-full border rounded-xl px-3 py-2" value={model} onChange={e=>setModel(e.target.value)} placeholder="anthropic/claude-3.5-sonnet:beta (OpenRouter) / gpt-4.1-mini (OpenAI)" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1">Clé API (uniquement si OpenAI direct)</label>
                  <input className="w-full border rounded-xl px-3 py-2" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk‑... (laisser vide si OpenRouter via Netlify)" />
                </div>
              </div>
              <p className="text-xs text-gray-500">OpenRouter via Netlify (recommandé) : définis <code>OPENROUTER_API_KEY</code> dans Netlify → Site settings → Environment variables. Aucune clé côté navigateur.</p>
            </div>
          </div>

          {/* Colonne C — Output & Knowledge */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow p-4 h-[320px] flex flex-col">
              <h2 className="font-semibold text-lg">Réponse proposée</h2>
              <textarea className="mt-2 flex-1 border rounded-xl p-3 font-mono text-sm" value={output} onChange={e=>setOutput(e.target.value)} placeholder="La réponse apparaîtra ici..." />
              <div className="mt-3 flex gap-2">
                <button onClick={copyOutput} className="px-4 py-2 rounded-xl bg-black text-white">Copier</button>
                <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border">Imprimer</button>
                <button onClick={runQuickTests} className="px-4 py-2 rounded-xl border">Tests rapides</button>
              </div>
              {testLog && <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{testLog}</pre>}
            </div>

            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h3 className="font-semibold">CGV / Règles internes</h3>
              <textarea className="w-full h-40 border rounded-xl p-3 font-mono text-xs" value={cgvText} onChange={e=>setCgvText(e.target.value)} placeholder="Colle ici tes conditions générales de vente (annulations, dépôt, responsabilités, retards, etc.)" />
              <p className="text-xs text-gray-500">Astuce : garde un doc maître dans Drive et colle ici la dernière version.</p>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 space-y-3">
              <h3 className="font-semibold">Bibliothèque de réponses types</h3>
              <textarea className="w-full h-40 border rounded-xl p-3 font-mono text-xs" value={libraryText} onChange={e=>setLibraryText(e.target.value)} placeholder={`Colle ici des dizaines d'exemples (Q/R). Ils serviront d'inspiration au moteur IA.`} />
              <p className="text-xs text-gray-500">Tu peux copier depuis Word/Excel/Drive.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
