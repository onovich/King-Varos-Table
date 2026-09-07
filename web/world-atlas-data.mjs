const bilingual = (en, zhCN) => Object.freeze({ en, "zh-CN": zhCN });

export const WORLD_COLUMNS = 48;
export const WORLD_ROWS = 30;
export const WORLD_CELL_SIZE = 44;

const COUNTRY_DEFINITIONS = [
  {
    id: "loven",
    order: 0,
    accent: "#a88149",
    seal: "diamond",
    mapPosition: { x: 7, y: 4 },
    shape: [
      "  ######  ",
      " ######## ",
      "##########",
      "##########",
      "######### ",
      " #######  ",
      "  ######  ",
    ],
    name: bilingual("Loven", "洛汶"),
    shortName: bilingual("Lowlands", "低地"),
    sealLabel: bilingual("Sluice mark", "水闸印记"),
    mapNote: bilingual("Low waterways", "低地水网"),
    districts: [
      bilingual("Upper reedways", "上游芦道"),
      bilingual("Elm dikes", "榆堤"),
      bilingual("Bell marsh", "钟沼"),
      bilingual("Sluice quarter", "水闸区"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · First bell", "事件 01 · 第一声钟"),
        title: bilingual("The water ledger is reopened", "水账被重新打开"),
        body: bilingual(
          "A dry-season register resurfaces in the Elm dikes. Its numbers do not match the imperial copy.",
          "榆堤的一本旱季账册重见天日，其中数字与帝国抄本并不相符。",
        ),
      },
      {
        phase: bilingual("Event 02 · Low water", "事件 02 · 低水位"),
        title: bilingual("Three crossings refuse one name", "三处渡口拒绝同一个名字"),
        body: bilingual(
          "The district maps retain three local names for one crossing, forcing the registry to keep all of them.",
          "地区地图为同一渡口留下三个地方名称，档案官只能将它们全部保留。",
        ),
      },
      {
        phase: bilingual("Event 03 · Dike light", "事件 03 · 堤灯"),
        title: bilingual("A key appears in the margin", "钥匙出现在页边"),
        body: bilingual(
          "A drawn key is found beside the old sluice grid; no record agrees on who placed it there.",
          "旧水闸格图旁出现一枚手绘钥匙，没有记录说明是谁把它放在这里。",
        ),
      },
    ],
  },
  {
    id: "aspa",
    order: 1,
    accent: "#648399",
    seal: "step",
    mapPosition: { x: 17, y: 2 },
    shape: [
      "   #####  ",
      "  ####### ",
      " #########",
      "##########",
      "######### ",
      " ######## ",
      "  ######  ",
      "   ####   ",
    ],
    name: bilingual("Aspa", "阿斯帕"),
    shortName: bilingual("White stair", "白阶"),
    sealLabel: bilingual("Step mark", "阶梯印记"),
    mapNote: bilingual("Northward roads", "北坡驿路"),
    districts: [
      bilingual("Wind steps", "风阶"),
      bilingual("Outer ledgers", "外账区"),
      bilingual("White courts", "白庭"),
      bilingual("Salt passage", "盐道"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · Closed market", "事件 01 · 闭市"),
        title: bilingual("The missing tally returns", "缺失的清单回来了"),
        body: bilingual(
          "A route marker links the high steps to a missing grain tally, but the date seal has been removed.",
          "一枚路标将高阶与缺失的粮食清单连在一起，但日期印记已被剥去。",
        ),
      },
      {
        phase: bilingual("Event 02 · North slope", "事件 02 · 北坡"),
        title: bilingual("The empty banner is catalogued", "空旗被编入目录"),
        body: bilingual(
          "The archive keeps the mark as an absence, not an emblem. The district refuses to restore its color.",
          "档案将这个记号作为缺席而非徽章保存；该地区拒绝恢复它原本的颜色。",
        ),
      },
      {
        phase: bilingual("Event 03 · Last stair", "事件 03 · 最后一阶"),
        title: bilingual("A path divides without a border", "道路在没有国境处岔开"),
        body: bilingual(
          "The road line divides between two districts even though no state line ever passed through it.",
          "道路在两个地区之间分开，但这里从未有任何国境线穿过。",
        ),
      },
    ],
  },
  {
    id: "galan",
    order: 2,
    accent: "#7f9b7a",
    seal: "arc",
    mapPosition: { x: 26, y: 4 },
    shape: [
      "  #######  ",
      " ######### ",
      "###########",
      "###########",
      " ##########",
      "  ######## ",
      "   ######  ",
    ],
    name: bilingual("Galan", "伽兰"),
    shortName: bilingual("Green reach", "青岬"),
    sealLabel: bilingual("Arc mark", "弧线印记"),
    mapNote: bilingual("Terraced coast", "台地海岸"),
    districts: [
      bilingual("Terrace edge", "台地边"),
      bilingual("Far garden", "远园"),
      bilingual("Harbor rows", "港列"),
      bilingual("West gate", "西门区"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · Open harbor", "事件 01 · 港口开放"),
        title: bilingual("The outer gate keeps two records", "外门保留两份记录"),
        body: bilingual(
          "Two accounts place the same convoy on different days. Both seals are genuine.",
          "两份账目将同一支车队记在不同日期，但两枚印记都是真的。",
        ),
      },
      {
        phase: bilingual("Event 02 · Garden wall", "事件 02 · 园墙"),
        title: bilingual("A district redraws its own edge", "一个地区重画了自己的边缘"),
        body: bilingual(
          "Residents revise an internal district line to keep a shared cistern out of an imperial inventory.",
          "居民重画内部地区线，使一座共用蓄水池不被列入帝国清册。",
        ),
      },
      {
        phase: bilingual("Event 03 · Sea fog", "事件 03 · 海雾"),
        title: bilingual("The route becomes a witness", "路线成了证人"),
        body: bilingual(
          "A coastal route is annotated with names rather than goods, turning a trade line into testimony.",
          "一条海岸路线写下的是人名而非货物，使贸易线变成证词。",
        ),
      },
    ],
  },
  {
    id: "turan",
    order: 3,
    accent: "#b77455",
    seal: "ferry",
    mapPosition: { x: 4, y: 11 },
    shape: [
      "   ######  ",
      " ######### ",
      "########## ",
      "########## ",
      "#########  ",
      " ########  ",
      "  #######  ",
      "   #####   ",
    ],
    name: bilingual("Turan", "图兰"),
    shortName: bilingual("River valley", "河谷"),
    sealLabel: bilingual("Ferry mark", "渡口印记"),
    mapNote: bilingual("Mill crossings", "磨坊渡口"),
    districts: [
      bilingual("Mill bank", "磨坊岸"),
      bilingual("Ninth crossing", "第九渡"),
      bilingual("Field ledger", "田亩账区"),
      bilingual("Reed bridge", "芦桥"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · After harvest", "事件 01 · 收获之后"),
        title: bilingual("The ninth crossing is left blank", "第九渡口被留白"),
        body: bilingual(
          "A ferry route is omitted from the official map while its local repair notes remain intact.",
          "官方地图略去了一个渡口，但当地的修缮记录完整保留。",
        ),
      },
      {
        phase: bilingual("Event 02 · River night", "事件 02 · 河夜"),
        title: bilingual("Millstones are counted twice", "磨盘被清点两次"),
        body: bilingual(
          "Two districts each claim the same millstone. The contradiction exposes a hidden crossing schedule.",
          "两个地区都认领同一块磨盘；矛盾暴露出一份隐藏的渡口时刻表。",
        ),
      },
      {
        phase: bilingual("Event 03 · New grain", "事件 03 · 新麦"),
        title: bilingual("A door nail becomes a signal", "门钉成为信号"),
        body: bilingual(
          "A small symbol repeats along the valley, giving households a way to mark safe stores.",
          "一个小记号沿河谷重复出现，让各家得以标出安全的粮仓。",
        ),
      },
    ],
  },
  {
    id: "melosa",
    order: 4,
    accent: "#a66c68",
    seal: "bridge",
    mapPosition: { x: 14, y: 10 },
    shape: [
      "  ########  ",
      " ########## ",
      "########### ",
      "############",
      "############",
      " ###########",
      "  ######### ",
      "  ########  ",
      "   ######   ",
      "    ####    ",
    ],
    name: bilingual("Melosa", "梅罗萨"),
    shortName: bilingual("Seven arches", "七拱"),
    sealLabel: bilingual("Bridge mark", "桥印"),
    mapNote: bilingual("Central rises", "内海丘原"),
    districts: [
      bilingual("First arch", "第一拱"),
      bilingual("Market heights", "市集高地"),
      bilingual("Unlisted span", "未列桥段"),
      bilingual("South road", "南路区"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · Fourth watch", "事件 01 · 四更"),
        title: bilingual("The seventh span has no title", "第七段没有名字"),
        body: bilingual(
          "The map restores the bridge’s position but refuses to fill the name field beside it.",
          "地图恢复了桥的位置，却拒绝填写旁边的名称栏。",
        ),
      },
      {
        phase: bilingual("Event 02 · Market silence", "事件 02 · 市集静默"),
        title: bilingual("Six receipts answer one question", "六张收据回答同一个问题"),
        body: bilingual(
          "The market districts preserve receipts that do not agree, but together explain the missing route.",
          "市场地区保存了彼此不一致的收据，却共同解释了消失的路线。",
        ),
      },
      {
        phase: bilingual("Event 03 · Open span", "事件 03 · 开放桥段"),
        title: bilingual("The road is restored by voices", "道路由声音恢复"),
        body: bilingual(
          "The archive records a route from spoken directions when no survey sheet survives.",
          "在没有测绘稿留存的情况下，档案以口述方向恢复了一条路线。",
        ),
      },
    ],
  },
  {
    id: "urshan",
    order: 5,
    accent: "#8a6d89",
    seal: "broken-ring",
    mapPosition: { x: 26, y: 12 },
    shape: [
      "  ######  ",
      " ######## ",
      "##########",
      "##########",
      "######### ",
      " #######  ",
      "  ######  ",
      "  #####   ",
      "   ###    ",
    ],
    name: bilingual("Urshan", "乌尔珊"),
    shortName: bilingual("Violet marsh", "紫盐沼"),
    sealLabel: bilingual("Broken ring", "缺环印记"),
    mapNote: bilingual("High-dike works", "高堤作坊"),
    districts: [
      bilingual("Dye run", "染渠"),
      bilingual("High dike", "高堤"),
      bilingual("Salt ledgers", "盐账区"),
      bilingual("Violet basin", "紫盆地"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · Faded seal", "事件 01 · 褪色印记"),
        title: bilingual("One corner of the record is missing", "记录的一角消失了"),
        body: bilingual(
          "A seal impression survives with a deliberate gap; every later copy keeps the absence.",
          "一枚印痕带着刻意留下的缺口，之后的每份副本都保留了它。",
        ),
      },
      {
        phase: bilingual("Event 02 · Pale channel", "事件 02 · 淡色水渠"),
        title: bilingual("The color belongs to no banner", "这种颜色不属于任何旗帜"),
        body: bilingual(
          "The record rejects the court’s ceremonial reading and lists only ruined winter cloth.",
          "记录拒绝采用宫廷的庆典说法，只列出了报废的冬衣。",
        ),
      },
      {
        phase: bilingual("Event 03 · High water", "事件 03 · 高水位"),
        title: bilingual("A workshop line becomes a district line", "作坊线成为地区线"),
        body: bilingual(
          "A work route, not an army line, is what finally divides the region in the map book.",
          "最终将该地分开的不是军线，而是一条作坊运输线。",
        ),
      },
    ],
  },
  {
    id: "pel",
    order: 6,
    accent: "#b48d59",
    seal: "tide",
    mapPosition: { x: 34, y: 15 },
    shape: [
      "  ###  ",
      " ##### ",
      "#######",
      "#######",
      " ##### ",
      "  #### ",
      "   ##  ",
    ],
    name: bilingual("Pel", "佩尔"),
    shortName: bilingual("Shingle bay", "砾湾"),
    sealLabel: bilingual("Tide mark", "潮印"),
    mapNote: bilingual("Eastern shallows", "东部浅湾"),
    districts: [
      bilingual("Outer stones", "外砾滩"),
      bilingual("Tide shelf", "潮台"),
      bilingual("Cave stores", "海洞仓"),
      bilingual("Quiet cove", "静湾"),
    ],
    events: [
      {
        phase: bilingual("Event 01 · Low tide", "事件 01 · 退潮"),
        title: bilingual("The shore count begins again", "海岸计数重新开始"),
        body: bilingual(
          "The island’s record starts from a tide, not a reign. Its dates remain deliberately incompatible.",
          "岛上的记录从一次潮汐开始而非某个统治年号，日期因此刻意无法对齐。",
        ),
      },
      {
        phase: bilingual("Event 02 · Empty water", "事件 02 · 空水面"),
        title: bilingual("No sail is drawn near the bay", "砾湾近岸没有船帆"),
        body: bilingual(
          "A coast is restored in full, yet the mapmaker leaves every vessel out of the water.",
          "海岸被完整恢复，但制图者没有在水面画出任何船只。",
        ),
      },
      {
        phase: bilingual("Event 03 · Cave ledger", "事件 03 · 海洞账"),
        title: bilingual("The route survives as a rhythm", "路线以节奏留下"),
        body: bilingual(
          "A recurring tally pattern holds the location of stores without spelling out a place name.",
          "重复的计数节奏记录了仓储位置，却没有写出任何地名。",
        ),
      },
    ],
  },
];

