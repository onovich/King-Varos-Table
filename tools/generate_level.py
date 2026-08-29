#!/usr/bin/env python3
"""Generate and export a King Varo's Table demo level."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from varos_table.level import build_level, write_public_level


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=20260828)
    parser.add_argument("--width", type=int, default=20)
    parser.add_argument("--height", type=int, default=20)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("web/data/levels/inner-sea.json"),
        help="public level JSON path (the hidden solution is omitted by default)",
    )
    parser.add_argument(
        "--skip-minizinc",
        action="store_true",
        help="skip strict uniqueness verification; intended only for local iteration",
    )
    parser.add_argument(
        "--allow-narrow-clue-range",
        action="store_true",
        help="allow a custom level whose generated clues do not span the full 0–9 range",
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
        require_full_clue_range=not args.allow_narrow_clue_range,
    )
    write_public_level(level, args.output, include_solution=args.include_solution)

    print(f"Generated {args.width}x{args.height} level: {args.output}")
    print(f"Seed: {args.seed} (attempt {level.attempt})")
    level_difficulty = level.public_dict()["difficulty"]
    print(
        f"Difficulty: {level_difficulty['label']} "
        f"({level_difficulty['reasoningLevel']}, {level_difficulty['effort']}, "
        f"{level_difficulty['deductionSteps']} deductions)"
    )
    for region in level.regions:
        metrics = region.metrics
        print(
            f"  region {region.region_id}: {len(region.cells)} cells, "
            f"{metrics.visible_clue_count}/{metrics.full_clue_count} clues, "
            f"{metrics.difficulty.deduction_steps} deductions, "
            f"first={metrics.first_forced_cells}, "
            f"unique={metrics.unique_verified}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
