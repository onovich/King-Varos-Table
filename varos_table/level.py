"""Level data, region masks, and deterministic generation for the prototype."""

from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping

from .minizinc_check import verify_unique
from .solver import Constraint, DirectClueSolver, SolveResult


COUNTRIES = (
    {
        "regionId": 0,
        "countryId": "loven-lowlands",
        "countryNameZh": "洛汶低地",
        "countryNameEn": "Loven Lowlands",
        "accent": "ochre",
        "chapter": "内海七国",
        "capitalOrFocusCity": "榆堤城",
        "geography": "低地河网与季节性湿原",
        "foodAndMaterialCulture": "榆烟熏鱼、酸草、河闸铜器与芦苇编席。",
        "banquetInsert": "第一只银盘盛着榆烟熏过的白鱼，鱼腹填了酸草与粗盐。侍者说，低地人用同样的烟保存冬粮。",
        "fallCardTitle": "河闸闭合之前",
        "fallCardBody": "洛汶议会原以为拆去东堤就能拖慢帝国骑兵，却先让三座村镇失去了归路。榆堤城在第六日开门，守闸人把铜钥匙沉进河心，没有参加受降仪式。",
        "survivingTrace": "后世修闸时捞出一枚没有齿纹的铜钥匙，现藏于榆堤档案室。",
        "mapRevealConcept": "河网与闸门从褪色底图中显现，沉入河心的铜钥匙留作完成印记。",
    },
    {
        "regionId": 1,
        "countryId": "aspa",
        "countryNameZh": "阿斯帕",
        "countryNameEn": "Aspa",
        "accent": "cobalt",
        "chapter": "内海七国",
        "capitalOrFocusCity": "白阶城",
        "geography": "北部石坡与盐路驿站",
        "foodAndMaterialCulture": "茴香热乳酪、白陶碗、盐路商队与石阶驿站。",
        "banquetInsert": "白陶碗里是加了茴香的热乳酪。送菜人把碗沿擦了三遍，因为阿斯帕商队认为溢出的乳脂会招来坏天气。",
        "fallCardTitle": "白阶上的空旗",
        "fallCardBody": "阿斯帕的执政官把军旗留在城墙上，带着卫队从盐路撤往北坡。帝国军抵达时只找到开着的仓库与一份逐户抄写的欠粮名册；留下的人用那份名册证明征粮早已超过约定。",
        "survivingTrace": "白阶城至今仍把空旗日记作一年中不开市的上午。",
        "mapRevealConcept": "盐路沿白色石阶延伸，城墙上只留下没有旗面的旗杆。",
    },
    {
        "regionId": 2,
        "countryId": "cape-galan",
        "countryNameZh": "迦蓝岬",
        "countryNameEn": "Cape Galan",
        "accent": "slate",
        "chapter": "内海七国",
        "capitalOrFocusCity": "风井港",
        "geography": "多风海岬与深水锚地",
        "foodAndMaterialCulture": "黑壳贝、海藻酒、铜制贝盆与领港灯塔。",
        "banquetInsert": "第三道菜是风井港的黑壳贝，配一小杯极干的海藻酒。贝壳被整齐收进铜盆，像是还有别的用途。",
        "fallCardTitle": "港钟没有敲响",
        "fallCardBody": "迦蓝岬依靠海雾掩护船队多年。最后一夜，领港人故意熄掉外湾灯塔，让本国商船先离港；帝国舰队直到天亮才发现港内只剩拆去桅杆的旧船。",
        "survivingTrace": "外湾灯塔重建后仍保留一段不点灯的石阶，领港人称它为静夜。",
        "mapRevealConcept": "海岬、雾带与空锚地恢复轮廓，灯塔保留一段永不着色的石阶。",
    },
    {
        "regionId": 3,
        "countryId": "turan-valley",
        "countryNameZh": "图兰河谷",
        "countryNameEn": "Turan Valley",
        "accent": "verdigris",
        "chapter": "内海七国",
        "capitalOrFocusCity": "磨坊渡",
        "geography": "河谷麦田与两岸水磨",
        "foodAndMaterialCulture": "砂壳麦面包、水磨石、木渡船与沿岸木工。",
        "banquetInsert": "面包在入席前才切开，麦香很重，外壳却混有细碎的河砂。宫廷厨师把这解释成磨坊石太旧。",
        "fallCardTitle": "渡口的第九条船",
        "fallCardBody": "图兰河谷答应交出八条渡船，暗中留下第九条接送逃离磨坊渡的人。告密者领帝国军来到河边时，船已被拆成门板、车轴和三十多把木铲，分散在沿岸村落。",
        "survivingTrace": "河谷婚礼仍会赠送一把没有上漆的小木铲，据说木料来自那条船。",
        "mapRevealConcept": "九条渡船的航线重回河面，其中一条在村落间分解为细小木纹。",
    },
    {
        "regionId": 4,
        "countryId": "melosa",
        "countryNameZh": "梅罗萨",
        "countryNameEn": "Melosa",
        "accent": "vermilion",
        "chapter": "内海七国",
        "capitalOrFocusCity": "七拱城",
        "geography": "内海丘原与石桥商道",
        "foodAndMaterialCulture": "七桥香草、烤禽、石拱商道与桥市行会。",
        "banquetInsert": "烤禽下垫着七种香草，每一种来自不同桥市。记录官只写下了六种，剩下一种无人肯说出名字。",
        "fallCardTitle": "第七座桥",
        "fallCardBody": "梅罗萨在六座桥上布防，却把最旧的第七桥留给逃难者。守军投降后，帝国史官把那座桥从军图中抹去，因为它证明围城并不完整，也证明有人在封锁中离开。",
        "survivingTrace": "后世地图恢复了第七桥的位置，但桥名一栏至今空白。",
        "mapRevealConcept": "七道桥拱依次显影，最旧的一座仍不显示名称。",
    },
    {
        "regionId": 5,
        "countryId": "urshan",
        "countryNameZh": "乌尔珊",
        "countryNameEn": "Urshan",
        "accent": "mauve",
        "chapter": "内海七国",
        "capitalOrFocusCity": "紫盐堡",
        "geography": "盐沼、高堤与染料作坊",
        "foodAndMaterialCulture": "紫盐炖梨、盐罐、染缸与高堤作坊。",
        "banquetInsert": "紫盐被撒在炖梨上，颜色比味道更醒目。瓦罗王命人把盐罐留在桌边，随后却没有再碰它。",
        "fallCardTitle": "染缸里的印玺",
        "fallCardBody": "乌尔珊宫廷在政变中更换了三次城门口令。最后一位守将把旧王印投入染缸，向帝国使者声称国家已经没有可以签署降书的人。围城仍继续了十二日。",
        "survivingTrace": "紫盐堡出土的王印被染料蚀去一角，无法确认最后使用它的是哪一位君主。",
        "mapRevealConcept": "盐沼和高堤转为暗紫色，缺角王印作为档案页的压印。",
    },
    {
        "regionId": 6,
        "countryId": "pel-island",
        "countryNameZh": "佩尔岛",
        "countryNameEn": "Pel Island",
        "accent": "clay",
        "chapter": "内海七国",
        "capitalOrFocusCity": "砾湾",
        "geography": "东部小岛、砾滩与浅湾",
        "foodAndMaterialCulture": "浅金小蟹、渔叉、船帆与海蚀洞储粮。",
        "banquetInsert": "一盘温热的砾湾小蟹被放在桌角，数量不多，壳上带着浅金色斑点。最年轻的侍者说，岛上孩子会在退潮时徒手捉它们。",
        "fallCardTitle": "小岛先被记住",
        "fallCardBody": "佩尔岛没有城墙。岛民把粮食和船帆藏进海蚀洞，随后在砾湾列队交出渔叉。帝国记录把这写成一次迅速而体面的归顺，却没有记下当年冬天所有船只都被征走。",
        "survivingTrace": "岛上的旧历法把那一年称作无帆之冬，而不是瓦罗王纪年的第一年。",
        "mapRevealConcept": "小岛海岸完整显现，但近岸不再绘出任何船帆。",
    },
)

