export const SUPPORTED_LOCALES = Object.freeze(["zh-CN", "en"]);
export const FALLBACK_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "king-varos-table:locale";

const bundles = {
  "zh-CN": {
    "meta.title": "瓦罗王的餐桌 · 逻辑原型",
    "meta.levelTitle": ({ level }) => `${level} · 瓦罗王的餐桌`,
    "brand.eyebrow": "瓦罗王的餐桌 / 逻辑图志",
    "brand.title": "瓦罗王的餐桌",
    "brand.loadingSubtitle": "正在展开一张尚未完成的版图……",
    "folio.label": "当前页码",
    "language.label": "语言",
    "language.zhCN": "切换为简体中文",
    "language.en": "切换为英文",
    "rules.kicker": "规则",
    "rules.heading": "让数字自己开口。",
    "rules.lede": "每个数字表示：以自己为中心、包含数字格自身、且只限同一国家的最多 3×3 范围内，亮格的总数。亮格与暗格只用底色区分；数字范围为 0—9，粗国界另一侧的格子不计入。",
    "rules.controlsLabel": "操作说明",
    "rules.bright": "亮格工具：点击／轻触／Enter，或按 1",
    "rules.dark": "暗格工具：点击／轻触；也可右键、Shift+点击，或按 2",
    "rules.erase": "擦除工具：点击／轻触；也可按 Delete，或按 3",
    "rules.drag": "鼠标／笔：按住拖过多个格子；整笔只占一次撤销",
    "rules.hint": "提示：强高亮数字，弱高亮其有效范围",
    "tools.label": "棋盘工具",
    "tools.bright": "亮格",
    "tools.dark": "暗格",
    "tools.erase": "擦除",
    "history.label": "操作历史",
    "tutorial.kicker": "练习页",
    "actions.hint": "给我一个必然步骤",
    "actions.check": "检查当前推理",
    "actions.clearErrors": "清除错误答案",
    "actions.undo": "撤销",
    "actions.redo": "重做",
    "actions.reset": "重新开局",
    "actions.archiveEmpty": "地图档案尚未整理",
    "archive.countInitial": "已归档国家数",
    "stats.label": "关卡统计",
    "stats.regions": "国家",
    "stats.cells": "格数",
    "stats.clues": "可见线索",
    "stats.proof": "证明",
    "status.initial": "数字已经准备好。你不需要猜，只需要找出下一条必然关系。",
    "banquet.kicker": "晚宴",
    "banquet.initialProgress": "0 / 7 国",
    "banquet.initialHeading": "宾客入席",
    "banquet.initialBody": "长桌已经铺好，盘盏仍空。第一份地图记录正在等待复原。",
    "puzzle.kicker": "未完成的版图",
    "puzzle.heading": "尚未完成的版图",
    "puzzle.description": "20×20 棋盘 · 同一国家内计数 · 每个国家保证唯一解",
    "puzzle.descriptionDynamic": ({ width, height, regions }) => `${width}×${height} 棋盘 · ${regions} 个国家 · 无猜唯一解`,
    "puzzle.boardFor": ({ title }) => `${title}逻辑棋盘`,
    "puzzle.reasoningWaiting": "等待标记",
    "puzzle.progress": "已落笔",
    "puzzle.regionTabsLabel": "国家筛选",
    "puzzle.boardLabel": "瓦罗王的餐桌逻辑棋盘",
    "legend.label": "棋盘图例",
    "legend.clue": "数字线索",
    "legend.border": "国家边界",
    "legend.hint": "提示数字（强）",
    "legend.scope": "有效范围（弱）",
    "board.initial": "先选择一个数字，看看它的 3×3 范围。",
    "footer.prototype": "本地原型 · 无猜 / MINIZINC 唯一性验证",
    "fall.kicker": "亡国记录",
    "fall.defaultTitle": "亡国记录",
    "fall.closeLabel": "关闭亡国故事卡",
    "fall.traceKicker": "留存至今",
    "fall.archiveNote": "关闭后收入亡国档案",
    "fall.confirm": "收起故事卡",
    "archive.kicker": "档案",
    "archive.heading": "亡国档案",
    "archive.closeLabel": "关闭亡国档案",
    "archive.intro": "已经复原的国家会留在这里。重读档案不会改变晚宴进度。",
    "archive.empty": "尚无国家完成。第一份档案仍未打开。",
    "levelBook.button": "关卡册",
    "levelBook.kicker": "地图册",
    "levelBook.heading": "征途诸页",
    "levelBook.closeLabel": "关闭关卡册",
    "levelBook.intro": "完成一页，才会解封下一页；每张棋盘各自保存进度。",
    "levelBook.progress": ({ completed, total }) => `已完成 ${completed} / ${total}`,
    "levelBook.difficulty.tutorial": "教学",
    "levelBook.difficulty.standard": "标准",
    "levelBook.difficulty.advanced": "高级",
    "levelBook.status.complete": "已完成",
    "levelBook.status.current": "当前",
    "levelBook.status.locked": "未解锁",
    "levelBook.status.open": "可进入",
    "levelBook.entryAria": ({ title, size, difficulty, status }) => `${title}，${size}，${difficulty}，${status}`,
    "completion.kicker": "本页完成",
    "completion.defaultTitle": "这张版图已经完成",
    "completion.defaultBody": "下一页已经加入关卡册。",
    "completion.closeLabel": "关闭完成提示",
    "completion.openBook": "打开关卡册",
    "completion.next": "继续下一页",
    "epilogue.kicker": "地图作证",
    "epilogue.defaultEyebrow": "后世档案 · 内海七国",
    "epilogue.defaultTitle": "地图比帝国活得更久",
    "epilogue.closeLabel": "关闭后世尾声",
    "epilogue.traceKicker": "留存的地图",
    "epilogue.archiveNote": "关闭后收入地图档案",
    "epilogue.confirm": "合上档案",
    "state.bright": "亮格",
    "state.dark": "暗格",
    "state.unknown": "未知",
    "coordinate.cell": ({ row, column }) => `第${row}行第${column}列`,
    "tabs.all": "整页",
    "tabs.completed": "已完成",
    "tabs.advanced": "高级",
    "cell.noClue": "没有数字线索",
    "cell.clue": ({ clue }) => `线索 ${clue}`,
    "cell.hintStrong": "当前提示数字，强高亮",
    "cell.hintScope": "当前提示范围，弱高亮",
    "cell.aria": ({ region, row, column, clue, value, hint }) =>
      `${region}，第 ${row} 行第 ${column} 列，${clue}，当前${value}${hint ? `，${hint}` : ""}`,
    "cell.countryArchived": "该国已经完成并收入档案",
    "cell.countryStoryOpen": "该国已经完成，历史记录正在展示",
    "cell.practiceCompleted": "这个练习区域已经完成",
    "cell.completedAria": ({ base, status }) => `${base}，${status}`,
    "proof.complete": "已完成",
    "proof.unique": "唯一已证",
    "reasoning.conflict": "先处理矛盾",
    "reasoning.complete": "本页完成",
    "reasoning.basic": "基础提示可用",
    "reasoning.stalled": "暂无基础提示",
    "logic.directContradiction": ({ clueValue, remaining, unknownCount }) =>
      `线索 ${clueValue} 还需要 ${remaining} 个亮格，但只剩 ${unknownCount} 个未知格。`,
    "logic.solverContradiction": ({ remaining, unknownCount }) =>
      `线索需要 ${remaining} 个亮格，但只剩 ${unknownCount} 个未知格。`,
    "logic.overlapContradiction": "两条重叠线索推出了矛盾。",
    "logic.noDirectStep": "当前没有可以由单个数字直接结算的范围。",
    "logic.directDark": "这条数字线索已经不再需要亮格，范围内所有未知格都必为暗格。",
    "logic.directBright": "这条数字线索所需的亮格数等于未知格数，范围内所有未知格都必为亮格。",
    "logic.advancedDark": "高级推理：通过重叠线索的差集得到约束；剩余亮格数为 0，未知格必为暗格。",
    "logic.advancedBright": "高级推理：通过重叠线索的差集得到约束；剩余亮格数等于未知格数，未知格必为亮格。",
    "logic.basicDark": "剩余亮格数为 0，未知格必为暗格。",
    "logic.basicBright": "剩余亮格数等于未知格数，未知格必为亮格。",
    "logic.regionContradiction": ({ region, detail }) => `${region}：${detail}`,
    "message.moveContradiction": ({ reason }) => `${reason} 橙色边框标出了受影响的国家。`,
    "message.moveContradictionFallback": "这一步让某个数字超出可能范围。",
    "message.countryCompleted": ({ country }) => `${country}的版图已经完整复原。一份新的历史记录正在展开。`,
    "message.countryFallback": "这个国家",
    "message.recordUpdated": "记录已更新。需要时可以让提示器寻找下一条必然关系。",
    "message.undoDone": "已撤销上一步。",
    "message.redoDone": "已重做下一步。",
    "message.practiceRegionCompleted": "这个练习区域已经完整解开，可以继续处理其余区域。",
    "message.tutorialCompleted": "这张练习页已经完成，下一页现已解锁。",
    "message.hintConflict": ({ reason }) => `${reason} 先把橙色边框附近的标记改回未知。`,
    "message.boardConflictFallback": "当前盘面有矛盾。",
    "message.hintStopsAtConflict": "提示器不会跨过矛盾替你猜。",
    "message.hintFound": ({ country, coordinate, clue }) => `${country} · 基础提示：请看${coordinate}的数字 ${clue}。`,
    "message.hintScope": "粗橙框是提示数字；弱橙框是它在同一国家内的有效 3×3 范围。只根据这个数字就能处理整个高亮范围。",
    "message.pageSolved": "这一页已经被完整解开。",
    "message.allRegionsSolved": "所有国家都通过了确定性推导。",
    "message.noDirectBoard": "当前盘面暂时没有能由单个数字直接结算的范围。",
    "message.noDirectRegion": "当前国家暂时没有能由单个数字直接结算的范围。",
    "message.noAdvancedHint": "提示不会悄悄升级成双线索作差；继续落笔，或切换到另一个国家。",
    "message.checkConflict": ({ reason }) => `${reason} 橙色边框所在国家里，至少有一个标记与数字范围冲突。`,
    "message.conflictFallback": "发现矛盾。",
    "message.returnUnknown": "把可疑标记改回未知，再继续推理。",
    "message.completed": "完成。每个国家都被纯逻辑解开，且题面只有这一组答案。",
    "message.mapRestored": "瓦罗王的第一张版图，已经复原。",
    "message.checkRemaining": ({ remaining }) => `没有发现矛盾，还有 ${remaining} 格未知。继续找 0 或“剩余数等于未知数”的线索。`,
    "message.checkPassed": "检查通过：目前的标记仍然可能成立。",
    "message.cleanupUnavailable": "当前关卡无法重建完整答案，不能安全地清除错误标记。",
    "message.boardUnchanged": "题面保持不变。",
    "message.cleanupDone": ({ count }) => `已清除 ${count} 个错误标记；正确标记和未知格均保持不变。`,
    "message.cleanupContinue": "错误答案已全部移除，可以从当前正确进度继续。",
    "message.cleanupNone": "当前没有错误标记，无需清除。",
    "message.noBoardChange": "棋盘没有发生变化。",
    "message.reset": "棋盘已清空。你不需要猜，只需要找出下一条必然关系。",
    "message.loadFailed": "关卡文件没有载入。请使用本地静态服务器打开 web/ 目录。",
    "message.catalogLoadFailed": "关卡册没有载入。请使用本地静态服务器打开 web/ 目录。",
    "message.loadingLevel": ({ level }) => `正在展开《${level}》……`,
    "message.serveExample": "例如：python -m http.server 4173 --directory web",
    "banquet.progress": ({ completed, total }) => `${completed} / ${total} 国`,
    "banquet.missingTitle": "宴席未载入",
    "banquet.missingBody": "这页档案没有保存宴席记录。",
    "archive.replayCountry": ({ country, title }) => `重读${country}亡国档案：${title}`,
    "archive.replayEpilogue": ({ summary }) => `重读后世尾声：${summary}`,
    "archive.buttonEmpty": "地图档案尚未整理",
    "archive.buttonComplete": "查看完整地图档案",
    "archive.buttonRecords": "查看亡国档案",
    "archive.countWithEpilogue": ({ count }) => `已归档 ${count} 个国家及后世尾声`,
    "archive.countCountries": ({ count }) => `已归档 ${count} 个国家`,
  },
  en: {
    "meta.title": "King Varo's Table · Logic Prototype",
    "meta.levelTitle": ({ level }) => `${level} · King Varo's Table`,
    "brand.eyebrow": "KING VARO'S TABLE / LOGIC ATLAS",
    "brand.title": "King Varo's Table",
    "brand.loadingSubtitle": "Unfolding an unfinished map…",
    "folio.label": "Current map number",
    "language.label": "Language",
    "language.zhCN": "Switch to Simplified Chinese",
    "language.en": "Switch to English",
    "rules.kicker": "THE RULE",
    "rules.heading": "Let the numbers speak.",
    "rules.lede": "Each number counts the bright cells in its centered area of up to 3×3 cells, including the numbered cell itself and only cells in the same country. Bright and dark cells differ by color alone; clues range from 0 to 9, and cells beyond a thick border never count.",
    "rules.controlsLabel": "Controls",
    "rules.bright": "Bright tool: click, tap, Enter, or 1",
    "rules.dark": "Dark tool: click, tap, right-click, Shift+click, or 2",
    "rules.erase": "Erase tool: click, tap, Delete, or 3",
    "rules.drag": "Mouse / pen: hold and drag across cells; one stroke undoes as one step",
    "rules.hint": "Hint: strong outline for the clue, soft outline for its scope",
    "tools.label": "Board tools",
    "tools.bright": "Bright",
    "tools.dark": "Dark",
    "tools.erase": "Erase",
    "history.label": "Edit history",
    "tutorial.kicker": "PRACTICE LEAF",
    "actions.hint": "Show a certain step",
    "actions.check": "Check my reasoning",
    "actions.clearErrors": "Remove wrong marks",
    "actions.undo": "Undo",
    "actions.redo": "Redo",
    "actions.reset": "Start over",
    "actions.archiveEmpty": "Map archive not yet compiled",
    "archive.countInitial": "Archived country count",
    "stats.label": "Level statistics",
    "stats.regions": "Countries",
    "stats.cells": "Cells",
    "stats.clues": "Visible clues",
    "stats.proof": "Proof",
    "status.initial": "The numbers are ready. You do not need to guess—only find the next certainty.",
    "banquet.kicker": "THE BANQUET",
    "banquet.initialProgress": "0 / 7 countries",
    "banquet.initialHeading": "The Guests Take Their Seats",
    "banquet.initialBody": "The long table is laid, but every dish is empty. The first map record awaits restoration.",
    "puzzle.kicker": "THE UNFINISHED MAP",
    "puzzle.heading": "The Unfinished Map",
    "puzzle.description": "20×20 board · Counts stay within each country · Every country has a unique solution",
    "puzzle.descriptionDynamic": ({ width, height, regions }) => `${width}×${height} board · ${regions} ${regions === 1 ? "country" : "countries"} · unique and no-guess`,
    "puzzle.boardFor": ({ title }) => `${title} logic board`,
    "puzzle.reasoningWaiting": "Awaiting marks",
    "puzzle.progress": "Marked",
    "puzzle.regionTabsLabel": "Country filter",
    "puzzle.boardLabel": "King Varo's Table logic board",
    "legend.label": "Board legend",
    "legend.clue": "Number clue",
    "legend.border": "Country border",
    "legend.hint": "Hint clue (strong)",
    "legend.scope": "Effective scope (soft)",
    "board.initial": "Choose a number and inspect its 3×3 area.",
    "footer.prototype": "LOCAL PROTOTYPE · NO GUESS / UNIQUE BY MINIZINC",
    "fall.kicker": "THE FALL RECORD",
    "fall.defaultTitle": "Record of a Fall",
    "fall.closeLabel": "Close the fall record",
    "fall.traceKicker": "SURVIVING TRACE",
    "fall.archiveNote": "Closing adds this record to the archive",
    "fall.confirm": "Put away the record",
    "archive.kicker": "THE ARCHIVE",
    "archive.heading": "Records of the Fallen",
    "archive.closeLabel": "Close the archive",
    "archive.intro": "Restored countries remain here. Rereading a record does not advance the banquet.",
    "archive.empty": "No country is complete. The first record remains sealed.",
    "levelBook.button": "LEVEL BOOK",
    "levelBook.kicker": "THE MAP BOOK",
    "levelBook.heading": "Leaves of the Campaign",
    "levelBook.closeLabel": "Close the level book",
    "levelBook.intro": "Complete each leaf to unseal the next. Every board keeps its own progress.",
    "levelBook.progress": ({ completed, total }) => `${completed} / ${total} complete`,
    "levelBook.difficulty.tutorial": "Tutorial",
    "levelBook.difficulty.standard": "Standard",
    "levelBook.difficulty.advanced": "Advanced",
    "levelBook.status.complete": "Complete",
    "levelBook.status.current": "Current",
    "levelBook.status.locked": "Locked",
    "levelBook.status.open": "Open",
    "levelBook.entryAria": ({ title, size, difficulty, status }) => `${title}, ${size}, ${difficulty}, ${status}`,
    "completion.kicker": "LEAF COMPLETE",
    "completion.defaultTitle": "This map is complete",
    "completion.defaultBody": "The next leaf has been added to the level book.",
    "completion.closeLabel": "Close the completion notice",
    "completion.openBook": "Open level book",
    "completion.next": "Continue to next leaf",
    "epilogue.kicker": "THE MAP BEARS WITNESS",
    "epilogue.defaultEyebrow": "Later archive · Seven Kingdoms of the Inner Sea",
    "epilogue.defaultTitle": "The Map Outlived the Empire",
    "epilogue.closeLabel": "Close the historical epilogue",
    "epilogue.traceKicker": "THE SURVIVING MAP",
    "epilogue.archiveNote": "Closing adds the epilogue to the map archive",
    "epilogue.confirm": "Close the archive",
    "state.bright": "bright",
    "state.dark": "dark",
    "state.unknown": "unknown",
    "coordinate.cell": ({ row, column }) => `row ${row}, column ${column}`,
    "tabs.all": "Full map",
    "tabs.completed": "Complete",
    "tabs.advanced": "Advanced",
    "cell.noClue": "no number clue",
    "cell.clue": ({ clue }) => `clue ${clue}`,
    "cell.hintStrong": "current hint clue, strongly highlighted",
    "cell.hintScope": "current hint scope, softly highlighted",
    "cell.aria": ({ region, row, column, clue, value, hint }) =>
      `${region}, row ${row}, column ${column}, ${clue}, currently ${value}${hint ? `, ${hint}` : ""}`,
    "cell.countryArchived": "this country is complete and archived",
    "cell.countryStoryOpen": "this country is complete and its record is being shown",
    "cell.practiceCompleted": "this practice region is complete",
    "cell.completedAria": ({ base, status }) => `${base}, ${status}`,
    "proof.complete": "Complete",
    "proof.unique": "Unique",
    "reasoning.conflict": "Resolve conflict",
    "reasoning.complete": "Map complete",
    "reasoning.basic": "Basic hint available",
    "reasoning.stalled": "No basic hint",
    "logic.directContradiction": ({ clueValue, remaining, unknownCount }) =>
      `Clue ${clueValue} still needs ${remaining} bright cells, but only ${unknownCount} unknown cells remain.`,
    "logic.solverContradiction": ({ remaining, unknownCount }) =>
      `The clue needs ${remaining} bright cells, but only ${unknownCount} unknown cells remain.`,
    "logic.overlapContradiction": "Two overlapping clues imply a contradiction.",
    "logic.noDirectStep": "No area can currently be settled from one number alone.",
    "logic.directDark": "This clue needs no more bright cells, so every unknown cell in its area must be dark.",
    "logic.directBright": "This clue needs as many bright cells as there are unknown cells, so every unknown cell in its area must be bright.",
    "logic.advancedDark": "Advanced reasoning: subtracting overlapping clue sets leaves a requirement of zero bright cells, so every unknown cell must be dark.",
    "logic.advancedBright": "Advanced reasoning: subtracting overlapping clue sets leaves as many required bright cells as unknown cells, so every unknown cell must be bright.",
    "logic.basicDark": "No bright cells remain to be placed, so every unknown cell must be dark.",
    "logic.basicBright": "The required bright count equals the unknown count, so every unknown cell must be bright.",
    "logic.regionContradiction": ({ region, detail }) => `${region}: ${detail}`,
    "message.moveContradiction": ({ reason }) => `${reason} The orange border marks the affected country.`,
    "message.moveContradictionFallback": "That move puts a clue outside its possible range.",
    "message.countryCompleted": ({ country }) => `${country} has been fully restored. A new historical record is unfolding.`,
    "message.countryFallback": "This country",
    "message.recordUpdated": "The record is updated. Ask for a hint whenever you want the next certain relation.",
    "message.undoDone": "Undid the last move.",
    "message.redoDone": "Redid the next move.",
    "message.practiceRegionCompleted": "This practice region is complete. Continue with the remaining regions.",
    "message.tutorialCompleted": "This practice leaf is complete. The next leaf is now unlocked.",
    "message.hintConflict": ({ reason }) => `${reason} Return the marks near the orange border to unknown first.`,
    "message.boardConflictFallback": "The current board contains a contradiction.",
    "message.hintStopsAtConflict": "The hint system will not guess past a contradiction.",
    "message.hintFound": ({ country, coordinate, clue }) => `${country} · Basic hint: inspect clue ${clue} at ${coordinate}.`,
    "message.hintScope": "The thick orange outline marks the clue; the soft outline marks its effective 3×3 area inside this country. That number alone settles the entire highlighted area.",
    "message.pageSolved": "This map is already complete.",
    "message.allRegionsSolved": "Every country was resolved by deterministic deduction.",
    "message.noDirectBoard": "The current board has no area that one number can settle directly.",
    "message.noDirectRegion": "The selected country has no area that one number can settle directly.",
    "message.noAdvancedHint": "Hints do not silently escalate to subtracting two clues. Keep marking cells or choose another country.",
    "message.checkConflict": ({ reason }) => `${reason} At least one mark inside the orange-bordered country conflicts with a clue area.`,
    "message.conflictFallback": "A contradiction was found.",
    "message.returnUnknown": "Return the suspect marks to unknown, then continue.",
    "message.completed": "Complete. Every country was solved by logic, and the clues admit only this answer.",
    "message.mapRestored": "King Varo's first map has been restored.",
    "message.checkRemaining": ({ remaining }) => `No contradiction found; ${remaining} cells remain unknown. Look for a 0 or a clue whose remaining count equals its unknown cells.`,
    "message.checkPassed": "Check passed: the current marks can still be correct.",
    "message.cleanupUnavailable": "The full answer cannot be reconstructed for this level, so wrong marks cannot be removed safely.",
    "message.boardUnchanged": "The board was left unchanged.",
    "message.cleanupDone": ({ count }) => `${count} wrong ${count === 1 ? "mark was" : "marks were"} removed; correct marks and unknown cells were preserved.`,
    "message.cleanupContinue": "All wrong marks are gone. Continue from the remaining correct progress.",
    "message.cleanupNone": "There are no wrong marks to remove.",
    "message.noBoardChange": "The board did not change.",
    "message.reset": "The board is clear. You do not need to guess—only find the next certainty.",
    "message.loadFailed": "The level file did not load. Open the web/ directory through a local static server.",
    "message.catalogLoadFailed": "The level book did not load. Open the web/ directory through a local static server.",
    "message.loadingLevel": ({ level }) => `Unfolding “${level}”…`,
    "message.serveExample": "For example: python -m http.server 4173 --directory web",
    "banquet.progress": ({ completed, total }) => `${completed} / ${total} ${total === 1 ? "country" : "countries"}`,
    "banquet.missingTitle": "Banquet unavailable",
    "banquet.missingBody": "This archive page contains no banquet record.",
    "archive.replayCountry": ({ country, title }) => `Reread the fall of ${country}: ${title}`,
    "archive.replayEpilogue": ({ summary }) => `Reread the historical epilogue: ${summary}`,
    "archive.buttonEmpty": "Map archive not yet compiled",
    "archive.buttonComplete": "Open the complete map archive",
    "archive.buttonRecords": "Open the fall records",
    "archive.countWithEpilogue": ({ count }) => `${count} ${count === 1 ? "country" : "countries"} and the epilogue archived`,
    "archive.countCountries": ({ count }) => `${count} ${count === 1 ? "country" : "countries"} archived`,
  },
};

