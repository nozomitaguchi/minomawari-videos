// ---------- 電車の道具 ----------
const TR = {
  body: '#f6f2e6', stripe: '#3b9b5f', dark: '#3c4650', glass: '#bfe0f2',
  rail: '#7d8790', railD: '#5d666e', tie: '#b08a5e', ballast: '#ddd3c0',
  steel: '#b9c2ca', steelD: '#7c8690', steelL: '#e3e8ec',
  out: '#e8742a', inn: '#2f7de1', fl: '#d9452f', grass: '#bfe3a8', grassD: '#a5d48f',
};
const rad = d => d * Math.PI / 180;
// 円の上の点（角度は度。右が0、上が90）
const onArc = (cx, cy, R, a) => [cx + R * Math.cos(rad(a)), cy - R * Math.sin(rad(a))];
function arcPath(cx, cy, R, a0, a1) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 2));
  let d = '';
  for (let i = 0; i <= n; i++) { const [x, y] = onArc(cx, cy, R, lerp(a0, a1, i / n)); d += (i ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1); }
  return d;
}
// 上から見た線路（円弧）。colO は外がわ、colI は内がわのレールの色
function trackArc(cx, cy, R, a0, a1, { gauge = 46, rail = 8, colO = TR.rail, colI = TR.rail, tieStep = 2, tieW = 10 } = {}) {
  let o = `<path d="${arcPath(cx, cy, R, a0, a1)}" fill="none" stroke="${TR.ballast}" stroke-width="${gauge + 56}"/>`;
  const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
  let ties = '';
  for (let a = lo + tieStep / 2; a <= hi; a += tieStep) {
    const [x1, y1] = onArc(cx, cy, R - gauge / 2 - 14, a), [x2, y2] = onArc(cx, cy, R + gauge / 2 + 14, a);
    ties += `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} `;
  }
  o += `<path d="${ties}" stroke="${TR.tie}" stroke-width="${tieW}" stroke-linecap="round"/>`;
  o += `<path d="${arcPath(cx, cy, R + gauge / 2, a0, a1)}" fill="none" stroke="${colO}" stroke-width="${rail}"/>`;
  o += `<path d="${arcPath(cx, cy, R - gauge / 2, a0, a1)}" fill="none" stroke="${colI}" stroke-width="${rail}"/>`;
  return o;
}
// 上から見た車両（右向き。front なら右のはしが先頭）
const carTop = (len = 190, w = 64, front = false) => {
  let o = `<rect x="${-len / 2}" y="${-w / 2}" width="${len}" height="${w}" rx="${front ? 18 : 10}" fill="${TR.body}" stroke="${TR.dark}" stroke-width="5"/>`;
  o += `<path d="M ${-len / 2 + 12} ${-w / 2 + 9} L ${len / 2 - 14} ${-w / 2 + 9} M ${-len / 2 + 12} ${w / 2 - 9} L ${len / 2 - 14} ${w / 2 - 9}" stroke="${TR.stripe}" stroke-width="7" stroke-linecap="round"/>`;
  o += `<rect x="${-len * 0.3}" y="${-w * 0.2}" width="${len * 0.34}" height="${w * 0.4}" rx="6" fill="#dcd8cb" stroke="${TR.dark}" stroke-width="3"/>`;
  if (front) {
    o += `<path d="M ${len / 2 - 40} ${-w / 2 + 14} L ${len / 2 - 14} ${-w / 2 + 16} L ${len / 2 - 14} ${w / 2 - 16} L ${len / 2 - 40} ${w / 2 - 14} Z" fill="#7fb6d6" stroke="${TR.dark}" stroke-width="3"/>`;
    o += `<circle cx="${len / 2 - 5}" cy="${-w * 0.27}" r="5" fill="#ffd23a"/><circle cx="${len / 2 - 5}" cy="${w * 0.27}" r="5" fill="#ffd23a"/>`;
  }
  return o;
};
// 円弧の線路の上の電車。aHead は先頭のはしの角度。角度がへる向き（時計回り）に進む
function trainOnArc(cx, cy, R, aHead, { n = 3, len = 190, w = 64, gap = 14 } = {}) {
  const da = (len + gap) / R * 180 / Math.PI; let o = '';
  for (let i = n - 1; i >= 0; i--) {
    const a = aHead + da * (i + 0.5), [x, y] = onArc(cx, cy, R, a);
    o += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(90 - a).toFixed(2)})">${carTop(len, w, i === 0)}</g>`;
  }
  return o;
}
// 横から見た電車（右向き。原点は車輪の下＝レールの上）
const trainSide = (wa = 0) => {
  let o = `<path d="M -50 -196 L -22 -236 L 6 -196 M -44 -238 L 30 -238" fill="none" stroke="${TR.dark}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<rect x="-200" y="-196" width="400" height="146" rx="22" fill="${TR.body}" stroke="${TR.dark}" stroke-width="6"/>`;
  o += `<rect x="-197" y="-110" width="394" height="20" fill="${TR.stripe}"/>`;
  [-168, -92].forEach(x => { o += `<rect x="${x}" y="-174" width="58" height="50" rx="8" fill="${TR.glass}" stroke="${TR.dark}" stroke-width="4"/>`; });
  o += `<rect x="-20" y="-178" width="52" height="118" rx="6" fill="#ebe6d6" stroke="${TR.dark}" stroke-width="4"/><rect x="-12" y="-170" width="36" height="42" rx="5" fill="${TR.glass}"/><line x1="6" y1="-178" x2="6" y2="-60" stroke="${TR.dark}" stroke-width="3"/>`;
  o += `<rect x="48" y="-174" width="52" height="50" rx="8" fill="${TR.glass}" stroke="${TR.dark}" stroke-width="4"/>`;
  o += `<path d="M 118 -176 L 176 -176 Q 190 -176 190 -162 L 190 -124 L 118 -124 Z" fill="#9fd0ea" stroke="${TR.dark}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<circle cx="186" cy="-76" r="8" fill="#ffd23a" stroke="${TR.dark}" stroke-width="3"/>`;
  o += `<rect x="-176" y="-54" width="352" height="22" rx="6" fill="${TR.dark}"/>`;
  [-140, -82, 82, 140].forEach(x => {
    o += `<g transform="translate(${x} -25) rotate(${wa})"><circle r="25" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="5"/><circle r="8" fill="${TR.dark}"/><line x1="0" y1="-20" x2="0" y2="20" stroke="${TR.steelD}" stroke-width="4"/><line x1="-20" y1="0" x2="20" y2="0" stroke="${TR.steelD}" stroke-width="4"/></g>`;
  });
  return o;
};
// 横から見た新幹線ふうの電車（右向き）
const shinSide = () => {
  let o = `<path d="M -200 -150 Q -200 -172 -178 -172 L 60 -172 Q 150 -168 214 -96 Q 226 -78 204 -66 L 188 -52 L -178 -52 Q -200 -52 -200 -74 Z" fill="#fbfbf7" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<path d="M -197 -96 L 212 -96 L 206 -84 L -197 -84 Z" fill="#2f6fc4"/>`;
  [-170, -116, -62, -8].forEach(x => { o += `<rect x="${x}" y="-150" width="38" height="32" rx="7" fill="${TR.glass}" stroke="${TR.dark}" stroke-width="3"/>`; });
  o += `<path d="M 78 -154 Q 130 -146 158 -118 L 96 -118 Q 82 -118 80 -132 Z" fill="#9fd0ea" stroke="${TR.dark}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<rect x="-176" y="-54" width="352" height="20" rx="6" fill="${TR.dark}"/>`;
  [-140, -86, 86, 140].forEach(x => { o += `<circle cx="${x}" cy="-24" r="24" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="5"/><circle cx="${x}" cy="-24" r="7" fill="${TR.dark}"/>`; });
  return o;
};

