// netlify/functions/openrouter-proxy.js
// CJS pour compatibilité maximale Netlify
exports.handler = async function (event) {
    // CORS (préflight)
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        body: "",
      };
    }
  
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: "Method Not Allowed",
      };
    }
  
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: "Missing OPENROUTER_API_KEY",
        };
      }
  
      const reqBody = JSON.parse(event.body || "{}");
  
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ta clé reste côté serveur Netlify :
          "Authorization": `Bearer ${apiKey}`,
          // Facultatif mais recommandé par OpenRouter :
          "HTTP-Referer": event.headers?.["x-forwarded-host"]
            ? `https://${event.headers["x-forwarded-host"]}`
            : "https://netlify.app",
          "X-Title": "Service Client IA",
        },
        body: JSON.stringify(reqBody),
      });
  
      const text = await resp.text();
      return {
        statusCode: resp.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: text,
      };
    } catch (e) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: String(e),
      };
    }
  };
  