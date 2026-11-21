// みのまわり図鑑 動画「トイレは、流したあとも、どうして水が残るの？」（トイレ）
// 出どころ：everyday-trivia trivia/toilet-water.md

// ---------- 道具 ----------
const TT = {
  water: '#6fbfee', waterDk: '#2f86d0', inner: '#f1eee6', line: '#3b3a36', wall: '#e9f1ee', floor: '#e3d9c6', floorDk: '#cbbfa6', soil: '#cdbb9d',
  smell: '#8f5fc8', pipe: '#8f9aa3', pipeIn: '#d7dcdf', ball: '#f08a2e', gray: '#b9bfc4', lid: '#f3efe6',
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// 時計（k: 針の回転 0〜1 で1周）
const clockIcon = (r, k = 0) => `<circle r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="${r * 0.13}"/><line x1="0" y1="0" x2="0" y2="${-r * 0.5}" stroke="${C.ink}" stroke-width="${r * 0.12}" stroke-linecap="round"/>` +
  `<line x1="0" y1="0" x2="${Math.sin(k * Math.PI * 2) * r * 0.7}" y2="${-Math.cos(k * Math.PI * 2) * r * 0.7}" stroke="${C.red}" stroke-width="${r * 0.1}" stroke-linecap="round"/><circle r="${r * 0.09}" fill="${C.ink}"/>`;

// ---- トイレを横から切った絵（図の座標：はば340×高さ240くらい。前が左、おくにタンク） ----
const TP = {
  BODY: 'M24 90H292V102Q292 106 286 106H262V228H124C112 228 108 222 104 210C94 184 54 168 34 128C26 112 24 100 24 90Z',
  CAV: 'M36 96C40 145 88 172 120 175L132 175C142 150 160 118 186 96Z',
  CAVL: 'M36 96C40 145 88 172 120 175L132 175C142 150 160 118 186 96',
  TRAP: 'M124 172C134 200 168 196 176 170C182 150 192 134 206 134C220 134 230 150 232 172L232 236',
};
const SEAL = 142, EMPTY = 184, TANK_FULL = 44, TANK_LOW = 80;
const cubP = (a, b, c, d, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1].map(k => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]); });
// 曲がった道のまん中の線（便器がわ → 下水がわ）
const TRAP_PTS = [...cubP([124, 172], [134, 200], [168, 196], [176, 170]), ...cubP([176, 170], [182, 150], [192, 134], [206, 134]).slice(1), ...cubP([206, 134], [220, 134], [230, 150], [232, 172]).slice(1), [232, 204], [232, 236]];
const CREST_I = 28;  // TRAP_PTS のうち、山のてっぺん (206,134) の番号
function polyAt(P, k) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const d = clamp(k) * L[L.length - 1]; let i = 1; while (i < P.length - 1 && L[i] < d) i++;
  const u = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)];
}
// 下水からのにおいの道：下水の管 → 上へ → 山のてっぺん（水があれば、ここで止まる）
const SMELL_A = [[640, 274], [250, 274], [238, 270], [232, 258], ...TRAP_PTS.slice(CREST_I).reverse()];
// 水がないとき：そのまま便器の中を通って、部屋へ
const polyLen = P => P.reduce((a, p, i) => a + (i ? Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) : 0), 0);
const SMELL_B = [...SMELL_A, ...TRAP_PTS.slice(0, CREST_I).reverse(), [118, 150], [112, 118], [108, 84], [100, 44], [104, 6]];
const K_SEAL = polyLen(SMELL_A) / polyLen(SMELL_B);  // SMELL_B の上で、山のてっぺんにあたる所
// タンク。L: 水面、flap: 底のふた（ゴムフロート）の開き 0〜1、fill: 水が入っている、out: 便器へ流れ出ている、cut: 中を見せる
function tankCut({ L = TANK_FULL, flap = 0, fill = 0, out = 0, cut = true } = {}, t = 0) {
  const S = `stroke="${TT.line}"`;
  let o = `<rect x="200" y="18" width="90" height="74" rx="6" fill="#fff"/>`;
  if (cut) {
    o += `<rect x="203" y="${L}" width="84" height="${89.5 - L}" fill="${TT.water}"/>`;
    o += `<rect x="264" y="34" width="8" height="56" fill="#fff" ${S} stroke-width="1.6"/>`;
    o += `<path d="M212 91V46" ${S} stroke-width="2.4"/><rect x="206.5" y="35" width="11" height="11" rx="2.5" fill="${TT.gray}" ${S} stroke-width="1.4"/>`;
    if (fill > 0) o += `<line x1="221" y1="45" x2="221" y2="${L}" stroke="${TT.waterDk}" stroke-width="3.4" stroke-dasharray="5 3.5" stroke-dashoffset="${-t * 46}" opacity="${fill}"/>`;
    o += `<path d="M216 41L250 ${L - 2}" ${S} stroke-width="1.8"/><circle cx="250" cy="${L - 2}" r="7.5" fill="${TT.ball}" ${S} stroke-width="1.6"/>`;
    const ay = 28 - 9 * flap, ax = 246;
    o += `<path d="M204 28L${ax} ${ay}" ${S} stroke-width="2.2" stroke-linecap="round"/>`;
    o += `<path d="M${ax - 5 + 5 * flap} ${ay + 1}L${lerp(240, 249, flap)} ${lerp(81, 73, flap)}" ${S} stroke-width="1.6" stroke-dasharray="2.2 2.2"/>`;
    o += `<g transform="rotate(${50 * flap} 252 88)"><path d="M227 89Q240 75 253 89Z" fill="${TT.gray}" ${S} stroke-width="1.5"/></g>`;
    if (out > 0) o += `<path d="M240 91C238 108 206 103 187 105" fill="none" stroke="${TT.waterDk}" stroke-width="6" stroke-linecap="round" stroke-dasharray="9 6" stroke-dashoffset="${-t * 70}" opacity="${out}"/>`;
  }
  o += `<rect x="200" y="18" width="90" height="74" rx="6" fill="none" ${S} stroke-width="3"/>`;
  o += `<rect x="196" y="11" width="98" height="9" rx="3.5" fill="${TT.lid}" ${S} stroke-width="2.2"/>`;
  o += `<g transform="rotate(${-34 * flap} 200 28)"><path d="M184 28H201" ${S} stroke-width="4.5" stroke-linecap="round"/><circle cx="184" cy="28" r="3.6" fill="${TT.line}"/></g>`;
  return o;
}
// 便器と曲がった道。L: 便器の水面、full: 道が水でいっぱい 0〜1、flow: 道を水が流れている 0〜1、rim: ふちから水を足している 0〜1、cut: 中を見せる
function bowlCut({ L = SEAL, full = 0, flow = 0, rim = 0, cut = true, id = 'tb' } = {}, t = 0) {
  const S = `stroke="${TT.line}"`;
  let o = `<path d="${TP.BODY}" fill="#fff" ${S} stroke-width="3" stroke-linejoin="round"/>`;
  if (cut) {
    o += `<path d="${TP.TRAP}" fill="none" ${S} stroke-width="20"/><path d="${TP.CAVL}" fill="none" ${S} stroke-width="4"/>`;
    o += `<path d="${TP.CAV}" fill="${TT.inner}"/><path d="${TP.TRAP}" fill="none" stroke="${TT.inner}" stroke-width="16"/>`;
    o += `<clipPath id="${id}a"><rect x="0" y="${L}" width="340" height="200"/></clipPath><clipPath id="${id}b"><rect x="0" y="${L}" width="206" height="200"/></clipPath>`;
    o += `<path d="${TP.CAV}" fill="${TT.water}" clip-path="url(#${id}a)"/><path d="${TP.TRAP}" fill="none" stroke="${TT.water}" stroke-width="16" clip-path="url(#${id}b)"/>`;
    if (full > 0) o += `<path d="${TP.TRAP}" fill="none" stroke="${TT.water}" stroke-width="16" opacity="${clamp(full)}"/>`;
    if (flow > 0) o += `<path d="${TP.TRAP}" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="9 13" stroke-dashoffset="${-t * 120}" opacity="${0.85 * flow}"/>`;
    if (rim > 0) o += `<path d="M184 100C160 120 144 150 134 172" fill="none" stroke="${TT.waterDk}" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="7 6" stroke-dashoffset="${-t * 50}" opacity="${rim}"/>`;
  }
  o += `<rect x="24" y="83" width="168" height="8" rx="4" fill="${TT.lid}" ${S} stroke-width="2.2"/>`;
  return o;
}
const toilet = (x, y, s, bowl = {}, tank = {}, t = 0) => g(bowlCut(bowl, t) + tankCut(tank, t), { x, y, s });
// 上から見た便器。w: 水の広さ 0〜1
function bowlTop(x, y, s, w = 1, { swirl = 0, t = 0, q = false } = {}) {
  let o = `<ellipse cx="0" cy="0" rx="150" ry="190" fill="#fff" stroke="${TT.line}" stroke-width="7"/><ellipse cx="0" cy="8" rx="108" ry="144" fill="${TT.inner}" stroke="${TT.line}" stroke-width="5"/>`;
  if (w > 0.02) o += `<ellipse cx="0" cy="44" rx="${72 * w}" ry="${88 * w}" fill="${TT.water}" stroke="${TT.waterDk}" stroke-width="4"/><ellipse cx="${-22 * w}" cy="${44 - 30 * w}" rx="${16 * w}" ry="${22 * w}" fill="#fff" opacity="0.5"/>`;
  if (swirl > 0) for (let i = 0; i < 3; i++) o += `<path d="M 0 -62 A 62 62 0 0 1 54 30" fill="none" stroke="${TT.waterDk}" stroke-width="9" stroke-linecap="round" opacity="${swirl * 0.8}" transform="translate(0 30) rotate(${t * 320 + i * 120}) scale(${0.6 + 0.5 * swirl})"/>`;
  if (q) o += text(0, 44, '？', { size: 130, w: 900, fill: C.ochre });
  return g(o, { x, y, s });
}
// においのしるし（むらさきの波）。P: 道、k: 0〜1 のどこにいるか。図の座標
const smellMark = (P, k, o = 1, i = 0) => { if (o <= 0.01) return ''; const [x, y] = polyAt(P, k); return `<path transform="translate(${x + Math.sin(i * 2.3) * 2} ${y}) scale(1.25)" d="M -5 0 Q -2.5 -4.5 0 0 T 5 0" fill="none" stroke="${TT.smell}" stroke-width="2.4" stroke-linecap="round" opacity="${clamp(o)}"/>`; };
// 右がわに順番にならべる説明（番号つき）
function stepRow(n, str, t, st, x, y, { col = C.blueUi, size = 38, end = 1e9, note = '' } = {}) {
  return pop(`<circle cx="0" cy="0" r="32" fill="${col}"/>` + text(0, 3, n, { size: 40, w: 900, fill: '#fff' }) + text(54, 2, str, { size, w: 900, anchor: 'start' }) +
    (note ? text(54, 54, note, { size: 32, w: 700, fill: C.muted, anchor: 'start' }) : ''), t, st, x, y, { end });
}
const bathBg = (fy) => `<rect width="1920" height="1080" fill="${TT.wall}"/><rect x="0" y="${fy}" width="1920" height="${1080 - fy}" fill="${TT.floor}"/><rect x="0" y="${fy}" width="1920" height="8" fill="${TT.floorDk}"/>`;
// 図の座標 → 画面の座標（説明の場面の大きなトイレ）
const TF = { x: 90, y: 110, s: 3 };
const fp = (fx, fy) => [TF.x + fx * TF.s, TF.y + fy * TF.s];

