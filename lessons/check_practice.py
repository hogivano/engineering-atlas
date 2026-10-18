"""Verify a lesson's Practice blocks in Python, TypeScript and Go.

For each language present: every test must pass against `solution`, and at least one must fail
against `starter`. Python runs in-process; TypeScript needs `tsc` and `node`; Go needs `go`.

Usage:
    python3 lessons/check_practice.py lessons/sd/<slug>.md            # check all languages
    python3 lessons/check_practice.py lessons/sd/<slug>.md --lang go  # one language
    python3 lessons/check_practice.py lessons/sd/<slug>.md --lang python --answer mine.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile

PY_ALLOWED = {"collections", "heapq", "bisect", "math", "random", "itertools", "functools",
              "hashlib", "dataclasses", "typing", "enum", "string", "struct", "zlib", "json"}
LANGS = ("python", "typescript", "go")

TS_PRELUDE = """declare function test(name: string, fn: () => void): void;
declare function assert(cond: unknown, msg?: string): void;
declare function assertEqual(actual: unknown, expected: unknown, msg?: string): void;
"""

TS_HARNESS = r"""
const results = [];
const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
globalThis.test = (name, fn) => {
  try { fn(); results.push([name, true, ""]); }
  catch (e) { results.push([name, false, String(e && e.message || e)]); }
};
globalThis.assert = (c, m) => { if (!c) throw new Error(m || "assertion failed"); };
globalThis.assertEqual = (a, e, m) => {
  if (!deepEqual(a, e)) throw new Error((m ? m + ": " : "") + "expected " + JSON.stringify(e) + ", got " + JSON.stringify(a));
};
try { require(process.argv[2]); } catch (e) { results.push(["(load)", false, String(e && e.message || e)]); }
console.log(JSON.stringify(results));
"""


def block(md, lang, kind):
    m = re.search(r"```" + lang + r" " + kind + r"\n(.*?)\n```", md, re.S)
    return m.group(1) if m else None


def run_python(code, tests):
    for src in (code, tests):
        for mod in re.findall(r"^\s*(?:from|import)\s+([a-zA-Z_]+)", src, re.M):
            if mod not in PY_ALLOWED:
                return [("(imports)", False, f"module '{mod}' not allowed")]
    ns = {"__name__": "__practice__"}
    try:
        exec(code + "\n\n" + tests, ns)
    except Exception as e:
        return [("(load)", False, f"{type(e).__name__}: {e}")]
    results = []
    for name, fn in list(ns.items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                results.append((name, True, ""))
            except Exception as e:
                results.append((name, False, f"{type(e).__name__}: {e}"))
    return results


def run_typescript(code, tests):
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "practice.ts")
        with open(src, "w") as f:
            f.write(TS_PRELUDE + code + "\n\n" + tests + "\nexport {};\n")
        tsc = subprocess.run(["tsc", "--strict", "--target", "es2020", "--module", "commonjs",
                              "--lib", "es2020", "--skipLibCheck", "--outDir", d, src],
                             capture_output=True, text=True)
        if tsc.returncode != 0:
            return [("(compile)", False, (tsc.stdout + tsc.stderr).strip()[:600])]
        harness = os.path.join(d, "harness.js")
        with open(harness, "w") as f:
            f.write(TS_HARNESS)
        out = subprocess.run(["node", harness, os.path.join(d, "practice.js")],
                             capture_output=True, text=True, timeout=30)
        try:
            return [tuple(r) for r in json.loads(out.stdout.strip().splitlines()[-1])]
        except Exception:
            return [("(run)", False, (out.stdout + out.stderr).strip()[:600])]


def run_go(code, tests):
    with tempfile.TemporaryDirectory() as d:
        with open(os.path.join(d, "go.mod"), "w") as f:
            f.write("module practice\n\ngo 1.21\n")
        with open(os.path.join(d, "practice.go"), "w") as f:
            f.write(code + "\n")
        with open(os.path.join(d, "practice_test.go"), "w") as f:
            f.write(tests + "\n")
        env = dict(os.environ, GOFLAGS="-mod=mod", GOTOOLCHAIN="local")
        out = subprocess.run(["go", "test", "-json", "-count=1", "./..."], cwd=d,
                             capture_output=True, text=True, timeout=120, env=env)
        results, failed_output = {}, {}
        for line in out.stdout.splitlines():
            try:
                ev = json.loads(line)
            except ValueError:
                continue
            t = ev.get("Test")
            if not t or "/" in t:
                continue
            if ev.get("Action") == "output":
                failed_output.setdefault(t, []).append(ev.get("Output", ""))
            elif ev.get("Action") in ("pass", "fail"):
                results[t] = ev["Action"] == "pass"
        if not results:
            return [("(build)", False, (out.stdout + out.stderr).strip()[-600:])]
        return [(t, ok, "" if ok else "".join(failed_output.get(t, [])).strip()[-300:])
                for t, ok in results.items()]


RUNNERS = {"python": run_python, "typescript": run_typescript, "go": run_go}


def main():
    md = open(sys.argv[1], encoding="utf8").read()
    langs = [sys.argv[sys.argv.index("--lang") + 1]] if "--lang" in sys.argv else LANGS
    answer = None
    if "--answer" in sys.argv:
        answer = open(sys.argv[sys.argv.index("--answer") + 1], encoding="utf8").read()

    ok_all = True
    for lang in langs:
        starter, tests, solution = (block(md, lang, k) for k in ("starter", "tests", "solution"))
        if not (starter and tests and solution):
            print(f"{lang}: missing ```{lang} starter / tests / solution block")
            ok_all = False
            continue
        if answer is not None:
            res = RUNNERS[lang](answer, tests)
            for name, ok, err in res:
                print(("PASS " if ok else "FAIL ") + name + ("" if ok else f"  {err}"))
            ok_all = ok_all and all(r[1] for r in res)
            continue
        sol, sta = RUNNERS[lang](solution, tests), RUNNERS[lang](starter, tests)
        sol_fail = [r for r in sol if not r[1]]
        sta_fail = [r for r in sta if not r[1]]
        ok = not sol_fail and sta_fail and len(sol) >= 4
        print(f"{lang}: solution {len(sol) - len(sol_fail)}/{len(sol)} pass; "
              f"starter {len(sta_fail)} failing -> {'OK' if ok else 'FAILED'}")
        for name, _, err in sol_fail:
            print(f"  FAIL with solution: {name} - {err}")
        if not sta_fail:
            print("  starter passes every test; it must leave at least one failing")
        ok_all = ok_all and bool(ok)
    if not ok_all:
        sys.exit("Practice check failed")
    print("OK")


if __name__ == "__main__":
    main()
