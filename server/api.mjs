// Self-hosted API server for Engineering Atlas: runs the same handlers as the Netlify Functions
// (netlify/functions/interview.mjs and server/lib/router.mjs) behind any reverse proxy, e.g. nginx
// in docker-compose.
//
//   OPENAI_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node server/api.mjs   # PORT (default 8787)
//
// Interview rate limits are kept in memory (they reset when the process restarts). The proxy should
// send X-Real-IP or X-Forwarded-For so limits are per client, and X-Forwarded-Proto/Host so the
// same-origin check sees the public URL; set SITE_URL to that public URL as well.
//
// The weekly Slack digest runs here too: checked hourly, sent on Mondays from 09:00 UTC, once per
// week (the last run is remembered in memory and in DIGEST_STATE_FILE, default /tmp/atlas-digest.json).
// Run a single API instance, or set DIGEST_DISABLED=1 on all but one.
import http from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import interview from "../netlify/functions/interview.mjs";
import { route } from "./lib/router.mjs";
import { sendDigests } from "./lib/digest.mjs";
import { accountsConfigured } from "./lib/supabase.mjs";

const PORT = parseInt(process.env.PORT || "8787", 10);
const MAX_BODY = 256 * 1024; // org lessons hold up to 60,000 characters of Markdown

const memory = new Map();
const limitStore = {
  async get(key) { return memory.has(key) ? JSON.parse(memory.get(key)) : null; },
  async setJSON(key, value) { memory.set(key, JSON.stringify(value)); },
};
// Drop counters from earlier days once an hour.
setInterval(() => { const today = new Date().toISOString().slice(0, 10); for (const k of memory.keys()) if (!k.includes(today)) memory.delete(k); }, 3600e3).unref();

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url.startsWith("/api/")) { res.writeHead(404, { "content-type": "application/json" }); res.end('{"error":"Not found."}'); return; }
    const chunks = []; let size = 0;
    for await (const c of req) { size += c.length; if (size > MAX_BODY) { res.writeHead(413, { "content-type": "application/json" }); res.end('{"error":"Request body is too large."}'); return; } chunks.push(c); }
    const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
    const host = (req.headers["x-forwarded-host"] || req.headers.host || "localhost").split(",")[0].trim();
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    const request = new Request(`${proto}://${host}${req.url}`, { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const ip = req.headers["x-real-ip"] || (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
    const isInterview = req.url === "/api/interview" || req.url.startsWith("/api/interview?") || req.url.startsWith("/api/interview/");
    const response = isInterview ? await interview(request, { ip, limitStore }) : await route(request, { ip });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
    res.end('{"error":"Server error."}');
  }
});

// ---------- weekly digest ----------

const DIGEST_FILE = process.env.DIGEST_STATE_FILE || "/tmp/atlas-digest.json";
let lastDigest = (() => { try { return JSON.parse(readFileSync(DIGEST_FILE, "utf8")).lastRun || null; } catch { return null; } })();

// Monday date (UTC) of the week containing `d`.
const mondayOf = (d) => { const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); m.setUTCDate(m.getUTCDate() - ((m.getUTCDay() + 6) % 7)); return m.toISOString().slice(0, 10); };

async function maybeDigest(now = new Date()) {
  if (process.env.DIGEST_DISABLED === "1" || !accountsConfigured()) return;
  if (now.getUTCDay() !== 1 || now.getUTCHours() < 9) return;
  const week = mondayOf(now);
  if (lastDigest && mondayOf(new Date(lastDigest)) === week) return;
  lastDigest = now.toISOString();
  try { writeFileSync(DIGEST_FILE, JSON.stringify({ lastRun: lastDigest })); } catch { /* memory still guards this process */ }
  try {
    const results = await sendDigests({ now: now.getTime() });
    console.log(`digest: ${results.length} org(s), ${results.filter((r) => r.ok).length} sent`);
  } catch (e) {
    console.error("digest failed", e);
  }
}
setInterval(() => { maybeDigest(); }, 3600e3).unref();
setTimeout(() => { maybeDigest(); }, 5000).unref();

server.listen(PORT, () => console.log(
  `Engineering Atlas API on :${PORT} (AI ${process.env.OPENAI_API_KEY ? "enabled" : "disabled: set OPENAI_API_KEY"}; ` +
  `accounts ${accountsConfigured() ? "enabled" : "disabled: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"})`));
