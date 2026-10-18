"""Build site/index.html from the curriculum Markdown and the captured sources.

Usage:
    python3 -I site/build.py   # writes site/index.html and dist/index.html (Netlify publishes dist/)

The page embeds all data as JSON. site/src/page.html is the shell; style.css, app.js and the
data are inlined into it at the __CSS__, __JS__ and __DATA__ placeholders.
"""
import html
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent


# ---------- tiny Markdown renderer (inline + blocks used in this repo) ----------

def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\[([^\]]+)\]\(lesson:([\w/-]+)\)", r'<button class="lk" data-lesson="\2">\1</button>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)
    text = re.sub(r"&lt;(https?://[^&\s]+)&gt;", r'<a href="\1" target="_blank" rel="noopener">\1</a>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return text


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def blocks(lines):
    """Group lines into blocks: ('p', text) ('ul', [items]) ('ol', [items]) ('table', rows)."""
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.strip() == "---":
            i += 1
        elif re.match(r"^#{2,6} ", line):
            level = len(line) - len(line.lstrip("#"))
            out.append(("h", (level, line.lstrip("#").strip())))
            i += 1
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                if not re.match(r"^\|[\s|:-]+\|$", lines[i].strip()):
                    rows.append(split_row(lines[i]))
                i += 1
            out.append(("table", rows))
        elif re.match(r"^(- |\d+\. )", line):
            kind = "ul" if line.startswith("- ") else "ol"
            items = []
            marker = r"^- " if kind == "ul" else r"^\d+\. "
            while i < len(lines) and (re.match(marker, lines[i]) or lines[i].startswith("  ")):
                if lines[i].startswith("  "):
                    items[-1] += " " + lines[i].strip()
                else:
                    items.append(re.sub(r"^(- |\d+\. )", "", lines[i]))
                i += 1
            out.append((kind, items))
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r"^(- |\d+\. |\||#{2,6} )", lines[i]):
                para.append(lines[i].strip())
                i += 1
            out.append(("p", " ".join(para)))
    return out


def render_blocks(bl):
    parts = []
    for kind, val in bl:
        if kind == "h":
            level, text = val
            parts.append(f"<h{min(level + 1, 6)}>{inline(text)}</h{min(level + 1, 6)}>")
        elif kind == "p":
            parts.append(f"<p>{inline(val)}</p>")
        elif kind in ("ul", "ol"):
            parts.append(f"<{kind}>" + "".join(f"<li>{inline(x)}</li>" for x in val) + f"</{kind}>")
        else:
            head, *rows = val
            t = "<thead><tr>" + "".join(f"<th>{inline(h)}</th>" for h in head) + "</tr></thead><tbody>"
            t += "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
            parts.append(f'<div class="tablewrap"><table>{t}</tbody></table></div>')
    return "".join(parts)


# ---------- curriculum ----------

FIELD = re.compile(r"^\*\*(Learn|Go deeper|Leadership lens|Prove it):\*\*\s*")


def parse_curriculum():
    md = (ROOT / "curriculum" / "system-design-curriculum.md").read_text(encoding="utf8").split("\n")
    title_idx = [i for i, l in enumerate(md) if l.startswith("## ")]
    intro = render_blocks(blocks(md[1:title_idx[0]]))
    phases = []
    for n, start in enumerate(title_idx):
        end = title_idx[n + 1] if n + 1 < len(title_idx) else len(md)
        heading = md[start][3:].strip()
        m = re.match(r"(Phase (\d+)|Capstone|Coverage check)[^:(]*:?\s*(.*)", heading)
        key = f"P{m.group(2)}" if m and m.group(2) else re.sub(r"\W+", "-", heading.split("(")[0].strip().lower())
        weeks = re.search(r"\(([^)]*week[^)]*)\)", heading)
        name = re.sub(r"\s*\([^)]*\)\s*$", "", heading)
        body = md[start + 1:end]
        mod_idx = [i for i, l in enumerate(body) if l.startswith("### ")]
        pre = body[:mod_idx[0]] if mod_idx else body
        modules = []
        for k, ms in enumerate(mod_idx):
            me = mod_idx[k + 1] if k + 1 < len(mod_idx) else len(body)
            mh = body[ms][4:].strip()
            mid, mtitle = mh.split(". ", 1)
            fields = {}
            for kind, items in blocks(body[ms + 1:me]):
                if kind != "ul":
                    continue
                for item in items:
                    fm = FIELD.match(item)
                    if fm:
                        fields[fm.group(1)] = inline(FIELD.sub("", item))
            modules.append({"id": mid, "title": mtitle, "fields": fields})
        pre_blocks = blocks(pre)
        # Phase 0 is written as a single module-like bullet list.
        if not modules and any(k == "ul" and any(FIELD.match(x) for x in v) for k, v in pre_blocks):
            fields = {FIELD.match(x).group(1): inline(FIELD.sub("", x))
                      for k, v in pre_blocks if k == "ul" for x in v if FIELD.match(x)}
            modules.append({"id": "M0", "title": name.split(": ", 1)[-1], "fields": fields})
            pre_blocks = [b for b in pre_blocks if not (b[0] == "ul" and any(FIELD.match(x) for x in b[1]))]
        tables = [b[1] for b in pre_blocks if b[0] == "table"]
        lists = [b[1] for b in pre_blocks if b[0] in ("ol",)]
        phases.append({
            "key": key,
            "name": name,
            "weeks": weeks.group(1) if weeks else "",
            "html": render_blocks([b for b in pre_blocks if b[0] == "p"]),
            "fullHtml": render_blocks(pre_blocks),
            "modules": modules,
            "tables": [[[inline(c) for c in r] for r in t] for t in tables],
            "steps": [[inline(x) for x in l] for l in lists],
        })
    return intro, phases


