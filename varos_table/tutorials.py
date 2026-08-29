"""Hand-authored tutorial boards for the campaign prologue."""

from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Final

from .content import localized
from .level import (
    _prune_region,
    _region_cells,
    _region_constraints,
    _solve_region,
    calculate_clues,
)
from .minizinc_check import verify_unique


LocalizedText = dict[str, str]


@dataclass(frozen=True)
class TutorialSpec:
    level_id: str
    width: int
    height: int
    seed: int
    title: LocalizedText
    subtitle: LocalizedText
    lesson_title: LocalizedText
    lesson_body: LocalizedText
    completion_title: LocalizedText
    completion_body: LocalizedText
    region_names: tuple[LocalizedText, ...]
    accents: tuple[str, ...]
    target_rows: tuple[str, ...]
    region_map_factory: Callable[[], list[int]]


def _single_country_map() -> list[int]:
    return [0] * 36


def _border_lesson_map() -> list[int]:
    left_widths = (3, 3, 4, 4, 4, 3, 3, 4)
    return [
        0 if x < left_widths[y] else 1
        for y in range(8)
        for x in range(8)
    ]


def _three_country_map() -> list[int]:
    lower_edges = (6, 6, 6, 5, 6, 6, 5, 5, 6, 6)
    upper_splits = (5, 5, 4, 4, 5, 5, 5, 4, 4, 5)
    return [
        2 if y >= lower_edges[x] else (0 if x < upper_splits[y] else 1)
        for y in range(10)
        for x in range(10)
    ]


TUTORIAL_SPECS: Final = (
    TutorialSpec(
        level_id="first-light",
        width=6,
        height=6,
        seed=1001,
        title=localized("序页一 · 第一盏灯", "Prologue I · First Light"),
        subtitle=localized(
            "从 0 与满数开始，学会标记亮格和暗格。",
            "Begin with zeroes and full counts, then mark light and dark cells.",
        ),
        lesson_title=localized("先找能一次说完的数字", "Find a number that says everything"),
        lesson_body=localized(
            "数字 0 覆盖的未知格一定全暗；当数字还需要的亮格数恰好等于范围内未知格数时，它们一定全亮。左键标亮，右键标暗。",
            "Every unknown cell covered by a 0 must be dark. When a clue still needs exactly as many bright cells as remain unknown, all of them must be bright. Left-click for bright; right-click for dark.",
        ),
        completion_title=localized("第一张练习页已经读懂", "The first practice leaf is complete"),
        completion_body=localized(
            "你已经用单个数字确定了整张小图。下一页会把国界放进数字的范围里。",
            "You resolved the whole miniature from single clues. The next leaf puts a national border inside those counting areas.",
        ),
        region_names=(localized("灯房", "Lamp Hall"),),
        accents=("ochre",),
        target_rows=(
            "######",
            "######",
            "#...##",
            "....##",
            ".....#",
            "......",
        ),
        region_map_factory=_single_country_map,
    ),
    TutorialSpec(
        level_id="within-the-border",
        width=8,
        height=8,
        seed=1002,
        title=localized("序页二 · 国界以内", "Prologue II · Within the Border"),
        subtitle=localized(
            "粗线会裁掉邻国格子；每个数字只计算自己国家的一侧。",
            "A thick border clips away the neighboring country; every clue counts only its own side.",
        ),
        lesson_title=localized("先读边界，再读数字", "Read the border before the number"),
        lesson_body=localized(
            "靠近粗国界的数字仍以自己为中心，但范围只保留同色国家里的格子。边界外即使紧挨着，也绝不计数。提示会强框数字、弱框它真正覆盖的范围。",
            "A clue beside a thick border is still centered on itself, but its area keeps only cells in the same colored country. Adjacent cells across the border never count. A hint strongly outlines the clue and softly outlines its true scope.",
        ),
        completion_title=localized("边界已经变得清楚", "The border now reads clearly"),
        completion_body=localized(
            "你已经分别解开国界两侧。最后一张序页会同时出现三个国家，并开放完整的辅助工具。",
            "You solved both sides of a border independently. The final prologue leaf introduces three countries and the full set of assistance tools.",
        ),
        region_names=(localized("西岸", "West Bank"), localized("东岸", "East Bank")),
        accents=("ochre", "cobalt"),
        target_rows=(
            ".##...##",
            ".##.....",
            "........",
            "........",
            "#...##..",
            "##.#####",
            "########",
            "########",
        ),
        region_map_factory=_border_lesson_map,
    ),
    TutorialSpec(
        level_id="three-small-realms",
        width=10,
        height=10,
        seed=1003,
        title=localized("序页三 · 三国小图", "Prologue III · Three Small Realms"),
        subtitle=localized(
            "分别推进三个国家，并熟悉提示、检查与错误清理。",
            "Advance through three countries separately and learn hints, checking, and wrong-mark cleanup.",
        ),
        lesson_title=localized("把大地图拆成几个小问题", "Turn one map into several small problems"),
        lesson_body=localized(
            "每个国家都有自己的完整推理链。国家标签可暂时淡化其他区域；遇到卡点可请求一个必然步骤，误填后可检查或只清除错误标记。",
            "Each country has its own complete reasoning chain. Country tabs can mute the others; if you stall, request one certain step, and after a mistake you can check the board or remove only wrong marks.",
        ),
        completion_title=localized("序章完成", "Prologue complete"),
        completion_body=localized(
            "三张练习页都已归档。瓦罗王的第一席已经摆好，内海七国的正式版图现已开放。",
            "All three practice leaves are filed. King Varo's first course is laid, and the formal map of the Seven Kingdoms of the Inner Sea is now open.",
        ),
        region_names=(
            localized("北垣", "Northwall"),
            localized("岬路", "Cape Road"),
            localized("南泽", "Southmere"),
        ),
        accents=("verdigris", "cobalt", "vermilion"),
        target_rows=(
            "###...##..",
            "###....#..",
            "..........",
            "......####",
            "###..#####",
            "######..##",
            "...##....#",
            "...###...#",
            "..#####...",
            "########..",
        ),
        region_map_factory=_three_country_map,
    ),
)


