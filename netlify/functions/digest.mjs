// Weekly Slack digest for organizations (scheduled function, Mondays 09:00 UTC).
import { sendDigests } from "../../server/lib/digest.mjs";

export default async () => {
  const results = await sendDigests();
  console.log(`digest: ${results.length} org(s), ${results.filter((r) => r.ok).length} sent`);
  return new Response(null, { status: 204 });
};

export const config = { schedule: "0 9 * * 1" };
