"""ナレーション・BGM・効果音を timeline.js に合わせて混ぜて mix.wav を作る（じゃぐち）。"""
import json, re, wave, pathlib
import numpy as np
here = pathlib.Path(__file__).parent
TL = json.loads(re.sub(r'^window.TL = |;\s*$', '', open(here / 'timeline.js').read()))
SR = 44100
TOTAL = TL['total']; N = int(TOTAL * SR) + SR
starts = np.cumsum([0] + [s['dur'] for s in TL['scenes'][:-1]])
SC = {s['id']: (st, s) for st, s in zip(starts, TL['scenes'])}

def readwav(p):
    w = wave.open(str(p)); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768; w.close()
    if sr != SR: a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a)
    return a

voice = np.zeros(N); speech = np.zeros(N)
for sid, (st, s) in SC.items():
    for l in s['lines']:
        if l['who'] != 'N': continue  # キャラクターは吹き出しだけ（声なし）
        f = here / 'lines' / l['file']
        if not f.exists():  # ナレーションがまだない（下書き）：声は入れず、BGM を下げる区間だけ作る
            i = int((st + l['start']) * SR); j = min(N, int((st + l['end']) * SR))
            speech[max(0, i - int(0.15 * SR)):j + int(0.25 * SR)] = 1; continue
        y = readwav(f)
        gain = 1.0 if l['who'] == 'N' else 1.08
        i = int((st + l['start']) * SR); j = min(N, i + len(y))
        voice[i:j] += gain * y[:j - i]
        a0 = max(0, i - int(0.15 * SR)); speech[a0:j + int(0.25 * SR)] = 1

# ---- BGM（music.py と同じ作り） ----
def note_hz(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(f, dur, amp, bright=0.35):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 3.2) * np.minimum(1, t / 0.004)
    y = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9)
    return amp * env * y
def add(buf, start, y):
    i = int(start * SR); j = min(N, i + len(y))
    if 0 <= i < N: buf[i:j] += y[:j - i]
mus = np.zeros(N); sfx = np.zeros(N)
IDENT = TL['scenes'][0]['dur']
# BGM：動画ごとに変える（bgm.py の PRESETS から選ぶ。SEED でメロディが変わる）
import sys; sys.path.insert(0, str(here.parent)); import bgm
BGM_PRESET, BGM_SEED = 'marimba', 5967
rng = np.random.default_rng(BGM_SEED)  # 効果音のノイズ用
mus += bgm.render(BGM_PRESET, BGM_SEED, N, SR, IDENT, TOTAL)
env = np.ones(N)
# ナレーション中は BGM を下げる
duck = 1 - 0.6 * speech
def smooth(x, sec):
    c = np.concatenate([[0], np.cumsum(x)]); h = int(sec * SR / 2); i = np.arange(len(x))
    lo = np.clip(i - h, 0, len(x)); hi = np.clip(i + h, 0, len(x)); return (c[hi] - c[lo]) / np.maximum(hi - lo, 1)
gainb = smooth(env * duck, 0.35)
fade = np.ones(N); fl = int(3 * SR); end_i = int(TOTAL * SR); fade[end_i - fl:end_i] = np.linspace(1, 0, fl); fade[end_i:] = 0
mus *= gainb * fade

def chime(f=1568, amp=0.18):
    y = pluck(f, 1.5, amp, 0.6); z = pluck(f * 1.5, 1.2, amp * 0.5, 0.3); y[:len(z)] += z; return y
def tick(): return pluck(1200, 0.25, 0.16, 0.2)
def popfx():
    t = np.arange(int(0.12 * SR)) / SR; f = 500 + 2200 * t / 0.12
    return 0.16 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)
def crack(dur=0.5, amp=0.22):
    t = np.arange(int(dur * SR)) / SR; n = np.diff(rng.standard_normal(len(t)), prepend=0); return amp * n * np.exp(-t * 14)
def shatter():
    y = crack(1.2, 0.18)
    for k in range(8):
        s0 = int((0.05 + 0.12 * k + rng.random() * 0.05) * SR); z = pluck(2600 + rng.random() * 1800, 0.3, 0.05, 0.8); y[s0:s0 + len(z)] += z[:len(y[s0:s0 + len(z)])]
    return y
