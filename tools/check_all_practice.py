"""Run lessons/check_practice.py on every lesson that has a Practice section, in parallel.

Usage: python3 tools/check_all_practice.py [--jobs N] [paths...]
Exits non-zero and lists the failing lessons if any lesson's practice check fails.
"""
import concurrent.futures
import glob
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def check(path):
    r = subprocess.run([sys.executable, os.path.join(ROOT, "lessons", "check_practice.py"), path],
                       capture_output=True, text=True, cwd=ROOT)
    return path, r.returncode == 0, (r.stdout + r.stderr).strip()


def main():
    args = sys.argv[1:]
    jobs = os.cpu_count() or 4
    if "--jobs" in args:
        i = args.index("--jobs")
        jobs = int(args[i + 1])
        del args[i:i + 2]
    paths = args or sorted(p for p in glob.glob(os.path.join(ROOT, "lessons", "*", "*.md"))
                           if "## Practice" in open(p, encoding="utf8").read())
    failed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as ex:
        for n, (path, ok, out) in enumerate(ex.map(check, paths), 1):
            rel = os.path.relpath(path, ROOT)
            if not ok:
                failed.append(rel)
                print(f"FAIL {rel}\n{out}\n", flush=True)
            elif n % 50 == 0:
                print(f"... {n}/{len(paths)} checked", flush=True)
    print(f"{len(paths) - len(failed)}/{len(paths)} lessons pass")
    if failed:
        sys.exit("Failing lessons:\n" + "\n".join(failed))


if __name__ == "__main__":
    main()
