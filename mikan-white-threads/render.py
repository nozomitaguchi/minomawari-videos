"""場面ごとに mp4 を書き出す。 python3 render.py [場面番号...]"""
import sys, subprocess, pathlib, os
from multiprocessing import Pool
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).parent
import os
SCALE = int(os.environ.get("SCALE", "1"))
outdir = here / ("parts" if SCALE == 1 else f"parts{SCALE}x"); outdir.mkdir(exist_ok=True)
FPS = 30

def render(i):
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=SCALE)
        pg.goto((here / "video.html").as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
        dur = pg.evaluate(f"sceneDur({i})")
        tmp = outdir / f"part{i:02d}.tmp.mp4"
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                               "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-r", str(FPS), str(tmp)], stdin=subprocess.PIPE)
        for f in range(int(round(dur * FPS))):
            pg.evaluate(f"show({i},{f / FPS})")
            pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))")  # 描き終わるのを待つ（コマが欠けるのを防ぐ）
            ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
        ff.stdin.close(); rc = ff.wait(); b.close()
        if rc == 0: os.replace(tmp, outdir / f"part{i:02d}.mp4")
        return i, rc

if __name__ == "__main__":
    import json, re
    DUR = [s['dur'] for s in json.loads(re.sub(r'^window.TL = |;\s*$', '', open(here / 'timeline.js').read()))['scenes']]
    idx = [int(a) for a in sys.argv[1:]] or list(range(len(DUR)))
    # 長い場面から先に
    with Pool(2) as pool:
        for r in pool.imap_unordered(render, sorted(idx, key=lambda i: -DUR[i])):
            print("done", r, flush=True)