def mallet(f, dur, amp):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 5.5) * np.minimum(1, t / 0.002)
    return amp * env * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30) + 0.25 * np.sin(2 * np.pi * 2.01 * f * t))
# サウンドロゴ
for k, m in enumerate([67, 69, 72, 74, 76]): add(sfx, 0.5 + 0.15 * k, mallet(note_hz(m), 0.6, 0.22))
for m, a in [(48, 0.22), (60, 0.16), (72, 0.14), (76, 0.12), (79, 0.12), (84, 0.10)]: add(sfx, 1.35, pluck(note_hz(m), 2.6, a, 0.5))
add(sfx, 1.35, chime(2093, 0.12)); add(sfx, 1.5, chime(2637, 0.09)); add(sfx, 1.65, chime(3136, 0.07))
for sid in list(SC)[2:]: add(sfx, SC[sid][0] + 0.05, pluck(1046.5, 1.0, 0.07, 0.6))
def cue(sid, k, off=0.0):
    st, s = SC[sid]; L = s['lines']
    return st + (L[k]['start'] if k >= 0 else s['dur']) + off
def cueE(sid, k, off=0.0):
    st, s = SC[sid]; return st + s['lines'][k]['end'] + off
def swell(dur=2.5, amp=0.10):
    # 夕方になるときのやわらかい和音
    y = np.zeros(int(dur * SR))
    for m in (60, 64, 67, 71):
        t = np.arange(len(y)) / SR; e = np.sin(np.pi * t / dur) ** 2
        y += amp * 0.25 * e * np.sin(2 * np.pi * note_hz(m) * t)
    return y
def dur(sid, k): st, s = SC[sid]; return s['lines'][k]['end'] - s['lines'][k]['start']
def arp(t0, notes=(72, 74, 76, 79, 81, 84), step=0.12, amp=0.10):
    for k, m in enumerate(notes): add(sfx, t0 + k * step, mallet(note_hz(m), 0.5, amp))
def water(d=2.0, amp=0.16):
    # ジャーッ：水が出ている音（やわらかいノイズ）
    t = np.arange(int(d * SR)) / SR
    n = rng.standard_normal(len(t)); n = n - smooth(n, 0.0012); n = smooth(n, 0.00018)
    n = n / (np.abs(n).max() + 1e-9)
    env = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.35) * (0.85 + 0.15 * np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 1.3 * t)))
    return amp * env * n
def squeak(amp=0.07):
    # ハンドルを回す「きゅっ」
    t = np.arange(int(0.22 * SR)) / SR; f = 900 + 700 * t / 0.22
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.22) ** 2
def push(amp=0.10):
    # ぎゅっ：ひくい「ぐっ」
    t = np.arange(int(0.3 * SR)) / SR; f = 150 - 50 * t / 0.3
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.3) ** 2
def hum(d=2.0, amp=0.05):
    # ポンプの「ぶーん」
    t = np.arange(int(d * SR)) / SR
    return amp * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4) * (np.sin(2 * np.pi * 98 * t) + 0.5 * np.sin(2 * np.pi * 196 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 8 * t))
