"""できた動画ファイルから一定間隔で静止画を取り出して、12コマずつの一覧にする。
python3 review_video.py <動画.mp4> [間隔秒=3]  → review_video_00.jpg ...（左下に動画の時刻）"""
import sys, subprocess, pathlib, glob, os
from PIL import Image, ImageDraw
here = pathlib.Path(__file__).parent
src = sys.argv[1]; step = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
out = here / 'review_video'; out.mkdir(exist_ok=True)
for f in glob.glob(str(out / '*.jpg')): os.remove(f)
subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps=1/{step},scale=640:360', '-q:v', '4', str(out / 'f_%04d.jpg')], check=True)
files = sorted(out.glob('f_*.jpg'))
for old in here.glob('review_video_*.jpg'): old.unlink()
W, H = 640, 360
for k in range(0, len(files), 12):
    S = Image.new('RGB', (W * 3, (H + 24) * 4), 'white'); d = ImageDraw.Draw(S)
    for j, f in enumerate(files[k:k + 12]):
        x, y = (j % 3) * W, (j // 3) * (H + 24)
        S.paste(Image.open(f), (x, y))
        t = (k + j) * step
        d.text((x + 4, y + H + 4), f'{int(t // 60)}:{t % 60:04.1f}', fill='black')
    S.save(here / f'review_video_{k // 12:02d}.jpg', quality=80)
print(len(files), 'frames ->', (len(files) + 11) // 12, 'sheets')
