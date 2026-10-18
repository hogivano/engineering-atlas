// Pre-generate Listen narration for every lesson, so playback starts instantly.
// It opens each lesson in headless Chrome, asks the app for the exact clips its player would request,
// and calls /api/tts for each one (already-cached clips return immediately, so it can be re-run any time).
//
//   SITE=http://127.0.0.1:8490 TOKEN=<TTS_PREGEN_TOKEN> VOICE=af_heart CHROME=/usr/bin/google-chrome \
//     node tools/pregen-tts.js            # optional: ONLY=sd,lld  CONCURRENCY=2
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const SITE = (process.env.SITE || "http://127.0.0.1:8490").replace(/\/$/, "");
const TOKEN = process.env.TOKEN || "";
const VOICE = process.env.VOICE || "";
const CONC = parseInt(process.env.CONCURRENCY || "2", 10);
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
const PROGRESS = process.env.PROGRESS || path.join(process.cwd(), "pregen-tts-progress.json");
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const done = fs.existsSync(PROGRESS) ? JSON.parse(fs.readFileSync(PROGRESS, "utf8")) : {};
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(SITE + "/#today", { waitUntil: "networkidle0" });
  if (VOICE) await page.evaluate(v => { const s = JSON.parse(localStorage.getItem("tldp-progress-v1") || "{}"); s.notes = Object.assign(s.notes || {}, { ttsVoice: v, essentials: "" }); localStorage.setItem("tldp-progress-v1", JSON.stringify(s)); }, VOICE);
  await page.goto(SITE + "/#today", { waitUntil: "networkidle0" });
  const keys = await page.evaluate(() => Object.keys(JSON.parse(document.getElementById("data").textContent).lessons));
  const todo = keys.filter(k => !ONLY.length || ONLY.includes(k.split("/")[0]));
  let clips = 0, made = 0, t0 = Date.now();
  for (const [n, key] of todo.entries()) {
    if (done[key] && done[key].voice === (VOICE || done[key].voice) && done[key].ok) continue;
    const [course, slug] = key.split("/");
    await page.evaluate(h => { location.hash = h; }, `#learn.${course}.${slug}`);
    await page.waitForFunction(k => { const a = document.querySelector(".prose section.lsec"); return a && location.hash.endsWith(k.split("/")[1]); }, { timeout: 60000 }, key).catch(() => {});
    await sleep(300);
    const script = await page.evaluate(() => window.__atlasTtsScript && window.__atlasTtsScript());
    if (!script || script.key !== key) { console.log(`skip ${key}: no script`); continue; }
    let ok = true, i = 0, newHere = 0;
    const worker = async () => {
      while (i < script.texts.length) {
        const text = script.texts[i++];
        for (let attempt = 1; attempt <= 3; attempt++) {
          const s = Date.now();
          const res = await fetch(SITE + "/api/tts", { method: "POST", headers: { "Content-Type": "application/json", Origin: SITE, "x-pregen-token": TOKEN }, body: JSON.stringify({ lesson: key, text, voice: script.voice }) }).catch(e => ({ ok: false, status: e.message }));
          if (res.ok) { await res.arrayBuffer(); clips++; if (Date.now() - s > 300) { made++; newHere++; } break; }
          if (attempt === 3) { ok = false; console.log(`  fail ${key}: ${res.status}`); } else await sleep(3000 * attempt);
        }
      }
    };
    await Promise.all(Array.from({ length: CONC }, worker));
    done[key] = { ok, voice: script.voice, clips: script.texts.length, at: new Date().toISOString() };
    fs.writeFileSync(PROGRESS, JSON.stringify(done, null, 1));
    const finished = Object.values(done).filter(d => d.ok).length, hrs = (Date.now() - t0) / 3.6e6;
    console.log(`${new Date().toISOString().slice(0, 19)} [${finished}/${todo.length}] ${key}: ${script.texts.length} clips (${newHere} new), ${clips} total, ${hrs.toFixed(2)} h`);
  }
  await browser.close();
  console.log(`done: ${clips} clips requested, ${made} generated`);
})().catch(e => { console.error(e); process.exit(1); });
