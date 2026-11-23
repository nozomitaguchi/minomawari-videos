// みのまわり図鑑「車に乗ると、どうして お月さまが ついてくるの？」
// 色の約束：夜空＝こい藍、月＝黄色、車＝青（右へ進む。ライトは右）、近くのもの＝緑・茶、遠くのもの＝うすい紫、見る向きの線＝オレンジ
const MF = {
  sky1: '#101938', sky2: '#22326a', sky3: '#3b4c8c', moon: '#ffd84a', moonDk: '#f0b92a',
  car: '#3f84dc', carDk: '#2a5fae', near: '#43a45a', nearDk: '#2f8747', wood: '#946a44',
  far: '#9a93cf', farDk: '#7a73b4', sight: '#ff9a2e', skin: '#f6d6bd', skinDk: '#ecc0a2',
};
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;

// ---------- 絵の道具 ----------
const nightSky = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${MF.sky1}"/><stop offset="0.62" stop-color="${MF.sky2}"/><stop offset="1" stop-color="${MF.sky3}"/></linearGradient><rect width="1920" height="1080" fill="url(#${id})"/>`;
const moonDisc = (x, y, r, { glow = 1 } = {}) =>
  `<circle cx="${x}" cy="${y}" r="${r * 2.1}" fill="${MF.moon}" opacity="${clamp(0.3 * glow)}" filter="url(#glow)"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${MF.moon}"/>` +
  [[-0.32, -0.26, 0.22], [0.3, 0.08, 0.17], [-0.1, 0.42, 0.13], [0.36, -0.42, 0.09]].map(([a, b, c]) => `<circle cx="${x + a * r}" cy="${y + b * r}" r="${c * r}" fill="${MF.moonDk}" opacity="0.55"/>`).join('') +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#lampshine)" opacity="0.4"/>`;
// 横に流れるならび：scroll（px）だけ左へ流す。items = [[x, 描く関数], ...] を period ごとにくり返す
function strip(scroll, period, items, { x0 = -420, x1 = 2340 } = {}) {
  let out = '';
  const off = ((scroll % period) + period) % period;
  for (let base = Math.floor(x0 / period) * period - period; base < x1 + period; base += period)
    items.forEach(([x, fn]) => { const X = base + x - off; if (X > x0 && X < x1) out += fn(X); });
  return out;
}
const mount = (x, y, w, h, col) => `<path d="M ${x - w / 2} ${y} Q ${x - w * 0.22} ${y - h * 0.55} ${x - w * 0.06} ${y - h * 0.96} Q ${x} ${y - h * 1.04} ${x + w * 0.06} ${y - h * 0.96} Q ${x + w * 0.22} ${y - h * 0.55} ${x + w / 2} ${y} Z" fill="${col}"/>`;
const FAR_M = [[300, 620, 210, MF.far], [760, 480, 150, MF.farDk], [1250, 700, 250, MF.far], [1800, 520, 170, MF.farDk], [2250, 560, 200, MF.far]];
const farHouse = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-34" y="-44" width="68" height="44" fill="${MF.far}"/><path d="M -44 -42 L 0 -78 L 44 -42 Z" fill="${MF.farDk}"/><rect x="-20" y="-32" width="16" height="16" fill="#ffe9a0"/><rect x="6" y="-32" width="16" height="16" fill="#ffe9a0"/></g>`;
const pole = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-300" width="16" height="300" fill="${MF.wood}"/><rect x="-62" y="-282" width="124" height="12" rx="4" fill="${MF.wood}"/><rect x="-44" y="-248" width="88" height="10" rx="4" fill="${MF.wood}"/>${[-54, 54, -36, 36].map((dx, i) => `<rect x="${dx - 5}" y="${i < 2 ? -296 : -260}" width="10" height="14" rx="3" fill="#d9d2c4"/>`).join('')}</g>`;
const fence = (scroll, y, { k = 1, period = 110 } = {}) =>
  `<rect x="0" y="${y - 58 * k}" width="1920" height="${9 * k}" fill="${MF.wood}"/><rect x="0" y="${y - 32 * k}" width="1920" height="${9 * k}" fill="${MF.wood}"/>` +
  strip(scroll, period, [[0, X => `<rect x="${X - 7 * k}" y="${y - 72 * k}" width="${14 * k}" height="${72 * k}" rx="4" fill="${MF.wood}"/>`]]);
// 左むきの矢印と名前
const arrowBadge = (str, len, col, { size = 40, dx = 0 } = {}) =>
  g(`<path d="M ${len / 2} 0 L ${-len / 2 + 26} 0" stroke="${col}" stroke-width="18" stroke-linecap="round"/><path d="M ${-len / 2 + 44} -32 L ${-len / 2} 0 L ${-len / 2 + 44} 32" fill="none" stroke="${col}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`, { x: dx }) +
  g(badge(str, { fill: col, size }), { y: -76 });
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;

// 車（横から。右へ進む。うしろの席に おとうと・おねえちゃん、前の席に運転する大人）。足もと（タイヤの下）が (0,0)
function carSide(t, { kids = true, beam = true, talkS = 0 } = {}) {
  const wheel = cx => `<g transform="translate(${cx} -48)"><circle r="48" fill="#161a26"/><circle r="26" fill="#cfd6e2"/><g transform="rotate(${(t * 500) % 360})">${[0, 60, 120].map(a => `<rect x="-3.5" y="-24" width="7" height="48" rx="3" fill="#8a93a3" transform="rotate(${a})"/>`).join('')}</g><circle r="8" fill="#4a5262"/></g>`;
  let o = `<linearGradient id="beamG" x1="0" x2="1"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.7"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></linearGradient>`;
  if (beam) o += `<path d="M 298 -130 L 720 -196 L 720 -24 L 298 -102 Z" fill="url(#beamG)"/>`;
  o += `<path d="M -300 -70 L -300 -236 Q -300 -276 -262 -280 L 120 -280 Q 150 -280 168 -258 L 232 -176 L 276 -164 Q 304 -156 304 -128 L 304 -70 Q 304 -52 286 -52 L -282 -52 Q -300 -52 -300 -70 Z" fill="${MF.car}"/>`;
  o += `<path d="M -300 -94 L 304 -94 L 304 -70 Q 304 -52 286 -52 L -282 -52 Q -300 -52 -300 -70 Z" fill="${MF.carDk}"/>`;
  const W = ['M -270 -168 L -270 -238 Q -270 -252 -256 -252 L -150 -252 L -150 -168 Z', 'M -134 -168 L -134 -252 L -10 -252 L -10 -168 Z', 'M 6 -168 L 6 -252 L 112 -252 Q 128 -252 138 -240 L 196 -168 Z'];
  W.forEach((d, i) => { o += `<clipPath id="cw${i}"><path d="${d}"/></clipPath><path d="${d}" fill="#566aa6"/>`; });
  if (kids) {
    o += `<g clip-path="url(#cw0)"><g transform="translate(-210 -100) scale(0.37)">${brother(t + 1, { eyes: 'wide', mouth: 'smile', look: [5, -8] })}</g></g>`;
    o += `<g clip-path="url(#cw1)"><g transform="translate(-72 -78) scale(0.36)">${sister(t, { eyes: 'wide', mouth: talkS ? 'open' : 'smile', look: [5, -8] })}</g></g>`;
  }
  // 運転している大人（前を向いている）
  o += `<g clip-path="url(#cw2)"><path d="M 30 -160 Q 34 -204 78 -204 Q 120 -204 126 -160 Z" fill="#8fa2d6"/><circle cx="82" cy="-222" r="24" fill="${MF.skin}"/><path d="M 58 -224 Q 54 -250 82 -250 Q 106 -250 106 -232 Q 94 -240 78 -236 Q 66 -234 58 -224 Z" fill="#3a2a22"/><circle cx="96" cy="-222" r="3.5" fill="#3a2a22"/><circle cx="156" cy="-172" r="22" fill="none" stroke="#1a2238" stroke-width="7"/></g>`;
  W.forEach(d => { o += `<path d="${d}" fill="none" stroke="${MF.carDk}" stroke-width="5" stroke-linejoin="round"/>`; });
  o += `<path d="M -142 -162 L -142 -60 M -2 -162 L -2 -60" stroke="${MF.carDk}" stroke-width="4"/>`;
  o += `<rect x="-122" y="-146" width="34" height="10" rx="5" fill="${MF.carDk}"/><rect x="18" y="-146" width="34" height="10" rx="5" fill="${MF.carDk}"/>`;
  o += `<rect x="280" y="-142" width="24" height="32" rx="10" fill="#ffe27a"/><rect x="-300" y="-152" width="14" height="42" rx="6" fill="#ff5a4a"/>`;
  o += wheel(-190) + wheel(196);
  return o;
}
const SIS_TOP = [-72, -243];   // 車の中の おねえちゃんの 頭のてっぺん（車の足もとから）
const SIS_EYE = [-72, -206];

// 走っている車を横から見た絵（つかみ・7の場面）。景色は左（うしろ）へ流れ、月は動かない
function driveShot(t, { carX = 640, carY = 836, moon = [1430, 230, 84], moonGlow = 1, talkS = 0, id = 'dv' } = {}) {
  const near = t * 640;
  let o = nightSky(id) + stars(7, 70);
  o += moonDisc(moon[0], moon[1], moon[2], { glow: moonGlow });
  o += strip(t * 9, 2600, FAR_M.map(([x, w, h, c]) => [x, X => mount(X, 668, w, h, c)]));
  o += `<rect x="0" y="664" width="1920" height="96" fill="#2b3766"/>`;
  o += strip(t * 26, 1500, [[200, X => farHouse(X, 678, 1)], [330, X => farHouse(X, 680, 0.8)], [900, X => farHouse(X, 678, 0.9)], [1240, X => tree(X, 682, 0.42, '#6a6aa8')]]);
  o += `<rect x="0" y="702" width="1920" height="60" fill="#1d284c"/>`;
  o += fence(near, 754);
  o += strip(near, 1700, [[260, X => tree(X, 758, 1.5, MF.near)], [820, X => pole(X, 758, 1)], [1280, X => tree(X, 758, 1.25, MF.nearDk)]]);
  o += `<rect x="0" y="754" width="1920" height="326" fill="#30384c"/><rect x="0" y="754" width="1920" height="8" fill="#5a6480"/>`;
  o += strip(t * 800, 240, [[0, X => `<rect x="${X}" y="884" width="120" height="10" rx="5" fill="#8f97ab"/>`]]);
  o += `<ellipse cx="${carX}" cy="${carY + 4}" rx="330" ry="16" fill="#000" opacity="0.3"/>`;
  o += g(carSide(t, { talkS }), { x: carX, y: carY });
  return o;
}
// 見る向きの線（オレンジの点線。目から相手へ流れる）
const sightLine = (x1, y1, x2, y2, t, { o = 1, k = 1, w = 9 } = {}) => {
  const xe = lerp(x1, x2, k), ye = lerp(y1, y2, k);
  return `<line x1="${x1}" y1="${y1}" x2="${xe}" y2="${ye}" stroke="${MF.sight}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="26 20" stroke-dashoffset="${-t * 70}" opacity="${o}"/>`;
};

// 1. つかみ：夜の車。木や電柱は うしろへ流れるのに、月だけ同じところ
SCENES.push({
  id: 'hook', night: true,
  draw(t) {
    const CX = 640, CY = 836, M = [1430, 230, 84];
    let out = driveShot(t, { carX: CX, carY: CY, moon: M, talkS: talking('S'), id: 'hk' }) + topBadge(true);
    // 木や電柱は うしろへ
    const a1 = win(t, cue(1) + 0.3, cueE(1) + 0.4, 0.3);
    if (a1 > 0) out += g(arrowBadge('うしろへ ながれる', 300, MF.near, { size: 42, dx: -((t * 260) % 60) }), { x: 1300, y: 600, o: a1 });
    // 月は ずっと同じところ
    const a2 = win(t, cue(2) + 0.3, cueE(4) + 0.4, 0.3);
    if (a2 > 0) {
      out += `<circle cx="${M[0]}" cy="${M[1]}" r="${M[2] + 30}" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="22 18" stroke-dashoffset="${-t * 40}" opacity="${a2 * 0.9}"/>`;
      out += pop(badge('ずっと おなじ ところ', { fill: '#b98a1e', size: 42 }), t, cue(2) + 0.8, M[0], M[1] + 180, { end: cue(4) + 0.2 });
    }
    out += talkBubble('S', CX + 60, CY - 400, CX + SIS_TOP[0], CY + SIS_TOP[1] - 4, 46);
    out += pop(text(0, 0, '？', { size: 150, w: 900, fill: '#fff' }), t, cue(4) + 0.6, M[0] - 210, M[1] + 10);
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${MF.carDk}">車</tspan>に乗ると、どうして</text>`, { x: 960, y: 400, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#d99a00">お月さま</tspan>が ついてくるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(moonDisc(0, 0, 62, { glow: 0.7 }), t, t0 + 1.7, 1240, 800);
      out += pop(g(carSide(t, { beam: false }), { s: 0.48 }), t, t0 + 1.9, 800, 900);
    }
    return out;
  },
});

