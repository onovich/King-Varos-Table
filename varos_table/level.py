"""Level data, region masks, and deterministic generation for the prototype."""

from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping

from .content import (
    BANQUET_TIMELINE,
    CHAPTER_EPILOGUE,
    CHAPTER_NAME,
    COUNTRIES,
    LEVEL_SUBTITLE,
    LEVEL_TITLE,
)
from .minizinc_check import verify_unique
from .solver import Constraint, DirectClueSolver, SolveResult


@dataclass(frozen=True)
class RegionMetrics:
    full_clue_count: int
    visible_clue_count: int
    solver_steps: int
    first_forced_cells: int
    unique_verified: bool
    basic_steps: int
    advanced_steps: int
    reasoning_level: str
    bright_count: int
    dark_count: int
    clue_min: int
    clue_max: int


@dataclass(frozen=True)
class RegionLevel:
    region_id: int
    name: Mapping[str, str]
    accent: str
    cells: tuple[int, ...]
    clues: dict[int, int]
    metrics: RegionMetrics
    country: Mapping[str, object]


@dataclass(frozen=True)
class GeneratedLevel:
    width: int
    height: int
    seed: int
    attempt: int
    region_map: tuple[int, ...]
    target: tuple[int, ...]
    regions: tuple[RegionLevel, ...]

    def public_dict(self, include_solution: bool = False) -> dict:
        payload = {
            "schemaVersion": 2,
            "title": dict(LEVEL_TITLE),
            "subtitle": dict(LEVEL_SUBTITLE),
            "width": self.width,
            "height": self.height,
            "seed": self.seed,
            "clueRange": [
                min(clue for region in self.regions for clue in region.clues.values()),
                max(clue for region in self.regions for clue in region.clues.values()),
            ],
            "reasoningLevel": "advanced"
            if any(region.metrics.reasoning_level == "advanced" for region in self.regions)
            else "basic",
            "campaign": {
                "chapterId": "inner-sea",
                "chapterName": dict(CHAPTER_NAME),
                "banquetTimeline": [dict(beat) for beat in BANQUET_TIMELINE],
                "epilogue": dict(CHAPTER_EPILOGUE),
            },
            "regionMap": list(self.region_map),
            "regions": [
                {
                    "id": region.region_id,
                    "name": dict(region.name),
                    "accent": region.accent,
                    "cells": list(region.cells),
                    "clues": {str(index): value for index, value in sorted(region.clues.items())},
                    "country": dict(region.country),
                    "metrics": {
                        "fullClueCount": region.metrics.full_clue_count,
                        "visibleClueCount": region.metrics.visible_clue_count,
                        "solverSteps": region.metrics.solver_steps,
                        "firstForcedCells": region.metrics.first_forced_cells,
                        "uniqueVerified": region.metrics.unique_verified,
                        "basicSteps": region.metrics.basic_steps,
                        "advancedSteps": region.metrics.advanced_steps,
                        "reasoningLevel": region.metrics.reasoning_level,
                        "brightCount": region.metrics.bright_count,
                        "darkCount": region.metrics.dark_count,
                        "clueMin": region.metrics.clue_min,
                        "clueMax": region.metrics.clue_max,
                    },
                }
                for region in self.regions
            ],
        }
        if include_solution:
            payload["solution"] = list(self.target)
        return payload


def build_region_map(width: int = 20, height: int = 20) -> list[int]:
    """Create the fixed seven-country chapter-one map."""

    if width < 12 or height < 12:
        raise ValueError("the chapter-one region map needs a board of at least 12x12")
    seeds = (
        (width * 3 / 20, height * 3 / 20),
        (width * 10 / 20, height * 2 / 20),
        (width * 16 / 20, height * 4 / 20),
        (width * 3 / 20, height * 15 / 20),
        (width * 9 / 20, height * 13 / 20),
        (width * 15 / 20, height * 15 / 20),
        (width * 18 / 20, height * 11 / 20),
    )
    region_map: list[int] = []
    for y in range(height):
        for x in range(width):
            distances: list[tuple[float, int]] = []
            for region_id, (seed_x, seed_y) in enumerate(seeds):
                distance = (x - seed_x) ** 2 * 1.1 + (y - seed_y) ** 2
                distances.append((distance + region_id * 0.01, region_id))
            region_map.append(min(distances)[1])
    return region_map


