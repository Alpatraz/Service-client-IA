// netlify/functions/openrouter-proxy.js
// Corrigé pour gérer les réponses vides et erreurs réseau
exports.handler = async function (event) {
  // Autoriser les requêtes cross-origin
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  // Préflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }),
      };
    }

    const reqBody = JSON.parse(event.body || "{}");

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer":
          event.headers?.["x-forwarded-host"]
            ? `https://${event.headers["x-forwarded-host"]}`
            : "https://netlify.app",
        "X-Title": "Service Client IA",
      },
      body: JSON.stringify(reqBody),
    });

    const text = await resp.text();
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: "Invalid JSON from OpenRouter", raw: text };
    }

    return {
      statusCode: resp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e.message || String(e) }),
    };
  }
};
