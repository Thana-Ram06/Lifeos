import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.age !== "number" || typeof body.goal !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { age, goal } = body as { age: number; goal: string };
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "AI service is not configured" }, { status: 500 });
  }

  const prompt = `You are a life simulation AI. Given a person's current age and goal, generate a realistic and slightly optimistic 15-year life simulation.

User age: ${age}
Goal: ${goal}

Return a JSON object with EXACTLY this structure (no markdown, no extra text, pure JSON only):
{
  "timeline": [
    {
      "year": <calendar year as integer>,
      "age": <person's age as integer>,
      "event": "<detailed description of what happens this year>",
      "income": "<estimated annual income like $65,000 or $120k>",
      "category": "<one of: career, personal, financial, health, milestone, challenge>"
    }
  ],
  "summary": "<2-3 sentence overview of the person's journey>",
  "finalOutcome": "<1-2 sentence description of where they end up after 15 years>",
  "keyMilestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>", "<milestone 4>"],
  "challenges": ["<challenge 1>", "<challenge 2>", "<challenge 3>"]
}

Rules:
- Include exactly 15 timeline entries (one per year)
- Start from the current year (${new Date().getFullYear()})
- Make income progression realistic — start modest, grow gradually
- Mix career, personal, financial, health, and milestone events
- Include 2-3 genuine challenges/failures that make it realistic
- Keep it specific and personalized to the goal
- Return ONLY valid JSON, no markdown code blocks`;

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errorText);
      return NextResponse.json({ error: "AI service returned an error" }, { status: 500 });
    }

    const groqData = (await groqResponse.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = groqData.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI service" }, { status: 500 });
    }

    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const simulationData = JSON.parse(cleanContent);

    return NextResponse.json(simulationData);
  } catch (err) {
    console.error("Error calling Groq API:", err);
    return NextResponse.json({ error: "Failed to generate simulation" }, { status: 500 });
  }
}
