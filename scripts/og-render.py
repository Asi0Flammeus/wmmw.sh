#!/usr/bin/env python3
"""Render the OG cards (spec §5.5): public/og/default-{fr,en,es}.png, 1200 x 630.

Dev only; the PNGs are committed. Source: src/assets/og/og.html, the OG line
from src/i18n/ui.ts (site.ogLine), the line monogram from
docs/moire/explore/moire/monogram.svg. Also writes public/apple-touch-icon.png
(180 x 180, light favicon). Uses QA_CHROMIUM when set.

    python3 scripts/og-render.py
"""
import os
import re
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "src/assets/og/og.html"
MONOGRAM = ROOT / "docs/moire/explore/moire/monogram.svg"
CHROMIUM = os.environ.get("QA_CHROMIUM", "/home/crqpt/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome")


def og_lines() -> dict[str, str]:
    """site.ogLine per locale, read from ui.ts (FR first, then EN, ES)."""
    ui = (ROOT / "src/i18n/ui.ts").read_text(encoding="utf-8")
    found = re.findall(r'ogLine:\s*"([^"]+)"', ui)
    if len(found) != 3:
        raise SystemExit(f"og-render: expected 3 site.ogLine strings in ui.ts, found {len(found)}")
    return dict(zip(["fr", "en", "es"], (s.encode().decode("unicode_escape").encode("latin-1").decode("utf-8") for s in found)))


def main() -> None:
    svg = MONOGRAM.read_text(encoding="utf-8")
    svg = re.sub(r"<title[^>]*>.*?</title>", "", svg)
    svg = re.sub(r"<style>.*?</style>", "<style>.wm-a{fill:var(--mono-a)}.wm-b{fill:var(--mono-b)}.wm-s{fill:var(--mono-s)}</style>", svg)
    template = TEMPLATE.read_text(encoding="utf-8")
    out = ROOT / "public/og"
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROMIUM)
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        for locale, line in og_lines().items():
            html = template.replace("{{LANG}}", locale).replace("{{LINE}}", line).replace("{{MONOGRAM}}", svg)
            with tempfile.NamedTemporaryFile("w", suffix=".html", dir=TEMPLATE.parent, delete=False, encoding="utf-8") as tmp:
                tmp.write(html)
            try:
                page.goto(Path(tmp.name).as_uri())
                page.evaluate("document.fonts.ready")
                page.screenshot(path=str(out / f"default-{locale}.png"))
            finally:
                os.unlink(tmp.name)
            print(f"og-render: public/og/default-{locale}.png")
        icon = browser.new_page(viewport={"width": 180, "height": 180}, device_scale_factor=1, color_scheme="light")
        icon.goto((ROOT / "public/favicon.svg").as_uri())
        icon.screenshot(path=str(ROOT / "public/apple-touch-icon.png"), omit_background=True)
        print("og-render: public/apple-touch-icon.png")
        browser.close()


if __name__ == "__main__":
    main()
