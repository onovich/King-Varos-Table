import json
import re
import shutil
import subprocess
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which("node"), "Node.js is required for i18n tests")
class I18nModuleTests(unittest.TestCase):
    def run_node(self, script: str) -> None:
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_locale_detection_persistence_translation_and_key_parity(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  LOCALE_STORAGE_KEY,
  bundleKeys,
  createI18n,
  detectBrowserLocale,
  normalizeLocale,
  persistLocale,
  preferredLocale,
} from "./web/i18n.mjs";

assert.equal(normalizeLocale("zh-TW"), "zh-CN");
assert.equal(normalizeLocale("en-GB"), "en");
assert.equal(normalizeLocale("fr"), null);
assert.equal(detectBrowserLocale(["fr-FR", "zh-Hans"]), "zh-CN");
assert.equal(detectBrowserLocale(["fr-FR"]), "en");
assert.deepEqual(bundleKeys("zh-CN"), bundleKeys("en"));

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
assert.equal(preferredLocale(storage, ["zh-CN"]), "zh-CN");
assert.equal(persistLocale(storage, "en"), true);
assert.equal(values.get(LOCALE_STORAGE_KEY), "en");
assert.equal(preferredLocale(storage, ["zh-CN"]), "en");

const i18n = createI18n("en-US");
assert.equal(i18n.t("actions.hint"), "Show a certain step");
assert.equal(i18n.localize({ en: "Map", "zh-CN": "地图" }), "Map");
i18n.setLocale("zh-CN");
assert.equal(i18n.t("actions.hint"), "给我一个必然步骤");
assert.equal(i18n.localize({ en: "Map", "zh-CN": "地图" }), "地图");
'''
        )

    def test_every_static_html_key_exists_in_both_bundles(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { bundleKeys } from "./web/i18n.mjs";

const html = fs.readFileSync("./web/index.html", "utf8");
const keys = [...html.matchAll(/data-i18n(?:-aria-label|-title)?="([^"]+)"/g)]
  .map((match) => match[1]);
const en = new Set(bundleKeys("en"));
const zh = new Set(bundleKeys("zh-CN"));
assert.ok(keys.length > 40);
for (const key of keys) {
  assert.ok(en.has(key), `missing English key: ${key}`);
  assert.ok(zh.has(key), `missing Chinese key: ${key}`);
}
'''
        )

    def test_every_runtime_translation_key_exists_in_both_bundles(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { bundleKeys } from "./web/i18n.mjs";

const source = ["app.js", "campaign-ui.mjs", "level-book-ui.mjs", "puzzle-logic.mjs"]
  .map((name) => fs.readFileSync(`./web/${name}`, "utf8"))
  .join("\n");
const prefixes = [
  "archive", "banquet", "board", "cell", "coordinate", "epilogue",
  "completion", "fall", "footer", "language", "legend", "levelBook",
  "logic", "message", "meta", "proof", "puzzle", "reasoning", "rules",
  "state", "stats", "tabs", "tutorial",
];
const pattern = new RegExp(`["']((?:${prefixes.join("|")})\\.[A-Za-z0-9.]+)["']`, "g");
const referenced = new Set([...source.matchAll(pattern)].map((match) => match[1]));
const en = new Set(bundleKeys("en"));
const zh = new Set(bundleKeys("zh-CN"));
assert.ok(referenced.size > 50);
for (const key of referenced) {
  assert.ok(en.has(key), `missing English runtime key: ${key}`);
  assert.ok(zh.has(key), `missing Chinese runtime key: ${key}`);
}
'''
        )


class LocalizedLevelContractTests(unittest.TestCase):
    def test_committed_level_contains_complete_english_and_chinese_narrative(self):
        payload = json.loads(
            (PROJECT_ROOT / "web" / "data" / "levels" / "inner-sea.json").read_text(encoding="utf-8")
        )
        locales = {"zh-CN", "en"}

        self.assertEqual(payload["schemaVersion"], 2)
        self.assertEqual(set(payload["title"]), locales)
        self.assertEqual(set(payload["subtitle"]), locales)
        self.assertEqual(set(payload["campaign"]["chapterName"]), locales)
        for beat in payload["campaign"]["banquetTimeline"]:
            self.assertEqual(set(beat["title"]), locales)
            self.assertEqual(set(beat["body"]), locales)
        for value in payload["campaign"]["epilogue"].values():
            self.assertEqual(set(value), locales)
        for region in payload["regions"]:
            self.assertEqual(set(region["name"]), locales)
            for key, value in region["country"].items():
                if key == "countryId":
                    continue
                self.assertEqual(set(value), locales, f"{region['id']}:{key}")

    def test_language_neutral_browser_logic_contains_no_chinese_copy(self):
        chinese = re.compile(r"[\u4e00-\u9fff]")
        for relative_path in (
            "web/app.js",
            "web/campaign-ui.mjs",
            "web/puzzle-logic.mjs",
            "web/hint-proof.mjs",
        ):
            source = (PROJECT_ROOT / relative_path).read_text(encoding="utf-8")
            self.assertIsNone(chinese.search(source), relative_path)
