// ---------- おなかの道具 ----------
const GT = { wall: '#e9928a', wallDark: '#c96a62', inside: '#fbe3dc', liquid: '#f2c46a', gas: '#ffffff', food: '#c9925a', blood: '#d8463c' };
// 子どもの胴（前から）。inner=1 で胃と腸が見える
function torso(t, { inner = 1, glowStomach = 0, glowGut = 0, wiggle = 0 } = {}) {
  let s = `<path d="M -220 -360 Q -260 -340 -270 -250 L -260 260 Q -250 330 -150 340 L 150 340 Q 250 330 260 260 L 270 -250 Q 260 -340 220 -360 Z" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="8"/>`;
  s += `<circle cx="0" cy="120" r="9" fill="${CH.skinShade}"/>`;
  if (inner > 0) {
    let o = '';
    // 胃（左上＝絵では右上）
    o += `<path d="M 40 -300 Q 60 -240 120 -230 Q 200 -220 200 -150 Q 195 -60 90 -50 Q 0 -45 -40 -110 Q -60 -150 -20 -170 Q 20 -190 20 -250 Q 15 -290 40 -300 Z" fill="${GT.wall}" stroke="${GT.wallDark}" stroke-width="7"/>`;
    if (glowStomach > 0) o += `<path d="M 40 -300 Q 60 -240 120 -230 Q 200 -220 200 -150 Q 195 -60 90 -50 Q 0 -45 -40 -110 Q -60 -150 -20 -170 Q 20 -190 20 -250 Q 15 -290 40 -300 Z" fill="none" stroke="#ffd76a" stroke-width="14" opacity="${glowStomach * (0.6 + 0.3 * Math.sin(t * 6))}"/>`;
    // 腸（くねくね）
    let d = 'M -40 -80';
    for (let i = 0; i < 6; i++) { const y = -30 + i * 45, sd = i % 2 ? -1 : 1; d += ` Q ${sd * 180} ${y} ${-sd * 0 + sd * 10} ${y + 22} Q ${-sd * 170} ${y + 40} ${-sd * 20} ${y + 45}`; }
    const wv = Math.sin(t * 3) * wiggle * 4;
    o += `<path d="${d}" fill="none" stroke="${GT.wallDark}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${wv})"/><path d="${d}" fill="none" stroke="${GT.wall}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${wv})"/>`;
    if (glowGut > 0) o += `<path d="${d}" fill="none" stroke="#ffd76a" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" opacity="${glowGut * (0.35 + 0.2 * Math.sin(t * 6))}" transform="translate(0 ${wv})"/>`;
    s += g(o, { o: inner });
  }
  return s;
};
// 横にのびた腸の一部。wx = しぼる位置（x）、sq = しぼる強さ
function gutTube(x0, x1, y, h, t, { wx = -1e9, sq = 0, liquid = 0.4, gas = 6, food = 0, push = 0, seed = 1 } = {}) {
  const N = 80, R = x => h / 2 * (1 - sq * Math.exp(-Math.pow((x - wx) / 70, 2)));
  let top = '', bot = '';
  for (let i = 0; i <= N; i++) { const x = lerp(x0, x1, i / N), r = R(x); top += (i ? ' L ' : 'M ') + x + ' ' + (y - r); bot = ` L ${x} ${y + r}` + bot; }
  const id = 'gt' + seed;
  let s = `<clipPath id="${id}"><path d="${top}${bot.replace(/^ L/, ' L')} Z"/></clipPath>`;
  s += `<path d="${top}${bot} Z" fill="${GT.inside}"/>`;
  s += `<g clip-path="url(#${id})">`;
  if (liquid > 0) s += `<rect x="${x0}" y="${y + h / 2 - h * liquid}" width="${x1 - x0}" height="${h * liquid}" fill="${GT.liquid}" opacity="0.85"/>`;
  for (let i = 0; i < food; i++) { const fx = lerp(x0 + 30, x1 - 30, rnd(i, seed + 3)), fy = y + (rnd(i, seed + 4) - 0.3) * h * 0.6; s += `<rect x="${fx - 18}" y="${fy - 14}" width="36" height="28" rx="8" fill="${GT.food}" transform="rotate(${rnd(i, seed + 5) * 90} ${fx} ${fy})"/>`; }
  for (let i = 0; i < gas; i++) {
    let gx = lerp(x0 + 40, x1 - 40, rnd(i, seed + 6));
    if (push > 0 && gx < wx + 40) gx = Math.min(x1 + 60, gx + push * (wx + 40 - gx) * 1.0 + push * 60);
    const gy = y - h * 0.18 + (rnd(i, seed + 7) - 0.5) * h * 0.3, r = 14 + rnd(i, seed + 8) * 16;
    s += `<circle cx="${gx}" cy="${gy}" r="${r}" fill="${GT.gas}" stroke="#e8c9c0" stroke-width="3"/>`;
  }
  s += `</g>`;
  s += `<path d="${top}" fill="none" stroke="${GT.wallDark}" stroke-width="16" stroke-linecap="round"/><path d="${bot.replace(/^ L/, 'M')}" fill="none" stroke="${GT.wallDark}" stroke-width="16" stroke-linecap="round"/>`;
  return s;
}
const soundWaves = (x, y, t, big = 1, col = C.ochre) => { let s = ''; for (let k = 0; k < 3; k++) { const p = ((t * 1.3 + k / 3) % 1); s += `<path d="M ${x + p * 120 * big} ${y - (40 + p * 50) * big} Q ${x + (30 + p * 140) * big} ${y} ${x + p * 120 * big} ${y + (40 + p * 50) * big}" fill="none" stroke="${col}" stroke-width="${8 * big}" stroke-linecap="round" opacity="${1 - p}"/>`; } return s; };
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
const clock = (h, m, s = 1) => `<g transform="scale(${s})"><circle r="80" fill="#fff" stroke="${C.ink}" stroke-width="8"/>${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<line x1="${Math.sin(a) * 64}" y1="${-Math.cos(a) * 64}" x2="${Math.sin(a) * 72}" y2="${-Math.cos(a) * 72}" stroke="${C.ink}" stroke-width="5"/>`; }).join('')}<line x1="0" y1="0" x2="${Math.sin((h + m / 60) / 12 * Math.PI * 2) * 40}" y2="${-Math.cos((h + m / 60) / 12 * Math.PI * 2) * 40}" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><line x1="0" y1="0" x2="${Math.sin(m / 60 * Math.PI * 2) * 58}" y2="${-Math.cos(m / 60 * Math.PI * 2) * 58}" stroke="${C.redUi}" stroke-width="6" stroke-linecap="round"/><circle r="8" fill="${C.ink}"/></g>`;
const guu = (x, y, t, t0, size = 90) => { const k = prog(t, t0, 0.4); return k > 0 ? g(text(0, 0, 'グー', { size, w: 900, fill: C.redUi }), { x, y: y + Math.sin(t * 20) * 3 * (1 - prog(t, t0 + 0.6, 1)), o: 1 - prog(t, t0 + 2.2, 0.5), s: lerp(0.6, 1, back(k)) }) : ''; };

// 1. つかみ：しずかなときにグー
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // へや（つくえで本を読む）
    out += `<rect x="0" y="760" width="1920" height="320" fill="#efe3cc"/><rect x="380" y="560" width="760" height="40" rx="10" fill="#c9a77c"/><rect x="420" y="600" width="30" height="200" fill="#b8946a"/><rect x="1070" y="600" width="30" height="200" fill="#b8946a"/>`;
    out += `<path d="M 600 548 L 760 530 L 760 556 L 600 560 Z M 760 530 L 920 548 L 920 560 L 760 556 Z" fill="#fff" stroke="${C.line}" stroke-width="3"/>`;
    const sT = talking('S');
    out += `<g transform="translate(1340 820) scale(0.62)">${sister(NOW.t, { pose: sT ? 'point' : 'stand', eyes: t > cue(0) + 0.6 ? 'wide' : 'open', mouth: sT ? 'open' : (t > cue(0) + 0.6 ? 'o' : 'smile'), talk: sT, look: [-6, 4] })}</g>`;
    out += `<g transform="translate(1560 820) scale(0.56)">${brother(NOW.t + 1, { pose: 'stand', eyes: t > cue(0) + 0.6 ? 'wide' : 'open', mouth: 'o', look: [-8, 4] })}</g>`;
    out += guu(1640, 480, t, cue(0) + 0.6, 100) + guu(1660, 520, t, cue(1) + 1.2, 80);
    out += g(soundWaves(1600, 650, t, 0.8), { o: win(t, cue(0) + 0.6, cue(0) + 2.8, 0.2) + win(t, cue(1) + 1.2, cue(1) + 3.4, 0.2) });
    out += g(text(0, 0, 'しーん', { size: 50, w: 900, fill: C.muted }), { x: 760, y: 360, o: win(t, 0.2, cue(0) + 0.5, 0.3) });
    out += sayBubble('S', 1180, 420, { tail: 'right' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 960, y: 300, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${GT.wallDark}">おなか</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">グー</tspan>と なる？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(torso(t, { inner: 1, glowGut: 1 }), t, t0 + 1.8, 960, 860, { s: 0.3 });
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'おなかの グーは なんの おと？', { size: 76, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'おなかの かわが、ふるえている'], ['②', 'いや ちょうが、ガスと えきたいを おしながす'], ['③', 'おなかの なかの むしが、ないている']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: i === 1 ? 42 : 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(torso(t, { inner: 0 }) + text(0, -20, '？', { size: 200, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 340, { s: 0.42 });
    out += pop(`<g transform="scale(0.5)">${sister(NOW.t, { pose: 'think', eyes: 'open', mouth: 'flat', look: [-5, -7] })}</g>`, t, 0.0, 1690, 850, { d: 0.4 });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1520, y: 720, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 胃と腸、しぼるように縮む
SCENES.push({
  id: 'tube',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      let a = g(torso(t, { inner: prog(t, cue(0) + 0.2, 0.6), glowStomach: win(t, cue(0) + 1.2, cue(1), 0.3), glowGut: win(t, cue(0) + 2.6, cue(1), 0.3) }), { x: 760, y: 470, s: 1.0 });
      a += callout(760 + 120, 470 - 160, 1250, 220, 'い', prog(t, cue(0) + 1.2, 0.3), { col: GT.wallDark, size: 54 });
      a += callout(760 + 120, 470 + 120, 1250, 560, 'ちょう', prog(t, cue(0) + 2.6, 0.3), { col: GT.wallDark, size: 54 });
      a += g(badge('かべは きんにく', { fill: GT.wallDark, size: 46 }), { x: 1460, y: 760, o: prog(t, cue(1) + 0.6, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(2) - 0.3, cue(3) - 0.2, 0.4);
    if (bO > 0) {
      const wx = lerp(260, 1700, ((t - cue(2)) * 0.28) % 1);
      let b = gutTube(160, 1760, 480, 220, t, { wx, sq: 0.75, liquid: 0.3, gas: 0, seed: 2 });
      b += g(arrow2(wx + 120, 300, wx + 300, 300, C.accent, 12), {});
      b += g(badge('ねもとから じゅんに しぼる', { fill: C.accent, size: 46 }), { x: 960, y: 170, o: prog(t, cue(2) + 0.6, 0.3) });
      out += g(b, { o: bO });
    }
    const cO = prog(t, cue(3) - 0.3, 0.4);
    if (cO > 0) {
      const sq = eio(prog(t, cue(3) + 0.6, 2.6));
      let c = `<path d="M 0 -80 L 700 -60 Q 720 0 700 60 L 0 80 Z" fill="#e8eef4" stroke="#9aa5b1" stroke-width="6" transform="scale(1 ${1 - 0.0 * sq})"/>`;
      c += `<rect x="700" y="-40" width="60" height="80" rx="10" fill="#4a7fb0"/>`;
      c += `<path d="M 760 -16 Q ${800 + sq * 260} -20 ${820 + sq * 300} 0 Q ${800 + sq * 260} 20 760 16 Z" fill="#fff" stroke="#c9d6e0" stroke-width="4"/>`;
      c += `<g transform="translate(${lerp(40, 560, sq)} 0)"><rect x="-40" y="-110" width="80" height="220" rx="36" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="6"/></g>`;
      c += `<rect x="0" y="-80" width="${lerp(40, 560, sq)}" height="160" fill="#c9d6e0" opacity="0.6"/>`;
      out += g(c, { x: 400, y: 480, o: cO });
      out += g(badge('はみがきこの チューブ と おなじ', { fill: C.blueUi, size: 46 }), { x: 960, y: 220, o: prog(t, cue(3) + 0.4, 0.3) });
    }
    return out;
  },
});

// 4. ガスと液体を押し流すとゴロゴロ
SCENES.push({
  id: 'sound',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(3) - 0.3, 0.4);
    if (aO > 0) {
      const run = t > cue(1) ? ((t - cue(1)) * 0.3) % 1.2 : -1;
      const wx = run < 0 ? -1e9 : lerp(100, 1900, run / 1.2);
      let a = gutTube(160, 1760, 480, 260, t, { wx, sq: 0.8, liquid: 0.35, gas: 9, push: run < 0 ? 0 : 1, seed: 4 });
      a += callout(560, 560, 420, 220, 'えきたい', prog(t, cue(0) + 0.8, 0.3), { col: '#c08a1a', size: 46 });
      a += callout(900, 420, 1100, 220, 'ガス', prog(t, cue(0) + 1.6, 0.3), { col: '#9a7b70', size: 46 });
      if (run >= 0) {
        const px = Math.min(1700, wx + 140);
        a += g(text(0, 0, 'ゴロゴロ', { size: 70, w: 900, fill: C.redUi }), { x: px, y: 770 + Math.sin(t * 18) * 4, o: prog(t, cue(1) + 0.8, 0.3) });
        a += soundWaves(px + 60, 480, t, 0.8);
      }
      const bT = talking('B');
      a += pop(`<g transform="scale(0.44)">${brother(NOW.t, { pose: bT ? 'cheer' : 'stand', eyes: 'smile', mouth: 'open', hop: bT ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, cue(2) - 0.8, 220, 840);
      a += sayBubble('B', 320, 600, { tail: 'left' });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(3) - 0.3, 0.4);
    if (bO > 0) {
      // 昔の人：おなかの中の虫（想像）
      let b = g(torso(t, { inner: 0 }), { x: 760, y: 500, s: 0.9 });
      const bug = `<ellipse rx="70" ry="44" fill="#9ac46a"/><circle cx="60" cy="-10" r="34" fill="#9ac46a"/><circle cx="70" cy="-20" r="8" fill="${C.ink}"/><path d="M 84 -40 q 20 -30 40 -20 M 72 -42 q 10 -36 30 -34" stroke="#6a9a3a" stroke-width="5" fill="none"/><path d="M 80 6 q 14 10 24 0" stroke="${C.ink}" stroke-width="5" fill="none"/>`;
      b += pop(bug, t, cue(3) + 0.6, 760, 520);
      b += g(text(0, 0, '♪', { size: 80, w: 900, fill: C.ochre }), { x: 900, y: 400 - ((t * 40) % 60), o: prog(t, cue(3) + 1.0, 0.3) });
      b += g(`<rect x="-300" y="-70" width="600" height="140" rx="30" fill="#fff" stroke="${C.ochre}" stroke-width="6"/>` + text(0, 2, '「はらの むしが なく」', { size: 52, w: 900, fill: C.ochre }), { x: 1400, y: 360, o: prog(t, cue(3) + 2.4, 0.3) });
      b += g(badge('むかしの ひとの かんがえ', { fill: C.muted, size: 40 }), { x: 1400, y: 200, o: prog(t, cue(3) + 0.4, 0.3) });
      b += g(text(0, 0, 'ほんとうは いや ちょうの おと', { size: 42, w: 900, fill: GT.wallDark }), { x: 1400, y: 520, o: prog(t, cue(3) + 4.0, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 5. からっぽは大きく、食べたあとはくぐもる
SCENES.push({
  id: 'empty',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const wx1 = lerp(80, 980, ((t * 0.3) % 1));
    let a = gutTube(140, 900, 400, 220, t, { wx: wx1, sq: 0.7, liquid: 0.22, gas: 5, seed: 6 });
    a += text(520, 200, 'からっぽ', { size: 56, w: 900 });
    a += g(soundWaves(920, 400, t, 1.2, C.redUi), { o: prog(t, cue(0) + 0.8, 0.3) });
    a += g(text(0, 0, 'ひびいて おおきい', { size: 44, w: 900, fill: C.redUi }), { x: 520, y: 620, o: prog(t, cue(0) + 2.4, 0.3) });
    out += pop(a, t, 0.3, 0, 0, { s: 1 });
    const bO = prog(t, cue(1) - 0.2, 0.4);
    if (bO > 0) {
      const wx2 = lerp(1020, 1920, ((t * 0.3 + 0.4) % 1));
      let b = gutTube(1080, 1820, 400, 220, t, { wx: wx2, sq: 0.5, liquid: 0.4, gas: 2, food: 9, seed: 7 });
      b += text(1450, 200, 'たべた あと', { size: 56, w: 900 });
      b += g(soundWaves(1830, 400, t, 0.45, C.muted), {});
      b += g(text(0, 0, 'くぐもって きづきにくい', { size: 44, w: 900, fill: C.muted }), { x: 1450, y: 620, o: prog(t, cue(1) + 2.4, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 6. 空腹のときの動き（3つの時期、1時間半〜2時間ごと）
SCENES.push({
  id: 'cycle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(2) - 0.3, 0.4);
    if (aO > 0) {
      let a = g(torso(t, { inner: 1, glowStomach: prog(t, cue(1) + 0.6, 0.5), glowGut: prog(t, cue(1) + 0.6, 0.5), wiggle: prog(t, cue(1) + 0.6, 0.5) }), { x: 960, y: 500, s: 0.95 });
      a += g(text(0, 0, '？', { size: 120, w: 900, fill: C.ochre }), { x: 1300, y: 260, o: win(t, cue(0) + 0.6, cue(1), 0.3) });
      a += g(badge('からっぽ → とくべつな うごき', { fill: C.accent, size: 46 }), { x: 960, y: 140, o: prog(t, cue(1) + 0.8, 0.3) });
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(2) - 0.3, cue(4) - 0.3, 0.4);
    if (bO > 0) {
      const ph = [['しずか', '#cfd8dc', cue(2) + 0.2, 0], ['ときどき', '#f2c46a', cue(2) + 2.0, 0.35], ['つよく しぼる', C.redUi, cue(2) + 3.8, 0.85]];
      let b = '';
      ph.forEach(([nm, col, st, sq], i) => {
        const k = prog(t, st, 0.4);
        if (k <= 0) return;
        const x = 380 + i * 580;
        const wx = sq > 0 ? lerp(x - 260, x + 260, ((t * 0.5 + i * 0.3) % 1)) : -1e9;
        const sqq = i === 1 ? sq * (Math.sin(t * 3) > 0.3 ? 1 : 0.2) : sq;
        b += g(gutTube(x - 230, x + 230, 470, 160, t, { wx, sq: sqq, liquid: 0.25, gas: 3, seed: 10 + i }) + badge(nm, { fill: col === '#cfd8dc' ? '#8a979e' : col, size: 44 }).replace(/^/, `<g transform="translate(${x} 280)">`) + '</g>' + text(x, 640, ['いちばん ながい', 'なかくらい', '5〜8ふんほど'][i], { size: 36, w: 900, fill: C.muted }), { o: k });
        if (i < 2) b += g(arrow2(x + 250, 470, x + 320, 470, C.muted, 8), { o: k });
      });
      out += g(b, { o: bO });
    }
    const cO = win(t, cue(3) - 0.3, cue(4) - 0.3, 0.4);
    if (cO > 0) {
      // 時間の帯
      let c = `<rect x="160" y="760" width="1600" height="16" rx="8" fill="${C.line}"/>`;
      for (let k = 0; k < 3; k++) {
        const x = 300 + k * 600;
        c += `<rect x="${x - 40}" y="740" width="80" height="56" rx="12" fill="${C.redUi}"/>` + text(x, 768, 'グー', { size: 28, w: 900, fill: '#fff' });
        if (k < 2) c += g(text(x + 300, 720, '1じかんはん〜2じかん', { size: 34, w: 900, fill: C.ochre }) + `<path d="M ${x + 50} 740 Q ${x + 300} 690 ${x + 550} 740" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="10 8"/>`, {});
      }
      out += g(c, { o: cO });
    }
    const dO = prog(t, cue(4) - 0.3, 0.4);
    if (dO > 0) {
      const wx = lerp(100, 1900, ((t - cue(4)) * 0.35) % 1);
      let d = gutTube(160, 1760, 480, 260, t, { wx, sq: 0.9, liquid: 0.3, gas: 9, push: 1, seed: 20 });
      d += guu(Math.min(1600, wx + 160), 250, t, cue(4) + 0.4, 110) + guu(Math.min(1600, wx + 160), 250, t, cue(4) + 3.0, 110);
      d += g(badge('いっきに おしながす', { fill: C.redUi, size: 46 }), { x: 960, y: 760, o: prog(t, cue(4) + 1.0, 0.3) });
      out += g(d, { o: dO });
    }
    return out;
  },
});

// 7. そうじ係
SCENES.push({
  id: 'clean',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const run = ((t - 0.4) * 0.22) % 1;
    const wx = lerp(80, 1950, run);
    let a = gutTube(160, 1760, 470, 260, t, { wx, sq: 0.9, liquid: 0.2, gas: 0, seed: 30 });
    // かす（押し流される）
    for (let i = 0; i < 12; i++) {
      let x = lerp(220, 1500, rnd(i, 31)); if (x < wx + 50) x = Math.min(1720, x + (wx + 50 - x));
      const y = 470 + (rnd(i, 32) - 0.5) * 120;
      a += `<circle cx="${x}" cy="${y}" r="${12 + rnd(i, 33) * 10}" fill="#a8835a"/>`;
    }
    out += a;
    out += callout(700, 500, 760, 760, 'しょうかしきれなかった かす', prog(t, cue(0) + 1.2, 0.3), { col: '#8a6a4a', size: 42 });
    out += g(text(0, 0, 'だいちょうの ほうへ →', { size: 44, w: 900, fill: C.muted, anchor: 'end' }), { x: 1760, y: 250, o: prog(t, cue(0) + 2.0, 0.3) });
    out += pop(badge('「そうじがかり」', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) + 0.6, 760, 200);
    const kO = prog(t, cue(2) - 0.6, 0.4);
    if (kO > 0) {
      out += g(chameleon(NOW.t, { holdLens: true, mouth: lineOf('K') ? 'open' : 'smile' }), { x: 1460, y: 830, s: 0.55, o: kO });
      out += sayBubble('K', 1540, 620, { tail: 'left' });
    }
    return out;
  },
});

// 8. 合図のホルモン
SCENES.push({
  id: 'hormone',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4) * (1 - prog(t, cue(2) - 0.3, 0.4));
    const eat = eio(prog(t, cue(2) + 0.6, 1.2));
    if (aO > 0) {
      let a = g(torso(t, { inner: 1, glowStomach: 1 - eat, wiggle: 1 - eat }), { x: 620, y: 500, s: 0.95 });
      // 血管と合図のつぶ
      a += `<path d="M 1000 160 Q 1100 500 1000 840" fill="none" stroke="${GT.blood}" stroke-width="40" stroke-linecap="round" opacity="0.85"/>`;
      const n = Math.round(lerp(10, 2, eat));
      for (let i = 0; i < n; i++) {
        const p = ((t * 0.25 + i / 10) % 1), y = lerp(840, 160, p), x = 1000 + Math.sin(p * Math.PI) * 75;
        a += `<circle cx="${x}" cy="${y}" r="14" fill="#ffe08a" stroke="#c08a1a" stroke-width="4"/>`;
        if (p > 0.3 && p < 0.7) a += `<line x1="${x}" y1="${y}" x2="${720}" y2="${360}" stroke="#ffe08a" stroke-width="3" stroke-dasharray="6 8" opacity="${0.6 * (1 - eat)}"/>`;
      }
      a += callout(1080, 500, 1300, 300, 'ホルモン（あいず）', prog(t, cue(0) + 1.2, 0.3) * (1 - eat), { col: '#c08a1a', size: 46 });
      a += g(text(0, 0, 'ちに のって はこばれる', { size: 40, w: 900, fill: GT.blood, anchor: 'start' }), { x: 1260, y: 420, o: prog(t, cue(0) + 2.4, 0.3) * (1 - eat) });
      // 食べる
      if (eat > 0) {
        a += g(`<path d="M -120 0 Q 0 110 120 0 Z" fill="#c0624c" stroke="#8a4a3a" stroke-width="5"/><ellipse cx="0" cy="-10" rx="100" ry="40" fill="#f6f1e4"/>` + [0, 1, 2].map(k => `<circle cx="${-40 + k * 40}" cy="-26" r="22" fill="#fffdf6" stroke="#e8e0cc" stroke-width="3"/>`).join(''), { x: 1460, y: 360, o: eat, s: 1.7 });
        a += g(badge('たべると あいずが さがる', { fill: C.accent, size: 44 }), { x: 1460, y: 560, o: prog(t, cue(2) + 1.6, 0.3) });
        a += g(badge('うごきが とまる', { fill: C.blueUi, size: 44 }), { x: 1460, y: 680, o: prog(t, cue(2) + 2.6, 0.3) });
      }
      out += g(a, { o: aO });
    }
    const bO = win(t, cue(1) - 0.3, cue(2) - 0.3, 0.4);
    if (bO > 0) {
      let b = pop(badge('1977ねん', { fill: C.ochre, size: 56 }), t, cue(1), 960, 260);
      b += pop(text(0, 0, 'ぐんま だいがく', { size: 60, w: 900 }), t, cue(1) + 0.8, 960, 400);
      b += pop(text(0, 0, 'いとう ぜん さんたち', { size: 60, w: 900, fill: C.blueUi }), t, cue(1) + 1.6, 960, 500);
      const dog = `<ellipse cx="0" cy="-60" rx="90" ry="50" fill="#d9b28a"/><circle cx="90" cy="-110" r="44" fill="#d9b28a"/><ellipse cx="80" cy="-150" rx="16" ry="30" fill="#b8916a" transform="rotate(-20 80 -150)"/><circle cx="104" cy="-116" r="6" fill="${C.ink}"/><circle cx="132" cy="-104" r="8" fill="${C.ink}"/>${[-60, -20, 30, 70].map(x => `<rect x="${x - 10}" y="-30" width="20" height="40" rx="8" fill="#c8a07a"/>`).join('')}<path d="M -90 -70 q -40 -30 -30 -60" stroke="#d9b28a" stroke-width="14" fill="none" stroke-linecap="round"/>`;
      b += pop(dog, t, cue(1) + 2.6, 960, 760);
      b += g(text(0, 0, 'いぬで たしかめた', { size: 44, w: 900, fill: C.muted }), { x: 1300, y: 720, o: prog(t, cue(1) + 3.0, 0.3) });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1360, 170) + `<circle cx="-590" cy="0" r="50" fill="${C.accent}"/>` + text(-590, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-510, 2, 'いや ちょうが、ガスと えきたいを おしながす', { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 300);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="70" fill="none" stroke="${C.red}" stroke-width="12"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 370, y: 300, o: ring, s: Math.max(back(ring), 0.001) });
      const wx = lerp(400, 1600, ((t * 0.35) % 1));
      a += pop(gutTube(460, 1460, 580, 160, t, { wx, sq: 0.8, liquid: 0.3, gas: 5, push: 1, seed: 40 }), t, 2.4, 0, 0);
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 170);
      const warn = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
      const items = [
        [clock(10, 10, 0.6), 'おおきな グーが なったら とけいを みる', C.ink, cue(1)],
        [clock(11, 50, 0.6), 'つぎの グーまで 1じかんはん〜2じかん？', C.ink, cue(2)],
        [warn, 'ごはんを ぬいて ためさない', C.red, cue(3)],
      ];
      items.forEach(([ic, s, col, st], i) => { b += pop(ic + text(110, 2, s, { size: 46, w: 900, anchor: 'start', fill: col }), t, st, 230, 340 + i * 150); });
      b += pop(chameleon(NOW.t, { holdLens: true }), t, cue(1) + 0.8, 1660, 820, { s: 0.75 });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「おなかの おと」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    out += pop(`<g transform="scale(0.52)">${sister(NOW.t, { pose: 'wave', eyes: 'smile', mouth: 'open', talk: talking('S') })}</g>`, t, 0.8, 150, 1060, { d: 0.45 });
    out += pop(`<g transform="scale(0.52)">${brother(NOW.t + 1, { pose: 'cheer', eyes: 'smile', mouth: 'open', hop: talking('B') ? Math.abs(Math.sin(NOW.t * 9)) * 14 : 0 })}</g>`, t, 1.0, 310, 1060, { d: 0.45 });
    out += pop(chameleon(NOW.t, { holdLens: true }), t, 1.2, 1660, 1040, { s: 0.7 });
    // 吹き出しは、しっぽの先をそれぞれの子の頭（顔）にとどかせる
    const endBubble = (who, x, y, tipX, tipY, size = 44) => {
      const L = lineOf(who); if (!L) return '';
      const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
      const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
      const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
      const dx = tipX - x, dy = tipY - y;
      let base;
      if (Math.abs(dy) - h / 2 > Math.abs(dx) - w / 2) {  // 下（上）へ出す
        const bx = Math.max(-w / 2 + 40, Math.min(w / 2 - 40, dx)), by = Math.sign(dy) * (h / 2 - 4);
        base = `${bx - 22} ${by} L ${bx + 22} ${by}`;
      } else {  // 横へ出す
        const bx = Math.sign(dx) * (w / 2 - 4), by = Math.max(-h / 2 + 30, Math.min(h / 2 - 30, dy));
        base = `${bx} ${by - 18} L ${bx} ${by + 18}`;
      }
      const body = `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff"/><path d="M ${base} L ${dx} ${dy} Z" fill="#fff"/></g>` + text(0, 2, L.text, { size, fill: C.ink });
      return g(body, { x, y, s: Math.max(k, 0.001), o });
    };
    out += endBubble('S', 185, 680, 165, 800) + endBubble('B', 575, 905, 372, 905);
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