# つかみ：ひねると、ジャーッ
tO = cue('hook', 0, dur('hook', 0) * 0.42); tC = cue('hook', 1, 1.7); tO2 = cue('hook', 2, dur('hook', 2) * 0.5)
add(sfx, tO - 0.1, squeak()); add(sfx, tO, water(tC - tO + 0.2)); add(sfx, tC - 0.1, squeak(0.05))
add(sfx, cue('hook', 2, 0.2), popfx()); add(sfx, cue('hook', 2, dur('hook', 2) * 0.28), popfx())
add(sfx, tO2 - 0.1, squeak()); add(sfx, tO2, water(cueE('hook', 3, 0.6) - tO2, 0.10)); add(sfx, tO2 + 0.5, popfx())
add(sfx, cue('hook', 3, 0.5), popfx())
add(sfx, cueE('hook', 3, 0.6), chime(1568, 0.14)); add(sfx, cueE('hook', 3, 0.75), chime(2093, 0.1))
# 予想
for k in range(1, 4): add(sfx, cue('guess', k, -0.2), popfx())
for k in range(3): add(sfx, cueE('guess', 3, 0.3 + k), tick())
add(sfx, cueE('guess', 3, 3.3), chime(1760, 0.12))
# 蛇口の中
add(sfx, cue('koma', 0, 0.4), popfx()); add(sfx, cue('koma', 1, 0.5), chime(1568, 0.09)); add(sfx, cue('koma', 1, dur('koma', 1) * 0.45), popfx())
add(sfx, cue('koma', 2, 0.3), popfx()); add(sfx, cue('koma', 2, dur('koma', 2) * 0.4), popfx()); add(sfx, cue('koma', 2, dur('koma', 2) * 0.6), tick())
tO = cue('koma', 3, dur('koma', 3) * 0.3)
add(sfx, cue('koma', 3, 0.3), popfx()); add(sfx, tO, squeak()); add(sfx, tO + 0.45, squeak()); add(sfx, tO + 0.5, popfx())
add(sfx, tO + 0.9, water(SC['koma'][1]['dur'] - (tO + 0.9 - SC['koma'][0]) - 0.3, 0.13)); add(sfx, tO + 1.4, popfx())
# 管はつながっていて、いつもおされている
add(sfx, cue('pipes', 0, 0.3), popfx()); add(sfx, cue('pipes', 0, 1.4), water(1.8, 0.09))
add(sfx, cue('pipes', 1, -0.3), swell(1.6, 0.08)); add(sfx, cue('pipes', 1, 0.3), popfx()); add(sfx, cue('pipes', 1, 1.2), popfx()); add(sfx, cue('pipes', 1, dur('pipes', 1) * 0.45), popfx())
arp(cue('pipes', 2, 0.2), notes=(72, 74, 76, 79, 81, 84, 86, 88), step=0.3, amp=0.07); add(sfx, cue('pipes', 2, 0.5), popfx())
for k in range(4): add(sfx, cue('pipes', 3, 0.5 + k * 1.26), push())
add(sfx, cue('pipes', 3, 0.5), popfx())
tO = cue('pipes', 4, dur('pipes', 4) * 0.3)
add(sfx, tO - 0.1, squeak()); add(sfx, tO, water(cue('pipes', 5) - tO - 0.2, 0.12)); add(sfx, tO + 0.3, popfx())
add(sfx, cue('pipes', 5, 0.1), popfx()); add(sfx, cue('pipes', 5, 0.6), chime(1568, 0.09))
# だれがおしている？ 高台の配水池
add(sfx, cue('hill', 0, 0.3), popfx()); add(sfx, cue('hill', 1, -0.3), swell(1.6, 0.09)); add(sfx, cue('hill', 1, 0.9), chime(1568, 0.1)); add(sfx, cue('hill', 1, dur('hill', 1) * 0.6), popfx())
add(sfx, cue('hill', 2, 0.5), popfx()); add(sfx, cue('hill', 2, 1.3), popfx()); add(sfx, cue('hill', 2, dur('hill', 2) * 0.45), popfx())
arp(cue('hill', 2, 0.6), notes=(88, 86, 84, 81, 79, 76, 74, 72), step=0.14, amp=0.07)
for k in range(3): add(sfx, cue('hill', 3, 0.4 + k * 1.26), push())
add(sfx, cue('hill', 3, 0.6), popfx())
for k in range(3): add(sfx, cue('hill', 3, 1.2 + k * 0.35), pluck(1760 + 220 * k, 0.3, 0.06, 0.8))
# ポンプ
tP = cue('pump', 0, dur('pump', 0) * 0.5)
add(sfx, cue('pump', 0, 0.4), popfx()); add(sfx, tP - 0.2, popfx()); add(sfx, tP, hum(cue('pump', 1) - tP - 0.3)); add(sfx, tP + 0.9, popfx())
for k in range(3): add(sfx, tP + 1.4 + k * 0.35, pluck(1760 + 220 * k, 0.3, 0.06, 0.8))
add(sfx, cue('pump', 1, -0.3), swell(1.4, 0.08)); add(sfx, cue('pump', 1, 0.6), popfx())
for k in range(int((SC['pump'][1]['dur'] - SC['pump'][1]['lines'][1]['start'] - 0.6) / 0.5)): add(sfx, cue('pump', 1, 0.5 + k * 0.5), pluck(1200, 0.12, 0.05, 0.2))
add(sfx, cue('pump', 2, dur('pump', 2) * 0.4), chime(1568, 0.1))
# 高い建物
add(sfx, cue('tall', 0, 0.4), popfx()); add(sfx, cue('tall', 0, 0.8), tick()); add(sfx, cue('tall', 0, 1.1), tick())
tA = cue('tall', 1, dur('tall', 1) * 0.3)
add(sfx, cue('tall', 1, 0.3), popfx()); arp(tA + 0.3, notes=(72, 76, 79), step=0.5, amp=0.09); add(sfx, tA + 0.6, popfx()); add(sfx, tA + 1.4, popfx())
tB = cue('tall', 2, dur('tall', 2) * 0.35)
add(sfx, cue('tall', 2, 0.3), popfx()); add(sfx, tB, hum(2.4)); arp(tB + 0.2, notes=(72, 74, 76, 79, 81, 84, 86), step=0.28, amp=0.09); add(sfx, tB + 0.3, popfx())
tC = cue('tall', 3, 0.3); DC = max(3.2, min(5.2, dur('tall', 3) - 0.6))
add(sfx, tC, hum(DC * 0.5)); add(sfx, tC + DC * 0.5, popfx()); arp(tC + DC * 0.64, notes=(86, 84, 81, 79, 76, 74, 72), step=DC * 0.36 / 7.5, amp=0.09)
# 正解 と みてみよう
add(sfx, cue('look', 0, 1.2), chime(1568, 0.14)); add(sfx, cue('look', 0, 1.35), chime(1976, 0.12)); add(sfx, cue('look', 0, 1.5), chime(2349, 0.1))
for k in range(3): add(sfx, cue('look', 0, 2.6 + k * 1.3), popfx())
add(sfx, cue('look', 1, 0.1), popfx()); add(sfx, cue('look', 1, 0.3), water(1.4, 0.05)); add(sfx, cue('look', 1, dur('look', 1) * 0.55), water(1.6, 0.11))
add(sfx, cue('look', 2, 0.1), popfx()); add(sfx, cue('look', 2, dur('look', 2) * 0.6), popfx())
add(sfx, cue('look', 3, 0.1), tick()); add(sfx, cue('look', 3, dur('look', 3) * 0.55), tick())
add(sfx, cue('look', 4, 0.1), popfx()); add(sfx, cue('look', 4, dur('look', 4) * 0.5), chime(1568, 0.08)); add(sfx, cue('look', 4, dur('look', 4) * 0.7), popfx())
add(sfx, cue('look', 5, 0.1), tick())
add(sfx, cue('end', -1, -7.2), chime(1046.5, 0.12)); add(sfx, cue('end', -1, -7.0), chime(1568, 0.1))

# 吹き出しが出るときの「ポン」
def blip(f0=880):
    t = np.arange(int(0.18 * SR)) / SR; f = f0 * (1 + 0.6 * np.exp(-t * 30))
    return 0.22 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18) * np.minimum(1, t / 0.003)
for sid, (st, s_) in SC.items():
    for l in s_['lines']:
        if l['who'] != 'N': add(sfx, st + l['start'], blip({'S': 988, 'B': 784, 'K': 660}[l['who']]))
bed = np.tanh((mus * 0.9 + sfx * 0.8) * 1.1) / np.tanh(1.1)
bed = bed / (np.abs(bed).max() + 1e-9) * 0.22
vox = voice / (np.abs(voice).max() + 1e-9) * 0.8
mixd = (bed + vox)[:end_i]
mixd = mixd / max(1.0, np.abs(mixd).max() / 0.95)
st2 = np.stack([mixd, mixd], 1)
with wave.open(str(here / 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st2 * 32767).astype('<i2').tobytes())
print('ok', TOTAL)
