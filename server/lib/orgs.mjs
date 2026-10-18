// Organizations: invite-code membership, roles, assignments, private lessons, team progress.
// All access control is enforced here; the tables have RLS on with no client policies.
import { randomBytes } from "node:crypto";
import { HttpError, json, readJson, requireSameOrigin, nowMs, isUuid, cleanText } from "./http.mjs";
import { getUser, defaultName } from "./auth.mjs";
import { db, inList, adminGetUser } from "./supabase.mjs";
import { summarizeState } from "./summary.mjs";

export const ORG_LIMITS = { maxOrgsPerUser: 20, maxMembersListed: 1000, maxLessonsPerOrg: 200, maxAssignmentsPerOrg: 500 };
export const ROLES = ["admin", "manager", "member"];
const STAFF = ["admin", "manager"];

// 10 characters from an alphabet without look-alikes (no 0/O, 1/I/L).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function inviteCode() {
  const bytes = randomBytes(10);
  let s = "";
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return s;
}

export const TARGET_RE = /^(course:[a-z0-9-]{1,40}|module:M\d{1,3}|lesson:[a-z0-9][a-z0-9/_-]{0,79}|skill:[a-z0-9_-]{1,60}:[a-z0-9_-]{1,20})$/i;

async function membership(orgId, userId) {
  const [m] = await db.select("org_members", { select: "org_id,user_id,role,display_name", org_id: `eq.${orgId}`, user_id: `eq.${userId}` });
  return m || null;
}

async function requireRole(orgId, user, roles) {
  if (!isUuid(orgId)) throw new HttpError(404, "Organization not found.");
  const m = await membership(orgId, user.id);
  if (!m) throw new HttpError(404, "Organization not found.");
  if (!roles.includes(m.role)) throw new HttpError(403, "You do not have permission to do this in this organization.");
  return m;
}

const orgOut = (o, role) => ({
  id: o.id, name: o.name, role, ...(STAFF.includes(role) ? { inviteCode: o.invite_code } : {}),
});
const assignmentOut = (a) => ({ id: a.id, orgId: a.org_id, target: a.target, dueDate: a.due_date, note: a.note, createdAt: a.created_at });
const lessonOut = (l) => ({ id: l.id, orgId: l.org_id, title: l.title, markdown: l.markdown, updatedAt: l.updated_at });

// POST /api/org/create {name, displayName?}
export async function createOrg(req) {
  requireSameOrigin(req);
  const user = await getUser(req);
  const body = await readJson(req);
  const name = cleanText(body.name, 80);
  if (!name) throw new HttpError(400, "name is required.");
  const displayName = cleanText(body.displayName ?? "", 60) || defaultName(user);
  const mine = await db.select("org_members", { select: "org_id", user_id: `eq.${user.id}` });
  if (mine.length >= ORG_LIMITS.maxOrgsPerUser) throw new HttpError(429, `You can belong to at most ${ORG_LIMITS.maxOrgsPerUser} organizations.`);

  let org = null;
  for (let i = 0; i < 4 && !org; i++) {
    try {
      [org] = await db.insert("orgs", { name, invite_code: inviteCode(), created_by: user.id });
    } catch (err) {
      if (!(err instanceof HttpError && err.status === 409)) throw err;
    }
  }
  if (!org) throw new HttpError(502, "Could not create the organization.");
  await db.insert("org_members", { org_id: org.id, user_id: user.id, role: "admin", display_name: displayName });
  return json(200, { org: orgOut(org, "admin") });
}

// POST /api/org/join {code, displayName?}
export async function joinOrg(req) {
  requireSameOrigin(req);
  const user = await getUser(req);
  const body = await readJson(req);
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase().replace(/[\s-]/g, "") : "";
  if (!/^[A-Z0-9]{10}$/.test(code)) throw new HttpError(400, "Invalid invite code.");
  const displayName = cleanText(body.displayName ?? "", 60) || defaultName(user);
  const [org] = await db.select("orgs", { select: "id,name,invite_code", invite_code: `eq.${code}` });
  if (!org) throw new HttpError(404, "No organization uses this invite code.");
  const existing = await membership(org.id, user.id);
  if (existing) return json(200, { org: orgOut(org, existing.role), alreadyMember: true });
  const mine = await db.select("org_members", { select: "org_id", user_id: `eq.${user.id}` });
  if (mine.length >= ORG_LIMITS.maxOrgsPerUser) throw new HttpError(429, `You can belong to at most ${ORG_LIMITS.maxOrgsPerUser} organizations.`);
  try {
    await db.insert("org_members", { org_id: org.id, user_id: user.id, role: "member", display_name: displayName });
  } catch (err) {
    if (!(err instanceof HttpError && err.status === 409)) throw err;
  }
  return json(200, { org: orgOut(org, "member") });
}