# ---------- sources ----------

def resources():
    md = (ROOT / "curriculum" / "resources.md").read_text(encoding="utf8").split("\n")
    secs, cur = [], None
    for line in md:
        if line.startswith("## "):
            cur = {"title": line[3:].strip(), "lines": []}
            secs.append(cur)
        elif cur is not None:
            cur["lines"].append(line)
    out = []
    for s in secs:
        items = []
        for kind, val in blocks(s["lines"]):
            if kind in ("ul", "ol"):
                items += [{"html": inline(x), "core": x.startswith("★")} for x in val]
            elif kind == "table":
                for r in val[1:]:
                    items.append({"html": inline(r[1]) + (f' <span class="used">{inline(r[2])}</span>' if len(r) > 2 else ""),
                                  "core": r[0] == "★"})
        for it in items:
            it["html"] = it["html"].replace("★ ", "")
        out.append({"title": s["title"], "items": items})
    return out


def methodology():
    md = (ROOT / "docs" / "methodology.md").read_text(encoding="utf8").split("\n")
    out, cur = [], None
    for line in md[1:]:
        if line.startswith("## "):
            cur = {"title": line[3:].strip(), "lines": []}
            out.append(cur)
        elif cur is not None and not line.startswith("```"):
            cur["lines"].append(line)
    return [{"title": s["title"], "html": render_blocks(blocks(s["lines"]))} for s in out]


def sprint():
    md = (ROOT / "curriculum" / "30-day-fundamentals-sprint.md").read_text(encoding="utf8").split("\n")
    heads = [i for i, l in enumerate(md) if l.startswith("## ")]
    sec = {md[h][3:].strip(): md[h + 1:(heads[n + 1] if n + 1 < len(heads) else len(md))] for n, h in enumerate(heads)}
    days = []
    for kind, val in blocks(sec["Plan"]):
        if kind == "table":
            for r in val[1:]:
                days.append({"day": int(r[0]), "focus": inline(r[1]), "learn": inline(r[2]),
                             "deeper": inline(r[3]), "drill": inline(r[4]), "review": r[1].startswith("Review") or int(r[0]) >= 29})
    habits = [inline(x) for k, v in blocks(sec["What separates the top 1%"]) if k == "ol" for x in v]
    daily = [inline(x) for k, v in blocks(sec["Daily non-negotiables (20 min)"]) if k == "ul" for x in v]
    lead = render_blocks(blocks(md[1:heads[0]]))
    habits_lead = render_blocks([b for b in blocks(sec["What separates the top 1%"]) if b[0] == "p"])
    return {"lead": lead, "habitsLead": habits_lead, "habits": habits, "daily": daily, "days": days}


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def wrap_sections(body):
    """Wrap each top-level lesson section (an <h3> rendered from '## Heading' and everything up to
    the next one) in <section class="lsec" data-sec="slug">. Only '## ' headings render as <h3>
    in lesson bodies, and inline text is escaped, so a literal '<h3>' marks a section start."""
    parts = re.split(r"(?=<h3>)", body)
    out = [parts[0]] if not parts[0].startswith("<h3>") else []
    for part in parts:
        if not part.startswith("<h3>"):
            continue
        head = part[4:part.find("</h3>")]
        slug = slugify(html.unescape(re.sub(r"<[^>]+>", "", head)))
        out.append(f'<section class="lsec" data-sec="{slug}">{part}</section>')
    return "".join(out)


def plain(md):
    """Markdown inline text to plain text."""
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", md)
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


def parse_mock(text):
    """Mock interview Markdown -> {prompt, followups, strong} as plain text."""
    out = {"prompt": "", "followups": [], "strong": []}
    part = "prompt"
    for kind, val in blocks(text.split("\n")):
        if kind == "p":
            m = re.match(r"\*\*Prompt:\*\*\s*(.*)", val)
            if m:
                out["prompt"] = plain(m.group(1))
                part = "followups"
            elif re.match(r"\*\*A strong answer covers:?\*\*", val):
                part = "strong"
            elif part == "prompt" or (part == "followups" and not out["followups"]):
                out["prompt"] = (out["prompt"] + " " + plain(val)).strip()
        elif kind in ("ul", "ol"):
            for x in val:
                fm = re.match(r"Follow-up:\s*(.*)", x)
                if fm:
                    out["followups"].append(plain(fm.group(1)))
                elif part == "strong":
                    out["strong"].append(plain(x))
                else:
                    out["followups"].append(plain(x))
    return out


def fact_claims():
    """docs/fact-check.md table -> {lesson key: [claim, ...]} for claims still Unverified or labelled Assumption."""
    path = ROOT / "docs" / "fact-check.md"
    out = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf8").split("\n"):
        if not line.startswith("|") or re.match(r"^\|[\s|:-]+\|$", line.strip()):
            continue
        cells = split_row(line)
        if len(cells) < 3 or cells[0].lower() == "lesson":
            continue
        # Columns: lesson | claim | status [| source | note]. Only claims nobody could verify are shown to readers.
        status = cells[2].strip().lower()
        if status not in ("unverified", "assumption"):
            continue
        claim = plain(cells[1]) + (" (a planning assumption)" if status == "assumption" else "")
        for key in cells[0].replace("`", "").split(","):
            if key.strip():
                out.setdefault(key.strip(), []).append(claim)
    return out


def git_reviewed():
    """{'lessons/<course>/<file>.md': 'YYYY-MM-DD'} of the last commit touching each file, in one git pass."""
    try:
        res = subprocess.run(["git", "log", "--format=%H %cs", "--name-only", "--", "lessons/"],
                             cwd=ROOT, capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.SubprocessError):
        return {}
    if res.returncode:
        return {}
    out, date = {}, ""
    for line in res.stdout.split("\n"):
        m = re.match(r"^[0-9a-f]{40} (\d{4}-\d{2}-\d{2})$", line)
        if m:
            date = m.group(1)
        elif line.strip() and date:
            out.setdefault(line.strip(), date)
    return out