export const WORLD_COUNTRIES = Object.freeze(COUNTRY_DEFINITIONS.map((country) => (
  Object.freeze({
    ...country,
    mapPosition: Object.freeze({ ...country.mapPosition }),
    shape: Object.freeze([...country.shape]),
    districts: Object.freeze([...country.districts]),
    events: Object.freeze([...country.events]),
  })
)));

export const WORLD_COPY = Object.freeze({
  title: bilingual("The Sealed Daybook", "封印地图册"),
  subtitle: bilingual("Seven countries · one unfinished atlas", "七国同图 · 一册未竟"),
  mapKicker: bilingual("The living map", "可移动地图"),
  mapTitle: bilingual("The Inner Sea", "内海全图"),
  mapDescription: bilingual(
    "Drag to cross the atlas. Scroll to change scale. The seal follows the country beneath the map’s center.",
    "拖动穿行全图，滚轮缩放。视口中心进入另一国时，顶部印记会自动切换。",
  ),
  toolKicker: bilingual("Map instruments", "地图工具"),
  bright: bilingual("Bright", "亮格"),
  dark: bilingual("Dark", "暗格"),
  erase: bilingual("Erase", "擦除"),
  brightHint: bilingual("Ready to mark light cells", "准备标记亮格"),
  darkHint: bilingual("Ready to mark dark cells", "准备标记暗格"),
  eraseHint: bilingual("Ready to clear a cell", "准备擦除格子"),
  hint: bilingual("Trace a certainty", "寻找确定步骤"),
  check: bilingual("Check the map", "检查地图"),
  mapHelp: bilingual("Drag · scroll to zoom · 0 resets view", "拖动 · 滚轮缩放 · 按 0 复位"),
  resetView: bilingual("Reset view", "复位视图"),
  zoom: bilingual("Scale", "缩放"),
  currentCountry: bilingual("Current country", "当前国家"),
  districtCount: bilingual("districts", "个地区"),
  storyKicker: bilingual("Parallel record", "并行事件线"),
  eventOf: bilingual("Event {current} of {total}", "事件 {current} / {total}"),
  previousEvent: bilingual("Previous event", "上一事件"),
  nextEvent: bilingual("Next event", "下一事件"),
  mapLayer: bilingual("Map layer", "地图层"),
  playLayer: bilingual("Puzzle layer ready to connect", "玩法层待接入"),
  tabLabel: bilingual("Countries", "国家"),
  worldLabel: bilingual("Interactive world map", "可交互世界地图"),
  worldHelp: bilingual(
    "Use the mouse wheel to zoom and drag the map. Country seals are available as keyboard tabs.",
    "滚动鼠标中键可缩放，按住拖动可移动地图；国家印记也可作为键盘标签操作。",
  ),
  movedTo: bilingual("Map center moved to {country}", "地图中心已进入 {country}"),
  selectedTool: bilingual("{tool}. Puzzle marking will attach here later.", "已选择 {tool}；后续玩法会接入此工具。"),
  checkMessage: bilingual("No puzzle state is attached yet. The map shell is ready.", "当前尚未接入棋盘状态，地图外壳已准备就绪。"),
  marker: bilingual("Country seal", "国家印记"),
});

