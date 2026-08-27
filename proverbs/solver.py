"""Deterministic constraint propagation for Fill-a-Pix style regions."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional


UNKNOWN = -1


@dataclass(frozen=True)
class Constraint:
    """A sum constraint over binary cells."""

    cells: tuple[int, ...]
    total: int
    derived: bool

    def __init__(self, cells: Iterable[int], total: int, derived: bool = False):
        normalized = tuple(sorted(set(cells)))
        if not normalized:
            raise ValueError("a constraint must contain at least one cell")
        object.__setattr__(self, "cells", normalized)
        object.__setattr__(self, "total", int(total))
        object.__setattr__(self, "derived", bool(derived))


@dataclass(frozen=True)
class SolverStep:
    """One deterministic deduction made by :class:`NoGuessSolver`."""

    rule: str
    cells: tuple[int, ...]
    value: int
    source_cells: tuple[int, ...]
    remaining: int
    explanation: str
    reasoning_level: str = "basic"


@dataclass(frozen=True)
class SolveResult:
    status: str
    values: tuple[int, ...]
    steps: tuple[SolverStep, ...]
    contradiction: Optional[str] = None

    @property
    def reasoning_level(self) -> str:
        return "advanced" if any(step.reasoning_level == "advanced" for step in self.steps) else "basic"


class NoGuessSolver:
    """Solve only by deductions that are logically forced by sum constraints.

    The solver never selects a value for an unknown cell. It applies the two
    elementary Fill-a-Pix rules and subset-difference constraints derived from
    pairs of existing constraints. If no forced value remains, it reports
    ``stalled`` instead of branching.
    """

    def __init__(
        self,
        cell_count: int,
        constraints: Iterable[Constraint],
        *,
        allow_subset_difference: bool = True,
    ):
        if cell_count < 1:
            raise ValueError("cell_count must be positive")
        self.cell_count = cell_count
        self.constraints = tuple(constraints)
        self.allow_subset_difference = allow_subset_difference
        for constraint in self.constraints:
            if any(cell < 0 or cell >= cell_count for cell in constraint.cells):
                raise ValueError("constraint contains a cell outside the board")

    def solve(self, initial_values: Optional[Iterable[int]] = None) -> SolveResult:
        values = list(initial_values) if initial_values is not None else [UNKNOWN] * self.cell_count
        if len(values) != self.cell_count:
            raise ValueError("initial_values must match cell_count")
        if any(value not in (UNKNOWN, 0, 1) for value in values):
            raise ValueError("cell values must be -1, 0, or 1")

        constraints = list(self.constraints)
        constraint_keys = {(constraint.cells, constraint.total) for constraint in constraints}
        steps: list[SolverStep] = []

        while True:
            residuals: list[tuple[tuple[int, ...], int]] = []
            changed = False

            for constraint in constraints:
                known_sum = sum(values[cell] for cell in constraint.cells if values[cell] != UNKNOWN)
                unknown_cells = tuple(cell for cell in constraint.cells if values[cell] == UNKNOWN)
                remaining = constraint.total - known_sum

                if remaining < 0 or remaining > len(unknown_cells):
                    return SolveResult(
                        "contradiction",
                        tuple(values),
                        tuple(steps),
                        f"{constraint.cells} requires {remaining} bright cells among {len(unknown_cells)} unknowns",
                    )

                if not unknown_cells:
                    continue

                residuals.append((unknown_cells, remaining))
                if remaining == 0:
                    forced_value = 0
                    basic_rule = "zero"
                    basic_explanation = "剩余亮格数为 0，未知格全部为暗格"
                elif remaining == len(unknown_cells):
                    forced_value = 1
                    basic_rule = "full"
                    basic_explanation = "剩余亮格数等于未知格数，未知格全部为亮格"
                else:
                    continue

                reasoning_level = "advanced" if constraint.derived else "basic"
                rule = f"advanced_{basic_rule}" if reasoning_level == "advanced" else basic_rule
                explanation = (
                    f"高级推理：通过重叠线索的差集得到约束；{basic_explanation}"
                    if reasoning_level == "advanced"
                    else basic_explanation
                )

                for cell in unknown_cells:
                    if values[cell] == UNKNOWN:
                        values[cell] = forced_value
                        steps.append(
                            SolverStep(
                                rule,
                                (cell,),
                                forced_value,
                                constraint.cells,
                                remaining,
                                explanation,
                                reasoning_level,
                            )
                        )
                        changed = True
                    elif values[cell] != forced_value:
                        return SolveResult(
                            "contradiction",
                            tuple(values),
                            tuple(steps),
                            f"cell {cell} was forced to both values",
                        )

            if changed:
                continue

            if not self.allow_subset_difference:
                unknown_count = sum(value == UNKNOWN for value in values)
                if unknown_count == 0:
                    return SolveResult("solved", tuple(values), tuple(steps))
                return SolveResult("stalled", tuple(values), tuple(steps))

            # Compare residual constraints. When A is a subset of B, B - A
            # has an exactly known remainder. This is still a direct logical
            # consequence and does not involve a trial assignment.
            derived_constraint_added = False
            for left_index, (left_cells, left_remaining) in enumerate(residuals):
                left_set = set(left_cells)
                for right_cells, right_remaining in residuals[left_index + 1 :]:
                    right_set = set(right_cells)
                    if left_set < right_set:
                        difference = tuple(sorted(right_set - left_set))
                        difference_total = right_remaining - left_remaining
                    elif right_set < left_set:
                        difference = tuple(sorted(left_set - right_set))
                        difference_total = left_remaining - right_remaining
                    else:
                        continue

                    if difference_total < 0 or difference_total > len(difference):
                        return SolveResult(
                            "contradiction",
                            tuple(values),
                            tuple(steps),
                            f"derived constraint {difference} has remainder {difference_total}",
                        )
                    if difference and (difference, difference_total) not in constraint_keys:
                        constraint_keys.add((difference, difference_total))
                        constraints.append(Constraint(difference, difference_total, derived=True))
                        derived_constraint_added = True

            if derived_constraint_added:
                # Let the next pass apply zero/full rules to the new facts.
                continue

            unknown_count = sum(value == UNKNOWN for value in values)
            if unknown_count == 0:
                return SolveResult("solved", tuple(values), tuple(steps))
            return SolveResult("stalled", tuple(values), tuple(steps))


class DirectClueSolver(NoGuessSolver):
    """Apply only zero/full deductions from the published clue windows.

    This matches the player-facing hint contract: every step must be
    explainable by one visible number and its clipped, same-region scope.
    """

    def __init__(self, cell_count: int, constraints: Iterable[Constraint]):
        super().__init__(
            cell_count,
            constraints,
            allow_subset_difference=False,
        )
