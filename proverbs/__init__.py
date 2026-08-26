"""Core logic for the LearnProverbs prototype."""

from .level import build_level, build_region_map, calculate_clues
from .solver import Constraint, NoGuessSolver

__all__ = [
    "Constraint",
    "NoGuessSolver",
    "build_level",
    "build_region_map",
    "calculate_clues",
]