// 1. つかみ：流すと水は行ってしまうのに、しばらくすると また水がある
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c2 = cue(2), c3 = cue(3), FY = 30 + 228 * 2.4 + 185;
    let out = bathBg(FY);
    const lever = win(t, c0 + 0.5, c0 + 3.4, 0.4);
    out += g(bowlCut({ cut: false }) + tankCut({ cut: false, flap: lever }), { x: 30, y: 215, s: 2.4 });
    // ジャーッ
    const ja = win(t, c0 + 1.0, c0 + 4.2, 0.3);
    out += g(text(0, 0, 'ジャーッ', { size: 84, w: 900, fill: TT.waterDk, extra: `stroke="#fff" stroke-width="14" stroke-linejoin="round" paint-order="stroke"` }), { x: 240 + Math.sin(t * 40) * 4 * ja, y: 290, o: ja, r: -6 });
    // 上から見た便器
    const IX = 1100, IY = 430, R = 250;
    const w = t < c2 ? lerp(1, 0.16, eo(prog(t, c0 + 1.2, 2.4))) : lerp(0.16, 1, eio(prog(t, c2 + 0.8, 4.2)));
    const sw = win(t, c0 + 1.0, c0 + 3.8, 0.5);
    out += `<circle cx="${IX}" cy="${IY}" r="${R}" fill="#fff" stroke="${C.blueUi}" stroke-width="14"/>` + bowlTop(IX, IY - 6, 1.12, w, { swirl: sw, t });
    out += `<line x1="430" y1="560" x2="${IX - R + 30}" y2="${IY + 60}" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="14 10"/>`;
    out += pop(badge('うえから みた べんき', { fill: C.blueUi, size: 42 }), t, 0.5, IX, 120, { end: c0 + 3.6 });
    out += pop(badge('みずが ながれた', { fill: TT.waterDk, size: 46 }), t, c0 + 3.8, IX, 120, { end: c2 + 4.6 });
    out += pop(badge('また みずが たまって いる！', { fill: C.redUi, size: 46 }), t, c2 + 4.8, IX, 120);
    // しばらくすると…
    const ck = win(t, c2 + 0.4, c3 - 0.2, 0.4);
    out += g(clockIcon(64, prog(t, c2 + 0.6, 4.4) * 2), { x: 1680, y: 372, o: ck }) + g(badge('しばらく すると…', { fill: C.ink, size: 40 }), { x: 1680, y: 252, o: ck });
    out += kidShow('S', t, 1790, 846, { s: 0.5, start: c0 + 3.4, n: 0, side: 'left', size: 40 });
    out += g(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre, extra: `stroke="${C.paper}" stroke-width="16" paint-order="stroke"` }), { x: 1560, y: 560, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">トイレは ながした あとも</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${TT.waterDk}">みずが のこる</tspan>の？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(bowlTop(-120, 0, 0.5, 1) + text(110, 0, '？', { size: 110, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 780);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'ながした あと、べんきに みずが のこるのは なぜ？', { size: 58, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'ながす みずが、あまって しまうから'], ['②', 'べんきを、ひやす ため'], ['③', 'くさい においが、あがって こないように する ため']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 42, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(bowlTop(0, 30, 0.44, 1) + text(120, -70, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1670, 330);
    out += kidShow('B', t, 1720, 850, { s: 0.55, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 610, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 横から切って見る：タンクの水、便器の底の水、くねっと曲がった道（トラップ）
SCENES.push({
  id: 'trap',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), FY = fp(0, 228)[1];
    let out = bathBg(FY) + topBadge();
    out += toilet(TF.x, TF.y, TF.s, {}, {}, t);
    // タンクの水・便器の水を 光らせる
    const h0 = win(t, c0 + 0.6, c1 - 0.2, 0.3), h1 = win(t, c1 + 0.2, c2 - 0.2, 0.3);
    const [tx0, ty0] = fp(203, 44), [bx, by] = fp(90, 160);
    out += `<rect x="${tx0 - 6}" y="${ty0 - 6}" width="${84 * 3 + 12}" height="${46 * 3 + 12}" rx="10" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="20 12" opacity="${h0 * (0.7 + 0.3 * Math.sin(t * 6))}"/>`;
    out += `<ellipse cx="${bx}" cy="${by}" rx="150" ry="74" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="20 12" opacity="${h1 * (0.7 + 0.3 * Math.sin(t * 6))}"/>`;
    out += callout(fp(266, 60)[0], fp(266, 60)[1], 1100, 200, 'タンク：つぎに ながす みず', prog(t, c0 + 1.0, 0.4), { col: TT.waterDk, size: 42 });
    out += tag(bx - 40, by - 10, 420, 250, 'べんきの そこにも みず', prog(t, c1 + 0.4, 0.4), { col: TT.waterDk, size: 40 });
    // 曲がった道をなぞる
    const tr = prog(t, c2 + 0.8, 0.5);
    if (tr > 0) {
      out += g(`<path d="${TP.TRAP}" fill="none" stroke="${C.ochre}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="7 6" stroke-dashoffset="${-t * 22}" opacity="${0.95 * tr}"/>`, { x: TF.x, y: TF.y, s: TF.s });
      const k = ((t - c2 - 0.8) * 0.28) % 1, [px, py] = polyAt(TRAP_PTS, k), [qx, qy] = fp(px, py);
      out += `<circle cx="${qx}" cy="${qy}" r="26" fill="${C.ochre}" opacity="${0.35 * tr}" filter="url(#soft)"/><circle cx="${qx}" cy="${qy}" r="13" fill="${C.ochre}" opacity="${tr * Math.min(1, k * 12, (1 - k) * 12)}"/>`;
    }
    const [cx, cy] = fp(206, 126);
    out += callout(cx, cy, 1100, 340, 'くねっと まがった みち', prog(t, c2 + 2.2, 0.4), { col: C.ochre, size: 44 });
    out += pop(badge('トラップ', { fill: C.ochre, size: 68, pad: 50 }), t, c3 + 1.6, 1440, 480);
    // 水の深さ 5〜10センチ
    const dO = prog(t, c3 + 5.0, 0.4);
    if (dO > 0) {
      const [ax, ay] = fp(152, SEAL), [, ay2] = fp(152, 185);
      out += g(`<line x1="${ax - 26}" y1="${ay}" x2="${ax + 26}" y2="${ay}" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/><line x1="${ax - 26}" y1="${ay2}" x2="${ax + 26}" y2="${ay2}" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/>` +
        arrow2(ax, (ay + ay2) / 2, ax, ay + 6, C.red, 7) + arrow2(ax, (ay + ay2) / 2, ax, ay2 - 6, C.red, 7), { o: dO });
      out += callout(ax + 20, (ay + ay2) / 2, 1040, 724, 'ふかさ 5〜10センチ', dO, { col: C.red, size: 44 });
    }
    out += kidShow('K', t, 1770, 830, { s: 0.5, start: c3 + 3.0, n: 0 });
    return out;
  },
});

// 4. 流すと：レバー → 鎖 → 底のふた → タンクの水が便器へ → 道が水でいっぱい → 便器の水ごと引っぱり出す → ほとんどなくなる
SCENES.push({
  id: 'flush',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), FY = fp(0, 228)[1];
    let out = bathBg(FY) + topBadge();
    const flap = prog(t, c0 + 1.4, 0.6) * (1 - prog(t, c3 + 3.4, 0.6));
    const tankL = lerp(TANK_FULL, TANK_LOW, eio(prog(t, c0 + 2.2, c1 + 4.6 - (c0 + 2.2))));
    const outF = prog(t, c0 + 2.0, 0.5) * (1 - prog(t, c1 + 4.4, 0.6));
    const rise = eio(prog(t, c0 + 2.8, c1 + 2.6 - (c0 + 2.8))), drain = eio(prog(t, c3 + 0.8, 3.0));
    const L = drain > 0 ? lerp(122, EMPTY, drain) : lerp(SEAL, 122, rise);
    const full = Math.max(prog(t, c1 + 2.4, 1.2) * 0.45, prog(t, c2 + 0.5, 1.0)) * (1 - prog(t, c3 + 3.8, 0.6));
    const flow = Math.max(prog(t, c2 + 1.0, 0.5) * 0.5, prog(t, c3 + 0.6, 0.4)) * (1 - prog(t, c3 + 3.8, 0.5));
    out += toilet(TF.x, TF.y, TF.s, { L, full, flow }, { L: tankL, flap, out: outF }, t);
    // 部品の名前（はじめだけ）
    const [hx, hy] = fp(184, 28), [kx, ky] = fp(246, 52), [gx, gy] = fp(246, 84);
    const nameEnd = c1 + 0.2;
    out += callout(hx, hy, 480, 170, 'レバー', win(t, c0 + 0.4, nameEnd, 0.3), { col: C.ink, size: 44 });
    out += callout(kx, ky, 1010, 170, 'くさり', win(t, c0 + 2.2, nameEnd, 0.3), { col: C.ink, size: 42 });
    out += callout(gx, gy, 1010, 252, 'そこの ふた', win(t, c0 + 3.4, nameEnd, 0.3), { col: C.ink, size: 42 });
    // 吸い出される向き
    const sO = win(t, c3 + 0.8, c3 + 4.0, 0.4);
    if (sO > 0) { const [a1, b1] = fp(232, 150), [a2, b2] = fp(232, 216); out += g(arrow2(a1 + 46, b1, a2 + 46, b2, TT.waterDk, 12), { o: sO }); }
    // 順番
    const listEnd = c4 - 0.2, SX = 1060;
    out += stepRow('1', 'レバーで そこの ふたが あく', t, c0 + 1.6, SX, 350, { end: listEnd, size: 42 });
    out += stepRow('2', 'タンクの みずが べんきへ', t, c1 + 0.4, SX, 470, { end: listEnd, size: 42 });
    out += stepRow('3', 'まがった みちが みずで いっぱい', t, c2 + 0.6, SX, 590, { end: listEnd, size: 42, note: 'べんきに よっては（サイホンしきの べんき）' });
    out += stepRow('4', 'ストローみたいに ひっぱりだす', t, c3 + 0.6, SX, 740, { end: listEnd, size: 42 });
    // すぐあと
    out += pop(badge('ながした すぐ あと', { fill: C.ink, size: 44 }), t, c4 + 0.3, 1440, 250);
    out += pop(badge('みずが ほとんど ない', { fill: C.redUi, size: 56, pad: 44 }), t, c4 + 1.2, 1440, 370);
    const [ex, ey] = fp(100, 150);
    out += `<ellipse cx="${ex}" cy="${ey + 20}" rx="170" ry="92" fill="none" stroke="${C.redUi}" stroke-width="8" stroke-dasharray="20 12" opacity="${prog(t, c4 + 1.2, 0.4) * (0.7 + 0.3 * Math.sin(t * 6))}"/>`;
    out += kidShow('B', t, 1480, 846, { s: 0.55, start: c4 + 2.6, n: 0, side: 'right' });
    return out;
  },
});

// 5. 流したあと：浮き玉が下がって水が入る → たまると止まる → 便器にも水を足して もとの高さに
SCENES.push({
  id: 'refill',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), FY = fp(0, 228)[1];
    let out = bathBg(FY) + topBadge();
    const tk = prog(t, c0 + 1.6, c1 + 1.6 - (c0 + 1.6)), tankL = lerp(TANK_LOW, TANK_FULL, tk), fill = prog(t, c0 + 1.2, 0.4) * (1 - prog(t, c1 + 1.5, 0.3));
    const bk = prog(t, c0 + 2.4, c2 + 4.2 - (c0 + 2.4)), L = lerp(EMPTY, SEAL, bk), rim = prog(t, c0 + 2.0, 0.5) * (1 - prog(t, c2 + 4.0, 0.4));
    out += toilet(TF.x, TF.y, TF.s, { L, rim }, { L: tankL, fill }, t);
    // もとの高さの線
    const [lx, ly] = fp(44, SEAL), [lx2] = fp(178, SEAL), mO = prog(t, c2 + 0.4, 0.4);
    out += `<line x1="${lx}" y1="${ly}" x2="${lx2}" y2="${ly}" stroke="${C.red}" stroke-width="5" stroke-dasharray="16 12" opacity="${mO}"/>`;
    out += tag(lx + 60, ly, 262, 316, 'もとの たかさ', mO, { col: C.red, size: 40 });
    // 浮き玉
    const [fx, fy] = fp(250, tankL - 2);
    out += callout(fx + 20, fy, 1040, 200, 'うきだま', win(t, c0 + 0.8, c2 - 0.2, 0.3), { col: TT.ball, size: 44 });
    const dn = win(t, c0 + 1.0, c0 + 3.2, 0.3), up = win(t, c1 + 0.2, c1 + 2.6, 0.3);
    out += g(arrow2(fx + 60, fy - 50, fx + 60, fy + 30, TT.ball, 10), { o: dn }) + g(arrow2(fx + 60, fy + 40, fx + 60, fy - 40, TT.ball, 10), { o: up });
    // 順番
    const SX = 1060;
    out += stepRow('1', 'うきだまが さがって、みずが はいる', t, c0 + 1.2, SX, 370, { col: TT.waterDk, size: 40 });
    out += stepRow('2', 'たまると うきだまが あがって、とまる', t, c1 + 0.5, SX, 490, { col: TT.waterDk, size: 40 });
    out += stepRow('3', 'べんきにも みずを たして、もとの たかさに', t, c2 + 0.5, SX, 610, { col: TT.waterDk, size: 36, note: '1〜2ふん かけて（サイホンしきの べんき）' });
    out += g(clockIcon(58, prog(t, c2 + 0.6, 6.0) * 2) + text(0, 100, '1〜2ふん', { size: 40, w: 900 }), { x: 548, y: 200, o: prog(t, c2 + 0.6, 0.4) });
    return out;
  },
});

