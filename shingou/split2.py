"""無音の候補から、台本の文字数に合う切れ目を動的計画法で選んで N 行に切り分ける。
python3 split2.py in.wav WHO   （WHO = N/S/B/K、narration.json の順に並ぶ行）"""
import sys, wave, json, pathlib, re
import numpy as np

src, who = sys.argv[1], sys.argv[2]
here = pathlib.Path(__file__).parent
texts = [l['text'] for l in json.load(open(here / 'narration.json'))['lines'] if l['who'] == who]
n = len(texts)
out = here / "lines"; out.mkdir(exist_ok=True)
w = wave.open(src); sr = w.getframerate(); raw = w.readframes(w.getnframes()); w.close()
a = np.frombuffer(raw, dtype='<i2').astype(np.float32); a /= np.abs(a).max() + 1e-9
hop = int(sr * 0.01); fr = len(a) // hop
db = 20 * np.log10(np.sqrt(np.mean(a[:fr * hop].reshape(fr, hop) ** 2, axis=1) + 1e-12))
thr = db.max() - 40
quiet = db < thr
runs, i = [], 0
while i < fr:
    if quiet[i]:
        j = i
        while j < fr and quiet[j]: j += 1
        if i > 0 and j < fr and j - i >= 18: runs.append((i, j))
        i = j
    else: i += 1
# 話している部分の始まりと終わり
voiced = np.where(~quiet)[0]; v0, v1 = voiced[0], voiced[-1] + 1
weight = lambda s: max(1, len(re.sub(r'[、。「」！？…・\s]', '', s)))
W = np.array([weight(t) for t in texts], float)
cv = np.concatenate([[0], np.cumsum(~quiet)])
rate = (cv[v1] - cv[v0]) / W.sum()
cand = [(s + e) / 2 for s, e in runs]; glen = [e - s for s, e in runs]
m = len(cand)
pts = [v0] + cand + [v1]
INF = 1e18
# dp[k][j]: k 行目までを候補 j で終える最小コスト
dp = np.full((n + 1, m + 2), INF); bk = np.zeros((n + 1, m + 2), int)
dp[0][0] = 0
for k in range(1, n + 1):
    js = range(1, m + 1) if k < n else [m + 1]
    for j in js:
        best, arg = INF, -1
        for p in range(0, j):
            if dp[k - 1][p] >= INF: continue
            seg = cv[int(pts[j])] - cv[int(pts[p])]
            exp = W[k - 1] * rate
            r = np.log((seg + 20) / (exp + 20))
            c = 60 * r * r - (min(glen[j - 1], 160) * 0.35 if j <= m else 0)
            if dp[k - 1][p] + c < best: best, arg = dp[k - 1][p] + c, p
        dp[k][j], bk[k][j] = best, arg
path, j = [], m + 1
for k in range(n, 0, -1): path.append(j); j = bk[k][j]
path = [0] + path[::-1]
info = []
for k in range(n):
    s, e = int(pts[path[k]]), int(pts[path[k + 1]])
    seg = ~quiet[s:e]
    s2 = s + int(np.argmax(seg)); e2 = s + len(seg) - int(np.argmax(seg[::-1]))
    s2 = max(s, s2 - 4); e2 = min(e, e2 + 8)
    y = a[s2 * hop:e2 * hop].copy()
    f = min(len(y), int(sr * 0.01)); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    with wave.open(str(out / f"{who}_{k:02d}.wav"), 'wb') as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
        o.writeframes((y * 0.95 * 32767).astype('<i2').tobytes())
    info.append((round(len(y) / sr, 2), round(W[k] * rate / 100, 2), texts[k][:16]))
for d in info: print(d)