// GET /api/org/me
export async function myOrgs(req) {
  const user = await getUser(req);
  const mine = await db.select("org_members", { select: "org_id,role", user_id: `eq.${user.id}` });
  if (!mine.length) return json(200, { orgs: [], assignments: [], lessons: [] });
  const ids = mine.map((m) => m.org_id);
  const [orgs, assignments, lessons] = await Promise.all([
    db.select("orgs", { select: "id,name,invite_code", id: inList(ids) }),
    db.select("assignments", { select: "id,org_id,target,due_date,note,created_at", org_id: inList(ids), order: "created_at.desc" }),
    db.select("org_lessons", { select: "id,org_id,title,markdown,updated_at", org_id: inList(ids), order: "updated_at.desc" }),
  ]);
  const roleOf = new Map(mine.map((m) => [m.org_id, m.role]));
  return json(200, {
    orgs: orgs.map((o) => orgOut(o, roleOf.get(o.id))),
    assignments: assignments.map(assignmentOut),
    lessons: lessons.map(lessonOut),
  });
}

// GET /api/org/<id>/members  (manager/admin)
export async function listMembers(req, ctx, orgId) {
  const user = await getUser(req);
  await requireRole(orgId, user, STAFF);
  const members = await db.select("org_members", {
    select: "user_id,role,display_name,joined_at", org_id: `eq.${orgId}`, order: "joined_at.asc", limit: String(ORG_LIMITS.maxMembersListed),
  });
  const ids = members.map((m) => m.user_id);
  const [progress, certs, users] = await Promise.all([
    ids.length ? db.select("progress", { select: "user_id,state", user_id: inList(ids) }) : [],
    ids.length ? db.select("certificates", { select: "user_id,title", user_id: inList(ids), revoked: "is.false", order: "issued_at.asc" }) : [],
    Promise.all(ids.map((id) => adminGetUser(id).catch(() => null))),
  ]);
  const stateOf = new Map(progress.map((p) => [p.user_id, p.state]));
  const certsOf = new Map();
  for (const c of certs) certsOf.set(c.user_id, [...(certsOf.get(c.user_id) || []), c.title]);
  const now = nowMs(ctx);
  return json(200, members.map((m, i) => ({
    userId: m.user_id,
    displayName: m.display_name,
    email: users[i]?.email || null,
    role: m.role,
    joinedAt: m.joined_at,
    summary: summarizeState(stateOf.get(m.user_id), certsOf.get(m.user_id) || [], now),
  })));
}

// POST /api/org/<id>/assign {target, dueDate?, note?}  (manager/admin)
export async function createAssignment(req, ctx, orgId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await requireRole(orgId, user, STAFF);
  const body = await readJson(req);
  const target = typeof body.target === "string" ? body.target.trim() : "";
  if (!TARGET_RE.test(target)) {
    throw new HttpError(400, "target must be course:<id>, module:<M#>, lesson:<course/slug> or skill:<id>:<level>.");
  }
  let dueDate = null;
  if (body.dueDate != null && body.dueDate !== "") {
    if (typeof body.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate) ||
        Number.isNaN(Date.parse(`${body.dueDate}T00:00:00Z`)) ||
        new Date(`${body.dueDate}T00:00:00Z`).toISOString().slice(0, 10) !== body.dueDate) {
      throw new HttpError(400, "dueDate must be YYYY-MM-DD.");
    }
    dueDate = body.dueDate;
  }
  const note = body.note == null ? null : cleanText(body.note, 500) || null;
  const existing = await db.select("assignments", { select: "id", org_id: `eq.${orgId}` });
  if (existing.length >= ORG_LIMITS.maxAssignmentsPerOrg) throw new HttpError(429, "This organization has too many assignments.");
  const [a] = await db.insert("assignments", { org_id: orgId, target, due_date: dueDate, note, created_by: user.id });
  return json(200, { assignment: assignmentOut(a) });
}

// DELETE /api/org/<id>/assign/<assignmentId>  (manager/admin)
export async function deleteAssignment(req, ctx, orgId, assignmentId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await requireRole(orgId, user, STAFF);
  if (!isUuid(assignmentId)) throw new HttpError(404, "Assignment not found.");
  const rows = await db.remove("assignments", { id: `eq.${assignmentId}`, org_id: `eq.${orgId}` });
  if (!rows.length) throw new HttpError(404, "Assignment not found.");
  return json(200, { deleted: true });
}

async function adminCount(orgId) {
  return (await db.select("org_members", { select: "user_id", org_id: `eq.${orgId}`, role: "eq.admin" })).length;
}

