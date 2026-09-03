#!/bin/bash
# Atomically install the Linux .next tarball uploaded by GitHub Actions.
# Incomplete FTP uploads are ignored so the live site stays up.

set -euo pipefail

APP="/home/righwail/rightskills"
cd "$APP"
mkdir -p tmp

TGZ="tmp/next-linux.tgz"
if [[ ! -f "$TGZ" ]]; then
  exit 0
fi

if ! gzip -t "$TGZ" 2>/dev/null; then
  echo "tarball incomplete; waiting for FTP to finish"
  exit 0
fi

STAGE=$(mktemp -d "$APP/tmp/next-stage.XXXXXX")
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

echo "Extracting Linux .next tarball"
if ! tar -xzf "$TGZ" -C "$STAGE"; then
  echo "extract failed; leaving live .next in place"
  exit 0
fi
if [[ ! -f "$STAGE/.next/BUILD_ID" ]]; then
  echo "tarball did not contain .next/BUILD_ID; leaving live .next in place"
  exit 0
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