BANQUET_TIMELINE = (
    {
        "completedCountries": 0,
        "title": "宾客入席",
        "body": "长桌已经铺好，盘盏仍空。记录官先写下座次，再写窗外送进宫门的七种口音。",
    },
    {
        "completedCountries": 1,
        "title": "第一道菜",
        "body": "第一只银盘落在瓦罗王面前。侍者报出产地时，地图上的一个国名刚刚恢复完整。",
    },
    {
        "completedCountries": 2,
        "title": "第二轮斟酒",
        "body": "酒杯重新斟满，席间开始谈论道路、港口和今年的收成，仿佛这些地方都只是货单上的来源。",
    },
    {
        "completedCountries": 3,
        "title": "食欲渐盛",
        "body": "撤下的盘子越来越多，新的器皿仍不断送来。瓦罗王不再询问菜名，只要求记录官继续念地图。",
    },
    {
        "completedCountries": 4,
        "title": "主菜登席",
        "body": "银盖揭开时，热气短暂遮住了桌对面的人。有人把窗推开，宫墙外已经接近深夜。",
    },
    {
        "completedCountries": 5,
        "title": "盛宴正中",
        "body": "长桌看起来比开席时更拥挤，也更空。每一道菜都留下器皿，却很少有人再交谈。",
    },
    {
        "completedCountries": 6,
        "title": "过量与倦意",
        "body": "瓦罗王的动作慢下来，仍不允许撤走下一只盘子。记录官的墨已经变淡，名字却还没有念完。",
    },
    {
        "completedCountries": 7,
        "title": "天明与空盘",
        "body": "最后一道菜失去热气，窗外出现灰白的天光。完整地图留在桌上，宴席到此结束。",
    },
)


