"""Authored country motifs for chapter-one solution art."""

from __future__ import annotations

import math
import random
from collections.abc import Callable, Iterable, Mapping


MotifScore = Callable[[float, float], float]


def _segment_distance(
    x: float,
    y: float,
    start_x: float,
    start_y: float,
    end_x: float,
    end_y: float,
) -> float:
    delta_x = end_x - start_x
    delta_y = end_y - start_y
    length_squared = delta_x * delta_x + delta_y * delta_y
    if length_squared == 0:
        return math.hypot(x - start_x, y - start_y)
    amount = max(
        0.0,
        min(
            1.0,
            ((x - start_x) * delta_x + (y - start_y) * delta_y)
            / length_squared,
        ),
    )
    return math.hypot(
        x - (start_x + amount * delta_x),
        y - (start_y + amount * delta_y),
    )


def _sluice_key(x: float, y: float) -> float:
    waterways = (
        (0.48, 0.0, 0.42, 0.42),
        (0.42, 0.42, 0.52, 1.0),
        (0.42, 0.42, 0.08, 0.15),
        (0.45, 0.58, 0.9, 0.38),
    )
    waterway_distance = min(
        _segment_distance(x, y, *waterway) for waterway in waterways
    )
    key_ring_distance = abs(math.hypot(x - 0.72, y - 0.76) - 0.17) * 0.85
    return -min(waterway_distance, key_ring_distance)


def _salt_stair(x: float, y: float) -> float:
    stair = (
        (0.05, 0.9),
        (0.3, 0.9),
        (0.3, 0.68),
        (0.52, 0.68),
        (0.52, 0.46),
        (0.74, 0.46),
        (0.74, 0.24),
        (0.93, 0.24),
    )
    stair_distance = min(
        _segment_distance(x, y, *stair[index], *stair[index + 1])
        for index in range(len(stair) - 1)
    )
    empty_flagstaff_distance = _segment_distance(x, y, 0.78, 0.08, 0.78, 0.48)
    return -min(stair_distance, empty_flagstaff_distance)


def _quiet_beacon(x: float, y: float) -> float:
    tower_distance = max(abs(x - 0.48) / 0.13, abs(y - 0.62) / 0.3) * 0.12
    base_distance = _segment_distance(x, y, 0.28, 0.92, 0.7, 0.92)
    upper_beam_distance = _segment_distance(x, y, 0.48, 0.32, 0.98, 0.05) * 0.8
    lower_beam_distance = _segment_distance(x, y, 0.48, 0.32, 0.98, 0.48) * 0.8
    lantern_distance = math.hypot(x - 0.48, y - 0.27)
    return -min(
        tower_distance,
        base_distance,
        upper_beam_distance,
        lower_beam_distance,
        lantern_distance,
    )


def _ninth_ferry(x: float, y: float) -> float:
    river_distance = abs(x - (0.42 + 0.08 * math.sin(y * math.pi * 2)))
    ferry_wake_distance = min(
        abs(y - ripple) + abs(x - 0.7) * 0.25
        for ripple in (0.18, 0.42, 0.66, 0.88)
    )
    return -min(river_distance, ferry_wake_distance)


def _seven_bridges(x: float, y: float) -> float:
    deck = 0.5 - y
    pillar = max(
        0.0,
        1.0 - min(abs(x - center) for center in (0.18, 0.5, 0.82)) / 0.1,
    )
    return deck + (0.38 * pillar if y > 0.35 else 0.0)


def _broken_seal(x: float, y: float) -> float:
    seal = 1.0 - math.hypot((x - 0.47) / 0.44, (y - 0.53) / 0.4)
    in_missing_corner = (
        x > 0.64
        and y < 0.38
        and abs((x - 0.64) + (y - 0.38)) < 0.25
    )
    return seal - (1.5 if in_missing_corner else 0.0)


def _sail_less_shore(x: float, y: float) -> float:
    coast_distance = abs(x - (0.5 + 0.22 * math.sin(y * math.pi * 2.2)))
    tide_distance = (
        min(abs(y - tide) for tide in (0.2, 0.52, 0.82))
        + 0.12 * abs(x - 0.2)
    )
    return -min(coast_distance, tide_distance)


_MOTIF_SCORES: Mapping[str, MotifScore] = {
    "sluice-key": _sluice_key,
    "salt-stair": _salt_stair,
    "quiet-beacon": _quiet_beacon,
    "ninth-ferry": _ninth_ferry,
    "seven-bridges": _seven_bridges,
    "broken-seal": _broken_seal,
    "sail-less-shore": _sail_less_shore,
}


def build_motif_target(
    width: int,
    height: int,
    region_map: Iterable[int],
    motif_by_region: Mapping[int, str],
    *,
    variation_seed: int | None = None,
) -> tuple[int, ...]:
    """Render one balanced binary target from declared country motifs.

    Each motif is drawn in coordinates normalized to its country's bounding
    box. Ranking cells by their motif score preserves the authored silhouette
    while selecting the floor-half of each country as bright cells, so its
    light and dark counts differ by at most one. ``variation_seed`` adds a
    small deterministic perturbation for generator retries without replacing
    the motif field with random texture.
    """

    regions = tuple(int(region_id) for region_id in region_map)
    if len(regions) != width * height:
        raise ValueError("region_map must cover the whole board")
    region_ids = set(regions)
    if set(motif_by_region) != region_ids:
        raise ValueError("every region must declare exactly one map motif")

    target = [0] * len(regions)
    for region_id in sorted(region_ids):
        motif_id = motif_by_region[region_id]
        try:
            score = _MOTIF_SCORES[motif_id]
        except KeyError as error:
            raise ValueError(f"unknown map motif: {motif_id}") from error

        cells = [index for index, value in enumerate(regions) if value == region_id]
        x_values = [index % width for index in cells]
        y_values = [index // width for index in cells]
        min_x, max_x = min(x_values), max(x_values)
        min_y, max_y = min(y_values), max(y_values)
        x_span = max(1, max_x - min_x)
        y_span = max(1, max_y - min_y)
        variation = (
            random.Random(variation_seed + region_id * 104729)
            if variation_seed is not None
            else None
        )
        offset_x = variation.uniform(-0.02, 0.02) if variation else 0.0
        offset_y = variation.uniform(-0.02, 0.02) if variation else 0.0
        shear = variation.uniform(-0.007, 0.007) if variation else 0.0

        def ranked_score(index: int) -> tuple[float, int, int]:
            normalized_x = ((index % width) - min_x) / x_span
            normalized_y = ((index // width) - min_y) / y_span
            varied_x = max(
                0.0,
                min(1.0, normalized_x + offset_x + shear * (normalized_y - 0.5)),
            )
            varied_y = max(
                0.0,
                min(1.0, normalized_y + offset_y - shear * (normalized_x - 0.5)),
            )
            return score(varied_x, varied_y), -index, index

        ranked = sorted(ranked_score(index) for index in cells)
        bright_count = len(cells) // 2
        brightest_cells = ranked[-bright_count:] if bright_count else ()
        for _, _, index in brightest_cells:
            target[index] = 1

    return tuple(target)
