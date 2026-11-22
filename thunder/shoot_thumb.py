"""thumb.html の drawThumb() を撮って brand/thumb.jpg（1280×720）にする。 python3 shoot_thumb.py"""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
here = pathlib.Path(__file__).parent
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((here / 'thumb.html').as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    pg.evaluate("drawThumb()"); pg.screenshot(path=str(here / 'brand' / 'thumb_full.png')); b.close()
Image.open(here / 'brand' / 'thumb_full.png').convert('RGB').resize((1280, 720), Image.LANCZOS).save(here / 'brand' / 'thumb.jpg', quality=90)
print('ok')
