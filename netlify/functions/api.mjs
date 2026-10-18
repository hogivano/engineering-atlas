// Engineering Atlas API on Netlify: every /api/* route except /api/interview (its own function).
// The route handlers live in server/lib and are shared with the self-hosted server (server/api.mjs).
// Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only) and, for assessments, OPENAI_API_KEY.
import { route } from "../../server/lib/router.mjs";

export default async (req, context) => route(req, { ip: context && context.ip });

export const config = { path: "/api/*", excludedPath: "/api/interview" };