def _target_from_rows(spec: TutorialSpec) -> list[int]:
    if len(spec.target_rows) != spec.height or any(len(row) != spec.width for row in spec.target_rows):
        raise ValueError(f"target rows do not match {spec.level_id} dimensions")
    if any(character not in ".#" for row in spec.target_rows for character in row):
        raise ValueError(f"target rows for {spec.level_id} must use only '.' and '#'")
    return [1 if character == "#" else 0 for row in spec.target_rows for character in row]


def build_tutorial_level(
    spec: TutorialSpec,
    *,
    verify_with_minizinc: bool = True,
) -> dict:
    """Build one direct-solvable tutorial and optionally prove uniqueness."""

    region_map = spec.region_map_factory()
    if len(region_map) != spec.width * spec.height:
        raise ValueError(f"region map does not match {spec.level_id} dimensions")
    region_ids = sorted(set(region_map))
    if region_ids != list(range(len(spec.region_names))):
        raise ValueError(f"region metadata does not match {spec.level_id} map")
    if len(spec.accents) != len(region_ids):
        raise ValueError(f"region accents do not match {spec.level_id} map")

    target = _target_from_rows(spec)
    full_clues = calculate_clues(spec.width, spec.height, region_map, target)
    rng = random.Random(1000)
    regions = []

    for region_id in region_ids:
        cells = _region_cells(region_map, region_id)
        clues = {cell: full_clues[cell] for cell in cells}
        target_local = tuple(target[cell] for cell in cells)
        full_result = _solve_region(spec.width, spec.height, region_map, cells, clues)
        if full_result.status != "solved" or full_result.values != target_local:
            raise ValueError(f"full clues do not directly solve {spec.level_id} region {region_id}")

        visible_clues, result = _prune_region(
            spec.width,
            spec.height,
            region_map,
            cells,
            clues,
            target,
            rng,
        )
        constraints = _region_constraints(
            spec.width,
            spec.height,
            region_map,
            cells,
            visible_clues,
        )
        unique_verified = (
            verify_unique(len(cells), constraints, target_local)
            if verify_with_minizinc
            else False
        )
        if verify_with_minizinc and not unique_verified:
            raise ValueError(f"MiniZinc found a second solution for {spec.level_id} region {region_id}")

        bright_count = sum(target[index] for index in cells)
        regions.append(
            {
                "id": region_id,
                "name": dict(spec.region_names[region_id]),
                "accent": spec.accents[region_id],
                "cells": list(cells),
                "clues": {
                    str(index): value
                    for index, value in sorted(visible_clues.items())
                },
                "metrics": {
                    "fullClueCount": len(clues),
                    "visibleClueCount": len(visible_clues),
                    "solverSteps": len(result.steps),
                    "firstForcedCells": len(result.steps),
                    "uniqueVerified": unique_verified,
                    "basicSteps": len(result.steps),
                    "advancedSteps": 0,
                    "reasoningLevel": "basic",
                    "brightCount": bright_count,
                    "darkCount": len(cells) - bright_count,
                    "clueMin": min(visible_clues.values()),
                    "clueMax": max(visible_clues.values()),
                },
            }
        )

    visible_values = [clue for region in regions for clue in region["clues"].values()]
    return {
        "schemaVersion": 2,
        "levelId": spec.level_id,
        "kind": "tutorial",
        "title": dict(spec.title),
        "subtitle": dict(spec.subtitle),
        "width": spec.width,
        "height": spec.height,
        "seed": spec.seed,
        "clueRange": [min(visible_values), max(visible_values)],
        "reasoningLevel": "basic",
        "campaign": {"chapterId": "prologue"},
        "tutorial": {
            "lessonTitle": dict(spec.lesson_title),
            "lessonBody": dict(spec.lesson_body),
            "completionTitle": dict(spec.completion_title),
            "completionBody": dict(spec.completion_body),
        },
        "regionMap": region_map,
        "regions": regions,
    }


def build_tutorial_levels(*, verify_with_minizinc: bool = True) -> tuple[dict, ...]:
    return tuple(
        build_tutorial_level(spec, verify_with_minizinc=verify_with_minizinc)
        for spec in TUTORIAL_SPECS
    )


def write_public_tutorials(
    levels: tuple[dict, ...],
    output_directory: str | Path,
) -> None:
    import json

    output = Path(output_directory)
    output.mkdir(parents=True, exist_ok=True)
    for level in levels:
        path = output / f"{level['levelId']}.json"
        path.write_text(
            json.dumps(level, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
