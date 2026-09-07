"""Fixed-size continuous campaign. Legacy campaign generation stays unchanged."""

from .level import build_region_map

WIDTH, HEIGHT = 32, 24


def _adjacent(index: int) -> list[int]:
    x, y = index % WIDTH, index // WIDTH
    return [ny * WIDTH + nx for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1))
            if 0 <= nx < WIDTH and 0 <= ny < HEIGHT]


def _connected(cells: set[int]) -> bool:
    if not cells:
        return False
    seen = {min(cells)}
    pending = list(seen)
    while pending:
        for other in _adjacent(pending.pop()):
            if other in cells and other not in seen:
                seen.add(other)
                pending.append(other)
    return len(seen) == len(cells)


def build_journey_map() -> list[int]:
    """Keep the seven geographic neighbors; trim Pel to a 48-cell opening."""
    regions = build_region_map(WIDTH, HEIGHT)
    pel = {i for i, region in enumerate(regions) if region == 6}
    cx = sum(i % WIDTH for i in pel) / len(pel)
    cy = sum(i // WIDTH for i in pel) / len(pel)
    while len(pel) > 48:
        candidates = sorted(pel, key=lambda i: (-((i % WIDTH-cx)**2 + (i // WIDTH-cy)**2), i))
        for cell in candidates:
            neighbors = [regions[n] for n in _adjacent(cell) if regions[n] != 6]
            if not neighbors or not _connected(pel - {cell}):
                continue
            recipient = min(set(neighbors), key=lambda r: (-neighbors.count(r), r))
            regions[cell] = recipient
            pel.remove(cell)
            break
        else:
            raise ValueError('Cannot trim opening country without disconnecting it')
    return regions