def neighbours_for_cell(width: int, height: int, region_map: Iterable[int], index: int) -> tuple[int, ...]:
    """Return the clipped 3x3 neighbourhood that remains in the same region."""

    regions = tuple(region_map)
    if len(regions) != width * height:
        raise ValueError("region_map must cover the whole board")
    if index < 0 or index >= width * height:
        raise ValueError("cell index is outside the board")
    x, y = index % width, index // width
    region_id = regions[index]
    cells: list[int] = []
    for neighbour_y in range(max(0, y - 1), min(height, y + 2)):
        for neighbour_x in range(max(0, x - 1), min(width, x + 2)):
            neighbour = neighbour_y * width + neighbour_x
            if regions[neighbour] == region_id:
                cells.append(neighbour)
    return tuple(cells)


def calculate_clues(width: int, height: int, region_map: Iterable[int], target: Iterable[int]) -> list[int]:
    """Calculate a clue for every cell, clipping each 3x3 query to its region."""

    regions = tuple(region_map)
    target_values = tuple(int(value) for value in target)
    if len(target_values) != width * height:
        raise ValueError("target must cover the whole board")
    return [
        sum(target_values[cell] for cell in neighbours_for_cell(width, height, regions, index))
        for index in range(width * height)
    ]


def _region_cells(region_map: Iterable[int], region_id: int) -> tuple[int, ...]:
    return tuple(index for index, value in enumerate(region_map) if value == region_id)


def _region_constraints(
    width: int,
    height: int,
    region_map: Iterable[int],
    region_cells: tuple[int, ...],
    visible_clues: Mapping[int, int],
) -> tuple[Constraint, ...]:
    local_index = {global_index: local for local, global_index in enumerate(region_cells)}
    return tuple(
        Constraint(
            (local_index[cell] for cell in neighbours_for_cell(width, height, region_map, clue_index)),
            clue_value,
        )
        for clue_index, clue_value in visible_clues.items()
    )


def _solve_region(
    width: int,
    height: int,
    region_map: Iterable[int],
    region_cells: tuple[int, ...],
    visible_clues: Mapping[int, int],
) -> SolveResult:
    return DirectClueSolver(
        len(region_cells),
        _region_constraints(width, height, region_map, region_cells, visible_clues),
    ).solve()


def _make_balanced_target(width: int, height: int, region_map: list[int], rng: random.Random) -> list[int]:
    """Make smooth, dense light/dark fields with an even split per region.

    Uniformly scattered bits almost never expose a complete chain of direct
    zero/full deductions. Blurring a seeded random field first creates the
    contiguous runs found in hand-authored Fill-a-Pix art while retaining an
    exact 1:1 light/dark balance inside every demo region.
    """

    scores = [rng.random() for _ in range(width * height)]
    for _ in range(2):
        smoothed_scores: list[float] = []
        for index in range(width * height):
            neighbourhood = neighbours_for_cell(width, height, region_map, index)
            smoothed_scores.append(sum(scores[cell] for cell in neighbourhood) / len(neighbourhood))
        scores = smoothed_scores

    target = [0] * (width * height)
    for region_id in sorted(set(region_map)):
        cells = list(_region_cells(region_map, region_id))
        cells.sort(key=lambda cell: (scores[cell], cell), reverse=True)
        bright_count = len(cells) // 2
        for cell in cells[:bright_count]:
            target[cell] = 1
    return target


def _prune_region(
    width: int,
    height: int,
    region_map: list[int],
    region_cells: tuple[int, ...],
    full_clues: Mapping[int, int],
    target: list[int],
    rng: random.Random,
) -> tuple[dict[int, int], SolveResult]:
    working = dict(full_clues)
    shuffled_clues = list(region_cells)
    rng.shuffle(shuffled_clues)
    target_local = tuple(target[index] for index in region_cells)
    required_clues = {next(cell for cell in region_cells if full_clues[cell] == clue) for clue in set(full_clues.values())}

    for clue_index in shuffled_clues:
        if clue_index in required_clues:
            continue
        if len(working) <= len(required_clues):
            break
        trial = dict(working)
        del trial[clue_index]
        result = _solve_region(width, height, region_map, region_cells, trial)
        if result.status == "solved" and result.values == target_local:
            working = trial

    result = _solve_region(width, height, region_map, region_cells, working)
    if result.status != "solved" or result.values != target_local:
        raise ValueError("pruned region is not solvable by direct clue deductions")
    return working, result


