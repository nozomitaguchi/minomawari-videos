"""ナレーション音声の長さから、場面ごとの長さとセリフの開始時刻を決めて timeline.js に書く。
絵は場面の中の「何番目のセリフが何秒に始まるか」（cue）に合わせて動く。"""
import json, re, wave, pathlib
here = pathlib.Path(__file__).parent
NAR = [l for l in json.load(open(here / 'narration.json'))['lines'] if l['who'] == 'N']

ESTIMATED = []
def dur(f, text=''):
    # 音声があればその長さ。まだなければ文字数から見つもる（sora で 平均0.4秒の誤差）
    p = here / 'lines' / f
    if p.exists():
        w = wave.open(str(p)); return w.getnframes() / w.getframerate()
    ESTIMATED.append(f)
    c = len(re.sub(r'[、。？！「」・ \n]', '', text)); k = len(re.findall(r'[、。？！]', text))
    return max(0.8, 0.186 * c + 0.33 * k - 0.15)

def wrap(s, n=27):
    # 長い字幕は、まん中に近い「、」で2行に分ける
    if len(s) <= n: return s
    cs = [i for i, ch in enumerate(s) if ch == '、']
    if not cs: return s
    i = min(cs, key=lambda i: abs(i - len(s) / 2))
    return s[:i + 1] + '\n' + s[i + 1:]

BUB = 1.5  # 吹き出しを出しておく秒数（声はなし）
# 行： ('N', ナレーション番号, 前の間) / ('S'|'B'|'K', 吹き出しの文, 前の間)
SCN = [
  ('opening', dict(fixed=4.5)),
  ('hook', dict(lead=0.8, rows=[('N', 0, 0), ('N', 1, 0.7), ('S', 'おなじ そらなのに？', 0.4), ('N', 2, 0.2)], tail=5.4)),
  ('guess', dict(lead=0.5, rows=[('N', 3, 0), ('N', 4, 0.5), ('N', 5, 0.45), ('N', 6, 0.45), ('N', 7, 3.6)], tail=0.6)),
  ('air', dict(lead=0.6, rows=[('N', 8, 0), ('N', 9, 0.6), ('N', 10, 0.6)], tail=1.0)),
  ('prism', dict(lead=0.6, rows=[('N', 11, 0), ('N', 12, 0.6), ('N', 13, 0.6)], tail=1.0)),
  ('scatter', dict(lead=0.6, rows=[('N', 14, 0), ('N', 15, 0.5), ('N', 16, 0.6), ('B', 'あおが ぴょんぴょん！', 0.3)], tail=0.8)),
  ('every', dict(lead=0.6, rows=[('N', 17, 0), ('N', 18, 0.6), ('N', 19, 0.7)], tail=1.0)),
  ('purple', dict(lead=0.6, rows=[('N', 20, 0), ('N', 21, 0.7)], tail=1.4)),
  ('sunset', dict(lead=0.6, rows=[('N', 22, 0), ('N', 23, 0.5), ('N', 24, 0.6), ('N', 25, 0.6), ('N', 26, 0.6)], tail=1.4)),
  ('mars', dict(lead=0.6, rows=[('N', 27, 0), ('N', 28, 0.6), ('K', 'はんたいだ〜', 0.3)], tail=0.8)),
  ('look', dict(lead=0.5, rows=[('N', 29, 0), ('N', 30, 1.0), ('N', 31, 0.6), ('N', 32, 0.6)], tail=1.4)),
  ('end', dict(lead=2.2, rows=[('S', 'またね！', 0), ('B', 'またねー！', -0.7)], tail=3.0)),
]

out, total = [], 0.0
for sid, cfg in SCN:
    if 'fixed' in cfg:
        out.append(dict(id=sid, dur=cfg['fixed'], lines=[])); total += cfg['fixed']; continue
    t, lines = cfg['lead'], []
    for k, (who, ref, gap) in enumerate(cfg['rows']):
        if k: t = lines[-1]['end'] + gap
        if who == 'N':
            f = f'N_{ref:02d}.wav'; d = dur(f, NAR[ref]['text']); txt = wrap(NAR[ref]['text'])
        else:
            f = None; d = BUB; txt = ref
        lines.append(dict(who=who, file=f, text=txt, start=round(t, 3), end=round(t + d, 3)))
    sdur = round(max(l['end'] for l in lines) + cfg['tail'], 3)
    out.append(dict(id=sid, dur=sdur, lines=lines)); total += sdur
open(here / 'timeline.js', 'w').write('window.TL = ' + json.dumps(dict(scenes=out, total=round(total, 3)), ensure_ascii=False) + ';\n')
for s in out: print(s['id'], s['dur'], [round(l['start'], 1) for l in s['lines']])
print('total', round(total, 1))
if ESTIMATED: print(f'※ ナレーションがない {len(ESTIMATED)} 行は文字数からの見つもり（下書きモード）')
open(here / 'timeline_mode.txt', 'w').write('estimated\n' if ESTIMATED else 'audio\n')
