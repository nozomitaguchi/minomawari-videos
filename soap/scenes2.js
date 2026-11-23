// ---------- せっけんの道具 ----------
// 色：水は青、油は黄色、石けんのつぶは「赤い丸い頭（水となかよし）＋黒いぎざぎざのしっぽ（油となかよし）」、すすは黒
const SP = { water: '#cfeaf8', waterD: '#7cc4ea', oil: '#f6c232', oilD: '#d59f10', oilInk: '#a67c00', head: '#e2473a', tail: '#2a2622', soot: '#2f2c2a', cloth: '#f6f1e7', clothL: '#dcd2c0', skin: '#f6d6bd', skinD: '#e6b99c', soap: '#fbe3ea', soapD: '#e7a9bb' };
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const WATERBG = `<rect width="1920" height="1080" fill="${SP.water}"/>`;
// 石けんのつぶ（マッチ棒の形）：頭は (x,y)、しっぽは ang（度）の向きへのびる
const mol = (x, y, ang, s = 1, o = 1) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${s})" opacity="${o}"><path d="M 12 0 l 7 -8 l 9 16 l 9 -16 l 9 16 l 9 -16 l 7 8" fill="none" stroke="${SP.tail}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle r="15" fill="${SP.head}"/><circle cx="-5" cy="-5" r="4.5" fill="#fff" opacity="0.6"/></g>`;
const oilBlob = (x, y, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="${Math.max(3, r * 0.06)}"/><ellipse cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" rx="${r * 0.22}" ry="${r * 0.13}" fill="#fff" opacity="0.65" transform="rotate(-30 ${(x - r * 0.35).toFixed(1)} ${(y - r * 0.4).toFixed(1)})"/>`;
const sootGrain = (x, y, r) => `<path d="M ${x - r} ${y - r * 0.2} L ${x - r * 0.4} ${y - r} L ${x + r * 0.6} ${y - r * 0.8} L ${x + r} ${y + r * 0.1} L ${x + r * 0.4} ${y + r} L ${x - r * 0.7} ${y + r * 0.8} Z" fill="${SP.soot}"/>`;
// とりかこまれたよごれ：まん中の玉（kind 'oil' | 'soot'）のまわりに n 本。頭が外、しっぽが内。k = つぶが近づききった度合い
function wrapped(x, y, r, kind, n, { s = 0.7, spin = 0, k = 1 } = {}) {
  let out = kind === 'oil' ? oilBlob(x, y, r) : sootGrain(x, y, r);
  for (let i = 0; i < n; i++) {
    const a = i / n * 360 + spin, rad = a * Math.PI / 180, d = r + 13 * s + (1 - k) * 90;
    out += mol(x + Math.cos(rad) * d, y + Math.sin(rad) * d, a + 180, s, clamp(k * 2));
  }
  return out;
}
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 }) + `</g>`;
const tagAt = (t, st, x, y, str, col, px, py, { end = 1e9, size = 42 } = {}) =>
  pop(`<line x1="0" y1="0" x2="${px - x}" y2="${py - y}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="${px - x}" cy="${py - y}" r="11" fill="${col}"/>` + badge(str, { fill: col, size }), t, st, x, y, { end });
