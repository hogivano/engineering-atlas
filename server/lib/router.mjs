// Routes every /api/* request except /api/interview (which keeps its own handler in
// netlify/functions/interview.mjs). Used by netlify/functions/api.mjs and server/api.mjs.
import { HttpError, json, errorResponse, requireSameOrigin } from "./http.mjs";
import { getUser } from "./auth.mjs";
import { accountsConfigured, adminDeleteUser } from "./supabase.mjs";
import { aiConfigured } from "./openai.mjs";
import { startHandler, submitHandler, verifyHandler } from "./assess.mjs";
import * as orgs from "./orgs.mjs";
import { ttsInfo, ttsHandler } from "./tts.mjs";

export function healthHandler() {
  return json(200, {
    ok: true,
    version: process.env.APP_VERSION || "dev",
    interview: aiConfigured(),
    accounts: accountsConfigured(),
  }, { "access-control-allow-origin": "*" });
}

// POST /api/account/delete: deletes the auth user; every row keyed to it cascades.
export async function deleteAccountHandler(req) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await adminDeleteUser(user.id);
  return json(200, { deleted: true });
}

// [method, pattern, handler(req, ctx, ...captures)]
const SEG = "([^/]+)";
const ROUTES = [
  ["GET", /^\/api\/health$/, healthHandler],
  ["GET", /^\/api\/tts$/, ttsInfo],
  ["POST", /^\/api\/tts$/, ttsHandler],
  ["POST", /^\/api\/assess\/start$/, startHandler],
  ["POST", /^\/api\/assess\/submit$/, submitHandler],
  ["GET", new RegExp(`^/api/verify/${SEG}$`), verifyHandler],
  ["POST", /^\/api\/account\/delete$/, deleteAccountHandler],
  ["POST", /^\/api\/org\/create$/, orgs.createOrg],
  ["POST", /^\/api\/org\/join$/, orgs.joinOrg],
  ["GET", /^\/api\/org\/me$/, orgs.myOrgs],
  ["GET", new RegExp(`^/api/org/${SEG}/members$`), orgs.listMembers],
  ["POST", new RegExp(`^/api/org/${SEG}/assign$`), orgs.createAssignment],
  ["DELETE", new RegExp(`^/api/org/${SEG}/assign/${SEG}$`), orgs.deleteAssignment],
  ["POST", new RegExp(`^/api/org/${SEG}/role$`), orgs.setRole],
  ["DELETE", new RegExp(`^/api/org/${SEG}/member/${SEG}$`), orgs.removeMember],
  ["POST", new RegExp(`^/api/org/${SEG}/slack$`), orgs.setSlack],
  ["POST", new RegExp(`^/api/org/${SEG}/lessons$`), orgs.saveLesson],
  ["DELETE", new RegExp(`^/api/org/${SEG}/lessons(?:/${SEG})?$`), orgs.deleteLesson],
];

export async function route(req, ctx = {}) {
  try {
    const pathname = new URL(req.url).pathname.replace(/\/+$/, "") || "/";
    const method = req.method === "HEAD" ? "GET" : req.method;
    if (method === "OPTIONS") return new Response(null, { status: 204, headers: { allow: "GET, POST, DELETE" } });
    let pathMatched = false;
    for (const [m, re, handler] of ROUTES) {
      const match = re.exec(pathname);
      if (!match) continue;
      pathMatched = true;
      if (m !== method) continue;
      let params;
      try { params = match.slice(1).map((s) => (s === undefined ? undefined : decodeURIComponent(s))); }
      catch { throw new HttpError(400, "Invalid path."); }
      return await handler(req, ctx, ...params);
    }
    if (pathMatched) throw new HttpError(405, "Method not allowed.");
    throw new HttpError(404, "Not found.");
  } catch (err) {
    return errorResponse(err);
  }
}

export default route;
