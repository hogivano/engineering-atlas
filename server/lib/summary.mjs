// Progress summaries computed from a user's public.progress.state (the client's state object:
// done {chapterId: true} with chapter ids starting "c_", mastery {lessonKey: {s, at, placed?}},
// activity {"YYYY-MM-DD": count}).

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);
const DAY = 86400e3;

export function streakOf(activity, nowMs) {
  const a = activity && typeof activity === "object" ? activity : {};
  let d = nowMs;
  if (!a[isoDay(d)]) d -= DAY; // a streak may end yesterday
  let n = 0;
  while (a[isoDay(d)] && n < 1000) { n++; d -= DAY; }
  return n;
}

export function summarizeState(state, certificateTitles = [], nowMs = Date.now()) {
  const s = state && typeof state === "object" ? state : {};
  const done = s.done && typeof s.done === "object" ? s.done : {};
  const mastery = s.mastery && typeof s.mastery === "object" ? s.mastery : {};
  const activity = s.activity && typeof s.activity === "object" ? s.activity : {};
  const days = Object.keys(activity).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && activity[k]).sort();
  return {
    completed: Object.keys(done).filter((k) => k.startsWith("c_") && done[k]).length,
    mastered: Object.values(mastery).filter((m) => m && Number(m.s) >= 0.7).length,
    streak: streakOf(activity, nowMs),
    lastActive: days.length ? days[days.length - 1] : null,
    certificates: certificateTitles,
  };
}

// Weekly numbers for the Slack digest.
export function weekStats(state, nowMs = Date.now()) {
  const s = state && typeof state === "object" ? state : {};
  const since = isoDay(nowMs - 7 * DAY);
  const activity = s.activity && typeof s.activity === "object" ? s.activity : {};
  const mastery = s.mastery && typeof s.mastery === "object" ? s.mastery : {};
  return {
    active: Object.keys(activity).some((d) => d >= since && activity[d]),
    masteredThisWeek: Object.values(mastery).filter((m) => m && Number(m.s) >= 0.7 && !m.placed && typeof m.at === "string" && m.at >= since).length,
  };
}

export { isoDay };
