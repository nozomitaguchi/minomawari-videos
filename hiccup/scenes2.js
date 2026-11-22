
// みのまわり図鑑 動画「しゃっくりは、どうして急に出て止まらないの？」
// 色の約束：すう息＝あお、はく息＝オレンジ、おうかくまく＝ちゃいろ（ピクッとするときは あか）、
// 声のとびら＝あか、しらせ（神経）＝きいろ、脳のおく＝むらさき

// ---------- しゃっくりの道具 ----------
const HC = {
  in: '#3d8fd6', out: '#f08a3c', dia: '#a9744a', hot: '#e8412c', door: '#e0483a', nerve: '#f2c230',
  brain: '#f4b9c4', brainD: '#e08fa0', stem: '#8a6fd0', lung: '#f7a8b4', lungD: '#e58a9a',
  skin: '#f6d6bd', skinD: '#e6bb9e', cav: '#fff3ea', hair: '#3a2a22', pipe: '#fffdf8', pipeW: '#e4a698',
};
// 折れ線の上の、割合 u（0〜1）の点
function along(pts, u) {
  let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let s = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) {
    if (s <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(s / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
    s -= seg[i];
  }
  return pts[pts.length - 1];
}
// ぎざぎざの ふきだし（ヒック！）
const burstPath = (r, n = 12, k = 0.74, sx = 1.75) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - 0.2, rr = i % 2 ? r * k : r; d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr * sx).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`; }
  return d + 'Z';
};
const hicBurst = (str = 'ヒック！', r = 70, { fill = '#ffd84a', col = C.red } = {}) =>
  `<path d="${burstPath(r)}" fill="${fill}" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>` + ctext(0, 3, str, { size: r * 0.56, w: 900, fill: col });
// 出て、すこしして消える
const hicPop = (t, t0, x, y, { r = 70, str = 'ヒック！', hold = 0.75, rot = -8, fill = '#ffd84a', col = C.red } = {}) => {
  const k = prog(t, t0, 0.18), o = 1 - prog(t, t0 + hold, 0.3);
  return k <= 0 || o <= 0 ? '' : g(hicBurst(str, r, { fill, col }), { x, y, s: Math.max(back(k), 0.001), o, r: rot });
};
// ピクッとはねる（0〜1）
const jerk = (t, t0, d = 0.38) => { const k = (t - t0) / d; return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0; };
// おうかくまくが かってに ピクッ：すばやく下がって、しばらくして もどる（0〜1）
const spike = x => x <= 0 ? 0 : x < 0.09 ? x / 0.09 : x < 0.55 ? 1 : x < 1.25 ? 1 - eio((x - 0.55) / 0.7) : 0;
// 行の中の割合の時刻（「ヒック」と言うあたりに合わせる）
const at = (k, f) => lerp(cue(k), cueE(k), f);

// ---------- からだの絵（前から見た図。まんなかは むねのあたり） ----------
// d：おうかくまく 0 ゆるむ（ドーム）〜 1 ちぢむ（下がる）
const diaCtrl = d => lerp(40, 200, d);
const domeY = (x, d) => { const u = (x + 207) / 414; return 240 - 2 * u * (1 - u) * (240 - diaCtrl(d)); };
const lungPath = d => {
  const yo = domeY(-176, d) - 20, ym = domeY(-105, d) - 26, yi = domeY(-30, d) - 20;
  return `M -30 -30 C -60 -118 -150 -112 -170 -24 C -184 30 -184 ${yo - 70} -178 ${yo} Q -105 ${ym} -30 ${yi} Z`;
};
const PIPE_D = 'M 0 -204 L 0 -52 M 0 -56 Q -6 -20 -62 0 M 0 -56 Q 6 -20 62 0';
const DOOR_Y = -150;
const nervePts = (d, sd) => [[sd * 4, -262], [sd * 27, -226], [sd * 27, -66], [sd * 20, -10], [sd * 20, domeY(sd * 20, d) - 6]];
const airPts = sd => [[250, -330], [70, -262], [0, -238], [0, -60], [sd * 30, -20], [sd * 100, 50]];
function body(tt, { d = 0, hot = 0, gl = 0, brain = 0, nerve = 0, pulse = -1, eyes = 'open', mouth = 'smile', glow = 0, doorGlow = 0 } = {}) {
  const dc = mix(HC.dia, HC.hot, clamp(hot)), dq = `M -207 240 Q 0 ${diaCtrl(d)} 207 240`;
  let o = '';
  // うで・からだ・くび
  o += `<path d="M -246 -70 L -262 250 M 246 -70 L 262 250" stroke="${HC.skin}" stroke-width="58" stroke-linecap="round" fill="none"/>`;
  o += `<path d="M -52 -150 C -150 -150 -236 -122 -240 -40 L -226 376 Q -224 400 -200 400 L 200 400 Q 224 400 226 376 L 240 -40 C 236 -122 150 -150 52 -150 Z" fill="${HC.skin}" stroke="${HC.skinD}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<rect x="-50" y="-200" width="100" height="72" fill="${HC.skin}"/>`;
  // あたま（おとうとの かお）
  o += `<g transform="translate(0 -290) scale(1.3)"><circle r="88" fill="${HC.skin}"/><circle cx="-88" cy="8" r="16" fill="${HC.skin}"/><circle cx="88" cy="8" r="16" fill="${HC.skin}"/>
    <g opacity="${1 - 0.7 * brain}"><path d="M -92 10 Q -100 -62 -50 -92 Q 0 -114 52 -92 Q 100 -66 92 10 Q 88 -16 76 -30 Q 54 -10 28 -38 Q 2 -16 -24 -42 Q -48 -24 -70 -34 Q -86 -20 -92 10 Z" fill="${HC.hair}"/><path d="M -6 -106 Q -2 -128 26 -126 Q 14 -118 16 -104 Z" fill="${HC.hair}"/></g>
    <g opacity="${1 - 0.75 * brain}"><circle cx="-52" cy="30" r="14" fill="#f2a99a" opacity="0.75"/><circle cx="52" cy="30" r="14" fill="#f2a99a" opacity="0.75"/>${chEyes(0, 6, 32, tt, eyes, [0, 0], 4.2)}${chMouth(0, 40, tt, mouth)}</g></g>`;
  // むねの中・空気の通り道・はい
  o += `<path d="M -196 -100 Q 0 -146 196 -100 L 207 240 Q 0 ${diaCtrl(d)} -207 240 Z" fill="${HC.cav}"/>`;
  o += `<path d="${PIPE_D}" fill="none" stroke="${HC.pipeW}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>`;
  const lp = lungPath(d), lung = `<path d="${lp}" fill="${HC.lung}" stroke="${HC.lungD}" stroke-width="6" stroke-linejoin="round"/>`;
  o += lung + `<g transform="scale(-1 1)">${lung}</g>`;
  o += `<path d="${PIPE_D}" fill="none" stroke="${HC.pipe}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
  // 声のとびら
  const fa = lerp(72, 0, clamp(gl)), flap = `<g transform="rotate(${fa})"><rect x="-1" y="-5" width="15" height="10" rx="5" fill="${HC.door}"/></g>`;
  o += `<g transform="translate(-13 ${DOOR_Y})">${flap}</g><g transform="translate(13 ${DOOR_Y}) scale(-1 1)">${flap}</g>`;
  if (doorGlow > 0) o += `<circle cx="0" cy="${DOOR_Y}" r="${40 + Math.sin(tt * 6) * 4}" fill="none" stroke="${HC.door}" stroke-width="8" opacity="${doorGlow}"/>`;
  // おうかくまく
  if (glow > 0) o += `<path d="${dq}" fill="none" stroke="${dc}" stroke-width="${52 + Math.sin(tt * 6) * 8}" stroke-linecap="round" opacity="${0.3 * glow}"/>`;
  o += `<path d="${dq}" fill="none" stroke="${dc}" stroke-width="22" stroke-linecap="round"/>`;
  // 脳と しらせの道
  if (brain > 0) {
    o += `<g transform="translate(0 -290) scale(1.3)" opacity="${brain}">
      <path d="M -62 -40 C -72 -80 -30 -98 0 -88 C 30 -98 72 -80 62 -40 C 70 -14 40 -2 14 -6 L -14 -6 C -40 -2 -70 -14 -62 -40 Z" fill="${HC.brain}" stroke="${HC.brainD}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 0 -86 L 0 -10 M -42 -66 q 16 10 4 26 M 40 -68 q -16 12 -2 28 M -28 -28 q 12 -8 18 6 M 24 -32 q -10 -6 -16 8" fill="none" stroke="${HC.brainD}" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="-10" y="-12" width="20" height="36" rx="10" fill="${HC.stem}" stroke="#fff" stroke-width="3"/></g>`;
  }
  if (nerve > 0) [-1, 1].forEach(sd => {
    const pts = nervePts(d, sd);
    o += `<path d="M ${pts.map(p => p.join(' ')).join(' L ')}" fill="none" stroke="${HC.nerve}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${nerve}"/>`;
    if (pulse >= 0 && pulse <= 1) { const [px, py] = along(pts, pulse); o += `<circle cx="${px}" cy="${py}" r="20" fill="${HC.nerve}" opacity="0.45"/><circle cx="${px}" cy="${py}" r="11" fill="#fff8d0" stroke="${HC.nerve}" stroke-width="5"/>`; }
  });
  return o;
}
// 空気のつぶ（dir 1：すう＝あお、-1：はく＝オレンジ）。amt はこさ
function airDots(tt, { dir = 1, amt = 1, speed = 0.45, n = 16, stopAt = 1 } = {}) {
  if (amt <= 0.01) return '';
  let o = ''; const col = dir > 0 ? HC.in : HC.out;
  for (let i = 0; i < n; i++) {
    let u = (tt * speed + i / n) % 1; const fd = Math.min(1, u * 9, (1 - u) * 7);
    if (dir < 0) u = 1 - u;
    if (u > stopAt) continue;
    const [x, y] = along(airPts(i % 2 ? 1 : -1), u);
    o += `<circle cx="${x}" cy="${y}" r="10" fill="${col}" stroke="#fff" stroke-width="3" opacity="${amt * fd}"/>`;
  }
  return o;
}
// ラベルから絵へ のびる線
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="12" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="11" fill="${col}" stroke="#fff" stroke-width="4"/></g>`;
// カメレオンを 画面の内がわ（左）向きにして出す。吹き出しは talkBubble で頭に向けて置く
const chamL = (t, x, y, o = {}) => `<g transform="translate(${2 * x} 0) scale(-1 1)">${kidShow('K', t, x, y, { enter: 'pop', ...o, bubble: false })}</g>`;
const warnIcon = () => `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });

// 1. つかみ：ごはんのあと、急に「ヒック」
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fbeedb"/><rect y="800" width="1920" height="280" fill="#e9cfa4"/><rect y="792" width="1920" height="14" fill="#d9b98a"/>`;
    out += `<g transform="translate(330 400)"><rect x="-170" y="-150" width="340" height="300" rx="14" fill="#bfe3f5" stroke="#fff" stroke-width="18"/><path d="M 0 -150 L 0 150 M -170 0 L 170 0" stroke="#fff" stroke-width="10"/>${cloud(-70 + t * 3, -60, 0.45)}</g>`;
    // ちゃぶ台と ごはんのあと
    out += `<g transform="translate(1560 840)"><rect x="-200" y="20" width="28" height="120" rx="10" fill="#b57f4c"/><rect x="172" y="20" width="28" height="120" rx="10" fill="#b57f4c"/><ellipse cx="0" cy="12" rx="280" ry="48" fill="#c08a55"/><ellipse cx="0" cy="0" rx="280" ry="48" fill="#dba56d"/>
      <path d="M -170 -56 Q -170 -4 -116 -4 Q -62 -4 -62 -56 Z" fill="#fff" stroke="#8fb3c6" stroke-width="6" stroke-linejoin="round"/><ellipse cx="-116" cy="-56" rx="54" ry="11" fill="#fdfdfd" stroke="#8fb3c6" stroke-width="5"/>
      <ellipse cx="30" cy="-16" rx="84" ry="17" fill="#fff" stroke="#d8cdb8" stroke-width="5"/><ellipse cx="30" cy="-18" rx="52" ry="9" fill="#f3ecdc"/>
      <path d="M 150 -90 L 206 -90 L 198 -8 L 158 -8 Z" fill="#dff1f8" stroke="#8fb3c6" stroke-width="5" stroke-linejoin="round"/></g>`;
    // おとうとが しゃっくり
    const H = [at(0, 0.78), at(1, 0.5), at(1, 0.82), at(3, 0.45)];
    const jk = H.reduce((a, h) => Math.max(a, jerk(t, h)), 0), act = H.some(h => t > h - 0.05 && t < h + 0.55);
    out += `<g transform="translate(0 ${-jk * 36})">${kidShow('B', t, 640, 940, { s: 0.74, start: 0, n: 1, enter: 'pop', bubble: false, eyes: act ? 'wide' : 'open', mouth: act ? 'o' : 'smile' })}</g>`;
    H.forEach((h, i) => { out += hicPop(t, h, 880 + (i % 2) * 30, 560 - (i % 2) * 60, { r: 80, rot: i % 2 ? 6 : -8 }); });
    out += kidShow('S', t, 1120, 940, { s: 0.66, start: 0.3, n: 0, look: [-8, -2] });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 250);
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.red}">しゃっくり</tspan>は、どうして</text>`, { x: 960, y: 440, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">急に 出て、<tspan fill="${C.blue}">止まらない</tspan>の？</text>`, { x: 960, y: 620, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(hicBurst('ヒック！', 76), t, t0 + 1.8, 960, 800, { s: 1 });
    }
    return out;
  },
});

// 2. 予想（正解は1番）
const OPTS = [['①', 'のどの おくで、とびらが しまる おと'], ['②', 'おなかの なかで、くうきが はねる おと'], ['③', 'はなの おくが、ふるえる おと']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(g(hicBurst('ヒック！', 62), { x: -470, r: -8 }) + text(90, 0, 'は どこで なっている？', { size: 80, w: 900 }), t, 0.3, 960, 215);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 400 + i * 168);
    });
    out += kidShow('S', t, 1700, 870, { s: 0.6, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1690, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 息をすう筋肉「おうかくまく」
const BX = 1330, BY = 478, BS = 0.84;   // からだの絵の場所
const bpt = (x, y) => [BX + x * BS, BY + y * BS];
SCENES.push({
  id: 'breath',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const dAt = x => x < c2 ? 0.06 + 0.06 * Math.sin(x * 2) : x < c3 ? eio(prog(x, c2 + 0.4, 1.7)) : x < c4 ? 1 - eio(prog(x, c3 + 0.4, 1.7)) : 0.5 - 0.5 * Math.cos((x - c4 - 0.3) / 3.4 * Math.PI * 2);
    const d = dAt(t), flow = (dAt(t + 0.06) - dAt(t - 0.06)) / 0.12;
    const inA = t < c2 ? 0 : clamp(flow * 2.2), outA = t < c2 ? 0 : clamp(-flow * 2.2);
    const bo = prog(t, 0.2, 0.5);
    out += g(body(NOW.t, { d, glow: win(t, cue(0) + 1.2, cue(1) + 0.4, 0.4) }) + airDots(NOW.t, { dir: 1, amt: inA }) + airDots(NOW.t, { dir: -1, amt: outA }), { x: BX, y: BY, s: BS, o: bo });
    // なまえ
    const [px, py] = bpt(-150, domeY(-150, d));
    const nO = prog(t, cue(0) + 1.4, 0.4);
    out += pointer(700, 300, px, py, HC.dia, nO);
    out += pop(badge('おうかくまく', { fill: HC.dia, size: 56, pad: 44 }), t, cue(0) + 1.4, 480, 300);
    out += g(text(0, 0, 'むねと おなかの さかい', { size: 40, w: 700, fill: C.muted }), { x: 480, y: 392, o: prog(t, cue(0) + 2.0, 0.4) });
    // ドームの形
    const mO = win(t, cue(1) + 0.2, c2 - 0.1, 0.35);
    out += g(`<path d="M -150 40 Q 0 -100 150 40" fill="none" stroke="${HC.dia}" stroke-width="20" stroke-linecap="round"/>` + text(0, 96, 'ドームの かたち', { size: 46, w: 900 }) + text(0, 160, 'いきを すう ための きんにく', { size: 42, w: 900, fill: HC.dia }), { x: 480, y: 560, o: mO });
    // すう・はく
    const row = (st, col, a, b, y, arrow) => pop(`<rect x="-330" y="-62" width="660" height="124" rx="30" fill="#fff" filter="url(#shadow)"/><rect x="-330" y="-62" width="24" height="124" rx="12" fill="${col}"/>` +
      g(`<path d="M 0 ${arrow * -34} L 0 ${arrow * 34} M -22 ${arrow * 10} L 0 ${arrow * 34} L 22 ${arrow * 10}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`, { x: -262 }) +
      text(-216, -22, a, { size: 40, w: 900, anchor: 'start' }) + text(-216, 28, b, { size: 40, w: 900, anchor: 'start', fill: col }), t, st, 480, y, { end: c4 + 0.1 });
    out += row(c2 + 0.2, HC.in, 'ちぢんで さがる', 'くうきが はいに はいる', 520, 1);
    out += row(c3 + 0.2, HC.out, 'ゆるんで うえに もどる', 'くうきが おしだされる', 680, -1);
    // かってに つづく
    const aO = prog(t, c4 + 0.2, 0.4);
    if (aO > 0) {
      const ph = Math.sin((t - c4 - 0.3) / 3.4 * Math.PI * 2 + 0.2) > 0;
      out += g(card(660, 300) + text(0, -70, 'かんがえなくても', { size: 50, w: 900 }) + text(0, 0, 'かってに つづく', { size: 56, w: 900, fill: C.accent }) +
        g(badge(ph ? 'すう' : 'はく', { fill: ph ? HC.in : HC.out, size: 40 }), { y: 86 }), { x: 480, y: 600, o: aO, s: lerp(0.94, 1, eo(aO)) });
    }
    return out;
  },
});

