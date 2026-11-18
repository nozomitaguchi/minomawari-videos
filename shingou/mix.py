"""ナレーション・セリフ・BGM・効果音を timeline.js に合わせて混ぜて mix.wav を作る。"""
import json, re, wave, pathlib
import numpy as np
here = pathlib.Path(__file__).parent
TL = json.loads(re.sub(r'^window.TL = |;\s*$', '', open(here / 'timeline.js').read()))
SR = 44100
TOTAL = TL['total']; N = int(TOTAL * SR) + SR
starts = np.cumsum([0] + [s['dur'] for s in TL['scenes'][:-1]])
SC = {s['id']: (st, s) for st, s in zip(starts, TL['scenes'])}

def at(sid, orig_t):
    """場面 sid の元の時刻 → 動画全体の時刻"""
    st, s = SC[sid]; A = s['anchors']
    for (n0, o0), (n1, o1) in zip(A, A[1:]):
        if orig_t <= o1: return st + n0 + (n1 - n0) * (orig_t - o0) / max(o1 - o0, 1e-6)
    return st + A[-1][0]

def readwav(p):
    w = wave.open(str(p)); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768; w.close()
    if sr != SR: a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a)
    return a

voice = np.zeros(N); speech = np.zeros(N)
for sid, (st, s) in SC.items():
    for l in s['lines']:
        if l['who'] in ('S', 'B'): continue  # 子どもの声は入れない（吹き出しだけ）
        y = readwav(here / 'lines' / l['file'])
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
bpm = 92; beat = 60 / bpm
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
penta = [72, 74, 76, 79, 81, 84]
rng = np.random.default_rng(4)
phrase = [rng.choice(penta) if rng.random() > 0.3 else None for _ in range(32)]
b = 0; t = IDENT
while t < TOTAL - 2:
    bar = int(b // 4); root, chord = prog[(bar // 2) % 4]
    if b % 4 == 0: add(mus, t, pluck(note_hz(root), 2.5, 0.20, 0.1))
    if b % 2 == 1:
        for k, m in enumerate(chord): add(mus, t + k * 0.02, pluck(note_hz(m), 1.2, 0.05))
    for half in (0, 1):
        m = phrase[int(b * 2 + half) % 32]
        if m is not None and ((b // 16) % 2 == 0 or half == 0):
            add(mus, t + half * beat / 2, pluck(note_hz(m), 1.0, 0.075, 0.5))
    b += 1; t += beat
env = np.ones(N)
for sid in ('rail1841', 'white'):
    st, s = SC[sid]; env[int(st * SR):int((st + s['dur']) * SR)] = 0.7
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
add(sfx, at('hook', 3.0), chime(1318.5, 0.12))
add(sfx, at('hook', 12.6), chime(1568, 0.14)); add(sfx, at('hook', 12.75), chime(2093, 0.1))
for k in range(3): add(sfx, at('guess', 5.2 + k), tick())
add(sfx, at('guess', 8.2), chime(1760, 0.12))
for st in (10.5, 13.0, 15.5): add(sfx, at('rail1841', st), popfx())
add(sfx, at('white', 6.6), crack()); add(sfx, at('white', 8.2), shatter()); add(sfx, at('white', 26.0), chime(1318.5, 0.12))
add(sfx, at('yellow', 6.4), popfx()); add(sfx, at('yellow', 6.5), chime(1568, 0.1))
for st in (7.0, 13.0, 19.0): add(sfx, at('road', st), popfx())
add(sfx, at('ao', 13.0), crack(0.15, 0.15)); add(sfx, at('ao', 32.4), crack(0.15, 0.15))
for k in range(3): add(sfx, at('ao', 26.0 + 0.7 * k), popfx())
add(sfx, at('look', 1.2), chime(1568, 0.14)); add(sfx, at('look', 1.35), chime(1976, 0.12)); add(sfx, at('look', 1.5), chime(2349, 0.1))
for k in range(3): add(sfx, at('look', 8.6 + 1.6 * k), popfx())
add(sfx, at('end', 0.3), chime(1046.5, 0.12)); add(sfx, at('end', 0.5), chime(1568, 0.1))

# 子どもの吹き出しが出るときの「ポン」
def blip(f0=880):
    t = np.arange(int(0.18 * SR)) / SR; f = f0 * (1 + 0.6 * np.exp(-t * 30))
    return 0.22 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18) * np.minimum(1, t / 0.003)
for sid, (st, s_) in SC.items():
    for l in s_['lines']:
        if l['who'] in ('S', 'B'): add(sfx, st + l['start'], blip(988 if l['who'] == 'S' else 784))
bed = np.tanh((mus * 0.9 + sfx * 0.8) * 1.1) / np.tanh(1.1)
bed = bed / (np.abs(bed).max() + 1e-9) * 0.22
vox = voice / (np.abs(voice).max() + 1e-9) * 0.8
mixd = (bed + vox)[:end_i]
mixd = mixd / max(1.0, np.abs(mixd).max() / 0.95)
st2 = np.stack([mixd, mixd], 1)
with wave.open(str(here / 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st2 * 32767).astype('<i2').tobytes())
print('ok', TOTAL)
