"""BGM と効果音をつくる（その場で合成、外部素材なし）"""
import numpy as np, wave
SR = 44100
IDENT = 4.5
D = [IDENT,16,10,26,30,26,26,38,26,24,8]
starts_all = np.cumsum([0]+D[:-1]); TOTAL = sum(D)
starts = starts_all[1:]  # 本編の場面（0=つかみ）
D = D[1:]
N = int(TOTAL*SR)
mus = np.zeros(N); sfx = np.zeros(N)
def note_hz(m): return 440*2**((m-69)/12)
def pluck(f, dur, amp, bright=0.35):
    t = np.arange(int(dur*SR))/SR
    env = np.exp(-t*3.2) * np.minimum(1, t/0.004)
    y = np.sin(2*np.pi*f*t) + bright*np.sin(2*np.pi*2*f*t)*np.exp(-t*6) + 0.12*np.sin(2*np.pi*3*f*t)*np.exp(-t*9)
    return amp*env*y
def add(buf, start, y):
    i = int(start*SR); j = min(N, i+len(y))
    if i < N: buf[i:j] += y[:j-i]
bpm = 92; beat = 60/bpm
prog = [(48,[60,64,67]),(45,[57,60,64]),(41,[57,60,65]),(43,[59,62,67])]  # C Am F G
penta = [72,74,76,79,81,84]
rng = np.random.default_rng(4)
phrase = [rng.choice(penta) if rng.random()>0.3 else None for _ in range(32)]
b = 0; t = IDENT
while t < TOTAL-2:
    bar = int(b//4); root, chord = prog[(bar//2) % 4]
    if b % 4 == 0: add(mus, t, pluck(note_hz(root), 2.5, 0.20, 0.1))
    if b % 2 == 1: 
        for k,m in enumerate(chord): add(mus, t+k*0.02, pluck(note_hz(m), 1.2, 0.05))
    for half in (0,1):
        m = phrase[int(b*2+half) % 32]
        if m is not None and (b//16) % 2 == 0 or (m is not None and half == 0):
            add(mus, t+half*beat/2, pluck(note_hz(m), 1.0, 0.075, 0.5))
    b += 1; t += beat
# 夜の場面は少し静かに
env = np.ones(N)
for sc in (2,3):
    a, e = starts[sc], starts[sc]+D[sc]
    env[int(a*SR):int(e*SR)] = 0.7
c = np.cumsum(np.concatenate([[0], env])); h = SR//2
idx = np.arange(N); lo = np.clip(idx-h, 0, N); hi = np.clip(idx+h, 0, N)
env = (c[hi]-c[lo])/np.maximum(hi-lo, 1)
fade = np.ones(N); fl = int(3*SR); fade[-fl:] = np.linspace(1,0,fl)
mus *= env*fade
# 効果音
def chime(f=1568, amp=0.18):
    y = pluck(f, 1.5, amp, 0.6); z = pluck(f*1.5, 1.2, amp*0.5, 0.3); y[:len(z)] += z; return y
def tick(): return pluck(1200, 0.25, 0.16, 0.2)
def popfx():
    t = np.arange(int(0.12*SR))/SR; f = 500+2200*t/0.12
    return 0.16*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*25)
def crack(dur=0.5, amp=0.22):
    t = np.arange(int(dur*SR))/SR; n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # 高い音寄り
    return amp*n*np.exp(-t*14)
def shatter():
    y = crack(1.2, 0.18)
    for k in range(8): 
        s = int((0.05+0.12*k+rng.random()*0.05)*SR); y[s:s+int(0.3*SR)] += pluck(2600+rng.random()*1800, 0.3, 0.05, 0.8)[:len(y[s:s+int(0.3*SR)])]
    return y
for sc in range(1,10): add(sfx, starts[sc]+0.05, pluck(1046.5, 1.0, 0.07, 0.6))  # 場面のつなぎ
# サウンドロゴ：み・の・ま・わ・り（5音）→ 図鑑（和音とベル）
def mallet(f, dur, amp):
    t = np.arange(int(dur*SR))/SR
    env = np.exp(-t*5.5) * np.minimum(1, t/0.002)
    return amp*env*(np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*4*f*t)*np.exp(-t*30) + 0.25*np.sin(2*np.pi*2.01*f*t))
for k, m in enumerate([67, 69, 72, 74, 76]):
    add(sfx, 0.5+0.15*k, mallet(note_hz(m), 0.6, 0.22))
for m, a in [(48, 0.22), (60, 0.16), (72, 0.14), (76, 0.12), (79, 0.12), (84, 0.10)]:
    add(sfx, 1.35, pluck(note_hz(m), 2.6, a, 0.5))
add(sfx, 1.35, chime(2093, 0.12)); add(sfx, 1.5, chime(2637, 0.09)); add(sfx, 1.65, chime(3136, 0.07))
add(sfx, 2.65, pluck(2349, 0.4, 0.06, 0.8))  # ウインク
add(sfx, IDENT+3.0, chime(1318.5, 0.12))                      # 青に変わる
add(sfx, IDENT+12.6, chime(1568, 0.14)); add(sfx, IDENT+12.75, chime(2093, 0.1))  # 題名
for k in range(3): add(sfx, starts[1]+5.2+k, tick())     # カウントダウン
add(sfx, starts[1]+8.2, chime(1760, 0.12))
for st in (10.5, 13.0, 15.5): add(sfx, starts[2]+st, popfx())
add(sfx, starts[3]+6.6, crack()); add(sfx, starts[3]+8.2, shatter())
add(sfx, starts[3]+26.0, chime(1318.5, 0.12))
add(sfx, starts[4]+6.4, popfx()); add(sfx, starts[4]+6.5, chime(1568, 0.1))
for st in (7.0, 13.0, 19.0): add(sfx, starts[5]+st, popfx())
add(sfx, starts[6]+13.0, crack(0.15, 0.15)); add(sfx, starts[6]+32.4, crack(0.15, 0.15))
for k in range(3): add(sfx, starts[6]+26.0+0.7*k, popfx())
add(sfx, starts[8]+1.2, chime(1568, 0.14)); add(sfx, starts[8]+1.35, chime(1976, 0.12)); add(sfx, starts[8]+1.5, chime(2349, 0.1))
for k in range(3): add(sfx, starts[8]+8.6+1.6*k, popfx())
add(sfx, starts[9]+0.3, chime(1046.5, 0.12)); add(sfx, starts[9]+0.5, chime(1568, 0.1))
mixd = mus*0.9 + sfx
mixd = np.tanh(mixd*1.1)/np.tanh(1.1)
peak = np.max(np.abs(mixd)); mixd = mixd/peak*0.6
st = np.stack([mixd, mixd], 1)
# 少しだけ左右に広げる
d = int(0.012*SR); st[d:,1] = 0.85*mixd[d:] + 0.15*mixd[:-d]
with wave.open('bgm.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st*32767).astype('<i2').tobytes())
print('ok', TOTAL)
