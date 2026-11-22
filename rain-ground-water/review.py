"""全体を一定間隔で撮って、12コマずつの一覧画像にする。 python3 review.py [間隔秒]"""
import sys, json, re, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
here = pathlib.Path(__file__).parent
step = float(sys.argv[1]) if len(sys.argv) > 1 else 3.0
TL = json.loads(re.sub(r'^window.TL = |;\s*$', '', open(here / 'timeline.js').read()))
shots = []
for i, s in enumerate(TL['scenes']):
    t = 0.6
    while t < s['dur'] - 0.2: shots.append((i, round(t, 1))); t += step
out = here / 'review'; out.mkdir(exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((here / 'video.html').as_uri()); pg.wait_for_timeout(300)
    files = []
    for i, t in shots:
        pg.evaluate(f"show({i},{t})"); f = out / f"s{i:02d}_{t:05.1f}.jpg"; pg.screenshot(path=str(f), type='jpeg', quality=70); files.append(f)
    b.close()
W, H = 640, 360
for k in range(0, len(files), 12):
    S = Image.new('RGB', (W * 3, (H + 24) * 4), 'white'); d = ImageDraw.Draw(S)
    for j, f in enumerate(files[k:k + 12]):
        x, y = (j % 3) * W, (j // 3) * (H + 24)
        S.paste(Image.open(f).resize((W, H)), (x, y)); d.text((x + 4, y + H + 4), f.stem, fill='black')
    S.save(here / f'review_sheet_{k // 12:02d}.jpg', quality=80)
print(len(files), 'frames')
