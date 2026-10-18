// Minimal OpenAI Chat Completions client returning parsed JSON (response_format json_object).
import { HttpError } from "./http.mjs";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
export const model = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
export const aiConfigured = () => !!process.env.OPENAI_API_KEY;

export async function chatJSON({ system, user, temperature = 0, maxTokens = 1200, timeoutMs = 25000 }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new HttpError(503, "AI assessments are not configured on this server.");
  let res;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: model(),
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new HttpError(502, "Could not reach the AI service.");
  }
  if (!res.ok) {
    throw new HttpError(502,
      res.status === 429 ? "The AI service is busy. Please try again in a minute."
      : res.status === 401 || res.status === 403 ? "The AI service rejected the server's credentials."
      : `The AI service returned an error (${res.status}).`);
  }
  const data = await res.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new HttpError(502, "The AI service returned an empty reply.");
  try {
    return JSON.parse(content);
  } catch {
    throw new HttpError(502, "The AI service returned invalid JSON.");
  }
}
