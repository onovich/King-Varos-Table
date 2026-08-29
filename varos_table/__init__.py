"""Core puzzle logic for the King Varo's Table prototype."""

from .difficulty import (
    LevelDifficulty,
    RegionDifficulty,
    analyse_region_difficulty,
    summarise_level_difficulty,
)
from .level import build_level, build_region_map, calculate_clues
from .solver import Constraint, DirectClueSolver, NoGuessSolver

__all__ = [
    "Constraint",
    "DirectClueSolver",
    "LevelDifficulty",
    "NoGuessSolver",
    "RegionDifficulty",
    "analyse_region_difficulty",
    "build_level",
    "build_region_map",
    "calculate_clues",
    "summarise_level_difficulty",
]