export function normalizeAtlasLocale(locale) {
  return locale === "zh-CN" ? "zh-CN" : "en";
}

export function localizeAtlas(value, locale) {
  if (typeof value === "string") return value;
  const normalized = normalizeAtlasLocale(locale);
  return value?.[normalized] ?? value?.en ?? "";
}

export function interpolateAtlas(value, replacements = {}) {
  return String(value).replace(/\{(\w+)\}/g, (_, key) => replacements[key] ?? "");
}

function districtIndexFor(country, localX, localY) {
  const width = country.shape[0].length;
  const height = country.shape.length;
  if (localY < height * 0.32) return 0;
  if (localX < width * 0.42) return 1;
  if (localY > height * 0.7) return 2;
  return 3;
}

export function buildWorldCells() {
  const cells = Array.from(
    { length: WORLD_COLUMNS * WORLD_ROWS },
    () => null,
  );

  for (const country of WORLD_COUNTRIES) {
    country.shape.forEach((row, localY) => {
      [...row].forEach((character, localX) => {
        if (character !== "#") return;
        const x = country.mapPosition.x + localX;
        const y = country.mapPosition.y + localY;
        if (x < 0 || y < 0 || x >= WORLD_COLUMNS || y >= WORLD_ROWS) return;
        const index = y * WORLD_COLUMNS + x;
        if (cells[index]) {
          throw new Error(`World atlas countries overlap at ${x}, ${y}`);
        }
        cells[index] = {
          countryId: country.id,
          districtIndex: districtIndexFor(country, localX, localY),
          x,
          y,
        };
      });
    });
  }

  return cells;
}

export function countryCenter(country, cells = buildWorldCells()) {
  const countryCells = cells.filter((cell) => cell?.countryId === country.id);
  const total = countryCells.length || 1;
  return countryCells.reduce(
    (center, cell) => ({ x: center.x + cell.x / total, y: center.y + cell.y / total }),
    { x: 0, y: 0 },
  );
}
