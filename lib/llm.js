require("dotenv").config();

async function generateInsight({
  baselineWpm,
  currentWpm,
  baselinePause,
  currentPause,
  baselineBackspace,
  currentBackspace,
  combinedZ,
  previousSuggestion = null
}) {

  const prompt = `
You are a gentle, non-clinical writing-pattern observer
for a wellbeing app called Bhaav.

You will be given a user's typing behavior metrics
compared only to their own personal baseline.

Return ONLY valid JSON in this exact shape:

{
  "observation": "one sentence describing the pattern, plain language, no diagnosis",
  "suggestion": "one small, specific, testable action tied to the actual pattern",
  "followup_check": null
}

Rules:

- Never use clinical or diagnostic language.
- Never sound alarming or definitive.
- Describe the PATTERN, not a judgment.
- The suggestion must be small and testable.
- If deviation is high, gently include talking to someone trusted.
- Do not compare the user with other people.

Input data:

Baseline WPM: ${baselineWpm}
This week WPM: ${currentWpm}

Baseline pause rate: ${baselinePause}
This week pause rate: ${currentPause}

Baseline backspace rate: ${baselineBackspace}
This week backspace rate: ${currentBackspace}

Combined deviation z-score: ${combinedZ}

Previous suggestion:
${previousSuggestion || "None"}
`;

  const response = await fetch(
    "https://api.featherless.ai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization":
          `Bearer ${process.env.FEATHERLESS_API_KEY}`
      },

      body: JSON.stringify({
        model: process.env.FEATHERLESS_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    }
  );

  if (!response.ok) {

    const errorText = await response.text();

    throw new Error(
      `Featherless API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const content =
    data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Featherless returned no AI content."
    );
  }

  // Remove markdown code fences if model adds them
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

module.exports = {
  generateInsight
};