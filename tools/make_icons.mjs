// Render site/public/icons/icon.svg to the PNG app icons and a multi-size favicon.ico.
// Usage: cd tools && CHROME=/usr/bin/google-chrome node make_icons.mjs
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const pub = path.join(root, "site/public");
const svg = fs.readFileSync(path.join(pub, "icons/icon.svg"), "utf8");
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage();
async function png(size) {
  await page.setViewport({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  return page.screenshot({ omitBackground: true, type: "png" });
}
for (const [name, size] of [["icons/icon-192.png", 192], ["icons/icon-512.png", 512], ["icons/apple-touch-icon.png", 180], ["icons/icon-32.png", 32]]) {
  fs.writeFileSync(path.join(pub, name), await png(size));
}
// ICO container holding PNG images (supported by every current browser and Windows Vista+).
const imgs = [];
for (const s of [16, 32, 48]) imgs.push({ s, data: await png(s) });
const head = Buffer.alloc(6 + 16 * imgs.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
let off = head.length;
imgs.forEach(({ s, data }, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
  head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(data.length, e + 8); head.writeUInt32LE(off, e + 12);
  off += data.length;
});
fs.writeFileSync(path.join(pub, "favicon.ico"), Buffer.concat([head, ...imgs.map(x => x.data)]));
await browser.close();
console.log("icons written");
