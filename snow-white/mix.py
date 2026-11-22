"""ナレーション・BGM・効果音を timeline.js に合わせて混ぜて mix.wav を作る（ゆき）。"""
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
BGM_PRESET, BGM_SEED = 'space', 5263
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
def dur_(sid, k): return cueE(sid, k) - cue(sid, k)
def at(sid, T): return SC[sid][0] + T
def bell(f=2093, amp=0.06):
    # 雪の「しゃりん」
    y = pluck(f, 0.9, amp, 0.8); z = pluck(f * 1.335, 0.7, amp * 0.6, 0.6); y[:len(z)] += z; return y
# つかみ：水 → こおり、すきとおっている、まっしろ、題名
add(sfx, cue('hook', 0, 0.1), popfx()); add(sfx, cue('hook', 0, dur_('hook', 0) * 0.5), bell(1760, 0.07))
add(sfx, cue('hook', 1, dur_('hook', 1) * 0.3), popfx())
add(sfx, cue('hook', 2, dur_('hook', 2) * 0.3), chime(1568, 0.11))
for k in range(5): add(sfx, cue('hook', 2, dur_('hook', 2) * 0.3 + 0.3 + k * 0.35), bell(2093 + 260 * (k % 3), 0.035))
add(sfx, cueE('hook', 4, 0.6), chime(1568, 0.14)); add(sfx, cueE('hook', 4, 0.75), chime(2093, 0.1))
for k in range(4): add(sfx, cueE('hook', 4, 0.6 + 1.7 + k * 0.15), bell(1760 + 200 * k, 0.04))
# 予想
for k in range(1, 4): add(sfx, cue('guess', k, -0.2), popfx())
for k in range(3): add(sfx, cueE('guess', 3, 0.3 + k), tick())
add(sfx, cueE('guess', 3, 3.3), chime(1760, 0.12))
# ひとつぶ
add(sfx, at('grain', 0.2), popfx())
for k in range(7): add(sfx, at('grain', 0.6 + k * 0.25 + 0.4), bell(2349 + 180 * (k % 4), 0.03))
add(sfx, cue('grain', 0, dur_('grain', 0) * 0.85), chime(2093, 0.09))
add(sfx, cue('grain', 1, dur_('grain', 1) * 0.3), popfx()); add(sfx, cue('grain', 1, dur_('grain', 1) * 0.6), popfx())
add(sfx, cue('grain', 3, -0.4), swell(1.6, 0.08)); add(sfx, cue('grain', 3, dur_('grain', 3) * 0.25), popfx()); add(sfx, cue('grain', 3, dur_('grain', 3) * 0.55), popfx())
add(sfx, cue('grain', 4, dur_('grain', 4) * 0.35), chime(1568, 0.1))
# 光が向きを変える：まがり角ごとに「ぴん」
def bends(sid, st, dur, n, f0=1568, amp=0.045):
    for k in range(n): add(sfx, st + dur * (k + 1) / (n + 1), pluck(f0 + 130 * (k % 4), 0.2, amp, 0.8))
bends('bounce', cue('bounce', 0, 0.3), cueE('bounce', 1) - cue('bounce', 0) - 0.6, 7)
add(sfx, cue('bounce', 1, dur_('bounce', 1) * 0.15), popfx()); add(sfx, cue('bounce', 1, dur_('bounce', 1) * 0.4), popfx())
bends('bounce', cue('bounce', 2, 0.1), dur_('bounce', 2) * 0.8, 7, 1760, 0.035); bends('bounce', cue('bounce', 2, 0.9), dur_('bounce', 2) * 0.75, 5, 1976, 0.035)
add(sfx, cue('bounce', 2, dur_('bounce', 2) * 0.45), popfx())
add(sfx, cue('bounce', 3, 0.0), swell(2.2, 0.11)); add(sfx, cue('bounce', 3, dur_('bounce', 3) * 0.3), chime(1760, 0.12))
# 氷のかたまり
add(sfx, cue('block', 0, dur_('block', 0) * 0.45), popfx()); add(sfx, cue('block', 1, 0.2), swell(1.4, 0.08))
add(sfx, cue('block', 1, dur_('block', 1) * 0.45), popfx())
add(sfx, cue('block', 2, -0.2), popfx()); add(sfx, cue('block', 2, dur_('block', 2) * 0.25), popfx()); add(sfx, cue('block', 2, dur_('block', 2) * 0.65), chime(1568, 0.1))
# どの色ももどる → 白
for k, mm in enumerate([72, 74, 76, 79, 81, 84]): add(sfx, cue('colors', 0, dur_('colors', 0) * 0.4 + k * 0.12), mallet(note_hz(mm), 0.5, 0.09))
add(sfx, cue('colors', 0, dur_('colors', 0) * 0.55), popfx())
for k in range(6): add(sfx, cue('colors', 1, 0.3 + k * 0.12 + 0.6), pluck(880 + 110 * k, 0.2, 0.04, 0.8))
add(sfx, cue('colors', 1, dur_('colors', 1) * 0.3), popfx())
for k, mm in enumerate([72, 74, 76, 79, 81, 84]): add(sfx, cue('colors', 1, dur_('colors', 1) * 0.55 + k * 0.12 + 0.9), mallet(note_hz(mm), 0.4, 0.07))
add(sfx, cue('colors', 2, 0.1), popfx())
add(sfx, cue('colors', 2, dur_('colors', 2) * 0.35 + 0.6), chime(1568, 0.13)); add(sfx, cue('colors', 2, dur_('colors', 2) * 0.35 + 0.75), chime(2093, 0.1))
for k in range(3): add(sfx, cue('colors', 3, dur_('colors', 3) * (0.1 + k * 0.22)), popfx())
add(sfx, cue('colors', 3, dur_('colors', 3) * 0.8), chime(1760, 0.1))
# 夕やけの雪山
add(sfx, cue('sunset', 0, dur_('sunset', 0) * 0.15), popfx()); add(sfx, cue('sunset', 0, dur_('sunset', 0) * 0.6), popfx())
add(sfx, cue('sunset', 1, -0.8), swell(3.2, 0.11)); add(sfx, cue('sunset', 1, dur_('sunset', 1) * 0.45), chime(1318.5, 0.1))
# 深い雪のあな
add(sfx, cue('blue', 0, 0.3), swell(dur_('blue', 0) * 0.7, 0.08))
for k in range(5): add(sfx, cue('blue', 0, dur_('blue', 0) * (0.2 + k * 0.15)), pluck(1568 - 196 * k, 0.3, 0.06, 0.6))
add(sfx, cue('blue', 1, -0.2), popfx()); add(sfx, cue('blue', 1, dur_('blue', 1) * 0.4), popfx())
add(sfx, cue('blue', 2, dur_('blue', 2) * 0.35), chime(1568, 0.1))
add(sfx, cue('blue', 3, -0.4), swell(2.0, 0.1)); add(sfx, cue('blue', 3, dur_('blue', 3) * 0.2), popfx()); add(sfx, cue('blue', 3, dur_('blue', 3) * 0.5), popfx()); add(sfx, cue('blue', 3, dur_('blue', 3) * 0.65), popfx())
# 正解とみてみよう
add(sfx, cue('look', 0, 0.7), chime(1568, 0.14)); add(sfx, cue('look', 0, 0.85), chime(1976, 0.12)); add(sfx, cue('look', 0, 1.0), chime(2349, 0.1))
for k in range(1, 5): add(sfx, cue('look', k), popfx())
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