const soapBar = (s = 1) => `<g transform="scale(${s})"><rect x="-90" y="-52" width="180" height="104" rx="38" fill="${SP.soap}" stroke="${SP.soapD}" stroke-width="7"/><ellipse cx="0" cy="0" rx="52" ry="24" fill="none" stroke="${SP.soapD}" stroke-width="5" opacity="0.7"/><path d="M -64 -30 Q -40 -42 -14 -40" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.9"/></g>`;
const sparkle = (x, y, r, o = 1) => `<path d="M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="#ffd23a" stroke="#fff" stroke-width="3" opacity="${o}"/>`;
// コップ（中心 0,0、高さ 200）
const gxl = y => -70 + (y + 100) / 200 * 14;
const glassRim = `<path d="M -70 -100 L -56 92 Q -56 100 -46 100 L 46 100 Q 56 100 56 92 L 70 -100" fill="#eaf4fa" fill-opacity="0.22" stroke="#7fa7bd" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M -52 -78 L -45 50" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
const gpoly = (ya, yb, col) => yb - ya < 0.3 ? '' : `<path d="M ${gxl(ya)} ${ya} L ${-gxl(ya)} ${ya} L ${-gxl(yb)} ${yb}` + (yb >= 92 ? ` Q 56 100 46 100 L -46 100 Q -56 100 ${gxl(92)} 92` : ` L ${gxl(yb)} ${yb}`) + ` Z" fill="${col}"/>`;
// 布（左のはしに立っている。右のふちが x = 300）
const clothWall = () => {
  let o = `<rect x="-20" y="-20" width="320" height="1120" fill="${SP.cloth}"/>`;
  for (let y = 10; y < 1080; y += 34) o += `<line x1="0" y1="${y}" x2="300" y2="${y}" stroke="${SP.clothL}" stroke-width="5"/>`;
  for (let x = 20; x < 300; x += 40) o += `<line x1="${x}" y1="0" x2="${x}" y2="1080" stroke="${SP.clothL}" stroke-width="5" opacity="0.6"/>`;
  return o + `<line x1="300" y1="0" x2="300" y2="1080" stroke="#b9ad98" stroke-width="8"/>`;
};
// 手のひら（指は上向き。中心 0,0）
function hand(x, y, s, { oil = 0, foam = 0, t = 0 } = {}) {
  const f = (fx, h) => `<rect x="${fx - 24}" y="${-90 - h}" width="48" height="${h + 40}" rx="24" fill="${SP.skin}"/>`;
  let o = `<rect x="-62" y="60" width="124" height="420" rx="40" fill="${SP.skin}"/>`;
  o += f(-78, 120) + f(-26, 160) + f(26, 150) + f(78, 105);
  o += `<rect x="-150" y="-36" width="62" height="150" rx="31" fill="${SP.skin}" transform="rotate(-34 -119 39)"/>`;
  o += `<rect x="-108" y="-110" width="216" height="220" rx="74" fill="${SP.skin}"/>`;
  o += `<path d="M -52 -24 Q 0 16 58 -34 M -62 30 Q -10 62 42 30" fill="none" stroke="${SP.skinD}" stroke-width="5" stroke-linecap="round"/>`;
  if (oil > 0) [[-42, -34, 36, 26], [40, 22, 30, 22], [-6, 64, 26, 18], [26, -178, 15, 20], [-78, -140, 13, 18]].forEach(([bx, by, rx, ry], i) => {
    o += `<ellipse cx="${bx + Math.sin(t * 2 + i) * 2}" cy="${by}" rx="${rx}" ry="${ry}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="3" opacity="${oil}"/><ellipse cx="${bx - rx * 0.3}" cy="${by - ry * 0.35}" rx="${rx * 0.25}" ry="${ry * 0.2}" fill="#fff" opacity="${0.7 * oil}"/>`;
  });
  if (foam > 0) for (let i = 0; i < 22; i++) {
    const bx = -90 + rnd(i, 11) * 180, by = -180 + rnd(i, 12) * 270, r = 14 + rnd(i, 13) * 20;
    o += `<circle cx="${bx + Math.sin(t * 3 + i) * 3}" cy="${by + Math.cos(t * 2.6 + i) * 3}" r="${r * clamp(foam * 1.4 - rnd(i, 14) * 0.4)}" fill="#fff" stroke="#cfe6f2" stroke-width="3" opacity="${0.95 * foam}"/>`;
  }
  return g(o, { x, y, s });
}

// 1. つかみ：水だけでは落ちない油のよごれが、石けんで落ちる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f1efe4"/>`;
    for (let x = 0; x < 1920; x += 160) out += `<line x1="${x}" y1="0" x2="${x}" y2="760" stroke="#e4e0d2" stroke-width="4"/>`;
    for (let y = 120; y < 760; y += 160) out += `<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="#e4e0d2" stroke-width="4"/>`;
    // 流し
    out += `<path d="M 180 760 L 1220 760 L 1160 1080 L 240 1080 Z" fill="#dfe7eb"/><rect x="140" y="740" width="1120" height="34" rx="14" fill="#c3ced5"/>`;
    // 蛇口
    out += `<rect x="330" y="150" width="400" height="46" rx="20" fill="#b9c4cb"/><rect x="668" y="150" width="64" height="96" rx="22" fill="#b9c4cb"/><rect x="360" y="110" width="110" height="34" rx="14" fill="#8fa0ad"/><rect x="398" y="136" width="34" height="24" fill="#8fa0ad"/><rect x="300" y="120" width="50" height="110" rx="12" fill="#a7b3bb"/>`;
    const c1 = cue(1);
    const oil = 1 - prog(t, c1 + 1.5, 1.5), foam = win(t, c1 + 1.2, c1 + 4.4, 0.7);
    out += hand(700, 640, 1.0, { oil, foam, t });
    // 水
    out += `<rect x="678" y="240" width="44" height="330" rx="20" fill="#7cc4ea" opacity="0.6"/>`;
    for (let i = 0; i < 6; i++) { const f = (t * 1.6 + i / 6) % 1; out += `<line x1="${686 + (i % 3) * 14}" y1="${lerp(250, 520, f)}" x2="${686 + (i % 3) * 14}" y2="${lerp(250, 520, f) + 40}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`; }
    for (let i = 0; i < 8; i++) { const f = (t * 1.2 + i / 8) % 1, sd = i % 2 ? 1 : -1; out += `<circle cx="${700 + sd * (40 + f * 120)}" cy="${560 + f * f * 260 - f * 60}" r="${9 * (1 - f * 0.5)}" fill="#7cc4ea" opacity="${0.8 * (1 - f)}"/>`; }
    // 石けん
    const sIn = eio(prog(t, c1 + 0.2, 0.9)), sOut = eio(prog(t, c1 + 3.2, 0.8));
    if (sIn > 0 && sOut < 1) {
      const rub = win(t, c1 + 1.0, c1 + 3.2, 0.3);
      out += g(soapBar(1.1), { x: lerp(1500, 716, sIn) + Math.cos(t * 7) * 46 * rub + sOut * 760, y: 620 + Math.sin(t * 7) * 60 * rub - sOut * 60, r: -12 + Math.sin(t * 7) * 8 * rub });
    }
    // きれいになった
    const sp = prog(t, c1 + 4.2, 0.5);
    if (sp > 0) [[560, 470, 30], [850, 520, 36], [820, 760, 24], [590, 700, 22], [700, 420, 26]].forEach(([x, y, r], i) => { out += sparkle(x, y, r * (0.8 + 0.3 * Math.sin(t * 5 + i * 1.7)) * back(prog(t, c1 + 4.2 + i * 0.12, 0.4)), sp); });
    out += tagAt(t, cue(0) + 2.2, 1300, 330, 'みずだけでは おちない', C.blueUi, 668, 606, { end: c1 + 0.2 });
    out += pop(badge('せっけんで あらうと おちた！', { fill: C.redUi, size: 42 }), t, c1 + 4.3, 1380, 330, { end: cue(3) + 0.2 });
    out += topBadge();
    out += kidShow('B', t, 1560, 940, { s: 0.6, start: cue(2) - 0.9, n: 0, look: [-8, -4] });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 270);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#d2607a">石けん</tspan>で あらうと、</text>`, { x: 960, y: 450, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${SP.oilInk}">よごれ</tspan>が 落ちるの？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(soapBar(0.9), { x: -120 }) + wrapped(110, 0, 34, 'oil', 9, { s: 0.5 }), t, t0 + 1.8, 960, 840);
    }
    return out;
  },
});

