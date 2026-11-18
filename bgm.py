"""動画ごとに雰囲気のちがう BGM を、その場で作る（ファイルは使わない・著作権の心配なし）。
各動画の mix.py から  import bgm; mus = bgm.render(PRESET, SEED, N, SR, start, total)  で呼ぶ。
PRESET は下の PRESETS のどれか。SEED を変えるとメロディが変わる。
  python3 bgm.py            → いまのプリセットの一覧
  python3 bgm.py demo <名前>  → bgm_demo_<名前>.wav（30秒）を作る"""
import sys
import numpy as np

def hz(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- 音色 ----------
def _t(dur, SR): return np.arange(int(dur * SR)) / SR
def pluck(f, dur, amp, SR, bright=0.35, decay=3.2):
    t = _t(dur, SR); env = np.exp(-t * decay) * np.minimum(1, t / 0.004)
    return amp * env * (np.sin(2*np.pi*f*t) + bright*np.sin(4*np.pi*f*t)*np.exp(-t*6) + 0.12*np.sin(6*np.pi*f*t)*np.exp(-t*9))
def marimba(f, dur, amp, SR):
    t = _t(dur, SR); env = np.exp(-t * 7) * np.minimum(1, t / 0.002)
    return amp * env * (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*4*f*t)*np.exp(-t*25) + 0.15*np.sin(2*np.pi*10*f*t)*np.exp(-t*60))
def bell(f, dur, amp, SR):  # オルゴール・鉄琴
    t = _t(dur, SR); env = np.exp(-t * 2.2) * np.minimum(1, t / 0.002)
    return amp * env * (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*2.76*f*t)*np.exp(-t*4) + 0.25*np.sin(2*np.pi*5.4*f*t)*np.exp(-t*8))
def epiano(f, dur, amp, SR):  # やわらかいエレピ
    t = _t(dur, SR); env = np.exp(-t * 1.6) * np.minimum(1, t / 0.006)
    trem = 1 + 0.12 * np.sin(2*np.pi*4.5*t)
    return amp * env * trem * (np.sin(2*np.pi*f*t) + 0.25*np.sin(2*np.pi*2*f*t + np.sin(2*np.pi*f*t)) * np.exp(-t*3))
def pad(f, dur, amp, SR):  # ふわっと広がる和音の音
    t = _t(dur, SR); a = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8)
    return amp * a * (np.sin(2*np.pi*f*t) + 0.6*np.sin(2*np.pi*f*1.003*t) + 0.3*np.sin(2*np.pi*2*f*t)) / 1.9
def bass(f, dur, amp, SR):
    t = _t(dur, SR); env = np.exp(-t * 2.5) * np.minimum(1, t / 0.01)
    return amp * env * (np.sin(2*np.pi*f*t) + 0.3*np.sin(4*np.pi*f*t))
def shaker(amp, SR, rng):
    t = _t(0.06, SR); return amp * rng.standard_normal(len(t)) * np.exp(-t * 70) * 0.5
def clap(amp, SR, rng):
    t = _t(0.12, SR); return amp * rng.standard_normal(len(t)) * np.exp(-t * 40)
def kick(amp, SR):
    t = _t(0.25, SR); f = 120 * np.exp(-t * 18) + 45
    return amp * np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 12)

INSTR = dict(pluck=pluck, marimba=marimba, bell=bell, epiano=epiano)

# ---------- プリセット ----------
# key: 主音（MIDI）、prog: 和音の進行（主音からの度数）、meter: 1小節の拍、swing: はねる度合い
MAJOR = [0, 2, 4, 5, 7, 9, 11]; PENTA = [0, 2, 4, 7, 9]
PRESETS = {
    'pluck':    dict(bpm=92,  key=60, meter=4, lead='pluck',   chords='pluck', prog=[0, 9, 5, 7], perc=None,     swing=0,    desc='ぽろんとした弦。いつもの（しんごう・そら）'),
    'marimba':  dict(bpm=104, key=65, meter=4, lead='marimba', chords='pad',   prog=[0, 5, 9, 7], perc='shaker', swing=0,    desc='木琴とシェイカー。軽やか'),
    'musicbox': dict(bpm=88,  key=67, meter=3, lead='bell',    chords='pad',   prog=[0, 7, 9, 5], perc=None,     swing=0,    desc='オルゴールのワルツ。やさしい・ふしぎ'),
    'ukulele':  dict(bpm=112, key=62, meter=4, lead='pluck',   chords='strum', prog=[0, 7, 9, 5], perc='clap',   swing=0.2,  desc='ウクレレ風のストローク。明るい'),
    'lofi':     dict(bpm=80,  key=58, meter=4, lead='epiano',  chords='epiano',prog=[0, 9, 2, 7], perc='soft',   swing=0.33, desc='エレピとやわらかいビート。のんびり'),
    'march':    dict(bpm=120, key=60, meter=2, lead='bell',    chords='oompah',prog=[0, 5, 7, 0], perc='clap',   swing=0,    desc='鉄琴の行進。わくわく（乗りもの・しくみ）'),
    'space':    dict(bpm=70,  key=64, meter=4, lead='bell',    chords='pad',   prog=[0, 9, 4, 5], perc=None,     swing=0,    desc='ゆったりした和音と鈴。空・月・星'),
}

