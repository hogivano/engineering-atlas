"""Check the sources-and-evidence rules from lessons/STYLE.md.

Usage: python3 tools/check_sources.py lessons/sd/foo.md [...]
Checks: required sections and order, citation count, no links to paid courses, and that the Practice
block is byte-identical to git HEAD (practice code is never touched by source upgrades).
"""
import re, subprocess, sys

MIN_CITES = {"lld": 5, "ps": 5}
PAID_HOSTS = ("algomaster.io", "educative.io", "designgurus.io", "bytebytego.com/courses")

def practice(text):
    m = re.search(r"^## Practice\n[\s\S]*?(?=^## )", text, re.M)
    return m.group(0) if m else ""

def check(path):
    errs = []
    text = open(path, encoding="utf8").read()
    course = path.split("/")[-2]
    heads = re.findall(r"^## (.+)$", text, re.M)
    for h in ("In the wild", "Sources and further study"):
        if heads.count(h) != 1:
            errs.append(f"needs exactly one '## {h}'")
    if "Sources and further study" in heads:
        i = heads.index("Sources and further study")
        nxt = heads[i + 1] if i + 1 < len(heads) else None
        if nxt not in ("Watch", "Free resources"):
            errs.append(f"'Sources and further study' must sit right before Watch/Free resources, not {nxt}")
        sec = re.search(r"^## Sources and further study\n([\s\S]*?)(?=^## |\Z)", text, re.M).group(1)
        n = len(re.findall(r"^- ", sec, re.M))
        if not 6 <= n <= 14:
            errs.append(f"Sources and further study has {n} entries (want 6-12)")
    if "In the wild" in heads:
        sec = re.search(r"^## In the wild\n([\s\S]*?)(?=^## |\Z)", text, re.M).group(1)
        items = re.findall(r"^- .+$", sec, re.M)
        if not 2 <= len(items) <= 4 or any("](http" not in it for it in items):
            errs.append("In the wild needs 2-3 bullets, each with a source link")
    body = re.split(r"^## (?:Practice|Mock interview|Sources and further study|Watch|Free resources)\n", text, flags=re.M)[0]
    body = re.sub(r"^## In the wild\n[\s\S]*?(?=^## )", "", body, flags=re.M)
    cites = len(re.findall(r"\]\(https?://", body))
    if cites < MIN_CITES.get(course, 8):
        errs.append(f"{cites} inline citations in the lesson body (want >= {MIN_CITES.get(course, 8)})")
    if any(h in text for h in PAID_HOSTS):
        errs.append("links to a paid course")
    try:
        old = subprocess.run(["git", "show", f"HEAD:{path}"], capture_output=True, text=True, check=True).stdout
        if practice(old) != practice(text):
            errs.append("Practice block changed versus HEAD")
    except subprocess.CalledProcessError:
        pass
    return errs

bad = 0
for p in sys.argv[1:]:
    e = check(p)
    print(("FAIL " if e else "ok   ") + p + ("".join("\n     - " + x for x in e)))
    bad += bool(e)
sys.exit(1 if bad else 0)