// 4. おうかくまくが かってに ピクッ
SCENES.push({
  id: 'spasm',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c2 = cue(2);
    // ピクッの時刻：1行目の「ピクッ」、2行目の「ヒュッ」、命令がとどいたとき
    const tn = c2 + 1.6;                       // しらせが 出る
    const arrive = k => tn + k * 2.6 + 1.0;    // おうかくまくに とどく
    const TH = [at(0, 0.72), at(1, 0.55), arrive(0), arrive(1), arrive(2)];
    const sp = TH.reduce((a, h) => Math.max(a, spike(t - h)), 0);
    const base = 0.3 - 0.3 * Math.cos(t * 1.8), fl = Math.sin(t * 1.8) * (1 - sp) * (1 - prog(t, c2 - 0.3, 0.4));
    const d = lerp(base, 1.06, sp);
    const rush = TH.reduce((a, h) => Math.max(a, win(t, h - 0.02, h + 0.5, 0.1)), 0);
    const br = prog(t, c2 - 0.2, 0.6);
    let pulse = -1;
    for (let k = 0; k < 3; k++) { const u = (t - tn - k * 2.6) / 1.0; if (u >= 0 && u <= 1) pulse = u; }
    out += g(body(NOW.t, { d, hot: sp, brain: br, nerve: br, pulse, eyes: sp > 0.3 ? 'wide' : 'open', mouth: sp > 0.3 ? 'o' : 'smile' }) + airDots(NOW.t, { dir: 1, amt: rush, speed: 1.9, n: 20 }) + airDots(NOW.t, { dir: 1, amt: clamp(fl) * 0.9 * (rush > 0 ? 0 : 1) }) + airDots(NOW.t, { dir: -1, amt: clamp(-fl) * 0.9 * (rush > 0 ? 0 : 1) }), { x: BX, y: BY, s: BS });
    // ピクッ！ ヒュッ
    TH.forEach((h, i) => {
      const [jx, jy] = bpt(250, 215);
      out += hicPop(t, h, jx + 60, jy - 10, { r: 62, str: 'ピクッ！', fill: '#ffe0d8', col: HC.hot, hold: 0.7, rot: 6 });
      if (i >= 1) { const [ax, ay] = bpt(300, -330); out += hicPop(t, h + 0.05, ax + 10, ay + 30, { r: 54, str: 'ヒュッ', fill: '#dcebfb', col: HC.in, hold: 0.6, rot: -6 }); }
    });
    // ひだりの説明
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const n0 = win(t, 0.3, at(0, 0.72) - 0.1, 0.3);
      let a = g(badge('ふだんの いき', { fill: C.accent, size: 50, pad: 44 }) + text(0, 110, 'ゆっくり さがって、ゆっくり もどる', { size: 42, w: 900 }), { x: 480, y: 330, o: n0 });
      a += pop(badge('かってに ピクッ！', { fill: HC.hot, size: 60, pad: 48 }), t, at(0, 0.72) + 0.1, 480, 330);
      a += g(text(0, 0, 'うごかそうと して いないのに', { size: 42, w: 900 }) + text(0, 62, 'おうかくまくが きゅうに ちぢむ', { size: 42, w: 900, fill: HC.dia }), { x: 480, y: 450, o: prog(t, at(0, 0.72) + 0.6, 0.4) });
      a += pop(`<rect x="-330" y="-62" width="660" height="124" rx="30" fill="#fff" filter="url(#shadow)"/><rect x="-330" y="-62" width="24" height="124" rx="12" fill="${HC.in}"/>` + text(0, 2, 'くうきが きゅうに すいこまれる', { size: 40, w: 900, fill: HC.in }), t, cue(1) + 0.3, 480, 680);
      out += g(a, { o: aO });
    }
    const bO = prog(t, c2 + 0.2, 0.5);
    if (bO > 0) {
      const [sx, sy] = bpt(-12, -290 + 6 * 1.3);
      out += pointer(700, 330, sx, sy, HC.stem, prog(t, c2 + 0.6, 0.4));
      let b = pop(badge('のうの おく', { fill: HC.stem, size: 56, pad: 44 }), t, c2 + 0.5, 480, 330);
      b += g(text(0, 0, 'いきを うけもつ ところ', { size: 46, w: 900 }), { x: 480, y: 440, o: prog(t, c2 + 1.0, 0.4) });
      b += pop(`<rect x="-330" y="-90" width="660" height="180" rx="30" fill="#fff" filter="url(#shadow)"/><circle cx="-262" cy="0" r="22" fill="#fff8d0" stroke="${HC.nerve}" stroke-width="9"/>` + text(-216, -30, 'ここから「ちぢめ」の', { size: 40, w: 900, anchor: 'start' }) + text(-216, 28, 'しらせが でる', { size: 40, w: 900, anchor: 'start' }), t, tn - 0.2, 480, 620);
      b += g(text(0, 0, '…と かんがえられて いる', { size: 38, w: 700, fill: C.muted }), { x: 480, y: 770, o: prog(t, tn + 0.8, 0.5) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 5. 声のとびらが パタン → 「ヒック」
const GX = 350, GY = 545, GS = 0.74, ZX = 1010, ZY = 475, ZR = 290;
function pipeZoom(gl, inner) {
  const a = lerp(72, 0, clamp(gl));
  const door = `<g transform="rotate(${a})"><rect x="-10" y="-15" width="124" height="30" rx="15" fill="${HC.door}" stroke="#b3342a" stroke-width="4"/></g>`;
  return `<circle r="${ZR}" fill="#fff" filter="url(#shadow)"/><clipPath id="zc"><circle r="${ZR - 6}"/></clipPath><g clip-path="url(#zc)">
    <rect x="-300" y="-300" width="600" height="600" fill="${HC.skin}"/>
    <rect x="-150" y="-300" width="300" height="600" fill="${HC.pipeW}"/><rect x="-112" y="-300" width="224" height="600" fill="${HC.pipe}"/>
    ${inner}
    <g transform="translate(-112 0)">${door}</g><g transform="translate(112 0) scale(-1 1)">${door}</g>
    <circle cx="-112" cy="0" r="13" fill="#b3342a"/><circle cx="112" cy="0" r="13" fill="#b3342a"/></g>
  <circle r="${ZR}" fill="none" stroke="${C.ink}" stroke-width="8"/>`;
}
const zdot = (x, y, o = 1, r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${HC.in}" stroke="#fff" stroke-width="4" opacity="${o}"/>`;
SCENES.push({
  id: 'glottis',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const T1 = at(1, 0.8), R1 = cue(3) - 0.5, T2 = at(3, 0.62), R2 = cue(5) + 0.2, T3 = at(5, 0.85);
    const EV = [[T1, R1], [T2, R2], [T3, 1e9]];
    const slam = x => clamp(x / 0.07);
    const gl = t < T1 ? 0 : t < R1 ? slam(t - T1) : t < T2 ? 1 - prog(t, R1, 0.4) : t < R2 ? slam(t - T2) : t < T3 ? 1 - prog(t, R2, 0.4) : slam(t - T3);
    const sp = EV.reduce((a, [h]) => Math.max(a, spike(t - (h - 0.25))), 0);
    const d = lerp(0.14 + 0.12 * Math.sin(t * 1.6), 1.06, sp);
    const rushA = EV.reduce((a, [h]) => Math.max(a, win(t, h - 0.27, h + 0.25, 0.08)), 0);
    // からだ（ひだり）
    const [nx, ny] = [GX, GY + DOOR_Y * GS];
    const zo = prog(t, cue(0) + 0.5, 0.5);
    out += `<g opacity="${zo * 0.8}"><line x1="${nx}" y1="${ny}" x2="${ZX - ZR * 0.62}" y2="${ZY - ZR * 0.78}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="14 10"/><line x1="${nx}" y1="${ny}" x2="${ZX - ZR * 0.62}" y2="${ZY + ZR * 0.78}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="14 10"/></g>`;
    out += g(body(NOW.t, { d, hot: sp, gl, doorGlow: prog(t, cue(0) + 0.3, 0.4) * 0.9, eyes: sp > 0.3 ? 'wide' : 'open', mouth: sp > 0.3 ? 'o' : 'smile' }) + airDots(NOW.t, { dir: 1, amt: rushA, speed: 1.9, n: 20, stopAt: gl > 0.5 ? 0.58 : 1 }), { x: GX, y: GY, s: GS });
    out += pop(badge('のどの おく', { fill: C.ink, size: 32 }), t, cue(0) + 0.4, 136, ny - 96);
    // 大きくした図（みぎ）：上から下へ 空気が通る
    let inner = '';
    const calm = EV.reduce((a, [h, r]) => Math.min(a, 1 - win(t, h - 0.45, r + 0.2, 0.15)), 1);
    if (calm > 0) for (let i = 0; i < 9; i++) { const y = -330 + ((t * 150 + i * 73) % 660); inner += zdot((rnd(i, 5) - 0.5) * 130, y, calm * 0.9); }
    EV.forEach(([h, rel], e) => {
      if (t < h - 0.32 || t > rel + 0.1) return;
      const fo = 1 - prog(t, rel - 0.35, 0.3);
      for (let i = 0; i < 24; i++) {
        const ts = h - 0.3 + i * 0.012, y0 = -330 - (i % 5) * 16, yf = x => y0 + 1500 * (x - ts);
        if (t < ts) continue;
        const x = (rnd(i + e * 31, 1) - 0.5) * 176, yh = yf(h);
        let y = yf(t), jx = 0;
        if (yh < -40) { const lim = Math.max(yh, -52 - rnd(i, 3) * 190); if (y >= lim) { y = lim + Math.sin(t * 26 + i) * 3; jx = Math.sin(t * 22 + i * 2) * 3; } }
        if (y > 330) continue;
        inner += zdot(x + jx, y, fo);
      }
    });
    // すう向きの矢印
    const ar = prog(t, cue(5) + 0.4, 0.4);
    if (ar > 0) inner += g(`<path d="M 0 -60 L 0 40 M -34 6 L 0 44 L 34 6" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><path d="M 0 -60 L 0 40 M -34 6 L 0 44 L 34 6" fill="none" stroke="${HC.in}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`, { y: -190 + Math.sin(t * 5) * 8, o: ar });
    out += g(pipeZoom(gl, inner), { x: ZX, y: ZY, s: Math.max(back(zo), 0.001), o: zo });
    // パタンの しるし
    EV.forEach(([h]) => { const k = prog(t, h, 0.3); if (k > 0 && k < 1) out += `<g transform="translate(${ZX} ${ZY})" opacity="${1 - k}"><path d="M -150 -40 l -40 -26 M 150 -40 l 40 -26 M -160 0 l -50 0 M 160 0 l 50 0" stroke="${HC.door}" stroke-width="10" stroke-linecap="round" transform="scale(${1 + k * 0.25})"/></g>`; });
    // みぎの説明
    const RX = 1620;
    const l0 = win(t, cue(0) + 1.0, cue(1) - 0.1, 0.3);
    if (l0 > 0) {
      out += pointer(RX - 190, 280, ZX + 30, ZY - 190, HC.in, l0) + g(badge('くうきの とおりみち', { fill: HC.in, size: 40 }), { x: RX, y: 280, o: l0 });
      out += pointer(RX - 200, 560, ZX + 92, ZY + 58, HC.door, l0) + g(badge('とびらの ような すきま', { fill: HC.door, size: 40 }), { x: RX - 20, y: 560, o: l0 });
    }
    out += hicPop(t, T1, RX - 60, 330, { r: 74, str: 'パタン！', fill: '#ffd2c6', col: HC.door, hold: Math.max(0.8, cue(3) - 0.5 - T1), rot: 5 });
    const tb = win(t, T1 + 0.6, cue(3) - 0.4, 0.3);
    if (tb > 0) out += g(card(500, 250) + text(0, -76, 'すいはじめてから', { size: 38, w: 900 }) + text(0, -4, '0.035びょう', { size: 68, w: 900, fill: HC.door }) + text(0, 74, 'で しまる（あっというま）', { size: 36, w: 900 }), { x: RX - 10, y: 600, o: tb, s: lerp(0.94, 1, eo(tb)) });
    const bl = win(t, cue(2) + 0.3, cue(3) - 0.4, 0.3);
    if (bl > 0) out += pointer(ZX + 60, ZY - 300 - 44, ZX + 30, ZY - 110, HC.in, bl) + g(badge('くうきが せきとめられる', { fill: HC.in, size: 40 }), { x: ZX + 60, y: ZY - 300 - 60, o: bl });
    out += hicPop(t, T2, RX - 20, 370, { r: 112, hold: Math.max(1.0, cue(5) - 0.3 - T2), rot: -6 });
    out += chamL(t, 1770, 880, { s: 0.7, start: cue(4) - 0.9, n: 0 }) + talkBubble('K', 1560, 640, 1770 - 105 * 0.7, 880 - 160 * 0.7);
    // すうときに鳴る
    const c5 = cue(5);
    out += pop(`<rect x="-250" y="-52" width="500" height="104" rx="26" fill="#fff" filter="url(#shadow)"/>` + text(-40, 2, 'はく とき', { size: 46, w: 900, fill: HC.out }) + g(cross(0, 0, 0.36), { x: 170 }), t, at(5, 0.35), RX - 20, 240);
    out += pop(`<rect x="-250" y="-62" width="500" height="124" rx="30" fill="${HC.in}" filter="url(#shadow)"/>` + text(-40, 2, 'すう とき', { size: 56, w: 900, fill: '#fff' }) + `<circle cx="170" cy="0" r="32" fill="none" stroke="#fff" stroke-width="10"/>`, t, at(5, 0.6), RX - 20, 390);
    out += hicPop(t, T3, RX - 60, 560, { r: 84, hold: 9, rot: -6 });
    return out;
  },
});

// 6. どうして止まらない？ 何回もくり返す・たいていは数分・きっかけ
const trigIcon = {
  soda: t => {
    let o = `<path d="M -70 -110 L 70 -110 L 54 110 Q 52 124 38 124 L -38 124 Q -52 124 -54 110 Z" fill="#fde9b8" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/><path d="M -64 -60 L 64 -60 L 52 108 Q 50 118 38 118 L -38 118 Q -50 118 -52 108 Z" fill="#f6b84a" opacity="0.85"/>`;
    for (let i = 0; i < 9; i++) { const k = (t * 0.5 + i / 9) % 1; o += `<circle cx="${(rnd(i, 21) - 0.5) * 86}" cy="${104 - k * 180}" r="${6 + rnd(i, 22) * 6}" fill="#fff" opacity="${0.9 * (1 - k * 0.5)}"/>`; }
    return o + `<path d="M 26 -150 L 4 100" stroke="${C.redUi}" stroke-width="12" stroke-linecap="round"/>`;
  },
  full: () => `<path d="M -110 0 Q -110 110 0 110 Q 110 110 110 0 Z" fill="#fff" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/><path d="M -100 0 Q -90 -120 0 -130 Q 90 -120 100 0 Z" fill="#fffdf6" stroke="#d8cdb8" stroke-width="6" stroke-linejoin="round"/>
    <path d="M -50 -60 l 14 6 M 10 -90 l 14 6 M 40 -40 l 14 6 M -20 -30 l 14 6 M -64 -20 l 14 6" stroke="#d8cdb8" stroke-width="6" stroke-linecap="round"/><rect x="-114" y="-8" width="228" height="20" rx="10" fill="${C.blueUi}"/><path d="M -60 110 L 60 110 L 50 132 L -50 132 Z" fill="#8fb3c6"/>`,
  temp: t => `<g transform="translate(-74 -10)"><circle r="46" fill="#ff9a2e"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M 0 -62 L 0 -82" stroke="#ff9a2e" stroke-width="12" stroke-linecap="round" transform="rotate(${i * 45 + t * 20})"/>`).join('')}</g>
    <g transform="translate(84 10)">${[0, 1, 2].map(i => `<g transform="rotate(${i * 60})"><path d="M 0 -70 L 0 70 M -18 -52 L 0 -34 L 18 -52 M -18 52 L 0 34 L 18 52" fill="none" stroke="${C.blue}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></g>`).join('')}</g>`,
};
SCENES.push({
  id: 'repeat',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2), c3 = cue(3), tS = at(2, 0.7);
    const HT = Array.from({ length: 8 }, (_, k) => lerp(0.9, tS - 0.9, k / 7));
    const aO = 1 - prog(t, c3 - 0.5, 0.4);
    if (aO > 0) {
      let a = '';
      const jk = HT.reduce((m, h) => Math.max(m, jerk(t, h)), 0), act = HT.some(h => t > h - 0.05 && t < h + 0.5);
      const hold = t > c1 + 0.3 && t < c2 - 0.2, done = t > tS;
      a += `<g transform="translate(0 ${-jk * 36})">${kidShow('B', t, 330, 840, { s: 0.74, start: 0, n: 0, enter: 'pop', bubble: false, eyes: done ? 'smile' : act ? 'wide' : hold ? 'closed' : 'open', mouth: done ? 'smile' : act ? 'o' : hold ? 'flat' : 'smile' })}</g>`;
      HT.forEach((h, k) => { a += hicPop(t, h, 540, 560 - (k % 2) * 50, { r: 66, hold: 0.6, rot: k % 2 ? 6 : -8 }); });
      // 時間の線に ヒックが ならぶ
      a += g(text(0, 0, 'いちど はじまると、なんかいも くりかえす', { size: 46, w: 900 }), { x: 1250, y: 190, o: prog(t, cue(0) + 0.4, 0.4) });
      const lk = prog(t, 0.5, 0.6);
      a += `<g opacity="${lk}"><path d="M 700 380 L 1830 380 M 1806 362 L 1832 380 L 1806 398" fill="none" stroke="${C.muted}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>` + g(text(0, 0, 'じかん', { size: 32, w: 700, fill: C.muted }), { x: 1780, y: 424, o: lk });
      HT.forEach((h, k) => {
        const kk = prog(t, h + 0.1, 0.25); if (kk <= 0) return;
        const x = 770 + k * 142;
        a += `<circle cx="${x}" cy="380" r="10" fill="${C.red}" opacity="${kk}"/>` + g(hicBurst('ヒック', 44), { x, y: 300 - (k % 2) * 16, s: Math.max(back(kk), 0.001), r: k % 2 ? 5 : -6 });
      });
      const sO = win(t, at(0, 0.45), c1 - 0.1, 0.3);
      if (sO > 0) a += g(card(940, 200) + text(0, -40, 'とめようと しても', { size: 50, w: 900 }) + text(0, 36, 'しばらく つづく', { size: 50, w: 900, fill: C.redUi }), { x: 1250, y: 620, o: sO, s: lerp(0.95, 1, eo(sO)) });
      // 息を止めても
      const hO = win(t, c1 + 0.2, c2 - 0.2, 0.3);
      if (hO > 0) a += g(card(940, 200) + text(0, -40, 'いきを とめても', { size: 50, w: 900 }) + text(0, 36, 'すぐには とまらない ことが ある', { size: 46, w: 900, fill: C.redUi }), { x: 1250, y: 620, o: hO, s: lerp(0.95, 1, eo(hO)) });
      // たいていは数分
      const mO = prog(t, c2 + 0.2, 0.4);
      if (mO > 0) {
        const sw = eo(prog(t, c2 + 0.5, 1.6)) * 0.085, ang = sw * Math.PI * 2;
        const clock = `<circle r="96" fill="#fff" stroke="${C.ink}" stroke-width="10"/><path d="M 0 0 L 0 -78 A 78 78 0 0 1 ${Math.sin(ang) * 78} ${-Math.cos(ang) * 78} Z" fill="${C.yellow}"/>` +
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<path d="M 0 -84 L 0 -72" stroke="${C.muted}" stroke-width="5" stroke-linecap="round" transform="rotate(${i * 30})"/>`).join('') +
          `<path d="M 0 0 L 0 -66" stroke="${C.ink}" stroke-width="9" stroke-linecap="round" transform="rotate(${sw * 360})"/><circle r="9" fill="${C.ink}"/>`;
        a += g(card(940, 240) + g(clock, { x: -330 }) + text(-190, -40, 'たいていは', { size: 46, w: 900, anchor: 'start' }) + text(-190, 36, 'すうふんで とまる', { size: 60, w: 900, anchor: 'start', fill: C.accent }), { x: 1250, y: 640, o: mO, s: lerp(0.95, 1, eo(mO)) });
      }
      a += pop(badge('とまった', { fill: C.green, size: 44 }), t, tS + 0.5, 330, 500);
      out += g(a, { o: aO });
    }
    // きっかけ
    const bO = prog(t, c3 - 0.2, 0.4);
    if (bO > 0) {
      let b = pop(badge('きっかけに なる こと', { fill: C.ochre, size: 52, pad: 44 }), t, c3, 960, 200);
      const items = [['soda', 'たんさんの のみもの', 0.26], ['full', 'たべすぎ', 0.5], ['temp', 'きゅうな あつさ・さむさ', 0.66]];
      items.forEach(([k, s, f], i) => { b += pop(card(480, 470) + g(trigIcon[k](t), { y: -50 }) + text(0, 170, s, { size: 38, w: 900 }), t, at(3, f), 420 + i * 540, 530); });
      b += g(text(0, 0, 'はっきりした わけが ない ことも おおい', { size: 38, w: 700, fill: C.muted }), { x: 960, y: 812, o: prog(t, at(3, 0.9), 0.5) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. おなかの赤ちゃんも。何のためかは まだなぞ（オタマジャクシの考え）
function womb(t) {
  const HB = [1.2, 2.9, 4.6, 6.3, 8.0, 9.7, 11.4, 13.1];
  const jk = HB.reduce((m, h) => Math.max(m, jerk(t, h, 0.3)), 0);
  let o = `<circle r="236" fill="#f3aebb"/><circle r="200" fill="#fde3e6"/>`;
  o += `<path d="M 30 70 C 110 120 150 60 196 40" fill="none" stroke="#e58a9a" stroke-width="14" stroke-linecap="round"/>`;
  o += `<g transform="translate(0 ${-jk * 12}) rotate(${-14 + jk * 5})">
    <path d="M -10 -6 C -84 20 -86 124 -14 136 C 58 146 96 92 72 44 C 58 14 22 -14 -10 -6 Z" fill="${HC.skin}"/>
    <path d="M 54 110 q -56 44 -92 2" fill="none" stroke="${HC.skin}" stroke-width="34" stroke-linecap="round"/>
    <circle cx="-34" cy="-60" r="70" fill="${HC.skin}"/>
    <path d="M -76 -58 q 11 9 22 0" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/><path d="M -66 -28 q 8 ${jk > 0.3 ? 10 : 5} 16 0" fill="none" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>
    <circle cx="-44" cy="-36" r="11" fill="#f2a99a" opacity="0.7"/>
    <path d="M 14 30 q -34 30 -62 4" fill="none" stroke="${HC.skinD}" stroke-width="20" stroke-linecap="round"/><circle cx="-50" cy="34" r="13" fill="${HC.skinD}"/>
  </g>`;
  HB.forEach((h, k) => { o += hicPop(t, h, 120, -120 + (k % 2) * 30, { r: 44, str: 'ヒック', hold: 0.5, rot: k % 2 ? 6 : -8 }); });
  return o;
}
function tadpole(t, { door = 1 } = {}) {
  const w = Math.sin(t * 5) * 34, w2 = Math.sin(t * 5 + 1) * 46, col = '#6f8263', colD = '#56684d';
  let o = `<path d="M 110 -46 Q 290 ${-40 + w} 450 ${w2} Q 290 ${46 + w} 110 66 Z" fill="${colD}"/>`;
  o += `<ellipse cx="-60" cy="10" rx="214" ry="142" fill="${col}"/><ellipse cx="-50" cy="60" rx="170" ry="78" fill="#8a9c7c" opacity="0.6"/>`;
  // 水の通り道（口 → えら）と、肺への道
  o += `<path d="M -268 10 L -150 10 Q -108 12 -92 62 L -70 150" fill="none" stroke="#eaf4e4" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="M -150 10 Q -90 -14 -10 -26" fill="none" stroke="#eaf4e4" stroke-width="30" stroke-linecap="round"/><ellipse cx="46" cy="-30" rx="86" ry="48" fill="${HC.lung}" stroke="${HC.lungD}" stroke-width="6"/>`;
  o += text(46, -28, 'はい', { size: 34, w: 900, fill: '#b5586b' });
  // とびら
  o += `<g transform="translate(-112 -4) rotate(${-18 + (1 - door) * 70})"><rect x="-9" y="-30" width="18" height="60" rx="9" fill="${HC.door}" stroke="#fff" stroke-width="4"/></g>`;
  // 水のつぶ
  const P = [[-470, 10], [-268, 10], [-150, 10], [-96, 56], [-70, 150], [-30, 262]];
  for (let i = 0; i < 12; i++) { const u = (t * 0.32 + i / 12) % 1, [x, y] = along(P, u), fd = Math.min(1, u * 8, (1 - u) * 8); o += `<circle cx="${x}" cy="${y + Math.sin(i * 2.4) * 5}" r="11" fill="${HC.in}" stroke="#fff" stroke-width="3" opacity="${fd}"/>`; }
  // 目
  o += `<circle cx="-176" cy="-62" r="26" fill="#fff"/><circle cx="-182" cy="-62" r="13" fill="#1e1d19"/><circle cx="-186" cy="-67" r="4" fill="#fff"/>`;
  return o;
}
SCENES.push({
  id: 'mystery',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), c2 = cue(2), c4 = cue(4), c5 = cue(5);
    const aO = 1 - prog(t, c4 - 0.6, 0.4);
    if (aO > 0) {
      const mv = eio(prog(t, c1 - 0.2, 0.8));
      let a = g(womb(t), { x: lerp(960, 420, mv), y: lerp(520, 520, mv), s: lerp(1, 0.74, mv), o: prog(t, 0.2, 0.4) });
      a += g(badge('おなかの なかの あかちゃんも しゃっくり', { fill: C.redUi, size: 44 }), { x: 960, y: 190, o: win(t, cue(0) + 0.5, c1 - 0.2, 0.3) });
      a += g(text(0, 0, 'あかちゃんも しゃっくり', { size: 36, w: 900, fill: C.redUi }), { x: 420, y: 300, o: prog(t, c1 + 0.6, 0.4) });
      a += pop(text(0, 0, '？', { size: 300, w: 900, fill: C.ochre }), t, c1 + 0.5, 930, 400 + Math.sin(t * 2.4) * 8);
      a += g(text(0, 0, 'なんの ため？', { size: 68, w: 900 }), { x: 930, y: 630, o: prog(t, c1 + 1.2, 0.4) });
      a += pop(badge('まだ わかって いない', { fill: C.blueUi, size: 58, pad: 46 }), t, c2 + 0.3, 930, 760);
      out += g(a, { o: aO });
      out += kidShow('B', t, 1650, 900, { s: 0.64, start: cue(3) - 0.9, n: 0, end: c4 - 0.4 });
    }
    const bO = prog(t, c4 - 0.2, 0.5);
    if (bO > 0) {
      let b = `<rect x="150" y="200" width="940" height="590" rx="40" fill="#cfeaf5"/>`;
      b += [0, 1, 2].map(i => `<path d="M ${230 + i * 300} ${250 + i * 14} q 30 -16 60 0 t 60 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`).join('');
      b += g(tadpole(t), { x: 620, y: 500, s: 0.92 });
      b += g(badge('オタマジャクシ', { fill: '#56684d', size: 40 }), { x: 880, y: 262 });
      const l1 = prog(t, c4 + 0.9, 0.4);
      b += g(text(0, 0, 'みず', { size: 44, w: 900, fill: HC.in }), { x: 250, y: 440, o: l1 });
      b += g(text(0, 0, 'えら', { size: 40, w: 900, fill: HC.in }), { x: 470, y: 716, o: prog(t, c4 + 1.6, 0.4) });
      const l2 = prog(t, at(4, 0.72), 0.4);
      b += pointer(516, 330, 516, 462, HC.door, l2) + g(badge('とびらを しめる', { fill: HC.door, size: 36 }), { x: 430, y: 316, o: l2 });
      // みぎ：にているところ
      const row = (title, a1, a2, y, st) => pop(card(720, 180) + text(0, -46, title, { size: 36, w: 900, fill: C.muted }) +
        `<text x="0" y="26" font-size="42" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.03em"><tspan fill="${HC.in}">${a1}</tspan><tspan fill="${C.ink}"> ＋ </tspan><tspan fill="${HC.door}">${a2}</tspan></text>`, t, st, 1500, y);
      b += row('オタマジャクシ', 'みずを すう', 'とびらを しめる', 300, at(4, 0.8));
      b += row('しゃっくり', 'くうきを すう', 'とびらが しまる', 590, c5 + 0.2);
      b += pop(text(0, 0, 'にている？', { size: 44, w: 900, fill: C.ochre }), t, c5 + 0.8, 1500, 445);
      b += pop(badge('…という かんがえも ある', { fill: C.ochre, size: 44 }), t, at(5, 0.6), 1500, 745);
      b += g(text(0, 0, 'たしかめられた こたえでは ない', { size: 36, w: 700, fill: C.muted }), { x: 1500, y: 820, o: prog(t, at(5, 0.6) + 0.6, 0.4) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 答え と みてみよう
const earIcon = () => `<path d="M -10 -52 C 34 -56 52 -20 40 10 C 32 30 16 34 14 52 C 12 66 -8 68 -14 54" fill="${HC.skin}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M -2 -26 C 18 -28 26 -10 18 4 C 14 12 4 14 2 24" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>` +
  `<path d="M -40 -30 q -14 20 0 40 M -62 -44 q -24 34 0 68" fill="none" stroke="${HC.in}" stroke-width="7" stroke-linecap="round"/>`;
const homeIcon = () => `<rect x="-48" y="-48" width="96" height="96" rx="20" fill="#fff" stroke="${C.accent}" stroke-width="7"/><path d="M 0 -28 L 0 28 M -28 0 L 28 0" stroke="${C.accent}" stroke-width="16" stroke-linecap="round"/>`;
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.blueUi}"/>` + text(-530, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[0][1], { size: 56, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['おうかくまくが ピクッ', HC.dia], ['くうきが ヒュッ', HC.in], ['とびらが パタン', HC.door], ['ヒック！', C.ochre]], t, 960, 660, { size: 36, gap: 30, start: 2.6, step: 0.8 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 200);
      const items = [
        [earIcon(), '「ヒック」は すう とき？ はく とき？ みみを すませよう', C.ink],
        [warnIcon(), 'みずを いっきに のまない。たくさん のみこまない', C.red],
        [warnIcon(), 'ふくろを かぶせない。ひとを おどかさない', C.red],
        [homeIcon(), '2にち つづいたら、おうちの ひとに はなそう', C.ink],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(g(ic, { s: 0.9 }) + text(100, 2, s, { size: 46, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 230, 345 + i * 132);
      });
      b += chamL(t, 1730, 790, { s: 0.78, start: cue(1) + 0.8, n: 0 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 9. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「しゃっくり」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    // 左に立つ子は動画ごとに変わる（END_SWAP）。動きも kidShow が動画ごとに選ぶ
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += kidShow('K', t, 1660, 1040, { s: 0.7, start: 1.2, n: 2, bubble: false });
    // 左の子の吹き出しは頭の上、右の子の吹き出しは右どなり（しっぽは顔をさす）
    const headTop = w => 1060 - KID_HEAD[w][0] * 0.52, face = w => 1060 - KID_HEAD[w][2] * 0.52;
    out += talkBubble(kL, 185, headTop(kL) - 140, 165, headTop(kL) - 12) + talkBubble(kR, 575, face(kR), 372, face(kR));
    out += `<rect width="1920" height="1080" fill="#000" opacity="${prog(t, D - 1.0, 1.0)}"/>`;
    return out;
  },
});

// ---------- 描く ----------
const svg = document.getElementById('stage');
const capEl = document.querySelector('#cap span');
function sceneDur(i) { return window.TL ? TL.scenes[i].dur : 10; }
function show(i, t) {
  const sc = SCENES[i];
  const D = sceneDur(i);
  NOW = { i, t };
  const edge = i === 0 ? 1 - prog(t, D - 0.3, 0.3) : i === SCENES.length - 1 ? prog(t, 0, 0.3) : Math.min(prog(t, 0, 0.3), 1 - prog(t, D - 0.3, 0.3));
  svg.innerHTML = DEFS + sc.draw(t) + (edge < 1 ? `<rect width="1920" height="1080" fill="${C.paper}" opacity="${1 - edge}"/>` : '');
  const L = SL().find(l => l.who === 'N' && l.text && t >= l.start - 0.15 && t < l.end + 0.35);
  capEl.textContent = L ? L.text : '';
  capEl.className = sc.night ? 'night' : '';
  capEl.style.opacity = L ? String(win(t, L.start - 0.15, L.end + 0.35, 0.15)) : '0';
}
window.sceneDur = sceneDur;
window.SCENES = SCENES;
window.show = show;
window.TOTAL = SCENES.reduce((a, s, i) => a + sceneDur(i), 0);
