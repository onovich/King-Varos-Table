import unittest
import json
import shutil
from collections import Counter
from pathlib import Path

from varos_table.level import neighbours_for_cell
from varos_table.solver import Constraint, DirectClueSolver
from varos_table.minizinc_check import verify_unique


class JourneyGeometryTests(unittest.TestCase):
    def test_new_map_is_connected_with_small_opening_country(self):
        from varos_table.journey import build_journey_map
        regions = build_journey_map()
        self.assertEqual(len(regions), 768)
        counts = Counter(regions)
        self.assertEqual(set(counts), set(range(7)))
        self.assertEqual(counts[6], 48)
        self.assertTrue(all(80 <= count <= 160 for key, count in counts.items() if key != 6))
        for region in counts:
            cells = {i for i, value in enumerate(regions) if value == region}
            seen = {min(cells)}
            pending = list(seen)
            while pending:
                cell = pending.pop()
                adjacent = [cell - 32, cell + 32]
                if cell % 32: adjacent.append(cell - 1)
                if cell % 32 < 31: adjacent.append(cell + 1)
                for other in adjacent:
                    if other in cells and other not in seen:
                        seen.add(other)
                        pending.append(other)
            self.assertEqual(seen, cells, f'Country {region} is disconnected')

    def test_shipped_map_contract_and_direct_solution(self):
        level = json.loads((Path(__file__).resolve().parents[1] / 'web/data/levels/inner-sea-journey-v1.json').read_text(encoding='utf-8'))
        self.assertEqual((level['width'], level['height']), (32, 24))
        self.assertEqual(Counter(level['regionMap']), {0:107,1:102,2:116,3:142,4:138,5:115,6:48})
        all_clues = set()
        for region in level['regions']:
            with self.subTest(country=region['id']):
                cells = region['cells']
                self.assertEqual(set(cells), {i for i,r in enumerate(level['regionMap']) if r == region['id']})
                local = {cell:i for i,cell in enumerate(cells)}
                scopes = {int(i):neighbours_for_cell(32,24,level['regionMap'],int(i)) for i in region['clues']}
                constraints = [Constraint([local[c] for c in scopes[int(i)]],v) for i,v in region['clues'].items()]
                result = DirectClueSolver(len(cells),constraints).solve()
                self.assertEqual(result.status,'solved')
                self.assertLessEqual(abs(2*sum(result.values)-len(cells)),1)
                self.assertLess(len(region['clues']),len(cells))
                all_clues.update(region['clues'].values())
                if region['id'] == level['onboarding']['regionId']:
                    self.assertIn(0,region['clues'].values())
                    self.assertTrue(any(v==len(scopes[int(i)]) for i,v in region['clues'].items()))
                    self.assertTrue(any(any(0<=c<768 and level['regionMap'][c]!=region['id'] for c in [i-1,i+1,i-32,i+32]) for i in scopes))
        self.assertEqual(all_clues,set(range(10)))
        def check_no_answer(value):
            if isinstance(value,dict):
                self.assertFalse({'solution','target','answer','values'} & value.keys())
                for child in value.values():check_no_answer(child)
            elif isinstance(value,list):
                for child in value:check_no_answer(child)
        check_no_answer(level)

    @unittest.skipUnless(shutil.which('minizinc'), 'MiniZinc required for strict shipped-data proof')
    def test_shipped_seven_countries_are_strictly_unique(self):
        level = json.loads((Path(__file__).resolve().parents[1] / 'web/data/levels/inner-sea-journey-v1.json').read_text(encoding='utf-8'))
        for region in level['regions']:
            with self.subTest(country=region['id']):
                local={cell:i for i,cell in enumerate(region['cells'])}
                constraints=[Constraint([local[c] for c in neighbours_for_cell(32,24,level['regionMap'],int(i))],v) for i,v in region['clues'].items()]
                result=DirectClueSolver(len(local),constraints).solve()
                self.assertEqual(result.status,'solved')
                self.assertTrue(verify_unique(len(local),constraints,result.values))
