"""Generate the new continuous map without rewriting any legacy level."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from varos_table.journey import build_journey_map
from varos_table.journey_content import enrich_journey
from varos_table.level import build_level


def main():
    level = build_level(width=32, height=24, seed=20260907,
                        region_map=build_journey_map(), teaching_region_id=6)
    payload = enrich_journey(level.public_dict())
    destination = ROOT / "web/data/levels/inner-sea-journey-v1.json"
    destination.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {destination.name}; attempt {level.attempt}; 768 cells, 7 MiniZinc-verified countries")


if __name__ == '__main__':
    main()
