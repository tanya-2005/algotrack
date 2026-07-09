import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Same free-model fallback + backoff pattern proven in
// generate-pattern-summary: OpenRouter's free tier is shared and gets
// rate-limited independent of anything this project does, so try a short
// chain of other well-known free models before giving up.
const MODEL_CANDIDATES = [
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OpenRouter API Key",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { message, history, context } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          error: "Missing message",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const contextSummary = JSON.stringify(context ?? {}, null, 2);

    const historyText = Array.isArray(history)
      ? history
          .slice(-6)
          .map(
            (m: { role: string; text: string }) =>
              `${m.role === "user" ? "Student" : "Coach"}: ${m.text}`
          )
          .join("\n")
      : "";

    const prompt = `
You are an expert AI DSA (Data Structures & Algorithms) coach embedded in a study-tracking app.

You have access to this student's real logged data (their actual solved questions, patterns, confidence, reflections, and mistakes):
${contextSummary}

Recent conversation:
${historyText || "(start of conversation)"}

Student's new message:
"${message}"

Rules:
- Answer specifically using the student's real data above whenever relevant. Never invent problems, reflections, or mistakes they didn't actually log.
- If asked to quiz them, generate one short quiz question drawn from their real weak patterns or mistakes, and ask them to answer it.
- Be a supportive but direct coach.
- Keep replies concise - under 150 words unless they explicitly ask for a longer explanation.
- Do not dump the raw data back at them.
- Plain conversational text, no markdown headers.
`;

    let aiResponse: Response | null = null;
    let lastErrorStatus = 0;
    let lastErrorBody = "";

    for (const model of MODEL_CANDIDATES) {
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://algotrack-rho.vercel.app",
            "X-Title": "DSA Memory OS",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

      if (res.ok) {
        aiResponse = res;
        break;
      }

      lastErrorStatus = res.status;
      lastErrorBody = await res.text();

      if (lastErrorStatus !== 429 && lastErrorStatus !== 503) {
        break;
      }

      let waitSeconds = 3;
      try {
        const parsed = JSON.parse(lastErrorBody);
        const hinted = parsed?.error?.metadata?.retry_after_seconds;
        if (typeof hinted === "number") {
          waitSeconds = Math.min(Math.ceil(hinted), 8);
        }
      } catch {
        /* use default wait */
      }
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
    }

    if (!aiResponse) {
      return new Response(
        JSON.stringify({
          error: "OpenRouter request failed for all candidate models",
          status: lastErrorStatus,
          body: lastErrorBody,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await aiResponse.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({
          error: "No AI response",
          raw: data,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        reply: content.trim(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
