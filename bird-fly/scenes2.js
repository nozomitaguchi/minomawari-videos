// みのまわり図鑑「鳥は、どうして 空を 飛べるの？」（もとの記事：everyday-trivia trivia/bird-flight.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色の約束：とり＝はいいろ（ハト）、くうき＝あおい やじるし、うく・すすむ＝みどりの やじるし、
// むねの きんにく＝あか、つばさを あげる きんにく＝ピンク、ほね＝うすき、あたたかい くうき＝オレンジ
const BD = {
  sky: '#8fc4ec', sky2: '#dff0fb', body: '#a4adb8', belly: '#c6cdd5', wing: '#7d8894', wing2: '#687380', dark: '#4d5863',
  neck: '#5fae98', neck2: '#9a84c4', beak: '#3d4650', cere: '#f4f1ea', eye: '#e8742c', foot: '#d9705f',
  air: '#2f7de1', airLt: '#9cc4f4', go: '#2e9a55', meat: '#d2553f', meat2: '#f29bb0', bone: '#f3e6b8', boneL: '#b29a5e',
  warm: '#f0903c', grass: '#8ccd7c', grass2: '#6fb868', armA: '#f0a030', armB: '#8a6fd0', armC: '#2aa6a0',
};

// ---------- とりの道具 ----------
// 矢印（k：0〜1 でのびる）
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0.01) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${ex.toFixed(1)} ${ey.toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
const olText = (x, y, str, { size = 44, fill = '#fff', ol = BD.dark, sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
const skyBg = (id, top = BD.sky, bot = BD.sky2) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.75" stop-color="${bot}"/></linearGradient><rect width="1920" height="1080" fill="url(#${id})"/>`;
// 左へ流れる雲（とりが右へ進んで見える）
const driftClouds = (t, sp = 40, o = 0.95) => [[260, 210, 1.1], [900, 140, 0.8], [1500, 250, 1.2], [2100, 170, 0.9]].map(([x, y, s], i) => cloud((((x - t * sp * (0.7 + i * 0.15)) % 2500) + 2500) % 2500 - 280, y, s, '#fff', o)).join('');
// はね1まい（つけ根が (0,0)、先が上）
const leaf = (L, w, fill, ln = BD.dark, sw = 3) => `<path d="M 0 0 C ${-w} ${-L * 0.25} ${-w} ${-L * 0.8} 0 ${-L} C ${w} ${-L * 0.8} ${w} ${-L * 0.25} 0 0 Z" fill="${fill}" stroke="${ln}" stroke-width="${sw}" stroke-linejoin="round"/><line x1="0" y1="${-L * 0.08}" x2="0" y2="${-L * 0.92}" stroke="${ln}" stroke-width="${sw * 0.8}" opacity="0.55"/>`;
// はばたき。u：1回ぶんの中の位置。down：うちおろしに使う割合。
// かえすのは [k（つばさの上下 1〜-0.85）, open（はねの すきま 0〜1）, うちおろし中か, その中の進み]
function flap(u, down = 0.45) {
  u = ((u % 1) + 1) % 1;
  if (u < down) { const f = u / down; return [lerp(1, -0.85, eio(f)), 0, 1, f]; }
  const f = (u - down) / (1 - down); return [lerp(-0.85, 1, eio(f)), clamp(f * 6) * clamp((1 - f) * 6), 0, f];
}
// よこから見た つばさ（かたが (0,0)、上へのびる）。open で さきの はねが ほそくなり、すきまが あく
const WL = [120, 142, 164, 184, 200, 206, 192];
function wingSide(open = 0, c1 = BD.wing, c2 = BD.wing2, ln = BD.dark) {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const a = lerp(-60, 8, i / 6), w = i >= 2 ? lerp(30, 8, open) : 30;
    s += `<g transform="translate(-4 -34) rotate(${a})">${leaf(WL[i], w, i % 2 ? c2 : c1, ln)}</g>`;
  }
  return s + `<ellipse cx="-10" cy="-30" rx="44" ry="50" fill="${c1}" stroke="${ln}" stroke-width="3" transform="rotate(-24 -10 -30)"/><path d="M -36 -36 Q -12 -54 16 -42 M -38 -14 Q -10 -30 22 -18" fill="none" stroke="${ln}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
}
// ハト（よこ向き・右向き）。(x,y) は からだの まん中。k：つばさの上下（null なら たたむ）、dir=-1 で左向き
function pigeon(x, y, s, { k = 1, open = 0, dir = 1, legs = false, pal = null, head = 0, neckPatch = true } = {}) {
  const P = { body: BD.body, belly: BD.belly, w1: BD.wing, w2: BD.wing2, ln: BD.dark, ...(pal || {}) };
  let o = '';
  if (k !== null) o += `<g transform="translate(26 -26) rotate(-6) scale(0.94 ${(k * 0.94).toFixed(3)})">${wingSide(open, mix(P.w1, '#000000', 0.2), mix(P.w2, '#000000', 0.2), P.ln)}</g>`;
  o += `<path d="M -74 -18 L -178 -24 L -186 4 L -174 26 L -76 28 Z" fill="${P.w1}" stroke="${P.ln}" stroke-width="3" stroke-linejoin="round"/><path d="M -150 -23 L -178 -24 L -186 4 L -174 26 L -148 27 Z" fill="${P.ln}"/>`;
  if (legs) o += `<path d="M -12 46 L -16 86 M 16 46 L 16 86" stroke="${BD.foot}" stroke-width="8" stroke-linecap="round"/><path d="M -16 86 l -18 6 M -16 86 l 18 6 M -16 86 l 2 10 M 16 86 l -16 6 M 16 86 l 20 6 M 16 86 l 4 10" stroke="${BD.foot}" stroke-width="6" stroke-linecap="round"/>`;
  else o += `<ellipse cx="-26" cy="52" rx="16" ry="8" fill="${BD.foot}"/><ellipse cx="2" cy="55" rx="16" ry="8" fill="${BD.foot}"/>`;
  o += `<ellipse cx="0" cy="0" rx="98" ry="56" fill="${P.body}" transform="rotate(-8)"/><path d="M -74 26 Q -4 66 70 24 Q 30 40 -10 40 Q -44 38 -74 26 Z" fill="${P.belly}"/>`;
  o += `<g transform="rotate(${head} 56 -10)"><path d="M 34 -44 Q 62 -84 96 -92 L 132 -46 Q 106 -16 86 18 Z" fill="${P.body}"/>` +
    (neckPatch ? `<ellipse cx="80" cy="-30" rx="20" ry="32" fill="${BD.neck}" transform="rotate(28 80 -30)"/><ellipse cx="74" cy="-12" rx="16" ry="20" fill="${BD.neck2}" opacity="0.8" transform="rotate(28 74 -12)"/>` : '') +
    `<circle cx="104" cy="-64" r="31" fill="${P.body}"/><path d="M 131 -70 L 164 -58 L 132 -52 Z" fill="${BD.beak}"/><ellipse cx="135" cy="-68" rx="8" ry="5.5" fill="${BD.cere}"/>` +
    `<circle cx="112" cy="-70" r="8" fill="${BD.eye}"/><circle cx="113" cy="-70" r="4" fill="${C.ink}"/><circle cx="111" cy="-72" r="1.6" fill="#fff"/></g>`;
  if (k === null) o += `<path d="M -150 12 Q -110 -30 -20 -42 Q 40 -44 56 -18 Q 30 22 -40 26 Q -100 28 -150 12 Z" fill="${P.w1}" stroke="${P.ln}" stroke-width="3" stroke-linejoin="round"/><path d="M -60 -24 Q -46 0 -64 22 M -24 -32 Q -8 -6 -26 22" fill="none" stroke="${P.ln}" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
  else o += `<g transform="translate(8 -18) rotate(-12) scale(1 ${k.toFixed(3)})">${wingSide(open, P.w1, P.w2, P.ln)}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">${o}</g>`;
}
// 公園の背景
const bench = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-110" y="-64" width="220" height="16" rx="6" fill="#b9814c"/><rect x="-110" y="-104" width="220" height="14" rx="6" fill="#b9814c"/><rect x="-110" y="-130" width="220" height="14" rx="6" fill="#b9814c"/><path d="M -92 -132 L -92 0 M 92 -132 L 92 0" stroke="#7a5a3a" stroke-width="10" stroke-linecap="round"/></g>`;
const parkGround = () => `<path d="M 0 690 Q 480 650 960 680 T 1920 670 L 1920 1080 L 0 1080 Z" fill="${BD.grass}"/>` + tree(170, 700, 1.9) + tree(1790, 690, 1.6, '#4a9a58') + bench(1470, 730, 1.1) +
  `<path d="M 0 800 Q 600 770 1200 806 T 1920 796 L 1920 1080 L 0 1080 Z" fill="${BD.grass2}" opacity="0.55"/>`;
// はねの しるし（題名のかざり）
const featherIcon = (L = 110, col = BD.wing) => `<g transform="rotate(24)">${leaf(L, L * 0.2, col, BD.dark, 4)}<line x1="0" y1="0" x2="0" y2="22" stroke="${BD.dark}" stroke-width="5" stroke-linecap="round"/></g>`;

// 1. つかみ：公園のハトが、バタバタと とびたつ
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    let out = '';
    const aO = 1 - prog(t, c1 - 0.6, 0.5);
    if (aO > 0) {
      let a = skyBg('hkbg') + cloud(420, 210, 1.1) + cloud(1320, 150, 0.9) + parkGround();
      // 地面のハト（1わは ついばんだまま）
      a += pigeon(520, 730, 0.62, { k: null, legs: true, head: 22 + Math.max(0, Math.sin(t * 6)) * 26 });
      // とびたつ 2わ（頭が 進む向き）
      const fly = (x0, y0, st, dx, dy, dir, s) => {
        const f = prog(t, st, 3.6);
        if (f <= 0) return pigeon(x0, y0, s, { k: null, legs: true, dir, head: 10 + Math.max(0, Math.sin(t * 5 + st)) * 20 });
        const [k, op] = flap((t - st) * 4.2);
        return pigeon(x0 + dir * dx * f, y0 - dy * eo(f) + Math.sin(t * 9) * 6, s, { k, open: op, dir });
      };
      a += fly(820, 720, c0 + 0.2, 760, 500, 1, 0.78) + fly(1130, 740, c0 + 0.7, 900, 440, -1, 0.7);
      const bt = c0 + d0 * 0.45;
      a += pop(g(olText(0, 0, 'バタ', { size: 88, sw: 16 }), { r: -10 }), t, bt, 1050, 330, { end: c1 - 0.5 }) + pop(g(olText(0, 0, 'バタ', { size: 70, sw: 14 }), { r: 8 }), t, bt + 0.35, 640, 420, { end: c1 - 0.5 });
      out += g(a, { o: aO });
    }
    // 大きく：つばさを あげては、つよく うちおろす
    const bO = prog(t, c1 - 0.4, 0.5);
    if (bO > 0) {
      const [k, op, dn] = flap((t - c1) * 0.9, 0.4);
      let b = skyBg('hkbg2') + driftClouds(t, 120);
      b += pigeon(1060, 490 + k * 14, 1.7, { k, open: op });
      const up = clamp((k - 0.2) * 2), down = clamp((-k - 0.1) * 2.4);
      b += g(badge('おおきく あげる', { fill: BD.dark, size: 46 }), { x: 1560, y: 230, o: up * prog(t, c1 + 0.3, 0.3), s: 1 });
      b += g(badge('つよく うちおろす', { fill: BD.air, size: 46 }), { x: 1560, y: 720, o: down * prog(t, c1 + 0.3, 0.3), s: 1 });
      out += g(b, { o: bO });
      out += kidShow('S', t, 200, 900, { s: 0.62, start: cue(2) - 0.9, n: 0, look: [8, -6] });
    }
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 240);
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${BD.wing2}">鳥</tspan>は、どうして</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${BD.air}">空</tspan>を 飛べるの？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      [[-330, 0.9, BD.wing], [-110, 1.15, BD.body], [110, 1.0, BD.wing2], [330, 0.85, BD.wing]].forEach(([dx, s, col], i) => { out += pop(g(featherIcon(100 * s, col), { r: Math.sin(t * 2 + i) * 8, y: 50 * s }), t, t0 + 1.7 + i * 0.15, 960 + dx, 820); });
    }
    return out;
  },
});

