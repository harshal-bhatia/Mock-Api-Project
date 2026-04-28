import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateMockData(
  description: string,
  inputMode: "plain" | "schema",
  schemaInput?: string,
): Promise<unknown> {
  const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt =
    inputMode === "schema"
      ? `You are an API mock data generator. Generate realistic JSON data based on this TypeScript interface or JSON schema:

${schemaInput}

${description ? `Extra context: ${description}` : ""}

RULES:
- Return ONLY raw valid JSON. No markdown fences, no explanation, nothing else.
- Use realistic, contextually appropriate values.
- If the schema is a collection, return an array of 3-5 items.
- Match exact field names and types from the schema.`
      : `You are an API mock data generator. Generate realistic JSON data based on this description:

"${description}"

RULES:
- Return ONLY raw valid JSON. No markdown fences, no explanation, nothing else.
- Use realistic values (real names, valid emails, sensible prices).
- If the description implies a list, return an array of 3-5 items.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown fences just in case
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}
