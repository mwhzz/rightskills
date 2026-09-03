#!/bin/bash
# Runs on the cPanel server. Safe to call every minute from cron.
# --force: run immediately (used by the HTTP hook).
# Without --force: runs if tmp/deploy.flag OR a waiting next-linux.tgz exists.
# A leftover tarball must always be applied, even if a previous run cleared the flag.

set -euo pipefail

APP="/home/righwail/rightskills"
VENV="/home/righwail/nodevenv/rightskills/22/bin/activate"
FLAG="$APP/tmp/deploy.flag"
TGZ="$APP/tmp/next-linux.tgz"
LOCKDIR="$APP/tmp/deploy.lockdir"
LOG="$APP/tmp/deploy.log"
APPLY="$APP/scripts/cpanel-apply-next.sh"

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

if [[ "$FORCE" -ne 1 && ! -f "$FLAG" && ! -f "$TGZ" ]]; then
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
      bash "$APPLY"
    fi
  }

  # Recover the storefront before git/npm, then again after pulling the latest scripts.
  apply_next

  git fetch origin main
  git reset --hard origin/main

  apply_next

  npm install
  npx prisma generate
  npx prisma migrate deploy
  mkdir -p uploads/lessons tmp
  touch tmp/restart.txt
  rm -f "$FLAG"

  echo "===== $(date -Is) done ====="
} >>"$LOG" 2>&1
