import unittest

from varos_table.content import COUNTRIES
from varos_table.level import build_level, build_region_map
from varos_table.motifs import build_motif_target


def declared_motifs() -> dict[int, str]:
    return {
        int(country["regionId"]): str(country["mapMotifId"])
        for country in COUNTRIES
    }


class CountryMotifTests(unittest.TestCase):
    def test_odd_country_uses_floor_half_for_bright_cells(self):
        self.assertEqual(
            build_motif_target(1, 1, [0], {0: "broken-seal"}),
            (0,),
        )

    def test_each_country_declares_a_distinct_bilingual_map_motif(self):
        expected_ids = {
            "sluice-key",
            "salt-stair",
            "quiet-beacon",
            "ninth-ferry",
            "seven-bridges",
            "broken-seal",
            "sail-less-shore",
        }

        self.assertEqual(
            {str(country["mapMotifId"]) for country in COUNTRIES},
            expected_ids,
        )
        self.assertTrue(
            all(
                set(country["mapMotif"]) == {"zh-CN", "en"}
                and all(country["mapMotif"].values())
                for country in COUNTRIES
            )
        )

    def test_changing_each_declared_motif_changes_only_that_country(self):
        width = height = 20
        region_map = build_region_map(width, height)
        motifs = declared_motifs()

        original = build_motif_target(width, height, region_map, motifs)
        for region_id in range(7):
            with self.subTest(region_id=region_id):
                changed_motifs = dict(motifs)
                changed_motifs[region_id] = motifs[(region_id + 1) % 7]
                changed = build_motif_target(
                    width,
                    height,
                    region_map,
                    changed_motifs,
                )
                changed_cells = {
                    index
                    for index, (before, after) in enumerate(
                        zip(original, changed, strict=True)
                    )
                    if before != after
                }
                self.assertTrue(changed_cells)
                self.assertTrue(
                    all(region_map[index] == region_id for index in changed_cells)
                )
                region_cells = [
                    index
                    for index, value in enumerate(region_map)
                    if value == region_id
                ]
                changed_bright = sum(changed[index] for index in region_cells)
                self.assertLessEqual(
                    abs(changed_bright - (len(region_cells) - changed_bright)),
                    1,
                )

        for region_id in range(7):
            cells = [
                index
                for index, value in enumerate(region_map)
                if value == region_id
            ]
            bright = sum(original[index] for index in cells)
            self.assertLessEqual(abs(bright - (len(cells) - bright)), 1)

    def test_campaign_generator_uses_the_declared_country_motifs(self):
        level = build_level(seed=20260828, verify_with_minizinc=False)

        self.assertEqual(
            level.target,
            build_motif_target(
                level.width,
                level.height,
                level.region_map,
                declared_motifs(),
            ),
        )

    def test_seeded_variation_preserves_each_motif_balance_for_generator_retries(self):
        width = height = 20
        region_map = build_region_map(width, height)
        motifs = declared_motifs()
        original = build_motif_target(width, height, region_map, motifs)
        for attempt in range(2, 101):
            with self.subTest(attempt=attempt):
                variation_seed = 20260828 + attempt * 1009
                varied = build_motif_target(
                    width,
                    height,
                    region_map,
                    motifs,
                    variation_seed=variation_seed,
                )
                repeated = build_motif_target(
                    width,
                    height,
                    region_map,
                    motifs,
                    variation_seed=variation_seed,
                )

                self.assertEqual(varied, repeated)
                self.assertNotEqual(original, varied)

                for region_id in range(7):
                    cells = [
                        index
                        for index, value in enumerate(region_map)
                        if value == region_id
                    ]
                    changed_count = sum(
                        original[index] != varied[index]
                        for index in cells
                    )
                    self.assertLessEqual(changed_count / len(cells), 0.25)
                    bright = sum(varied[index] for index in cells)
                    self.assertLessEqual(
                        abs(bright - (len(cells) - bright)),
                        1,
                    )


if __name__ == "__main__":
    unittest.main()
