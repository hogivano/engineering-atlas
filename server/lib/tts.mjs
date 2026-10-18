// Natural narration for the Listen player: OpenAI text-to-speech, restricted to lesson text and cached.
//
//   GET  /api/tts                       -> {enabled, voices:[{id,label}], model}
//   POST /api/tts {lesson, text, voice} -> audio/mpeg
//
// Only text that appears in the lesson can be voiced (so this can't be used as a free TTS service),
// each clip is cached by voice + text (each paragraph is paid for once), and uncached requests are
// capped per client and per day. Cache: TTS_CACHE_DIR on disk when set, else Netlify Blobs, else memory.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { HttpError, json, readJson, requireSameOrigin } from "./http.mjs";
import { loadLessonJson } from "./data.mjs";

// Local engine: any OpenAI-compatible speech server (e.g. Kokoro-82M via kokoro-fastapi) at TTS_BASE_URL.
// It costs nothing per character, so only the per-client guard applies, and clips are kept short because
// CPU synthesis runs at a few times real time.
const LOCAL = () => (process.env.TTS_BASE_URL || "").replace(/\/+$/, "");
const LOCAL_VOICES = () => (process.env.TTS_VOICES || "af_heart:Heart · warm,af_bella:Bella · bright,am_michael:Michael · calm,am_fenrir:Fenrir · deep,bf_emma:Emma · British,bm_george:George · British")
  .split(",").map((x) => { const [id, ...l] = x.split(":"); return { id: id.trim(), label: (l.join(":") || id).trim() }; }).filter((v) => v.id);
const voices = () => (LOCAL() ? LOCAL_VOICES() : VOICES);
const enabled = () => process.env.TTS_DISABLED !== "1" && (!!LOCAL() || !!process.env.OPENAI_API_KEY);
export const VOICES = [
  { id: "coral", label: "Coral · warm" },
  { id: "sage", label: "Sage · calm" },
  { id: "ash", label: "Ash · clear" },
  { id: "nova", label: "Nova · bright" },
  { id: "fable", label: "Fable · storyteller" },
  { id: "onyx", label: "Onyx · deep" },
];
// Best model first; models this API key can't use are skipped once and remembered.
const CHAIN = () => [...new Set([process.env.TTS_MODEL, "gpt-4o-mini-tts", "tts-1-hd", "tts-1"].filter(Boolean))];
const unavailable = new Set();
const MODEL = () => CHAIN().find((m) => !unavailable.has(m)) || "tts-1";
const INSTRUCTIONS = "You are narrating a technical lesson to a software engineer, like a thoughtful senior engineer talking a colleague through an idea. Sound natural, warm and conversational, not like an announcer. Use a relaxed, even pace with short natural pauses at commas and between sentences, and slightly emphasise the key terms. Read acronyms the way engineers say them (QPS as Q-P-S, p99 as P ninety-nine, ms as milliseconds, GB as gigabytes) and say code identifiers plainly.";
const MAX_TEXT = 1500;
const PER_IP_DAY = parseInt(process.env.TTS_PER_IP_DAY || "600", 10);
const CHARS_DAY = parseInt(process.env.TTS_DAILY_CHARS || "400000", 10);

const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
const plain = (html) => String(html).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const lessonText = new Map();
async function lessonPlain(key) {
  if (!lessonText.has(key)) {
    const L = await loadLessonJson(key).catch(() => null);
    if (!L) return null;
    lessonText.set(key, squash(plain(L.html || "") + " " + plain((L.practice || {}).task || "")));
    if (lessonText.size > 300) lessonText.delete(lessonText.keys().next().value);
  }
  return lessonText.get(key);
}

// Light text clean-up so the voice reads abbreviations like a person would.
export function speakable(t) {
  return String(t).replace(/\s+/g, " ").trim()
    .replace(/\be\.g\.,?/gi, "for example,").replace(/\bi\.e\.,?/gi, "that is,").replace(/\betc\./gi, "and so on.")
    .replace(/\bvs\.?\b/gi, "versus").replace(/\s?→\s?/g, " to ").replace(/≈\s?|~(?=\d)/g, "about ")
    .replace(/\s?×\s?/g, " times ").replace(/≤\s?/g, "at most ").replace(/≥\s?/g, "at least ");
}

// ---------- cache ----------
let blobStore = null;
async function cacheGet(id) {
  if (process.env.TTS_CACHE_DIR) { try { return await readFile(path.join(process.env.TTS_CACHE_DIR, id + ".mp3")); } catch { return null; } }
  const store = await blobs(); if (store) { const b = await store.get(id, { type: "arrayBuffer" }).catch(() => null); return b ? Buffer.from(b) : null; }
  return memory.get(id) || null;
}
async function cachePut(id, buf) {
  if (process.env.TTS_CACHE_DIR) { await mkdir(process.env.TTS_CACHE_DIR, { recursive: true }); await writeFile(path.join(process.env.TTS_CACHE_DIR, id + ".mp3"), buf); return; }
  const store = await blobs(); if (store) { await store.set(id, buf).catch(() => {}); return; }
  memory.set(id, buf); if (memory.size > 500) memory.delete(memory.keys().next().value);
}
const memory = new Map();
async function blobs() {
  if (blobStore !== null) return blobStore;
  try { const { getStore } = await import("@netlify/blobs"); blobStore = getStore({ name: "tts-cache" }); await blobStore.get("probe"); }
  catch { blobStore = false; }
  return blobStore;
}

