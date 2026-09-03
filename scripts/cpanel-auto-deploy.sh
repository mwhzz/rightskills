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

  # Replace webpack output atomically. Never merge two Next builds.
  if [[ -f tmp/next-linux.tgz ]]; then
    echo "Extracting Linux .next tarball"
    rm -rf .next
    tar -xzf tmp/next-linux.tgz
    rm -f tmp/next-linux.tgz
    echo "BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo missing)"
  fi

  # Pick up the GitHub-uploaded .next even if git/npm fail later.
  touch tmp/restart.txt

  git fetch origin main
  git reset --hard origin/main

  # Extract again after pull in case the tarball landed during git/npm.
  if [[ -f tmp/next-linux.tgz ]]; then
    echo "Extracting Linux .next tarball"
    rm -rf .next
    tar -xzf tmp/next-linux.tgz
    rm -f tmp/next-linux.tgz
    echo "BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo missing)"
  fi

  npm install
  npx prisma generate
  npx prisma migrate deploy
  mkdir -p uploads/lessons tmp
  touch tmp/restart.txt
  rm -f "$FLAG"

  echo "===== $(date -Is) done ====="
} >>"$LOG" 2>&1
