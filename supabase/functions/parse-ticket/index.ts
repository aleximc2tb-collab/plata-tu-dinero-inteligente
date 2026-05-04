// Parsea un link de ticket (AFIP / e-commerce / comercio) y extrae monto, comercio, fecha y categoría sugerida.
// Usa Lovable AI Gateway (Gemini) con tool calling para output estructurado.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "Comida", "Supermercado", "Transporte", "Salidas", "Servicios",
  "Salud", "Hogar", "Ropa", "Streaming", "Otros",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return json({ error: "URL requerida" }, 400);
    }

    let parsedUrl: URL;
    try { parsedUrl = new URL(url); } catch {
      return json({ error: "URL inválida" }, 400);
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return json({ error: "Solo http/https" }, 400);
    }

    // Descargar contenido
    let pageText = "";
    try {
      const resp = await fetch(parsedUrl.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (PlataApp) AppleWebKit/537.36" },
        redirect: "follow",
      });
      const ctype = resp.headers.get("content-type") ?? "";
      const raw = await resp.text();
      if (ctype.includes("html")) {
        pageText = raw
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        pageText = raw.replace(/\s+/g, " ").trim();
      }
      pageText = pageText.slice(0, 8000);
    } catch (e) {
      console.error("fetch error", e);
      return json({ error: "No se pudo abrir el link" }, 400);
    }

    if (!pageText || pageText.length < 30) {
      return json({ error: "El link no contiene texto legible" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI no configurada" }, 500);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sos un asistente que extrae datos de tickets/facturas argentinas (AFIP, comercios, e-commerce).
Devolvé monto total en pesos (número, sin separadores), nombre del comercio y categoría sugerida.
Categorías válidas: ${CATEGORIES.join(", ")}.
Si no podés determinar algo, devolvé null.`,
          },
          {
            role: "user",
            content: `Extraé los datos de este ticket. URL: ${parsedUrl.toString()}\n\nContenido:\n${pageText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_ticket",
              description: "Extrae datos de un ticket de compra",
              parameters: {
                type: "object",
                properties: {
                  amount: { type: ["number", "null"], description: "Monto total en ARS" },
                  merchant: { type: ["string", "null"], description: "Nombre del comercio" },
                  date: { type: ["string", "null"], description: "Fecha en formato YYYY-MM-DD" },
                  category: { type: ["string", "null"], enum: [...CATEGORIES, null] },
                },
                required: ["amount", "merchant", "date", "category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_ticket" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return json({ error: "Demasiadas solicitudes. Probá de nuevo en un minuto." }, 429);
      if (aiResp.status === 402) return json({ error: "Sin créditos de IA disponibles." }, 402);
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return json({ error: "Error procesando el ticket" }, 500);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return json({ error: "No se pudieron extraer datos" }, 422);

    const args = JSON.parse(toolCall.function.arguments);
    if (!args.amount || args.amount <= 0) {
      return json({ error: "No se detectó un monto válido" }, 422);
    }

    return json({
      amount: Number(args.amount),
      merchant: args.merchant ?? "Comercio",
      date: args.date ?? new Date().toISOString().slice(0, 10),
      category: CATEGORIES.includes(args.category) ? args.category : "Otros",
    });
  } catch (e) {
    console.error("parse-ticket error", e);
    return json({ error: e instanceof Error ? e.message : "Error desconocido" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