// 2. 予想（正解は2番）
const OPTS = [['①', 'あぶらを とかして、けして しまう'], ['②', 'あぶらを かこんで、みずの なかへ はこぶ'], ['③', 'あわで、あぶらを こすりとる']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'せっけんは なにを している？', { size: 80, w: 900 }), t, 0.3, 900, 210);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 390 + i * 168);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1640, y: 230, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 水と油は、まぜても分かれる。油のよごれは水だけでは流れない
SCENES.push({
  id: 'separate',
  draw(t) {
    let out = PAPER + topBadge();
    const GX = 470, GY = 500, GS = 2.3, yT = -70, yM = -22, yB = 92;
    const pour = prog(t, cue(0) + 0.8, 0.9), mixK = prog(t, cue(0) + 2.1, 0.6), sep = eio(prog(t, cue(1) + 0.4, 4.2));
    let gl = '';
    if (mixK <= 0) gl += gpoly(yM, yB, SP.waterD) + gpoly(lerp(yM, yT, pour), yM, SP.oil);
    else {
      const lb = yT + (yM - yT) * sep;   // 油の層の下のふち
      gl += gpoly(yT, yB, SP.waterD);
      for (let i = 0; i < 34; i++) {
        const bx = (rnd(i, 21) - 0.5) * 96, by = lerp(yT + 10, yB - 8, rnd(i, 22));
        const rise = clamp(sep * 1.7 - rnd(i, 23) * 0.6), y = lerp(by, yT + 4, rise) + Math.sin(t * 3 + i) * 2 * (1 - sep);
        if (y > lb + 1) gl += `<circle cx="${(bx * (0.82 + 0.1 * Math.sin(t * 2.2 + i))).toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.5 + rnd(i, 24) * 4).toFixed(1)}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="1" opacity="${mixK}"/>`;
      }
      gl += gpoly(yT, lb, SP.oil);
    }
    // まぜるスプーン
    const stir = win(t, cue(0) + 1.9, cue(0) + 3.7, 0.3);
    if (stir > 0) { const sx = Math.sin(t * 9) * 26; gl += `<g opacity="${stir}"><line x1="${sx * 1.6}" y1="-170" x2="${sx}" y2="50" stroke="#9aa7b1" stroke-width="7" stroke-linecap="round"/><ellipse cx="${sx}" cy="58" rx="12" ry="18" fill="#9aa7b1"/></g>`; }
    out += g(gl + glassRim, { x: GX, y: GY, s: GS, o: prog(t, 0.2, 0.4) });
    out += pop(badge('みず', { fill: C.blueUi, size: 40 }), t, 0.5, 190, 620, { end: cue(0) + 2.2 });
    out += pop(badge('あぶら', { fill: SP.oilInk, size: 40 }), t, cue(0) + 0.9, 190, 400, { end: cue(0) + 2.2 });
    out += pop(badge('まぜる', { fill: '#7f95a6', size: 46 }), t, cue(0) + 2.0, GX, 800, { end: cue(1) + 0.2 });
    out += tagAt(t, cue(1) + 2.4, 940, 330, 'あぶらは うえ', SP.oilInk, GX + 100, GY - 46 * GS);
    out += tagAt(t, cue(1) + 3.2, 940, 620, 'みずは した', C.blueUi, GX + 100, GY + 40 * GS);
    out += pop(badge('わかれた！', { fill: C.redUi, size: 46 }), t, cue(1) + 4.4, GX, 800);
    // 布についた油のよごれ
    const c2 = cue(2), cO = prog(t, c2 - 0.2, 0.5);
    if (cO > 0) {
      const CX = 1500, CY = 480;
      let c = `<rect x="-200" y="-200" width="400" height="400" rx="16" fill="${SP.cloth}" stroke="#b9ad98" stroke-width="6"/>`;
      for (let y = -170; y < 200; y += 34) c += `<line x1="-196" y1="${y}" x2="196" y2="${y}" stroke="${SP.clothL}" stroke-width="5"/>`;
      for (let x = -160; x < 200; x += 40) c += `<line x1="${x}" y1="-196" x2="${x}" y2="196" stroke="${SP.clothL}" stroke-width="5" opacity="0.6"/>`;
      c += `<path d="M -70 -20 Q -80 -70 -20 -66 Q 40 -90 66 -30 Q 96 20 50 56 Q 0 90 -50 56 Q -90 30 -70 -20 Z" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="5"/><ellipse cx="-24" cy="-30" rx="18" ry="10" fill="#fff" opacity="0.6"/>`;
      // 水が流れても、油はのこる
      const wO = prog(t, c2 + 0.8, 0.5);
      for (let i = 0; i < 9; i++) {
        const y = -180 + i * 45, f = (t * 0.7 + rnd(i, 31)) % 1, x = lerp(-330, 330, f);
        c += `<line x1="${x - 60}" y1="${y}" x2="${x + 60}" y2="${y}" stroke="${SP.waterD}" stroke-width="12" stroke-linecap="round" opacity="${0.75 * wO * Math.sin(Math.PI * f)}"/>`;
      }
      out += g(c, { x: CX, y: CY, o: cO });
      out += g(text(0, 0, 'ぬのに ついた あぶら', { size: 46, w: 900 }), { x: CX, y: 215, o: cO });
      out += pop(badge('みずだけでは ながれない', { fill: C.blueUi, size: 42 }), t, c2 + 2.2, CX, 770);
    }
    return out;
  },
});

