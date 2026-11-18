"""動画の BGM を決めて <slug>/mix.py に書きこむ。
  python3 set_bgm.py <slug> auto        → ほかの動画であまり使われていないプリセットを選ぶ（SEED は毎回ちがう）
  python3 set_bgm.py <slug> <preset> [seed]
古い mix.py（BGM を直接書いていたもの）も、bgm.py を使う形に書きかえる。"""
import sys, re, pathlib, random
import bgm

root = pathlib.Path(__file__).parent
slug, choice = sys.argv[1], sys.argv[2]
p = root / slug / 'mix.py'; s = p.read_text()

def used():
    out = []
    for f in sorted(root.glob('*/mix.py'), key=lambda f: f.stat().st_mtime):
        if f.parent.name == slug: continue
        m = re.search(r"BGM_PRESET, BGM_SEED = '(\w+)'", f.read_text())
        out.append(m.group(1) if m else 'pluck')
    return out

if choice == 'auto':
    u = used(); recent = u[-3:]
    cand = [k for k in bgm.PRESETS if k not in recent] or list(bgm.PRESETS)
    cand.sort(key=lambda k: u.count(k))
    low = [k for k in cand if u.count(k) == u.count(cand[0])]
    preset = random.choice(low)
else:
    preset = choice
seed = int(sys.argv[3]) if len(sys.argv) > 3 else random.randint(1, 9999)
line = f"BGM_PRESET, BGM_SEED = '{preset}', {seed}"

if 'BGM_PRESET' in s:
    s = re.sub(r"BGM_PRESET, BGM_SEED = .*", line, s)
else:
    a = s.index('bpm = 92; beat = 60 / bpm'); b = s.index('env = np.ones(N)')
    s = s[:a] + ("# BGM：動画ごとに変える（bgm.py の PRESETS から選ぶ。SEED でメロディが変わる）\n"
                 "import sys; sys.path.insert(0, str(here.parent)); import bgm\n"
                 f"{line}\nrng = np.random.default_rng(BGM_SEED)  # 効果音のノイズ用\n"
                 "mus += bgm.render(BGM_PRESET, BGM_SEED, N, SR, IDENT, TOTAL)\n") + s[b:]
p.write_text(s)
print(slug, '→', preset, seed, '|', bgm.PRESETS[preset]['desc'])