// ---------- 前から見た車輪（輪軸）。絵では ななめを 大きく描いている ----------
const WS = { xi: 265, xt0: 291, xo: 395, rin: 210, rout: 150, rf: 242, ax: 26 };
WS.xr = (WS.xt0 + WS.xo) / 2;  // まん中にあるとき、レールがのる所
// まん中から lx はなれた所の、ふみづらの半径
const wsR = lx => WS.rin - (lx - WS.xt0) / (WS.xo - WS.xt0) * (WS.rin - WS.rout);
// 車輪1つ（右がわ。左は左右を反転して使う）
function wheelFront({ fl = null, wedge = 0 } = {}) {
  const { xi, xt0, xo, rin, rout, rf } = WS;
  let o = `<rect x="${xo - 4}" y="-46" width="20" height="92" rx="6" fill="${TR.steelD}"/>`;
  o += `<path d="M ${xo} ${-rout} L ${xt0} ${-rin} L ${xt0 - 6} ${-rf} L ${xi} ${-rf} L ${xi} ${rf} L ${xt0 - 6} ${rf} L ${xt0} ${rin} L ${xo} ${rout} Z" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<rect x="${xt0 + 14}" y="${-rout + 34}" width="${xo - xt0 - 34}" height="${(rout - 34) * 2}" rx="14" fill="${TR.steelL}" opacity="0.7"/>`;
  if (fl) o += `<path d="M ${xt0} ${-rin} L ${xt0 - 6} ${-rf} L ${xi} ${-rf} L ${xi} ${-rin + 26} Z M ${xt0} ${rin} L ${xt0 - 6} ${rf} L ${xi} ${rf} L ${xi} ${rin - 26} Z" fill="${fl}" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  if (wedge > 0) {
    // 平らだったら（点線）とのちがい
    o += `<path d="M ${xt0} ${-rin} L ${xo} ${-rin} L ${xo} ${-rout} Z" fill="${TR.out}" opacity="${0.45 * wedge}"/>`;
    o += `<line x1="${xt0}" y1="${-rin}" x2="${xo + 34}" y2="${-rin}" stroke="${TR.dark}" stroke-width="5" stroke-dasharray="12 10" opacity="${wedge}"/>`;
    o += `<line x1="${xt0}" y1="${-rin}" x2="${xo}" y2="${-rout}" stroke="${TR.out}" stroke-width="12" stroke-linecap="round" opacity="${wedge}"/>`;
    o += `<line x1="${xt0}" y1="${rin}" x2="${xo}" y2="${rout}" stroke="${TR.out}" stroke-width="12" stroke-linecap="round" opacity="${wedge}"/>`;
  }
  return o;
}
function wheelsetFront(o = {}) {
  const { xi, ax, xo } = WS;
  let s = `<rect x="${-xo - 60}" y="-20" width="${(xo + 60) * 2}" height="40" rx="10" fill="${TR.steelD}"/>`;
  s += `<rect x="${-xo - 66}" y="-34" width="42" height="68" rx="10" fill="${TR.dark}"/><rect x="${xo + 24}" y="-34" width="42" height="68" rx="10" fill="${TR.dark}"/>`;
  s += `<rect x="${-xi}" y="${-ax}" width="${xi * 2}" height="${ax * 2}" fill="#98a2ab" stroke="${TR.dark}" stroke-width="6"/>`;
  s += `<rect x="${-xi + 6}" y="${-ax + 8}" width="${xi * 2 - 12}" height="10" rx="5" fill="#fff" opacity="0.45"/>`;
  s += wheelFront(o) + `<g transform="scale(-1 1)">${wheelFront(o)}</g>`;
  return s;
}
// レールの切り口（top はレールの上の面）
const railCut = (x, top) =>
  `<rect x="${x - 7}" y="${top + 20}" width="14" height="56" fill="${TR.railD}"/><rect x="${x - 48}" y="${top + 72}" width="96" height="16" rx="4" fill="${TR.railD}"/><rect x="${x - 22}" y="${top}" width="44" height="30" rx="9" fill="${TR.railD}"/><rect x="${x - 15}" y="${top + 4}" width="30" height="6" rx="3" fill="#fff" opacity="0.35"/>`;
// 前から見た絵いっしき。s は外がわ（画面の左）へずれた大きさ
function frontView({ cx = 960, railTop = 700, s = 0, fl = null, wedge = 0, lines = 0 } = {}) {
  const rL = wsR(WS.xr - s), rR = wsR(WS.xr + s);
  const tilt = Math.atan((rL - rR) / (2 * WS.xr)) * 180 / Math.PI, cy = railTop - (rL + rR) / 2;
  let o = `<path d="M ${cx - 640} ${railTop + 138} Q ${cx - 600} ${railTop + 96} ${cx - 540} ${railTop + 96} L ${cx + 540} ${railTop + 96} Q ${cx + 600} ${railTop + 96} ${cx + 640} ${railTop + 138} Z" fill="${TR.ballast}"/>`;
  o += `<rect x="${cx - 500}" y="${railTop + 86}" width="1000" height="26" rx="8" fill="${TR.tie}"/>`;
  o += railCut(cx - WS.xr, railTop) + railCut(cx + WS.xr, railTop);
  let w = wheelsetFront({ fl, wedge });
  if (lines > 0) {
    // レールにのっている所の「まるの大きさ」（前から見ると たての線）
    const xl = -(WS.xr - s), xr2 = WS.xr + s;
    w += `<line x1="${xl}" y1="${-rL}" x2="${xl}" y2="${rL}" stroke="${TR.out}" stroke-width="14" stroke-linecap="round" opacity="${lines}"/>`;
    w += `<line x1="${xr2}" y1="${-rR}" x2="${xr2}" y2="${rR}" stroke="${TR.inn}" stroke-width="14" stroke-linecap="round" opacity="${lines}"/>`;
  }
  o += `<g transform="translate(${cx - s} ${cy}) rotate(${tilt})">${w}</g>`;
  return { svg: o, cy, rL, rR, xL: cx - WS.xr, xR: cx + WS.xr };
}
// 上から見た輪軸（右へ進む向き。左手がわ＝上が colA、右手がわ＝下が colB）
function wheelsetTop(gauge, { colA = TR.steelD, colB = TR.steelD, len = 96, w = 40 } = {}) {
  const h = gauge / 2;
  // 車輪は まん中がわ（つばのある がわ）が 長い
  const wheel = (sy, col) => `<path d="M ${-len / 2} ${sy * (h - w / 2)} L ${len / 2} ${sy * (h - w / 2)} L ${len * 0.36} ${sy * (h + w / 2)} L ${-len * 0.36} ${sy * (h + w / 2)} Z" fill="${col}" stroke="${TR.dark}" stroke-width="5" stroke-linejoin="round"/>`;
  return `<rect x="-11" y="${-h}" width="22" height="${gauge}" fill="#98a2ab" stroke="${TR.dark}" stroke-width="5"/>` + wheel(-1, colA) + wheel(1, colB);
}
// 注意のしるし
const warnIcon = () => `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// 矢印（x1,y1 → x2,y2）
function arrow(x1, y1, x2, y2, col = C.ink, wdt = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = wdt * 2.6;
  const p = k => `${x2 - h * Math.cos(a + k)} ${y2 - h * Math.sin(a + k)}`;
  return `<path d="M ${x1} ${y1} L ${x2} ${y2} M ${p(0.5)} L ${x2} ${y2} L ${p(-0.5)}" fill="none" stroke="${col}" stroke-width="${wdt}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// 左（画面の内がわ）を向いたカメレオン。吹き出しは talkBubble で べつに出す
const chamL = (t, x, y, o = {}) => `<g transform="translate(${2 * x} 0) scale(-1 1)">${kidShow('K', t, x, y, { enter: 'pop', ...o, bubble: false })}</g>`;
const OPTS = [['①', 'うんてんしさんが ハンドルで まげている'], ['②', 'しゃりんが ななめの かたちに なっている'], ['③', 'そとがわの しゃりんだけ はやく まわっている']];

// 1. つかみ：電車がカーブを曲がっていく（上から見たところ）
SCENES.push({
  id: 'hook',
  draw(t) {
    const CX = 960, CY = 1150, R = 800;
    let out = `<rect width="1920" height="1080" fill="${TR.grass}"/>`;
    out += [[300, 250, 190, 70], [1500, 190, 220, 80], [960, 720, 380, 120], [1760, 820, 160, 60], [150, 780, 150, 60]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TR.grassD}" opacity="0.55"/>`).join('');
    out += trackArc(CX, CY, R, 205, -25, { gauge: 46, rail: 8, tieStep: 1.6 });
    // 線路と子どもの間には さく（線路には入らない）
    let posts = '';
    for (let k = 200; k >= -20; k -= 3) { const [x1, y1] = onArc(CX, CY, R - 80, k); posts += `M ${x1.toFixed(1)} ${y1.toFixed(1)} l 0 -22 `; }
    out += `<path d="${arcPath(CX, CY, R - 80, 200, -20)}" fill="none" stroke="#fffaf0" stroke-width="6"/><path d="${arcPath(CX, CY, R - 80, 200, -20).replace(/ (-?[0-9.]+) L/g, (m, v) => ' ' + (+v - 14).toFixed(1) + ' L')}" fill="none" stroke="#fffaf0" stroke-width="5"/><path d="${posts}" stroke="#fffaf0" stroke-width="7" stroke-linecap="round"/>`;
    out += tree(170, 360, 0.8) + tree(330, 450, 0.6) + house(1690, 400, 0.9) + tree(1840, 450, 0.7) + tree(1540, 300, 0.6, '#4f9d58');
    // 電車：左下から入って、カーブにそって右下へ（角度がへる向き＝時計回り）
    const aH = lerp(196, -55, prog(t, 0.2, cueE(3) + 0.4));
    out += trainOnArc(CX, CY, R, aH, { n: 3 });
    // カーブのしるし
    const ck = win(t, cue(1) + 0.2, cue(3) - 0.2, 0.4);
    if (ck > 0) {
      const [hx, hy] = onArc(CX, CY, R + 96, 52), [px, py] = onArc(CX, CY, R + 96, 56);
      out += g(`<path d="${arcPath(CX, CY, R + 96, 128, 54)}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>` + arrow(px, py, hx, hy, '#fff', 12), { o: ck * 0.95 });
      out += pop(badge('カーブ', { fill: C.blueUi, size: 46, pad: 40 }), t, cue(1) + 0.4, 960, 170, { end: cue(3) - 0.2 });
    }
    out += kidShow('S', t, 905, 835, { s: 0.42, start: 0.3, n: 0, look: [3, -9], bubble: false });
    out += kidShow('B', t, 1045, 835, { s: 0.42, start: 0.5, n: 1, look: [-2, -9], bubble: false });
    out += talkBubble('S', 960, 545, 905, 835 - 452 * 0.42 - 6);
    out += pop(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre, extra: `stroke="#fffaf0" stroke-width="20" paint-order="stroke" stroke-linejoin="round"` }), t, cue(3) + 0.6, 975, 560);
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${TR.stripe}">電車</tspan>は、どうやって</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${TR.out}">カーブ</tspan>を 曲がるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = `<line x1="-330" y1="0" x2="330" y2="0" stroke="${TR.rail}" stroke-width="10" stroke-linecap="round"/>` + trainSide(0);
      out += pop(ic, t, t0 + 1.8, 960, 930, { s: 0.9 });
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうやって まがっている？', { size: 80, w: 900 }), t, 0.3, 900, 215);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 45, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 400 + i * 168);
    });
    out += kidShow('B', t, 1700, 860, { s: 0.66, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1700, y: 330, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. カーブでは、外がわのレールのほうが長い（上から見たところ）
SCENES.push({
  id: 'curve',
  draw(t) {
    const CX = 560, CY = 830, RO = 540, RI = 380, RM = 460, A0 = 176, A1 = 4;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const hl = prog(t, cue(0) + 1.4, 0.5), back2 = prog(t, cue(2) - 0.3, 0.5);
    const colO = mix(TR.rail, TR.out, hl * (1 - back2)), colI = mix(TR.rail, TR.inn, prog(t, cue(0) + 3.6, 0.5) * (1 - back2));
    out += trackArc(CX, CY, RM, A0, A1, { gauge: RO - RI, rail: 18, colO, colI, tieStep: 5, tieW: 16 });
    out += pop(badge('うえから みた カーブ', { fill: C.blueUi, size: 40 }), t, 0.3, 1480, 190, { end: cue(1) - 0.2 });
    // レールの名前
    out += pop(text(0, 0, 'そとがわの レール', { size: 46, w: 900, fill: TR.out }), t, cue(0) + 1.5, 560, 215);
    out += pop(text(0, 0, 'うちがわの レール', { size: 46, w: 900, fill: TR.inn }), t, cue(0) + 3.7, 560, 620);
    // 長さくらべ：点が同じだけ回ると、のびる棒の長さがちがう
    const k = eio(prog(t, cue(1) + 0.9, 2.6));
    const cO = win(t, cue(1) - 0.1, 99, 0.4);
    if (cO > 0) {
      const a = lerp(A0, A1, k);
      if (k > 0 && back2 < 1) {
        const [ox, oy] = onArc(CX, CY, RO, a), [ix, iy] = onArc(CX, CY, RI, a);
        out += g(`<path d="${arcPath(CX, CY, RO, A0, a)}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/><path d="${arcPath(CX, CY, RI, A0, a)}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>` +
          `<circle cx="${ox}" cy="${oy}" r="22" fill="${TR.out}" stroke="#fff" stroke-width="6"/><circle cx="${ix}" cy="${iy}" r="22" fill="${TR.inn}" stroke="#fff" stroke-width="6"/>`, { o: 1 - back2 });
      }
      const SC = 0.33, lo = RO * rad(A0 - A1) * SC, li = RI * rad(A0 - A1) * SC;
      let c = card(700, 330) + text(0, -112, 'ながさ くらべ', { size: 44, w: 900 });
      c += text(-310, -30, 'そと', { size: 38, w: 900, anchor: 'start', fill: TR.out }) + `<rect x="-215" y="-52" width="${Math.max(lo * k, 0.1)}" height="44" rx="22" fill="${TR.out}"/>`;
      c += text(-310, 62, 'うち', { size: 38, w: 900, anchor: 'start', fill: TR.inn }) + `<rect x="-215" y="40" width="${Math.max(li * k, 0.1)}" height="44" rx="22" fill="${TR.inn}"/>`;
      out += g(c, { x: 1500, y: 400, o: cO });
      out += pop(badge('そとがわの ほうが ながい', { fill: TR.out, size: 42 }), t, cue(1) + 3.6, 1500, 640, { end: cue(2) - 0.1 });
    }
    // 車輪：外の車輪のほうが たくさん進む
    const wk = prog(t, cue(2) + 0.2, 0.4);
    if (wk > 0) {
      const m = eio(prog(t, cue(2) + 0.8, 4.2)), a = lerp(168, 12, m);
      out += `<path d="${arcPath(CX, CY, RO, 168, a)}" fill="none" stroke="${TR.out}" stroke-width="20" stroke-linecap="round"/><path d="${arcPath(CX, CY, RI, 168, a)}" fill="none" stroke="${TR.inn}" stroke-width="20" stroke-linecap="round"/>`;
      const [x, y] = onArc(CX, CY, RM, a);
      out += g(`<g transform="rotate(${90 - a})">${wheelsetTop(RO - RI, { colA: TR.out, colB: TR.inn })}</g>`, { x, y, o: wk });
      out += pop(badge('そとの しゃりん：たくさん すすむ', { fill: TR.out, size: 38 }), t, cue(2) + 1.2, 1500, 640);
      out += pop(badge('うちの しゃりん：すこし', { fill: TR.inn, size: 38 }), t, cue(2) + 3.4, 1500, 740);
    }
    return out;
  },
});

// 4. 車輪は、右と左が1本のじくでつながっている
function wheelsetOblique(a) {
  const rx = 62, ry = 170, D = 280, th = 30;
  const wheel = cx => {
    let o = `<ellipse cx="${cx - th}" cy="0" rx="${rx}" ry="${ry}" fill="${TR.steelD}" stroke="${TR.dark}" stroke-width="6"/>`;
    o += `<rect x="${cx - th}" y="${-ry}" width="${th}" height="${ry * 2}" fill="${TR.steelD}"/>`;
    o += `<line x1="${cx - th}" y1="${-ry}" x2="${cx}" y2="${-ry}" stroke="${TR.dark}" stroke-width="6"/><line x1="${cx - th}" y1="${ry}" x2="${cx}" y2="${ry}" stroke="${TR.dark}" stroke-width="6"/>`;
    o += `<ellipse cx="${cx}" cy="0" rx="${rx}" ry="${ry}" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="6"/>`;
    o += `<ellipse cx="${cx}" cy="0" rx="${rx * 0.74}" ry="${ry * 0.74}" fill="${TR.steelL}"/>`;
    for (let k = 0; k < 4; k++) { const b = a + k * Math.PI / 2; o += `<line x1="${cx}" y1="0" x2="${cx + rx * 0.7 * Math.cos(b)}" y2="${ry * 0.7 * Math.sin(b)}" stroke="${TR.steelD}" stroke-width="9" stroke-linecap="round"/>`; }
    o += `<circle cx="${cx + rx * 0.56 * Math.cos(a)}" cy="${ry * 0.56 * Math.sin(a)}" r="17" fill="${C.red}" stroke="#fff" stroke-width="4"/>`;
    o += `<ellipse cx="${cx}" cy="0" rx="16" ry="32" fill="${TR.steelD}" stroke="${TR.dark}" stroke-width="4"/>`;
    return o;
  };
  let o = `<ellipse cx="-10" cy="${ry + 14}" rx="${D + 110}" ry="20" fill="#3d311f" opacity="0.1"/>`;
  o += wheel(-D);
  o += `<rect x="${-D}" y="-24" width="${D * 2 - th - rx + 6}" height="48" fill="#98a2ab" stroke="${TR.dark}" stroke-width="6"/><rect x="${-D + 14}" y="-16" width="${D * 2 - th - rx - 26}" height="9" rx="4" fill="#fff" opacity="0.45"/>`;
  o += wheel(D);
  return o;
}
SCENES.push({
  id: 'axle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const WX = 800, WY = 610;
    // 電車と、車輪の場所
    out += pop(`<line x1="-250" y1="0" x2="250" y2="0" stroke="${TR.rail}" stroke-width="10" stroke-linecap="round"/>` + trainSide(0), t, 0.3, 330, 360, { s: 0.7 });
    const zk = prog(t, 0.9, 0.5);
    if (zk > 0) {
      out += g(`<circle cx="${330 + 140 * 0.7}" cy="${360 - 25 * 0.7}" r="32" fill="none" stroke="${C.red}" stroke-width="8"/>` +
        `<path d="M ${330 + 140 * 0.7 + 24} ${360 - 25 * 0.7 + 22} L ${WX - 250} ${WY - 150}" stroke="${C.red}" stroke-width="6" stroke-dasharray="6 12" stroke-linecap="round" fill="none"/>`, { o: zk });
    }
    out += pop(wheelsetOblique(Math.max(0, t - 1.2) * 2.4), t, 1.1, WX, WY);
    out += pop(badge('じく', { fill: C.ink, size: 40 }), t, cue(0) + 3.6, WX - 40, WY - 78);
    out += pop(text(0, 0, 'みぎと ひだりが がっちり つながっている', { size: 44, w: 900 }), t, cue(0) + 4.4, 1150, 330, { end: cue(1) });
    out += pop(text(0, 0, 'みぎも ひだりも、おなじだけ まわる', { size: 46, w: 900, fill: C.red }), t, cue(1) + 0.3, 1130, 330, { end: cue(3) - 0.2 });
    out += kidShow('B', t, 1740, 840, { s: 0.5, start: cue(2) - 0.9, n: 0 });
    // それなのに、カーブを曲がっていく
    const qk = prog(t, cue(3) + 0.2, 0.5);
    if (qk > 0) {
      const a = lerp(150, 60, ((t - cue(3)) * 0.16) % 1);
      let c = card(480, 290);
      c += `<clipPath id="axc"><rect x="-220" y="-125" width="440" height="250" rx="20"/></clipPath><g clip-path="url(#axc)"><rect x="-240" y="-145" width="480" height="290" fill="${TR.grass}"/>` +
        trackArc(0, 330, 360, 160, 20, { gauge: 30, rail: 6, tieStep: 4, tieW: 7 }) + trainOnArc(0, 330, 360, a, { n: 2, len: 110, w: 40, gap: 10 }) + `</g>`;
      out += g(c, { x: 1470, y: 330, o: qk, s: lerp(0.9, 1, eo(qk)) });
      out += pop(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre, extra: `stroke="#fffaf0" stroke-width="18" paint-order="stroke" stroke-linejoin="round"` }), t, cue(3) + 1.0, 1650, 230);
    }
    return out;
  },
});