def render_lesson_body(lines):
    """Render a lesson body into HTML plus structured Practice and Mock interview data.

    Headings ##/###, fenced code (mermaid kept as a diagram), and the quiz are rendered; the
    Practice section's python starter/tests/solution blocks and the Mock interview section are
    returned separately so the page can make them interactive.
    """
    out, chunk, i, section = [], [], 0, ""
    practice = {"task": "", "langs": {}}
    mock_lines = []
    quiz = []

    def flush():
        if not chunk:
            return
        bl = blocks(chunk)
        if section == "Check yourself":
            for kind, val in bl:
                if kind == "ol":
                    qs = []
                    for item in val:
                        q, _, a = item.partition("**Answer:**")
                        qs.append(f'<li><p>{inline(q.strip())}</p><details><summary>Show answer</summary>'
                                  f'<p>{inline(a.strip())}</p></details></li>')
                        if a.strip():
                            quiz.append([inline(q.strip()), inline(a.strip())])
                    out.append(f'<ol class="quiz">{"".join(qs)}</ol>')
                else:
                    out.append(render_blocks([(kind, val)]))
        elif section == "Practice":
            practice["task"] += render_blocks(bl)
        elif section == "Mock interview":
            pass
        else:
            out.append(render_blocks(bl))
        chunk.clear()

    while i < len(lines):
        line = lines[i]
        if section == "Mock interview" and not line.startswith("## "):
            mock_lines.append(line)
        if line.startswith("```"):
            flush()
            info = line[3:].strip().split()
            lang, role = (info + ["", ""])[:2]
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(lines[i])
                i += 1
            if section == "Practice" and role in ("starter", "tests", "solution"):
                practice["langs"].setdefault(lang, {})[role] = "\n".join(code)
            elif section == "Mock interview":
                pass
            else:
                body = html.escape("\n".join(code), quote=False)
                if lang == "mermaid":
                    out.append(f'<div class="diagram"><pre class="mermaid">{body}</pre></div>')
                else:
                    out.append(f'<pre class="code"><code>{body}</code></pre>')
        elif line.startswith("## ") or line.startswith("### "):
            flush()
            level = 2 if line.startswith("## ") else 3
            text = line[level + 1:].strip()
            if level == 2:
                section = text
            if section not in ("Practice", "Mock interview") or level == 3:
                if section not in ("Practice", "Mock interview"):
                    out.append(f"<h{level + 1}>{inline(text)}</h{level + 1}>")
        else:
            chunk.append(line)
        i += 1
    flush()
    body = "".join(out)
    start = body.find("<h3>Down the stack</h3>")
    if start >= 0:
        end = body.find("<h3>", start + 5)
        end = len(body) if end < 0 else end
        inner = body[start + len("<h3>Down the stack</h3>"):end]
        inner = re.sub(r"<h4>(Layer \d)[:.]?\s*(.*?)</h4>", r'<h4><span class="lyr">\1</span>\2</h4>', inner)
        body = (body[:start] + '<h3>Down the stack</h3><div class="layers">' + inner + "</div>" + body[end:])
    body = wrap_sections(body)
    mock_md = "\n".join(mock_lines).strip()
    mock = {"text": mock_md, "html": render_blocks(blocks(mock_lines))} if mock_md else None
    practice["langs"] = {k: v for k, v in practice["langs"].items() if v.get("starter") and v.get("tests")}
    return body, (practice if practice["langs"] else None), mock, quiz


def lessons():
    out = {}
    facts = fact_claims()
    reviewed = git_reviewed()
    for folder in sorted(d for d in (ROOT / "lessons").iterdir() if d.is_dir()):
        course_key = folder.name
        for path in sorted(folder.glob("*.md")):
            raw = path.read_text(encoding="utf8")
            # Relative links to sibling lessons ([x](slug.md), [x](../sd/slug.md)) open in the app.
            raw = re.sub(r"\]\((?:\.\./(\w+)/|\./)?([\w-]+)\.md\)",
                         lambda m: f"](lesson:{m.group(1) or course_key}/{m.group(2)})", raw)
            text = raw.split("\n")
            meta, start = {}, 0
            if text and text[0].strip() == "---":
                end = text.index("---", 1)
                for line in text[1:end]:
                    k, _, v = line.partition(":")
                    meta[k.strip()] = v.strip()
                start = end + 1
            body, practice, mock, quiz = render_lesson_body(text[start:])
            prose = re.sub(r"```.*?```", " ", "\n".join(text[start:]), flags=re.S)
            minutes = max(1, round(len(prose.split()) / 220))
            words = sum(1 for w in prose.split() if re.search(r"\w", w))
            summary = ""
            body_lines = text[start:]
            if "## In one minute" in body_lines:
                for kind, val in blocks(body_lines[body_lines.index("## In one minute") + 1:]):
                    summary = plain(val[0] if kind in ("ul", "ol") else val if kind == "p" else "")
                    break
            key = f"{course_key}/{path.stem}"
            rel = f"lessons/{course_key}/{path.name}"
            out[key] = {
                "title": meta.get("title", path.stem),
                "minutes": minutes,
                "html": body,
                "practice": practice,
                "mock": mock,
                "quiz": quiz,
                "path": rel,
                "facts": facts.get(key, []),
                "reviewed": reviewed.get(rel, ""),
                "words": words,
                "_summary": summary,
            }
    return out