@dataclass(frozen=True)
class RegionMetrics:
    full_clue_count: int
    visible_clue_count: int
    solver_steps: int
    first_forced_cells: int
    unique_verified: bool
    basic_steps: int
    advanced_steps: int
    reasoning_level: str
    bright_count: int
    dark_count: int
    clue_min: int
    clue_max: int


@dataclass(frozen=True)
class RegionLevel:
    region_id: int
    name: str
    accent: str
    cells: tuple[int, ...]
    clues: dict[int, int]
    metrics: RegionMetrics
    country: Mapping[str, str]


@dataclass(frozen=True)
class GeneratedLevel:
    width: int
    height: int
    seed: int
    attempt: int
    region_map: tuple[int, ...]
    target: tuple[int, ...]
    regions: tuple[RegionLevel, ...]

    def public_dict(self, include_solution: bool = False) -> dict:
        payload = {
            "schemaVersion": 1,
            "title": "瓦罗王的餐桌 · 地图一",
            "subtitle": "先读懂国界，再让每一个数字说话。",
            "width": self.width,
            "height": self.height,
            "seed": self.seed,
            "clueRange": [
                min(clue for region in self.regions for clue in region.clues.values()),
                max(clue for region in self.regions for clue in region.clues.values()),
            ],
            "reasoningLevel": "advanced"
            if any(region.metrics.reasoning_level == "advanced" for region in self.regions)
            else "basic",
            "campaign": {
                "chapterId": "inner-sea",
                "chapterName": "内海七国",
                "banquetTimeline": [dict(beat) for beat in BANQUET_TIMELINE],
            },
            "regionMap": list(self.region_map),
            "regions": [
                {
                    "id": region.region_id,
                    "name": region.name,
                    "accent": region.accent,
                    "cells": list(region.cells),
                    "clues": {str(index): value for index, value in sorted(region.clues.items())},
                    "country": dict(region.country),
                    "metrics": {
                        "fullClueCount": region.metrics.full_clue_count,
                        "visibleClueCount": region.metrics.visible_clue_count,
                        "solverSteps": region.metrics.solver_steps,
                        "firstForcedCells": region.metrics.first_forced_cells,
                        "uniqueVerified": region.metrics.unique_verified,
                        "basicSteps": region.metrics.basic_steps,
                        "advancedSteps": region.metrics.advanced_steps,
                        "reasoningLevel": region.metrics.reasoning_level,
                        "brightCount": region.metrics.bright_count,
                        "darkCount": region.metrics.dark_count,
                        "clueMin": region.metrics.clue_min,
                        "clueMax": region.metrics.clue_max,
                    },
                }
                for region in self.regions
            ],
        }
        if include_solution:
            payload["solution"] = list(self.target)
        return payload


