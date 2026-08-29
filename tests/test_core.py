import shutil
import unittest
from pathlib import Path

from varos_table.level import _region_constraints, build_level, build_region_map, calculate_clues
from varos_table.minizinc_check import verify_unique
from varos_table.solver import Constraint, DirectClueSolver, NoGuessSolver


class RegionModelTests(unittest.TestCase):
    def test_neighborhood_is_clipped_to_the_same_region(self):
        region_map = [
            0, 0, 1,
            0, 1, 1,
            0, 1, 1,
        ]

        target = [0, 0, 1, 0, 0, 1, 0, 1, 0]
        clues = calculate_clues(3, 3, region_map, target)

        self.assertEqual(clues[0], 0)
        self.assertEqual(clues[4], 3)
        self.assertEqual(clues[8], 2)

    def test_chapter_one_map_has_seven_connected_irregular_countries(self):
        width = height = 20
        region_map = build_region_map(width, height)

        self.assertEqual(set(region_map), set(range(7)))
        self.assertEqual(
            [region_map.count(region_id) for region_id in range(7)],
            [69, 50, 56, 67, 70, 55, 33],
        )

        for region_id in range(7):
            cells = {index for index, value in enumerate(region_map) if value == region_id}
            visited = {next(iter(cells))}
            frontier = list(visited)
            while frontier:
                index = frontier.pop()
                x, y = index % width, index // width
                for neighbour_x, neighbour_y in (
                    (x - 1, y),
                    (x + 1, y),
                    (x, y - 1),
                    (x, y + 1),
                ):
                    if not (0 <= neighbour_x < width and 0 <= neighbour_y < height):
                        continue
                    neighbour = neighbour_y * width + neighbour_x
                    if neighbour in cells and neighbour not in visited:
                        visited.add(neighbour)
                        frontier.append(neighbour)
            self.assertEqual(visited, cells, f"region {region_id} must be connected")


class NoGuessSolverTests(unittest.TestCase):
    def test_propagates_zero_and_full_constraints_without_guessing(self):
        constraints = [
            Constraint((0, 1), 0),
            Constraint((1, 2), 1),
            Constraint((2, 3), 1),
        ]

        result = NoGuessSolver(4, constraints).solve()

        self.assertEqual(result.status, "solved")
        self.assertEqual(result.values, (0, 0, 1, 0))
        self.assertGreaterEqual(len(result.steps), 3)
        self.assertTrue(all(step.rule != "guess" for step in result.steps))

    def test_reports_stalled_when_deduction_cannot_choose_a_value(self):
        result = NoGuessSolver(2, [Constraint((0, 1), 1)]).solve()

        self.assertEqual(result.status, "stalled")
        self.assertEqual(result.values, (-1, -1))

    def test_marks_subset_difference_deduction_as_advanced(self):
        result = NoGuessSolver(
            3,
            [Constraint((0, 1), 1), Constraint((0, 1, 2), 1)],
        ).solve()

        self.assertEqual(result.values, (-1, -1, 0))
        self.assertEqual(result.steps[0].reasoning_level, "advanced")
        self.assertEqual(result.steps[0].rule, "advanced_zero")

    def test_direct_clue_solver_never_uses_subset_difference(self):
        result = DirectClueSolver(
            3,
            [Constraint((0, 1), 1), Constraint((0, 1, 2), 1)],
        ).solve()

        self.assertEqual(result.status, "stalled")
        self.assertEqual(result.values, (-1, -1, -1))
        self.assertEqual(result.steps, ())


@unittest.skipUnless(shutil.which("minizinc"), "MiniZinc is not installed")
class MiniZincVerificationTests(unittest.TestCase):
    def test_unique_solution_check_distinguishes_a_second_solution(self):
        model_path = Path(__file__).resolve().parents[1] / "models" / "region_unique.mzn"

        self.assertFalse(
            verify_unique(2, [Constraint((0, 1), 1)], (1, 0), model_path=model_path)
        )
        self.assertTrue(
            verify_unique(
                2,
                [Constraint((0,), 1), Constraint((1,), 0)],
                (1, 0),
                model_path=model_path,
            )
        )


