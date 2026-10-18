# Engineering Atlas design system

The visual language follows [shadcn/ui](https://ui.shadcn.com/) (zinc neutrals, a violet accent, the
Geist typeface, rounded bordered cards with subtle shadows, Lucide icons), re-created in plain CSS
because the app is a single static page with no build step. On top of that, every course has its own
color and every lesson section has an icon, so long lessons are easy to scan.

One small set of tokens and components that every screen is built from, so the app looks and behaves
the same everywhere, works in light and dark mode, and stays accessible as contributors add features.
The live reference is the **Design system** view in the app (`/#design`, also under More on phones).
Tokens live at the top of `site/src/style.css`.

## Principles

1. **Learning first.** Every screen answers "what should I do next?" One primary action per card.
2. **Calm and dense.** A logbook, not a dashboard: plain surfaces, one accent color, numbers in mono.
3. **Accessible by default.** WCAG 2.2 AA contrast in both themes, 44 px tap targets, visible focus,
   keyboard access for every control, text alternatives for diagrams, and reduced motion respected.
4. **Phone first.** Layouts are single-column at 390 px, with a bottom navigation bar and no
   horizontal scroll; wider screens add columns, not features.

## Tokens

| Group | Tokens | Use |
|---|---|---|
| Color | `--bg`, `--surface`, `--sunken`, `--ink`, `--muted`, `--line` | Page, cards, inset areas, text, secondary text, borders |
| Color (meaning) | `--accent`, `--accent-soft` | Primary actions, progress, mastered states |
| | `--today`, `--today-soft` | Time-sensitive items and warnings (due, protect your progress) |
| | `--missed` | Errors and failed tests |
| Spacing | `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 20 · `--sp-6` 24 · `--sp-8` 32 | All padding, gaps and margins |
| Type | `--fs-xs` 12 · `--fs-sm` 13 · `--fs-md` 15 · `--fs-lg` 18 · `--fs-xl` 22 · `--fs-2xl` 28 · `--fs-3xl` 36 | Body is `--fs-md`; headings use the display font |
| Fonts | `--font-display` and `--font-body` (Geist), `--font-mono` (Geist Mono) | Headings, text, code and numbers |
| Course colors | `--c-fd` teal, `--c-sd` indigo, `--c-sdi` orange, `--c-lld` purple, `--c-ps` pink, `--c-ai` amber; `--cc` is the current course | Lesson banners, sidebar highlight, progress bars |
| Section colors | set per `section.lsec[data-sec]` as `--sc` | The icon chip next to each lesson section heading |
| Shape | `--radius-sm`, `--radius`, `--radius-lg`, `--radius-pill` | Inputs, buttons, cards, chips |
| Elevation | `--shadow-1` (cards), `--shadow-2` (sheets) | Only for things that float |
| Layers | `--z-sticky`, `--z-nav`, `--z-sheet`, `--z-modal` | Stacking order |
| Motion | `--dur-1`, `--dur-2`, `--ease` | Short, purposeful transitions; none under reduced motion |
| Touch | `--tap` (44 px) | Minimum size of any interactive target |

Dark mode redefines only the color tokens (under `prefers-color-scheme: dark` and `[data-theme="dark"]`);
components never hard-code colors.

## Components

| Component | Class | Rules |
|---|---|---|
| Button | `.btn`, `.btn.ghost`, `.btn.small`, `.linkbtn` | One primary `.btn` per card; secondary actions are `.ghost`; tertiary are `.linkbtn` |
| Card | `.tcard` (action card), `.card` (section card), `.mshape` (stat card) | Label, title, one line of help, one action |
| Callout | `.callout`, `.callout.warn`, `.callout.facts` | Information the learner must notice; warnings only for risk to progress or data |
| Badge | `.badge`, `.badge.ok`, `.badge.warn` | Short status: New, Review, Mastered, Passed |
| Chip | `.chip` | Links to related lessons or filters |
| Stat | `.pillstat`, `.kv`, `.bar` | Numbers in the display font, unit in muted text, progress as a bar |
| Sheet | `openSheet(html)` / `.sheet` | Bottom sheet on phones, centered dialog on desktop; closes on Escape, ✕ and backdrop |
| Navigation | `nav.tabs` (desktop), `.bnav` (phone) | Phone nav has five items: Today, Learn, Review, Progress, More |
| Forms | `.field`, `.check`, `select` | Visible label above every input; checkboxes 18 px with the accent color |
| Diagram player | `.dg-player`, `.dg-steps` | Play/pause, step buttons, scrubber, caption, and the steps as a text list |

## Content style

- Sentence case for every label and button ("Check & complete", not "Check & Complete").
- Buttons are verbs; labels are nouns. Say what happens next ("Start review", "Open practice").
- Numbers carry units and context ("1 card due · about 1 min").
- No em-dashes in UI copy, matching `lessons/STYLE.md`.

## Adding a screen

1. Compose existing components; add a token before adding a one-off value.
2. Check it at 390 px and 1280 px, in light and dark mode, with the keyboard only.
3. Add any new component to the Design system view and to the table above.