// 5. ひみつは車輪の形：外がわほど細い（前から見たところ）
SCENES.push({
  id: 'cone',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const wk = prog(t, cue(1) + 0.6, 0.6);
    const fv = frontView({ wedge: wk });
    out += g(fv.svg, { o: prog(t, 0.2, 0.4) });
    out += pop(badge('まえから みた しゃりん', { fill: C.blueUi, size: 42 }), t, 0.5, 960, 180, { end: cue(1) + 3.2 });
    out += pop(text(0, 0, 'そとがわ', { size: 42, w: 900, fill: C.muted }) + arrow(-110, 0, -190, 0, C.muted, 8), t, cue(1) + 2.2, 330, fv.cy - 4);
    out += pop(text(0, 0, 'そとがわ', { size: 42, w: 900, fill: C.muted }) + arrow(110, 0, 190, 0, C.muted, 8), t, cue(1) + 2.2, 1590, fv.cy - 4);
    // ふとい・ほそい
    const lab = (x, y, s, col, st) => pop(text(0, 0, s, { size: 48, w: 900, fill: col }), t, st, x, y);
    out += lab(960 - WS.xt0 + 44, fv.cy - WS.rin - 76, 'ふとい', TR.out, cue(1) + 3.4) + lab(960 + WS.xt0 - 44, fv.cy - WS.rin - 76, 'ふとい', TR.out, cue(1) + 3.4);
    out += lab(960 - WS.xo - 130, fv.cy - WS.rout + 14, 'ほそい', TR.inn, cue(1) + 4.2) + lab(960 + WS.xo + 130, fv.cy - WS.rout + 14, 'ほそい', TR.inn, cue(1) + 4.2);
    out += pop(badge('そとへ いくほど ほそい', { fill: TR.out, size: 46, pad: 40 }), t, cue(1) + 5.0, 960, 150);
    return out;
  },
});