HUB_LINE = re.compile(r"^\[(.+?)\]\((\S+?)\)\s*·\s*(\w+)\s*·\s*(\w+)\s*·\s*(\w+)\s*·\s*(.+)$")


def resource_hub():
    """Parse curriculum/resource-hub.md into topics of {title, url, type, cost, level, note}."""
    md = (ROOT / "curriculum" / "resource-hub.md").read_text(encoding="utf8").split("\n")
    heads = [i for i, l in enumerate(md) if l.startswith("## ")]
    out = []
    for n, h in enumerate(heads):
        items = []
        for kind, val in blocks(md[h + 1:(heads[n + 1] if n + 1 < len(heads) else len(md))]):
            for x in (val if kind == "ul" else []):
                m = HUB_LINE.match(x)
                if not m:
                    raise SystemExit(f"resource-hub.md: cannot parse line: {x}")
                title, url, typ, cost, level, note = m.groups()
                items.append({"title": title, "url": url, "type": typ, "cost": cost, "level": level, "note": inline(note)})
        out.append({"topic": md[h][3:].strip(), "items": items})
    return {"lead": render_blocks([b for b in blocks(md[1:heads[0]]) if b[0] == "p"][:1]), "topics": out}


def problem_shapes(lesson_keys):
    """The 'same problems, different domains' grid, plus the lessons where each shape appears."""
    md = (ROOT / "curriculum" / "problem-shapes.md").read_text(encoding="utf8").split("\n")
    heads = [i for i, l in enumerate(md) if l.startswith("## ")]
    bl = blocks(md[1:heads[0]] if heads else md[1:])
    table = next(v for k, v in bl if k == "table")
    rows = [[inline(c) for c in r] for r in table[1:]]
    links = {}
    if heads:
        for kind, val in blocks(md[heads[0] + 1:]):
            for item in (val if kind == "ul" else []):
                name, _, keys = item.partition(":")
                keys = [k.strip() for k in keys.split(",") if k.strip()]
                bad = [k for k in keys if k not in lesson_keys]
                if bad:
                    raise SystemExit(f"problem-shapes.md: unknown lessons {bad}")
                links[name.strip().lower()] = keys
    lessons = []
    for r in table[1:]:
        title = r[0].lower()
        lessons.append(next((v for k, v in links.items() if title.startswith(k)), []))
    return {"lead": render_blocks([b for b in bl if b[0] == "p"]),
            "head": [inline(c) for c in table[0]], "rows": rows, "lessons": lessons}


def whiteboard():
    """The whiteboard page: lead, sequence steps, four-zone table, SDRC and REACT items."""
    md = (ROOT / "curriculum" / "whiteboard.md").read_text(encoding="utf8").split("\n")
    heads = [i for i, l in enumerate(md) if l.startswith("## ")]
    sec = {md[h][3:].strip(): blocks(md[h + 1:(heads[n + 1] if n + 1 < len(heads) else len(md))]) for n, h in enumerate(heads)}
    pick = lambda name, kind: [x for k, v in sec[name] if k == kind for x in v]

    def labelled(name):
        out = []
        for x in pick(name, "ul"):
            m = re.match(r"\*\*(.+?):\*\*\s*(.*)", x)
            out.append({"name": m.group(1), "html": inline(m.group(2))})
        return out
    table = next(v for k, v in sec["Four zones"] if k == "table")
    zones = [dict(zip(["zone", "stakes", "novelty", "strategy", "rule", "examples"], [inline(c) for c in r])) for r in table[1:]]
    scenarios = []
    if "Practice scenarios" in sec:
        start = next(i for i, l in enumerate(md) if l.strip() == "## Practice scenarios")
        cur = None
        for line in md[start + 1:]:
            if line.startswith("## "):
                break
            if line.startswith("### "):
                cur = {"title": line[4:].strip(), "lines": []}
                scenarios.append(cur)
            elif cur is not None:
                cur["lines"].append(line)
        for sc in scenarios:
            bl = blocks(sc.pop("lines"))
            para = " ".join(v for k, v in bl if k == "p")
            m = re.match(r"Zone:\s*([^.]+)\.\s*(.*)", para)
            sc["zone"], sc["prompt"] = (m.group(1), inline(m.group(2))) if m else ("", inline(para))
            sc["example"] = []
            for k, v in bl:
                for x in (v if k == "ul" else []):
                    fm = re.match(r"\*\*(.+?):\*\*\s*(.*)", x)
                    if fm:
                        sc["example"].append({"name": fm.group(1), "html": inline(fm.group(2))})
    return {"title": md[0][2:].strip(), "lead": render_blocks(blocks(md[1:heads[0]])), "scenarios": scenarios,
            "steps": [inline(x) for x in pick("The sequence rule", "ol")], "zones": zones,
            "sdrc": labelled("SDRC"), "react": labelled("REACT")}


def projects(lesson_keys):
    """Multi-evening projects: meta fields, description, milestones and done criteria."""
    md = (ROOT / "curriculum" / "projects.md").read_text(encoding="utf8").split("\n")
    heads = [i for i, l in enumerate(md) if l.startswith("## ")]
    out = []
    for n, h in enumerate(heads):
        body = md[h + 1:(heads[n + 1] if n + 1 < len(heads) else len(md))]
        proj = {"title": md[h][3:].strip(), "meta": {}, "html": "", "milestones": [], "done": []}
        part = "intro"
        chunk = []
        def take():
            bl = blocks(chunk)
            if part == "intro":
                for k, v in bl:
                    if k == "p":
                        for seg in re.split(r"(?=\*\*[A-Z][a-z]+:\*\*)", v):
                            fm = re.match(r"\*\*(\w+):\*\*\s*(.*)", seg.strip())
                            if fm:
                                proj["meta"][fm.group(1).lower()] = fm.group(2).strip()
                            elif seg.strip():
                                proj["html"] += f"<p>{inline(seg.strip())}</p>"
            elif part == "Milestones":
                proj["milestones"] += [inline(x) for k, v in bl if k == "ol" for x in v]
            else:
                proj["done"] += [inline(x) for k, v in bl if k == "ul" for x in v]
            chunk.clear()
        for line in body:
            if line.startswith("### "):
                take()
                part = line[4:].strip()
            else:
                chunk.append(line)
        take()
        keys = [k.strip() for k in proj["meta"].get("lessons", "").split(",") if k.strip()]
        bad = [k for k in keys if k not in lesson_keys]
        if bad:
            raise SystemExit(f"projects.md: unknown lessons {bad}")
        proj["lessons"] = keys
        proj["meta"].pop("lessons", None)
        out.append(proj)
    return {"lead": render_blocks(blocks(md[1:heads[0]])), "projects": out}


