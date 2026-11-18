"""セリフ音声の長さから、各場面の新しい長さ・セリフの開始時刻・時間の伸び縮み（アンカー）を決めて timeline.js に書く。
アンカーは [新しい時刻, 元の絵の時刻] の組。絵は元の時刻で描き、間を直線でつなぐ。"""
import json, wave, pathlib
here = pathlib.Path(__file__).parent
orig = {s['id']: s for s in json.load(open(here / 'orig_caps.json'))}
def dur(f):
    w = wave.open(str(here / 'lines' / f)); return w.getnframes() / w.getframerate()
GAP = 0.45

# 各場面のセリフ：(だれ, ファイル, 字幕, 元の絵の時刻にそろえる開始, 元の絵の時刻にそろえる終わり, 前に空ける秒)
def caps(sid, i): return orig[sid]['caps'][i]
def one2one(sid, files):
    rows = []
    for i, f in enumerate(files):
        s, e, txt = caps(sid, i)
        rows.append(('N', f, txt, s, e, None))
    return rows

SCN = {
  'opening': dict(rows=[], fixed=True),
  'hook': dict(rows=[
      ('N', 'N_00.wav', '赤信号。止まって待とう。', 0.6, None, None),
      ('B', 'B_00.wav', None, 3.05, None, None),
      ('N', 'N_01.wav', '青信号だ。……でも、よーく見て。', 4.3, None, None),
      ('N', 'N_02.wav', 'この光、ほんとうに「青」？', 8.6, None, 0.9),
      ('S', 'S_00.wav', None, 10.6, None, 0.35),
  ], tail=(12.4, 0.6)),
  'guess': dict(rows=[
      ('S', 'S_01.wav', None, 0.3, None, None),
      ('N', 'G_00.wav', 'どうしてだと思う？ 予想してみよう。', 0.6, None, 0.3),
      ('O', 'G_01.wav', None, 1.0, None, 0.5),
      ('O', 'G_02.wav', None, 1.6, None, 0.45),
      ('O', 'G_03.wav', None, 2.2, None, 0.45),
      ('N', 'N_04.wav', '答えにたどりつくには、ちょっと昔にさかのぼります。', 8.4, None, 3.4),
  ], extra=[('after', 4, 0.3, 5.2)], tail=(9.6, 0.5)),
  'rail1841': dict(rows=one2one('rail1841', ['N_05.wav', 'N_06.wav', 'N_07.wav', 'N_08.wav'])),
  'white': dict(rows=one2one('white', ['N_09.wav', 'N_10.wav', 'N_11.wav', 'N_12.wav', 'N_13.wav'])),
  'yellow': dict(rows=one2one('yellow', ['N_14.wav', 'N_15.wav', 'N_16.wav', 'N_17.wav'])),
  'road': dict(rows=one2one('road', ['N_18.wav', 'N_19.wav', 'N_20.wav', 'N_21.wav'])),
  'ao': dict(rows=one2one('ao', ['N_22.wav', 'N_23.wav', 'N_24.wav', 'N_25.wav', 'N_26.wav', 'N_27.wav'])),
  'moved': dict(rows=one2one('moved', ['N_28.wav', 'N_29.wav', 'N_30.wav', 'N_31.wav'])),
  'look': dict(rows=[
      ('N', 'N_32.wav', '正解は②。緑までふくむ「あお」が、名前になったんだね。', 0.5, None, None),
      ('S', 'S_02.wav', None, 5.4, 7.2, 0.4),
      ('N', 'N_33.wav', '次に信号を見たら、\n青信号が緑と青のどちらに近いか、言い合ってみよう。', 8.6, None, 1.0),
      ('K', 'K_00.wav', None, 12.6, None, 0.5),
      ('N', 'N_34.wav', 'いくつかの交差点でくらべると、色のちがいが見つかるかも。', 13.2, None, 0.5),
      ('N', 'N_35.wav', '歩道で立ち止まって、見るだけにしようね。', 18.4, None, None),
  ], tail=(23.6, 0.8)),
  'end': dict(rows=[
      ('S', 'S_03.wav', None, 2.2, None, None),
      ('B', 'B_01.wav', None, 3.0, None, 0.15),
  ], tail=(5.0, 0.6)),
}
# ao の最後の字幕は音声に合わせる
ao = SCN['ao']['rows']; ao[-1] = ao[-1][:2] + ('呼び名が広まり、1947年には、\n決まりの上でも「青信号」になりました。',) + ao[-1][3:]

out, total = [], 0.0
for sid in [s for s in orig]:
    o = orig[sid]; cfg = SCN[sid]
    if cfg.get('fixed'):
        out.append(dict(id=sid, dur=o['dur'], anchors=[[0, 0], [o['dur'], o['dur']]], lines=[])); total += o['dur']; continue
    rows = cfg['rows']; t = None; anchors = [[0.0, 0.0]]; lines = []
    for k, (who, f, txt, so, eo, gap) in enumerate(rows):
        d = dur(f)
        if t is None: t = so  # 最初のセリフは元の時刻から
        else:
            prev_end = lines[-1]['end']
            if gap is None:
                # 元の字幕の間隔を目安に（0.4〜1.2秒）
                pe = rows[k - 1][4]
                g = min(1.2, max(0.4, so - pe)) if pe is not None else GAP
            else: g = gap
            t = prev_end + g
        lines.append(dict(who=who, file=f, text=txt, start=round(t, 3), end=round(t + d, 3)))
        anchors.append([t, so])
        if eo is not None: anchors.append([t + d, eo])
    for kind, idx, off, ot in cfg.get('extra', []):
        anchors.append([lines[idx]['end'] + off, ot])
    if 'tail' in cfg: ot, pad = cfg['tail']
    else:
        last_cap_end = rows[-1][4]; ot, pad = last_cap_end, 0.6
    tend = lines[-1]['end'] + pad
    anchors.append([tend, ot])
    newdur = tend + (o['dur'] - ot)
    anchors.append([newdur, o['dur']])
    anchors.sort()
    clean = []
    for a in anchors:
        if not clean or (a[0] > clean[-1][0] + 1e-3 and a[1] > clean[-1][1] + 1e-3): clean.append([round(a[0], 3), round(a[1], 3)])
        else: print('skip anchor', sid, a)
    out.append(dict(id=sid, dur=round(newdur, 3), anchors=clean, lines=lines)); total += newdur
open(here / 'timeline.js', 'w').write('window.TL = ' + json.dumps(dict(scenes=out, total=round(total, 3)), ensure_ascii=False) + ';\n')
for s in out: print(s['id'], s['dur'], len(s['lines']))
print('total', round(total, 1))
