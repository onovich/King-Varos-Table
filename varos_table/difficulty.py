"""Difficulty analysis for deterministic puzzle-solver traces."""

from __future__ import annotations

from dataclasses import dataclass

from .solver import SolveResult, SolverStep


@dataclass(frozen=True)
class RegionDifficulty:
    """Player-facing effort metrics for one independently solved region."""

    status: str
    cell_count: int
    visible_clue_count: int
    clue_density: float
    assignment_steps: int
    basic_assignment_steps: int
    advanced_assignment_steps: int
    deduction_steps: int
    first_forced_cells: int
    smallest_forced_cells: int
    largest_forced_cells: int
    average_forced_cells: float
    single_cell_deductions: int
    basic_deductions: int
    advanced_deductions: int
    reasoning_level: str

    def public_metrics_dict(self) -> dict[str, object]:
        return {
            "solverSteps": self.assignment_steps,
            "firstForcedCells": self.first_forced_cells,
            "basicSteps": self.basic_assignment_steps,
            "advancedSteps": self.advanced_assignment_steps,
            "reasoningLevel": self.reasoning_level,
            "deductionSteps": self.deduction_steps,
            "basicDeductions": self.basic_deductions,
            "advancedDeductions": self.advanced_deductions,
            "smallestForcedCells": self.smallest_forced_cells,
            "largestForcedCells": self.largest_forced_cells,
            "averageForcedCells": round(self.average_forced_cells, 2),
            "singleCellDeductions": self.single_cell_deductions,
            "clueDensity": round(self.clue_density, 4),
        }


@dataclass(frozen=True)
class LevelDifficulty:
    """Aggregate reasoning tier and workload for one board."""

    label: str
    reasoning_level: str
    effort: str
    region_count: int
    cell_count: int
    visible_clue_count: int
    clue_density: float
    assignment_steps: int
    deduction_steps: int
    max_region_deduction_steps: int
    average_forced_cells: float
    single_cell_deductions: int
    advanced_deductions: int

    def public_dict(self) -> dict[str, object]:
        return {
            "label": self.label,
            "reasoningLevel": self.reasoning_level,
            "effort": self.effort,
            "regionCount": self.region_count,
            "cellCount": self.cell_count,
            "visibleClueCount": self.visible_clue_count,
            "clueDensity": round(self.clue_density, 4),
            "assignmentSteps": self.assignment_steps,
            "deductionSteps": self.deduction_steps,
            "maxRegionDeductionSteps": self.max_region_deduction_steps,
            "averageForcedCells": round(self.average_forced_cells, 2),
            "singleCellDeductions": self.single_cell_deductions,
            "advancedDeductions": self.advanced_deductions,
        }


def _deduction_key(step: SolverStep) -> tuple[object, ...]:
    return (
        step.rule,
        step.source_cells,
        step.remaining,
        step.value,
        step.reasoning_level,
    )


def _deduction_groups(steps: tuple[SolverStep, ...]) -> tuple[tuple[SolverStep, ...], ...]:
    groups: list[list[SolverStep]] = []
    for step in steps:
        if groups and _deduction_key(groups[-1][0]) == _deduction_key(step):
            groups[-1].append(step)
        else:
            groups.append([step])
    return tuple(tuple(group) for group in groups)


def analyse_region_difficulty(
    *,
    cell_count: int,
    visible_clue_count: int,
    result: SolveResult,
) -> RegionDifficulty:
    """Summarize a solver trace in the same batches a player can act on."""

    if cell_count < 1:
        raise ValueError("cell_count must be positive")
    if not 0 <= visible_clue_count <= cell_count:
        raise ValueError("visible_clue_count must be within the region")
    if len(result.values) != cell_count:
        raise ValueError("solver result must cover the region")

    groups = _deduction_groups(result.steps)
    group_sizes = tuple(len(group) for group in groups)
    basic_deductions = sum(group[0].reasoning_level == "basic" for group in groups)
    advanced_deductions = sum(group[0].reasoning_level == "advanced" for group in groups)
    assignment_steps = len(result.steps)
    basic_assignment_steps = sum(step.reasoning_level == "basic" for step in result.steps)
    advanced_assignment_steps = sum(step.reasoning_level == "advanced" for step in result.steps)
    deduction_steps = len(groups)

    return RegionDifficulty(
        status=result.status,
        cell_count=cell_count,
        visible_clue_count=visible_clue_count,
        clue_density=visible_clue_count / cell_count,
        assignment_steps=assignment_steps,
        basic_assignment_steps=basic_assignment_steps,
        advanced_assignment_steps=advanced_assignment_steps,
        deduction_steps=deduction_steps,
        first_forced_cells=group_sizes[0] if group_sizes else 0,
        smallest_forced_cells=min(group_sizes, default=0),
        largest_forced_cells=max(group_sizes, default=0),
        average_forced_cells=(assignment_steps / deduction_steps) if deduction_steps else 0.0,
        single_cell_deductions=sum(size == 1 for size in group_sizes),
        basic_deductions=basic_deductions,
        advanced_deductions=advanced_deductions,
        reasoning_level="advanced" if advanced_deductions else "basic",
    )


def summarise_level_difficulty(
    *,
    kind: str,
    regions: tuple[RegionDifficulty, ...],
) -> LevelDifficulty:
    """Combine independent region traces into a catalog-ready profile."""

    if not regions:
        raise ValueError("a level needs at least one region difficulty profile")
    if any(region.status != "solved" for region in regions):
        raise ValueError("difficulty can only be assigned to solved regions")

    cell_count = sum(region.cell_count for region in regions)
    visible_clue_count = sum(region.visible_clue_count for region in regions)
    assignment_steps = sum(region.assignment_steps for region in regions)
    deduction_steps = sum(region.deduction_steps for region in regions)
    advanced_deductions = sum(region.advanced_deductions for region in regions)
    reasoning_level = "advanced" if advanced_deductions else "basic"
    if reasoning_level == "advanced":
        label = "advanced"
    elif kind == "tutorial":
        label = "tutorial"
    else:
        label = "standard"

    if deduction_steps <= 15:
        effort = "short"
    elif deduction_steps <= 40:
        effort = "medium"
    else:
        effort = "long"

    return LevelDifficulty(
        label=label,
        reasoning_level=reasoning_level,
        effort=effort,
        region_count=len(regions),
        cell_count=cell_count,
        visible_clue_count=visible_clue_count,
        clue_density=visible_clue_count / cell_count,
        assignment_steps=assignment_steps,
        deduction_steps=deduction_steps,
        max_region_deduction_steps=max(region.deduction_steps for region in regions),
        average_forced_cells=(assignment_steps / deduction_steps) if deduction_steps else 0.0,
        single_cell_deductions=sum(region.single_cell_deductions for region in regions),
        advanced_deductions=advanced_deductions,
    )
