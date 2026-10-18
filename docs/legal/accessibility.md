# Accessibility Statement

Last updated: 2026-10-16

## Our commitment

Engineering Atlas at https://engineering-atlas.hogivano.dev should be usable by as many people as possible, including people who use screen readers, keyboard-only navigation, magnification, voice control, or who have cognitive, motor or hearing impairments.

We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.

## What we do

- Semantic HTML with headings, landmarks and labelled form controls.
- Full keyboard access to lessons, quizzes, the code editor and navigation.
- Status messages announced to assistive technology.
- Light and dark themes built from contrast-checked colour tokens.
- Layouts that reflow to narrow screens and up to 400% zoom.
- Read-aloud using the browser's built-in speech synthesis.
- Text alternatives for diagrams where possible.

## Conformance status

Partially conformant with WCAG 2.2 AA, based on an automated self-assessment with axe-core 4.10 (rule sets wcag2a, wcag2aa, wcag21aa, wcag22aa) on the Today, Home, lesson, Review, Progress, Team, policy and design-system screens in light and dark mode, completed on 2026-10-16. That audit reports no violations. Automated tools find only part of the issues, so a manual audit with screen readers (NVDA, VoiceOver) is still to be done; until then we do not claim full conformance.

## Known gaps

To be completed after the audit. For each item list the issue, affected WCAG criterion, workaround and planned fix date.

| Area | Issue | WCAG criterion | Workaround | Planned fix |
|---|---|---|---|---|
| Diagrams (Mermaid SVG) | The diagram itself has no full text alternative; each diagram has an "All steps as text" list and the lesson prose describes it | 1.1.1 Non-text Content | Use the steps list and the surrounding text | Manual review planned |
| In-browser code editor | A plain textarea; Tab inserts indentation, so keyboard users leave it with Escape then Tab or Shift+Tab, which is not yet announced | 2.1.2 No Keyboard Trap (mitigated) | Run tests with Ctrl+Enter; the tests are also in a "Show the tests" section | Manual review planned |
| Timed assessments | The time limit (20 or 35 minutes) can't be extended in the product yet | 2.2.1 Timing Adjustable | Contact us for extra time (see below) | Planned |
| Third-party content: YouTube, giscus, Go Playground | Not audited | n/a | Lesson text covers the same material | Outside our control |

## Timed assessments

If a time limit is a barrier for you, contact us before or after the assessment. We will offer extra time or another arrangement where we can, and organisations using Atlas should do the same (see [Responsible AI and employment use](ai-use.md)).

## Feedback

If you meet a barrier, tell us:

- email [me@hogivano.dev](mailto:me@hogivano.dev), or
- open an issue at https://github.com/hogivano/engineering-atlas/issues with the label "accessibility".

Please include the page address, what you were trying to do, and the browser and assistive technology you use. We aim to reply within 10 working days.

## Enforcement

If you are not satisfied with our response, you may contact the body that enforces accessibility law in your country, if there is one (in the UK, for example, the Equality Advisory and Support Service).

## Review

We review this statement after each audit and at least once a year.