def build_level(
    *,
    width: int = 20,
    height: int = 20,
    seed: int = 20260828,
    max_attempts: int = 100,
    verify_with_minizinc: bool = True,
    require_full_clue_range: bool = True,
) -> GeneratedLevel:
    """Generate a unique level solvable by visible single-clue deductions."""

    base_region_map = build_region_map(width, height)
    region_ids = sorted(set(base_region_map))
    if region_ids != list(range(len(region_ids))):
        raise ValueError("region ids must be contiguous and start at zero")
    countries_by_region_id = {int(country["regionId"]): country for country in COUNTRIES}
    if len(countries_by_region_id) != len(COUNTRIES):
        raise ValueError("chapter-one country metadata contains duplicate region ids")
    if set(region_ids) != set(countries_by_region_id):
        raise ValueError("chapter-one region metadata must match the generated map")
    for attempt in range(1, max_attempts + 1):
        rng = random.Random(seed + attempt * 1009)
        target = _make_balanced_target(width, height, base_region_map, rng)
        full_clues = calculate_clues(width, height, base_region_map, target)
        if require_full_clue_range and (min(full_clues) != 0 or max(full_clues) != 9):
            continue
        generated_regions: list[RegionLevel] = []
        failed = False

        for region_id in region_ids:
            country = countries_by_region_id[region_id]
            cells = _region_cells(base_region_map, region_id)
            clues = {cell: full_clues[cell] for cell in cells}
            full_result = _solve_region(width, height, base_region_map, cells, clues)
            target_local = tuple(target[cell] for cell in cells)
            if full_result.status != "solved" or full_result.values != target_local:
                failed = True
                break

            try:
                visible_clues, result = _prune_region(
                    width,
                    height,
                    base_region_map,
                    cells,
                    clues,
                    target,
                    rng,
                )
            except ValueError:
                failed = True
                break

            constraints = _region_constraints(width, height, base_region_map, cells, visible_clues)
            unique_verified = verify_unique(
                len(cells),
                constraints,
                target_local,
            ) if verify_with_minizinc else False
            if verify_with_minizinc and not unique_verified:
                failed = True
                break

            basic_steps = sum(1 for step in result.steps if step.reasoning_level == "basic")
            advanced_steps = sum(1 for step in result.steps if step.reasoning_level == "advanced")
            generated_regions.append(
                RegionLevel(
                    region_id,
                    dict(country["name"]),
                    str(country["accent"]),
                    cells,
                    visible_clues,
                    RegionMetrics(
                        len(clues),
                        len(visible_clues),
                        len(result.steps),
                        basic_steps,
                        unique_verified,
                        basic_steps,
                        advanced_steps,
                        result.reasoning_level,
                        sum(target[index] for index in cells),
                        len(cells) - sum(target[index] for index in cells),
                        min(visible_clues.values()),
                        max(visible_clues.values()),
                    ),
                    {
                        key: dict(value) if isinstance(value, dict) else value
                        for key, value in country.items()
                        if key not in {"regionId", "accent", "name"}
                    },
                )
            )

        visible_values = [clue for region in generated_regions for clue in region.clues.values()]
        if (
            not failed
            and len(generated_regions) == len(region_ids)
            and (not require_full_clue_range or (min(visible_values) == 0 and max(visible_values) == 9))
        ):
            return GeneratedLevel(
                width,
                height,
                seed,
                attempt,
                tuple(base_region_map),
                tuple(target),
                tuple(generated_regions),
            )

    raise RuntimeError(f"could not generate a direct-solvable level after {max_attempts} attempts")


def write_public_level(level: GeneratedLevel, output_path: str | Path, include_solution: bool = False) -> None:
    import json

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(level.public_dict(include_solution), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