// 2. 予想：つばさを 上げるとき、さきの はねは どうなる？
const GUESS_ICON = [
  // ぴったり くっついた まま
  () => [-26, 0, 26].map((x, i) => `<g transform="translate(${x} 52)">${leaf(104, 26, i % 2 ? BD.wing2 : BD.wing)}</g>`).join(''),
  // くるんと まるまる
  () => { const p = []; for (let i = 0; i <= 44; i++) { const k = i / 44, a = Math.PI * 0.5 - k * Math.PI * 2.4, r = 52 - 40 * k; p.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`); } return `<path d="M ${p.join(' L ')}" fill="none" stroke="${BD.dark}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${p.join(' L ')}" fill="none" stroke="${BD.wing}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>`; },
  // あいだに すきまが あく
  () => [-38, 0, 38].map((x, i) => `<g transform="translate(${x} 52)">${leaf(104, 9, i % 2 ? BD.wing2 : BD.wing)}</g>`).join(''),
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.28;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(text(0, 0, 'つばさを あげる とき、さきの はねは どうなる？', { size: 58, w: 900 }), t, q0 + 0.1, 900, 210);
    const opts = [['①', 'ぴったり、くっついた まま'], ['②', 'くるんと、まるまる'], ['③', 'あいだに、すきまが あく']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 48, w: 700, anchor: 'start' }) + g(GUESS_ICON[i](), { x: 500, y: 0, s: 0.98 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('B', t, 1730, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 360, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. つばさで 空気を 下と後ろへ おす → うく・すすむ。つばさの 上と下で、おす力が ちがう
// つばさを 切った形（右が前）
const WSEC = 'M -380 44 C -220 -30 60 -156 250 -118 C 336 -100 380 -44 350 0 C 330 28 286 32 240 30 C 80 22 -160 34 -380 44 Z';
SCENES.push({
  id: 'push',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = '';
    const aO = 1 - prog(t, c2 - 0.7, 0.5);
    if (aO > 0) {
      const [k, op, dn, f] = flap(t * 0.8, 0.5);
      const lift = prog(t, c1, 0.6);
      let a = skyBg('psbg') + driftClouds(t, 90 + 90 * lift);
      const BX = 900, BY = 480 - 26 * eo(lift) + k * 14;
      a += pigeon(BX, BY, 1.6, { k, open: op });
      // おされる空気（下と後ろへ）
      const pk = prog(t, c0 + d0 * 0.3, 0.5);
      if (pk > 0) [[-150, 150, 0], [-10, 190, 0.12], [130, 170, 0.24]].forEach(([dx, dy, dl], i) => {
        const pu = dn ? clamp(f * 1.6 - dl) : 1; const x1 = BX + dx, y1 = 470 + dy;
        a += arrow(x1, y1, x1 - 150, y1 + 150, BD.air, 18, eo(pk) * (0.55 + 0.45 * pu), 0.95);
      });
      a += pop(badge('くうきを、したと うしろへ おす', { fill: BD.air, size: 46 }), t, c0 + d0 * 0.45, 1430, 720, { end: c2 - 0.5 });
      // うく・すすむ
      a += arrow(BX - 330, 330, BX - 330, 190, BD.go, 24, eo(prog(t, c1 + d1 * 0.2, 0.5))) + pop(olText(0, 0, 'うく', { size: 66, ol: BD.go }), t, c1 + d1 * 0.25, BX - 330, 140);
      a += arrow(1290, 440, 1500, 440, BD.go, 24, eo(prog(t, c1 + d1 * 0.55, 0.5))) + pop(olText(0, 0, 'すすむ', { size: 66, ol: BD.go }), t, c1 + d1 * 0.6, 1420, 350);
      out += g(a, { o: aO }) + g(topBadge(), { o: aO });
    }
    const bO = prog(t, c2 - 0.4, 0.5);
    if (bO > 0) {
      let b = skyBg('psbg2', '#a9d2f0', '#eaf5fc');
      const CX = 960, up = eo(prog(t, c3 + d3 * 0.55, 0.8)) * 22, CY = 480 - up;
      // 流れる空気（右から左へ。上のほうが はやい）
      for (let j = 0; j < 9; j++) {
        const u1 = ((t * 0.34 + j / 9) % 1), x1 = lerp(820, -820, u1), y1 = -150 - 96 * Math.exp(-Math.pow((x1 - 60) / 300, 2));
        b += `<circle cx="${CX + x1}" cy="${CY + y1}" r="11" fill="${BD.air}" opacity="${0.8 * clamp(u1 * 8) * clamp((1 - u1) * 8)}"/>`;
        const u2 = ((t * 0.2 + j / 9) % 1), x2 = lerp(820, -820, u2);
        b += `<circle cx="${CX + x2}" cy="${CY + 110}" r="11" fill="${BD.air}" opacity="${0.8 * clamp(u2 * 8) * clamp((1 - u2) * 8)}"/>`;
      }
      b += `<g transform="translate(${CX} ${CY})"><path d="${WSEC}" fill="${BD.wing}" stroke="${BD.dark}" stroke-width="7" stroke-linejoin="round"/><path d="M -260 2 C -120 -50 60 -110 230 -84" fill="none" stroke="#a9b3bd" stroke-width="9" stroke-linecap="round"/></g>`;
      b += pop(card(400, 250) + pigeon(0, 10, 0.5, { k: 0.72 }) + `<line x1="-48" y1="-92" x2="-12" y2="-12" stroke="${C.red}" stroke-width="7" stroke-dasharray="12 9" stroke-linecap="round"/>` + text(0, 96, 'ここを きった かたち', { size: 32, w: 900, fill: C.redUi }), t, c2 - 0.2, 300, 700);
      b += g(text(1420, CY + 20, 'まえ', { size: 40, w: 900, fill: BD.dark }) + text(470, CY + 30, 'うしろ', { size: 40, w: 900, fill: BD.dark }), { o: prog(t, c2, 0.4) });
      b += pop(badge('うえは、まるく ふくらんで いる', { fill: BD.dark, size: 44 }), t, c2 + d2 * 0.12, 1000, 170, { end: c2 + d2 * 0.5 });
      // 上：おす力が よわい（小さい矢印）
      const wk = prog(t, c2 + d2 * 0.55, 0.5);
      [-150, 60, 250].forEach((x, i) => { const yy = -150 - 96 * Math.exp(-Math.pow((x - 60) / 300, 2)) + 70; b += arrow(CX + x, CY + yy - 84, CX + x, CY + yy - 30, '#6f9fd8', 13, eo(wk)); });
      b += pop(badge('うえ：おす ちからが よわい', { fill: '#6f9fd8', size: 46 }), t, c2 + d2 * 0.6, 1000, 170);
      // 下：おす力が つよい（大きい矢印）
      const sk = prog(t, c3 + d3 * 0.12, 0.5);
      [-60, 130, 320].forEach((x, i) => { b += arrow(CX + x, CY + 250, CX + x, CY + 62, BD.air, 26, eo(sk) * (0.9 + 0.1 * Math.sin(t * 5 + i))); });
      b += pop(badge('した：おす ちからが つよい', { fill: BD.air, size: 46 }), t, c3 + d3 * 0.18, 1090, 790);
      b += arrow(CX + 620, CY + 60, CX + 620, CY - 120, BD.go, 26, eo(prog(t, c3 + d3 * 0.55, 0.5))) + pop(olText(0, 0, 'もちあがる', { size: 60, ol: BD.go }), t, c3 + d3 * 0.6, CX + 680, CY - 180);
      b += pop(card(500, 150) + text(0, -26, 'ひこうきの つばさと', { size: 38, w: 900, fill: C.ochre }) + text(0, 28, 'おなじ かんがえかた', { size: 38, w: 900, fill: C.ochre }), t, c3 + d3 * 0.8, 1640, 665);
      out += g(b, { o: bO }) + g(topBadge(), { o: bO });
    }
    return out;
  },
});

// 4. つばさは 人の うでと て。長い はねが ならんで 面になる。はねは マジックテープ
// ほね（太い線と ふしの丸）
const boneSeg = (x1, y1, x2, y2, col, w = 24) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BD.dark}" stroke-width="${w + 8}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
// はねの 中を 大きくした図：えだ（よこ線）と、となりを つなぐ 小さな かぎ。sep>0 で 下の えだが はなれる
function hookView(R, t, sep = 0) {
  let o = `<rect x="${-R}" y="${-R}" width="${2 * R}" height="${2 * R}" fill="#eef3f7"/>`;
  [-170, 0, 170].forEach((y0, r) => {
    const y = y0 + (r === 2 ? sep * 46 : 0);
    if (r < 2) for (let i = -5; i <= 5; i++) {
      const x = i * 56, lo = r === 1 ? sep : 0, yb = y0 + 170 + lo * 46;
      // 上の えだから 下へのびる 細い えだ
      o += `<line x1="${x - 16}" y1="${y + 10}" x2="${x + 14}" y2="${y + 96}" stroke="${BD.wing}" stroke-width="8" stroke-linecap="round"/>`;
      // 下の えだから 上へのびて、先の かぎで ひっかける
      const hx = x + 30 - lo * 10, hy = yb - 84 + lo * 6, op = lo * 26;
      o += `<path d="M ${x + 44} ${yb - 10} L ${hx} ${hy} q -14 -12 -26 ${-2 + op * 0.3}" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    o += `<line x1="${-R}" y1="${y}" x2="${R}" y2="${y}" stroke="${BD.dark}" stroke-width="30" stroke-linecap="round"/><line x1="${-R}" y1="${y}" x2="${R}" y2="${y}" stroke="${BD.wing2}" stroke-width="22" stroke-linecap="round"/>`;
  });
  return o;
}
// 大きな はね1まい（まん中 (0,0)、よこ向き。gap>0 で まん中に われ目）
function bigFeather(L, W, gap = 0) {
  let o = `<path d="M ${-L / 2 - 70} 0 L ${L / 2} 0" stroke="#e9dfc6" stroke-width="16" stroke-linecap="round"/>`;
  o += `<path d="M ${-L / 2} 0 C ${-L * 0.3} ${-W} ${L * 0.3} ${-W} ${L / 2} 0 C ${L * 0.3} ${W * 0.8} ${-L * 0.3} ${W * 0.8} ${-L / 2} 0 Z" fill="${BD.wing}" stroke="${BD.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  for (let i = -6; i <= 6; i++) { const x = i * L / 15; o += `<path d="M ${x} 0 L ${x + 34} ${-W * 0.62 * Math.cos(i / 8)} M ${x} 0 L ${x + 34} ${W * 0.5 * Math.cos(i / 8)}" stroke="${BD.wing2}" stroke-width="5" stroke-linecap="round"/>`; }
  o += `<path d="M ${-L / 2 - 70} 0 L ${L / 2 - 10} 0" stroke="#f6eed8" stroke-width="10" stroke-linecap="round"/>`;
  if (gap > 0.02) o += `<path d="M ${L * 0.1} -6 L ${L * 0.1 + 50 + 26 * gap} ${-W * 0.74} L ${L * 0.1 + 50 - 30 * gap} ${-W * 0.76} Z" fill="${C.paper}" stroke="${BD.dark}" stroke-width="${4 * gap}" stroke-linejoin="round" opacity="${clamp(gap * 3)}"/>`;
  return o;
}
SCENES.push({
  id: 'arm',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, c2 - 0.7, 0.4);
    if (aO > 0) {
      // 左：ひとの うでと て
      let h = card(760, 520);
      h += `<path d="M -250 20 L -60 20 L 120 20 L 200 20" fill="none" stroke="${CH.skin}" stroke-width="92" stroke-linecap="round" stroke-linejoin="round"/>`;
      h += `<circle cx="226" cy="20" r="56" fill="${CH.skin}"/>` + [[-52, -30], [-66, -8], [-66, 16], [-58, 38]].map(([dy, dx], i) => `<line x1="250" y1="${20 + [-34, -12, 10, 30][i]}" x2="${318 + [0, 12, 8, -6][i]}" y2="${20 + [-48, -16, 14, 42][i]}" stroke="${CH.skin}" stroke-width="20" stroke-linecap="round"/>`).join('') + `<line x1="214" y1="-20" x2="236" y2="-66" stroke="${CH.skin}" stroke-width="22" stroke-linecap="round"/>`;
      h += `<path d="M -330 -90 Q -250 -110 -236 -30 L -236 70 Q -250 150 -330 130 Z" fill="${CH.shirtB}"/>`;
      const bk = eo(prog(t, c0 + d0 * 0.25, 0.5));
      h += g(boneSeg(-240, 20, -64, 20, BD.armA) + boneSeg(-40, 20, 124, 20, BD.armB) + boneSeg(150, 20, 232, 20, BD.armC), { o: bk });
      h += text(0, -200, 'ひとの うでと て', { size: 50, w: 900 });
      out += g(pop(h, t, 0.2, 0, 0), { x: 500, y: 470, o: aO });
      // 右：とりの つばさ（かたが 左、さきが 右。上が 前）
      const SHX = -280, SHY = -40, EL = [-170, 20], WR = [-10, -80], TP = [150, -60];
      let w = card(840, 520);
      // はね：うでの はね（下へ）と、ての はね（外へ ひろがる）
      const fk = c1 + d1 * 0.15;
      let fe = '';
      for (let i = 0; i < 6; i++) { const u = i / 5, x = lerp(EL[0] + 10, WR[0] - 10, u), y = lerp(EL[1], WR[1], u) + 8; fe += pop(g(leaf(lerp(170, 200, u), 30, i % 2 ? BD.wing2 : BD.wing), { r: 180 - lerp(-8, 6, u) }), t, fk + i * 0.12, x, y, { d: 0.4 }); }
      for (let i = 0; i < 7; i++) { const u = i / 6, x = lerp(WR[0] + 6, TP[0], u), y = lerp(WR[1], TP[1], u) + 6; fe += pop(g(leaf(lerp(214, 250, Math.sin(u * 2.2)), 30, i % 2 ? BD.wing : BD.wing2), { r: 180 - lerp(10, 82, u) }), t, fk + 0.8 + i * 0.12, x, y, { d: 0.4 }); }
      w += fe;
      // つばさの りんかく（はねが 出る前）
      w += g(`<path d="M ${SHX} ${SHY - 30} Q -160 -130 ${WR[0]} ${WR[1] - 26} Q 100 -110 ${TP[0] + 40} ${TP[1]} Q 60 40 ${EL[0] + 40} ${EL[1] + 40} Q -240 50 ${SHX} ${SHY + 34} Z" fill="${BD.body}" stroke="${BD.dark}" stroke-width="5" stroke-linejoin="round"/>`, { o: 1 });
      w += g(boneSeg(SHX, SHY, EL[0], EL[1], BD.armA) + boneSeg(EL[0] + 14, EL[1] - 6, WR[0], WR[1], BD.armB) + boneSeg(WR[0] + 16, WR[1] + 2, TP[0], TP[1], BD.armC), { o: bk });
      w += `<path d="M -400 -130 Q -310 -150 -292 -60 L -292 60 Q -310 150 -400 130 Z" fill="${BD.body}"/>`;
      w += text(0, -200, 'とりの つばさ', { size: 50, w: 900 });
      out += g(pop(w, t, 0.5, 0, 0), { x: 1370, y: 470, o: aO });
      out += g(chipsRow([['かた〜ひじ', BD.armA], ['ひじから さき', BD.armB], ['て', BD.armC]], t, 960, 775, { start: c0 + d0 * 0.4, step: 0.5, size: 40 }), { o: aO * (1 - prog(t, c1 + d1 * 0.5, 0.3)) });
      out += g(pop(badge('ながい はねが ならんで、くうきを うける めんに なる', { fill: BD.dark, size: 42 }), t, c1 + d1 * 0.55, 960, 775), { o: aO });
    }
    const bO = prog(t, c2 - 0.4, 0.5);
    if (bO > 0) {
      // われ目：ととのえる前に ひらいて、くちばしが 通ると とじる
      const sp = prog(t, c4 - 1.3, 0.5), cl = eio(prog(t, c4 + d4 * 0.35, 1.4)), sep = sp * (1 - cl);
      const FX = 420, FY = 500;
      let b = g(bigFeather(560, 120, sep), { x: FX, y: FY, r: -18 });
      b += pop(text(0, 0, 'はね 1まい', { size: 50, w: 900 }), t, c2 - 0.2, 300, 700);
      // 虫めがねで 大きく
      const CX = 1040, CY = 430, R = 250, zk = prog(t, c2 + d2 * 0.25, 0.5), ex = FX + 60, ey = FY - 66;
      if (zk > 0) {
        let z = `<circle cx="${ex}" cy="${ey}" r="34" fill="none" stroke="${C.blueUi}" stroke-width="8"/><line x1="${ex + 20}" y1="${ey - 28}" x2="${CX - 180}" y2="${CY - R + 60}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/><line x1="${ex + 20}" y1="${ey + 28}" x2="${CX - 180}" y2="${CY + R - 60}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/>`;
        z += `<clipPath id="hkc"><circle cx="0" cy="0" r="${R}"/></clipPath><g transform="translate(${CX} ${CY})"><g clip-path="url(#hkc)">${hookView(R, t, sep)}</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/><path d="M ${-R * 0.62} ${-R * 0.5} A ${R * 0.8} ${R * 0.8} 0 0 1 ${-R * 0.1} ${-R * 0.79}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.6"/></g>`;
        b += g(z, { o: zk });
        b += pop(badge('ちいさな かぎ', { fill: C.ochre, size: 44 }), t, c2 + d2 * 0.45, 1560, 230, { end: c4 - 0.4 }) + pointer(1480, 266, CX + 86, CY - 86, C.ochre, prog(t, c2 + d2 * 0.45 + 0.2, 0.3) * (1 - prog(t, c4 - 0.6, 0.3)));
        b += pop(badge('マジックテープ みたいに くっつく', { fill: BD.dark, size: 44 }), t, c2 + d2 * 0.7, 1000, 790, { end: c4 - 0.4 });
      }
      // くちばしで ととのえる
      const pk = prog(t, c4 - 0.6, 0.6);
      if (pk > 0) {
        const mv = eio(prog(t, c4 + d4 * 0.2, 1.8));
        b += pigeon(lerp(300, 362, mv) - (1 - eo(pk)) * 420, 372, 0.8, { k: null, head: 34 + Math.sin(t * 9) * 6 * (mv > 0 && mv < 1 ? 1 : 0), neckPatch: true });
        b += pop(badge('はなれた ところ', { fill: C.redUi, size: 38 }), t, c4 - 0.9, 640, 190, { end: c4 + d4 * 0.35 + 0.9 });
        b += pop(badge('くちばしで ととのえる → かぎが かみあう', { fill: BD.dark, size: 44 }), t, c4 + d4 * 0.45, 1000, 790);
        const fl = prog(t, c4 + d4 * 0.35 + 1.2, 0.5);
        if (fl > 0 && fl < 1) b += `<circle cx="${CX}" cy="${CY + 86}" r="${60 + 160 * fl}" fill="none" stroke="#fff" stroke-width="12" opacity="${1 - fl}"/>`;
      }
      out += g(b, { o: bO });
      out += kidShow('K', t, 1760, 890, { s: 0.62, start: cue(3) - 0.9, n: 0 });
    }
    return out;
  },
});

// 5. うちおろしで はねが かさなり、うちあげで すきまが あく
// ブラインドの絵（open：0 とじる 〜 1 ひらく）
const blindIcon = open => `<rect x="-86" y="-92" width="172" height="184" rx="12" fill="#cfe6f5" stroke="${BD.dark}" stroke-width="7"/>` + Array.from({ length: 6 }, (_, i) => `<rect x="-78" y="${-80 + i * 28 + (1 - lerp(1, 0.22, open)) * 13}" width="156" height="${26 * lerp(1, 0.22, open)}" rx="4" fill="#f4ead8" stroke="${BD.boneL}" stroke-width="3"/>`).join('') + `<line x1="70" y1="-92" x2="70" y2="110" stroke="${BD.dark}" stroke-width="4"/>`;
SCENES.push({
  id: 'stroke',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c3 = cue(3), d3 = cueE(3) - c3;
    let out = skyBg('stbg') + driftClouds(t, 70, 0.8);
    // うごき：N0 のあいだは ゆっくり うちおろすのを 2回。N1 で ゆっくり 上げて（すきまが あく）、そのまま見せる。N3 からは くり返し
    const seg = (a, b) => clamp((t - a) / (b - a));
    const d1a = c0 + 0.5, d1b = d1a + 2.2, u1b = d1b + 1.0, d2a = u1b + 0.3, d2b = d2a + 2.2, ua = c1 - 0.2, ub = c1 + 3.0, lp = c3 - 0.4;
    let k = 1, op = 0, dn = 0, f = 0, lab = '';
    if (t < d1a) { k = 1; }
    else if (t < d1b) { f = seg(d1a, d1b); k = lerp(1, -0.85, eio(f)); dn = 1; lab = 'うちおろし'; }
    else if (t < u1b) { f = seg(d1b + 0.2, u1b); k = lerp(-0.85, 1, eio(f)); op = Math.sin(f * Math.PI); }
    else if (t < d2a) { k = 1; }
    else if (t < ua) { f = seg(d2a, d2b); k = lerp(1, -0.85, eio(f)); dn = f < 1 ? 1 : 0; lab = 'うちおろし'; }
    else if (t < lp) { f = seg(ua, ub); k = lerp(-0.85, 0.95, eio(f)); op = clamp(f * 5); lab = 'うちあげ'; }
    else { const st = flap((t - lp) / 3.6, 0.3); k = st[0]; op = Math.max(st[1], 1 - (t - lp) / 0.25); dn = st[2]; f = st[3]; lab = dn ? 'うちおろし' : 'うちあげ'; }
    const BX = 620, BY = 440, S = 1.55;
    // うちおろし：おされる空気と、前へ進む力
    if (dn) {
      const a = Math.sin(f * Math.PI);
      [[-250, 110], [-170, 200], [150, 190]].forEach(([dx, dy]) => { out += arrow(BX + dx, BY + dy + f * 20, BX + dx - 80, BY + dy + f * 20 + 90, BD.air, 18, 1, a * 0.95); });
      out += arrow(BX + 300, BY - 20, BX + 440, BY - 20, BD.go, 22, 1, a);
    }
    out += pigeon(BX + (dn ? Math.sin(f * Math.PI) * 14 : 0), BY + k * 12, S, { k, open: op });
    // うちあげ：すきまを 通りぬける空気（つばさの さきの あたり）
    if (!dn && op > 0.3 && k > -0.6) for (let i = 0; i < 4; i++) {
      const x = BX - 170 + i * 56, y0 = BY - 30 - k * 210, u = (t * 1.3 + i * 0.27) % 1;
      out += `<line x1="${x}" y1="${y0 - 70 + u * 150}" x2="${x}" y2="${y0 - 20 + u * 150}" stroke="${BD.air}" stroke-width="8" stroke-linecap="round" opacity="${0.8 * op * Math.sin(u * Math.PI)}"/>`;
    }
    // 右：さきの はねを 大きく
    const CX = 1400, CY = 400, R = 230, zk = prog(t, c0 + 0.3, 0.5);
    if (zk > 0) {
      let z = `<clipPath id="stc"><circle cx="0" cy="0" r="${R}"/></clipPath><g transform="translate(${CX} ${CY})"><g clip-path="url(#stc)"><rect x="${-R}" y="${-R}" width="${2 * R}" height="${2 * R}" fill="#e3f2fb"/>`;
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * 80, w = lerp(54, 16, op);
        z += `<g transform="translate(${x} 236) rotate(${(i - 2) * 5})">${leaf(440, w, i % 2 ? BD.wing2 : BD.wing, BD.dark, 5)}</g>`;
      }
      // すきまを 通る空気
      if (op > 0.2) for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
        const x = (i - 1.5) * 80, u = (t * 0.9 + i * 0.23 + j * 0.5) % 1, y = lerp(-220, 220, u);
        z += arrow(x, y - 50, x, y + 30, BD.air, 12, 1, op * Math.sin(u * Math.PI) * 0.9);
      }
      z += `</g><circle r="${R}" fill="none" stroke="${C.blueUi}" stroke-width="18"/></g>`;
      out += g(z, { o: zk });
      out += g(text(CX, 124, 'つばさの さきの はね', { size: 44, w: 900, fill: BD.dark }), { o: zk });
      const dO = clamp(1 - op * 3) * zk, uO = clamp(op * 3 - 0.6) * zk * (lab || t > lp ? 1 : 0);
      out += g(badge('かさなって いる', { fill: BD.dark, size: 46 }), { x: CX, y: 690, o: dO });
      out += g(badge('すきまが あく', { fill: BD.air, size: 46 }), { x: CX, y: 690, o: uO });
    }
    // いまの うごき
    if (lab) out += g(olText(0, 0, lab, { size: 72, ol: lab === 'うちおろし' ? BD.dark : BD.air, sw: 14 }), { x: 240, y: 200, o: t < lp ? 1 : Math.min(1, Math.sin(clamp(f) * Math.PI) * 4) });
    out += pop(badge('はねが かさなって、まえへ すすむ ちからを うむ', { fill: BD.dark, size: 42 }), t, c0 + d0 * 0.45, 760, 785, { end: c1 - 0.3 });
    out += pop(g(blindIcon(op), { s: 0.8 }), t, c1 + d1 * 0.5, 1040, 250, { end: c3 - 0.2 }) + pop(badge('ブラインド みたいに ひらく', { fill: BD.air, size: 42 }), t, c1 + d1 * 0.55, 760, 785, { end: c3 - 0.2 });
    out += pop(badge('くうきが すりぬける → じゃまされにくい', { fill: BD.air, size: 44 }), t, c3 + d3 * 0.4, 760, 785);
    out += kidShow('B', t, 140, 905, { s: 0.56, start: cue(2) - 0.9, n: 0, act: 'cheer', end: c3 + d3 * 0.35 });  // spin だと 話しはじめに 横向きで 見えなくなるので 決める
    out += topBadge();
    return out;
  },
});

// 6. むねの 大きな きんにくと、ほねの でっぱり。からだの 5ぶんの1。上げる きんにくも むねにあって、かっしゃで 引き上げる
// まえから 見た とりの からだの中（かんたんな図）。th：つばさの角度（度。上がプラス）
function chestFront(th, { red = 1, pink = 0, glowR = 0, glowP = 0, keelHi = 0 } = {}) {
  const r = th * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), SH = 126, SY = -112;
  const P = (sd, d, off = 0) => [sd * (SH + d * cs + off * sn), SY - d * sn + off * cs];
  const pt = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  let o = '';
  [-1, 1].forEach(sd => {
    const a = P(sd, -20, -30), b = P(sd, 210, -44), c = P(sd, 450, 0), d = P(sd, 230, 96), e = P(sd, -20, 70);
    o += `<path d="M ${pt(a)} Q ${pt(b)} ${pt(c)} Q ${pt(d)} ${pt(e)} Z" fill="${BD.wing}" stroke="${BD.dark}" stroke-width="6" stroke-linejoin="round"/>`;
    for (let i = 1; i <= 4; i++) { const p1 = P(sd, 90 + i * 70, 10), p2 = P(sd, 110 + i * 74, 70 - i * 8); o += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${BD.wing2}" stroke-width="5" stroke-linecap="round"/>`; }
  });
  o += `<ellipse cx="0" cy="10" rx="170" ry="206" fill="#eef1f4" stroke="${BD.dark}" stroke-width="6"/>`;
  // あたま
  o += `<circle cx="0" cy="-246" r="74" fill="${BD.body}" stroke="${BD.dark}" stroke-width="6"/><circle cx="-34" cy="-256" r="10" fill="${BD.eye}"/><circle cx="-34" cy="-256" r="5" fill="${C.ink}"/><circle cx="34" cy="-256" r="10" fill="${BD.eye}"/><circle cx="34" cy="-256" r="5" fill="${C.ink}"/><path d="M -13 -232 L 0 -200 L 13 -232 Z" fill="${BD.beak}"/><ellipse cx="0" cy="-234" rx="16" ry="8" fill="${BD.cere}"/>`;
  // ほね：むねの ほねと でっぱり、つばさの ほね
  if (keelHi > 0) o += `<path d="M 0 30 L 0 190" stroke="${C.yellow}" stroke-width="${46 * keelHi}" stroke-linecap="round" opacity="${0.55 * keelHi}"/>`;
  o += `<path d="M -100 22 Q 0 2 100 22 L 100 42 Q 42 34 13 42 L 9 184 Q 0 196 -9 184 L -13 42 Q -42 34 -100 42 Z" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="5" stroke-linejoin="round"/>`;
  [-1, 1].forEach(sd => { const s0 = P(sd, 0), s1 = P(sd, 210); o += `<line x1="${s0[0].toFixed(1)}" y1="${s0[1].toFixed(1)}" x2="${s1[0].toFixed(1)}" y2="${s1[1].toFixed(1)}" stroke="${BD.boneL}" stroke-width="28" stroke-linecap="round"/><line x1="${s0[0].toFixed(1)}" y1="${s0[1].toFixed(1)}" x2="${s1[0].toFixed(1)}" y2="${s1[1].toFixed(1)}" stroke="${BD.bone}" stroke-width="19" stroke-linecap="round"/>`; });
  // つばさを 上げる きんにく（ピンク）と すじ。かたの あなを 通って、つばさの ほねの 上がわに つく
  if (pink > 0) [-1, 1].forEach(sd => {
    const H = [sd * (SH + 2), SY - 30], T = P(sd, 86, -16);
    o += `<g opacity="${pink}"><path d="M ${sd * 14} 50 L ${sd * 14} 166 Q ${sd * 92} 136 ${sd * 84} 34 Q ${sd * 44} 34 ${sd * 14} 50 Z" fill="${mix(BD.meat2, '#ffffff', 0.25 * glowP)}" stroke="#c9607c" stroke-width="${4 + 4 * glowP}" stroke-linejoin="round"/>` +
      `<path d="M ${sd * 80} 40 Q ${sd * 120} -30 ${pt(H)} L ${pt(T)}" fill="none" stroke="#8a5a3a" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${sd * 80} 40 Q ${sd * 120} -30 ${pt(H)} L ${pt(T)}" fill="none" stroke="#fff3d0" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${H[0]}" cy="${H[1]}" r="19" fill="none" stroke="${BD.boneL}" stroke-width="9"/></g>`;
  });
  // むねの 大きな きんにく（あか）。でっぱりから、つばさの ほねの 下がわへ
  if (red > 0) [-1, 1].forEach(sd => {
    const A = P(sd, 120, 14), B = P(sd, 64, 12);
    o += `<path d="M ${sd * 12} 36 L ${sd * 12} 178 Q ${sd * 160} 170 ${pt(A)} L ${pt(B)} Q ${sd * 70} -30 ${sd * 12} 36 Z" fill="${mix(BD.meat, '#ff8a6a', 0.5 * glowR)}" stroke="#9c3526" stroke-width="${4 + 4 * glowR}" stroke-linejoin="round" opacity="${red}"/>`;
  });
  return o;
}
// 100この しかく。n こ ぬる（n は 0.5 のように はんぶんも できる）
function grid100(n, col) {
  let o = '';
  for (let i = 0; i < 100; i++) {
    const x = (i % 10) * 40 - 200, y = Math.floor(i / 10) * 40 - 200, f = clamp(n - i);
    o += `<rect x="${x + 3}" y="${y + 3}" width="34" height="34" rx="6" fill="#e9e3d3"/>` + (f > 0 ? `<rect x="${x + 3}" y="${y + 3}" width="${34 * f}" height="34" rx="${f < 1 ? 3 : 6}" fill="${col}"/>` : '');
  }
  return o;
}
SCENES.push({
  id: 'muscle',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER + topBadge();
    // A：まえから 見た図
    const aO = 1 - win(t, c2 - 0.5, c3 - 0.3, 0.4);
    if (aO > 0) {
      const late = t > c2;
      let th, glowR = 0, glowP = 0;
      if (!late) { const u = ((t - 0.4) * 0.5) % 1, w = u < 0.5 ? eio(u / 0.5) : 1 - eio((u - 0.5) / 0.5); th = lerp(30, -28, w); glowR = u < 0.5 ? Math.sin(u / 0.5 * Math.PI) : 0; }
      else { const u = (Math.max(0, t - c4) * 0.42) % 1, w = u < 0.55 ? eio(u / 0.55) : 1 - eio((u - 0.55) / 0.45); th = t < c4 ? -24 : lerp(-24, 30, w); glowP = t >= c4 && u < 0.55 ? Math.sin(u / 0.55 * Math.PI) : 0; }
      const pinkO = late ? prog(t, c3 + d3 * 0.15, 0.5) : 0, redO = late ? lerp(1, 0.22, prog(t, c3, 0.5)) : prog(t, c0 + d0 * 0.2, 0.5);
      const keelHi = late ? 0 : win(t, c1 + d1 * 0.2, c2 - 0.6, 0.3) * (0.7 + 0.3 * Math.sin(t * 6));
      const X = 960, Y = 520;
      let a = g(chestFront(th, { red: redO, pink: pinkO, glowR, glowP, keelHi }), { x: X, y: Y, s: 0.85 });
      a += pop(text(0, 0, 'まえから みた、からだの なか', { size: 38, w: 900, fill: C.muted }), t, 0.3, 340, 150);
      if (!late) {
        a += pop(badge('むねの おおきな きんにく', { fill: BD.meat, size: 44 }), t, c0 + d0 * 0.35, 1500, 560) + pointer(1290, 560, X + 85, Y + 102, BD.meat, prog(t, c0 + d0 * 0.35 + 0.2, 0.3));
        a += pop(badge('つばさを ひきおろす', { fill: BD.dark, size: 38 }), t, c0 + d0 * 0.7, 1500, 650);
        a += pop(badge('ほねの でっぱり', { fill: BD.boneL, size: 44 }), t, c1 + d1 * 0.25, 420, 620) + pointer(570, 620, X - 4, Y + 128, BD.boneL, prog(t, c1 + d1 * 0.25 + 0.2, 0.3));
        a += pop(badge('きんにくが つく ところ', { fill: BD.dark, size: 38 }), t, c1 + d1 * 0.6, 420, 710);
      } else {
        a += pop(badge('つばさを あげる きんにく', { fill: '#c9607c', size: 44 }), t, c3 + d3 * 0.3, 420, 640) + pointer(650, 640, X - 42, Y + 94, '#c9607c', prog(t, c3 + d3 * 0.3 + 0.2, 0.3));
        a += pop(badge('これも むねに ある', { fill: BD.dark, size: 38 }), t, c3 + d3 * 0.65, 420, 730);
        a += pop(badge('かたの あな ＝ かっしゃ', { fill: BD.boneL, size: 44 }), t, c4 + d4 * 0.3, 1500, 250) + pointer(1330, 286, X + 109, Y - 121, BD.boneL, prog(t, c4 + d4 * 0.3 + 0.2, 0.3));
        a += pop(badge('ながい すじ', { fill: '#8a5a3a', size: 40 }), t, c4 + d4 * 0.1, 1500, 520) + pointer(1380, 520, X + 95, Y - 34, '#8a5a3a', prog(t, c4 + d4 * 0.1 + 0.2, 0.3));
        a += pop(badge('したへ ひくと、つばさが あがる', { fill: '#c9607c', size: 44 }), t, c4 + d4 * 0.6, 1060, 785);
        if (glowP > 0.1) a += arrow(X - 130, Y + 50, X - 130, Y + 130, '#c9607c', 14, 1, glowP) + arrow(X + 130, Y + 50, X + 130, Y + 130, '#c9607c', 14, 1, glowP) + arrow(X - 390, Y - 160, X - 390, Y - 260, BD.go, 16, 1, glowP) + arrow(X + 390, Y - 160, X + 390, Y - 260, BD.go, 16, 1, glowP);
      }
      out += g(a, { o: aO });
    }
    // B：100この しかく
    const bO = win(t, c2 - 0.3, c3 - 0.5, 0.4);
    if (bO > 0) {
      let b = pop(text(0, 0, 'からだの おもさを、100この しかくに すると…', { size: 54, w: 900 }), t, c2 - 0.1, 960, 200);
      const n1 = 20 * eo(prog(t, c2 + d2 * 0.12, 1.6)), n2 = 0.5 * eo(prog(t, c2 + d2 * 0.58, 0.6));
      b += g(grid100(n1, BD.meat), { x: 620, y: 480, s: 0.98 }) + g(pigeon(0, 0, 0.62, { k: null, legs: true }), { x: 250, y: 400 }) + text(250, 510, 'とり', { size: 50, w: 900 });
      b += g(text(250, 580, '（いろいろな とりを', { size: 28, w: 700, fill: C.muted }) + text(250, 620, 'ならした おおきさ）', { size: 28, w: 700, fill: C.muted }), { o: prog(t, c2 + d2 * 0.2, 0.4) });
      b += pop(badge('20こ ＝ 5ぶんの1', { fill: BD.meat, size: 46 }), t, c2 + d2 * 0.3, 620, 760);
      b += g(grid100(n2, BD.meat), { x: 1300, y: 480, s: 0.98, o: prog(t, c2 + d2 * 0.5, 0.4) });
      b += g(`<g transform="translate(1690 470) scale(0.42)">${brother(t, { pose: 'stand' })}</g>` + text(1690, 540, 'ひと', { size: 50, w: 900 }), { o: prog(t, c2 + d2 * 0.5, 0.4) });
      b += pop(badge('しかく はんぶん ＝ 200ぶんの1', { fill: BD.dark, size: 44 }), t, c2 + d2 * 0.66, 1320, 760);
      const zo = prog(t, c2 + d2 * 0.62, 0.4);
      b += g(`<circle cx="${1300 - 196 + 20}" cy="${480 - 196 + 20}" r="40" fill="none" stroke="${C.red}" stroke-width="7"/>`, { o: zo * (0.6 + 0.4 * Math.sin(t * 6)) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. ほねは 中が からっぽ。でも、かるすぎない
// ほね（よこ向き。まん中 (0,0)）。cut=1 で まん中を 切って 中を 見せる
function longBone(L, W, cut = 0) {
  const kn = W * 0.95;
  let o = `<path d="M ${-L / 2} ${-W / 2} L ${L / 2} ${-W / 2} L ${L / 2} ${W / 2} L ${-L / 2} ${W / 2} Z" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="6"/>`;
  [-1, 1].forEach(sd => { o += `<circle cx="${sd * L / 2}" cy="${-kn * 0.5}" r="${kn * 0.62}" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="6"/><circle cx="${sd * L / 2}" cy="${kn * 0.5}" r="${kn * 0.62}" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="6"/><rect x="${sd > 0 ? L / 2 - kn * 0.7 : -L / 2}" y="${-W / 2 + 3}" width="${kn * 0.7}" height="${W - 6}" fill="${BD.bone}"/>`; });
  if (cut > 0) {
    const cw = L * 0.5, ch = W - 30;
    let inner = `<rect x="${-cw / 2}" y="${-ch / 2}" width="${cw}" height="${ch}" rx="${ch / 2.4}" fill="#dff0fb" stroke="${BD.boneL}" stroke-width="5"/>`;
    for (let i = 0; i < 7; i++) { const x = -cw / 2 + 40 + i * (cw - 80) / 6; inner += `<line x1="${x - 14}" y1="${-ch / 2 + 4}" x2="${x + 14}" y2="${ch / 2 - 4}" stroke="${BD.boneL}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`; }
    o += `<g opacity="${cut}">${inner}</g>`;
  }
  return o;
}
const boneIcon = (s = 1, r = 0) => `<g transform="rotate(${r}) scale(${s})"><rect x="-40" y="-9" width="80" height="18" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="3"/><circle cx="-40" cy="-9" r="11" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="3"/><circle cx="-40" cy="9" r="11" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="3"/><circle cx="40" cy="-9" r="11" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="3"/><circle cx="40" cy="9" r="11" fill="${BD.bone}" stroke="${BD.boneL}" stroke-width="3"/><rect x="-38" y="-6" width="76" height="12" fill="${BD.bone}"/></g>`;
// ネズミの なかま（右向き）
const mouse = (s = 1) => `<g transform="scale(${s})"><path d="M -86 20 Q -150 30 -160 -20 Q -164 -50 -140 -56" fill="none" stroke="#c99a8e" stroke-width="9" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="96" ry="58" fill="#b9a79a"/><path d="M 60 -40 Q 120 -30 146 14 Q 110 40 60 34 Z" fill="#b9a79a"/><circle cx="62" cy="-54" r="26" fill="#b9a79a"/><circle cx="62" cy="-54" r="15" fill="#e8b9b0"/><circle cx="104" cy="-8" r="7" fill="${C.ink}"/><circle cx="146" cy="14" r="8" fill="#d98a8a"/><path d="M 126 12 l 34 -14 M 126 18 l 36 4" stroke="${C.muted}" stroke-width="3" stroke-linecap="round"/><ellipse cx="-40" cy="56" rx="20" ry="9" fill="#c99a8e"/><ellipse cx="40" cy="56" rx="20" ry="9" fill="#c99a8e"/></g>`;
const SPARROW = { body: '#c79a6c', belly: '#ead9c2', w1: '#9a6f45', w2: '#84593a', ln: '#5a4030' };
SCENES.push({
  id: 'bone',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, c2 - 0.7, 0.4);
    if (aO > 0) {
      const X = 960, Y = 460, ck = prog(t, c0 + d0 * 0.3, 0.6);
      const pr = prog(t, c1 + d1 * 0.5, 0.4) * (1 - prog(t, c1 + d1 * 0.5 + 2.2, 0.4));
      let a = pop(text(0, 0, 'とりの ほね', { size: 56, w: 900 }), t, 0.3, 960, 200, { end: c1 });
      a += g(longBone(900, 150, ck), { x: X, y: Y });
      a += pop(badge('なかは からっぽ', { fill: C.blueUi, size: 48 }), t, c0 + d0 * 0.5, 960, 690, { end: c1 - 0.2 }) + pointer(960, 650, X, Y + 30, C.blueUi, prog(t, c0 + d0 * 0.5 + 0.2, 0.3) * (1 - prog(t, c1 - 0.4, 0.3)));
      // でも、かるすぎない：かべは ぎゅっと つまって、かたくて つよい
      a += pop(olText(0, 0, 'でも、かるすぎない', { size: 70, ol: BD.boneL, sw: 14 }), t, c1 + 0.2, 800, 200);
      a += pop(badge('かべは、ぎゅっと つまって いる', { fill: BD.boneL, size: 46 }), t, c1 + d1 * 0.28, 600, 690) + pointer(600, 648, X - 150, Y - 67, BD.boneL, prog(t, c1 + d1 * 0.28 + 0.2, 0.3));
      // おしても まがらない
      if (pr > 0) { const sq = 10 * Math.abs(Math.sin(t * 9)); a += arrow(X + 330, Y - 250 + sq, X + 330, Y - 100 + sq, C.redUi, 22, 1, pr) + arrow(X + 330, Y + 250 - sq, X + 330, Y + 100 - sq, C.redUi, 22, 1, pr); }
      a += pop(badge('かたくて つよい', { fill: C.redUi, size: 48 }), t, c1 + d1 * 0.6, 1340, 690);
      out += g(a, { o: aO });
    }
    // てんびん：ことりの ほねと、ネズミの なかまの ほね
    const bO = prog(t, c2 - 0.4, 0.5);
    if (bO > 0) {
      const PX = 960, PY = 390, ang = 7 * Math.sin((t - c2) * 3.2) * Math.exp(-Math.max(0, t - c2) * 0.7), r = ang * Math.PI / 180, HL = 400;
      const ends = [-1, 1].map(sd => [PX + sd * HL * Math.cos(r), PY + sd * HL * Math.sin(r)]);
      let b = pop(text(0, 0, 'おなじ おもさの からだ（やく57グラム）で くらべると…', { size: 46, w: 900 }), t, c2 - 0.2, 1000, 170);
      b += `<path d="M ${PX - 70} 800 L ${PX + 70} 800 L ${PX + 16} ${PY} L ${PX - 16} ${PY} Z" fill="${C.ochre}"/><rect x="${PX - 150}" y="790" width="300" height="26" rx="13" fill="${C.ochre}"/>`;
      b += `<line x1="${ends[0][0]}" y1="${ends[0][1]}" x2="${ends[1][0]}" y2="${ends[1][1]}" stroke="#7a5a2c" stroke-width="18" stroke-linecap="round"/><circle cx="${PX}" cy="${PY}" r="22" fill="#7a5a2c"/>`;
      ends.forEach(([ex, ey], i) => {
        const py = ey + 250;
        b += `<line x1="${ex}" y1="${ey}" x2="${ex - 130}" y2="${py}" stroke="#7a5a2c" stroke-width="5"/><line x1="${ex}" y1="${ey}" x2="${ex + 130}" y2="${py}" stroke="#7a5a2c" stroke-width="5"/><path d="M ${ex - 160} ${py} Q ${ex} ${py + 70} ${ex + 160} ${py} Z" fill="${C.ochreSoft}" stroke="#7a5a2c" stroke-width="6" stroke-linejoin="round"/>`;
        [[-60, -14, 12], [10, -22, -20], [58, -10, 30], [-20, -44, -8], [34, -46, 16]].forEach(([dx, dy, rr]) => { b += g(boneIcon(0.8, rr), { x: ex + dx, y: py + dy }); });
      });
      b += pop(pigeon(0, 0, 0.5, { k: null, legs: true, pal: SPARROW, neckPatch: false }) + text(0, 96, 'ことりの ほね', { size: 42, w: 900 }), t, c2 + d2 * 0.15, 200, 560);
      b += pop(mouse(0.62) + text(0, 96, 'ネズミの なかまの', { size: 40, w: 900 }) + text(0, 148, 'ほね', { size: 40, w: 900 }), t, c2 + d2 * 0.4, 1720, 540);
      b += pop(badge('ほねの おもさは、おなじ くらい', { fill: BD.boneL, size: 48, pad: 40 }), t, c2 + d2 * 0.72, 960, 268);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. はばたかずに、あたたかい 空気の はしらの中を くるくる のぼる
// 上から 見た 大きな とり（頭が 右）
const soarBird = () => {
  const wing = sd => `<path d="M 26 ${sd * 10} Q 40 ${sd * 120} 10 ${sd * 250} L -8 ${sd * 262} L -6 ${sd * 236} L -24 ${sd * 256} L -24 ${sd * 228} L -42 ${sd * 244} L -40 ${sd * 216} L -58 ${sd * 226} Q -50 ${sd * 110} -36 ${sd * 10} Z" fill="#6b5645" stroke="#463628" stroke-width="5" stroke-linejoin="round"/>`;
  return wing(-1) + wing(1) + `<path d="M -40 -16 L -120 -40 L -130 0 L -120 40 L -40 16 Z" fill="#6b5645" stroke="#463628" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="0" rx="62" ry="24" fill="#7d6652" stroke="#463628" stroke-width="5"/><circle cx="62" cy="0" r="18" fill="#efe6d6" stroke="#463628" stroke-width="5"/><path d="M 78 -6 L 98 0 L 78 6 Z" fill="${BD.beak}"/>`;
};
SCENES.push({
  id: 'soar',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, D = sceneDur(NOW.i);
    let out = skyBg('sobg', '#6fb0e6', '#dff0fb') + cloud(300, 250, 1.2, '#fff', 0.9) + cloud(1650, 330, 1.0, '#fff', 0.9);
    out += `<path d="M 0 800 Q 400 730 800 790 T 1920 770 L 1920 1080 L 0 1080 Z" fill="#b9c98a"/><path d="M 0 860 Q 600 800 1100 850 T 1920 840 L 1920 1080 L 0 1080 Z" fill="${BD.grass}"/>` + house(380, 800, 0.7) + tree(520, 806, 0.8) + tree(1500, 800, 0.9) + house(1640, 796, 0.6);
    // あたたかい 空気の はしら
    const wk = prog(t, c1 - 0.3, 0.8), CX = 960;
    if (wk > 0) {
      out += `<linearGradient id="thg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BD.warm}" stop-opacity="0.12"/><stop offset="1" stop-color="${BD.warm}" stop-opacity="0.5"/></linearGradient>`;
      out += `<path d="M ${CX - 330} 110 L ${CX + 330} 110 L ${CX + 230} 800 L ${CX - 230} 800 Z" fill="url(#thg)" opacity="${wk}"/>`;
      for (let i = 0; i < 6; i++) { const u = (t * 0.22 + i / 6) % 1, x = CX + (i % 3 - 1) * 150 + (i > 2 ? 70 : -40), y = lerp(780, 150, u); out += arrow(x, y + 70, x, y - 30, BD.warm, 16, 1, wk * 0.85 * Math.sin(u * Math.PI)); }
    }
    // わを かいて のぼる（頭は 進む向き）
    const ph = t * 0.85, rise = prog(t, 0.5, D - 1), cy = lerp(600, 340, rise), RX = 300, RY = 130;
    let trail = '';
    for (let i = 1; i <= 46; i++) { const p = ph - i * 0.09, cyy = lerp(600, 340, clamp(rise - i * 0.09 / 0.85 / (D - 1))); trail += `<circle cx="${(CX + Math.cos(p) * RX).toFixed(1)}" cy="${(cyy + Math.sin(p) * RY).toFixed(1)}" r="5" fill="#fff" opacity="${(0.75 * (1 - i / 46)).toFixed(2)}"/>`; }
    out += trail;
    const bx = CX + Math.cos(ph) * RX, by = cy + Math.sin(ph) * RY, sc = 0.62 + 0.12 * Math.sin(ph);
    out += `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${sc.toFixed(3)} ${(sc * 0.44).toFixed(3)}) rotate(${(ph * 180 / Math.PI + 90).toFixed(1)})">${soarBird()}</g>`;
    out += pop(badge('はばたかずに、わを かく', { fill: BD.dark, size: 46 }), t, c0 + d0 * 0.45, 360, 190);
    out += pop(badge('あたたかい くうきの はしら', { fill: BD.warm, size: 44 }), t, c1 + d1 * 0.2, 1500, 560) + pointer(1300, 560, CX + 210, 620, BD.warm, prog(t, c1 + d1 * 0.2 + 0.2, 0.3));
    out += pop(badge('くるくる のぼる', { fill: BD.go, size: 46 }), t, c1 + d1 * 0.6, 300, 300);
    out += topBadge();
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'あいだに、すきまが あく', { size: 52, w: 900, anchor: 'start' }) + g(GUESS_ICON[2](), { x: 520, y: 0, s: 1.1 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['うちおろし：はねが かさなる', BD.dark], ['うちあげ：すきまが あく', BD.air], ['むねの きんにくで うごかす', BD.meat]], t, 960, 660, { start: 2.6, step: 1.4, size: 34, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const pgIc = pigeon(0, 6, 0.26, { k: null, legs: true });
      const cmpIc = pigeon(-4, 0, 0.2, { k: 1, open: 1 });
      const items = [
        [pgIc, 'ハトを、はなれた ところから みる', C.ink],
        [cmpIc, 'とびたつ ときと、とんでからを くらべる', C.ink],
        [warnIcon(0.82), 'ハトに ちかづかない・おいかけない', C.red],
        [warnIcon(0.82), 'たいようは、ぜったいに みない', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 44, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // 大きな絵：つばさを 上げたとき、さきの はねの すきまを さがす
      const [k, op] = flap(t * 0.45, 0.35);
      let p = card(440, 360) + `<clipPath id="lkc"><rect x="-200" y="-160" width="400" height="320" rx="20"/></clipPath><g clip-path="url(#lkc)"><rect x="-200" y="-160" width="400" height="320" fill="${BD.sky2}"/>${pigeon(-6, 62, 0.6, { k, open: op })}</g>`;
      b += pop(p, t, cue(1) + 0.3, 1600, 360);
      b += pop(badge('すきまは みえるかな？', { fill: BD.air, size: 36 }), t, cue(2) + 0.6, 1600, 590);
      b += kidShow('K', t, 1700, 850, { s: 0.7, start: cue(1) + 0.8, n: 0, bubble: false });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 10. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'くわしくは サイトの「とりは、どうして そらを とべるの？」へ ／ 出典は 概要欄に', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 800, o: prog(t, 2.0, 0.5) });
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
