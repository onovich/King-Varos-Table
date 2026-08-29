import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from varos_table import analyse_region_difficulty, summarise_level_difficulty
from varos_table.level import build_level
from varos_table.solver import Constraint, DirectClueSolver, NoGuessSolver
from tools.generate_campaign import build_manifest
from varos_table.tutorials import (
    TUTORIAL_SPECS,
    build_tutorial_level,
    build_tutorial_levels,
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class RegionDifficultyTests(unittest.TestCase):
    def test_counts_player_visible_deductions_instead_of_cell_assignments(self):
        result = DirectClueSolver(
            4,
            [
                Constraint((0, 1), 0),
                Constraint((1, 2), 1),
                Constraint((2, 3), 1),
            ],
        ).solve()

        profile = analyse_region_difficulty(
            cell_count=4,
            visible_clue_count=3,
            result=result,
        )

        self.assertEqual(profile.status, "solved")
        self.assertEqual(profile.assignment_steps, 4)
        self.assertEqual(profile.deduction_steps, 3)
        self.assertEqual(profile.first_forced_cells, 2)
        self.assertEqual(profile.smallest_forced_cells, 1)
        self.assertEqual(profile.largest_forced_cells, 2)
        self.assertAlmostEqual(profile.average_forced_cells, 4 / 3)
        self.assertEqual(profile.single_cell_deductions, 2)
        self.assertEqual(profile.basic_deductions, 3)
        self.assertEqual(profile.advanced_deductions, 0)
        self.assertEqual(profile.reasoning_level, "basic")
        self.assertEqual(profile.clue_density, 0.75)

    def test_marks_subset_difference_batches_as_advanced_reasoning(self):
        constraints = [
            Constraint((0, 1), 1),
            Constraint((1, 2), 1),
            Constraint((0, 1, 2), 1),
        ]
        self.assertEqual(DirectClueSolver(3, constraints).solve().status, "stalled")
        result = NoGuessSolver(3, constraints).solve()

        profile = analyse_region_difficulty(
            cell_count=3,
            visible_clue_count=3,
            result=result,
        )

        self.assertEqual(profile.status, "solved")
        self.assertEqual(profile.deduction_steps, 3)
        self.assertEqual(profile.basic_deductions, 1)
        self.assertEqual(profile.advanced_deductions, 2)
        self.assertEqual(profile.reasoning_level, "advanced")

        level = summarise_level_difficulty(kind="campaign", regions=(profile,))
        self.assertEqual(level.label, "advanced")
        self.assertEqual(level.reasoning_level, "advanced")
        self.assertEqual(level.effort, "short")
        self.assertEqual(level.max_region_deduction_steps, 3)

        mislabeled_tutorial = summarise_level_difficulty(
            kind="tutorial",
            regions=(profile,),
        )
        self.assertEqual(mislabeled_tutorial.label, "advanced")


class GeneratedDifficultyTests(unittest.TestCase):
    def test_tutorial_level_publishes_its_computed_difficulty_profile(self):
        level = build_tutorial_level(
            TUTORIAL_SPECS[0],
            verify_with_minizinc=False,
        )

        self.assertEqual(
            level["difficulty"],
            {
                "label": "tutorial",
                "reasoningLevel": "basic",
                "effort": "short",
                "regionCount": 1,
                "cellCount": 36,
                "visibleClueCount": 13,
                "clueDensity": 0.3611,
                "assignmentSteps": 36,
                "deductionSteps": 10,
                "maxRegionDeductionSteps": 10,
                "averageForcedCells": 3.6,
                "singleCellDeductions": 3,
                "advancedDeductions": 0,
            },
        )
        self.assertEqual(level["regions"][0]["metrics"]["firstForcedCells"], 4)
        self.assertEqual(level["regions"][0]["metrics"]["deductionSteps"], 10)

    def test_campaign_level_is_graded_from_all_region_traces(self):
        level = build_level(seed=20260828, verify_with_minizinc=False)
        profile = level.public_dict()["difficulty"]

        self.assertEqual(profile["label"], "standard")
        self.assertEqual(profile["reasoningLevel"], "basic")
        self.assertEqual(profile["effort"], "long")
        self.assertEqual(profile["cellCount"], 400)
        self.assertEqual(profile["visibleClueCount"], 137)
        self.assertEqual(profile["deductionSteps"], 119)
        self.assertEqual(profile["maxRegionDeductionSteps"], 21)
        self.assertEqual(profile["advancedDeductions"], 0)

    def test_manifest_copies_generated_labels_instead_of_hardcoding_them(self):
        tutorials = build_tutorial_levels(verify_with_minizinc=False)
        campaign = build_level(
            seed=20260828,
            verify_with_minizinc=False,
        ).public_dict()

        manifest = build_manifest(tutorials, campaign)
        entries = [
            entry
            for chapter in manifest["chapters"]
            for entry in chapter["levels"]
        ]

        self.assertEqual(
            [entry["difficulty"] for entry in entries],
            [level["difficulty"]["label"] for level in (*tutorials, campaign)],
        )


class DifficultyReportTests(unittest.TestCase):
    def run_report(self, manifest: Path | None = None) -> subprocess.CompletedProcess[str]:
        command = [
            sys.executable,
            "tools/report_difficulty.py",
            "--format",
            "json",
        ]
        if manifest is not None:
            command.extend(("--manifest", str(manifest)))
        return subprocess.run(
            command,
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_report_exposes_catalog_and_region_quality_metrics(self):
        result = self.run_report()

        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)
        report = json.loads(result.stdout)
        self.assertEqual(
            [level["id"] for level in report["levels"]],
            ["first-light", "within-the-border", "three-small-realms", "inner-sea"],
        )
        self.assertEqual(
            [level["label"] for level in report["levels"]],
            ["tutorial", "tutorial", "tutorial", "standard"],
        )
        inner_sea = report["levels"][-1]
        self.assertEqual(inner_sea["deductionSteps"], 119)
        self.assertEqual(inner_sea["advancedDeductions"], 0)
        self.assertEqual(len(inner_sea["regions"]), 7)

    def test_report_rejects_catalog_profile_and_file_set_drift(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            data = root / "web" / "data"
            shutil.copytree(PROJECT_ROOT / "web" / "data", data)
            manifest_path = data / "campaign.json"
            original_manifest = manifest_path.read_text(encoding="utf-8")

            manifest = json.loads(original_manifest)
            manifest["chapters"][1]["levels"][0]["difficulty"] = "advanced"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            catalog_drift = self.run_report(manifest_path)
            self.assertNotEqual(catalog_drift.returncode, 0)
            self.assertIn("catalog difficulty", catalog_drift.stderr)

            manifest_path.write_text(original_manifest, encoding="utf-8")
            level_path = data / "levels" / "first-light.json"
            original_level = level_path.read_text(encoding="utf-8")
            level = json.loads(original_level)
            level["difficulty"]["deductionSteps"] += 1
            level_path.write_text(json.dumps(level), encoding="utf-8")
            profile_drift = self.run_report(manifest_path)
            self.assertNotEqual(profile_drift.returncode, 0)
            self.assertIn("generated profile is stale", profile_drift.stderr)

            level_path.write_text(original_level, encoding="utf-8")
            shutil.copy2(level_path, data / "levels" / "orphan.json")
            file_set_drift = self.run_report(manifest_path)
            self.assertNotEqual(file_set_drift.returncode, 0)
            self.assertIn("not listed", file_set_drift.stderr)


if __name__ == "__main__":
    unittest.main()