class LevelGenerationTests(unittest.TestCase):
    def test_generated_public_level_keeps_solution_hidden_and_proves_regions_unique(self):
        level = build_level(seed=20260828, verify_with_minizinc=True)
        public_payload = level.public_dict()

        self.assertNotIn("solution", public_payload)
        self.assertEqual(public_payload["schemaVersion"], 2)
        self.assertEqual(set(public_payload["title"]), {"zh-CN", "en"})
        self.assertEqual(set(public_payload["subtitle"]), {"zh-CN", "en"})
        self.assertEqual((level.width, level.height), (20, 20))
        self.assertGreaterEqual(sum(level.target), 0.45 * len(level.target))
        self.assertLessEqual(sum(level.target), 0.55 * len(level.target))
        self.assertEqual(public_payload["clueRange"], [0, 9])
        self.assertEqual(public_payload["reasoningLevel"], "basic")
        self.assertEqual(len(public_payload["regions"]), 7)
        self.assertEqual(public_payload["campaign"]["chapterId"], "inner-sea")
        self.assertEqual(
            [beat["completedCountries"] for beat in public_payload["campaign"]["banquetTimeline"]],
            list(range(8)),
        )
        epilogue = public_payload["campaign"]["epilogue"]
        self.assertEqual(
            {
                "eyebrow",
                "title",
                "body",
                "survivingTrace",
                "archiveLabel",
                "archiveSummary",
            },
            set(epilogue),
        )
        self.assertTrue(all(set(value) == {"zh-CN", "en"} for value in epilogue.values()))
        self.assertIn("推翻", epilogue["body"]["zh-CN"])
        self.assertIn("overthrown", epilogue["body"]["en"])
        self.assertIn("地图", epilogue["survivingTrace"]["zh-CN"])
        self.assertIn("map", epilogue["survivingTrace"]["en"].lower())
        self.assertEqual(
            set(public_payload["campaign"]["chapterName"]),
            {"zh-CN", "en"},
        )
        self.assertTrue(
            all(
                set(beat["title"]) == {"zh-CN", "en"}
                and set(beat["body"]) == {"zh-CN", "en"}
                for beat in public_payload["campaign"]["banquetTimeline"]
            )
        )
        self.assertTrue(
            all(
                {
                    "countryId",
                    "mapMotifId",
                    "mapMotif",
                    "chapter",
                    "capitalOrFocusCity",
                    "geography",
                    "fallChronology",
                    "foodAndMaterialCulture",
                    "banquetInsert",
                    "fallCardTitle",
                    "fallCardBody",
                    "survivingTrace",
                    "mapRevealConcept",
                }
                <= set(region["country"])
                for region in public_payload["regions"]
            )
        )
        localized_country_fields = {
            "chapter",
            "mapMotif",
            "capitalOrFocusCity",
            "geography",
            "fallChronology",
            "foodAndMaterialCulture",
            "banquetInsert",
            "fallCardTitle",
            "fallCardBody",
            "survivingTrace",
            "mapRevealConcept",
        }
        self.assertTrue(
            all(
                set(region["name"]) == {"zh-CN", "en"}
                and all(
                    set(region["country"][field]) == {"zh-CN", "en"}
                    for field in localized_country_fields
                )
                for region in public_payload["regions"]
            )
        )
        self.assertTrue(all(region["metrics"]["uniqueVerified"] for region in public_payload["regions"]))
        self.assertTrue(all(region["metrics"]["visibleClueCount"] < region["metrics"]["fullClueCount"] for region in public_payload["regions"]))
        self.assertTrue(
            all(
                abs(region["metrics"]["brightCount"] - region["metrics"]["darkCount"]) <= 1
                and region["metrics"]["reasoningLevel"] == "basic"
                and region["metrics"]["advancedSteps"] == 0
                for region in public_payload["regions"]
            )
        )
        for region in level.regions:
            constraints = _region_constraints(
                level.width,
                level.height,
                level.region_map,
                region.cells,
                region.clues,
            )
            result = DirectClueSolver(len(region.cells), constraints).solve()
            self.assertEqual(result.status, "solved")
            self.assertEqual(result.values, tuple(level.target[cell] for cell in region.cells))
