#!/usr/bin/env python3
"""Generate and export a small Proverbs-inspired demo level."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from proverbs.level import build_level, write_public_level


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=20260827)
    parser.add_argument("--width", type=int, default=15)
    parser.add_argument("--height", type=int, default=15)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("web/data/demo-level.json"),
        help="public level JSON path (the hidden solution is omitted by default)",
    )
    parser.add_argument(
        "--skip-minizinc",
        action="store_true",
        help="skip strict uniqueness verification; intended only for local iteration",
    )
    parser.add_argument(
        "--include-solution",
        action="store_true",
        help="include the target solution in the exported JSON for debugging",
    )
    args = parser.parse_args()

    level = build_level(
        width=args.width,
        height=args.height,
        seed=args.seed,
        verify_with_minizinc=not args.skip_minizinc,
    )
    write_public_level(level, args.output, include_solution=args.include_solution)

    print(f"Generated {args.width}x{args.height} level: {args.output}")
    print(f"Seed: {args.seed} (attempt {level.attempt})")
    for region in level.regions:
        metrics = region.metrics
        print(
            f"  {region.name}: {len(region.cells)} cells, "
            f"{metrics.visible_clue_count}/{metrics.full_clue_count} clues, "
            f"{metrics.solver_steps} deterministic steps, "
            f"unique={metrics.unique_verified}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
