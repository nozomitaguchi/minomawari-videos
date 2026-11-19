"""台本を書く前に、その動画の「正解の番号」と「吹き出しを話す子の順番」を決める。 python3 cast.py <slug> [吹き出しの数（おわりの場面をのぞく。ふつう3）]

- 正解の番号：いままでの動画で多い番号・直前の動画と同じ番号は出にくくして、ランダムに選ぶ。
- 吹き出し：おねえちゃん（S）と おとうと（B）が同じくらい（差は1まで）、カメレオン（K）は0〜1回。だれが先かもランダム。
  おわりの場面の「またね」2つ（S と B）はべつ。どちらの子が左に立つかは helpers.js の END_SWAP が決める。
- slug から決まる乱数なので、同じ slug なら何度実行しても同じ結果になる。
"""
import json, pathlib, random, re, sys, zlib

here = pathlib.Path(__file__).parent
slug = sys.argv[1]
n = int(sys.argv[2]) if len(sys.argv) > 2 else 3
rng = random.Random(zlib.crc32(slug.encode()))

# いままでの動画（VIDEOS.md の上からの順）
order = re.findall(r'^\| `?([a-z0-9-]+)/?`? \|', (here / 'VIDEOS.md').read_text(), re.M)
past = []
for s in order:
    p = here / s / 'narration.json'
    if s == slug or not p.exists():
        continue
    L = json.loads(p.read_text())['lines']
    ans = None
    for l in L:
        m = re.search(r'正解は\s*([1-3１-３①②③])', l['text']) if l['who'] == 'N' else None
        if m:
            ans = '123'['1１①2２②3３③'.index(m.group(1)) // 3]
    bub = ''.join(l['who'] for l in L if l['who'] in 'SBK')
    past.append((s, ans, bub))

cnt = {a: sum(1 for _, x, _ in past if x == a) for a in '123'}
last = [x for _, x, _ in past if x][-2:]
w = {a: 1.0 / (1 + cnt[a]) * (0.25 if a in last else 1.0) for a in '123'}
answer = rng.choices('123', weights=[w[a] for a in '123'])[0]

nk = rng.choice([0, 1, 1]) if n >= 3 else 0
rest = n - nk
first = rng.choice('SB')
other = 'B' if first == 'S' else 'S'
seq = [first if i % 2 == 0 else other for i in range(rest)]
if nk:
    seq.insert(rng.randrange(1, len(seq) + 1), 'K')
names = {'S': 'おねえちゃん', 'B': 'おとうと', 'K': 'カメレオン'}

print('いままでの動画（正解の番号・吹き出しの順）：')
for s, a, b in past:
    print(f'  {s:14s} {a or "?"}番  {b}')
print()
print(f'■ {slug}')
print(f'  正解は {answer}番 にする（3択の {answer}番目に正解を置く）')
print(f'  吹き出し（おわりの場面より前）：' + ' → '.join(f'{x}（{names[x]}）' for x in seq))
print('  キャラクターの出かた・動きは helpers.js の kidShow が動画ごとに選ぶ（TOPIC を変えれば変わる）')
