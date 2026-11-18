"""1つの音声を、無音のすき間で N 行に切り分ける。
python3 split.py in.wav N prefix   →  lines/prefix_00.wav ... と長さを表示
いちばん長い無音 N-1 か所で切るので、行のあいだに <long pause> を入れて作った音声に向く。"""
import sys, wave, json, pathlib
import numpy as np

src, n, prefix = sys.argv[1], int(sys.argv[2]), sys.argv[3]
out = pathlib.Path(__file__).parent / "lines"; out.mkdir(exist_ok=True)
w = wave.open(src); sr = w.getframerate(); ch = w.getnchannels(); sw = w.getsampwidth()
raw = w.readframes(w.getnframes()); w.close()
a = np.frombuffer(raw, dtype={2: '<i2', 4: '<i4'}[sw]).astype(np.float32)
if ch > 1: a = a.reshape(-1, ch).mean(1)
a /= np.abs(a).max() + 1e-9
hop = int(sr * 0.01)
fr = len(a) // hop
rms = np.sqrt(np.mean(a[:fr * hop].reshape(fr, hop) ** 2, axis=1) + 1e-12)
db = 20 * np.log10(rms)
thr = max(db.max() - 42, np.percentile(db, 10) + 6)
quiet = db < thr
# 無音の連続区間
runs, i = [], 0
while i < fr:
    if quiet[i]:
        j = i
        while j < fr and quiet[j]: j += 1
        runs.append((i, j)); i = j
    else: i += 1
inner = [r for r in runs if r[0] > 0 and r[1] < fr]
cuts = sorted(sorted(inner, key=lambda r: r[1] - r[0], reverse=True)[:n - 1])
if len(cuts) < n - 1: sys.exit(f"無音が足りません: {len(cuts)} / {n-1}")
bounds = [0] + [(s + e) // 2 for s, e in cuts] + [fr]
info = []
for k in range(n):
    s, e = bounds[k], bounds[k + 1]
    seg = ~quiet[s:e]
    if seg.any():
        s2 = s + int(np.argmax(seg)); e2 = s + len(seg) - int(np.argmax(seg[::-1]))
    else: s2, e2 = s, e
    s2 = max(s, s2 - 4); e2 = min(e, e2 + 8)
    y = a[s2 * hop:e2 * hop]
    fade = min(len(y), int(sr * 0.01))
    if fade: y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
    p = out / f"{prefix}_{k:02d}.wav"
    with wave.open(str(p), 'wb') as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
        o.writeframes((y * 0.95 * 32767).astype('<i2').tobytes())
    info.append(round(len(y) / sr, 3))
gaps = [round((e - s) * 0.01, 2) for s, e in cuts]
print(json.dumps({"prefix": prefix, "durations": info, "cut_gaps": gaps}, ensure_ascii=False))
