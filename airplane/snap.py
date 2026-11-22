"""指定した (場面, 秒) のコマを実寸で撮る。 python3 snap.py 0:10 3:17 ..."""
import sys, pathlib
from playwright.sync_api import sync_playwright

here = pathlib.Path(__file__).parent
out = here / "snaps"
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((here / "video.html").as_uri())
    pg.wait_for_timeout(300)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    for arg in sys.argv[1:]:
        i, t = arg.split(":")
        pg.evaluate(f"show({i},{t})")
        f = out / f"s{i}_{t}.jpg"
        pg.screenshot(path=str(f), type="jpeg", quality=85)
        print(f)
    print("errors:", errs)
    b.close()