function interpolate(template, params) {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key) =>
    Object.hasOwn(params, key) ? String(params[key]) : match,
  );
}

export function normalizeLocale(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "zh-cn" || normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-CN";
  }
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return null;
}

export function detectBrowserLocale(languages = []) {
  const candidates = Array.isArray(languages) ? languages : [languages];
  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }
  return FALLBACK_LOCALE;
}

export function preferredLocale(storage, languages = []) {
  try {
    const stored = normalizeLocale(storage?.getItem(LOCALE_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    // Storage may be unavailable for local files or strict privacy settings.
  }
  return detectBrowserLocale(languages);
}

export function persistLocale(storage, locale) {
  const normalized = normalizeLocale(locale);
  if (!normalized) return false;
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, normalized);
    return true;
  } catch {
    return false;
  }
}

export function bundleKeys(locale) {
  const normalized = normalizeLocale(locale);
  return normalized ? Object.keys(bundles[normalized]).sort() : [];
}

export function createI18n(initialLocale = FALLBACK_LOCALE) {
  let locale = normalizeLocale(initialLocale) ?? FALLBACK_LOCALE;

  return {
    get locale() {
      return locale;
    },
    setLocale(nextLocale) {
      const normalized = normalizeLocale(nextLocale);
      if (!normalized) return false;
      locale = normalized;
      return true;
    },
    t(key, params = {}) {
      const entry = bundles[locale][key] ?? bundles[FALLBACK_LOCALE][key];
      if (entry === undefined) return key;
      if (typeof entry === "function") return entry(params);
      return interpolate(entry, params);
    },
    localize(value) {
      if (typeof value === "string") return value;
      if (!value || typeof value !== "object") return "";
      return value[locale] ?? value[FALLBACK_LOCALE] ?? value["zh-CN"] ?? "";
    },
  };
}

export function applyDocumentTranslations(root, i18n) {
  for (const element of root.querySelectorAll("[data-i18n]")) {
    element.textContent = i18n.t(element.dataset.i18n);
  }
  for (const element of root.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", i18n.t(element.dataset.i18nAriaLabel));
  }
  for (const element of root.querySelectorAll("[data-i18n-title]")) {
    element.setAttribute("title", i18n.t(element.dataset.i18nTitle));
  }
  const documentElement = root.documentElement ?? root.ownerDocument?.documentElement;
  if (documentElement) documentElement.lang = i18n.locale;
}
