import sys, pathlib
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).parent
kinds = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    for k in kinds:
        w, h = (2560, 1440) if k.startswith('banner') else (800, 800)
        pg = b.new_page(viewport={'width': w, 'height': h}); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto((here / 'brand2.html').as_uri()); pg.wait_for_timeout(300)
        pg.evaluate(f'make("{k}")'); pg.wait_for_timeout(100)
        pg.locator('#s').screenshot(path=str(here / 'brand' / f'{k}.png'))
    print(errs); b.close()
