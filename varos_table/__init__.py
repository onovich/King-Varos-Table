"""Core puzzle logic for the King Varo's Table prototype."""

from .level import build_level, build_region_map, calculate_clues
from .solver import Constraint, DirectClueSolver, NoGuessSolver

__all__ = [
    "Constraint",
    "DirectClueSolver",
    "NoGuessSolver",
    "build_level",
    "build_region_map",
    "calculate_clues",
]