// 6. カーブでは、車輪が外がわへずれる → 外は太いところ、内は細いところ
SCENES.push({
  id: 'shift',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sk = eio(prog(t, cue(0) + 1.4, 1.6)), ln = prog(t, cue(1) + 0.8, 0.5);
    const fv = frontView({ s: 26 * sk, lines: ln });
    out += fv.svg;
    out += pop(badge('カーブの そとがわ', { fill: TR.out, size: 40 }), t, cue(0) + 0.2, 320, 200);
    out += pop(badge('カーブの うちがわ', { fill: TR.inn, size: 40 }), t, cue(0) + 0.5, 1600, 200);
    const ak = win(t, cue(0) + 1.2, cue(1) + 0.4, 0.4);
    out += g(text(40, 0, 'そとがわへ ずれる', { size: 48, w: 900 }) + arrow(-210, 0, -330, 0, C.ink, 12), { x: 1000, y: 200, o: ak });
    // レールにのる所
    if (ln > 0) {
      const xl = 960 - 26 * sk - (WS.xr - 26 * sk), xr2 = 960 - 26 * sk + (WS.xr + 26 * sk);
      out += g(`<circle cx="${fv.xL}" cy="700" r="26" fill="none" stroke="${TR.out}" stroke-width="9"/><circle cx="${fv.xR}" cy="700" r="26" fill="none" stroke="${TR.inn}" stroke-width="9"/>`, { o: ln });
      out += pop(badge('ふとい ところ', { fill: TR.out, size: 46, pad: 36 }), t, cue(1) + 1.2, 240, 470);
      out += pop(badge('ほそい ところ', { fill: TR.inn, size: 46, pad: 36 }), t, cue(1) + 3.6, 1680, 470);
      out += g(`<line x1="420" y1="456" x2="${xl - 16}" y2="${fv.cy - 120}" stroke="${TR.out}" stroke-width="7" stroke-dasharray="4 13" stroke-linecap="round"/>`, { o: prog(t, cue(1) + 1.4, 0.3) });
      out += g(`<line x1="1500" y1="456" x2="${xr2 + 16}" y2="${fv.cy - 110}" stroke="${TR.inn}" stroke-width="7" stroke-dasharray="4 13" stroke-linecap="round"/>`, { o: prog(t, cue(1) + 3.8, 0.3) });
    }
    return out;
  },
});