def books():
    md = (ROOT / "curriculum" / "books.md").read_text(encoding="utf8").split("\n")
    heads = [i for i, l in enumerate(md) if l.startswith("### ")]
    lead = render_blocks(blocks(md[1:heads[0]]))
    out = []
    for n, h in enumerate(heads):
        body = md[h + 1:(heads[n + 1] if n + 1 < len(heads) else len(md))]
        m = re.match(r"(.+?) \((.+)\)$", md[h][4:].strip())
        book = {"title": m.group(1), "author": m.group(2), "when": "", "why": "", "chapters": []}
        for kind, val in blocks(body):
            if kind == "ul":
                for x in val:
                    fm = re.match(r"\*\*(When|Why):\*\*\s*(.*)", x)
                    if fm:
                        book[fm.group(1).lower()] = inline(fm.group(2))
            elif kind == "ol":
                for x in val:
                    title, _, tag = x.partition(" · ")
                    book["chapters"].append([inline(title), tag])
        out.append(book)
    return {"lead": lead, "books": out}


# ---------- static lesson pages (indexable copies of each lesson) ----------

STATIC_CSS = (
    ":root{--bg:#fdfdfc;--fg:#1d1f23;--muted:#5d636d;--line:#e3e5e8;--card:#f4f5f7;--accent:#2457d6;--accent-fg:#fff}"
    "@media (prefers-color-scheme:dark){:root{--bg:#15171b;--fg:#e6e8eb;--muted:#9aa1ab;--line:#2c3038;"
    "--card:#1e2127;--accent:#7aa2ff;--accent-fg:#0d1120}}"
    "*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}"
    "body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif}"
    "main,header,footer{max-width:760px;margin:0 auto;padding:0 16px}"
    "header{padding-top:20px;font-size:14px;color:var(--muted)}header a{color:inherit}"
    "h1{font-size:1.9em;line-height:1.25;margin:.4em 0 .3em}h3{font-size:1.35em;margin:1.8em 0 .4em}"
    "h4{font-size:1.1em;margin:1.4em 0 .3em}a{color:var(--accent)}"
    ".meta{color:var(--muted);font-size:14px;margin:0 0 1em}"
    ".cta{display:block;margin:1.2em 0;padding:14px 16px;border-radius:10px;background:var(--accent);"
    "color:var(--accent-fg);text-decoration:none;font-weight:600}.cta:hover{opacity:.92}"
    "code{font:.88em ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--card);padding:.1em .3em;border-radius:4px}"
    "pre{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;font-size:14px;line-height:1.45}"
    "pre code{background:none;padding:0}.diagram pre.mermaid{background:var(--card);text-align:center}"
    ".tablewrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:15px}"
    "th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}th{background:var(--card)}"
    ".lyr{display:inline-block;font-size:.75em;background:var(--card);border:1px solid var(--line);border-radius:4px;"
    "padding:0 .4em;margin-right:.5em;color:var(--muted)}"
    "ol.quiz li{margin-bottom:.8em}details summary{cursor:pointer;color:var(--accent)}"
    "footer{margin-top:3em;padding-bottom:40px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}"
    "img{max-width:100%}"
)


SOCIAL_TITLE = "Engineering Atlas: what's behind the app your agent built"
SOCIAL_DESC = ("Free, open curriculum for app builders and engineers in the AI era: system design, scaling, "
               "debugging and incident response. 457 lessons with practice, mock interviews and sources you can check.")


def social_meta():
    """Open Graph and Twitter tags for the homepage, so shared links show a large preview card."""
    base, e = site_url(), html.escape
    return (f'<title>Engineering Atlas</title>\n'
            f'<link rel="canonical" href="{base}/">\n'
            '<meta property="og:type" content="website">\n'
            '<meta property="og:site_name" content="Engineering Atlas">\n'
            f'<meta property="og:title" content="{e(SOCIAL_TITLE)}">\n'
            f'<meta property="og:description" content="{e(SOCIAL_DESC)}">\n'
            f'<meta property="og:url" content="{base}/">\n'
            f'<meta property="og:image" content="{base}/og-image.png">\n'
            '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:alt" content="Engineering Atlas: what\'s behind the app your agent built">\n'
            '<meta property="og:locale" content="en_US">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:title" content="{e(SOCIAL_TITLE)}">\n'
            f'<meta name="twitter:description" content="{e(SOCIAL_DESC)}">\n'
            f'<meta name="twitter:image" content="{base}/og-image.png">\n')


def site_url():
    return (os.environ.get("SITE_URL") or "https://engineeringatlas.netlify.app").rstrip("/")


