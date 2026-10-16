#!/usr/bin/env python3
"""Secret scan for PixKitApp push safety check.
Scans: (1) working tree files, (2) git history (all blobs in all commits).
Prints file names + line numbers ONLY, never secret values.
"""
import os
import re
import subprocess
import sys

PROJECT = "/home/z/my-project"

# Pattern name -> regex (case-sensitive where it matters)
PATTERNS = {
    "GitHub PAT (ghp_)": re.compile(rb"ghp_[A-Za-z0-9]{36,}"),
    "GitHub fine-grained PAT": re.compile(rb"github_pat_[A-Za-z0-9_]{20,}"),
    "GitHub OAuth (gho_/ghu_/ghs_/ghr_)": re.compile(rb"gh[ousr]_[A-Za-z0-9]{36,}"),
    "AWS Access Key": re.compile(rb"AKIA[0-9A-Z]{16}"),
    "Slack token": re.compile(rb"xox[baprs]-[A-Za-z0-9-]{10,}"),
    "OpenAI-style key": re.compile(rb"sk-[A-Za-z0-9_-]{20,}"),
    "Google API key": re.compile(rb"AIza[0-9A-Za-z_-]{35}"),
    "Stripe key": re.compile(rb"(sk|pk)_(live|test)_[A-Za-z0-9]{16,}"),
    "Private key block": re.compile(rb"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "Basic auth in URL": re.compile(rb"https://[A-Za-z0-9._~:-]+@[a-z0-9.-]+\.(github\.com|gitlab\.com)", re.I),
    "Generic password assignment": re.compile(rb"""(?i)(password|passwd|pwd)\s*[:=]\s*['"][^'"]{6,}['"]"""),
    "Generic api_key assignment": re.compile(rb"""(?i)api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-\.]{12,}['"]"""),
    "Generic secret assignment": re.compile(rb"""(?i)(secret|token)\s*[:=]\s*['"][A-Za-z0-9_\-\.]{16,}['"]"""),
    "JWT": re.compile(rb"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}"),
}

SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "build", ".turbo", ".cache"}
SKIP_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".pdf", ".zip",
            ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".mp3", ".webm", ".bundle", ".db"}

findings = []  # (location, filename, line_no, pattern_name)


def scan_bytes(data, location, filename):
    for pat_name, rx in PATTERNS.items():
        for m in rx.finditer(data):
            # line number
            line_no = data.count(b"\n", 0, m.start()) + 1
            findings.append((location, filename, line_no, pat_name))


def scan_working_tree():
    for root, dirs, files in os.walk(PROJECT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            path = os.path.join(root, f)
            ext = os.path.splitext(f)[1].lower()
            if ext in SKIP_EXT:
                continue
            try:
                if os.path.getsize(path) > 2_000_000:  # skip >2MB
                    continue
                with open(path, "rb") as fh:
                    data = fh.read()
            except (OSError, PermissionError):
                continue
            rel = os.path.relpath(path, PROJECT)
            loc = "TRACKED-OR-UNTRACKED" if subprocess.run(
                ["git", "ls-files", "--error-unmatch", rel],
                cwd=PROJECT, capture_output=True).returncode == 0 else "UNTRACKED/IGNORED"
            scan_bytes(data, loc, rel)


def scan_history():
    """Scan every unique blob in every commit."""
    r = subprocess.run(["git", "rev-list", "--all"], cwd=PROJECT,
                       capture_output=True, text=True)
    commits = r.stdout.split()
    seen_blobs = set()
    for i, c in enumerate(commits):
        r2 = subprocess.run(["git", "ls-tree", "-r", c], cwd=PROJECT,
                            capture_output=True, text=True)
        for line in r2.stdout.splitlines():
            meta, _, path = line.partition("\t")
            parts = meta.split()
            if len(parts) >= 3 and parts[1] == "blob":
                blob = parts[2]
                if blob in seen_blobs:
                    continue
                seen_blobs.add(blob)
                ext = os.path.splitext(path)[1].lower()
                if ext in SKIP_EXT:
                    continue
                r3 = subprocess.run(["git", "cat-file", "-p", blob], cwd=PROJECT,
                                    capture_output=True)
                if r3.returncode != 0 or len(r3.stdout) > 2_000_000:
                    continue
                scan_bytes(r3.stdout, f"commit {c[:8]}", path)
    return len(commits)


def main():
    scan_working_tree()
    n_commits = scan_history()

    # .gitignore check
    gi = os.path.join(PROJECT, ".gitignore")
    gi_content = ""
    if os.path.exists(gi):
        with open(gi) as fh:
            gi_content = fh.read()
    has_env = re.search(r"(^|\n)\s*\.env\b", gi_content) is not None
    has_env_local = re.search(r"(^|\n)\s*\.env(\.local|\.\*)?\b", gi_content) is not None

    print(f"=== SECRET SCAN REPORT ===")
    print(f"Commits scanned in history: {n_commits}")
    print(f"Working tree files scanned (excluding binaries, node_modules, .git)")
    print()
    if findings:
        print(f"!! FINDINGS: {len(findings)}")
        seen = set()
        for loc, fname, line, pat in findings:
            key = (loc, fname, line, pat)
            if key in seen:
                continue
            seen.add(key)
            print(f"  [{loc}] {fname}:{line}  -> {pat}")
    else:
        print("NO SECRETS FOUND in working tree or git history.")
    print()
    print(f"=== .gitignore check ===")
    print(f".gitignore exists: {os.path.exists(gi)}")
    print(f"covers .env: {has_env}")
    print(f"covers .env.local / .env*: {has_env_local}")
    if gi_content:
        print("--- .gitignore contents ---")
        print(gi_content)
    print()
    # env files present on disk?
    print("=== .env files on disk ===")
    for f in os.listdir(PROJECT):
        if f.startswith(".env"):
            print(f"  present: {f}")
    if not any(f.startswith(".env") for f in os.listdir(PROJECT)):
        print("  none")


if __name__ == "__main__":
    sys.exit(main())
