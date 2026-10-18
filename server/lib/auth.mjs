// Authenticates API requests with the user's Supabase access token:
//   Authorization: Bearer <access token>
// The token is verified by Supabase (GET /auth/v1/user), so expired or forged tokens are rejected.
import { HttpError } from "./http.mjs";
import { userFromToken } from "./supabase.mjs";

export async function getUser(req) {
  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+([A-Za-z0-9._~+/=-]{10,4096})$/i.exec(h.trim());
  if (!m) throw new HttpError(401, "Sign in required.");
  const user = await userFromToken(m[1]);
  if (!user) throw new HttpError(401, "Your session has expired. Please sign in again.");
  return user;
}

// Name for certificates and org rosters: explicit display name, then profile name, then email.
export function defaultName(user) {
  const meta = (user && user.user_metadata) || {};
  const full = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";
  const fromEmail = typeof user?.email === "string" ? user.email.split("@")[0] : "";
  // eslint-disable-next-line no-control-regex
  const pick = (full || fromEmail || "Learner").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return (pick || "Learner").slice(0, 60);
}
