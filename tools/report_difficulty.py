#!/usr/bin/env python3
"""Report generated puzzle difficulty and fail on catalog/profile drift."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from varos_table.difficulty import (  # noqa: E402
    RegionDifficulty,
    analyse_region_difficulty,
    summarise_level_difficulty,
)
from varos_table.level import neighbours_for_cell  # noqa: E402
from varos_table.solver import Constraint, DirectClueSolver, NoGuessSolver  # noqa: E402


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _level_path(manifest_path: Path, source: str) -> Path:
    web_root = manifest_path.parent.parent
    return web_root / source.removeprefix("./")


def _region_difficulty(level: dict, region: dict) -> RegionDifficulty:
    cells = tuple(region["cells"])
    local_index = {global_index: local for local, global_index in enumerate(cells)}
    constraints = tuple(
        Constraint(
            (
                local_index[cell]
                for cell in neighbours_for_cell(
                    level["width"],
                    level["height"],
                    level["regionMap"],
                    int(clue_index),
                )
            ),
            clue_value,
        )
        for clue_index, clue_value in sorted(
            region["clues"].items(),
            key=lambda item: int(item[0]),
        )
    )
    direct_result = DirectClueSolver(len(cells), constraints).solve()
    if direct_result.status == "solved":
        result = direct_result
    elif direct_result.status == "stalled":
        result = NoGuessSolver(len(cells), constraints).solve()
    else:
        raise ValueError(f"level {level['levelId']} region {region['id']} is contradictory")
    if result.status != "solved":
        raise ValueError(f"level {level['levelId']} region {region['id']} is not no-guess solvable")
    return analyse_region_difficulty(
        cell_count=len(cells),
        visible_clue_count=len(region["clues"]),
        result=result,
    )


def _verify_region_profile(level: dict, region: dict, profile: RegionDifficulty) -> None:
    expected = profile.public_metrics_dict()
    actual = {key: region["metrics"].get(key) for key in expected}
    if actual != expected:
        raise ValueError(
            f"level {level['levelId']} region {region['id']} generated profile is stale"
        )


def _region_report(region: dict, profile: RegionDifficulty) -> dict:
    return {
        "id": region["id"],
        "name": region["name"],
        "cellCount": profile.cell_count,
        "visibleClueCount": profile.visible_clue_count,
        "clueDensity": round(profile.clue_density, 4),
        "assignmentSteps": profile.assignment_steps,
        "deductionSteps": profile.deduction_steps,
        "firstForcedCells": profile.first_forced_cells,
        "averageForcedCells": round(profile.average_forced_cells, 2),
        "singleCellDeductions": profile.single_cell_deductions,
        "advancedDeductions": profile.advanced_deductions,
        "reasoningLevel": profile.reasoning_level,
    }


def build_report(manifest_path: Path) -> dict:
    manifest = _load_json(manifest_path)
    entries = [
        entry
        for chapter in manifest["chapters"]
        for entry in chapter["levels"]
    ]
    listed_paths = {
        _level_path(manifest_path, entry["source"]).resolve()
        for entry in entries
    }
    levels_directory = manifest_path.parent / "levels"
    discovered_paths = {path.resolve() for path in levels_directory.glob("*.json")}
    missing_paths = sorted(listed_paths - discovered_paths)
    unlisted_paths = sorted(discovered_paths - listed_paths)
    if missing_paths:
        raise ValueError(
            "catalog references missing level files: "
            + ", ".join(path.name for path in missing_paths)
        )
    if unlisted_paths:
        raise ValueError(
            "level files not listed in the catalog: "
            + ", ".join(path.name for path in unlisted_paths)
        )

    levels = []
    for entry in entries:
        level = _load_json(_level_path(manifest_path, entry["source"]))
        if level.get("levelId") != entry["id"]:
            raise ValueError(f"catalog id {entry['id']} does not match its level file")
        region_profiles = tuple(
            _region_difficulty(level, region)
            for region in level["regions"]
        )
        for region, profile in zip(level["regions"], region_profiles, strict=True):
            _verify_region_profile(level, region, profile)
        computed = summarise_level_difficulty(
            kind=level["kind"],
            regions=region_profiles,
        )
        difficulty = level.get("difficulty")
        if difficulty != computed.public_dict():
            raise ValueError(f"level {entry['id']} generated profile is stale")
        if entry.get("difficulty") != computed.label:
            raise ValueError(
                f"level {entry['id']} catalog difficulty does not match its generated profile"
            )
        levels.append(
            {
                "id": entry["id"],
                **computed.public_dict(),
                "regions": [
                    _region_report(region, profile)
                    for region, profile in zip(
                        level["regions"],
                        region_profiles,
                        strict=True,
                    )
                ],
            }
        )
    return {"schemaVersion": 1, "levels": levels}


def _format_rows(report: dict) -> Iterable[str]:
    yield "LEVEL                 LABEL      REASONING  EFFORT  CELLS  REGIONS  CLUES  DEDUCTIONS  ADVANCED"
    for level in report["levels"]:
        yield (
            f"{level['id']:<21} {level['label']:<10} {level['reasoningLevel']:<10} "
            f"{level['effort']:<7} {level['cellCount']:>5} {level['regionCount']:>8} "
            f"{level['visibleClueCount']:>6} {level['deductionSteps']:>11} "
            f"{level['advancedDeductions']:>9}"
        )
        for region in level["regions"]:
            yield (
                f"  region {region['id']}: {region['cellCount']} cells, "
                f"{region['visibleClueCount']} clues, {region['deductionSteps']} deductions, "
                f"first={region['firstForcedCells']}, "
                f"average={region['averageForcedCells']}, "
                f"advanced={region['advancedDeductions']}"
            )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("web/data/campaign.json"),
    )
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args()

    report = build_report(args.manifest)
    if args.format == "json":
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print("\n".join(_format_rows(report)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
