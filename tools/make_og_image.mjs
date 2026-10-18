// Render the 1200x630 social preview card (Open Graph / Twitter) to site/public/og-image.png.
// Usage: cd tools && CHROME=/usr/bin/google-chrome node make_og_image.mjs
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const logo = fs.readFileSync(path.join(root, "site/public/icons/icon.svg"), "utf8");
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; font-family: Geist, system-ui, sans-serif; color: #fafafa;
    background: radial-gradient(900px 500px at 85% 15%, #6d28d9 0%, transparent 60%),
                radial-gradient(700px 500px at 0% 100%, #4c1d95 0%, transparent 55%), #0b0b10; overflow: hidden; }
  .grid { position: absolute; inset: 0; background-image: linear-gradient(#ffffff0d 1px, transparent 1px), linear-gradient(90deg, #ffffff0d 1px, transparent 1px);
    background-size: 48px 48px; mask-image: linear-gradient(to bottom, #000 30%, transparent 95%); }
  .wrap { position: relative; padding: 72px 80px; height: 100%; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 18px; font-size: 30px; font-weight: 700; letter-spacing: -.01em; }
  .brand svg { width: 64px; height: 64px; }
  h1 { margin-top: 56px; font-size: 68px; line-height: 1.05; font-weight: 800; letter-spacing: -.03em; max-width: 900px; }
  h1 span { background: linear-gradient(90deg, #c4b5fd, #a78bfa); -webkit-background-clip: text; color: transparent; }
  p { margin-top: 24px; font-size: 27px; line-height: 1.4; color: #d4d4d8; max-width: 860px; }
  .chips { margin-top: auto; display: flex; gap: 12px; flex-wrap: wrap; }
  .chip { padding: 10px 18px; border-radius: 999px; background: #ffffff12; border: 1px solid #ffffff24; font-size: 21px; font-weight: 500; color: #e4e4e7; }
  .url { position: absolute; right: 80px; top: 92px; font-size: 21px; color: #a1a1aa; }
</style></head><body><div class="grid"></div><div class="wrap">
  <div class="brand">${logo}Engineering Atlas</div>
  <h1>What's behind the app <span>your agent built</span></h1>
  <p>Free, open curriculum: system design, scaling, debugging and incident response, with sources you can check.</p>
  <div class="chips"><span class="chip">457 lessons</span><span class="chip">Python · TypeScript · Go practice</span><span class="chip">Mock interviews</span></div>
  <div class="url">engineering-atlas.hogivano.dev</div>
</div></body></html>`;
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.setContent(html, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
fs.writeFileSync(path.join(root, "site/public/og-image.png"), await page.screenshot({ type: "png" }));
await browser.close();
console.log("og-image.png written");
