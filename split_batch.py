"""ナレーションを何本分かまとめて作ったとき用。
  python3 split_batch.py text <slug1> <slug2> ...        → まとめて読ませる文（AI Studio に貼る）を出す
  python3 split_batch.py split <in.wav> <slug1> <slug2> ... → 音声を1行ずつに切って、それぞれの <slug>/lines/N_xx.wav に入れる
切り方は split2.py と同じ（無音の候補から、台本の文字数に合う切れ目を動的計画法で選ぶ）。"""
import sys, wave, json, pathlib, re
import numpy as np

root = pathlib.Path(__file__).parent

def ntexts(slug):
    return [l['text'] for l in json.load(open(root / slug / 'narration.json'))['lines'] if l['who'] == 'N']

def cut(src, texts):
    n = len(texts)
    w = wave.open(src); sr = w.getframerate(); raw = w.readframes(w.getnframes()); w.close()
    a = np.frombuffer(raw, dtype='<i2').astype(np.float32); a /= np.abs(a).max() + 1e-9
    hop = int(sr * 0.01); fr = len(a) // hop
    db = 20 * np.log10(np.sqrt(np.mean(a[:fr * hop].reshape(fr, hop) ** 2, axis=1) + 1e-12))
    quiet = db < db.max() - 40
    runs, i = [], 0
    while i < fr:
        if quiet[i]:
            j = i
            while j < fr and quiet[j]: j += 1
            if i > 0 and j < fr and j - i >= 18: runs.append((i, j))
            i = j
        else: i += 1
    voiced = np.where(~quiet)[0]; v0, v1 = voiced[0], voiced[-1] + 1
    weight = lambda s: max(1, len(re.sub(r'[、。「」！？…・\s]', '', s)))
    W = np.array([weight(t) for t in texts], float)
    cv = np.concatenate([[0], np.cumsum(~quiet)])
    rate = (cv[v1] - cv[v0]) / W.sum()
    cand = [(s + e) / 2 for s, e in runs]; glen = [e - s for s, e in runs]
    m = len(cand); pts = [v0] + cand + [v1]
    INF = 1e18
    dp = np.full((n + 1, m + 2), INF); bk = np.zeros((n + 1, m + 2), int); dp[0][0] = 0
    for k in range(1, n + 1):
        for j in (range(k, m + 1) if k < n else [m + 1]):
            best, arg = INF, -1
            for p in range(0, j):
                if dp[k - 1][p] >= INF: continue
                seg = cv[int(pts[j])] - cv[int(pts[p])]
                r = np.log((seg + 20) / (W[k - 1] * rate + 20))
                c = 60 * r * r - (min(glen[j - 1], 160) * 0.35 if j <= m else 0)
                if dp[k - 1][p] + c < best: best, arg = dp[k - 1][p] + c, p
            dp[k][j], bk[k][j] = best, arg
    path, j = [], m + 1
    for k in range(n, 0, -1): path.append(j); j = bk[k][j]
    path = [0] + path[::-1]
    clips, info = [], []
    for k in range(n):
        s, e = int(pts[path[k]]), int(pts[path[k + 1]])
        seg = ~quiet[s:e]
        s2 = s + int(np.argmax(seg)); e2 = s + len(seg) - int(np.argmax(seg[::-1]))
        s2 = max(s, s2 - 4); e2 = min(e, e2 + 8)
        y = a[s2 * hop:e2 * hop].copy()
        f = min(len(y), int(sr * 0.01)); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
        clips.append(y)
        info.append((round(len(y) / sr, 2), round(float(W[k] * rate / 100), 2), texts[k][:16]))
    cuts = [(round(pts[j] / 100, 2), glen[j - 1]) for j in path[1:-1]]
    return sr, clips, info, cuts

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'text':
        print(' <long pause> '.join(t for s in sys.argv[2:] for t in ntexts(s)))
    elif mode == 'split':
        src, slugs = sys.argv[2], sys.argv[3:]
        groups = [(s, ntexts(s)) for s in slugs]
        sr, clips, info, cuts = cut(src, [t for _, ts in groups for t in ts])
        k = 0
        for s, ts in groups:
            out = root / s / 'lines'; out.mkdir(exist_ok=True)
            for old in out.glob('N_*.wav'): old.unlink()
            print(f'== {s}')
            for i in range(len(ts)):
                with wave.open(str(out / f'N_{i:02d}.wav'), 'wb') as o:
                    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
                    o.writeframes((clips[k] * 0.95 * 32767).astype('<i2').tobytes())
                print(info[k]); k += 1
        print('cuts', cuts)
        short = [c for c in cuts if c[1] < 35]
        print('短い無音で切った所:', short if short else 'なし')
