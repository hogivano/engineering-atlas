// Weekly Slack digest for organizations that set a webhook (POST /api/org/<id>/slack).
// Runs on Netlify via netlify/functions/digest.mjs (Mondays 09:00 UTC) and in server/api.mjs.
import { db, inList, accountsConfigured } from "./supabase.mjs";
import { weekStats, isoDay } from "./summary.mjs";

export function digestText({ orgName, memberCount, activeCount, masteredCount, overdue = [], today }) {
  const lines = [
    `*Engineering Atlas weekly digest: ${orgName}* (week to ${today})`,
    `• Active this week: ${activeCount} of ${memberCount} member${memberCount === 1 ? "" : "s"}`,
    `• Lessons mastered this week: ${masteredCount}`,
  ];
  if (overdue.length) {
    const shown = overdue.slice(0, 5).map((a) => `${a.target} (due ${a.due_date})`).join(", ");
    lines.push(`• Overdue assignments: ${overdue.length}: ${shown}${overdue.length > 5 ? ", …" : ""}`);
  } else {
    lines.push("• Overdue assignments: none");
  }
  return lines.join("\n");
}

export async function buildOrgDigest(org, nowMs = Date.now()) {
  const today = isoDay(nowMs);
  const members = await db.select("org_members", { select: "user_id", org_id: `eq.${org.id}` });
  const ids = members.map((m) => m.user_id);
  const [progress, overdue] = await Promise.all([
    ids.length ? db.select("progress", { select: "user_id,state", user_id: inList(ids) }) : [],
    db.select("assignments", { select: "target,due_date", org_id: `eq.${org.id}`, due_date: `lt.${today}`, order: "due_date.asc" }),
  ]);
  let activeCount = 0, masteredCount = 0;
  for (const p of progress) {
    const w = weekStats(p.state, nowMs);
    if (w.active) activeCount++;
    masteredCount += w.masteredThisWeek;
  }
  return digestText({ orgName: org.name, memberCount: ids.length, activeCount, masteredCount, overdue, today });
}

// Posts one digest per org with a webhook. Returns [{orgId, ok, status?, error?}].
export async function sendDigests({ now = Date.now() } = {}) {
  if (!accountsConfigured()) return [];
  const secrets = await db.select("org_secrets", { select: "org_id,slack_webhook", slack_webhook: "not.is.null" });
  if (!secrets.length) return [];
  const orgs = await db.select("orgs", { select: "id,name", id: inList(secrets.map((s) => s.org_id)) });
  const nameOf = new Map(orgs.map((o) => [o.id, o.name]));
  const results = [];
  for (const s of secrets) {
    if (!nameOf.has(s.org_id) || !String(s.slack_webhook).startsWith("https://hooks.slack.com/")) continue;
    try {
      const text = await buildOrgDigest({ id: s.org_id, name: nameOf.get(s.org_id) }, now);
      const res = await fetch(s.slack_webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(10000),
      });
      results.push({ orgId: s.org_id, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({ orgId: s.org_id, ok: false, error: String(err && err.message || err) });
    }
  }
  return results;
}