def static_lesson_page(key, L, all_lessons, course_title):
    course_key, slug = key.split("/", 1)
    url = f"{site_url()}/l/{key}/"
    app_link = f"/#learn.{course_key}.{slug}"
    desc = L.get("_summary") or f"{L['title']}: a lesson from Engineering Atlas."
    if len(desc) > 160:
        desc = desc[:157].rsplit(" ", 1)[0].rstrip(",;:") + "..."
    title = f"{L['title']} | Engineering Atlas"
    esc = lambda x: html.escape(x, quote=True)

    def link(m):
        k = m.group(1)
        target = all_lessons.get(k)
        if target and target.get("path"):
            return f'<a href="/l/{k}/">{m.group(2)}</a>'
        c, _, sl = k.partition("/")
        return f'<a href="/#learn.{c}.{sl}">{m.group(2)}</a>'
    body = re.sub(r'<button class="lk" data-lesson="([\w/-]+)">(.*?)</button>', link, L["html"])
    cta = f'<a class="cta" href="{app_link}">Open in the interactive app: practice, quiz, mock interview &rarr;</a>'
    meta = f'{L["minutes"]} min read'
    if L.get("reviewed"):
        meta += f' &middot; last reviewed {L["reviewed"]}'
    return (
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">\n<meta name="theme-color" content="#7c3aed">\n'
        f'<title>{esc(title)}</title>\n'
        f'<meta name="description" content="{esc(desc)}">\n'
        f'<link rel="canonical" href="{esc(url)}">\n'
        f'<meta property="og:title" content="{esc(title)}">\n'
        f'<meta property="og:description" content="{esc(desc)}">\n'
        '<meta property="og:type" content="article">\n'
        f'<meta property="og:url" content="{esc(url)}">\n'
        '<meta property="og:site_name" content="Engineering Atlas">\n'
        f'<meta property="og:image" content="{site_url()}/og-image.png">\n'
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:image" content="{site_url()}/og-image.png">\n'
        f'<meta name="twitter:title" content="{esc(title)}">\n'
        f'<meta name="twitter:description" content="{esc(desc)}">\n'
        f'<style>{STATIC_CSS}</style>\n'
        '</head>\n<body>\n'
        f'<header><a href="/">Engineering Atlas</a> &rsaquo; <a href="/#learn.{course_key}">{esc(course_title)}</a></header>\n'
        f'<main>\n<h1>{esc(L["title"])}</h1>\n<p class="meta">{meta}</p>\n{cta}\n{body}\n{cta}\n</main>\n'
        '<footer><p>Engineering Atlas: a free, open curriculum for software engineers. '
        '<a href="/">Open the app</a>.</p></footer>\n'
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js"></script>\n'
        '<script>mermaid.initialize({startOnLoad:true,theme:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"default"});</script>\n'
        '</body>\n</html>\n'
    )


