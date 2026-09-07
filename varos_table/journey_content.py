"""Journey-only text. Frozen legacy level files deliberately remain unchanged."""
from .content import localized

FOOD_NOTES = (
    ("榆烟从低地鱼棚的屋顶升起来。白鱼抹上粗盐和酸草，留到河水结冰后食用。", "Elm smoke rises from the lowland fish sheds. White fish is rubbed with coarse salt and sour herbs, then kept until the river freezes.",
     "榆堤的厨师在木板上晾鱼，不在鱼身上刻记号。每家人认得自家的那一块木板。", "The cooks of Elm Dike dry fish on boards, without marking the fish. Each household recognizes its own board."),
    ("阿斯帕的热乳酪盛在白陶碗里，茴香放得很轻。客人总在碗沿找一块没烫手的地方。", "Aspa serves hot cheese in white clay bowls with a little fennel. Guests search the rim for a place cool enough to hold.",
     "商队把空碗倒扣在车上。雨来时，乳酪的气味先于车轮抵达镇子。", "Caravans carry empty bowls upside down. When rain arrives, the smell of cheese reaches town before the wheels."),
    ("风井港的贝壳在晨光里泛黑。摊主只用清水煮它们，把海藻酒留给等得最久的人。", "Windwell Harbor's mussel shells look black in morning light. Vendors boil them in water and save the seaweed wine for those who wait longest.",
     "港口每天收走一车空贝壳。孩子们按大小把它们排开，直到潮水抹掉昨天的顺序。", "A cart of empty shells leaves the harbor each day. Children sort them by size until the tide erases yesterday's arrangement."),
    ("图兰的面包在出炉后才标重量。磨坊主说，等它凉下来，河谷就会少掉一点东西。", "Turan's bread is weighed straight from the oven. The miller says that once it cools, the valley will have lost a little of something.",
     "渡船载着麦袋过河时，船夫用一块面包垫住摇晃的灯。到了对岸，他把面包带走。", "When sacks of wheat cross the river, the ferryman wedges a piece of bread beneath a swaying lamp. On the far bank, he takes the bread with him."),
    ("梅罗萨的桥市各卖一种香草。厨师若要凑齐一束，就得在城里走完七座桥。", "Each of Melosa's bridge markets sells one herb. A cook gathering a complete bunch must cross all seven bridges.",
     "烤禽送到桌边时，香草已经失去颜色。识货的客人仍能依气味说出它们来自哪座桥。", "By the time the roast bird reaches the table, the herbs have lost their color. Those who know them can still name the bridges by scent."),
    ("乌尔珊的梨在铜锅里慢慢炖软。紫盐只放几粒，掌勺的人却总要数两遍。", "Urshan's pears soften slowly in a copper pot. Only a few grains of violet salt are added, but the cook always counts twice.",
     "盐罐留在桌边，盖子下面垫着折好的纸。宴席结束以后，侍者会把纸展开晾干。", "The salt jar stays beside the table, with folded paper under its lid. After the meal, a server unfolds the paper to dry."),
    ("佩尔岛退潮时，孩子们从石缝里捉小蟹。入夜后，温热的蟹壳在盘中泛着浅金。", "At low tide, Pel's children catch small crabs between the stones. After dark, the warm shells gleam pale gold on a plate.",
     "岛上的汤用海水调咸淡。厨师舀汤之前会先看潮线，像是在看一只走得很慢的钟。", "On the island, seawater seasons the soup. Before serving, the cook checks the tide line, as though consulting a very slow clock."),
)


def enrich_journey(payload: dict) -> dict:
    payload["levelId"] = "inner-sea-journey-v1"
    payload["title"] = localized("内海七国", "Seven Kingdoms of the Inner Sea")
    payload["subtitle"] = localized("一场尚未散席的晚宴，一张等待展开的地图。", "A banquet still in progress. A map waiting to unfold.")
    payload["campaign"]["chapterId"] = "inner-sea-journey-v1"
    payload["onboarding"] = {"regionId": 6, "skippable": True}
    for region in payload["regions"]:
        a_zh, a_en, h_zh, h_en = FOOD_NOTES[region["id"]]
        region["country"]["arrival"] = localized(a_zh, a_en)
        region["country"]["halfway"] = localized(h_zh, h_en)
        region["country"]["banquetInsert"] = localized(a_zh, a_en)
    # Keep the banquet literal; place chronology belongs only to fall records.
    payload["campaign"]["banquetTimeline"][1]["body"] = localized(
        "侍者放下银盘，退到灯光之外。瓦罗王尝了一口，示意把窗边的烛台移近。",
        "A server sets down the silver platter and steps out of the light. Varo tastes a mouthful, then asks for the candlestick by the window to be brought closer.",
    )
    payload["campaign"]["banquetTimeline"][3]["body"] = localized(
        "撤下的盘子越来越多，新的器皿仍不断送来。瓦罗王把杯子推到一旁，等待侍者揭开下一只银盖。",
        "More plates are cleared while new vessels keep arriving. Varo pushes his cup aside and waits for the server to lift another silver cover.",
    )
    return payload
