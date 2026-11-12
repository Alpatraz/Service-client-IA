// netlify/functions/openrouter-proxy.js
// Model selection lives on the server so old browser bundles cannot select a retired model.
// Keep the existing Lambda-compatible handler; never log prompts or API credentials.
const DEFAULT_MODELS = [
  "anthropic/claude-sonnet-4.6",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-haiku-4.5",
];

exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
  const fail = (statusCode, message) => reply(statusCode, { error: { message } });

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...headers, Allow: "POST, OPTIONS" }, body: "" };
  }
  if (event.httpMethod !== "POST") return fail(405, "Méthode non autorisée. Utilisez POST.");

  let input;
  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "{}";
    if (Buffer.byteLength(body, "utf8") > 300000) return fail(413, "Le message et les ressources sont trop longs.");
    input = JSON.parse(body);
  } catch {
    return fail(400, "La requête JSON est invalide.");
  }
  if (!input || !Array.isArray(input.messages) || !input.messages.length || input.messages.length > 30 ||
      input.messages.some((m) => !m || !["system", "user", "assistant"].includes(m.role) ||
        typeof m.content !== "string" || !m.content.trim())) {
    return fail(400, "La requête doit contenir des messages textuels valides.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fail(503, "La connexion IA n’est pas configurée sur le serveur. Contactez l’administrateur.");

  const primary = (process.env.OPENROUTER_MODEL || DEFAULT_MODELS[0]).trim() || DEFAULT_MODELS[0];
  const backups = (process.env.OPENROUTER_FALLBACK_MODELS || DEFAULT_MODELS.slice(1).join(","))
    .split(",").map((model) => model.trim()).filter(Boolean);
  const models = [...new Set([primary, ...backups])].slice(0, 3);
  const maxTokens = Number.isInteger(input.max_tokens)
    ? Math.max(32, Math.min(input.max_tokens, 4096)) : 2048;
  const temperature = Number.isFinite(input.temperature)
    ? Math.max(0, Math.min(input.temperature, 1)) : 0.3;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.URL || "https://service-client-ia.netlify.app",
        "X-Title": "Service Client IA",
      },
      body: JSON.stringify({
        models,
        messages: input.messages.map(({ role, content }) => ({ role, content })),
        temperature,
        max_tokens: maxTokens,
        stream: false,
        reasoning: { enabled: false },
      }),
    });
    let data;
    try {
      data = JSON.parse(await response.text());
    } catch {
      return fail(502, "Le fournisseur IA a renvoyé une réponse illisible. Réessayez.");
    }
    if (!response.ok || data?.error) {
      const status = response.ok ? Number(data?.error?.code) || 502 : response.status;
      const messages = {
        401: "La clé OpenRouter doit être vérifiée par l’administrateur.",
        402: "Le crédit OpenRouter est insuffisant. Contactez l’administrateur.",
        403: "OpenRouter refuse l’accès. Contactez l’administrateur.",
        404: "Les modèles IA configurés sont indisponibles. Contactez l’administrateur.",
        429: "Le service IA est momentanément saturé. Réessayez dans un instant.",
      };
      return fail(status >= 400 && status <= 599 ? status : 502,
        messages[status] || "Le service IA est momentanément indisponible. Réessayez.");
    }
    const choice = data?.choices?.[0];
    if (typeof choice?.message?.content !== "string" || !choice.message.content.trim()) {
      return fail(502, "L’IA n’a pas produit de réponse. Réessayez.");
    }
    if (choice.finish_reason === "length") {
      return fail(502, "La réponse IA a été interrompue avant sa fin. Raccourcissez la demande et réessayez.");
    }
    return reply(200, {
      choices: [{ message: { role: "assistant", content: choice.message.content }, finish_reason: choice.finish_reason }],
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    return fail(controller.signal.aborted || error?.name === "AbortError" ? 504 : 502,
      controller.signal.aborted || error?.name === "AbortError"
        ? "Le service IA met trop de temps à répondre. Réessayez."
        : "Impossible de joindre le service IA. Réessayez.");
  } finally {
    clearTimeout(timer);
  }
};
