// Build artifacts the API reads at runtime (bundled on Netlify via netlify.toml `included_files`):
//   dist/mocks.json    {lessonKey: {title, prompt, followups, strong}}
//   dist/modules.json  {moduleId: {title, lessons: [lessonKey]}}
// ATLAS_DATA_DIR overrides the directory (used by tests and unusual layouts).
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cache = new Map();

function candidates(name) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const list = [];
  if (process.env.ATLAS_DATA_DIR) list.push(path.resolve(process.env.ATLAS_DATA_DIR, name));
  list.push(
    path.resolve(process.cwd(), "dist", name),
    path.resolve(here, "../../dist", name),
    path.resolve(here, "dist", name),
  );
  return list;
}

async function loadJson(name) {
  if (!cache.has(name)) {
    const p = (async () => {
      for (const file of candidates(name)) {
        try {
          return JSON.parse(await readFile(file, "utf8"));
        } catch (err) {
          if (err && err.code === "ENOENT") continue;
          throw err;
        }
      }
      throw new Error(`${name} not found`);
    })().catch((err) => {
      cache.delete(name); // retry on the next request
      throw err;
    });
    cache.set(name, p);
  }
  return cache.get(name);
}

export const loadMocks = () => loadJson("mocks.json");
export const loadModules = () => loadJson("modules.json");
// One lesson's full data (dist/lessons/<course>/<slug>.json); key format is validated by the caller.
export const loadLessonJson = (key) => loadJson(`lessons/${key}.json`);
export function resetDataCache() { cache.clear(); }

export const has = (obj, key) => !!obj && Object.prototype.hasOwnProperty.call(obj, key);
