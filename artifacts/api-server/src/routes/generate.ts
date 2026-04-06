import { Router, type IRouter } from "express";
import { GenerateSimulationBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

router.post("/generate", async (req, res): Promise<void> => {
  const parsed = GenerateSimulationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { age, goal } = parsed.data;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    req.log.error("GROQ_API_KEY is not configured");
    res.status(500).json({ error: "AI service is not configured" });
    return;
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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      req.log.error({ status: groqResponse.status, error: errorText }, "Groq API error");
      res.status(500).json({ error: "AI service returned an error" });
      return;
    }

    const groqData = (await groqResponse.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = groqData.choices?.[0]?.message?.content;
    if (!content) {
      req.log.error({ groqData }, "No content in Groq response");
      res.status(500).json({ error: "No response from AI service" });
      return;
    }

    let simulationData: unknown;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      simulationData = JSON.parse(cleanContent);
    } catch (parseErr) {
      req.log.error({ content, parseErr }, "Failed to parse AI response as JSON");
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    res.json(simulationData);
  } catch (err) {
    logger.error({ err }, "Error calling Groq API");
    res.status(500).json({ error: "Failed to generate simulation" });
  }
});

export default router;