// POST /api/org/<id>/role {userId, role}  (admin)
export async function setRole(req, ctx, orgId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await requireRole(orgId, user, ["admin"]);
  const body = await readJson(req);
  if (!isUuid(body.userId)) throw new HttpError(400, "Invalid userId.");
  if (!ROLES.includes(body.role)) throw new HttpError(400, "role must be admin, manager or member.");
  const target = await membership(orgId, body.userId);
  if (!target) throw new HttpError(404, "That person is not a member of this organization.");
  if (target.role === "admin" && body.role !== "admin" && (await adminCount(orgId)) <= 1) {
    throw new HttpError(409, "An organization needs at least one admin. Promote someone else first.");
  }
  await db.update("org_members", { org_id: `eq.${orgId}`, user_id: `eq.${body.userId}` }, { role: body.role });
  return json(200, { userId: body.userId, role: body.role });
}

// DELETE /api/org/<id>/member/<userId>  (admin, or the member themself to leave)
export async function removeMember(req, ctx, orgId, userId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  if (!isUuid(orgId) || !isUuid(userId)) throw new HttpError(404, "Member not found.");
  const self = userId === user.id;
  const me = await membership(orgId, user.id);
  if (!me) throw new HttpError(404, "Organization not found.");
  if (!self && me.role !== "admin") throw new HttpError(403, "Only admins can remove members.");
  const target = self ? me : await membership(orgId, userId);
  if (!target) throw new HttpError(404, "Member not found.");
  const members = await db.select("org_members", { select: "user_id,role", org_id: `eq.${orgId}` });
  if (members.length === 1) {
    // Last member leaving: remove the organization (cascades to members, secrets, lessons, assignments).
    await db.remove("orgs", { id: `eq.${orgId}` });
    return json(200, { removed: true, orgDeleted: true });
  }
  if (target.role === "admin" && members.filter((m) => m.role === "admin").length <= 1) {
    throw new HttpError(409, "An organization needs at least one admin. Promote someone else first.");
  }
  await db.remove("org_members", { org_id: `eq.${orgId}`, user_id: `eq.${userId}` });
  return json(200, { removed: true });
}

// POST /api/org/<id>/slack {webhookUrl}  (admin). An empty string removes the webhook.
export async function setSlack(req, ctx, orgId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await requireRole(orgId, user, ["admin"]);
  const body = await readJson(req);
  const url = typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : null;
  if (url === null) throw new HttpError(400, "webhookUrl is required.");
  if (url && (!/^https:\/\/hooks\.slack\.com\/[A-Za-z0-9/_-]+$/.test(url) || url.length > 300)) {
    throw new HttpError(400, "webhookUrl must be a Slack incoming webhook (https://hooks.slack.com/...).");
  }
  await db.insert("org_secrets", { org_id: orgId, slack_webhook: url || null }, { upsert: true });
  return json(200, { slack: !!url });
}

// POST /api/org/<id>/lessons {id?, title, markdown}  (admin/manager): create, or update when id is given.
export async function saveLesson(req, ctx, orgId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await requireRole(orgId, user, STAFF);
  const body = await readJson(req);
  const title = cleanText(body.title, 120);
  if (!title) throw new HttpError(400, "title is required.");
  if (typeof body.markdown !== "string") throw new HttpError(400, "markdown must be a string.");
  if (body.markdown.length > 60000) throw new HttpError(400, "markdown is longer than 60000 characters.");
  const row = { title, markdown: body.markdown, updated_at: new Date(nowMs(ctx)).toISOString() };
  if (body.id != null) {
    if (!isUuid(body.id)) throw new HttpError(404, "Lesson not found.");
    const [l] = await db.update("org_lessons", { id: `eq.${body.id}`, org_id: `eq.${orgId}` }, row);
    if (!l) throw new HttpError(404, "Lesson not found.");
    return json(200, { lesson: lessonOut(l) });
  }
  const existing = await db.select("org_lessons", { select: "id", org_id: `eq.${orgId}` });
  if (existing.length >= ORG_LIMITS.maxLessonsPerOrg) throw new HttpError(429, "This organization has too many lessons.");
  const [l] = await db.insert("org_lessons", { org_id: orgId, created_by: user.id, ...row });
  return json(200, { lesson: lessonOut(l) });
}

// DELETE /api/org/<id>/lessons/<lessonId>  or  DELETE /api/org/<id>/lessons {id}  (admin/manager)
export async function deleteLesson(req, ctx, orgId, lessonId) {
  requireSameOrigin(req);
  const user = await getUser(req);
  await requireRole(orgId, user, STAFF);
  let id = lessonId;
  if (!id) id = (await readJson(req)).id;
  if (!isUuid(id)) throw new HttpError(404, "Lesson not found.");
  const rows = await db.remove("org_lessons", { id: `eq.${id}`, org_id: `eq.${orgId}` });
  if (!rows.length) throw new HttpError(404, "Lesson not found.");
  return json(200, { deleted: true });
}