// 6. 残る水の役目：下水のにおいや虫を止める「水のふた」
SCENES.push({
  id: 'role',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    const RX = 560, RY = 40, RS = 2.3, rp = (fx, fy) => [RX + fx * RS, RY + fy * RS], FY = rp(0, 228)[1];
    let out = `<rect width="1920" height="1080" fill="${TT.wall}"/>`;
    // 床の下と下水の管
    const under = prog(t, c1 - 0.2, 0.6);
    out += `<rect x="0" y="${FY}" width="1920" height="${1080 - FY}" fill="${mix(TT.floor, TT.soil, under)}"/><rect x="0" y="${FY}" width="1920" height="8" fill="${TT.floorDk}"/>`;
    const SEW = 'M232 236L232 258Q232 274 250 274L640 274';
    out += g(`<path d="${SEW}" fill="none" stroke="${TT.pipe}" stroke-width="22" stroke-linejoin="round"/><path d="${SEW}" fill="none" stroke="${TT.pipeIn}" stroke-width="16" stroke-linejoin="round"/>`, { x: RX, y: RY, s: RS, o: under });
    // 水：N3 でなくなる → N4 の前にもどる → 蒸発して少しへる
    const gone = prog(t, c3 + 0.5, 0.8) * (1 - prog(t, c4 - 1.2, 0.8));
    const evap = eio(prog(t, c4 + 1.4, 5.0));
    const L = gone > 0 ? lerp(SEAL, 205, gone) : lerp(SEAL, 162, evap);
    out += toilet(RX, RY, RS, { L, id: 'tr' }, {}, t) + topBadge();
    // におい
    const sm = prog(t, c2 + 0.3, 0.6);
    if (sm > 0) {
      let s = '';
      for (let i = 0; i < 9; i++) {
        const p = (t * 0.085 + i / 9) % 1;
        s += smellMark(SMELL_A, p, sm * (1 - gone) * Math.min(1, p * 10, (1 - p) * 9), i);
        const p2 = (t * 0.06 + i / 9) % 1;
        s += smellMark(SMELL_B, p2, sm * gone * Math.min(1, p2 * 10, (1 - p2) * 8), i);
      }
      // 部屋に広がるにおい
      for (let i = 0; i < 6; i++) { const p = (t * 0.25 + i / 6) % 1; s += `<path transform="translate(${70 + i * 18 + Math.sin(t * 2 + i) * 6} ${70 - p * 60}) scale(1.6)" d="M -5 0 Q -2.5 -4.5 0 0 T 5 0" fill="none" stroke="${TT.smell}" stroke-width="2.4" stroke-linecap="round" opacity="${gone * prog(t, c3 + 3.0, 0.8) * (1 - p)}"/>`; }
      // 虫（水の手前で止まって、うろうろ。水がなくなると、少し先まで進む）
      const [ux, uy] = polyAt(SMELL_B, K_SEAL * (0.95 + Math.sin(t * 1.3) * 0.02) + 0.1 * eio(gone));
      s += g(`<ellipse rx="4.6" ry="3" fill="${C.ink}"/><path d="M -3 -2 L -5 -5 M 0 -3 L 0 -6 M 3 -2 L 5 -5 M -3 2 L -5 5 M 0 3 L 0 6 M 3 2 L 5 5" stroke="${C.ink}" stroke-width="1.1" stroke-linecap="round"/>`, { x: ux, y: uy, o: prog(t, c2 + 3.6, 0.5) });
      out += g(s, { x: RX, y: RY, s: RS });
    }
    // はてな
    out += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 800, y: 150, o: win(t, c0 + 0.4, c1 - 0.2, 0.3) });
    out += pop(badge('どうして もどすの？', { fill: C.ink, size: 44 }), t, c0 + 0.6, 300, 300, { end: c1 - 0.1 });
    const [sx, sy] = rp(470, 274);
    out += callout(sx, sy - 14, 1520, 470, 'げすいの くだ', win(t, c1 + 0.8, c4 - 0.2, 0.3), { col: C.ink, size: 44 });
    const [mx, my] = rp(232, 222);
    out += callout(mx + 16, my, 1330, 300, 'くさい におい・むし', win(t, c2 + 1.4, c4 - 0.2, 0.3), { col: TT.smell, size: 42 });
    // 水のふた
    const [wx, wy] = rp(70, SEAL + 6);
    out += callout(wx, wy, 520, 330, 'みずの ふた', win(t, c2 + 2.6, c3 + 0.3, 0.3), { col: TT.waterDk, size: 48 });
    out += pop(badge('においや むしを とめる', { fill: TT.waterDk, size: 44 }), t, c2 + 4.4, 290, 460, { end: c3 + 0.2 });
    const [kx, ky] = rp(197, 139);
    out += g(cross(0, 0, 0.26, C.red), { x: kx, y: ky, o: win(t, c2 + 3.2, c3 + 0.3, 0.3) });
    // 水がないと…
    out += pop(badge('みずが なくなると…', { fill: C.ink, size: 44 }), t, c3 + 0.4, 290, 330, { end: c4 - 0.6 });
    out += pop(badge('においが へやまで！', { fill: TT.smell, size: 50, pad: 40 }), t, c3 + 3.6, 300, 460, { end: c4 - 0.6 });
    // 蒸発
    const eO = prog(t, c4 + 0.4, 0.5);
    if (eO > 0) {
      out += g(badge('ながく つかわないと…', { fill: C.ink, size: 44 }), { x: 290, y: 330, o: eO });
      out += pop(badge('じょうはつして へる ことも', { fill: C.blueUi, size: 42 }), t, c4 + 2.4, 290, 460);
      for (let i = 0; i < 5; i++) { const p = (t * 0.3 + i / 5) % 1, [vx, vy] = rp(60 + i * 20, 130 - p * 70); out += `<circle cx="${vx + Math.sin(t * 2 + i) * 8}" cy="${vy}" r="8" fill="#fff" stroke="${TT.waterDk}" stroke-width="3" opacity="${eO * (1 - p) * Math.min(1, p * 5) * prog(t, c4 + 1.4, 0.5)}"/>`; }
    }
    return out;
  },
});