// 7. 同じ1回転でも、太いところのほうが長く進む → 自然に内がわへ向きを変える
SCENES.push({
  id: 'roll',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A まるを1回転ころがす
    const aO = 1 - prog(t, cue(1) - 0.5, 0.4);
    if (aO > 0) {
      const k = eio(prog(t, cue(0) + 1.0, 3.0)), X0 = 640;
      const row = (y0, r, col) => {
        const x = X0 + 2 * Math.PI * r * k;
        let o = `<line x1="540" y1="${y0}" x2="1720" y2="${y0}" stroke="${C.line}" stroke-width="10" stroke-linecap="round"/>`;
        o += `<line x1="${X0}" y1="${y0}" x2="${x}" y2="${y0}" stroke="${col}" stroke-width="16" stroke-linecap="round"/>`;
        o += `<line x1="${X0}" y1="${y0 - 18}" x2="${X0}" y2="${y0 + 18}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
        o += `<g transform="translate(${x} ${y0 - r - 8}) rotate(${k * 360})"><circle r="${r}" fill="${TR.steelL}" stroke="${col}" stroke-width="14"/><line x1="0" y1="0" x2="0" y2="${r - 14}" stroke="${TR.steelD}" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="${r - 22}" r="13" fill="${C.red}"/><circle r="13" fill="${TR.steelD}"/></g>`;
        return o;
      };
      let a = row(450, 96, TR.out) + row(750, 62, TR.inn);
      a += pop(badge('ふとい ところ', { fill: TR.out, size: 42 }), t, 0.3, 330, 350) + pop(badge('ほそい ところ', { fill: TR.inn, size: 42 }), t, 0.5, 330, 680);
      a += pop(badge('おなじ 1かいてん', { fill: C.ink, size: 46, pad: 40 }), t, cue(0) + 0.3, 1130, 190);
      const e = cue(0) + 4.1;
      a += pop(text(0, 0, 'ながく すすむ', { size: 50, w: 900, fill: TR.out }), t, e, X0 + 2 * Math.PI * 96 + 300, 350);
      a += pop(text(0, 0, 'みじかい', { size: 50, w: 900, fill: TR.inn }), t, e + 0.5, X0 + 2 * Math.PI * 62 + 230, 680);
      out += g(a, { o: aO });
    }
    // B 上から見たカーブ：外の車輪が長く進むので、内がわへ向きが変わる
    const bO = prog(t, cue(1) - 0.2, 0.5);
    if (bO > 0) {
      const CX = 1560, CY = 770, RO = 760, RI = 560, RM = 660;
      const m = eio(prog(t, cue(1) + 0.6, 4.4)), a = lerp(177, 120, m);
      let b = trackArc(CX, CY, RM, 194, 102, { gauge: RO - RI, rail: 16, tieStep: 3.4, tieW: 16 });
      b += `<path d="${arcPath(CX, CY, RO, 177, a)}" fill="none" stroke="${TR.out}" stroke-width="20" stroke-linecap="round"/><path d="${arcPath(CX, CY, RI, 177, a)}" fill="none" stroke="${TR.inn}" stroke-width="20" stroke-linecap="round"/>`;
      const [x, y] = onArc(CX, CY, RM + 14, a);
      b += `<g transform="translate(${x} ${y}) rotate(${90 - a})">${wheelsetTop(RO - RI, { colA: TR.out, colB: TR.inn, len: 110, w: 46 })}</g>`;
      // 向きを変える矢印（内がわへ）
      const ak = prog(t, cue(1) + 3.0, 0.5);
      if (ak > 0) { const [hx, hy] = onArc(CX, CY, 400, 128), [px, py] = onArc(CX, CY, 400, 133); b += g(`<path d="${arcPath(CX, CY, 400, 168, 130)}" fill="none" stroke="${C.accent}" stroke-width="14" stroke-linecap="round"/>` + arrow(px, py, hx, hy, C.accent, 14), { o: ak }); }
      b += pop(badge('うえから みた カーブ', { fill: C.blueUi, size: 38 }), t, cue(1), 400, 230);
      b += pop(badge('そとの しゃりん：ながく すすむ', { fill: TR.out, size: 38 }), t, cue(1) + 0.9, 420, 370);
      b += pop(badge('うちの しゃりん：みじかい', { fill: TR.inn, size: 38 }), t, cue(1) + 1.9, 420, 480);
      b += pop(badge('しぜんに うちがわへ まがる', { fill: C.accent, size: 44, pad: 38 }), t, cue(1) + 3.2, 420, 630);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 紙コップを横にして転がすと、細いほうへ曲がる（上から見たところ）
function cupTop(roll) {
  // たおした紙コップ。上（-y）が のみ口、下が 底。roll は ころがった角度
  const L = 130, rm = 95, rb = 62;
  let o = `<path d="M ${-rm} ${-L} L ${rm} ${-L} L ${rb} ${L} L ${-rb} ${L} Z" fill="#fffdf6" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  for (let k = 0; k < 8; k++) {
    const b = roll + k * Math.PI / 4, c = Math.cos(b), s = Math.sin(b);
    if (c <= 0.08) continue;
    o += `<line x1="${rm * s * 0.96}" y1="${-L + 22}" x2="${rb * s * 0.96}" y2="${L - 8}" stroke="${k % 2 ? '#e8742a' : '#2f7de1'}" stroke-width="${3 + 9 * c}" stroke-linecap="round" opacity="${0.35 + 0.6 * c}"/>`;
  }
  o += `<rect x="${-rm - 3}" y="${-L - 4}" width="${rm * 2 + 6}" height="20" rx="10" fill="#fff" stroke="${TR.dark}" stroke-width="6"/>`;
  return o;
}
SCENES.push({
  id: 'cup',
  draw(t) {
    const PX = 960, PY = 1130, RC = 618, RMO = 748, RBO = 488, F0 = 132, F1 = 66;
    let out = `<rect width="1920" height="1080" fill="#f6ead3"/>` + [200, 520, 840].map(y => `<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="#ead9bb" stroke-width="6"/>`).join('') + topBadge();
    const m = eio(prog(t, cue(1) + 0.3, cueE(1) - cue(1) - 0.6)), f = lerp(F0, F1, m);
    // まっすぐには進まない
    const sO = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.4);
    if (sO > 0) {
      const [sx, sy] = onArc(PX, PY, RC, F0);
      const d = [Math.sin(rad(F0)), Math.cos(rad(F0))];  // はじめに進む向き
      out += g(`<line x1="${sx + d[0] * 150}" y1="${sy + d[1] * 150}" x2="${sx + d[0] * 590}" y2="${sy + d[1] * 590}" stroke="${C.muted}" stroke-width="8" stroke-dasharray="18 16" stroke-linecap="round"/>` +
        g(text(0, 0, 'まっすぐ？', { size: 40, w: 900, fill: C.muted }), { x: sx + d[0] * 400 - 120, y: sy + d[1] * 400 - 30 }) +
        g(cross(0, 0, 0.5), { x: sx + d[0] * 610, y: sy + d[1] * 610, o: prog(t, cue(1) + 2.2, 0.3) }), { o: sO });
    }
    // 通ったあと
    if (m > 0) out += `<path d="${arcPath(PX, PY, RMO, F0, f)}" fill="none" stroke="${TR.out}" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 22"/><path d="${arcPath(PX, PY, RBO, F0, f)}" fill="none" stroke="${TR.inn}" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 22"/>`;
    const roll = RC * rad(F0 - f) / 78;
    out += g(`<g transform="rotate(${90 - f}) translate(0 ${-RC})"><ellipse cx="14" cy="10" rx="92" ry="140" fill="#3d311f" opacity="0.1"/>${cupTop(roll)}</g>`, { x: PX, y: PY, o: prog(t, 0.3, 0.4) });
    out += pop(badge('かみコップを よこに して ころがす', { fill: C.blueUi, size: 40 }), t, cue(0) + 0.3, 1180, 190, { end: cue(1) + 0.2 });
    // 名前
    const lO = win(t, cue(0) + 1.6, cue(1) + 0.2, 0.3);
    if (lO > 0) {
      const [mx, my] = onArc(PX, PY, RMO + 50, F0), [bx, by] = onArc(PX, PY, RBO - 46, F0);
      out += g(text(mx - 30, my - 10, 'ふとい ほう', { size: 40, w: 900, fill: TR.out, anchor: 'end' }) + text(bx + 10, by + 30, 'ほそい ほう', { size: 40, w: 900, fill: TR.inn, anchor: 'end' }), { o: lO });
    }
    out += pop(badge('ほそい ほうへ まがる', { fill: TR.inn, size: 46, pad: 40 }), t, cue(1) + 2.8, 1500, 190);
    // 車輪も同じ考え方
    const wO = prog(t, cue(2), 0.5);
    if (wO > 0) {
      let c = card(490, 330);
      // 車輪（前から見たところ）と、同じ向きに ならべた 紙コップ（まん中がわが ふとく、外がわが ほそい）
      c += `<g transform="translate(0 -66) scale(0.36)">${wheelsetFront({ wedge: 1 })}</g>`;
      c += `<g transform="translate(-119 66) rotate(90) scale(0.4)">${cupTop(0.4)}</g><g transform="translate(119 66) rotate(-90) scale(0.4)">${cupTop(0.4)}</g>`;
      c += text(0, 132, 'しゃりんも おなじ かんがえかた', { size: 30, w: 900 });
      out += g(c, { x: 318, y: 300, o: wO, s: lerp(0.9, 1, eo(wO)) });
    }
    out += chamL(t, 1760, 850, { s: 0.8, start: cue(3) - 0.9, n: 0 }) + talkBubble('K', 1560, 590, 1668, 706);
    return out;
  },
});

// 9. つば（フランジ）：急なカーブでは、レールの横に当たって案内する
SCENES.push({
  id: 'flange',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const fk = prog(t, cue(0) + 1.6, 0.5);
    const sk = eio(prog(t, cue(1) + 1.6, 1.4));
    // 当たったあと、少しだけ はねかえって また当たる
    const bump = sk >= 1 ? Math.max(0, Math.sin((t - cue(1) - 3.0) * 5)) * 3 * (1 - prog(t, cue(1) + 3.0, 2.5)) : 0;
    const fv = frontView({ s: 30 * sk - bump, fl: mix(TR.steel, TR.fl, fk) });
    // 左の車輪の 下のほう（レールにのる所）に よる
    const zk = eio(prog(t, cue(1) + 0.2, 1.2));
    const zs = lerp(1, 1.5, zk), zx = lerp(0, 225, zk), zy = lerp(0, -430, zk);
    out += `<g transform="translate(${zx} ${zy}) scale(${zs})">${fv.svg}`;
    // 当たった所
    const hit = prog(t, cue(1) + 3.0, 0.3);
    if (hit > 0) {
      const hx = fv.xL + 24, hy = 716;
      let st = '';
      for (let k = 0; k < 7; k++) { const a = -0.3 + k * 0.52, r1 = 26, r2 = 48 + 8 * Math.sin(t * 9 + k); st += `<line x1="${hx + r1 * Math.cos(a)}" y1="${hy + r1 * Math.sin(a) * 0.9}" x2="${hx + r2 * Math.cos(a)}" y2="${hy + r2 * Math.sin(a) * 0.9}" stroke="${C.yellow}" stroke-width="7" stroke-linecap="round"/>`; }
      out += g(st, { o: hit * (0.55 + 0.45 * Math.abs(Math.sin(t * 6))) });
    }
    out += `</g>`;
    // 名前
    const [lx, rx2] = [960 - (WS.xi + 14), 960 + (WS.xi + 14)];
    const nO = win(t, cue(0) + 1.8, cue(1) + 0.3, 0.3);
    if (nO > 0) {
      out += g(badge('つば', { fill: TR.fl, size: 50, pad: 40 }), { x: 960, y: 200, o: nO, s: Math.max(back(prog(t, cue(0) + 1.8, 0.5)), 0.001) });
      out += g(`<path d="M 890 232 L ${lx + 14} ${fv.cy - WS.rf - 14} M 1030 232 L ${rx2 - 14} ${fv.cy - WS.rf - 14}" stroke="${TR.fl}" stroke-width="7" stroke-dasharray="4 13" stroke-linecap="round" fill="none"/>`, { o: nO });
      out += g(text(960, fv.cy - 70, 'うちがわの はしの でっぱり', { size: 36, w: 900, fill: C.muted }), { o: nO });
    }
    out += pop(badge('きゅうな カーブ', { fill: C.blueUi, size: 42 }), t, cue(1) + 1.2, 500, 210);
    out += pop(badge('つばが レールの よこに あたる', { fill: TR.fl, size: 42 }), t, cue(1) + 3.2, 500, 350, { end: cue(2) - 0.1 });
    out += g(text(1050, 700, 'レール', { size: 40, w: 900, fill: C.muted }), { o: prog(t, cue(1) + 1.6, 0.4) });
    out += pop(badge('レールから はずれるのを ふせぐ', { fill: C.accent, size: 44, pad: 38 }), t, cue(2) + 0.4, 500, 350);
    return out;
  },
});

// 10. まっすぐな線路では くねくね → 新幹線は ななめが小さい
function wheelIcon(drop) {
  // 前から見た車輪の下がわ（レールにのる所）。drop が ななめの大きさ
  let o = `<path d="M -70 -150 L 62 -150 L 62 ${-drop} L -44 0 L -50 30 L -70 30 Z" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<line x1="-44" y1="0" x2="96" y2="0" stroke="${TR.dark}" stroke-width="5" stroke-dasharray="10 9"/>`;
  o += `<path d="M -44 0 L 62 0 L 62 ${-drop} Z" fill="${TR.out}" opacity="0.5"/><line x1="-44" y1="0" x2="62" y2="${-drop}" stroke="${TR.out}" stroke-width="10" stroke-linecap="round"/>`;
  return o;
}
SCENES.push({
  id: 'shinkansen',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A まっすぐな線路で くねくね（上から見たところ。右へ進む）
    const aO = 1 - prog(t, cue(1) - 0.5, 0.4);
    if (aO > 0) {
      const YM = 520, GA = 200;
      let a = `<rect x="-20" y="${YM - GA / 2 - 28}" width="1960" height="${GA + 56}" fill="${TR.ballast}"/>`;
      for (let x = 30; x < 1920; x += 74) a += `<line x1="${x}" y1="${YM - GA / 2 - 14}" x2="${x}" y2="${YM + GA / 2 + 14}" stroke="${TR.tie}" stroke-width="16" stroke-linecap="round"/>`;
      a += `<line x1="-20" y1="${YM - GA / 2}" x2="1940" y2="${YM - GA / 2}" stroke="${TR.rail}" stroke-width="16"/><line x1="-20" y1="${YM + GA / 2}" x2="1940" y2="${YM + GA / 2}" stroke="${TR.rail}" stroke-width="16"/>`;
      const X0 = 240, X1 = 1680, AMP = 22, W = 2 * Math.PI * 2.5 / (X1 - X0);
      const x = lerp(X0, X1, prog(t, cue(0) + 0.4, cueE(0) - cue(0) + 0.6));
      let d = '';
      for (let xx = X0; xx <= x; xx += 8) d += (d ? ' L ' : 'M ') + xx + ' ' + (YM + AMP * Math.sin((xx - X0) * W)).toFixed(1);
      if (d) a += `<path d="${d}" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 16"/>`;
      const yaw = Math.atan(AMP * W * Math.cos((x - X0) * W)) * 180 / Math.PI;
      a += `<g transform="translate(${x} ${YM + AMP * Math.sin((x - X0) * W)}) rotate(${yaw})">${wheelsetTop(GA, { len: 110, w: 46 })}</g>`;
      a += pop(badge('まっすぐな せんろ（うえから）', { fill: C.blueUi, size: 40 }), t, 0.3, 1100, 200);
      a += pop(text(0, 0, 'くね くね', { size: 64, w: 900, fill: C.red }), t, cue(0) + 3.2, 960, 760);
      out += g(a, { o: aO });
    }
    // B ふつうの電車と 新幹線の くらべ
    const bO = prog(t, cue(1) - 0.2, 0.5);
    if (bO > 0) {
      const one = (title, sub, chip, col, icon, drop) => {
        let c = card(740, 560);
        c += text(0, -222, title, { size: 50, w: 900 });
        c += `<g transform="translate(-170 -20) scale(0.62)"><line x1="-260" y1="0" x2="260" y2="0" stroke="${TR.rail}" stroke-width="10" stroke-linecap="round"/>${icon}</g>`;
        c += `<g transform="translate(190 -30) scale(0.9)">${wheelIcon(drop)}<rect x="-18" y="2" width="92" height="22" rx="8" fill="${TR.railD}"/></g>`;
        c += text(190, 40, 'しゃりんの ななめ', { size: 28, w: 700, fill: C.muted });
        c += text(0, 110, sub, { size: 46, w: 900, fill: col });
        c += g(badge(chip, { fill: col, size: 38 }), { y: 204 });
        return c;
      };
      out += g(one('ふつうの でんしゃ', 'ななめ 1/20 が おおい', 'カーブを まがりやすく', TR.out, trainSide(0), 44), { x: 530, y: 500 - (1 - eo(bO)) * 30, o: bO });
      const b2 = prog(t, cue(1) + 1.6, 0.5);
      out += g(one('しんかんせん', 'ななめ 1/40（ちいさい）', 'はやくても ゆれにくく', TR.inn, shinSide(), 22), { x: 1390, y: 500 - (1 - eo(b2)) * 30, o: b2 });
    }
    return out;
  },
});