def write_static(dist, data):
    """dist/l/<course>/<slug>/index.html for every authored lesson, plus sitemap.xml and robots.txt."""
    titles = {c["key"]: c["title"] for c in data["courses"]}
    base = site_url()
    out_dir = dist / "l"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    urls = [(f"{base}/", "")]
    for key, L in sorted(data["lessons"].items()):
        if L.get("generated") or not L.get("path"):
            continue
        d = out_dir / key
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(static_lesson_page(key, L, data["lessons"], titles.get(key.split("/")[0], "")),
                                      encoding="utf8")
        urls.append((f"{base}/l/{key}/", L.get("reviewed", "")))
    # Renamed lessons (lessons/_moved.json): keep old static URLs working with a redirect page.
    for old, new in data.get("moved", {}).items():
        d = out_dir / old
        d.mkdir(parents=True, exist_ok=True)
        target = f"{base}/l/{new}/"
        (d / "index.html").write_text(
            f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title>'
            f'<link rel="canonical" href="{target}"><meta name="robots" content="noindex">'
            f'<meta http-equiv="refresh" content="0; url=/l/{new}/"></head>'
            f'<body><p>This lesson moved to <a href="/l/{new}/">a new address</a>.</p></body></html>\n', encoding="utf8")
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, lm in urls:
        sm.append(f"  <url><loc>{html.escape(u)}</loc>" + (f"<lastmod>{lm}</lastmod>" if lm else "") + "</url>")
    sm.append("</urlset>")
    (dist / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf8")
    (dist / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}/sitemap.xml\n", encoding="utf8")
    return len(urls) - 1


# ---------- plan -> lesson links ----------

COURSE_PREFIX = {"AM-SDI": ("sdi", "Interviews"), "AM-SD": ("sd", "Fundamentals"), "AM-LLD": ("lld", "LLD")}
# Short names used in the plans for chapters whose titles differ.
ALIASES = {"dns": "domain name system (dns)", "authn vs authz": "authentication vs authorization",
           "sse": "server-sent events (sse)", "cdn": "content delivery network (cdn)"}
PREFIX_RE = re.compile(r"\b(AM-SDI|AM-SD|AM-LLD|RM-SDA|RM-SD|RM-SA|DDIA)\b")


def _norm(t):
    t = re.sub(r"<[^>]+>", "", html.unescape(t)).lower()
    return re.sub(r"\s*\+\s*exercises?$|\s+exercises?$", "", re.sub(r"\s+", " ", t)).strip(" .")


def lesson_index(courses, lesson_data):
    """Per course: chapter title -> lesson key, and section name -> lesson keys in order."""
    idx = {}
    for c in courses:
        chap, sect = {}, {}
        for s in c["sections"]:
            keys = []
            for t, u, _ in s["chapters"]:
                k = f"{c['key']}/{u.rstrip('/').rsplit('/', 1)[-1]}"
                if k in lesson_data:
                    chap.setdefault(_norm(t), k)
                    keys.append(k)
            if keys:
                sect[_norm(s["section"])] = keys
        idx[c["key"]] = (chap, sect)
    return idx


def link_plan_text(text, idx, lesson_data):
    """Turn 'AM-SD <em>Caching</em>' style references into in-app lesson links.

    Returns (html, lesson keys mentioned). A chapter title links to its lesson; a section name links
    to the section's first lesson and contributes all of its lessons to the returned list.
    """
    out, keys, course = [], [], None
    for part in PREFIX_RE.split(text):
        if part in COURSE_PREFIX:
            course = COURSE_PREFIX[part][0]
            out.append(f"<span class=\"src\">{COURSE_PREFIX[part][1]}:</span>")
            continue
        if PREFIX_RE.fullmatch(part or ""):
            course = None
            out.append(part)
            continue
        if course:
            chap, sect = idx[course]

            def find(name):
                n = ALIASES.get(_norm(name), _norm(name))
                if n in chap:
                    return [chap[n]]
                if n in sect:
                    return sect[n]
                # Short forms: "SPOF", "Paxos", "ACID" match the one chapter whose title contains them.
                hits = [k for t, k in chap.items() if re.search(r"(^|[\s(])" + re.escape(n) + r"($|[\s),])", t)]
                return hits[:1] if len(set(hits)) == 1 else []

            def button(label, ks):
                keys.extend(ks)
                return f'<button class="lk" data-lesson="{ks[0]}">{label}</button>' if ks else label

            def repl(m):
                inner = m.group(1)
                if "→" in inner:
                    head, _, tail = inner.partition("→")
                    items = [x.strip() for x in tail.split(",")]
                    linked = [button(x, find(x)) for x in items]
                    return f"<em>{button(head.strip(), find(head))} → {', '.join(linked)}</em>"
                ks = find(inner)
                if not ks and "/" in inner:
                    parts = [x.strip() for x in inner.split("/")]
                    ks = [k for x in parts for k in find(x)]
                return button(inner, ks) if ks else m.group(0)
            part = re.sub(r"<em>(.*?)</em>", repl, part)
        out.append(part)
    seen = []
    for k in keys:
        if k not in seen:
            seen.append(k)
    return "".join(out), seen


def link_plans(data):
    idx = lesson_index(data["courses"], data["lessons"])
    for ph in data["phases"]:
        for m in ph["modules"]:
            if "Learn" in m["fields"]:
                m["fields"]["Learn"], m["lessons"] = link_plan_text(m["fields"]["Learn"], idx, data["lessons"])
    for d in data["sprint"]["days"]:
        d["learn"], d["lessons"] = link_plan_text(d["learn"], idx, data["lessons"])
    # Case-study table: link each problem in the "Problem (AM-SDI)" column to its Design X lesson.
    chap = idx["sdi"][0]
    for ph in data["phases"]:
        for t in ph["tables"]:
            col = next((i for i, h in enumerate(t[0]) if "AM-SDI" in h), None)
            if col is None:
                continue
            for row in t[1:]:
                items = []
                for item in row[col].split(", "):
                    loose = lambda x: re.sub(r"\bdb\b", "database", re.sub(r"\s*\(.*?\)", "", _norm(x).replace("&", "and").replace("-", " ")))
                    n = loose(item)
                    hits = sorted((k for title, k in chap.items() if title.startswith("design") and n in loose(title)), key=len)
                    items.append(f'<button class="lk" data-lesson="{hits[0]}">{item}</button>' if hits else item)
                row[col] = ", ".join(items)


def split_lessons(dist, data):
    """Write each lesson to dist/lessons/<course>/<slug>.json plus a quiz bank and a search index.

    Returns the per-lesson metadata the app shell keeps, and a build id used to bust caches."""
    out = dist / "lessons"
    if out.exists():
        shutil.rmtree(out)
    meta, quiz, search = {}, {}, []
    for key, L in data["lessons"].items():
        full = {k: v for k, v in L.items() if not k.startswith("_")}
        f = out / f"{key}.json"
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps(full, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
        meta[key] = {"title": L["title"], "minutes": L.get("minutes"), "path": L.get("path"), "reviewed": L.get("reviewed", ""),
                     "generated": L.get("generated", False), "quizN": len(L.get("quiz") or []),
                     "hasPractice": bool(L.get("practice")), "hasMock": bool(L.get("mock")), "factsN": len(L.get("facts") or [])}
        if L.get("quiz"):
            quiz[key] = L["quiz"]
        # Search covers the prose, not code samples or link lists, capped per lesson to keep the index small.
        body = re.sub(r"<pre[\s\S]*?</pre>|<section class=\"lsec\" data-sec=\"(watch|free-resources)\">[\s\S]*?</section>", " ", L.get("html") or "")
        text = re.sub(r"<[^>]+>", " ", body) + " " + re.sub(r"<[^>]+>", " ", (L.get("practice") or {}).get("task", ""))
        search.append([key, L["title"], html.unescape(re.sub(r"\s+", " ", text)).strip()[:9000]])
    (dist / "quiz.json").write_text(json.dumps(quiz, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    (dist / "search.json").write_text(json.dumps(search, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    build = hashlib.sha1(json.dumps(data["lessons"], sort_keys=True).encode("utf8")).hexdigest()[:10]
    return {"meta": meta, "build": build}


def main():
    intro, phases = parse_curriculum()
    lesson_data = lessons()
    moved_file = ROOT / "lessons" / "_moved.json"
    moved = json.loads(moved_file.read_text(encoding="utf8")) if moved_file.exists() else {}
    data = {
        "moved": moved,
        "sprint": sprint(),
        "books": books(),
        "lessons": lesson_data,
        "hub": resource_hub(),
        "shapes": problem_shapes(lesson_data),
        "wb": whiteboard(),
        "projects": projects(lesson_data),
        "repo": {"url": "https://github.com/hogivano/engineering-atlas", "branch": "HEAD"},
        "intro": intro,
        "phases": phases,
        "courses": [],
        "resources": resources(),
        "method": methodology(),
        "captured": "2026-10-15",
    }
    data["config"] = {
        "supabaseUrl": os.environ.get("SUPABASE_URL", ""),
        "supabaseAnonKey": os.environ.get("SUPABASE_ANON_KEY", ""),
        "interview": os.environ.get("AI_INTERVIEW") == "1",
        "oauth": [x.strip() for x in os.environ.get("OAUTH_PROVIDERS", "github").split(",") if x.strip()],
        "giscus": {"repo": os.environ.get("GISCUS_REPO", ""), "repoId": os.environ.get("GISCUS_REPO_ID", ""),
                   "category": os.environ.get("GISCUS_CATEGORY", ""), "categoryId": os.environ.get("GISCUS_CATEGORY_ID", "")},
    }
    # Title overrides (lessons/_titles.json) replace a few chapter titles with our own wording.
    titles_file = ROOT / "lessons" / "_titles.json"
    title_over = json.loads(titles_file.read_text(encoding="utf8")) if titles_file.exists() else {}
    for k, t in title_over.items():
        if k in lesson_data:
            lesson_data[k]["title"] = t

    def local_course(key):
        f = ROOT / "lessons" / key / "_course.json"
        if not f.exists():
            return None
        c = json.loads(f.read_text(encoding="utf8"))
        return {"key": c["key"], "title": c["title"], "intro": c.get("intro", ""),
                "sections": [{"section": s["section"],
                              "chapters": [[title_over.get(f"{c['key']}/{slug}", t), f"local/{c['key']}/{slug}", False] for t, slug in s["chapters"]]}
                             for s in c["sections"]]}

    # Every course has its own outline in lessons/<key>/_course.json.
    for key in ("sd", "sdi", "lld"):
        data["courses"].append(local_course(key))
    # Extra courses defined in this repo (lessons/<key>/_course.json), e.g. problem solving.
    order = {"fd": 0, "ps": 1, "ai": 2}
    for cfile in sorted((ROOT / "lessons").glob("*/_course.json"), key=lambda f: order.get(f.parent.name, 9)):
        if cfile.parent.name in ("sd", "sdi", "lld"):
            continue
        data["courses"].append(local_course(cfile.parent.name))
    link_plans(data)
    # Skills matrix (curriculum/skills.json) and legal pages (docs/legal/*.md), when present.
    skills_file = ROOT / "curriculum" / "skills.json"
    if skills_file.exists():
        data["skills"] = json.loads(skills_file.read_text(encoding="utf8"))
    data["legal"] = {}
    for f in sorted((ROOT / "docs" / "legal").glob("*.md")) if (ROOT / "docs" / "legal").is_dir() else []:
        if f.stem == "README":  # the owner's checklist, not a published policy
            continue
        lines = f.read_text(encoding="utf8").split("\n")
        title = next((l[2:].strip() for l in lines if l.startswith("# ")), f.stem)
        # Bare URLs become links; Markdown links and <...> are left alone.
        body = [re.sub(r"(?<![(<\[\w/])(https?://[^\s)<>\]]+[^\s)<>\].,;:])", r"[\1](\1)", l) for l in lines if not l.startswith("# ")]
        data["legal"][f.stem] = {"title": title, "html": render_blocks(blocks(body))}
    # Static pages need each lesson's summary; the app does not.
    summaries = {k: L.pop("_summary", "") for k, L in data["lessons"].items()}
    mocks = {}
    for k, L in data["lessons"].items():
        if L.get("mock"):
            mocks[k] = {"title": L["title"], **parse_mock(L["mock"]["text"])}
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    src = ROOT / "site" / "src"
    page = (src / "page.html").read_text(encoding="utf8")
    page = page.replace("__CSS__", (src / "style.css").read_text(encoding="utf8"))
    page = page.replace("__JS__", (src / "app.js").read_text(encoding="utf8"))
    page = page.replace("__DATA__", blob)
    (ROOT / "site" / "index.html").write_text(page, encoding="utf8")
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    # The claude.ai artifact adds its own document skeleton; a static host (Netlify) needs one.
    shell = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
             '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
             '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">\n<meta name="theme-color" content="#7c3aed">\n'
             '<meta name="description" content="Free, open curriculum for software engineers in the AI era: '
             'system design, problem solving, debugging and incident response, with practice and mock interviews.">\n'
             + social_meta() +
             '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
             'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
             '</head>\n<body>\n')
    # dist/ ships a small shell: lesson bodies, the quiz bank and the search text load on demand.
    split = split_lessons(dist, data)
    lean = dict(data, lessons=split["meta"], build=split["build"], split=True)
    lean_blob = json.dumps(lean, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    lean_page = page.replace(blob, lean_blob)
    lean_page = lean_page.replace("<title>Engineering Atlas</title>", "", 1)  # the head already has one
    (dist / "index.html").write_text(shell + lean_page + "\n</body>\n</html>\n", encoding="utf8")
    modules = {m["id"]: {"title": m["title"], "lessons": m.get("lessons", [])} for p in data["phases"] for m in p["modules"]}
    (dist / "modules.json").write_text(json.dumps(modules, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    if "skills" in data:
        (dist / "skills.json").write_text(json.dumps(data["skills"], ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    (dist / "mocks.json").write_text(json.dumps(mocks, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    for k, s in summaries.items():
        data["lessons"][k]["_summary"] = s
    n_pages = write_static(dist, data)
    public = ROOT / "site" / "public"
    if public.is_dir():
        shutil.copytree(public, dist, dirs_exist_ok=True)
    print(f"Built {len(data['lessons'])} lessons, {len(mocks)} mocks, {n_pages} static lesson pages.")


if __name__ == "__main__":
    main()