def build_region_map(width: int = 20, height: int = 20) -> list[int]:
    """Create the fixed seven-country chapter-one map."""

    if width < 12 or height < 12:
        raise ValueError("the chapter-one region map needs a board of at least 12x12")
    seeds = (
        (width * 3 / 20, height * 3 / 20),
        (width * 10 / 20, height * 2 / 20),
        (width * 16 / 20, height * 4 / 20),
        (width * 3 / 20, height * 15 / 20),
        (width * 9 / 20, height * 13 / 20),
        (width * 15 / 20, height * 15 / 20),
        (width * 18 / 20, height * 11 / 20),
    )
    region_map: list[int] = []
    for y in range(height):
        for x in range(width):
            distances: list[tuple[float, int]] = []
            for region_id, (seed_x, seed_y) in enumerate(seeds):
                distance = (x - seed_x) ** 2 * 1.1 + (y - seed_y) ** 2
                distances.append((distance + region_id * 0.01, region_id))
            region_map.append(min(distances)[1])
    return region_map


def neighbours_for_cell(width: int, height: int, region_map: Iterable[int], index: int) -> tuple[int, ...]:
    """Return the clipped 3x3 neighbourhood that remains in the same region."""

    regions = tuple(region_map)
    if len(regions) != width * height:
        raise ValueError("region_map must cover the whole board")
    if index < 0 or index >= width * height:
        raise ValueError("cell index is outside the board")
    x, y = index % width, index // width
    region_id = regions[index]
    cells: list[int] = []
    for neighbour_y in range(max(0, y - 1), min(height, y + 2)):
        for neighbour_x in range(max(0, x - 1), min(width, x + 2)):
            neighbour = neighbour_y * width + neighbour_x
            if regions[neighbour] == region_id:
                cells.append(neighbour)
    return tuple(cells)


def calculate_clues(width: int, height: int, region_map: Iterable[int], target: Iterable[int]) -> list[int]:
    """Calculate a clue for every cell, clipping each 3x3 query to its region."""

    regions = tuple(region_map)
    target_values = tuple(int(value) for value in target)
    if len(target_values) != width * height:
        raise ValueError("target must cover the whole board")
    return [
        sum(target_values[cell] for cell in neighbours_for_cell(width, height, regions, index))
        for index in range(width * height)
    ]


def _region_cells(region_map: Iterable[int], region_id: int) -> tuple[int, ...]:
    return tuple(index for index, value in enumerate(region_map) if value == region_id)


def _region_constraints(
    width: int,
    height: int,
    region_map: Iterable[int],
    region_cells: tuple[int, ...],
    visible_clues: Mapping[int, int],
) -> tuple[Constraint, ...]:
    local_index = {global_index: local for local, global_index in enumerate(region_cells)}
    return tuple(
        Constraint(
            (local_index[cell] for cell in neighbours_for_cell(width, height, region_map, clue_index)),
            clue_value,
        )
        for clue_index, clue_value in visible_clues.items()
    )


def _solve_region(
    width: int,
    height: int,
    region_map: Iterable[int],
    region_cells: tuple[int, ...],
    visible_clues: Mapping[int, int],
) -> SolveResult:
    return DirectClueSolver(
        len(region_cells),
        _region_constraints(width, height, region_map, region_cells, visible_clues),
    ).solve()


def _make_balanced_target(width: int, height: int, region_map: list[int], rng: random.Random) -> list[int]:
    """Make smooth, dense light/dark fields with an even split per region.

    Uniformly scattered bits almost never expose a complete chain of direct
    zero/full deductions. Blurring a seeded random field first creates the
    contiguous runs found in hand-authored Fill-a-Pix art while retaining an
    exact 1:1 light/dark balance inside every demo region.
    """

    scores = [rng.random() for _ in range(width * height)]
    for _ in range(2):
        smoothed_scores: list[float] = []
        for index in range(width * height):
            neighbourhood = neighbours_for_cell(width, height, region_map, index)
            smoothed_scores.append(sum(scores[cell] for cell in neighbourhood) / len(neighbourhood))
        scores = smoothed_scores

    target = [0] * (width * height)
    for region_id in sorted(set(region_map)):
        cells = list(_region_cells(region_map, region_id))
        cells.sort(key=lambda cell: (scores[cell], cell), reverse=True)
        bright_count = len(cells) // 2
        for cell in cells[:bright_count]:
            target[cell] = 1
    return target