// 11. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[1][1], { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['カーブで そとへ ずれる', C.blueUi], ['そとは ふとい ところ', TR.out], ['うちは ほそい ところ', TR.inn], ['しぜんに まがる', C.accent]], t, 960, 660, { size: 34, gap: 26, start: 2.6, step: 0.8 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 370, 200);
      const tIcon = `<g transform="translate(0 34) scale(0.3)">${trainSide(0)}</g>`;
      const wIcon = `<g transform="scale(0.15)">${wheelsetFront({ wedge: 1, fl: TR.fl })}</g>`;
      const cIcon = `<g transform="rotate(64) scale(0.42)">${cupTop(0.5)}</g>`;
      const items = [
        [tIcon, 'ホームから、とまっている でんしゃの しゃりんを みる', C.ink],
        [wIcon, 'そとへ ほそく なっているか、つばが あるか さがす', C.ink],
        [g(warnIcon(), { s: 0.9 }), 'でんしゃが うごく ときは、きいろい せんの うちがわで', C.red],
        [cIcon, 'おうちで かみコップを ころがして、まがる むきを みる', C.ink],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 345 + i * 132);
      });
      b += chamL(t, 1750, 830, { s: 0.66, start: cue(1) + 0.8, n: 0 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 12. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「でんしゃの しゃりん」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    // 左に立つ子は動画ごとに変わる（END_SWAP）。動きも kidShow が動画ごとに選ぶ
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += chamL(t, 1660, 1040, { s: 0.7, start: 1.2, n: 2 });
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