// 7. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -590;
      let a = pop(card(1360, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, 'くさい においが、あがって こないように する ため', { size: 44, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['まがった みちに みずが たまる', C.blueUi], ['みずが ふたに なる', TT.waterDk], ['においを とめる', TT.smell]], t, 960, 600, { start: 2.6, step: 1.2, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(eyeIcon(0.3)), 'ながす まえに、みずの ひろさを みて おく', C.ink, cue(1)],
        [qm, 'すぐ あとと 1〜2ふん あとで、どう ちがう？', C.ink, cue(2)],
        [qm, 'よそうしてから、くらべて みよう', C.ink, cue(2) + 5.2],
        [g(clockIcon(26, 0.2)), 'タンクの「シャー」が いつ とまるか きく', C.ink, cue(3)],
        [g(warnIcon, { s: 0.62 }), 'ながすのは おとなと いっしょに', C.red, cue(4)],
        [g(warnIcon, { s: 0.62 }), 'べんきの なかに てを いれない', C.red, cue(4) + 3.2],
        [g(warnIcon, { s: 0.62 }), 'タンクの ふたは あけない', C.red, cue(4) + 5.8],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: 38, w: 900, anchor: 'start', fill: col }), t, st, 150, 290 + i * 84); });
      // 3つの便器（上から）：まえ・すぐあと・1〜2ふんあと
      const BX = [1290, 1530, 1770], lab = ['ながす まえ', 'すぐ あと', '1〜2ふん あと'], st = [cue(1) + 0.4, cue(2) + 0.3, cue(2) + 1.6];
      BX.forEach((x, i) => { b += pop(bowlTop(0, 0, 0.6, i === 0 ? 1 : 0, { q: i > 0 }) + text(0, 150, lab[i], { size: 34, w: 900 }), t, st[i], x, 330); });
      b += pop(arrow2(-30, 0, 30, 0, C.muted, 9), t, st[1], 1410, 330) + pop(arrow2(-30, 0, 30, 0, C.muted, 9), t, st[2], 1650, 330);
      // タンクの音と時計
      const sO = prog(t, cue(3) + 0.3, 0.5);
      if (sO > 0) {
        let s = g(tankCut({ cut: false }), { x: 1330 - 245 * 1.9, y: 590 - 12 * 1.9, s: 1.9 });
        for (let i = 0; i < 3; i++) s += `<path d="M ${1445 + i * 26} ${640 - i * 14} q ${16} ${24 + i * 14} 0 ${48 + i * 28}" fill="none" stroke="${TT.waterDk}" stroke-width="7" stroke-linecap="round" opacity="${0.35 + 0.65 * Math.abs(Math.sin(t * 4 - i * 0.8))}"/>`;
        s += text(1330, 778, 'シャー…', { size: 44, w: 900, fill: TT.waterDk });
        s += g(clockIcon(74, (t - cue(3)) * 0.12), { x: 1700, y: 664 }) + text(1700, 778, 'いつ とまる？', { size: 34, w: 900 });
        b += g(s, { o: sO });
      }
      b += kidShow('K', t, 1090, 836, { s: 0.4, start: cue(1) + 0.8, n: 1, enter: 'pop', bubble: false });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「トイレ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += kidShow('K', t, 1660, 1040, { s: 0.7, start: 1.2, n: 2, bubble: false });
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
