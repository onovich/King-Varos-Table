"""MiniZinc-backed mathematical uniqueness checks."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Iterable

from .solver import Constraint


class MiniZincUnavailable(RuntimeError):
    """Raised when the MiniZinc executable or model cannot be found."""


class MiniZincVerificationError(RuntimeError):
    """Raised when MiniZinc cannot prove either uniqueness or non-uniqueness."""


def _dzn_array(values: Iterable[int]) -> str:
    return "[" + ", ".join(str(int(value)) for value in values) + "]"


def verify_unique(
    cell_count: int,
    constraints: Iterable[Constraint],
    target: Iterable[int],
    *,
    model_path: str | Path | None = None,
    timeout_ms: int = 10_000,
) -> bool:
    """Return whether ``target`` is the only solution to ``constraints``.

    The model blocks the known target and asks MiniZinc whether any other
    satisfying assignment exists. ``False`` means a second solution was found;
    timeouts and unknown solver states raise instead of being mistaken for a
    proof of uniqueness.
    """

    if cell_count < 1:
        raise ValueError("cell_count must be positive")
    if timeout_ms < 1:
        raise ValueError("timeout_ms must be positive")
    executable = shutil.which("minizinc")
    if executable is None:
        raise MiniZincUnavailable("MiniZinc executable was not found on PATH")

    model = Path(model_path) if model_path is not None else Path(__file__).resolve().parents[1] / "models" / "region_unique.mzn"
    if not model.is_file():
        raise MiniZincUnavailable(f"MiniZinc model was not found: {model}")

    normalized_constraints = tuple(constraints)
    target_values = tuple(int(value) for value in target)
    if len(target_values) != cell_count:
        raise ValueError("target must match cell_count")
    if any(value not in (0, 1) for value in target_values):
        raise ValueError("target values must be binary")
    if not normalized_constraints:
        return False

    incidence = []
    totals = []
    for constraint in normalized_constraints:
        if any(cell < 0 or cell >= cell_count for cell in constraint.cells):
            raise ValueError("constraint contains a cell outside the board")
        if sum(target_values[cell] for cell in constraint.cells) != constraint.total:
            raise ValueError("target does not satisfy every supplied constraint")
        row = [0] * cell_count
        for cell in constraint.cells:
            row[cell] = 1
        incidence.extend(row)
        totals.append(constraint.total)

    dzn = "\n".join(
        [
            f"CELL_COUNT = {cell_count};",
            f"CLUE_COUNT = {len(normalized_constraints)};",
            f"clue_total = {_dzn_array(totals)};",
            f"incidence = array2d(1..{len(normalized_constraints)}, 1..{cell_count}, {_dzn_array(incidence)});",
            f"target = {_dzn_array(target_values)};",
            "block_target = true;",
        ]
    )

    with tempfile.TemporaryDirectory(prefix="varos-table-mzn-") as temp_dir:
        data_file = Path(temp_dir) / "instance.dzn"
        data_file.write_text(dzn, encoding="utf-8")
        completed = subprocess.run(
            [
                executable,
                "--solver",
                "Gecode",
                "--time-limit",
                str(timeout_ms),
                str(model),
                str(data_file),
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    output = f"{completed.stdout}\n{completed.stderr}"
    if "=====UNSATISFIABLE=====\n" in output or "=====UNSATISFIABLE=====" in output:
        return True
    if "=====UNKNOWN=====\n" in output or "=====UNKNOWN=====" in output:
        raise MiniZincVerificationError("MiniZinc returned UNKNOWN before proving uniqueness")
    if completed.returncode != 0:
        raise MiniZincVerificationError(output.strip() or "MiniZinc exited with an error")
    if "----------" in output or "x =" in output:
        return False
    raise MiniZincVerificationError(f"Could not classify MiniZinc output: {output.strip()}")
