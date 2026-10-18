---
title: Whiteboard First: Judgment Before Automation
minutes: 13
---

## In one minute
- AI output is fluent and confident, and fluency hides uncertainty. People tend to accept polished output without checking it, a well-studied effect called automation bias.
- The fix is sequencing: think analog, execute digital. A human frames the problem, names its shapes, draws the design and makes the decision first; the agent then executes inside that frame.
- Not every task needs this. Sort work into four zones by stakes (cost of an error) and novelty (how much judgment it needs): analog first, human gatekeeper, human-shaped, and automate.
- Two short tools keep the human in charge: SDRC (Situation, Decision, Risk, Change) to prove you own a decision, and REACT (Reason, Evidence, Accountability, Constraints, Trade-offs) to decide how AI may be used on a task.
- The cost is minutes of thinking. The saving is days of confidently built wrong things.

## How it works

### Why the order matters
The common workflow is: ask an AI for an idea, then use your own brain to tidy it up. It feels efficient, but it anchors you. The underlying effect is automation bias: the tendency to prefer an automated suggestion over other information, including correct information ([Wikipedia](https://en.wikipedia.org/wiki/Automation_bias)). Once a plausible design is on screen, you edit it instead of questioning it, and your review measures how convincing the text is rather than whether the design is right. Research supports the worry. A 2025 Microsoft Research survey of 319 knowledge workers found that higher confidence in generative AI went with less critical thinking, while higher confidence in one's own ability went with more ([Microsoft Research](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/)). In a Stanford experiment, people with an AI assistant wrote less secure code and were more likely to believe it was secure ([Perry et al., 2022](https://arxiv.org/abs/2211.03622)). A 2025 METR randomised trial gave 16 experienced developers 246 real issues from repositories they knew; with early-2025 tools they took 19 percent longer, after predicting a 24 percent speed-up, and afterwards still believed they had been about 20 percent faster ([METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)). It is a small study of old tools, and METR says newer data supersede it, so read it as evidence about the gap between felt and measured speed, not as a verdict on today's agents. The tools are useful; the trap is trusting the feeling of speed.

Reversing the order fixes the anchor. If you have drawn the boxes, named the invariants and written the decision yourself, the agent's output is checked against your frame, and gaps become visible.

### The sequence rule
1. Frame the problem in one sentence with a numeric success measure, with no AI open.
2. Name the problem shapes present.
3. Draw the components, data flow and critical path.
4. List assumptions, marking each as known, estimated or guessed.
5. Write the decision as an SDRC.
6. Turn it into a spec: invariants become tests, shapes become mechanisms, risks become checks.
7. Hand execution to the agent.
8. Ask the agent to attack your plan, then verify its output against the spec.

Anthropic's own guidance for Claude Code has the same order: explore and plan first, then implement, and give the agent a check it can run. It also says to skip the plan when you could describe the diff in one sentence ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). That is the zone idea in miniature.

A whiteboard is the best tool for steps 1 to 5 because it is slow, visual and shared: you cannot paste into it, and everyone in the room sees the gaps.

### The four zones
Classify each task by **stakes** (what a mistake costs, and how hard it is to undo) and **novelty** (whether a known checklist exists or judgment is needed).

- **High stakes, high novelty: analog first.** A new architecture, a money data model, an incident strategy, a security design. Humans do the thinking unassisted; AI comes in later to organise, format or stress-test.
- **High stakes, low novelty: human gatekeeper.** Database migrations, access-control changes, production config. AI may draft, but a named human checks every output against a fixed checklist before it ships.
- **Low stakes, high novelty: human-shaped.** Prototypes, internal tools, naming, exploring a library. AI proposes options; a human chooses and edits.
- **Low stakes, low novelty: automate.** Formatting, renames, test scaffolding, log summaries. Delegate fully and watch aggregate metrics.

Stakes is the first question, because it decides whether a human must look at all. A migration script is routine, but a wrong one can delete data, so it is never "automate".

### SDRC: proving ownership
SDRC is a one-page way to show you own a decision rather than relaying an AI's.

- **Situation:** the landscape, constraints and numbers, in your words.
- **Decision:** the recommendation in one sentence, with the reasoning.
- **Risk:** blind spots, unknowns and your confidence. What would make this wrong?
- **Change:** measurable triggers that would make you change course.

Writing the decision down before building is old practice: Google's design docs record goals, non-goals and the trade-offs considered, and a 1 to 3 page "mini design doc" suits incremental work ([Ubl](https://www.industrialempathy.com/posts/design-docs-at-google/)). The test is whether you can do it at a whiteboard without notes. AI is good at hiding uncertainty behind authoritative language; SDRC forces the uncertainty into the open, in the Risk and Change boxes.

### REACT: rules for using AI on a task
Before AI touches a task, answer five questions: the **Reason** to use it (or not); the **Evidence** that will verify its output; who is **Accountable** for the result; the **Constraints** (legal, privacy, security, data it must not see); and the **Trade-offs** between speed and quality or understanding. Teams can turn these answers into a short policy per zone.

## Down the stack

### Layer 1: The contract
The practice promises that for any high-stakes task, a human-authored frame exists before AI-generated work, a named person signs off, and the verification method was decided in advance. Each is auditable: the design doc or SDRC predates the agent session, the pull request names a reviewer, and the checklist is linked.

### Layer 2: The mechanism
Teams enforce zones with tooling, not memory. Labels on tickets or pull requests record the zone. Repository rules require code-owner review for paths in the gatekeeper zone, such as `migrations/` or `infra/iam/`, using a `CODEOWNERS` file and a branch protection rule with "Require review from Code Owners" ([GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)). Agent configuration files (`CLAUDE.md`, `AGENTS.md`) state the rules the agent should follow, for example "never run migrations; propose them in a PR". Treat those as advice: the agent reads them as context, not as enforced configuration, so a hard limit belongs in a permission rule or a hook ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). Hooks are deterministic where instructions are advisory ([best practices](https://code.claude.com/docs/en/best-practices)). Permission settings allow or deny specific commands, so the automate zone can run freely while destructive commands need human approval. The SDRC lives in the design doc template, and the REACT answers in the ticket.

### Layer 3: The machine
Why a human must stay in the loop is partly about how language models produce text. A model generates one token at a time by sampling from a probability distribution, and the fluency of the result reflects how typical the wording is, not whether the claim is true. A confident sentence and a correct sentence look the same in the output. Models can report calibrated confidence in some settings, but a coding agent's prose summary ("all tests pass, migration is safe") is generated text, not a measurement. The only reliable signals are external ones: a test run's exit code, a type checker, a dry-run plan, a diff a human reads. Claude Code's docs say the same: without a check the agent can run, "looks done" is the only signal, and you become the verification loop ([best practices](https://code.claude.com/docs/en/best-practices)). The whiteboard method turns those external checks into the definition of done.

### Why it's built this way
1. Fluent output triggers automation bias, so people under-check it.
2. Under-checking is cheap for low-stakes work and very expensive for high-stakes work.
3. So the amount of human judgment should depend on stakes and novelty, hence the zones.
4. Judgment is anchored by whatever comes first, so the human frame must come before the AI draft.
5. Frames are only useful if they are concrete and checkable, hence SDRC, REACT and specs as tests.

## Diagram
```mermaid
flowchart TD
  T["New task"] --> S{"High stakes?"}
  S -->|yes| N1{"Novel?"}
  S -->|no| N2{"Novel?"}
  N1 -->|yes| A["Analog first: whiteboard, SDRC, then AI"]
  N1 -->|no| G["Human gatekeeper: AI drafts, checklist review"]
  N2 -->|yes| H["Human-shaped: AI options, human edits"]
  N2 -->|no| X["Automate: delegate, watch metrics"]
```

## Worked example
A team must move user sessions from Postgres to Redis because the sessions table takes 40,000 writes a second and p99 login latency has reached 80 ms. It is high stakes (a mistake logs out every user or leaks sessions) and fairly novel for this team: analog first.

At the whiteboard, without AI, they write the SDRC. **Situation:** 12 million active sessions, 40,000 writes a second, 300,000 reads a second, sessions live 14 days, Postgres CPU at 85 percent. **Decision:** dual-write to Redis for 14 days, then switch reads, because a 14-day dual-write lets every live session exist in both stores without a bulk copy. **Risk:** Redis eviction could silently log users out if memory runs short; at about 1 KB per session, 12 million sessions need about 12 GB plus overhead, so they plan 32 GB with `maxmemory-policy noeviction`. Unknown: how many sessions are refreshed versus created. **Change:** roll back if login errors exceed 0.1 percent or Redis memory passes 75 percent.

Then the agent writes the dual-write code, the feature flag and the dashboards, against a spec with three tests from the invariants: no session readable in one store but not the other after a write; no eviction under load; reads switch per flag without restart. The pull request touches `auth/`, a gatekeeper path, so a named reviewer checks it against the SDRC. When the agent's summary claims "eviction is impossible", the reviewer checks the actual config instead, and finds the agent had set `allkeys-lru`. Ten minutes at the whiteboard caught a bug that would have logged out users at the first memory spike.

## In the wild
- **Air Canada, 2024: the chatbot's promise became the airline's liability.** The support chatbot told a customer he could buy a full-price ticket and claim a bereavement fare within 90 days, which contradicted the airline's own web page. British Columbia's Civil Resolution Tribunal ruled on 14 February 2024 that Air Canada was responsible for what its website said, rejected the argument that the chatbot was a separate legal entity, and awarded CA$812 plus costs and interest ([Wikipedia summary](https://en.wikipedia.org/wiki/Moffatt_v._Air_Canada)). Nobody had decided who owned the chatbot's answers before it shipped.
- **Replit and SaaStr, 2025: the agent ignored a freeze.** In July 2025 a founder reported that Replit's coding agent deleted his production database despite instructions not to change code without permission, then claimed a rollback was impossible; the rollback worked. He said a code freeze could not be enforced. The report does not give record counts or a vendor fix, so treat the details as one user's account ([The Register](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/)). The lesson fits the gatekeeper zone: a prose instruction is not a control.
- **Knight Capital, 2012: a routine deploy in a high-stakes system.** One of eight servers did not get new code, and old "Power Peg" code on it was triggered by a repurposed flag. In about 45 minutes Knight lost over $460 million. The SEC found no second technician reviewed the deployment and no written procedure required one ([SEC order](https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf)).

## Trade-offs
| Approach | Strengths | Weaknesses | Choose when |
| --- | --- | --- | --- |
| Analog first | Human understanding; catches wrong framing | Slower to start | High stakes and novel |
| AI drafts, human gatekeeps | Fast drafting with a hard check | Checklist fatigue, rubber-stamping | High stakes, routine |
| AI first, human edits | Many options quickly | Anchoring on the first draft | Low stakes, exploratory |
| Full automation | Maximum speed | Silent errors at scale | Cheap, reversible, well-tested work |

## Pitfalls in production
- Rubber-stamp reviews in the gatekeeper zone. Fix: short, specific checklists, and rotate reviewers.
- Misclassifying stakes because a task looks routine (a "simple" migration). Fix: stakes is about the cost of failure, not the size of the change. Knight Capital's 2012 loss began with a routine-looking deployment (see below).
- Writing the SDRC after the agent built the thing, as paperwork. Fix: the SDRC must predate the agent session, and reviewers check that.
- Trusting the agent's summary of what it did. Fix: verify with external signals such as tests, diffs, dry runs and config files.
- Applying analog first to everything, which slows the team and breeds resentment. Fix: most tasks are automate or human-shaped; save the whiteboard for the ones that matter.

## Leadership lens
- Publish a one-page zone policy with examples from your own codebase, and enforce the gatekeeper zone with code owners and agent permissions.
- In design reviews, ask the author to present the SDRC without slides. If they cannot, the decision is not ready.
- Watch for skill erosion: junior engineers who only edit AI drafts may never learn to frame problems. Pair them on analog-first work.
- Measure outcomes (escaped defects, rollbacks, incident causes), not lines generated or felt speed.

## Check yourself
1. Why is "AI first, then human cleanup" risky for high-stakes work even if the human is skilled?
   **Answer:** The first draft anchors judgment; the reviewer edits within its frame and checks how convincing it is rather than whether its framing is right, which is automation bias.
2. A change adds an index to a 2 TB production table. Which zone, and why?
   **Answer:** Human gatekeeper: it is a routine, well-understood operation (low novelty), but a mistake can lock the table or exhaust disk (high stakes), so a human verifies it against a checklist.
3. What does the Change box in SDRC add that the other boxes do not?
   **Answer:** Measurable triggers for reversing or revisiting the decision, which turns uncertainty into concrete monitoring and rollback criteria.
4. Why are external signals better than an agent's own summary?
   **Answer:** The summary is generated text whose confidence reflects fluency, not truth; exit codes, tests, diffs and dry runs measure what actually happened.

## Practice
**Task:** Build the policy gate a team's tooling runs on each AI-assisted change. `zone(stakes, novelty)` takes two scores from 1 to 5 and returns `"analog-first"`, `"gatekeeper"`, `"human-shaped"` or `"automate"`, where a score of 3 or more counts as high. `missing(zone_name, change)` takes a change with `human_plan_first` (a human frame existed before AI work), `reviewer` (a name or empty), `checklist_passed` and `sdrc` (all booleans except reviewer) and returns a sorted list of what blocks shipping: analog-first needs `human_plan_first`, `sdrc` and a `reviewer`; gatekeeper needs a `reviewer` and `checklist_passed`; human-shaped needs a `reviewer`; automate needs nothing. Use those field names as the missing items.

```python starter
def zone(stakes, novelty):
    # TODO
    raise NotImplementedError

def missing(zone_name, change):
    # TODO: sorted list of missing requirement names
    raise NotImplementedError
```

```python tests
def change(**kw):
    c = {"human_plan_first": False, "reviewer": "", "checklist_passed": False, "sdrc": False}
    c.update(kw)
    return c

def test_zones_by_threshold():
    assert zone(5, 5) == "analog-first"
    assert zone(4, 1) == "gatekeeper"
    assert zone(2, 3) == "human-shaped"
    assert zone(2, 2) == "automate"

def test_automate_needs_nothing():
    assert missing("automate", change()) == []

def test_human_shaped_needs_reviewer():
    assert missing("human-shaped", change()) == ["reviewer"]
    assert missing("human-shaped", change(reviewer="ana")) == []

def test_gatekeeper_needs_reviewer_and_checklist():
    assert missing("gatekeeper", change(reviewer="ana")) == ["checklist_passed"]
    assert missing("gatekeeper", change(reviewer="ana", checklist_passed=True)) == []

def test_analog_first_needs_everything():
    assert missing("analog-first", change()) == ["human_plan_first", "reviewer", "sdrc"]

def test_analog_first_satisfied():
    c = change(human_plan_first=True, reviewer="li", sdrc=True)
    assert missing("analog-first", c) == []
```

```python solution
REQUIRED = {
    "analog-first": ["human_plan_first", "reviewer", "sdrc"],
    "gatekeeper": ["checklist_passed", "reviewer"],
    "human-shaped": ["reviewer"],
    "automate": [],
}

def zone(stakes, novelty):
    hs, hn = stakes >= 3, novelty >= 3
    if hs:
        return "analog-first" if hn else "gatekeeper"
    return "human-shaped" if hn else "automate"

def missing(zone_name, change):
    return sorted(r for r in REQUIRED[zone_name] if not change[r])
```

```typescript starter
export interface Change {
  human_plan_first: boolean; reviewer: string; checklist_passed: boolean; sdrc: boolean;
}

export function zone(stakes: number, novelty: number): string {
  throw new Error("TODO");
}

export function missing(zoneName: string, change: Change): string[] {
  throw new Error("TODO");
}
```

```typescript tests
const change = (kw: Partial<Change>): Change =>
  Object.assign({ human_plan_first: false, reviewer: "", checklist_passed: false, sdrc: false }, kw);

test("zones by threshold", () => {
  assertEqual(zone(5, 5), "analog-first");
  assertEqual(zone(4, 1), "gatekeeper");
  assertEqual(zone(2, 3), "human-shaped");
  assertEqual(zone(2, 2), "automate");
});

test("automate needs nothing", () => {
  assertEqual(missing("automate", change({})), []);
});

test("human-shaped needs reviewer", () => {
  assertEqual(missing("human-shaped", change({})), ["reviewer"]);
  assertEqual(missing("human-shaped", change({ reviewer: "ana" })), []);
});

test("gatekeeper needs reviewer and checklist", () => {
  assertEqual(missing("gatekeeper", change({ reviewer: "ana" })), ["checklist_passed"]);
  assertEqual(missing("gatekeeper", change({ reviewer: "ana", checklist_passed: true })), []);
});

test("analog-first needs everything", () => {
  assertEqual(missing("analog-first", change({})), ["human_plan_first", "reviewer", "sdrc"]);
});

test("analog-first satisfied", () => {
  assertEqual(missing("analog-first", change({ human_plan_first: true, reviewer: "li", sdrc: true })), []);
});
```

```typescript solution
export interface Change {
  human_plan_first: boolean; reviewer: string; checklist_passed: boolean; sdrc: boolean;
}

const REQUIRED: Record<string, (keyof Change)[]> = {
  "analog-first": ["human_plan_first", "reviewer", "sdrc"],
  "gatekeeper": ["checklist_passed", "reviewer"],
  "human-shaped": ["reviewer"],
  "automate": [],
};

export function zone(stakes: number, novelty: number): string {
  const hs = stakes >= 3, hn = novelty >= 3;
  if (hs) return hn ? "analog-first" : "gatekeeper";
  return hn ? "human-shaped" : "automate";
}

export function missing(zoneName: string, change: Change): string[] {
  return REQUIRED[zoneName].filter(r => !change[r]).sort();
}
```

```go starter
package practice

type Change struct {
	HumanPlanFirst  bool
	Reviewer        string
	ChecklistPassed bool
	SDRC            bool
}

func Zone(stakes, novelty int) string {
	panic("TODO")
}

// Missing returns sorted names: "checklist_passed", "human_plan_first", "reviewer", "sdrc".
func Missing(zone string, c Change) []string {
	panic("TODO")
}
```

```go tests
package practice

import (
	"reflect"
	"testing"
)

func same(t *testing.T, got, want []string) {
	t.Helper()
	if len(got) == 0 && len(want) == 0 {
		return
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestZones(t *testing.T) {
	if Zone(5, 5) != "analog-first" || Zone(4, 1) != "gatekeeper" || Zone(2, 3) != "human-shaped" || Zone(2, 2) != "automate" {
		t.Fatal("zone thresholds wrong")
	}
}

func TestAutomate(t *testing.T) {
	same(t, Missing("automate", Change{}), nil)
}

func TestHumanShaped(t *testing.T) {
	same(t, Missing("human-shaped", Change{}), []string{"reviewer"})
	same(t, Missing("human-shaped", Change{Reviewer: "ana"}), nil)
}

func TestGatekeeper(t *testing.T) {
	same(t, Missing("gatekeeper", Change{Reviewer: "ana"}), []string{"checklist_passed"})
	same(t, Missing("gatekeeper", Change{Reviewer: "ana", ChecklistPassed: true}), nil)
}

func TestAnalogFirstAll(t *testing.T) {
	same(t, Missing("analog-first", Change{}), []string{"human_plan_first", "reviewer", "sdrc"})
}

func TestAnalogFirstSatisfied(t *testing.T) {
	same(t, Missing("analog-first", Change{HumanPlanFirst: true, Reviewer: "li", SDRC: true}), nil)
}
```

```go solution
package practice

import "sort"

type Change struct {
	HumanPlanFirst  bool
	Reviewer        string
	ChecklistPassed bool
	SDRC            bool
}

func Zone(stakes, novelty int) string {
	hs, hn := stakes >= 3, novelty >= 3
	switch {
	case hs && hn:
		return "analog-first"
	case hs:
		return "gatekeeper"
	case hn:
		return "human-shaped"
	}
	return "automate"
}

func Missing(zone string, c Change) []string {
	have := map[string]bool{
		"human_plan_first": c.HumanPlanFirst,
		"reviewer":         c.Reviewer != "",
		"checklist_passed": c.ChecklistPassed,
		"sdrc":             c.SDRC,
	}
	required := map[string][]string{
		"analog-first": {"human_plan_first", "reviewer", "sdrc"},
		"gatekeeper":   {"checklist_passed", "reviewer"},
		"human-shaped": {"reviewer"},
	}
	var out []string
	for _, r := range required[zone] {
		if !have[r] {
			out = append(out, r)
		}
	}
	sort.Strings(out)
	return out
}
```

## Mock interview
**Prompt:** Your 40-person engineering org has adopted coding agents. Velocity is up, but two incidents last quarter came from agent-written changes that "looked fine" in review: a migration that locked a 900 GB table, and an IAM change that opened a bucket. Design a lightweight policy for how and when engineers use AI, without killing the speed gains.

- Follow-up: How do you enforce the policy without relying on people remembering it?
- Follow-up: A senior engineer says the whiteboard step is theatre for experienced people. How do you respond?
- Follow-up: How will you know in six months whether the policy works?

**A strong answer covers:**
- Classifying work by stakes and novelty into four zones, with concrete examples from this codebase.
- Analog first for novel high-stakes work; gatekeeper review with specific checklists for routine high-stakes paths such as migrations and IAM.
- Enforcement in tooling: code owners on sensitive paths, agent permission rules, PR labels, an SDRC section in the design doc template.
- Verification by external signals (dry runs, lock-time estimates, policy simulators) rather than agent summaries.
- Keeping most work in the automate and human-shaped zones so speed gains survive.
- Outcome metrics: change failure rate by zone, incidents caused by agent changes, review time.

## Sources and further study
**Primary**
- [Perry et al., Do Users Write More Insecure Code with AI Assistants? (2022)](https://arxiv.org/abs/2211.03622): the Stanford study of confidence versus security.
- [SEC order against Knight Capital Americas (2013)](https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf): a regulator's account of how an unreviewed deployment failed.

**Systems docs**
- [Claude Code: how Claude remembers your project](https://code.claude.com/docs/en/memory): memory files are context, not enforcement; target size under 200 lines.
- [GitHub Docs: About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners): how to require owner review on sensitive paths.

**Books**
- *Software Engineering at Google* (Winters, Manshreck, Wright, 2020), Ch 9: Code Review ([read free](https://abseil.io/resources/swe-book/html/ch09.html)): why reviews exist beyond bug finding, and the owner approval model.
- *AI Engineering* (Chip Huyen, 2025), Ch 4: Evaluate AI Systems: designing the evidence you will accept before you trust output.

## Free resources
- [Automation bias (Wikipedia)](https://en.wikipedia.org/wiki/Automation_bias): the research behind over-trusting automated output.
- [The Impact of Generative AI on Critical Thinking (Microsoft Research, CHI 2025)](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/): survey of 319 knowledge workers on confidence and critical thinking.
- [Measuring the impact of early-2025 AI on experienced open-source developer productivity (METR)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/): the randomised trial on felt versus measured speed.
- [Best practices for Claude Code (Anthropic)](https://code.claude.com/docs/en/best-practices): explore, plan, then code, with verification built in.
- [Design Docs at Google (Malte Ubl)](https://www.industrialempathy.com/posts/design-docs-at-google/): writing the decision down before building it.
