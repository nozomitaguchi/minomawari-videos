"""切り分けのあとの手直し。次の行の出だし（「正解は」「2番。」「だから、」など）が、前の行のおわりに付いてしまったものを、次の行へ移す。
  python3 fix_lead_in.py <slug1> <slug2> ...   （まとめて作った順に書くと、動画をまたいだ分も直る）
見つけ方：行のおわり近くに長い無音（0.6秒以上）があり、そのあとの声が短く（1.3秒以下）、
その行は文字数のわりに長く、次の行は文字数のわりに短いとき。直した所を表示する。"""
import json, pathlib, sys, wave
import numpy as np

root = pathlib.Path(__file__).parent


def load(path):
    with wave.open(str(path)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768, w.getframerate()


def save(path, audio, sr):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes())


def last_gap(audio, sr):
    win = int(sr * 0.02); n = len(audio) // win
    quiet = np.sqrt((audio[:n * win].reshape(n, win) ** 2).mean(1)) < 0.012
    end = n
    while end > 0 and quiet[end - 1]: end -= 1          # おわりの無音はとばす
    j = end
    while j > 0 and not quiet[j - 1]: j -= 1            # おわりの声の始まり
    i = j
    while i > 0 and quiet[i - 1]: i -= 1                # その前の無音の始まり
    return i * 0.02, j * 0.02, end * 0.02               # 無音の始まり・終わり、声の終わり


def fix(slugs):
    items = []
    for slug in slugs:
        texts = [l['text'] for l in json.load(open(root / slug / 'narration.json'))['lines'] if l['who'] == 'N']
        items += [(slug, i, len(t), root / slug / 'lines' / f'N_{i:02d}.wav') for i, t in enumerate(texts)]
    moved = []
    for (slug, i, chars, path), (slug2, i2, chars2, path2) in zip(items, items[1:]):
        if not (path.exists() and path2.exists()): continue
        a, sr = load(path); b, _ = load(path2)
        g0, g1, end = last_gap(a, sr)
        if g1 - g0 < 0.6 or not 0.3 < end - g1 <= 1.3: continue
        if len(a) / sr / chars <= 0.2 or len(b) / sr / chars2 >= 0.17: continue
        save(path, a[:int(sr * (g0 + 0.12))], sr)
        save(path2, np.concatenate([a[int(sr * (g1 - 0.08)):], np.zeros(int(sr * 0.25), np.float32), b]), sr)
        moved.append((f'{slug} N_{i:02d} → {slug2} N_{i2:02d}', round(end - g1, 2)))
    return moved


if __name__ == '__main__':
    moved = fix(sys.argv[1:])
    print('出だしを次の行へ移した所:', moved if moved else 'なし')
