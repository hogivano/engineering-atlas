// Supabase admin access over plain fetch (PostgREST + GoTrue), no SDK.
// Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The service role bypasses row level security,
// so this module must only ever run on the server.
import { HttpError } from "./http.mjs";

const env = () => ({
  url: (process.env.SUPABASE_URL || "").replace(/\/+$/, ""),
  service: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  anon: process.env.SUPABASE_ANON_KEY || "",
});

export const accountsConfigured = () => { const e = env(); return !!(e.url && e.service); };

function requireConfig() {
  const e = env();
  if (!e.url || !e.service) throw new HttpError(503, "Accounts are not configured on this server.");
  return e;
}

// New-style secret keys (sb_secret_...) are not JWTs and go in the apikey header only;
// legacy service_role JWTs go in both apikey and Authorization.
function serviceHeaders(key) {
  const h = { apikey: key };
  if (!key.startsWith("sb_")) h.authorization = `Bearer ${key}`;
  return h;
}

async function call(method, url, { headers = {}, body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { ...headers, ...(body !== undefined ? { "content-type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new HttpError(502, "Could not reach the database.");
  }
  return res;
}

async function rest(method, table, { query = {}, body, prefer } = {}) {
  const e = requireConfig();
  const qs = new URLSearchParams(query).toString();
  const res = await call(method, `${e.url}/rest/v1/${table}${qs ? `?${qs}` : ""}`, {
    headers: { ...serviceHeaders(e.service), accept: "application/json", ...(prefer ? { prefer } : {}) },
    body,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    if (res.status === 409 || (data && data.code === "23505")) throw new HttpError(409, "Conflict.", { code: "conflict" });
    console.error(`supabase ${method} ${table} -> ${res.status}: ${text.slice(0, 300)}`);
    throw new HttpError(502, "Database error.");
  }
  return Array.isArray(data) ? data : data == null ? [] : [data];
}

// Query values are PostgREST filters, e.g. {user_id: "eq.<uuid>", select: "id,name", order: "created_at.desc"}.
export const db = {
  select: (table, query) => rest("GET", table, { query }),
  insert: (table, rows, { upsert = false } = {}) =>
    rest("POST", table, {
      body: rows,
      prefer: `return=representation${upsert ? ",resolution=merge-duplicates" : ""}`,
    }),
  update: (table, query, patch) => rest("PATCH", table, { query, body: patch, prefer: "return=representation" }),
  remove: (table, query) => rest("DELETE", table, { query, prefer: "return=representation" }),
};

export const inList = (ids) => `in.(${ids.map((s) => String(s).replace(/[^0-9a-zA-Z_-]/g, "")).join(",")})`;

// ---------- Auth (GoTrue) ----------

// Verifies a user's access token. Returns the user object, or null when the token is invalid.
export async function userFromToken(token) {
  const e = requireConfig();
  const res = await call("GET", `${e.url}/auth/v1/user`, {
    headers: { apikey: e.anon || e.service, authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403 || res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new HttpError(502, "Could not verify the session.");
  const user = await res.json().catch(() => null);
  return user && typeof user.id === "string" ? user : null;
}

export async function adminGetUser(id) {
  const e = requireConfig();
  const res = await call("GET", `${e.url}/auth/v1/admin/users/${encodeURIComponent(id)}`, { headers: serviceHeaders(e.service) });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function adminDeleteUser(id) {
  const e = requireConfig();
  const res = await call("DELETE", `${e.url}/auth/v1/admin/users/${encodeURIComponent(id)}`, { headers: serviceHeaders(e.service) });
  if (!res.ok && res.status !== 404) {
    console.error(`supabase delete user -> ${res.status}`);
    throw new HttpError(502, "Could not delete the account.");
  }
  return true;
}
