import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { pattern, questions } = await req.json();

    const questionList =
  questions?.length > 0
    ? questions
        .map(
          (q: any, i: number) => `
==============================
Question ${i + 1}

Title:
${q.title}

Difficulty:
${q.difficulty}

Solved On:
${q.created_at}

Confidence:
${q.confidence}

Reflection:
${q.reflection || "None"}

Mistakes:
${q.mistakes || "None"}

Memory Trigger:
${q.memory_trigger || "None"}

Time Taken:
${q.time_taken || "Unknown"}

==============================
`
        )
        .join("\n")
    : "No solved questions yet.";

        const prompt = `
You are an expert Data Structures and Algorithms mentor.

Pattern:
${pattern}

Solved Questions:
${questionList}

Generate a concise study guide for this DSA pattern.

Return ONLY valid JSON.


{
  "overview":"",
  "recognition":"",
  "mistakes":"",
  "optimization":"",
  "interview":"",
  "revisionTip":"",
  "memorySummary":{
      "progress":"",
      "nextFocus":""
  }
}

Rules

overview:
Explain this pattern in 2-3 sentences.
Do NOT mention the student's personal data.
Write exactly THREE short bullet points.

Each bullet must be one sentence.

Maximum 15 words per bullet.

recognition:
List the common signals that indicate this pattern should be used.
Keep it practical and concise.
Write exactly THREE short bullet points.

Each bullet must be one sentence.

Maximum 15 words per bullet.

mistakes:
List the most common mistakes programmers make while solving problems using this pattern.
Do NOT invent mistakes from the student's reflections.
Write exactly THREE short bullet points.

Each bullet must be one sentence.

Maximum 15 words per bullet.

optimization:
Mention common optimization techniques or implementation tips for this pattern.
Write exactly THREE short bullet points.

Each bullet must be one sentence.

Maximum 15 words per bullet.

interview:
Give one concise interview tip related to this pattern.
Write exactly THREE short bullet points.

Each bullet must be one sentence.

Maximum 15 words per bullet.

revisionTip:
Give one practical revision strategy for mastering this pattern.
Write exactly THREE short bullet points.

Each bullet must be one sentence.

Maximum 15 words per bullet.

memorySummary:
This is the ONLY personalized field.

Read ONLY the student's:
- solved questions
- reflections
- mistakes
- memory triggers
- confidence



Return an object with exactly TWO fields.

{
  "progress": "",
  "nextFocus": ""
}

-------------------------
progress
-------------------------

Write a personalized learning report for THIS student.

Use ONLY:
- solved questions
- reflections
- mistakes
- memory triggers
- confidence history

DO NOT explain the DSA pattern.

Instead summarize:

• Current understanding
• Recurring strengths
• Weak areas
• Confidence trend
• Learning habits observed

Rules:

- Write in THIRD PERSON.
- Never start with "I".
- Never say "You should".
- Do not mention every solved question individually unless important.
- Sound like an AI mentor reviewing the student's progress.
- Maximum 120 words.
- Mention only observations supported by the student's data.
- If reflections are missing, explicitly mention that richer reflections will produce better personalized insights.

-------------------------
nextFocus
-------------------------

nextFocus:

Return an ARRAY.

Example:

[
"Increase confidence on medium problems.",
"Write one reflection after every solved question.",
"Record one memory trigger after every problem.",
"Review previous mistakes before attempting new questions."
]

Return the array inside memorySummary.nextFocus.

Generate 4-6 personalized action items.

Each bullet should:
- begin with a verb
- be one short sentence
- be based on the student's reflections, confidence and mistakes
- avoid generic advice

Good examples:

• Solve three medium problems before revising this pattern.
• Record one memory trigger after every solved question.
• Improve confidence on problems with multiple recursive branches.
• Explain your recursion tree aloud before coding.
• Review previous reflections before attempting new questions.

Return ONLY valid JSON.
`;

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "DSA Memory OS",
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );
    if (!aiResponse.ok) {
  const text = await aiResponse.text();

  return new Response(
    JSON.stringify({
      error: "OpenRouter request failed",
      status: aiResponse.status,
      body: text,
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

    console.log("OPENROUTER RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

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

    // Remove markdown fences
let cleaned = content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

// Keep only the JSON object
const start = cleaned.indexOf("{");
const end = cleaned.lastIndexOf("}");

if (start !== -1 && end !== -1) {
  cleaned = cleaned.substring(start, end + 1);
}

// Remove common escaped characters
cleaned = cleaned
  .replace(/\\n/g, " ")
  .replace(/\\"/g, '"')
  .replace(/\r/g, "")
  .trim();

console.log("CLEANED:");
console.log(cleaned);

let summary;

try {
  summary = JSON.parse(cleaned);
} catch (err) {
  console.error(err);

  return new Response(
    JSON.stringify({
      error: "JSON Parse Failed",
      content: cleaned,
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
      JSON.stringify(summary),
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