#!/usr/bin/env python3
"""Screenshot every pairing block of specimen.html to <id>.png (same folder).
usage: python3 shoot_blocks.py [--dpr 1] [--only a,b]
"""
import argparse, asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HERE = Path(__file__).parent
CHROME = "/home/crqpt/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dpr", type=float, default=1)
    ap.add_argument("--only", default="")
    ap.add_argument("--suffix", default="")
    a = ap.parse_args()
    only = set(filter(None, a.only.split(",")))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME)
        ctx = await b.new_context(viewport={"width": 1500, "height": 1000}, device_scale_factor=a.dpr)
        page = await ctx.new_page()
        msgs = []
        page.on("console", lambda m: msgs.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
        await page.goto((HERE / "specimen.html").resolve().as_uri(), wait_until="networkidle")
        await page.wait_for_function("document.documentElement.dataset.ready === '1'", timeout=30000)
        await page.wait_for_timeout(500)
        for sec in await page.query_selector_all("section.pair"):
            sid = await sec.get_attribute("id")
            if only and sid not in only:
                continue
            out = HERE / f"{sid}{a.suffix}.png"
            await sec.screenshot(path=str(out))
            print("wrote", out)
        for m in msgs:
            print(m)
        await b.close()

asyncio.run(main())