def _prune_region(
    width: int,
    height: int,
    region_map: list[int],
    region_cells: tuple[int, ...],
    full_clues: Mapping[int, int],
    target: list[int],
    rng: random.Random,
) -> tuple[dict[int, int], SolveResult]:
    working = dict(full_clues)
    shuffled_clues = list(region_cells)
    rng.shuffle(shuffled_clues)
    target_local = tuple(target[index] for index in region_cells)
    required_clues = {next(cell for cell in region_cells if full_clues[cell] == clue) for clue in set(full_clues.values())}

    for clue_index in shuffled_clues:
        if clue_index in required_clues:
            continue
        if len(working) <= len(required_clues):
            break
        trial = dict(working)
        del trial[clue_index]
        result = _solve_region(width, height, region_map, region_cells, trial)
        if result.status == "solved" and result.values == target_local:
            working = trial

    result = _solve_region(width, height, region_map, region_cells, working)
    if result.status != "solved" or result.values != target_local:
        raise ValueError("pruned region is not solvable by direct clue deductions")
    return working, result


def build_level(
    *,
    width: int = 20,
    height: int = 20,
    seed: int = 20260828,
    max_attempts: int = 100,
    verify_with_minizinc: bool = True,
    require_full_clue_range: bool = True,
) -> GeneratedLevel:
    """Generate a unique level solvable by visible single-clue deductions."""

    base_region_map = build_region_map(width, height)
    region_ids = sorted(set(base_region_map))
    if region_ids != list(range(len(region_ids))):
        raise ValueError("region ids must be contiguous and start at zero")
    countries_by_region_id = {int(country["regionId"]): country for country in COUNTRIES}
    if len(countries_by_region_id) != len(COUNTRIES):
        raise ValueError("chapter-one country metadata contains duplicate region ids")
    if set(region_ids) != set(countries_by_region_id):
        raise ValueError("chapter-one region metadata must match the generated map")
    for attempt in range(1, max_attempts + 1):
        rng = random.Random(seed + attempt * 1009)
        target = _make_balanced_target(width, height, base_region_map, rng)
        full_clues = calculate_clues(width, height, base_region_map, target)
        if require_full_clue_range and (min(full_clues) != 0 or max(full_clues) != 9):
            continue
        generated_regions: list[RegionLevel] = []
        failed = False

        for region_id in region_ids:
            country = countries_by_region_id[region_id]
            cells = _region_cells(base_region_map, region_id)
            clues = {cell: full_clues[cell] for cell in cells}
            full_result = _solve_region(width, height, base_region_map, cells, clues)
            target_local = tuple(target[cell] for cell in cells)
            if full_result.status != "solved" or full_result.values != target_local:
                failed = True
                break

            try:
                visible_clues, result = _prune_region(
                    width,
                    height,
                    base_region_map,
                    cells,
                    clues,
                    target,
                    rng,
                )
            except ValueError:
                failed = True
                break

            constraints = _region_constraints(width, height, base_region_map, cells, visible_clues)
            unique_verified = verify_unique(
                len(cells),
                constraints,
                target_local,
            ) if verify_with_minizinc else False
            if verify_with_minizinc and not unique_verified:
                failed = True
                break

            basic_steps = sum(1 for step in result.steps if step.reasoning_level == "basic")
            advanced_steps = sum(1 for step in result.steps if step.reasoning_level == "advanced")
            generated_regions.append(
                RegionLevel(
                    region_id,
                    str(country["countryNameZh"]),
                    str(country["accent"]),
                    cells,
                    visible_clues,
                    RegionMetrics(
                        len(clues),
                        len(visible_clues),
                        len(result.steps),
                        basic_steps,
                        unique_verified,
                        basic_steps,
                        advanced_steps,
                        result.reasoning_level,
                        sum(target[index] for index in cells),
                        len(cells) - sum(target[index] for index in cells),
                        min(visible_clues.values()),
                        max(visible_clues.values()),
                    ),
                    {
                        key: str(value)
                        for key, value in country.items()
                        if key not in {"regionId", "accent"}
                    },
                )
            )

        visible_values = [clue for region in generated_regions for clue in region.clues.values()]
        if (
            not failed
            and len(generated_regions) == len(region_ids)
            and (not require_full_clue_range or (min(visible_values) == 0 and max(visible_values) == 9))
        ):
            return GeneratedLevel(
                width,
                height,
                seed,
                attempt,
                tuple(base_region_map),
                tuple(target),
                tuple(generated_regions),
            )

    raise RuntimeError(f"could not generate a direct-solvable level after {max_attempts} attempts")


def write_public_level(level: GeneratedLevel, output_path: str | Path, include_solution: bool = False) -> None:
    import json

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(level.public_dict(include_solution), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
