"""Localized narrative content for the first King Varo's Table chapter."""

from __future__ import annotations

from typing import Final


def localized(zh_cn: str, en: str) -> dict[str, str]:
    """Create one complete localized text value for the public level schema."""

    return {"zh-CN": zh_cn, "en": en}


LEVEL_TITLE: Final = localized(
    "瓦罗王的餐桌 · 地图一",
    "King Varo's Table · Map One",
)
LEVEL_SUBTITLE: Final = localized(
    "先读懂国界，再让每一个数字说话。",
    "Read the borders first, then let every number speak.",
)
CHAPTER_NAME: Final = localized(
    "内海七国",
    "Seven Kingdoms of the Inner Sea",
)


COUNTRIES: Final = (
    {
        "regionId": 0,
        "countryId": "loven-lowlands",
        "accent": "ochre",
        "name": localized("洛汶低地", "Loven Lowlands"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("榆堤城", "Elm Dike"),
        "geography": localized("低地河网与季节性湿原", "Lowland waterways and seasonal marshes"),
        "foodAndMaterialCulture": localized(
            "榆烟熏鱼、酸草、河闸铜器与芦苇编席。",
            "Elm-smoked fish, sour herbs, bronze sluiceware, and woven reed mats.",
        ),
        "banquetInsert": localized(
            "第一只银盘盛着榆烟熏过的白鱼，鱼腹填了酸草与粗盐。侍者说，低地人用同样的烟保存冬粮。",
            "The first silver platter held a white fish smoked over elm, its belly packed with sour herbs and coarse salt. The server said the lowlanders used the same smoke to preserve their winter stores.",
        ),
        "fallCardTitle": localized("河闸闭合之前", "Before the Sluice Gates Closed"),
        "fallCardBody": localized(
            "洛汶议会原以为拆去东堤就能拖慢帝国骑兵，却先让三座村镇失去了归路。榆堤城在第六日开门，守闸人把铜钥匙沉进河心，没有参加受降仪式。",
            "The Loven council believed that dismantling the eastern dike would slow the imperial cavalry. Instead, three villages lost their way home. Elm Dike opened its gates on the sixth day; the keeper sank the bronze key in midstream and did not attend the surrender.",
        ),
        "survivingTrace": localized(
            "后世修闸时捞出一枚没有齿纹的铜钥匙，现藏于榆堤档案室。",
            "Centuries later, repairs to the sluice brought up a toothless bronze key, now kept in the Elm Dike archive.",
        ),
        "mapRevealConcept": localized(
            "河网与闸门从褪色底图中显现，沉入河心的铜钥匙留作完成印记。",
            "Waterways and sluice gates emerge from the faded ground; the key sunk in midstream remains as the mark of completion.",
        ),
    },
    {
        "regionId": 1,
        "countryId": "aspa",
        "accent": "cobalt",
        "name": localized("阿斯帕", "Aspa"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("白阶城", "White Stair"),
        "geography": localized("北部石坡与盐路驿站", "Northern stone slopes and salt-road stations"),
        "foodAndMaterialCulture": localized(
            "茴香热乳酪、白陶碗、盐路商队与石阶驿站。",
            "Hot fennel cheese, white pottery, salt-road caravans, and stone-stepped stations.",
        ),
        "banquetInsert": localized(
            "白陶碗里是加了茴香的热乳酪。送菜人把碗沿擦了三遍，因为阿斯帕商队认为溢出的乳脂会招来坏天气。",
            "Hot cheese scented with fennel arrived in a white clay bowl. The server wiped its rim three times, because Aspa's caravans believed spilled cream invited bad weather.",
        ),
        "fallCardTitle": localized("白阶上的空旗", "The Empty Flag Above White Stair"),
        "fallCardBody": localized(
            "阿斯帕的执政官把军旗留在城墙上，带着卫队从盐路撤往北坡。帝国军抵达时只找到开着的仓库与一份逐户抄写的欠粮名册；留下的人用那份名册证明征粮早已超过约定。",
            "Aspa's governor left the army flag on the wall and withdrew with the guard along the salt road toward the northern slope. Imperial troops found only open storehouses and a household ledger of grain debts; those who remained used it to prove that the levy had already exceeded its promise.",
        ),
        "survivingTrace": localized(
            "白阶城至今仍把空旗日记作一年中不开市的上午。",
            "White Stair still observes Empty Flag Day as the one morning each year when its markets do not open.",
        ),
        "mapRevealConcept": localized(
            "盐路沿白色石阶延伸，城墙上只留下没有旗面的旗杆。",
            "The salt road climbs the white steps; above the wall stands a flagstaff without a flag.",
        ),
    },
    {
        "regionId": 2,
        "countryId": "cape-galan",
        "accent": "slate",
        "name": localized("迦蓝岬", "Cape Galan"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("风井港", "Windwell Harbor"),
        "geography": localized("多风海岬与深水锚地", "Wind-scoured capes and deep-water anchorages"),
        "foodAndMaterialCulture": localized(
            "黑壳贝、海藻酒、铜制贝盆与领港灯塔。",
            "Black-shell mussels, seaweed wine, copper shell basins, and pilot beacons.",
        ),
        "banquetInsert": localized(
            "第三道菜是风井港的黑壳贝，配一小杯极干的海藻酒。贝壳被整齐收进铜盆，像是还有别的用途。",
            "The third course was Windwell Harbor's black-shell mussels with a small cup of very dry seaweed wine. Their shells were stacked neatly in a copper basin, as though intended for some later use.",
        ),
        "fallCardTitle": localized("港钟没有敲响", "The Harbor Bell Did Not Ring"),
        "fallCardBody": localized(
            "迦蓝岬依靠海雾掩护船队多年。最后一夜，领港人故意熄掉外湾灯塔，让本国商船先离港；帝国舰队直到天亮才发现港内只剩拆去桅杆的旧船。",
            "For years Cape Galan hid its fleet in sea fog. On the final night, the pilots darkened the outer beacon so their merchant ships could leave first. At dawn, the imperial fleet discovered that the harbor held only old vessels stripped of their masts.",
        ),
        "survivingTrace": localized(
            "外湾灯塔重建后仍保留一段不点灯的石阶，领港人称它为静夜。",
            "The rebuilt outer beacon still keeps one flight of steps unlit. Harbor pilots call it the Quiet Night.",
        ),
        "mapRevealConcept": localized(
            "海岬、雾带与空锚地恢复轮廓，灯塔保留一段永不着色的石阶。",
            "Capes, fog banks, and empty anchorages regain their outlines; one stair of the beacon remains forever uncolored.",
        ),
    },
    {
        "regionId": 3,
        "countryId": "turan-valley",
        "accent": "verdigris",
        "name": localized("图兰河谷", "Turan Valley"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("磨坊渡", "Mill Crossing"),
        "geography": localized("河谷麦田与两岸水磨", "Valley wheat fields and watermills on both banks"),
        "foodAndMaterialCulture": localized(
            "砂壳麦面包、水磨石、木渡船与沿岸木工。",
            "Sand-crusted wheat bread, millstones, wooden ferries, and riverside carpentry.",
        ),
        "banquetInsert": localized(
            "面包在入席前才切开，麦香很重，外壳却混有细碎的河砂。宫廷厨师把这解释成磨坊石太旧。",
            "The bread was cut only when the guests sat down. It smelled strongly of wheat, though fine river sand gritted its crust. The court cook blamed an aging millstone.",
        ),
        "fallCardTitle": localized("渡口的第九条船", "The Ninth Boat at the Crossing"),
        "fallCardBody": localized(
            "图兰河谷答应交出八条渡船，暗中留下第九条接送逃离磨坊渡的人。告密者领帝国军来到河边时，船已被拆成门板、车轴和三十多把木铲，分散在沿岸村落。",
            "Turan Valley agreed to surrender eight ferries, keeping a ninth to carry people away from Mill Crossing. By the time an informer led imperial troops to the river, the boat had become doors, cart axles, and more than thirty wooden shovels scattered among the riverside villages.",
        ),
        "survivingTrace": localized(
            "河谷婚礼仍会赠送一把没有上漆的小木铲，据说木料来自那条船。",
            "Valley weddings still include the gift of a small unpainted wooden shovel, said to be cut from that boat.",
        ),
        "mapRevealConcept": localized(
            "九条渡船的航线重回河面，其中一条在村落间分解为细小木纹。",
            "Nine ferry routes return to the river; one dissolves among the villages into fine lines of wood grain.",
        ),
    },
    {
        "regionId": 4,
        "countryId": "melosa",
        "accent": "vermilion",
        "name": localized("梅罗萨", "Melosa"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("七拱城", "Seven Arches"),
        "geography": localized("内海丘原与石桥商道", "Inner-sea uplands and stone-bridge trade roads"),
        "foodAndMaterialCulture": localized(
            "七桥香草、烤禽、石拱商道与桥市行会。",
            "Seven-bridge herbs, roast fowl, stone-arch trade roads, and bridge-market guilds.",
        ),
        "banquetInsert": localized(
            "烤禽下垫着七种香草，每一种来自不同桥市。记录官只写下了六种，剩下一种无人肯说出名字。",
            "The roast bird rested on seven herbs, each from a different bridge market. The recorder wrote down only six; no one would name the last.",
        ),
        "fallCardTitle": localized("第七座桥", "The Seventh Bridge"),
        "fallCardBody": localized(
            "梅罗萨在六座桥上布防，却把最旧的第七桥留给逃难者。守军投降后，帝国史官把那座桥从军图中抹去，因为它证明围城并不完整，也证明有人在封锁中离开。",
            "Melosa fortified six bridges and left the oldest, the seventh, to those fleeing the city. After the garrison surrendered, imperial historians erased it from their campaign map, because it proved both that the siege had gaps and that people escaped through them.",
        ),
        "survivingTrace": localized(
            "后世地图恢复了第七桥的位置，但桥名一栏至今空白。",
            "Later maps restored the seventh bridge, though the space reserved for its name remains blank.",
        ),
        "mapRevealConcept": localized(
            "七道桥拱依次显影，最旧的一座仍不显示名称。",
            "Seven bridge arches surface in sequence; the oldest still bears no name.",
        ),
    },
    {
        "regionId": 5,
        "countryId": "urshan",
        "accent": "mauve",
        "name": localized("乌尔珊", "Urshan"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("紫盐堡", "Violet Salt Keep"),
        "geography": localized("盐沼、高堤与染料作坊", "Salt marshes, high dikes, and dye works"),
        "foodAndMaterialCulture": localized(
            "紫盐炖梨、盐罐、染缸与高堤作坊。",
            "Pears stewed with violet salt, salt jars, dye vats, and workshops along the high dikes.",
        ),
        "banquetInsert": localized(
            "紫盐被撒在炖梨上，颜色比味道更醒目。瓦罗王命人把盐罐留在桌边，随后却没有再碰它。",
            "Violet salt was scattered over stewed pears, its color more striking than its taste. King Varo ordered the jar left beside him, then never touched it again.",
        ),
        "fallCardTitle": localized("染缸里的印玺", "The Seal in the Dye Vat"),
        "fallCardBody": localized(
            "乌尔珊宫廷在政变中更换了三次城门口令。最后一位守将把旧王印投入染缸，向帝国使者声称国家已经没有可以签署降书的人。围城仍继续了十二日。",
            "During the coup, Urshan's court changed the gate password three times. The final commander threw the old royal seal into a dye vat and told the imperial envoy that no one remained who could sign a surrender. The siege continued for twelve more days.",
        ),
        "survivingTrace": localized(
            "紫盐堡出土的王印被染料蚀去一角，无法确认最后使用它的是哪一位君主。",
            "A royal seal excavated at Violet Salt Keep has one corner eaten away by dye. No one can determine which ruler used it last.",
        ),
        "mapRevealConcept": localized(
            "盐沼和高堤转为暗紫色，缺角王印作为档案页的压印。",
            "Salt marshes and high dikes deepen to violet; the broken seal leaves its impression on the archive page.",
        ),
    },
    {
        "regionId": 6,
        "countryId": "pel-island",
        "accent": "clay",
        "name": localized("佩尔岛", "Pel Island"),
        "chapter": CHAPTER_NAME,
        "capitalOrFocusCity": localized("砾湾", "Shingle Bay"),
        "geography": localized("东部小岛、砾滩与浅湾", "Eastern islets, shingle beaches, and shallow bays"),
        "foodAndMaterialCulture": localized(
            "浅金小蟹、渔叉、船帆与海蚀洞储粮。",
            "Pale-gold shore crabs, fishing spears, sails, and grain stores in sea caves.",
        ),
        "banquetInsert": localized(
            "一盘温热的砾湾小蟹被放在桌角，数量不多，壳上带着浅金色斑点。最年轻的侍者说，岛上孩子会在退潮时徒手捉它们。",
            "A small plate of warm Shingle Bay crabs was set at the corner of the table. Their shells bore pale-gold spots. The youngest server said island children caught them barehanded at low tide.",
        ),
        "fallCardTitle": localized("小岛先被记住", "The Island Was Remembered First"),
        "fallCardBody": localized(
            "佩尔岛没有城墙。岛民把粮食和船帆藏进海蚀洞，随后在砾湾列队交出渔叉。帝国记录把这写成一次迅速而体面的归顺，却没有记下当年冬天所有船只都被征走。",
            "Pel Island had no walls. Its people hid grain and sails in sea caves, then lined up at Shingle Bay to surrender their fishing spears. Imperial records called it a swift and dignified submission, but did not record that every boat was requisitioned that winter.",
        ),
        "survivingTrace": localized(
            "岛上的旧历法把那一年称作无帆之冬，而不是瓦罗王纪年的第一年。",
            "The island's old calendar calls that year the Winter Without Sails, not the first year of King Varo's reign.",
        ),
        "mapRevealConcept": localized(
            "小岛海岸完整显现，但近岸不再绘出任何船帆。",
            "The island's coast appears in full, but no sail is drawn in its waters.",
        ),
    },
)


BANQUET_TIMELINE: Final = (
    {
        "completedCountries": 0,
        "title": localized("宾客入席", "The Guests Take Their Seats"),
        "body": localized(
            "长桌已经铺好，盘盏仍空。记录官先写下座次，再写窗外送进宫门的七种口音。",
            "The long table has been laid, though every dish remains empty. The recorder writes down the seating order, then the seven accents drifting through the palace gate outside.",
        ),
    },
    {
        "completedCountries": 1,
        "title": localized("第一道菜", "The First Course"),
        "body": localized(
            "第一只银盘落在瓦罗王面前。侍者报出产地时，地图上的一个国名刚刚恢复完整。",
            "The first silver platter comes to rest before King Varo. As the server names its origin, one country on the map has just become whole again.",
        ),
    },
    {
        "completedCountries": 2,
        "title": localized("第二轮斟酒", "The Second Pour"),
        "body": localized(
            "酒杯重新斟满，席间开始谈论道路、港口和今年的收成，仿佛这些地方都只是货单上的来源。",
            "The cups are filled again. Around the table they speak of roads, harbors, and this year's harvest, as if each place were merely an entry on a bill of goods.",
        ),
    },
    {
        "completedCountries": 3,
        "title": localized("食欲渐盛", "The Appetite Grows"),
        "body": localized(
            "撤下的盘子越来越多，新的器皿仍不断送来。瓦罗王不再询问菜名，只要求记录官继续念地图。",
            "More plates are cleared while new vessels keep arriving. King Varo no longer asks the names of the dishes; he only tells the recorder to continue reading the map.",
        ),
    },
    {
        "completedCountries": 4,
        "title": localized("主菜登席", "The Main Course"),
        "body": localized(
            "银盖揭开时，热气短暂遮住了桌对面的人。有人把窗推开，宫墙外已经接近深夜。",
            "When the silver cover is lifted, steam briefly hides those seated across the table. Someone opens a window. Beyond the palace wall, it is almost midnight.",
        ),
    },
    {
        "completedCountries": 5,
        "title": localized("盛宴正中", "At the Feast's Center"),
        "body": localized(
            "长桌看起来比开席时更拥挤，也更空。每一道菜都留下器皿，却很少有人再交谈。",
            "The long table looks more crowded than when the feast began, and emptier too. Every course leaves a vessel behind, but almost no one speaks now.",
        ),
    },
    {
        "completedCountries": 6,
        "title": localized("过量与倦意", "Excess and Weariness"),
        "body": localized(
            "瓦罗王的动作慢下来，仍不允许撤走下一只盘子。记录官的墨已经变淡，名字却还没有念完。",
            "King Varo's movements slow, yet he will not allow the next plate to be removed. The recorder's ink has faded, but the list of names is not finished.",
        ),
    },
    {
        "completedCountries": 7,
        "title": localized("天明与空盘", "Dawn and the Empty Plates"),
        "body": localized(
            "最后一道菜失去热气，窗外出现灰白的天光。完整地图留在桌上，宴席到此结束。",
            "The final course loses its warmth as gray daylight reaches the windows. The completed map remains on the table. The feast is over.",
        ),
    },
)


CHAPTER_EPILOGUE: Final = {
    "eyebrow": localized(
        "后世档案 · 内海七国",
        "Later archive · Seven Kingdoms of the Inner Sea",
    ),
    "title": localized("地图比帝国活得更久", "The Map Outlived the Empire"),
    "body": localized(
        "完整地图在天明前被送出宴厅。瓦罗王让人给七国换上同一种颜色，仿佛边界从此只剩装饰。宫门外，运粮车仍沿着被改名的旧路驶来，车夫却继续使用那些已经从官册上消失的地名。\n\n这个看似无边的政权没有维持多久。加税、征役和争位使各地接连起兵，宫廷卫队在瓦罗王死后第三年撤下王旗；七国的边界再度改变，流亡者却没有因此立刻归乡。帝国被推翻得很快，它留下的迁徙、空城与失传手艺却延续了几代人。",
        "The completed map left the banquet hall before dawn. King Varo ordered all seven kingdoms painted in a single color, as though their borders had become decoration. Outside the palace gate, grain carts still followed old roads under new names, while their drivers kept using place names already erased from official registers.\n\nThe government that seemed boundless did not last. Taxes, forced labor, and struggles for succession drove one province after another into revolt. In the third year after Varo's death, the palace guard lowered his standard. The borders of the seven kingdoms changed again, though the displaced did not immediately return home. The empire was overthrown quickly; the migrations, empty cities, and lost crafts it left behind endured for generations.",
    ),
    "survivingTrace": localized(
        "这张地图后来被拆成七卷，分别保存于港务所、修道院和旧税库。后世修复者保留了彼此矛盾的地名与边线：它既是瓦罗王权势顶点的自夸，也是各国曾经存在、抵抗并留下痕迹的证物。",
        "The map was later separated into seven rolls and kept among harbor offices, monasteries, and abandoned tax houses. Later restorers preserved its contradictory place names and boundary lines. It is at once a boast from the height of Varo's power and evidence that the kingdoms existed, resisted, and left traces behind.",
    ),
    "archiveLabel": localized("后世尾声", "Historical Epilogue"),
    "archiveSummary": localized("地图比帝国活得更久", "The Map Outlived the Empire"),
}
