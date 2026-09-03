#!/usr/bin/env python3
"""Rewrite Next.js absolute build-machine paths so the cPanel host can load RSC."""

from __future__ import annotations

import sys
from pathlib import Path

APP = b"/home/righwail/rightskills"
REPLACEMENTS = (
    (b"/home/runner/work/rightskills/rightskills", APP),
    (
        b"C:\\Users\\tp\\Documents\\zawad\\rightskills\\skills-bangladesh",
        APP,
    ),
    (
        b"C:/Users/tp/Documents/zawad/rightskills/skills-bangladesh",
        APP,
    ),
)


def rewrite(root: Path) -> int:
    changed = 0
    for path in root.rglob("*"):
        if not path.is_file() or path.stat().st_size > 12_000_000:
            continue
        data = path.read_bytes()
        orig = data
        for old, new in REPLACEMENTS:
            if old in data:
                data = data.replace(old, new)
        if data != orig:
            path.write_bytes(data)
            changed += 1
    return changed


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".next")
    if not root.is_dir():
        print(f"missing {root}", file=sys.stderr)
        return 1
    changed = rewrite(root)
    print(f"rewrote {changed} files in {root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