// ---------- limits for uncached synthesis (in memory; per instance) ----------
const counts = { day: "", chars: 0, ip: new Map() };
function charge(ip, chars) {
  const day = new Date().toISOString().slice(0, 10);
  if (counts.day !== day) { counts.day = day; counts.chars = 0; counts.ip.clear(); }
  const n = counts.ip.get(ip) || 0;
  if (n >= PER_IP_DAY) throw new HttpError(429, "You've reached today's narration limit. Device voices still work.");
  if (counts.chars + chars > CHARS_DAY) throw new HttpError(429, "Natural narration has reached its daily limit. Device voices still work.");
  counts.ip.set(ip, n + 1); counts.chars += chars;
}

export function ttsInfo() {
  return json(200, { enabled: enabled(), engine: LOCAL() ? "local" : "openai", voices: voices(), model: LOCAL() ? "kokoro" : MODEL(), maxChars: LOCAL() ? 320 : 1400 }, { "cache-control": "public, max-age=300" });
}

async function synthLocal(input, voice) {
  let res;
  try {
    res = await fetch(LOCAL() + "/v1/audio/speech", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.TTS_LOCAL_MODEL || "kokoro", input, voice, response_format: "mp3", speed: 1 }),
      signal: AbortSignal.timeout(120000),
    });
  } catch { throw new HttpError(502, "The local voice engine is not responding."); }
  if (!res.ok) throw new HttpError(502, `The local voice engine returned an error (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}

export async function ttsHandler(req, ctx = {}) {
  requireSameOrigin(req);
  if (!enabled()) throw new HttpError(503, "Natural narration is not configured.");
  const body = await readJson(req);
  const lesson = String(body.lesson || ""), text = String(body.text || "").replace(/\s+/g, " ").trim();
  const vs = voices();
  const voice = vs.some((v) => v.id === body.voice) ? body.voice : vs[0].id;
  if (!/^[a-z]+\/[a-z0-9-]+$/.test(lesson)) throw new HttpError(400, "Unknown lesson.");
  if (!text || text.length > MAX_TEXT) throw new HttpError(400, `Text must be 1 to ${MAX_TEXT} characters.`);
  const all = await lessonPlain(lesson);
  if (!all) throw new HttpError(404, "Unknown lesson.");
  if (!all.includes(squash(text))) throw new HttpError(403, "Only lesson text can be narrated.");
  const input = speakable(text);
  const idFor = (m) => createHash("sha256").update([m, voice, input].join("\n")).digest("hex").slice(0, 40);
  const ip = (ctx && ctx.ip) || req.headers.get("x-nf-client-connection-ip") || "unknown";
  // The pre-generation tool (tools/pregen-tts.js) sends TTS_PREGEN_TOKEN and is exempt from per-client limits.
  const pregen = !!process.env.TTS_PREGEN_TOKEN && req.headers.get("x-pregen-token") === process.env.TTS_PREGEN_TOKEN;
  if (LOCAL()) {
    const id = idFor("kokoro");
    let clip = await cacheGet(id);
    if (!clip) { if (!pregen) charge(ip, 0); clip = await synthLocal(input, voice); await cachePut(id, clip); }
    return new Response(clip, { status: 200, headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=31536000, immutable", "content-length": String(clip.length) } });
  }
  let audio = await cacheGet(idFor(MODEL()));
  if (!audio) {
    charge(ip, input.length);
    let res, model;
    for (;;) {
      model = MODEL();
      const payload = { model, voice, input, response_format: "mp3" };
      if (model.startsWith("gpt-")) payload.instructions = INSTRUCTIONS; // only the gpt-4o voices take style instructions
      try {
        res = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        });
      } catch { throw new HttpError(502, "Could not reach the voice service."); }
      if ((res.status === 403 || res.status === 404) && model !== "tts-1") {
        const err = await res.json().catch(() => ({}));
        if (/model/i.test(JSON.stringify(err))) { unavailable.add(model); continue; }
      }
      break;
    }
    if (!res.ok) throw new HttpError(502, res.status === 429 ? "The voice service is busy. Try again in a moment." : `The voice service returned an error (${res.status}).`);
    audio = Buffer.from(await res.arrayBuffer());
    await cachePut(idFor(model), audio);
  }
  return new Response(audio, { status: 200, headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=31536000, immutable", "content-length": String(audio.length) } });
}