// 4. 石けんのつぶは、マッチ棒の形
SCENES.push({
  id: 'match',
  draw(t) {
    let out = PAPER + topBadge();
    const zo = eio(prog(t, cue(0) + 2.0, 1.3));
    if (zo < 1) {
      out += g(soapBar(1), { x: 960, y: 470, s: lerp(1.7, 7, zo), o: 1 - zo });
      out += g(lensIcon(), { x: 1040 + Math.sin(t * 1.6) * 30, y: 420 + Math.cos(t * 1.6) * 16, s: 1.1, o: prog(t, 0.6, 0.4) * (1 - zo) });
      out += g(text(0, 0, 'せっけんを おおきく して みると…', { size: 54, w: 900 }), { x: 960, y: 210, o: win(t, 0.5, cue(0) + 2.2, 0.4) });
    }
    if (zo > 0) {
      const MX = 470, MY = 500;
      out += g(mol(0, 0, 0, 7), { x: MX, y: MY, s: lerp(0.3, 1, zo), o: zo });
      out += g(text(0, 0, 'せっけんの つぶ', { size: 54, w: 900 }), { x: 700, y: 330, o: win(t, cue(0) + 3.2, cue(1) - 0.2, 0.4) });
      // マッチ棒
      const mk = prog(t, cue(1) + 0.2, 0.5);
      if (mk > 0) {
        const m = `<rect x="-20" y="-15" width="470" height="30" rx="8" fill="#e8c88f" stroke="#c9a468" stroke-width="4"/><ellipse cx="-36" cy="0" rx="56" ry="42" fill="#b3402e"/><ellipse cx="-50" cy="-12" rx="16" ry="10" fill="#fff" opacity="0.35"/>`;
        out += pop(m, t, cue(1) + 0.2, MX + 20, 250);
        out += g(text(0, 0, 'マッチぼう みたいな かたち', { size: 50, w: 900, anchor: 'start' }), { x: 1010, y: 252, o: prog(t, cue(1) + 0.9, 0.4) });
      }
      // 頭としっぽ
      const c2 = cue(2);
      for (let i = 0; i < 3; i++) out += pop(`<path d="M 0 -26 C 12 -8 20 2 20 12 A 20 20 0 0 1 -20 12 C -20 2 -12 -8 0 -26 Z" fill="${SP.waterD}"/>`, t, c2 + 0.5 + i * 0.15, 250 + (i % 2) * 60, 400 + i * 90);
      for (let i = 0; i < 3; i++) out += pop(oilBlob(0, 0, 22), t, c2 + 3.0 + i * 0.15, 1010 + (i % 2) * 64, 420 + i * 78);
      out += tagAt(t, c2 + 0.3, 480, 750, 'まるい あたま：みずと なかよし', C.blueUi, MX, MY + 112, { size: 40 });
      out += tagAt(t, c2 + 2.8, 1250, 750, 'ながい しっぽ：あぶらと なかよし', SP.oilInk, 760, MY + 58, { size: 40 });
    }
    out += kidShow('S', t, 1790, 920, { s: 0.56, start: cue(3) - 0.9, n: 0, look: [-8, -2] });
    return out;
  },
});

