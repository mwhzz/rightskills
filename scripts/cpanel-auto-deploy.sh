#!/bin/bash
# Runs on the cPanel server. Safe to call every minute from cron.
# --force: run immediately (used by the HTTP hook).
# Without --force: runs if tmp/deploy.flag exists, or a complete next-linux.tgz is waiting.
# Incomplete FTP uploads are ignored. A leftover complete tarball is always applied,
# even if a previous run already cleared the flag.

set -euo pipefail

APP="/home/righwail/rightskills"
VENV="/home/righwail/nodevenv/rightskills/22/bin/activate"
FLAG="$APP/tmp/deploy.flag"
TGZ="$APP/tmp/next-linux.tgz"
LOCKDIR="$APP/tmp/deploy.lockdir"
LOG="$APP/tmp/deploy.log"
APPLY="$APP/scripts/cpanel-apply-next.sh"

tarball_ready() {
  [[ -f "$TGZ" ]] && gzip -t "$TGZ" 2>/dev/null
}

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

if [[ "$FORCE" -ne 1 && ! -f "$FLAG" ]] && ! tarball_ready; then
  exit 0
fi

mkdir -p "$APP/tmp"

if ! mkdir "$LOCKDIR" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT

{
  echo "===== $(date -Is) start ====="

  set +u
  # shellcheck disable=SC1090
  source "$VENV"
  set -u
  cd "$APP"
  mkdir -p uploads/lessons tmp

  apply_next() {
    if [[ -f "$APPLY" ]]; then
      bash "$APPLY" || echo "apply-next exited $?"
    fi
  }

  apply_next

  git fetch origin main
  git reset --hard origin/main

  apply_next

  npm install
  npx prisma generate || echo "prisma generate failed"
  npx prisma migrate deploy || echo "prisma migrate failed; continuing"
  mkdir -p uploads/lessons tmp
  touch tmp/restart.txt
  if [[ ! -f "$TGZ" ]]; then
    rm -f "$FLAG"
  else
    echo "leaving deploy.flag; tarball still present"
  fi

  echo "===== $(date -Is) done ====="
} >>"$LOG" 2>&1