// 2. 予想（正解は3番）
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'おつきさまが ついて くるのは、どうして？', { size: 62, w: 900 }), t, 0.3, 860, 215);
    const opts = [['①', 'おつきさまが、くるまを おいかけて いる'], ['②', 'くるまの まどに、おつきさまが うつって いる'], ['③', 'おつきさまが、とても とおくに ある']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 44, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
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

// 3. まどから：近いものは びゅーん、遠いものは ゆっくり
const INSIDE = `<path fill-rule="evenodd" d="M 0 0 H 1920 V 1080 H 0 Z M 190 124 H 1730 Q 1790 124 1790 184 V 800 H 130 V 184 Q 130 124 190 124 Z" fill="#161a2a"/><path d="M 190 124 H 1730 Q 1790 124 1790 184 V 800 H 130 V 184 Q 130 124 190 124 Z" fill="none" stroke="#2f3757" stroke-width="14"/><rect x="0" y="800" width="1920" height="26" fill="#2f3757"/>`;
const streak = (x, y, h) => [0, 1, 2].map(i => `<rect x="${x + 30}" y="${y + i * h / 3}" width="${260 - i * 50}" height="7" rx="3" fill="#fff" opacity="0.13"/>`).join('');
SCENES.push({
  id: 'window', night: true,
  draw(t) {
    const near = t * 1100, MX = 1540, MY = 300;
    let o = nightSky('wn') + stars(3, 60);
    o += moonDisc(MX, MY, 72);
    o += strip(t * 12, 2600, FAR_M.map(([x, w, h, c]) => [x, X => mount(X, 612, w * 1.2, h * 1.05, c)]));
    o += `<rect x="0" y="608" width="1920" height="200" fill="#2b3766"/>`;
    o += strip(t * 34, 1500, [[200, X => farHouse(X, 626, 1.3)], [340, X => farHouse(X, 628, 1.0)], [900, X => farHouse(X, 626, 1.15)], [1250, X => tree(X, 630, 0.5, '#6a6aa8')]]);
    o += `<rect x="0" y="660" width="1920" height="200" fill="#1d284c"/>`;
    o += strip(near, 1900, [[300, X => streak(X, 500, 240) + tree(X, 800, 2.4, MF.near)], [1250, X => streak(X, 440, 300) + pole(X, 800, 1.3)]]);
    o += fence(near, 806, { k: 1.4, period: 160 });
    o += `<path d="M 300 150 L 520 150 L 330 800 L 150 800 Z" fill="#fff" opacity="0.04"/>`;
    o += INSIDE + topBadge(true);
    // 近く：びゅーん
    const a0 = win(t, cue(0) + 0.5, cue(2) - 0.2, 0.3);
    if (a0 > 0) o += g(arrowBadge('ちかくの き・さく：びゅーん！', 460, MF.near, { size: 44, dx: -((t * 520) % 90) }), { x: 1020, y: 640, o: a0 });
    o += kidShow('B', t, 250, 1020, { s: 0.6, start: cue(1) - 0.7, end: cueE(1) + 0.6, n: 0 });
    // 遠く：ゆっくり
    const a2 = win(t, cue(2) + 0.4, 99, 0.3);
    if (a2 > 0) o += g(arrowBadge('とおくの いえ・やま：ゆっくり', 170, MF.farDk, { size: 44, dx: -((t * 26) % 40) }), { x: 640, y: 330, o: a2 });
    const a3 = win(t, cue(3) + 0.2, 99, 0.3);
    if (a3 > 0) {
      o += g(arrowBadge('ちかい ものほど はやい', 460, MF.near, { size: 44, dx: -((t * 520) % 90) }), { x: 1020, y: 640, o: a3 });
    }
    return o;
  },
});

// 4. 上から見た図：近い木は見える向きが大きく変わり、遠い山は少ししか変わらない
const AG = { A: [550, 745], B: [790, 745], TR: [670, 650], MT: [670, 215] };
const carTop = () => `<rect x="-64" y="-34" width="128" height="68" rx="22" fill="${MF.car}"/><rect x="-36" y="-26" width="58" height="52" rx="10" fill="#bfe3f7"/><rect x="26" y="-25" width="14" height="50" rx="6" fill="#9fd0ee"/><circle cx="60" cy="-21" r="6" fill="#ffe27a"/><circle cx="60" cy="21" r="6" fill="#ffe27a"/>`;
function dial(a1, a2) { // 角度（上が0、右が＋、度）。a1 から a2 までのあいだをぬる
  const R = 96, p = a => [Math.sin(a * Math.PI / 180) * R, -Math.cos(a * Math.PI / 180) * R];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  let o = `<circle r="${R + 14}" fill="#fff" stroke="${C.line}" stroke-width="4"/>`;
  if (Math.abs(a1 - a2) > 0.5) o += `<path d="M 0 0 L ${x1} ${y1} A ${R} ${R} 0 0 ${a2 > a1 ? 1 : 0} ${x2} ${y2} Z" fill="${MF.sight}" opacity="0.35"/>`;
  [[x1, y1], [x2, y2]].forEach(([x, y]) => { o += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${MF.sight}" stroke-width="9" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="10" fill="${MF.sight}"/>`; });
  return o + `<circle r="13" fill="${MF.car}"/>`;
}
SCENES.push({
  id: 'angle',
  draw(t) {
    const { A, B, TR, MT } = AG;
    let out = PAPER + topBadge();
    out += `<rect x="110" y="128" width="1150" height="716" rx="30" fill="#eef3e4"/>`;
    // 道
    out += `<rect x="110" y="711" width="1150" height="68" fill="#c9ccd2"/>` + Array.from({ length: 10 }, (_, i) => `<rect x="${150 + i * 116}" y="742" width="60" height="6" rx="3" fill="#fff"/>`).join('');
    // まわりの畑と、ほかの遠くの丘（かざり）
    out += [[190, 420, 300, 170, '#e2ecd0'], [960, 380, 250, 200, '#e4edd6'], [200, 610, 240, 80, '#dfe9cc'], [1010, 600, 210, 90, '#e2ecd0']].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${c}"/>`).join('');
    out += `<ellipse cx="330" cy="300" rx="120" ry="56" fill="${MF.far}" opacity="0.35"/><ellipse cx="1120" cy="350" rx="110" ry="50" fill="${MF.far}" opacity="0.35"/>`;
    // 山（上から見た形）と木
    const mo = prog(t, cue(0) + 1.2, 0.4);
    out += g(`<ellipse rx="150" ry="74" fill="${MF.far}"/><ellipse rx="100" ry="48" fill="${MF.farDk}" opacity="0.55"/><ellipse rx="50" ry="22" fill="#fff" opacity="0.5"/>`, { x: MT[0], y: MT[1], o: mo });
    out += g(text(0, 0, 'とおくの やま', { size: 40, w: 900, fill: '#5d569c', anchor: 'start' }), { x: MT[0] + 176, y: MT[1], o: mo });
    const tro = prog(t, cue(0) + 0.8, 0.4);
    out += g(text(0, 0, 'ちかくの き', { size: 40, w: 900, fill: MF.nearDk, anchor: 'start' }), { x: TR[0] + 150, y: TR[1] - 24, o: tro });
    // 車の動き：あ → い を2回（木のとき、山のとき）
    const m1 = eio(prog(t, cue(1) + 1.0, 2.2)), m2 = eio(prog(t, cue(2) + 1.0, 2.2));
    const again = t >= cue(2) - 0.45;   // 山のときは「あ」から出なおす（うしろ向きには走らせない）
    const cx = lerp(A[0], B[0], again ? m2 : m1), cy = A[1];
    const carO = Math.min(1 - prog(t, cue(2) - 0.75, 0.25) + prog(t, cue(2) - 0.45, 0.25), 1);
    // 木を見る向き
    const s1 = prog(t, cue(1) + 0.2, 0.5);
    if (s1 > 0) {
      if (m1 > 0) out += `<path d="M ${A[0]} ${A[1]} L ${TR[0]} ${TR[1]} L ${lerp(A[0], B[0], m1)} ${A[1]} Z" fill="${MF.sight}" opacity="0.3"/>`;
      out += `<line x1="${A[0]}" y1="${A[1]}" x2="${lerp(A[0], TR[0], eo(s1))}" y2="${lerp(A[1], TR[1], eo(s1))}" stroke="${MF.sight}" stroke-width="8" stroke-linecap="round" opacity="${m1 > 0 ? 0.55 : 1}"/>`;
      if (m1 > 0) out += `<line x1="${lerp(A[0], B[0], m1)}" y1="${A[1]}" x2="${TR[0]}" y2="${TR[1]}" stroke="${MF.sight}" stroke-width="8" stroke-linecap="round"/>`;
    }
    // 山を見る向き
    const s2 = prog(t, cue(2) + 0.2, 0.5);
    if (s2 > 0) {
      if (m2 > 0) out += `<path d="M ${A[0]} ${A[1]} L ${MT[0]} ${MT[1]} L ${lerp(A[0], B[0], m2)} ${A[1]} Z" fill="${MF.sight}" opacity="0.3"/>`;
      out += `<line x1="${A[0]}" y1="${A[1]}" x2="${lerp(A[0], MT[0], eo(s2))}" y2="${lerp(A[1], MT[1], eo(s2))}" stroke="${MF.sight}" stroke-width="8" stroke-linecap="round" opacity="${m2 > 0 ? 0.55 : 1}"/>`;
      if (m2 > 0) out += `<line x1="${lerp(A[0], B[0], m2)}" y1="${A[1]}" x2="${MT[0]}" y2="${MT[1]}" stroke="${MF.sight}" stroke-width="8" stroke-linecap="round"/>`;
    }
    out += g(`<circle r="50" fill="${MF.near}"/><circle cx="-14" cy="-12" r="22" fill="${MF.nearDk}" opacity="0.6"/><circle cx="16" cy="12" r="18" fill="${MF.nearDk}" opacity="0.6"/><circle r="9" fill="${MF.wood}"/>`, { x: TR[0], y: TR[1], o: tro, s: Math.max(back(tro), 0.001) });
    // あ・い の印
    const mark = (ch, x, o) => g(`<circle r="24" fill="${C.ink}"/>` + text(0, 2, ch, { size: 32, w: 900, fill: '#fff', ls: 0 }), { x, y: 812, o });
    out += mark('あ', A[0], prog(t, cue(0) + 1.6, 0.3)) + mark('い', B[0], prog(t, cue(1) + 1.0, 0.3));
    out += `<path d="M ${A[0] + 40} 812 L ${B[0] - 52} 812 M ${B[0] - 66} 800 L ${B[0] - 46} 812 L ${B[0] - 66} 824" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="${prog(t, cue(1) + 1.0, 0.3)}"/>`;
    out += g(pop(carTop(), t, 0.3, cx, cy), { o: carO });
    out += pop(badge('うえから みた ところ', { fill: C.accent, size: 38 }), t, cue(0) + 0.5, 330, 176);
    // 右：見える向きの変わりかた
    const dT = a => Math.atan2(TR[0] - a, A[1] - TR[1]) * 180 / Math.PI, dM = a => Math.atan2(MT[0] - a, A[1] - MT[1]) * 180 / Math.PI;
    const c1 = prog(t, cue(1) + 0.6, 0.5);
    if (c1 > 0) {
      let c = card(520, 300) + text(0, -112, 'ちかくの き', { size: 38, w: 900, fill: MF.nearDk });
      c += g(dial(dT(A[0]), dT(lerp(A[0], B[0], m1))), { x: -122, y: 30 });
      c += g(text(118, 4, 'むきが', { size: 34, w: 900 }) + text(118, 52, 'おおきく かわる', { size: 34, w: 900, fill: '#d9741a' }), { o: prog(t, cue(1) + 3.2, 0.4) });
      out += g(c, { x: 1580, y: 300, o: c1, s: lerp(0.95, 1, eo(c1)) });
    }
    const c2 = prog(t, cue(2) + 0.6, 0.5);
    if (c2 > 0) {
      let c = card(520, 300) + text(0, -112, 'とおくの やま', { size: 38, w: 900, fill: '#5d569c' });
      c += g(dial(dM(A[0]), dM(lerp(A[0], B[0], m2))), { x: -122, y: 30 });
      c += g(text(118, 4, 'むきは', { size: 34, w: 900 }) + text(118, 52, 'すこしだけ', { size: 34, w: 900, fill: '#d9741a' }), { o: prog(t, cue(2) + 3.2, 0.4) });
      out += g(c, { x: 1580, y: 640, o: c2, s: lerp(0.95, 1, eo(c2)) });
    }
    return out;
  },
});

// 5. 指でためす：近い指と、うでをのばした先の指
const farHand = () => `<rect x="-24" y="30" width="48" height="420" fill="${MF.skin}"/><rect x="-46" y="-34" width="92" height="78" rx="26" fill="${MF.skin}"/><rect x="-46" y="6" width="92" height="10" fill="${MF.skinDk}" opacity="0.5"/>
  <rect x="-16" y="-150" width="32" height="140" rx="16" fill="${MF.skin}"/><rect x="-9" y="-144" width="18" height="24" rx="8" fill="#fbe9dc"/><rect x="-62" y="-14" width="30" height="46" rx="15" fill="${MF.skin}"/>`;
const nearFinger = () => `<rect x="-92" y="-160" width="184" height="640" rx="92" fill="${MF.skin}"/><rect x="-58" y="-132" width="116" height="118" rx="50" fill="#fbe9dc"/>
  <path d="M -60 110 Q 0 132 60 110 M -56 146 Q 0 166 56 146" fill="none" stroke="${MF.skinDk}" stroke-width="7" stroke-linecap="round"/>`;
const dblArrow = (len, col, wd = 12) => `<path d="M ${-len / 2} 0 L ${len / 2} 0 M ${-len / 2 + 24} -20 L ${-len / 2} 0 L ${-len / 2 + 24} 20 M ${len / 2 - 24} -20 L ${len / 2} 0 L ${len / 2 - 24} 20" fill="none" stroke="${col}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"/>`;
SCENES.push({
  id: 'finger',
  draw(t) {
    let out = PAPER + topBadge();
    const X0 = 780, Y0 = 505, W = 1240, H = 570;
    const c0 = cue(0), d0 = cueE(0) - c0, tN = c0 + d0 * 0.44, tF = c0 + d0 * 0.68;
    const amp = eo(prog(t, cue(1) + 0.4, 1.0));
    const h = Math.sin((t - cue(1) - 0.4) * 2.6) * amp;   // 頭の位置（右が＋）
    const nx = -190 - h * 300, fx = 210 - h * 42;          // 指は頭と反対へずれて見える
    let c = card(W, H, { fill: '#eaf2f8' });
    c += `<clipPath id="fgc"><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="28"/></clipPath><g clip-path="url(#fgc)">`;
    // へやのかべ（動かない目じるし）
    c += `<rect x="${-W / 2}" y="150" width="${W}" height="140" fill="#e3d6bf"/>`;
    c += `<rect x="-520" y="-200" width="190" height="140" rx="8" fill="#fff" stroke="#b9a27c" stroke-width="10"/><path d="M -500 -80 L -450 -140 L -410 -100 L -380 -130 L -350 -80 Z" fill="#b7d3a8"/>`;
    c += `<circle cx="20" cy="-180" r="52" fill="#fff" stroke="#8fa6b8" stroke-width="9"/><path d="M 20 -180 L 20 -212 M 20 -180 L 42 -170" stroke="#5c6f7e" stroke-width="7" stroke-linecap="round"/>`;
    c += `<rect x="470" y="60" width="70" height="92" rx="8" fill="#c98a5c"/><ellipse cx="505" cy="14" rx="62" ry="60" fill="#6fb37a"/>`;
    c += g(farHand(), { x: fx, y: 110, o: prog(t, tF, 0.3), s: lerp(0.9, 1, eo(prog(t, tF, 0.4))) });
    c += g(nearFinger(), { x: nx, y: -20 + (1 - eo(prog(t, tN, 0.5))) * 500 });
    c += `</g>`;
    // 名前（指といっしょに動く）
    c += pop(badge('ちかい ゆび', { fill: C.redUi, size: 36 }), t, tN + 0.4, nx, 225);
    c += pop(badge('とおい ゆび', { fill: C.blueUi, size: 34 }), t, tF + 0.3, fx, -86);
    // 速さ
    const sp = prog(t, cue(1) + 1.6, 0.4);
    if (sp > 0) {
      c += g(dblArrow(600, C.redUi, 14) + text(0, -40, 'はやい！', { size: 46, w: 900, fill: C.redUi }), { x: -190, y: -212, o: sp });
      c += g(dblArrow(96, C.blueUi, 10) + text(150, 2, 'ゆっくり', { size: 38, w: 900, fill: C.blueUi }), { x: 210, y: -150, o: sp });
    }
    out += g(c, { x: X0, y: Y0, o: prog(t, 0.2, 0.4) });
    // 頭を左右に
    const ho = prog(t, cue(1) + 0.1, 0.4);
    if (ho > 0) {
      const hx = X0 + h * 150;
      out += g(dblArrow(470, C.ochre, 10), { x: X0, y: 166, o: ho * 0.6 });
      out += g(`<circle r="38" fill="${MF.skin}"/><path d="M -38 -4 Q -40 -42 0 -42 Q 40 -42 38 -4 Q 20 -24 0 -22 Q -20 -24 -38 -4 Z" fill="#4b3226"/><circle cx="-13" cy="4" r="5" fill="#3a2a22"/><circle cx="13" cy="4" r="5" fill="#3a2a22"/><path d="M -9 18 Q 0 26 9 18" fill="none" stroke="#3a2a22" stroke-width="4" stroke-linecap="round"/>`, { x: hx, y: 166, o: ho });
      out += g(text(0, 0, 'あたまを さゆうに', { size: 36, w: 900, fill: C.ochre, anchor: 'start' }), { x: X0 + 260, y: 168, o: ho });
    }
    // 右：指の置きかた
    out += pop(text(0, 0, 'ちかい ゆび', { size: 40, w: 900, fill: C.redUi }) + text(0, 52, 'かおから やく 8センチ', { size: 32, w: 700 }), t, tN + 0.2, 1660, 270);
    out += pop(text(0, 0, 'とおい ゆび', { size: 40, w: 900, fill: C.blueUi }) + text(0, 52, 'うでを のばした さき', { size: 32, w: 700 }), t, tF + 0.2, 1660, 420);
    out += kidShow('K', t, 1720, 850, { s: 0.62, start: cue(2) - 0.9, n: 0 });
    return out;
  },
});

// 6. 月は けたちがいに遠い
const earth = (x, y, r, rot = 0, id = 'ec') => `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><circle cx="${x}" cy="${y}" r="${r * 1.12}" fill="#7fc3ff" opacity="0.25"/><circle cx="${x}" cy="${y}" r="${r}" fill="#3d8fe0"/><g clip-path="url(#${id})">` +
  [[-0.5, -0.3, 0.42, 0.3], [0.35, -0.5, 0.3, 0.22], [0.2, 0.35, 0.45, 0.3], [-0.6, 0.55, 0.3, 0.2], [1.5, -0.2, 0.4, 0.3], [-1.5, 0.1, 0.42, 0.28]].map(([a, b, w, h]) => { const X = (((a + rot + 2) % 4) + 4) % 4 - 2; return `<ellipse cx="${x + X * r}" cy="${y + b * r}" rx="${w * r}" ry="${h * r}" fill="#58b368"/>`; }).join('') +
  `</g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#lampshine)" opacity="0.5"/>`;
const starsFull = (seed, n) => { let o = ''; for (let i = 0; i < n; i++) o += `<circle cx="${rnd(i, seed) * 1920}" cy="${rnd(i, seed + 1) * 1080}" r="${1.5 + rnd(i, seed + 2) * 2.5}" fill="#fff" opacity="${0.2 + rnd(i, seed + 3) * 0.5}"/>`; return o; };
SCENES.push({
  id: 'distance', night: true,
  draw(t) {
    const Y = 430, X1 = 410, X2 = 1580;
    let out = `<rect width="1920" height="1080" fill="#0d1330"/>` + starsFull(21, 110) + topBadge(true);
    out += pop(earth(0, 0, 130, 0.2, 'ecd') + text(0, 180, 'ちきゅう', { size: 42, w: 900, fill: '#cfe4ff' }), t, 0.3, 250, Y);
    out += pop(moonDisc(0, 0, 72) + text(0, 126, 'おつきさま', { size: 42, w: 900, fill: MF.moon }), t, 0.8, 1680, Y);
    out += pop(text(0, 0, '？', { size: 130, w: 900, fill: '#fff' }), t, cue(0) + 1.0, 990, Y - 20, { end: cue(1) + 0.2 });
    // きょりの線
    const lk = eo(prog(t, cue(1) + 0.1, 1.4));
    if (lk > 0) {
      out += `<line x1="${X1}" y1="${Y}" x2="${lerp(X1, X2, lk)}" y2="${Y}" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="6 22" opacity="0.9"/>`;
      out += `<path d="M ${X1} ${Y - 26} L ${X1} ${Y + 26}" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
      if (lk >= 1) out += `<path d="M ${X2} ${Y - 26} L ${X2} ${Y + 26}" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
    }
    out += pop(text(0, 0, 'やく 38まん キロメートル', { size: 84, w: 900, fill: '#fff' }), t, cue(1) + 1.0, 995, 235);
    // 車で走ると
    const d2 = cueE(2) - cue(2), ck = prog(t, cue(2) + 0.4, d2 * 0.8 - 0.4), cO = win(t, cue(2), cue(3) - 0.1, 0.3);
    if (cO > 0) {
      out += g(carSide(t, { kids: false }), { x: lerp(X1 + 60, X2 - 80, ck), y: Y - 6, s: 0.3, o: cO });
      out += g(text(0, 0, 'じそく 100キロで やすまず はしると…', { size: 46, w: 900, fill: '#cfe4ff' }), { x: 900, y: 590, o: cO });
      out += g(text(0, 0, `やく ${Math.round(160 * ck)}にち`, { size: 96, w: 900, fill: MF.moon }), { x: 900, y: 700, o: cO * prog(t, cue(2) + 0.5, 0.3) });
      out += pop(badge('はんとし ちかく！', { fill: '#b98a1e', size: 44 }), t, cue(2) + d2 * 0.8, 1640, 700, { end: cue(3) - 0.1 });
    }
    // 1キロは 38まんぶんの1
    const k3 = prog(t, cue(3) + 0.1, 0.4);
    if (k3 > 0) {
      out += g(`<rect x="${X1 - 3}" y="${Y - 34}" width="7" height="68" rx="3" fill="${MF.sight}"/><path d="M 520 548 Q 450 520 ${X1 + 12} ${Y + 46}" fill="none" stroke="${MF.sight}" stroke-width="6" stroke-linecap="round"/><path d="M ${X1 + 34} ${Y + 50} L ${X1 + 10} ${Y + 44} L ${X1 + 20} ${Y + 68}" fill="none" stroke="${MF.sight}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`, { o: k3 });
      out += pop(badge('くるまで 1キロ', { fill: '#d9741a', size: 40 }), t, cue(3) + 0.3, 560, 590);
      out += g(text(0, 0, 'おつきさままでの', { size: 46, w: 900, fill: '#cfe4ff' }), { x: 1160, y: 580, o: prog(t, cue(3) + 1.6, 0.4) });
      out += pop(text(0, 0, '38まんぶんの 1', { size: 104, w: 900, fill: MF.moon }), t, cue(3) + 2.2, 1160, 690);
      out += g(text(0, 0, '※ 1キロは ちいさすぎて、この えには かけません', { size: 30, w: 700, fill: '#aab8d8' }), { x: 1160, y: 790, o: prog(t, cue(3) + 3.0, 0.4) });
    }
    return out;
  },
});

// 7. だから月の見える向きは変わらない → ついてくるように感じる
function miniWin(id, scroll) {
  const W = 720, H = 400;
  let o = `<clipPath id="${id}"><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="26"/></clipPath><g clip-path="url(#${id})">`;
  o += `<rect x="-360" y="-200" width="720" height="400" fill="${MF.sky2}"/>`;
  for (let i = 0; i < 16; i++) o += `<circle cx="${-350 + rnd(i, 41) * 700}" cy="${-195 + rnd(i, 42) * 260}" r="${1.5 + rnd(i, 43) * 2}" fill="#fff" opacity="0.5"/>`;
  o += moonDisc(210, -95, 46, { glow: 0.6 });
  o += strip(scroll * 0.02, 900, [[100, X => mount(X, 112, 420, 150, MF.far)], [560, X => mount(X, 112, 340, 110, MF.farDk)]], { x0: -700, x1: 700 });
  o += `<rect x="-360" y="108" width="720" height="100" fill="#2b3766"/>`;
  o += strip(scroll, 2400, [[0, X => tree(X, 200, 1.7, MF.near)], [1200, X => pole(X, 200, 1.0)]], { x0: -700, x1: 700 });
  o += `</g><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="26" fill="none" stroke="#2f3757" stroke-width="16"/>`;
  return o;
}
SCENES.push({
  id: 'same', night: true,
  draw(t) {
    const CX = 560, CY = 836, M = [1440, 230, 84];
    const big = eio(prog(t, cue(4) + 0.2, 1.0));
    const pulse = 1 + big * (0.5 + 0.25 * Math.sin(t * 3));
    let out = driveShot(t, { carX: CX, carY: CY, moon: [M[0], M[1], M[2] * (1 + big * 0.12)], moonGlow: pulse, id: 'sm' }) + topBadge(true);
    // 見る向きの線（ずっと同じ向き）
    const ex = CX + SIS_EYE[0] + 26, ey = CY + SIS_EYE[1] - 30;
    const dxm = M[0] - ex, dym = M[1] - ey, dl = Math.hypot(dxm, dym), tx = M[0] - dxm / dl * (M[2] + 24), ty = M[1] - dym / dl * (M[2] + 24);
    const lo = Math.min(prog(t, cue(0) + 0.6, 0.3), 1 - prog(t, cue(4) - 0.2, 0.4));
    if (lo > 0) out += sightLine(ex, ey, tx, ty, t, { o: lo, k: eo(prog(t, cue(0) + 0.6, 1.0)) });
    out += pop(badge('みえる むきは ほとんど かわらない', { fill: '#d9741a', size: 40 }), t, cue(0) + 2.0, 1270, 566, { end: cue(1) - 0.3 });
    // 「まえ」と「すこし あと」
    const cO = win(t, cue(1) - 0.2, cue(2) - 0.2, 0.4);
    if (cO > 0) {
      const d1 = cueE(1) - cue(1), t2 = cue(1) + d1 * 0.42;
      let c = `<rect width="1920" height="1080" fill="#0d1226" opacity="0.94"/>`;
      const ring = `<circle cx="210" cy="-95" r="70" fill="none" stroke="${MF.sight}" stroke-width="8" stroke-dasharray="20 14" stroke-dashoffset="${-t * 30}"/>`;
      c += pop(miniWin('mw1', 60) + g(badge('まえ', { fill: C.accent, size: 44 }), { y: -252 }), t, cue(1) + 0.1, 500, 480);
      c += pop(miniWin('mw2', 1360) + g(badge('すこし あと', { fill: C.accent, size: 44 }), { y: -252 }), t, t2 - 0.5, 1420, 480);
      c += g(`<path d="M -56 0 L 44 0 M 14 -32 L 50 0 L 14 32" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`, { x: 960, y: 480, o: prog(t, t2 - 0.6, 0.3) });
      const ro = prog(t, t2 + 0.2, 0.3);
      c += g(ring, { x: 500, y: 480, o: ro }) + g(ring, { x: 1420, y: 480, o: ro });
      c += pop(badge('おつきさまは、まどの おなじ ところ', { fill: '#d9741a', size: 42 }), t, t2 + 0.5, 960, 132);
      c += g(text(0, 0, 'きは うしろへ ながれて、みえなく なった', { size: 40, w: 900, fill: '#cfe4ff' }), { x: 960, y: 770, o: prog(t, t2 + 0.2, 0.4) });
      out += g(c, { o: cO });
    }
    // ついてくるように感じる
    const fo = win(t, cue(2) + 0.2, cue(3) - 0.2, 0.3);
    if (fo > 0) {
      for (let i = 0; i < 3; i++) { const dx = ((t * 160 + i * 50) % 150); out += `<rect x="${M[0] - M[2] - 60 - dx}" y="${M[1] - 44 + i * 44}" width="${70 - i * 12}" height="9" rx="4" fill="#fff" opacity="${fo * (1 - dx / 150) * 0.8}"/>`; }
      out += g(badge('いっしょに ついて くる みたい！', { fill: '#b98a1e', size: 44 }), { x: 1270, y: 566, o: fo });
    }
    // 思いちがい
    out += pop(badge('ほんとうは おいかけて いない', { fill: C.blueUi, size: 42 }), t, cue(3) + 0.4, 1270, 540, { end: cue(4) - 0.2 });
    out += pop(badge('め と あたまの おもいちがい', { fill: MF.farDk, size: 42 }), t, cue(3) + 2.4, 1270, 640, { end: cue(4) - 0.2 });
    // 大きく明るく目立つ
    if (big > 0) {
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.3, r1 = M[2] * 1.12 + 34, r2 = r1 + 30 + 14 * Math.sin(t * 4 + i); out += `<line x1="${M[0] + Math.cos(a) * r1}" y1="${M[1] + Math.sin(a) * r1}" x2="${M[0] + Math.cos(a) * r2}" y2="${M[1] + Math.sin(a) * r2}" stroke="${MF.moon}" stroke-width="8" stroke-linecap="round" opacity="${big * 0.9}"/>`; }
      out += pop(badge('おおきくて あかるいから、めだつ', { fill: '#b98a1e', size: 44 }), t, cue(4) + 1.2, 1270, 566);
    }
    return out;
  },
});

// 8. 何時間も見ていると月は動く（東 → 南 → 西）。地球が回っているから
SCENES.push({
  id: 'hours', night: true,
  draw(t) {
    let out = nightSky('hr') + stars(9, 80) + topBadge(true);
    const u = 0.1 * eio(prog(t, cue(0) + 0.6, cueE(0) - cue(0))) + 0.9 * eio(prog(t, cue(1) + 0.2, cueE(1) - cue(1) + 0.3));
    const P = v => { const a = lerp(168, 12, v) * Math.PI / 180; return [960 + 770 * Math.cos(a), 800 - 600 * Math.sin(a)]; };
    // 通り道
    const po = prog(t, cue(0) + 0.4, 0.5);
    for (let i = 0; i <= 44; i++) { const v = i / 44, [x, y] = P(v); out += `<circle cx="${x}" cy="${y}" r="${v <= u ? 7 : 4.5}" fill="${v <= u ? MF.moon : '#fff'}" opacity="${po * (v <= u ? 0.85 : 0.28)}"/>`; }
    const [mx, my] = P(u);
    out += moonDisc(mx, my, 58);
    // 地面と家
    out += `<path d="M 0 770 Q 480 730 960 768 T 1920 758 L 1920 1080 L 0 1080 Z" fill="#18203e"/>`;
    out += house(760, 772, 0.9, '#39447a', '#262e58') + tree(430, 776, 0.8, '#243a52') + tree(1470, 768, 1.0, '#243a52') + tree(560, 774, 0.7, '#243a52');
    out += `<rect x="783" y="714" width="20" height="18" fill="#ffe9a0"/>`;
    // 方角
    [['ひがし', 0], ['みなみ', 0.5], ['にし', 1]].forEach(([s, v], i) => { out += pop(badge(s, { fill: 'rgba(255,250,240,0.2)', size: 34 }), t, cue(1) + [0.1, 1.6, 3.0][i], P(v)[0], 812); });
    // 時計（1まわりで12時間）
    const ck = prog(t, cue(0) + 0.3, 0.4);
    if (ck > 0) {
      let c = `<circle r="78" fill="#fffaf0" stroke="#b98a1e" stroke-width="10"/>` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<circle cx="${Math.sin(a) * 60}" cy="${-Math.cos(a) * 60}" r="${i % 3 ? 3 : 5.5}" fill="#1e1d19"/>`; }).join('');
      c += `<g transform="rotate(${180 + u * 360})"><rect x="-5" y="-44" width="10" height="50" rx="5" fill="#1e1d19"/></g><g transform="rotate(${u * 360 * 12})"><rect x="-3" y="-60" width="6" height="66" rx="3" fill="#a85a4d"/></g><circle r="7" fill="#1e1d19"/>`;
      c += text(0, 124, 'なんじかんも たつと…', { size: 36, w: 900, fill: '#fff' });
      out += g(c, { x: 590, y: 470, o: ck });
    }
    // 地球が回っている
    const eO = prog(t, cue(2) + 0.2, 0.5);
    if (eO > 0) {
      let c = `<rect x="-220" y="-190" width="440" height="380" rx="28" fill="#141c3c" stroke="#3b4c8c" stroke-width="6"/>`;
      c += earth(0, -20, 104, t * 0.55, 'ech');
      c += `<path d="M -150 -112 A 190 190 0 0 1 150 -112" fill="none" stroke="${MF.moon}" stroke-width="10" stroke-linecap="round"/><path d="M 124 -146 L 154 -110 L 108 -100" fill="none" stroke="${MF.moon}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += text(0, 142, 'ちきゅうが まわって いる', { size: 36, w: 900, fill: '#fff' });
      out += g(c, { x: 1060, y: 480, o: eO, s: lerp(0.94, 1, eo(eO)) });
    }
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
        text(-440, 2, 'おつきさまが、とても とおくに ある', { size: 52, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['ちかい ものは はやく ながれる', MF.nearDk], ['おつきさまは とても とおい', '#b98a1e'], ['だから おなじ ところに みえる', C.blueUi]], t, 960, 660, { start: 2.6, step: 1.4, size: 34, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const cmpIc = `<g transform="translate(-46 44) scale(0.3)">${pole(0, 0, 1)}</g>` + mount(4, 44, 76, 52, MF.farDk) + `<circle cx="46" cy="-22" r="19" fill="${MF.moon}"/>`;
      const qIc = `<circle r="44" fill="${C.ochre}"/>` + text(0, 3, '？', { size: 58, w: 900, fill: '#fff', ls: 0 });
      const items = [
        [cmpIc, 'でんちゅう・やま・おつきさまを みくらべる', C.ink],
        [qIc, 'どれが いちばん はやく うしろへ いくかな？', C.ink],
        [warnIcon(0.82), 'まどから かおや てを ださない', C.red],
        [warnIcon(0.82), 'シートベルトを する・うんてんの じゃまを しない', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      b += pop(g(miniWin('lkw', t * 520), { s: 0.56 }), t, cue(1) + 0.3, 1620, 330);
      b += pop(badge('おとなの うんてんで', { fill: C.accent, size: 34 }), t, cue(1) + 1.2, 1620, 500);
      b += kidShow('K', t, 1730, 828, { s: 0.7, start: cue(1) + 0.8, n: 0, enter: 'pop', bubble: false });
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
    out += g(text(0, 0, 'くわしくは サイトの「くるまに のると、どうして おつきさまが ついてくるの？」へ', { size: 32, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 778, o: prog(t, 2.0, 0.5) });
    out += g(text(0, 0, '出典は 概要欄に', { size: 30, w: 700, fill: '#d9e6dc' }), { x: 1010, y: 826, o: prog(t, 2.0, 0.5) });
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
