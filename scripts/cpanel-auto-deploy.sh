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

  rm -f "$FLAG"

  # shellcheck disable=SC1090
  source "$VENV"
  cd "$APP"

  git fetch origin main
  git reset --hard origin/main

  npm install
  npx prisma generate
  npx prisma migrate deploy
  mkdir -p uploads/lessons tmp
  touch tmp/restart.txt

  echo "===== $(date -Is) done ====="
} >>"$LOG" 2>&1