// 5. 水と油のさかいめに、ずらりとならぶ
SCENES.push({
  id: 'line',
  draw(t) {
    const BY = 470;
    let out = `<rect width="1920" height="1080" fill="#fbe08a"/>`;
    const wave = Array.from({ length: 30 }, (_, i) => `${(i * 1920 / 29).toFixed(0)} ${(BY + Math.sin(t * 1.6 + i * 0.8) * 4).toFixed(1)}`).join(' L ');
    out += `<path d="M ${wave} L 1920 1080 L 0 1080 Z" fill="${SP.water}"/>`;
    out += topBadge();
    out += g(text(0, 0, 'あぶら', { size: 76, w: 900, fill: SP.oilInk }), { x: 190, y: 290, o: prog(t, 0.3, 0.4) });
    out += g(text(0, 0, 'みず', { size: 76, w: 900, fill: C.blueUi }), { x: 190, y: 700, o: prog(t, 0.5, 0.4) });
    for (let i = 0; i < 15; i++) {
      const k = eio(prog(t, cue(0) + 0.8 + i * 0.24, 1.3));
      const x0 = 380 + rnd(i, 41) * 1300, y0 = 600 + rnd(i, 42) * 200 + Math.sin(t * 2 + i) * 8, a0 = rnd(i, 43) * 360 + t * 20;
      const x1 = 330 + i * 90, y1 = BY + 22 + Math.sin(t * 1.6 + (x1 / 1920 * 29) * 0.8) * 4;
      out += mol(lerp(x0, x1, k), lerp(y0, y1, k), lerp(a0, 270, k), 1.5, prog(t, 0.4 + i * 0.05, 0.3));
    }
    const c1 = cue(1);
    out += tagAt(t, c1 + 0.2, 640, 700, 'あたまは みずの ほうへ', C.blueUi, 600, BY + 50);
    out += tagAt(t, c1 + 2.4, 1240, 240, 'しっぽは あぶらの ほうへ', SP.oilInk, 1230, BY - 66);
    out += pop(badge('みずと あぶらを なじませる', { fill: C.redUi, size: 46, pad: 40 }), t, c1 + 4.6, 1320, 640);
    return out;
  },
});

