#!/bin/bash
# Runs on the cPanel server. Safe to call every minute from cron.
# --force: run immediately (used by the HTTP hook).
# Without --force: runs only if tmp/deploy.flag exists.

set -euo pipefail

APP="/home/righwail/rightskills"
VENV="/home/righwail/nodevenv/rightskills/22/bin/activate"
FLAG="$APP/tmp/deploy.flag"
LOCKDIR="$APP/tmp/deploy.lockdir"
LOG="$APP/tmp/deploy.log"

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

if [[ "$FORCE" -ne 1 && ! -f "$FLAG" ]]; then
  exit 0
fi

mkdir -p "$APP/tmp"

if ! mkdir "$LOCKDIR" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT

{
  echo "===== $(date -Is) start ====="

  # CloudLinux activate references unset vars; nounset must be off while sourcing.
  set +u
  # shellcheck disable=SC1090
  source "$VENV"
  set -u
  cd "$APP"
  mkdir -p uploads/lessons tmp

  extract_next_tarball() {
    if [[ ! -f tmp/next-linux.tgz ]]; then
      return 0
    fi
    echo "Extracting Linux .next tarball"
    rm -rf .next
    tar -xzf tmp/next-linux.tgz
    rm -f tmp/next-linux.tgz
    echo "BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo missing)"
    python3 - <<'PY' || true
from pathlib import Path
root = Path(".next")
replacements = [
    (b"/home/runner/work/rightskills/rightskills", b"/home/righwail/rightskills"),
    (b"C:\\\\Users\\\\tp\\\\Documents\\\\zawad\\\\rightskills\\\\skills-bangladesh", b"/home/righwail/rightskills"),
]
changed = 0
for path in root.rglob("*"):
    if not path.is_file() or path.stat().st_size > 12_000_000:
        continue
    data = path.read_bytes()
    orig = data
    for old, new in replacements:
        if old in data:
            data = data.replace(old, new)
    if data != orig:
        path.write_bytes(data)
        changed += 1
print(f"rewrote {changed} files")
PY
  }

  # Replace webpack output atomically. Never merge two Next builds.
  extract_next_tarball

  # Pick up the GitHub-uploaded .next even if git/npm fail later.
  touch tmp/restart.txt

  git fetch origin main
  git reset --hard origin/main

  # Extract again after pull in case the tarball landed during git/npm.
  extract_next_tarball

  npm install
  npx prisma generate
  npx prisma migrate deploy
  mkdir -p uploads/lessons tmp
  touch tmp/restart.txt
  rm -f "$FLAG"

  echo "===== $(date -Is) done ====="
} >>"$LOG" 2>&1
