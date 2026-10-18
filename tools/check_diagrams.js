// Render every mermaid diagram in lessons/ with the same mermaid version the site uses, in headless
// Chrome, and fail if any diagram does not parse or render.
// Usage: CHROME=/path/to/chrome node tools/check_diagrams.js [lessons/sd/foo.md ...]   (run `npm ci` in tools/ first)
// With file arguments, only those lessons are checked.
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const root = path.join(__dirname, "..");
const blocks = [];
for (const dir of fs.readdirSync(path.join(root, "lessons"))) {
  const full = path.join(root, "lessons", dir);
  if (!fs.statSync(full).isDirectory()) continue;
  for (const f of fs.readdirSync(full).filter(f => f.endsWith(".md"))) {
    const md = fs.readFileSync(path.join(full, f), "utf8");
    for (const m of md.matchAll(/```mermaid\n([\s\S]*?)```/g)) blocks.push({ file: `lessons/${dir}/${f}`, src: m[1] });
  }
}
const only = process.argv.slice(2).map(p => path.relative(root, path.resolve(p)));
if (only.length) blocks.splice(0, blocks.length, ...blocks.filter(b => only.includes(b.file)));

(async () => {
  const chrome = process.env.CHROME || "/usr/bin/google-chrome";
  const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ path: require.resolve("mermaid/dist/mermaid.min.js") });
  const results = await page.evaluate(async (blocks) => {
    window.mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
    const out = [];
    for (let i = 0; i < blocks.length; i++) {
      try { await window.mermaid.render("d" + i, blocks[i].src); out.push(null); }
      catch (e) { out.push(String(e && e.message || e).split("\n").slice(0, 3).join(" ")); }
    }
    return out;
  }, blocks);
  await browser.close();
  const bad = results.map((err, i) => err && `${blocks[i].file}: ${err}`).filter(Boolean);
  console.log(`${blocks.length - bad.length}/${blocks.length} diagrams render`);
  if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
})();