// 6. しっぽが油にささって、とりかこみ、水の中へ運ぶ
SCENES.push({
  id: 'wrap',
  draw(t) {
    let out = WATERBG;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const dk = eio(prog(t, c2 + 0.3, 2.2)), mv = eio(prog(t, c2 + 0.8, 3.0));
    const bx = lerp(392, 1040, mv), by = 480 + Math.sin(t * 1.5) * 8 * mv, r = lerp(150, 112, dk);
    // 油のよごれ（はじめは布にぺたっとついている）
    out += oilBlob(bx, by, r);
    const N = 13, S = 1.3;
    let mols = '';
    for (let i = 0; i < N; i++) {
      const a = lerp(-82 + i * (164 / (N - 1)), -180 + (i + 0.5) * (360 / N), dk) + mv * 40, rad = a * Math.PI / 180;
      const k1 = eio(prog(t, c0 + 0.4 + i * 0.2, 2.4)), k2 = eio(prog(t, c1 + 0.3 + i * 0.13, 0.7));
      const x0 = 1300 + rnd(i, 51) * 560, y0 = 120 + rnd(i, 52) * 700, a0 = rnd(i, 53) * 360;
      const d = lerp(r + 120, r + 13 * S, k2), hx = bx + Math.cos(rad) * d, hy = by + Math.sin(rad) * d;
      mols += mol(lerp(x0, hx, k1), lerp(y0, hy, k1) + Math.sin(t * 2 + i) * 6 * (1 - k2), lerp(a0, a + 180, k1), S, prog(t, c0 + 0.3 + i * 0.2, 0.3));
    }
    // 水の中をただよう、ほかのつぶ
    for (let i = 0; i < 7; i++) out += mol(520 + rnd(i, 61) * 1300 + Math.sin(t * 0.7 + i) * 20, 110 + rnd(i, 62) * 760 + Math.cos(t * 0.9 + i) * 16, rnd(i, 63) * 360 + t * 12, 0.9, 0.55 * prog(t, c0 + 0.6, 0.6));
    out += clothWall() + mols;
    out += g(text(0, 0, 'ぬの', { size: 64, w: 900, fill: '#8a7d68' }), { x: 150, y: 250 });
    const cl = prog(t, c2 + 2.4, 0.5);
    if (cl > 0) [[340, 400, 22], [350, 520, 28], [336, 600, 18]].forEach(([x, y, rr], i) => { out += sparkle(x, y, rr * back(prog(t, c2 + 2.4 + i * 0.15, 0.4)), cl); });
    out += topBadge();
    out += tagAt(t, c0 + 0.3, 760, 210, 'あぶらの よごれ', SP.oilInk, 440, 390, { end: c1 - 0.2 });
    out += pop(badge('しっぽが あぶらに ささる', { fill: C.ink, size: 44 }), t, c1 + 1.0, 1180, 230, { end: c2 - 0.2 });
    out += pop(badge('ぐるりと とりかこむ', { fill: C.redUi, size: 44 }), t, c1 + 3.2, 1180, 330, { end: c2 - 0.2 });
    out += pop(badge('ちいさな つぶに なって、みずの なかへ', { fill: C.blueUi, size: 42 }), t, c2 + 2.0, 1040, 770);
    out += kidShow('K', t, 1700, 900, { s: 0.7, start: cue(3) - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1450, 640, 1642, 784);
    return out;
  },
});

// 7. すすもとりかこむ。かこまれたよごれは布にもどらず、すすぎの水と流れていく
SCENES.push({
  id: 'noreturn',
  draw(t) {
    let out = WATERBG;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const flow = prog(t, c2 + 0.5, 3.4), fx = 1900 * flow * flow;
    // すすぎの水の流れ
    if (flow > 0) for (let i = 0; i < 16; i++) {
      const f = (t * 0.6 + rnd(i, 71)) % 1, x = lerp(300, 2000, f), y = 80 + rnd(i, 72) * 780;
      out += `<line x1="${x - 90}" y1="${y}" x2="${x + 90}" y2="${y}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="${0.7 * clamp(flow * 3) * Math.sin(Math.PI * f)}"/>`;
    }
    const bounce = B => -B * Math.sin(Math.PI * prog(t, c1 + 1.0, 2.8));
    // とりかこまれた油（前の場面のつづき）
    const ox = 820 + bounce(350) + fx, oy = 520 + Math.sin(t * 1.5) * 8;
    out += wrapped(ox, oy, 70, 'oil', 11, { s: 0.85, spin: t * 8 });
    // すす
    const SY = [300, 640, 420, 760, 200], MX = [600, 1080, 1300, 1480, 1160], MY = [250, 640, 380, 560, 180];
    let soots = '';
    SY.forEach((sy, i) => {
      const wk = prog(t, c0 + 0.8 + i * 0.3, 1.3), go = eio(prog(t, c0 + 2.6 + i * 0.3, 2.2));
      const x = lerp(326, MX[i], go) + (i === 0 ? bounce(200) : 0) + fx, y = lerp(sy, MY[i], go) + Math.sin(t * 1.7 + i) * 6 * go;
      soots += wrapped(x, y, 24, 'soot', 7, { s: 0.6, spin: i * 20 + t * 10 * go, k: wk });
    });
    out += clothWall() + soots;
    out += g(text(0, 0, 'ぬの', { size: 64, w: 900, fill: '#8a7d68' }), { x: 150, y: 520 });
    out += topBadge();
    out += tagAt(t, c0 + 0.3, 780, 690, 'すす（こなの よごれ）', C.ink, 352, 758, { end: c0 + 2.8, size: 40 });
    out += pop(badge('すすも とりかこむ', { fill: C.ink, size: 44 }), t, c0 + 3.0, 1100, 770, { end: c1 - 0.2 });
    // もどらない
    const xo = win(t, c1 + 1.8, c2 - 0.1, 0.3);
    if (xo > 0) out += g(cross(400, 520, 0.42) + cross(380, 250, 0.3), { o: xo });
    out += tagAt(t, c1 + 0.3, 1240, 300, 'まわりが みずと なかよし', C.blueUi, ox + 64, oy - 52, { end: c2 - 0.2 });
    out += pop(badge('ぬのに もどらない', { fill: C.redUi, size: 46 }), t, c1 + 2.6, 760, 770, { end: c2 - 0.2 });
    out += pop(badge('すすぎの みずと いっしょに ながれる', { fill: C.blueUi, size: 44 }), t, c2 + 1.2, 1100, 780);
    return out;
  },
});

// 8. ミセル：頭を外に向けた小さな玉。内がわによごれを取りこむ
const MIC = [[600, 470], [1320, 470]];
SCENES.push({
  id: 'micelle',
  draw(t) {
    let out = WATERBG + topBadge();
    const c0 = cue(0), c1 = cue(1), gk = eio(prog(t, c0 + 2.6, 2.8));
    const tk = c1 + 3.0, inK = eio(prog(t, tk, 1.8));   // よごれを取りこむ
    // 取りこまれる油のつぶ（つぶの下をくぐって、まん中へ）
    if (t > tk - 0.6) out += g(oilBlob(0, 0, 40), { x: MIC[1][0], y: lerp(130, MIC[1][1], inK), o: prog(t, tk - 0.5, 0.4) });
    for (let j = 0; j < 2; j++) for (let i = 0; i < 16; i++) {
      const id = j * 16 + i, a = i / 16 * 360 + t * 6, rad = a * Math.PI / 180, R = 112 + (j === 1 ? 26 * inK : 0);
      const x0 = 240 + rnd(id, 81) * 1460 + Math.sin(t * 0.8 + id) * 26, y0 = 150 + rnd(id, 82) * 640 + Math.cos(t * 0.9 + id) * 20, a0 = rnd(id, 83) * 360 + t * 16;
      const k = eio(prog(t, c0 + 2.6 + rnd(id, 84) * 0.8, 2.0));
      out += mol(lerp(x0, MIC[j][0] + Math.cos(rad) * R, k), lerp(y0, MIC[j][1] + Math.sin(rad) * R, k), lerp(a0, a + 180, k), 1.35, prog(t, 0.3 + id * 0.02, 0.3));
    }
    out += pop(badge('たくさん あつまると…', { fill: '#7f95a6', size: 44 }), t, c0 + 1.0, 960, 200, { end: c0 + 4.6 });
    out += tagAt(t, c0 + 5.4, 310, 230, 'あたまは そと', C.blueUi, MIC[0][0] - 84, MIC[0][1] - 84, { end: c1 + 2.6 });
    out += pop(badge('ミセル', { fill: C.redUi, size: 60, pad: 50 }), t, c1 + 0.5, 960, 190);
    out += pop(badge('うちがわに よごれを とりこむ', { fill: SP.oilInk, size: 42 }), t, tk + 1.6, 1320, 760);
    return out;
  },
});

// 9. 石けんは、油とアルカリから作る
SCENES.push({
  id: 'made',
  draw(t) {
    let out = PAPER + topBadge();
    const c1 = cue(1), c2 = cue(2), c3 = cue(3), mv = eio(prog(t, c1 + 0.1, 0.9));
    out += g(text(0, 0, 'せっけんは なにから できている？', { size: 62, w: 900 }), { x: 960, y: 220, o: win(t, 0.4, c2 - 0.3, 0.4) });
    out += g(soapBar(1), { x: lerp(960, 1660, mv), y: 500, s: lerp(2.2, 1.4, mv), o: prog(t, 0.3, 0.4) });
    out += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 1270, y: 440, o: win(t, 0.8, c1, 0.3) });
    const Y = 500, lab = (x, s, st) => g(text(0, 0, s, { size: 44, w: 900 }), { x, y: Y + 172, o: prog(t, st + 0.3, 0.4) });
    const fat = `<rect x="-78" y="-50" width="156" height="100" rx="20" fill="#fff6e6" stroke="#e3cfae" stroke-width="7"/><path d="M -50 -14 Q -20 -34 10 -12 M -20 22 Q 16 4 50 24" fill="none" stroke="#f0dfc2" stroke-width="7" stroke-linecap="round"/>`;
    const coco = `<circle cx="-24" cy="4" r="56" fill="#8a5a3a"/><circle cx="-44" cy="-10" r="7" fill="#5e3a22"/><circle cx="-18" cy="-18" r="7" fill="#5e3a22"/><circle cx="-30" cy="10" r="7" fill="#5e3a22"/>` + `<path d="M 60 -34 C 76 -10 88 4 88 20 A 28 28 0 0 1 32 20 C 32 4 44 -10 60 -34 Z" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="4"/>`;
    const flask = `<path d="M -22 -70 L 22 -70 L 22 -20 L 64 56 Q 70 70 54 70 L -54 70 Q -70 70 -64 56 L -22 -20 Z" fill="#eef3f6" stroke="#7f95a6" stroke-width="7" stroke-linejoin="round"/><path d="M -38 12 L 38 12 L 60 54 Q 64 64 54 64 L -54 64 Q -64 64 -60 54 Z" fill="#c9d6de"/><rect x="-28" y="-80" width="56" height="14" rx="6" fill="#7f95a6"/>` + g(warnIcon(0.36), { y: 34 });
    out += pop(fat, t, c1 + 0.9, 230, Y, { s: 1.5 }) + lab(230, 'うしの あぶら', c1 + 0.9);
    out += pop(coco, t, c1 + 2.2, 580, Y, { s: 1.5 }) + lab(630, 'ヤシの あぶら など', c1 + 2.2);
    out += pop(text(0, 0, '＋', { size: 110, w: 900, fill: C.muted }), t, c1 + 3.8, 918, Y);
    out += pop(flask, t, c1 + 4.2, 1100, Y, { s: 1.5 }) + lab(1100, 'アルカリ', c1 + 4.2);
    out += g(arrow(1250, Y, 1440, Y, C.ochre, 18), { o: prog(t, c1 + 5.6, 0.4) });
    out += g(text(0, 0, 'まぜて つくる', { size: 38, w: 900, fill: C.ochre }), { x: 1340, y: Y - 60, o: prog(t, c1 + 5.8, 0.4) });
    out += g(text(0, 0, 'せっけん', { size: 44, w: 900 }), { x: 1660, y: Y + 172, o: prog(t, c1 + 6.2, 0.4) });
    // 油からできていた
    const hk = prog(t, c2 + 0.4, 0.5);
    out += g(`<rect x="60" y="${Y - 150}" width="800" height="370" rx="44" fill="none" stroke="${SP.oilD}" stroke-width="10" stroke-dasharray="26 18"/>`, { o: hk });
    out += pop(badge('せっけんは あぶらから できていた！', { fill: SP.oilInk, size: 52, pad: 44 }), t, c2 + 1.2, 960, 220);
    // アルカリはあぶない
    out += g(`<circle cx="1100" cy="${Y - 4}" r="114" fill="none" stroke="${C.red}" stroke-width="10"/>`, { o: prog(t, c3 + 0.2, 0.4) });
    out += pop(g(warnIcon(0.8), { x: -640 }) + text(-580, 2, 'アルカリは あぶない くすり。せっけんづくりは まねしない', { size: 44, w: 900, anchor: 'start', fill: C.red }), t, c3 + 0.4, 960, 790);
    return out;
  },
});
const arrow = (x1, y1, x2, y2, col, w = 14) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.4, bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h;
  return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${bx - Math.sin(a) * h * 0.7} ${by + Math.cos(a) * h * 0.7} L ${bx + Math.sin(a) * h * 0.7} ${by - Math.cos(a) * h * 0.7} Z" fill="${col}" stroke="${col}" stroke-width="4" stroke-linejoin="round"/>`;
};
// ふたのしまるボトル（中心 0,0）。mode: 'mix' ふったところ / 'sep' 分かれたところ
function bottle(t, mode, shake = 0) {
  const sx = Math.sin(t * 22) * 9 * shake;
  let o = `<rect x="-26" y="-150" width="52" height="34" rx="8" fill="${C.redUi}"/>`;
  o += `<path d="M -30 -116 L 30 -116 L 62 -70 L 62 110 Q 62 130 42 130 L -42 130 Q -62 130 -62 110 L -62 -70 Z" fill="#f3f9fc" stroke="#7fa7bd" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M -58 -20 L 58 -20 L 58 108 Q 58 126 42 126 L -42 126 Q -58 126 -58 108 Z" fill="${SP.waterD}"/>`;
  if (mode === 'sep') o += `<rect x="-58" y="-50" width="116" height="34" fill="${SP.oil}"/>`;
  else { o += `<rect x="-58" y="-50" width="116" height="34" fill="${SP.waterD}"/>`; for (let i = 0; i < 16; i++) o += `<circle cx="${-46 + rnd(i, 91) * 92}" cy="${-40 + rnd(i, 92) * 150 + Math.sin(t * 5 + i) * 4}" r="${5 + rnd(i, 93) * 5}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="1.5"/>`; }
  return `<g transform="translate(${sx} 0) rotate(${sx * 0.8})">${o}</g>`;
}

