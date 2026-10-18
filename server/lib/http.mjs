// Small, framework-free HTTP helpers shared by the API route handlers.
// Handlers have the shape (req: Request, ctx) => Promise<Response> and run unchanged on
// Netlify Functions (netlify/functions/api.mjs) and the self-hosted server (server/api.mjs).

export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function json(status, data, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

// Same rule as netlify/functions/interview.mjs: browsers must send same-origin requests;
// non-browser clients (no Origin, no Sec-Fetch-Site) are allowed.
export function isSameOrigin(req) {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const allowed = new Set([new URL(req.url).origin]);
  for (const v of [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL, process.env.SITE_URL]) {
    if (v) try { allowed.add(new URL(v).origin); } catch { /* ignore bad env */ }
  }
  return allowed.has(origin);
}

export function requireSameOrigin(req) {
  if (!isSameOrigin(req)) throw new HttpError(403, "Cross-origin requests are not allowed.");
}

export const MAX_BODY_CHARS = 200_000;

export async function readJson(req) {
  let text;
  try { text = await req.text(); } catch { throw new HttpError(400, "Body must be valid JSON."); }
  if (text.length > MAX_BODY_CHARS) throw new HttpError(413, "Request body is too large.");
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { throw new HttpError(400, "Body must be valid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "Body must be a JSON object.");
  return body;
}

export const nowMs = (ctx) => (ctx && typeof ctx.now === "function" ? ctx.now() : Date.now());

export const isUuid = (s) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// Trim, drop control characters, and enforce a maximum length. Returns "" for non-strings.
export function cleanText(v, max) {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length > max) throw new HttpError(400, `Text is longer than ${max} characters.`);
  return s;
}

// Convert thrown errors into JSON responses.
export function errorResponse(err) {
  if (err instanceof HttpError) return json(err.status, { error: err.message, ...(err.extra || {}) });
  console.error(err);
  return json(500, { error: "Server error." });
}
