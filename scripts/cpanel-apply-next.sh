#!/bin/bash
# Atomically install the Linux .next tarball uploaded by GitHub Actions.
# Safe to call whenever tmp/next-linux.tgz exists. No-op otherwise.

set -euo pipefail

APP="/home/righwail/rightskills"
cd "$APP"
mkdir -p tmp

TGZ="tmp/next-linux.tgz"
if [[ ! -f "$TGZ" ]]; then
  exit 0
fi

STAGE=$(mktemp -d "$APP/tmp/next-stage.XXXXXX")
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

echo "Extracting Linux .next tarball"
tar -xzf "$TGZ" -C "$STAGE"
if [[ ! -f "$STAGE/.next/BUILD_ID" ]]; then
  echo "tarball did not contain .next/BUILD_ID" >&2
  exit 1
fi

if [[ -f scripts/rewrite-next-paths.py ]]; then
  python3 scripts/rewrite-next-paths.py "$STAGE/.next" || true
fi

echo "BUILD_ID=$(cat "$STAGE/.next/BUILD_ID")"

rm -rf .next.prev
if [[ -d .next ]]; then
  mv .next .next.prev
fi
if ! mv "$STAGE/.next" .next; then
  if [[ -d .next.prev ]]; then
    mv .next.prev .next
  fi
  echo "failed to swap .next" >&2
  exit 1
fi
rm -rf .next.prev

mv -f "$TGZ" tmp/next-linux.tgz.last
touch tmp/restart.txt
echo "Passenger restart flagged"