// 10. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[1][1], { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['しっぽが あぶらに ささる', C.ink], ['ぐるりと とりかこむ', C.redUi], ['みずの なかへ はこぶ', C.blueUi]], t, 960, 660, { start: 2.6, step: 1.4, size: 34, gap: 26 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const items = [
        [g(bottle(0, 'mix'), { s: 0.34 }), 'おとなと、ボトルに みずと あぶらを いれ、ふたを しめて ふる', C.ink],
        [g(bottle(0, 'sep'), { s: 0.34 }), 'おいて おくと、うえと したに わかれるかな？', C.ink],
        [soapBar(0.42), 'せっけんを すこし たして ふると、どう かわる？', C.ink],
        [warnIcon(0.8), 'せっけんすいは のまない。めに いれない', C.red],
        [warnIcon(0.8), 'おわったら、てを あらう', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 190, 322 + i * 116);
      });
      // ボトルの絵：ふる → 分かれる → 石けんをたすと？
      const st = t < cue(2) ? 0 : t < cue(3) ? 1 : 2;
      let w = card(330, 420);
      w += g(bottle(t, st === 1 ? 'sep' : 'mix', st === 0 ? win(t, cue(1) + 1.0, cue(2) - 0.3, 0.3) : st === 2 ? win(t, cue(3) + 1.6, cue(4) - 0.2, 0.3) : 0), { y: 30, s: 1.1 });
      if (st === 2) w += g(soapBar(0.4), { x: 96, y: -150, o: win(t, cue(3) + 0.2, cue(3) + 1.8, 0.3) }) + g(`<circle r="46" fill="${C.ochre}"/>` + text(0, 4, '？', { size: 60, w: 900, fill: '#fff' }), { x: 110, y: -140, o: prog(t, cue(3) + 2.0, 0.4) });
      b += pop(w, t, cue(1) + 0.4, 1700, 560);
      b += kidShow('K', t, 1660, 280, { s: 0.6, start: cue(1) + 0.8, n: 0, bubble: false });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 11. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「せっけんで あらうと、どうして よごれが おちるの？」のページへ ／ 出典は 概要欄に', { size: 27, w: 700, fill: '#d9e6dc' }), { x: 1090, y: 800, o: prog(t, 2.0, 0.5) });
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