def _triad(root_deg, key):
    # 長調の音階の上に3和音（度数は半音）
    idx = {0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6}[root_deg]
    return [key + MAJOR[(idx + k) % 7] + 12 * ((idx + k) // 7) for k in (0, 2, 4)]

def render(preset, seed, N, SR, start, total):
    P = PRESETS[preset]; rng = np.random.default_rng(seed)
    buf = np.zeros(N)
    def add(t0, y):
        i = int(t0 * SR); j = min(N, i + len(y))
        if 0 <= i < N: buf[i:j] += y[:j - i]
    beat = 60 / P['bpm']; meter = P['meter']; key = P['key']
    lead = INSTR[P['lead']]
    # メロディ：4小節のモチーフを作って、少し変えながらくり返す
    steps = meter * 2 * 4
    scale = [key + 12 + d for d in PENTA] + [key + 24 + d for d in PENTA[:3]]
    def motif():
        m, cur = [], rng.integers(2, 6)
        for s in range(steps):
            if rng.random() < (0.55 if s % 2 == 0 else 0.3):
                cur = int(np.clip(cur + rng.choice([-2, -1, -1, 0, 1, 1, 2]), 0, len(scale) - 1)); m.append(scale[cur])
            else: m.append(None)
        return m
    A, B = motif(), motif()
    t, b = start, 0
    while t < total - 2:
        bar = b // meter; pos = b % meter
        deg = P['prog'][(bar // 2) % len(P['prog'])]; ch = _triad(deg, key)
        root = ch[0] - 24
        sw = P['swing'] * beat / 2
        # 和音
        c = P['chords']
        if c == 'pluck':
            if pos == 0: add(t, pluck(hz(root), 2.5, 0.20, SR, 0.1))
            if pos % 2 == 1:
                for k, m in enumerate(ch): add(t + k * 0.02, pluck(hz(m), 1.2, 0.05, SR))
        elif c == 'pad':
            if pos == 0 and bar % 2 == 0: [add(t, pad(hz(m), beat * meter * 2 + 0.6, 0.045, SR)) for m in ch]
            if pos == 0: add(t, bass(hz(root), beat * meter, 0.16, SR))
        elif c == 'strum':
            for k, m in enumerate(ch + [ch[0] + 12]): add(t + k * 0.012, pluck(hz(m), 0.5, 0.045, SR, 0.6, 6))
            if pos in (1, 3):
                for k, m in enumerate(ch): add(t + beat / 2 + sw + k * 0.01, pluck(hz(m), 0.3, 0.03, SR, 0.6, 9))
            if pos == 0: add(t, bass(hz(root), beat * 2, 0.17, SR))
        elif c == 'epiano':
            if pos == 0: [add(t + k * 0.015, epiano(hz(m), beat * meter, 0.05, SR)) for k, m in enumerate(ch)]
            if pos in (0, 2): add(t, bass(hz(root), beat * 1.5, 0.15, SR))
        elif c == 'oompah':
            add(t, bass(hz(root if pos == 0 else root + 7), beat * 0.6, 0.18, SR))
            [add(t + beat / 2, marimba(hz(m), 0.3, 0.035, SR)) for m in ch]
        # 打楽器
        pc = P['perc']
        if pc == 'shaker':
            add(t, shaker(0.05, SR, rng)); add(t + beat / 2 + sw, shaker(0.035, SR, rng))
        elif pc == 'clap':
            if pos % 2 == 1: add(t, clap(0.05, SR, rng))
            add(t + beat / 2 + sw, shaker(0.025, SR, rng))
        elif pc == 'soft':
            if pos in (0, 2): add(t, kick(0.12, SR))
            if pos in (1, 3): add(t, clap(0.03, SR, rng))
            add(t + beat / 2 + sw, shaker(0.02, SR, rng))
        # メロディ（16小節ごとに A A B A、ときどき休む）
        sect = (bar // 4) % 4; mo = B if sect == 2 else A
        rest = (bar // 16) % 3 == 2
        for half in (0, 1):
            m = mo[(pos * 2 + half + (bar % 4) * meter * 2) % steps]
            if m is not None and not rest:
                add(t + half * (beat / 2 + sw), lead(hz(m), 1.0, 0.07, SR))
        b += 1; t += beat
    # どのプリセットでも同じくらいの大きさに
    rms = np.sqrt(np.mean(buf[int(start * SR):int(total * SR)] ** 2) + 1e-12)
    return buf * (0.050 / rms)

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'demo':
        import wave
        SR = 44100; T = 30; y = render(sys.argv[2], 1, T * SR + SR, SR, 0.0, T)
        y = (y / max(1e-9, np.abs(y).max()) * 0.8 * 32767).astype('<i2')
        with wave.open(f'bgm_demo_{sys.argv[2]}.wav', 'wb') as o:
            o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(y.tobytes())
        print('ok')
    else:
        for k, v in PRESETS.items(): print(f'{k:9s} {v["bpm"]:3d}bpm  {v["desc"]}')
