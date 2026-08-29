#!/usr/bin/env python3
"""Generate every public board and the campaign level-book manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from varos_table.content import CHAPTER_NAME, localized
from varos_table.level import build_level, write_public_level
from varos_table.tutorials import TUTORIAL_SPECS, build_tutorial_levels, write_public_tutorials


def _tutorial_entry(spec, level: dict, index: int, unlock_after: str | None) -> dict:
    return {
        "id": spec.level_id,
        "source": f"./data/levels/{spec.level_id}.json",
        "folio": f"00{chr(ord('A') + index)}",
        "title": dict(spec.title),
        "summary": dict(spec.subtitle),
        "width": level["width"],
        "height": level["height"],
        "regionCount": len(level["regions"]),
        "difficulty": "tutorial",
        "unlockAfter": unlock_after,
    }


def build_manifest(tutorial_levels: tuple[dict, ...]) -> dict:
    tutorial_entries = []
    previous_id = None
    for index, (spec, level) in enumerate(zip(TUTORIAL_SPECS, tutorial_levels, strict=True)):
        tutorial_entries.append(_tutorial_entry(spec, level, index, previous_id))
        previous_id = spec.level_id

    return {
        "schemaVersion": 1,
        "bookId": "king-varos-table",
        "title": localized("瓦罗王的地图册", "King Varo's Map Book"),
        "chapters": [
            {
                "id": "prologue",
                "number": "00",
                "title": localized("开宴之前", "Before the Feast"),
                "description": localized(
                    "三张练习页，从一个数字的确定性推导走到多国版图。",
                    "Three practice leaves, from one-clue certainty to a map of several countries.",
                ),
                "levels": tutorial_entries,
            },
            {
                "id": "inner-sea",
                "number": "01",
                "title": dict(CHAPTER_NAME),
                "description": localized(
                    "第一道正式版图：七个国家、七份陷落记录，以及一场逐渐显露本意的晚宴。",
                    "The first formal map: seven countries, seven fall records, and a banquet that gradually reveals its true appetite.",
                ),
                "levels": [
                    {
                        "id": "inner-sea",
                        "source": "./data/levels/inner-sea.json",
                        "folio": "01",
                        "title": localized("内海七国", "Seven Kingdoms of the Inner Sea"),
                        "summary": localized(
                            "20×20 正式版图；完成每个国家后解锁一份历史故事卡。",
                            "A 20×20 formal map; completing each country reveals one historical story card.",
                        ),
                        "width": 20,
                        "height": 20,
                        "regionCount": 7,
                        "difficulty": "standard",
                        "unlockAfter": TUTORIAL_SPECS[-1].level_id,
                    }
                ],
            },
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=20260828)
    parser.add_argument(
        "--output-directory",
        type=Path,
        default=Path("web/data/levels"),
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("web/data/campaign.json"),
    )
    parser.add_argument(
        "--skip-minizinc",
        action="store_true",
        help="skip strict uniqueness verification; intended only for local iteration",
    )
    args = parser.parse_args()

    verify = not args.skip_minizinc
    tutorial_levels = build_tutorial_levels(verify_with_minizinc=verify)
    write_public_tutorials(tutorial_levels, args.output_directory)

    main_level = build_level(seed=args.seed, verify_with_minizinc=verify)
    write_public_level(main_level, args.output_directory / "inner-sea.json")

    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(
        json.dumps(build_manifest(tutorial_levels), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Generated {len(tutorial_levels) + 1} levels and {args.manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
