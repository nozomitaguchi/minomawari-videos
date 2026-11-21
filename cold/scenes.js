// みのまわり図鑑 動画「かぜをひくと、どうして体は熱を出す？」
// show(sceneIndex, t) で、その場面の t 秒目の絵を描く（毎フレーム描き直す、決まった絵になる）。

// ---------- 色 ----------
const C = {
  paper: '#fffaf0', paperSoft: '#f8f1e3', ink: '#1e1d19', muted: '#69685f', line: '#e4dccb',
  accent: '#4f6f5f', accentSoft: '#dfe9dc', blueUi: '#35657f', blueSoft: '#dce8ef',
  redUi: '#a85a4d', ochre: '#9a7438', ochreSoft: '#eee2c5',
  night: '#1b2536', night2: '#25324a',
  red: '#e8412c', yellow: '#f6b500', sig: '#00b39b', green: '#36b24a', blue: '#2f7de1',
  white: '#fffbea', housing: '#2b2f33', off: '#454b51',
};

// ---------- 時間の道具 ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, s, d) => clamp((t - s) / d);
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { const c1 = 1.9, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const win = (t, s, e, f = 0.35) => Math.min(prog(t, s, f), 1 - prog(t, e - f, f));
const mix = (c1, c2, k) => {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const a = h(c1), b = h(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join('');
};

// ---------- 絵の道具 ----------
const g = (inner, { x = 0, y = 0, s = 1, o = 1, r = 0 } = {}) =>
  o <= 0.001 ? '' : `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${clamp(o)}">${inner}</g>`;
// pop: 出てくるときに少し大きくはねる
const pop = (inner, t, start, x, y, { d = 0.55, end = 1e9, s = 1 } = {}) => {
  const k = back(prog(t, start, d));
  const o = Math.min(prog(t, start, 0.2), 1 - prog(t, end - 0.3, 0.3));
  return g(inner, { x, y, s: s * Math.max(k, 0.001), o });
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, str, { size = 48, w = 700, fill = C.ink, anchor = 'middle', ls = 0.04, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}em" dominant-baseline="middle" ${extra}>${esc(str)}</text>`;

// 文字の幅を実際にはかる（中央ぞろえのため）
function tw(str, size, w = 700, ls = 0.04) {
  const m = document.getElementById('measure');
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('font-size', size); el.setAttribute('font-weight', w); el.setAttribute('letter-spacing', ls + 'em');
  el.textContent = str; m.appendChild(el);
  const v = el.getComputedTextLength(); m.removeChild(el);
  return v;
}
// 字間は最後の文字のあとにもつくので、その半分だけ右へずらすと見た目の中央になる
const ctext = (x, y, str, o = {}) => { const size = o.size || 48, ls = o.ls ?? 0.04; return text(x + size * ls / 2, y, str, { ...o, anchor: 'middle' }); };

const DEFS = `<defs>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#3d311f" flood-opacity="0.14"/></filter>
  <linearGradient id="greenblue" x1="0" x2="1"><stop offset="0" stop-color="${C.green}"/><stop offset="0.55" stop-color="${C.sig}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>
  <radialGradient id="lampshine" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>`;

// 光るランプ
const lamp = (cx, cy, r, color, on = 1, { glow = true } = {}) => {
  const fill = on > 0 ? mix(C.off, color, on) : C.off;
  return (glow && on > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r * 1.25}" fill="${color}" opacity="${0.55 * on}" filter="url(#glow)"/>` : '') +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lampshine)" opacity="${0.35 + 0.65 * on}"/>`;
};

// 日本の横型信号（左から 青・黄・赤）。on = {g, y, r} それぞれ 0〜1
const signalH = (x, y, on, { s = 1, gColor = C.sig } = {}) => {
  const w = 420, h = 136, r = 48;
  const xs = [x + 70, x + 210, x + 350];
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${C.housing}"/>`;
  out += `<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="20" fill="none" stroke="#3a3f44" stroke-width="3"/>`;
  out += lamp(xs[0], y + h / 2, r, gColor, on.g || 0);
  out += lamp(xs[1], y + h / 2, r, C.yellow, on.y || 0);
  out += lamp(xs[2], y + h / 2, r, C.red, on.r || 0);
  // ひさし
  xs.forEach(cx => { const cy = y + h / 2; out += `<path d="M ${cx - 52.6} ${cy - 19} A 56 56 0 0 1 ${cx + 52.6} ${cy - 19}" fill="none" stroke="#15181b" stroke-width="9" stroke-linecap="round"/>`; });
  return s === 1 ? out : `<g transform="translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})">${out}</g>`;
};

// 縦型の3色信号（歴史の絵用）
const signalV = (cx, cy, on, { r = 34, gColor = C.green } = {}) => {
  const w = r * 2 + 36, h = r * 6 + 70;
  let out = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="18" fill="${C.housing}"/>`;
  out += lamp(cx, cy - r * 2 - 14, r, C.red, on.r || 0);
  out += lamp(cx, cy, r, C.yellow, on.y || 0);
  out += lamp(cx, cy + r * 2 + 14, r, gColor, on.g || 0);
  return out;
};

// 案内役のルーペ（オリジナル）
const mascot = (t, { blinkAt = [1.7, 4.9, 8.3, 12.1, 15.6, 19.4, 23.2] } = {}) => {
  const blink = blinkAt.some(b => t > b && t < b + 0.14);
  const bob = Math.sin(t * 2.4) * 6;
  const eyeH = blink ? 2 : 13;
  return `<g transform="translate(0 ${bob})">
    <rect x="44" y="58" width="26" height="110" rx="13" fill="${C.ochre}" transform="rotate(-38 57 58)"/>
    <circle cx="0" cy="0" r="86" fill="#e7f3f6" stroke="${C.blueUi}" stroke-width="16"/>
    <path d="M -46 -38 A 60 60 0 0 1 -6 -62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
    <ellipse cx="-26" cy="-4" rx="9" ry="${eyeH}" fill="${C.ink}"/>
    <ellipse cx="26" cy="-4" rx="9" ry="${eyeH}" fill="${C.ink}"/>
    <path d="M -18 26 Q 0 42 18 26" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="-50" cy="20" r="11" fill="#f1b8a8" opacity="0.8"/>
    <circle cx="50" cy="20" r="11" fill="#f1b8a8" opacity="0.8"/>
  </g>`;
};

const bubble = (w, h, str, { size = 44, tail = 'left', fill = '#fff', color = C.ink } = {}) => {
  const tl = tail === 'left' ? `M ${-w / 2 + 40} ${h / 2 - 4} L ${-w / 2 + 6} ${h / 2 + 40} L ${-w / 2 + 92} ${h / 2 - 4} Z`
    : `M ${w / 2 - 40} ${h / 2 - 4} L ${w / 2 - 6} ${h / 2 + 40} L ${w / 2 - 92} ${h / 2 - 4} Z`;
  return `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="${fill}"/><path d="${tl}" fill="${fill}"/></g>` +
    text(0, 2, str, { size, fill: color });
};

const badge = (str, { fill = C.ink, color = '#fff', size = 40, pad = 34 } = {}) => {
  const w = tw(str, size, 700, 0.04) + pad * 2;
  return `<rect x="${-w / 2}" y="${-size * 0.85}" width="${w}" height="${size * 1.7}" rx="${size * 0.85}" fill="${fill}"/>` + ctext(0, 2, str, { size, fill: color });
};

const card = (w, h, { fill = '#fff' } = {}) =>
  `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="28" fill="${fill}" filter="url(#shadow)"/>`;

const stars = (seed = 7, n = 70) => {
  let s = seed, out = '';
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) out += `<circle cx="${rnd() * 1920}" cy="${rnd() * 560}" r="${1.5 + rnd() * 2.5}" fill="#fff" opacity="${0.25 + rnd() * 0.5}"/>`;
  return out;
};

// 色の玉と名前（色見本）
const chip = (color, label, sub, { r = 64, on = 1, labelColor = C.ink, subColor = C.muted } = {}) =>
  lamp(0, 0, r, color, on) +
  text(0, r + 58, label, { size: 50, w: 900, fill: labelColor }) +
  (sub ? text(0, r + 116, sub, { size: 34, w: 500, fill: subColor }) : '');


// この動画の題（左上のバッジと、キャラクターの出かたを決める乱数のもとになる）
const TOPIC = 'かぜ';
const topBadge = (night = false) => {
  const str = 'みのまわり図鑑 ｜ ' + TOPIC, size = 30, ls = 0.06, w = tw(str, size, 700, ls) + 64;
  return `<g transform="translate(70 70)"><rect x="0" y="-34" width="${w}" height="68" rx="34" fill="${night ? 'rgba(255,250,240,0.14)' : 'rgba(255,250,240,0.82)'}"/>
   ${ctext(w / 2, 2, str, { size, w: 700, fill: night ? '#f4efe2' : C.accent, ls })}</g>`;
};

// ---------- 空の道具 ----------
const SKY = {
  dayTop: '#3f93dc', dayMid: '#86c2ef', dayBot: '#d6edfa',
  sunTop: '#36477e', sunMid: '#e9805a', sunBot: '#ffc46b',
};
const skyCols = k => [mix(SKY.dayTop, SKY.sunTop, k), mix(SKY.dayMid, SKY.sunMid, k), mix(SKY.dayBot, SKY.sunBot, k)];
function skyRect(id, k, { x = 0, y = 0, w = 1920, h = 1080, rx = 0 } = {}) {
  const [a, b, c] = skyCols(k);
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.62" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${id})"/>`;
}
// 太陽（k=0 昼の白っぽい黄色 → k=1 夕日のオレンジ）
const sunCol = k => mix('#fff3b8', '#ff7a32', k);
const sunDisc = (x, y, r, k = 0, { glow = 1 } = {}) =>
  `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${sunCol(k)}" opacity="${0.35 * glow}" filter="url(#glow)"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${sunCol(k)}"/>` +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#lampshine)" opacity="0.6"/>`;
const cloud = (x, y, s, col = '#fff', o = 0.95) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="120" ry="44" fill="${col}"/><circle cx="-46" cy="-24" r="46" fill="${col}"/><circle cx="20" cy="-40" r="58" fill="${col}"/><circle cx="72" cy="-14" r="38" fill="${col}"/></g>`;
const house = (x, y, s, wall = '#f4ead8', roof = '#c0624c') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-80" width="120" height="80" fill="${wall}"/><path d="M -78 -76 L 0 -140 L 78 -76 Z" fill="${roof}"/><rect x="-16" y="-44" width="32" height="44" fill="${mix(roof, '#000', 0.25)}"/><rect x="26" y="-64" width="22" height="20" fill="#bfe0f2"/></g>`;
const tree = (x, y, s, col = '#3f8f4a') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-60" width="18" height="60" fill="#7a5a3a"/><circle cx="0" cy="-92" r="52" fill="${col}"/><circle cx="-32" cy="-70" r="34" fill="${col}"/><circle cx="32" cy="-70" r="34" fill="${col}"/></g>`;
// 光のつぶ（色の玉）
const LIGHT = { red: '#ff4b3a', orange: '#ff9a2e', yellow: '#ffd23a', green: '#3cc35a', blue: '#2f86ff', violet: '#8a5cf0' };
const ballG = (x, y, col, r = 13) => `<circle cx="${x}" cy="${y}" r="${r * 2}" fill="${col}" opacity="0.35" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.35}" fill="#fff" opacity="0.7"/>`;
// きまった乱数
const rnd = (i, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
// ばつ印
const cross = (x, y, s = 1, col = C.red) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -60 -60 L 60 60 M 60 -60 L -60 60" stroke="${col}" stroke-width="22" stroke-linecap="round"/></g>`;
// 小さな目のアイコン
const eyeIcon = (s = 1) => `<g transform="scale(${s})"><path d="M -120 0 Q 0 -96 120 0 Q 0 96 -120 0 Z" fill="#fff" stroke="${C.ink}" stroke-width="10"/><circle r="46" fill="#6b4a2f"/><circle r="22" fill="${C.ink}"/><circle cx="-14" cy="-14" r="10" fill="#fff"/></g>`;
const lensIcon = () => `<rect x="44" y="58" width="26" height="110" rx="13" fill="${C.ochre}" transform="rotate(-38 57 58)"/>
  <circle cx="0" cy="0" r="86" fill="#e7f3f6" fill-opacity="0.85" stroke="${C.blueUi}" stroke-width="16"/>
  <path d="M -46 -38 A 60 60 0 0 1 -6 -62" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>`;

// ---------- セリフ（timeline.js の時刻） ----------
let NOW = { i: 0, t: 0 };
const SL = () => (window.TL ? TL.scenes[NOW.i].lines : []);
const cue = k => (SL()[k] ? SL()[k].start : 1e9);
const cueE = k => (SL()[k] ? SL()[k].end : 1e9);
function lineOf(who, hold = 0) { return SL().find(l => l.who === who && NOW.t >= l.start - 0.1 && NOW.t < l.end + hold) || null; }
const talking = who => { const L = lineOf(who); return L && NOW.t < L.end ? 1 : 0; };
// いま読んでいる行の番号（なければ -1）
const curLine = () => SL().findIndex(l => NOW.t >= l.start - 0.1 && NOW.t < l.end + 0.15);
function sayBubble(who, x, y, { tail = 'left', size = 46, fill = '#fff', color = C.ink } = {}) {
  const L = lineOf(who); if (!L) return '';
  const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
  const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
  const w = tw(L.text, size, 700, 0.04) + 70;
  return g(bubble(w, size * 2.3, L.text, { size, tail, fill, color }), { x, y, s: Math.max(k, 0.001), o });
}
// ---------- キャラクターの出かた（動画ごとに変わる） ----------
// VSEED は TOPIC から決まる。同じ動画なら何度書き出しても同じ、動画がちがえば出かた・動きが変わる。
const VSEED = (() => { let h = 7; for (const c of TOPIC) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; })();
const vpick = (arr, key) => arr[Math.floor(rnd(VSEED * 0.013 + key * 1.7, 3.1) * arr.length) % arr.length];
// 出てくるときの動き
const KID_ENTER = ['pop', 'slideL', 'slideR', 'rise', 'drop', 'hop', 'spin', 'stretch'];
// 吹き出しが出ているあいだ（話しているあいだ）の動き
const KID_ACT = ['bounce', 'jump', 'wave', 'sway', 'nod', 'cheer', 'look', 'shrug', 'point', 'pointL', 'spin', 'tiptoe'];
// 頭のてっぺん（足もとからの高さ。scale 1 のとき）と頭の半径
const KID_HEAD = { S: [452, 92, 360], B: [370, 88, 282], K: [250, 70, 190] };
function kidBody(who, t, o) {
  if (who === 'S') return sister(t, o);
  if (who === 'B') return brother(t + 1, o);
  return `<g transform="scale(0.9)">${chameleon(t, { holdLens: true, mouth: o.mouth === 'open' ? 'open' : 'smile' })}</g>`;
}
// 話すキャラクターの絵＋動き＋吹き出し。
//   who: 'S' おねえちゃん / 'B' おとうと / 'K' カメレオン。x, y は足もと、s は大きさ。
//   start: 出てくる秒（場面の中の t）。n: その場面で何人目か（動きの選び分けに使う）。
//   enter / act を書かなければ、動画ごとにちがう動きが自動で選ばれる。bubble: false で吹き出しなし。
//   side: 吹き出しを出す向き 'right' | 'left'（書かなければ画面の右半分なら左に出す）。
function kidShow(who, t, x, y, { s = 0.5, start = 0, n = 0, enter = null, act = null, pose = null, eyes = null, mouth = null, look = [0, 0], bubble = true, side = null, end = 1e9, size = 46 } = {}) {
  const key = NOW.i * 7 + n * 3 + (who === 'S' ? 0 : who === 'B' ? 1 : 2);
  const en = enter || vpick(KID_ENTER, key), ac = act || vpick(KID_ACT, key + 50);
  const D = 0.6, e = clamp((t - start) / D), fade = clamp((end - t) / 0.3);
  if (e <= 0 || fade <= 0) return '';
  const T = NOW.t, tk = talking(who), L = lineOf(who);
  const since = L ? T - L.start : 0;
  // 出てくる動き
  let dx = 0, dy = 0, sc = 1, rot = 0, sx = 1, o = Math.min(1, e * 3) * fade;
  if (en === 'pop') sc = back(e);
  else if (en === 'slideL' || en === 'slideR') { const from = en === 'slideL' ? -x - 300 : 2220 - x; dx = from * (1 - eo(e)); dy = -Math.abs(Math.sin(e * Math.PI * 3)) * 18 * (1 - e); sx = (en === 'slideL' ? 1 : -1) * (e < 1 ? 1 : 1); }
  else if (en === 'rise') { dy = (1 - eo(e)) * 420; }
  else if (en === 'drop') { const b = e < 0.7 ? Math.pow(e / 0.7, 2) : 1 - Math.sin((e - 0.7) / 0.3 * Math.PI) * 0.12; dy = -(1 - b) * 600; }
  else if (en === 'hop') { dx = -220 * (1 - e) * (x > 960 ? -1 : 1); dy = -Math.abs(Math.sin(e * Math.PI * 2)) * 90 * (1 - e * 0.5); }
  else if (en === 'spin') { sc = eo(e); rot = (1 - eo(e)) * -300; }
  else if (en === 'stretch') { const k = Math.sin(e * Math.PI) * 0.25; sc = eo(e); sx = 1 + k; dy = 0; o *= 1; }
  // 話しているあいだの動き
  let pose2 = pose || 'stand', eyes2 = eyes || 'open', mouth2 = mouth || 'smile', look2 = look, hop = 0;
  if (tk) {
    mouth2 = mouth || 'open';
    if (ac === 'bounce') hop = Math.abs(Math.sin(T * 9)) * 14;
    else if (ac === 'jump') { pose2 = pose || 'jump'; hop = Math.abs(Math.sin(T * 6)) * 46; eyes2 = eyes || 'smile'; }
    else if (ac === 'wave') pose2 = pose || 'wave';
    else if (ac === 'sway') rot += Math.sin(T * 3.2) * 7;
    else if (ac === 'nod') { rot += Math.sin(T * 8) * 3; hop = Math.max(0, Math.sin(T * 8)) * 6; }
    else if (ac === 'cheer') { pose2 = pose || 'cheer'; eyes2 = eyes || 'smile'; hop = Math.abs(Math.sin(T * 7)) * 18; }
    else if (ac === 'look') { pose2 = pose || 'point'; look2 = [Math.sin(T * 2.5) * 8, -4]; eyes2 = eyes || 'wide'; }
    else if (ac === 'shrug') { pose2 = pose || 'shrug'; hop = Math.max(0, Math.sin(T * 5)) * 10; }
    else if (ac === 'point') pose2 = pose || 'point';
    else if (ac === 'pointL') pose2 = pose || 'pointL';
    else if (ac === 'spin') sx *= Math.cos(clamp(since / 0.6) * Math.PI * 2);
    else if (ac === 'tiptoe') { hop = 10 + Math.sin(T * 10) * 4; rot += Math.sin(T * 5) * 3; }
  }
  if (who === 'K') sx *= x > 960 ? 1 : -1;  // カメレオンは画面の内がわを向く
  const body = `<g transform="translate(${x + dx} ${y + dy}) rotate(${rot}) scale(${s * sc * sx} ${s * sc})">${kidBody(who, T, { pose: pose2, eyes: eyes2, mouth: mouth2, look: look2, hop })}</g>`;
  let out = `<g opacity="${o}">${body}</g>`;
  if (bubble && L) {
    const [top, r] = KID_HEAD[who], sd = side || (x > 1300 ? 'left' : 'right'), dir = sd === 'right' ? 1 : -1;
    const tipX = x + dx + dir * r * s * 0.55, tipY = y + dy - (top + 12) * s - hop * s;
    const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
    out += talkBubble(who, tipX + dir * (w / 2 - 30), tipY - h / 2 - 46, tipX, tipY, size);
  }
  return out;
}
// しっぽの先を (tipX, tipY) に向けた吹き出し（話している行のあいだだけ出る）
function talkBubble(who, x, y, tipX, tipY, size = 44) {
  const L = lineOf(who); if (!L) return '';
  const k = back(clamp((NOW.t - L.start + 0.1) / 0.35));
  const o = Math.min(clamp((NOW.t - L.start + 0.1) / 0.15), clamp((L.end - NOW.t) / 0.25));
  const w = tw(L.text, size, 700, 0.04) + 70, h = size * 2.3;
  const dx = tipX - x, dy = tipY - y;
  let base;
  if (Math.abs(dy) - h / 2 > Math.abs(dx) - w / 2) {
    const bx = Math.max(-w / 2 + 40, Math.min(w / 2 - 40, dx)), by = Math.sign(dy) * (h / 2 - 4);
    base = `${bx - 22} ${by} L ${bx + 22} ${by}`;
  } else {
    const bx = Math.sign(dx) * (w / 2 - 4), by = Math.max(-h / 2 + 30, Math.min(h / 2 - 30, dy));
    base = `${bx} ${by - 18} L ${bx} ${by + 18}`;
  }
  const body = `<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff"/><path d="M ${base} L ${dx} ${dy} Z" fill="#fff"/></g>` + text(0, 2, L.text, { size, fill: C.ink });
  return g(body, { x, y, s: Math.max(k, 0.001), o });
}
// おわりの場面で、どちらの子が左に立つか（動画ごとに変わる）
const END_SWAP = rnd(VSEED * 0.013, 9.7) < 0.5;

// 横に並べたチップ（幅をはかって間をそろえる）
function chipsRow(items, t, cx, y, { size = 38, gap = 36, start = 0, step = 0.6 } = {}) {
  const ws = items.map(([s]) => tw(s, size, 700, 0.04) + 68);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = cx - total / 2, out = '';
  items.forEach(([s, col], i) => { out += pop(badge(s, { fill: col, size }), t, start + i * step, x + ws[i] / 2, y); x += ws[i] + gap; });
  return out;
}

// ---------- 場面 ----------
const SCENES = [];
// 0. オープニング（サウンドロゴに合わせる：み・の・ま・わ・り → 図鑑）
const NOTE = [0.5, 0.65, 0.8, 0.95, 1.1], ZUKAN = 1.35;
const icons = {
  signal: `<rect x="-58" y="-22" width="116" height="44" rx="12" fill="${C.housing}"/>${lamp(-34, 0, 13, C.sig, 1, { glow: false })}${lamp(0, 0, 13, C.off, 0, { glow: false })}${lamp(34, 0, 13, C.off, 0, { glow: false })}`,
  pencil: `<g transform="rotate(-35)"><rect x="-60" y="-14" width="96" height="28" fill="${C.yellow}"/><rect x="-74" y="-14" width="16" height="28" rx="4" fill="#e79aa0"/><path d="M 36 -14 L 66 0 L 36 14 Z" fill="#f1d7b0"/><path d="M 56 -5 L 66 0 L 56 5 Z" fill="${C.ink}"/></g>`,
  ant: `<circle cx="-34" cy="0" r="14" fill="${C.ink}"/><circle cx="-6" cy="2" r="11" fill="${C.ink}"/><ellipse cx="28" cy="4" rx="22" ry="16" fill="${C.ink}"/><path d="M -40 -12 L -52 -32 M -30 -12 L -24 -34 M -6 10 L -18 28 M -6 10 L 6 28 M 20 16 L 14 32 M 30 16 L 38 32" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`,
  bottle: `<rect x="-14" y="-62" width="28" height="16" rx="4" fill="${C.redUi}"/><path d="M -12 -46 L 12 -46 L 30 -14 L 30 52 Q 30 62 20 62 L -20 62 Q -30 62 -30 52 L -30 -14 Z" fill="#cfe7ef"/><rect x="-30" y="0" width="60" height="26" fill="${C.blueUi}" opacity="0.7"/>`,
  cup: `<path d="M -40 -40 L 40 -40 L 30 44 L -30 44 Z" fill="#f4c9a0"/><path d="M 38 -18 Q 66 -14 58 14 Q 52 30 34 26" fill="none" stroke="#f4c9a0" stroke-width="10"/><rect x="-40" y="-40" width="80" height="12" fill="#e3ab78"/>`,
  moon: `<path d="M 20 -48 A 50 50 0 1 0 20 48 A 38 38 0 1 1 20 -48 Z" fill="${C.yellow}"/>`,
};
SCENES.push({
  id: 'opening', dur: 4.5,
  caps: [],
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // 背景にうすい丸が広がる
    const bg = eo(prog(t, 0.0, 1.2));
    out += `<circle cx="960" cy="540" r="${1150 * bg}" fill="${C.accentSoft}"/>`;
    out += `<circle cx="960" cy="540" r="${1150 * eo(prog(t, 0.25, 1.1))}" fill="${C.paper}"/>`;
    // まわりのもの
    const ring = [['signal', 470, 260], ['pencil', 1450, 250], ['ant', 400, 800], ['bottle', 1500, 800], ['cup', 760, 860], ['moon', 1190, 190]];
    ring.forEach(([k, x, y], i) => {
      const st = ZUKAN + 0.05 + i * 0.07;
      out += pop(g(icons[k], { r: Math.sin(t * 2 + i) * 6 }), t, st, x, y + Math.sin(t * 2.2 + i) * 8, { s: 1.15 });
    });
    // み・の・ま・わ・り
    const chars = ['み', 'の', 'ま', 'わ', 'り'], cols = [C.accent, C.blueUi, C.redUi, C.ochre, C.accent];
    const x0 = 960 - 525 + 75;
    chars.forEach((ch, i) => {
      out += pop(text(0, 0, ch, { size: 150, w: 900, fill: cols[i], ls: 0 }), t, NOTE[i], x0 + i * 150, 520 - (1 - eo(prog(t, NOTE[i], 0.3))) * 60, { d: 0.45 });
    });
    // 図鑑：上から落ちてきて着地
    const zk = prog(t, ZUKAN, 0.5);
    if (zk > 0) {
      const sq = zk < 1 ? 1 + 0.18 * Math.sin(Math.PI * zk) * (zk > 0.5 ? 1 : 0) : 1;
      out += g(text(0, 0, '図鑑', { size: 168, w: 900, fill: C.ink, ls: 0 }), { x: x0 + 5 * 150 + 95, y: lerp(260, 520, eo(zk)), s: sq, o: prog(t, ZUKAN, 0.1) });
      // きらきら
      const sp = prog(t, ZUKAN + 0.35, 0.7);
      if (sp > 0 && sp < 1) for (let k = 0; k < 10; k++) {
        const a = k / 10 * Math.PI * 2, r = 150 + 140 * eo(sp);
        out += `<circle cx="${x0 + 845 + Math.cos(a) * r}" cy="${520 + Math.sin(a) * r * 0.7}" r="${9 * (1 - sp)}" fill="${[C.yellow, C.sig, C.red][k % 3]}"/>`;
      }
    }
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 46, w: 700, fill: C.muted }), { x: 960, y: 690, o: prog(t, 1.9, 0.5) });
    // ルーペ：文字が出るのにあわせてのぞきこみ、最後は右上へ
    const ci = clamp(Math.floor((t - 0.45) / 0.15), 0, 5);
    const follow = t < 0.45 ? -200 : t < 1.4 ? x0 + Math.min(ci, 4) * 150 + 30 * prog(t, 0.45 + ci * 0.15, 0.15) : x0 + 4 * 150;
    const fin = eio(prog(t, 1.5, 0.7));
    const mx = lerp(follow, 1630, fin), my = lerp(330, 470, fin);
    const wink = t > 2.6 && t < 2.85;
    const ms = lensIcon();
    out += g(ms, { x: mx, y: my, s: lerp(0.7, 0.85, fin), r: lerp(-12, 0, fin), o: prog(t, 0.2, 0.2) });
    return out;
  },
});
// ---------- かぜの道具 ----------
const SKIN = '#f6d6bd', SKIN2 = '#ecc0a2', HAIR = '#3a2a22';
const VCOL = ['#7cbf5a', '#e0a33a', '#d7685a', '#6a9fd8', '#a07ad6', '#4fb3a6'];
// ウイルス（とげのある小さなつぶ）
function virus(x, y, r, { col = VCOL[0], rot = 0, o = 1, face = true } = {}) {
  const dk = mix(col, '#000000', 0.28);
  let sp = '';
  for (let k = 0; k < 10; k++) {
    const a = k * Math.PI / 5, c = Math.cos(a), s = Math.sin(a);
    sp += `<line x1="${c * r * 0.85}" y1="${s * r * 0.85}" x2="${c * r * 1.32}" y2="${s * r * 1.32}" stroke="${dk}" stroke-width="${r * 0.16}" stroke-linecap="round"/><circle cx="${c * r * 1.36}" cy="${s * r * 1.36}" r="${r * 0.17}" fill="${dk}"/>`;
  }
  let b = `<g transform="rotate(${rot})">${sp}</g><circle r="${r}" fill="${col}"/><circle cx="${-r * 0.32}" cy="${-r * 0.34}" r="${r * 0.24}" fill="#fff" opacity="0.35"/>`;
  if (face && r > 9) b += `<circle cx="${-r * 0.3}" cy="${-r * 0.05}" r="${r * 0.12}" fill="${C.ink}"/><circle cx="${r * 0.3}" cy="${-r * 0.05}" r="${r * 0.12}" fill="${C.ink}"/><path d="M ${-r * 0.25} ${r * 0.3} Q 0 ${r * 0.48} ${r * 0.25} ${r * 0.3}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.09}" stroke-linecap="round"/>`;
  return g(b, { x, y, o });
}
// 白血球（体を守るなかま）
function wbc(x, y, r, t, { o = 1, i = 0 } = {}) {
  const w = Math.sin(t * 3 + i) * 0.05;
  let b = `<ellipse rx="${r * (1 + w)}" ry="${r * (1 - w)}" fill="#f1eafc" stroke="#b49ddc" stroke-width="${r * 0.08}"/>`;
  b += `<circle cx="${-r * 0.36}" cy="${r * 0.18}" r="${r * 0.26}" fill="#a184d6"/><circle cx="0" cy="${r * 0.34}" r="${r * 0.26}" fill="#a184d6"/><circle cx="${r * 0.36}" cy="${r * 0.18}" r="${r * 0.26}" fill="#a184d6"/>`;
  b += `<ellipse cx="${-r * 0.24}" cy="${-r * 0.32}" rx="${r * 0.09}" ry="${r * 0.13}" fill="${C.ink}"/><ellipse cx="${r * 0.24}" cy="${-r * 0.32}" rx="${r * 0.09}" ry="${r * 0.13}" fill="${C.ink}"/>`;
  b += `<path d="M ${-r * 0.16} ${-r * 0.1} Q 0 ${r * 0.02} ${r * 0.16} ${-r * 0.1}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.07}" stroke-linecap="round"/>`;
  return g(b, { x, y, o });
}
// 体温計（lv 0〜1 で赤い柱がのびる）。mark を書くと「めもり」の矢印が出る
function thermo(x, y, lv, { s = 1, mark = null, markO = 1, label = 'めもり', ticks = true } = {}) {
  let b = `<circle cx="0" cy="170" r="62" fill="#fff" stroke="${C.ink}" stroke-width="9"/><rect x="-36" y="-286" width="72" height="440" rx="36" fill="#fff" stroke="${C.ink}" stroke-width="9"/>`;
  b += `<circle cx="0" cy="170" r="53" fill="#fff"/><rect x="-27" y="-277" width="54" height="440" rx="27" fill="#fff"/>`;
  if (ticks) for (let k = 0; k < 9; k++) b += `<line x1="16" y1="${100 - k * 40}" x2="30" y2="${100 - k * 40}" stroke="#b9b2a2" stroke-width="5" stroke-linecap="round"/>`;
  const top = lerp(110, -250, clamp(lv));
  b += `<rect x="-18" y="${top}" width="36" height="${178 - top}" rx="18" fill="${C.red}"/><circle cx="0" cy="170" r="42" fill="${C.red}"/><circle cx="-14" cy="156" r="12" fill="#fff" opacity="0.45"/>`;
  if (mark !== null && markO > 0) {
    const my = lerp(110, -250, clamp(mark));
    b += g(`<path d="M -52 ${my} L -96 ${my - 26} L -96 ${my + 26} Z" fill="${C.ochre}"/>` + text(-112, my + 2, label, { size: 42, w: 900, fill: C.ochre, anchor: 'end' }), { o: markO });
  }
  return g(b, { x, y, s });
}
// 横から見た頭（右向き）。airway: 鼻とのどの道、brain: 脳、nerve: 鼻の神経
function headSide(x, y, s, t, { airway = 0, brain = 0, spot = 0, nerve = 0, flush = 0, eyes = 'open' } = {}) {
  let b = `<path d="M -250 520 Q -240 380 -90 360 L 60 360 Q 200 380 210 520 Z" fill="#e0715f"/>`;
  b += `<rect x="-70" y="120" width="120" height="260" rx="40" fill="${SKIN2}"/>`;
  b += `<path d="M 180 -36 Q 236 34 218 60 Q 206 76 176 70 Z" fill="${SKIN}"/>`;
  b += `<circle r="190" fill="${SKIN}"/>`;
  b += `<path d="M -188 40 Q -200 -150 -40 -190 Q 120 -214 186 -70 Q 120 -120 30 -120 Q -60 -110 -110 -40 Q -140 10 -150 70 Z" fill="${HAIR}"/>`;
  b += `<ellipse cx="-40" cy="30" rx="34" ry="44" fill="${SKIN2}"/>`;
  if (eyes === 'closed') b += `<path d="M 94 -28 Q 112 -16 130 -28" fill="none" stroke="${CH.line}" stroke-width="7" stroke-linecap="round"/>`;
  else b += `<ellipse cx="114" cy="-30" rx="12" ry="17" fill="${CH.line}"/><circle cx="118" cy="-36" r="5" fill="#fff"/>`;
  b += `<path d="M 130 110 Q 150 124 168 112" fill="none" stroke="${CH.line}" stroke-width="7" stroke-linecap="round"/>`;
  b += `<circle cx="120" cy="50" r="28" fill="${CH.cheek}" opacity="${0.45 + 0.5 * flush}"/>`;
  if (airway > 0) b += g(`<path d="M 204 60 L 120 34 Q 34 18 24 96 L 24 380" fill="none" stroke="#e98f9b" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/><path d="M 204 60 L 120 34 Q 34 18 24 96 L 24 380" fill="none" stroke="#f7c3c9" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`, { o: airway });
  if (brain > 0) {
    let br = `<ellipse cx="-10" cy="-70" rx="140" ry="92" fill="#f2b8c6" stroke="#d98aa0" stroke-width="7"/>`;
    br += `<path d="M -110 -90 Q -80 -130 -40 -100 Q -10 -140 30 -105 Q 70 -135 100 -90 M -120 -40 Q -80 -70 -40 -45 Q 0 -75 40 -45 Q 80 -70 112 -40" fill="none" stroke="#d98aa0" stroke-width="7" stroke-linecap="round"/>`;
    b += g(br, { o: brain });
  }
  if (spot > 0) b += g(`<circle cx="30" cy="-10" r="${34 + 6 * Math.sin(t * 5)}" fill="${C.yellow}" opacity="0.45" filter="url(#soft)"/><circle cx="30" cy="-10" r="16" fill="${C.ochre}"/>`, { o: spot });
  if (nerve > 0) b += g(`<path d="M 170 44 Q 120 10 90 -10 Q 60 -30 30 -60" fill="none" stroke="${C.yellow}" stroke-width="12" stroke-linecap="round" stroke-dasharray="20 12" stroke-dashoffset="${-t * 60}"/>`, { o: nerve });
  return g(b, { x, y, s });
}
// 指し線つきのラベル
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
// 部屋（かべ・まど・ゆか）
function room() {
  let o = `<rect width="1920" height="1080" fill="#f6ecdc"/>`;
  o += `<rect x="150" y="150" width="380" height="300" rx="16" fill="#cfe8f6" stroke="#d8c3a2" stroke-width="18"/><line x1="340" y1="150" x2="340" y2="450" stroke="#d8c3a2" stroke-width="12"/><line x1="150" y1="300" x2="530" y2="300" stroke="#d8c3a2" stroke-width="12"/>`;
  o += cloud(270, 240, 0.35, '#fff') + cloud(450, 380, 0.25, '#fff');
  o += `<rect x="0" y="780" width="1920" height="300" fill="#e2c9a3"/><rect x="0" y="780" width="1920" height="10" fill="#cfb38a"/>`;
  return o;
}
// 毛布にくるまった子（足もと x, y、大きさ s）。kidShow の絵に毛布をかぶせる
function blanket(x, y, s, k = 1) {
  const S = s / 0.62;
  const p = `M ${-84 * S} ${-120 * S} Q 0 ${-134 * S} ${84 * S} ${-120 * S} Q ${132 * S} ${-60 * S} ${124 * S} 0 L ${-124 * S} 0 Q ${-132 * S} ${-60 * S} ${-84 * S} ${-120 * S} Z`;
  let b = `<path d="${p}" fill="#6a9fd8"/>`;
  b += `<path d="M ${-112 * S} ${-62 * S} Q 0 ${-74 * S} ${112 * S} ${-62 * S} M ${-122 * S} ${-24 * S} Q 0 ${-36 * S} ${122 * S} ${-24 * S}" fill="none" stroke="#fffaf0" stroke-width="${8 * S}" opacity="0.8"/>`;
  b += `<path d="M ${-84 * S} ${-120 * S} Q 0 ${-134 * S} ${84 * S} ${-120 * S}" fill="none" stroke="#4f86c0" stroke-width="${10 * S}" stroke-linecap="round"/>`;
  return g(b, { x, y, s: Math.max(k, 0.001) });
}
// ふるえの線
const shakeLines = (x, y, h, t, o = 1, col = '#5b8fd0', w = 30) => o <= 0 ? '' : g([-1, 1].map(sd =>
  `<path d="M ${sd * w} ${-h / 2} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4} q ${sd * 14} ${h / 8} 0 ${h / 4} q ${-sd * 14} ${h / 8} 0 ${h / 4}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" transform="translate(${sd * (8 + 4 * Math.sin(t * 30))} 0)"/>` +
  `<path d="M ${sd * (w + 32)} ${-h / 3} q ${sd * 12} ${h / 10} 0 ${h / 5} q ${-sd * 12} ${h / 10} 0 ${h / 5}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" opacity="0.7"/>`).join(''), { x, y, o });
// 湯気のような「あつい」線
const heatLines = (x, y, t, o = 1) => o <= 0 ? '' : g([-36, 0, 36].map((dx, i) =>
  `<path d="M ${dx} 0 q 12 -16 0 -32 q -12 -16 0 -32" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" opacity="${0.5 + 0.5 * Math.sin(t * 5 + i)}"/>`).join(''), { x, y, o });
// 鼻の中を切って見た絵（上が鼻の中の空気、まん中が細胞、下に血の管）
function tissue(t, { cellY = 420, vein = 0, crack = 0, vx0 = 120, vx1 = 1560 } = {}) {
  const W = vx1 - vx0, n = 9, cw = W / n;
  let o = `<rect x="${vx0}" y="${cellY + 40}" width="${W}" height="${380}" rx="30" fill="#f6d3cc"/>`;
  // 血の管（vein 0〜1 でふくらむ）
  const vh = 60 + 70 * vein, vy = cellY + 210 - vein * 10;
  o += `<rect x="${vx0}" y="${vy - vh / 2}" width="${W}" height="${vh}" rx="${vh / 2}" fill="#d9504a"/><rect x="${vx0}" y="${vy - vh / 2 + 10}" width="${W}" height="${vh * 0.25}" rx="${vh * 0.12}" fill="#ef8a7f" opacity="0.6"/>`;
  for (let k = 0; k < n; k++) {
    const x = vx0 + k * cw, cr = crack * (k % 3 === 1 ? 1 : 0.6);
    const cx = x + cw / 2;
    o += `<rect x="${x + 6}" y="${cellY - 50}" width="${cw - 12}" height="100" rx="26" fill="#f7b9ad" stroke="#de8e82" stroke-width="5"/>`;
    o += `<circle cx="${cx}" cy="${cellY + 6}" r="17" fill="#c9746a"/>`;
    for (let j = 0; j < 5; j++) o += `<line x1="${x + 24 + j * (cw - 48) / 4}" y1="${cellY - 50}" x2="${x + 24 + j * (cw - 48) / 4 + 6 * Math.sin(t * 4 + j + k)}" y2="${cellY - 74}" stroke="#de8e82" stroke-width="5" stroke-linecap="round"/>`;
    if (cr > 0) o += `<path d="M ${cx - 20} ${cellY - 50} L ${cx} ${cellY - 14} L ${cx - 12} ${cellY + 14} L ${cx + 12} ${cellY + 50}" fill="none" stroke="#7a3a32" stroke-width="7" stroke-linejoin="round" opacity="${cr}"/>`;
  }
  return o;
}
// 体の形（前から）。vas: 手足の血の管の太さ（1 ふつう → 0.3 しぼる）、cold: 手足の冷たさ
function bodyFig(x, y, s, t, { vas = 1, cold = 0, warm = 0 } = {}) {
  const limb = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SKIN}" stroke-width="62" stroke-linecap="round"/>`;
  const hand = mix(SKIN, '#9cc4ec', cold);
  let b = limb(-80, -230, -170, -40) + limb(80, -230, 170, -40) + limb(-44, -30, -64, 200) + limb(44, -30, 64, 200);
  b += `<circle cx="-170" cy="-40" r="36" fill="${hand}"/><circle cx="170" cy="-40" r="36" fill="${hand}"/><ellipse cx="-70" cy="214" rx="44" ry="28" fill="${hand}"/><ellipse cx="70" cy="214" rx="44" ry="28" fill="${hand}"/>`;
  b += `<rect x="-100" y="-260" width="200" height="250" rx="70" fill="${SKIN}"/><circle cx="0" cy="-340" r="78" fill="${SKIN}"/>`;
  if (warm > 0) b += `<ellipse cx="0" cy="-140" rx="${80 + 6 * Math.sin(t * 6)}" ry="${100 + 6 * Math.sin(t * 6)}" fill="${C.red}" opacity="${0.35 * warm}" filter="url(#soft)"/>`;
  const w = 14 * vas + 3;
  const vs = [[-30, -180, -170, -40], [30, -180, 170, -40], [-20, -60, -66, 200], [20, -60, 66, 200]];
  vs.forEach(([x1, y1, x2, y2]) => { b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d9504a" stroke-width="${w}" stroke-linecap="round" opacity="0.85"/>`; });
  b += `<path d="M 0 -250 L 0 -60" stroke="#d9504a" stroke-width="18" stroke-linecap="round" opacity="0.85"/>`;
  return g(b, { x, y, s });
}
// ! の三角
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// 人のかたち（おとな・こども）
const person = (h, col) => `<circle cx="0" cy="${-h + 30}" r="${h * 0.14}" fill="${col}"/><rect x="${-h * 0.16}" y="${-h + 30 + h * 0.18}" width="${h * 0.32}" height="${h * 0.8 - 30}" rx="${h * 0.12}" fill="${col}"/>`;

// 1. つかみ：あついのに、ぶるぶる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = room();
    // 体温計のカード
    const cO = prog(t, cue(0) + 0.3, 0.5);
    if (cO > 0) {
      const lv = lerp(0.3, 0.78, eio(prog(t, cue(0) + 0.6, 2.4)));
      let c = card(380, 600) + text(0, -240, 'ねつ', { size: 52, w: 900, fill: C.red });
      c += thermo(0, 30, lv, { s: 0.82 });
      out += g(c, { x: 1530, y: 420, o: cO, s: lerp(0.94, 1, eo(cO)) });
    }
    // おとうと（毛布にくるまって、ふるえる）
    const shk = prog(t, cue(1) + 0.6, 0.3) * (1 - prog(t, cueE(3) + 0.3, 0.3));
    const jx = shk * Math.sin(t * 38) * 4;
    const BX = 1010, BY = 840, BS = 0.74;
    let bro = kidShow('B', t, BX, BY, { s: BS, start: 0, n: 1, enter: 'pop', bubble: false, mouth: 'flat', look: [-4, -2] });
    bro += blanket(BX, BY, BS, back(clamp(t / 0.6)));
    out += g(bro, { x: jx });
    out += heatLines(BX + 4, BY - 450, t, win(t, cue(0) + 0.8, cue(1) + 0.4, 0.3));
    out += pop(badge('あつい', { fill: C.red, size: 40 }), t, cue(0) + 1.4, BX + 220, BY - 470, { end: cue(1) + 0.4 });
    out += shakeLines(BX, BY - 110, 190, t, shk, '#5b8fd0', 165);
    out += pop(badge('さむい…', { fill: '#4f86c0', size: 40 }), t, cue(1) + 1.8, BX + 260, BY - 330, { end: cueE(3) + 0.4 });
    // おねえちゃん（吹き出し）
    out += kidShow('S', t, 720, BY, { s: 0.72, start: 0.3, n: 0, look: [6, -4], side: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1260, y: 260, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.accent}">かぜ</tspan>を ひくと、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.red}">ねつ</tspan>が でるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = thermo(-90, 0, 0.75, { s: 0.38 }) + virus(70, -10, 44, { col: VCOL[0] }) + text(170, -10, '？', { size: 90, w: 900, fill: C.ochre });
      out += pop(ic, t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと思う？', { size: 84, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'からだが、じぶんで ねつを つくっている'], ['②', 'ウイルスが、ねつを だしている'], ['③', 'せきを たくさんして、からだが あたたまる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(thermo(-40, 0, 0.7, { s: 0.42 }) + text(70, -60, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1720, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. かぜのもと：ウイルス
const VSPOT = [[1080, 300], [1240, 420], [1160, 560], [1340, 260], [1400, 520], [1000, 460]];
SCENES.push({
  id: 'virus',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sh = eio(prog(t, cue(1) - 0.4, 0.8));
    const HX = lerp(700, 470, sh), HY = 470, HS = lerp(1, 0.86, sh);
    const aw = prog(t, cue(0) + 1.0, 0.6);
    out += headSide(HX, HY, HS, t, { airway: aw });
    // ウイルスが鼻とのどへ
    const targets = [[204, 60], [130, 36], [60, 30], [24, 140], [24, 230], [24, 300]];
    for (let i = 0; i < 6; i++) {
      const k = eio(prog(t, cue(0) + 1.6 + i * 0.35, 1.4));
      if (k <= 0) continue;
      const [tx, ty] = targets[i];
      const ex = HX + tx * HS, ey = HY + ty * HS;
      const sx = HX + 900 + i * 40, sy = HY - 260 + i * 90;
      out += virus(lerp(sx, ex, k), lerp(sy, ey, k) + Math.sin(t * 3 + i) * 6 * (1 - k), 16, { col: VCOL[i % 3], rot: t * 40 + i * 20 });
    }
    out += callout(HX + 150 * HS, HY + 34 * HS, HX + 360 * HS, HY - 150 * HS, 'はな', aw * (1 - sh), { col: '#c25a6a', size: 42 });
    out += callout(HX + 24 * HS, HY + 250 * HS, HX + 330 * HS, HY + 230 * HS, 'のど', aw * (1 - sh), { col: '#c25a6a', size: 42 });
    out += pop(badge('ウイルス', { fill: '#5e9a3e', size: 48 }), t, cue(0) + 2.6, 1420, 210, { end: cue(1) - 0.3 });
    // 目では見えない
    const mO = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.4);
    if (mO > 0) {
      let m = `<circle r="230" fill="#fff" stroke="${C.blueUi}" stroke-width="20"/><rect x="150" y="150" width="46" height="170" rx="23" fill="${C.ochre}" transform="rotate(-45 150 150)"/>`;
      m += virus(0, 0, 90, { col: VCOL[0], rot: t * 20 });
      out += g(m, { x: 1280, y: 420, o: mO, s: lerp(0.9, 1, eo(mO)) });
      out += g(eyeIcon(0.42) + cross(0, 0, 0.6), { x: 1650, y: 210, o: prog(t, cue(1) + 1.2, 0.3) * mO });
      out += pop(badge('めでは みえない', { fill: C.blueUi, size: 44 }), t, cue(1) + 1.6, 1280, 760, { end: cue(2) - 0.2 });
    }
    // 200しゅるい いじょう
    const vO = prog(t, cue(2) - 0.1, 0.4);
    if (vO > 0) {
      for (let i = 0; i < 24; i++) {
        const k = prog(t, cue(2) + 0.1 + i * 0.07, 0.4);
        if (k <= 0) continue;
        const x = 1000 + (i % 6) * 140 + (Math.floor(i / 6) % 2) * 50, y = 290 + Math.floor(i / 6) * 120;
        out += g(virus(0, 0, 26 + (i * 7) % 14, { col: VCOL[i % 6], rot: i * 37 + t * 15, face: true }), { x, y: y + Math.sin(t * 2 + i) * 5, s: Math.max(back(k), 0.001) });
      }
      out += pop(badge('200しゅるい いじょう', { fill: C.ochre, size: 50, pad: 40 }), t, cue(2) + 1.2, 1350, 200);
      out += pop(badge('なんども かぜを ひく', { fill: C.redUi, size: 42 }), t, cue(2) + 3.4, 1350, 790);
    }
    return out;
  },
});

// 4. ウイルスは、鼻の細胞をほとんどこわさない
SCENES.push({
  id: 'cells',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fdf3ec"/>` + topBadge();
    out += `<rect x="120" y="150" width="1440" height="200" rx="30" fill="#e6f2f8"/>`;
    out += g(text(0, 0, 'はなの なかの くうき', { size: 36, w: 700, fill: '#6a8ea3' }), { x: 340, y: 200, o: prog(t, 0.3, 0.4) });
    // A こわれる？（想像）
    const q = win(t, cue(0) + 0.4, cue(1) + 0.2, 0.4);
    out += tissue(t, { cellY: 420, crack: q * eo(prog(t, cue(0) + 1.4, 0.6)) });
    out += callout(1400, 420, 1720, 300, 'さいぼう', prog(t, 0.6, 0.4), { col: '#c25a6a', size: 40 });
    // くっついたウイルス
    for (let i = 0; i < 6; i++) {
      const k = eo(prog(t, 0.4 + i * 0.2, 0.8));
      const x = 220 + i * 230, y = lerp(200, 336, k);
      out += virus(x, y + Math.sin(t * 2.4 + i) * 3, 22, { col: VCOL[i % 3], rot: t * 30 + i * 40, o: Math.min(1, k * 3) });
    }
    out += pop(badge('こわしてる？', { fill: C.redUi, size: 44 }), t, cue(0) + 1.8, 840, 750, { end: cue(1) + 0.2 });
    // B ほとんどこわれていない
    out += pop(badge('いちばん おおい かぜの ウイルス', { fill: '#5e9a3e', size: 38 }), t, cue(1) + 0.6, 840, 110, { end: cue(2) + 0.3 });
    const okO = prog(t, cue(1) + 3.2, 0.4) * (1 - prog(t, cue(2) - 0.3, 0.3));
    if (okO > 0) {
      out += g(`<circle r="58" fill="${C.accent}"/><path d="M -26 2 L -6 22 L 28 -18" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`, { x: 1700, y: 600, o: okO, s: Math.max(back(prog(t, cue(1) + 3.2, 0.4)), 0.001) });
      out += g(badge('ほとんど こわれない', { fill: C.accent, size: 46 }), { x: 840, y: 750, o: okO });
    }
    // C 体の「こたえ」
    const cO = prog(t, cue(2) - 0.1, 0.4);
    if (cO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.88 * cO}"/>`;
      let c = card(1100, 420);
      c += virus(-380, -40, 46, { col: VCOL[0], rot: t * 30 });
      c += `<path d="M -300 -40 L -200 -40 M -226 -62 L -200 -40 L -226 -18" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += bodyFig(-60, 40, 0.38, t, { warm: 0.6 });
      c += text(-60, 150, 'からだ', { size: 40, w: 900 });
      c += `<path d="M 40 -40 L 140 -40 M 114 -62 L 140 -40 L 114 -18" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += g(chipStack(t, cue(2) + 1.0), { x: 330, y: -40 });
      c += text(0, -160, 'からだの「こたえ」', { size: 56, w: 900, fill: C.accent });
      out += g(c, { x: 900, y: 460, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    return out;
  },
});
function chipStack(t, t0) {
  return pop(badge('はなみず', { fill: '#6a9fd8', size: 40 }), t, t0, 0, -70) + pop(badge('ねつ', { fill: C.red, size: 40 }), t, t0 + 0.4, 0, 30) + pop(badge('くしゃみ', { fill: C.ochre, size: 40 }), t, t0 + 0.8, 0, 130);
}

// 5. 合図の物質 → 鼻づまり → 白血球が集まる
SCENES.push({
  id: 'signal',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fdf3ec"/>` + topBadge();
    const sw = eio(prog(t, cue(1) + 0.8, 1.4));
    const cellY = 420 - 110 * sw;
    out += `<rect x="120" y="150" width="1440" height="${Math.max(10, cellY - 70 - 150)}" rx="30" fill="#e6f2f8"/>`;
    out += tissue(t, { cellY, vein: sw });
    for (let i = 0; i < 4; i++) out += virus(300 + i * 360, cellY - 84, 20, { col: VCOL[i % 3], rot: t * 30 + i * 50 });
    // 合図（ひろがる輪と星）
    const sg = prog(t, cue(0) + 1.0, 0.4);
    if (sg > 0) {
      for (let i = 0; i < 4; i++) {
        const cx = 300 + i * 360;
        for (let j = 0; j < 3; j++) {
          const ph = ((t * 0.8 + j / 3 + i * 0.13) % 1);
          out += `<circle cx="${cx}" cy="${cellY}" r="${30 + ph * 160}" fill="none" stroke="${C.yellow}" stroke-width="7" opacity="${sg * (1 - ph) * 0.9}"/>`;
        }
        for (let j = 0; j < 4; j++) {
          const ph = ((t * 0.6 + j / 4 + i * 0.21) % 1), a = j * 1.6 + i;
          const x = cx + Math.cos(a) * ph * 150, y = cellY + 60 + ph * 120 + Math.sin(a) * 20;
          out += `<path d="M ${x} ${y - 14} L ${x + 5} ${y - 5} L ${x + 14} ${y} L ${x + 5} ${y + 5} L ${x} ${y + 14} L ${x - 5} ${y + 5} L ${x - 14} ${y} L ${x - 5} ${y - 5} Z" fill="${C.yellow}" opacity="${sg * (1 - ph)}"/>`;
        }
      }
      out += pop(badge('たいへん！', { fill: C.ochre, size: 46 }), t, cue(0) + 1.6, 1720, 260, { end: cue(1) + 0.4 });
      out += pop(badge('あいずの ぶっしつ', { fill: C.ochre, size: 38 }), t, cue(0) + 3.0, 1720, 380, { end: cue(1) + 0.4 });
    }
    // 鼻がつまる
    out += callout(1400, cellY + 210 - sw * 10, 1720, 640, 'ちの くだ', prog(t, cue(1) + 0.3, 0.4) * (1 - prog(t, cue(2) - 0.3, 0.3)), { col: '#b43c36', size: 40 });
    out += pop(badge('ふくらむ', { fill: '#b43c36', size: 40 }), t, cue(1) + 1.8, 1720, 740, { end: cue(2) - 0.3 });
    out += pop(badge('はなが つまる', { fill: C.blueUi, size: 44 }), t, cue(1) + 2.6, 840, 110, { end: cue(2) + 0.2 });
    // 白血球が血の管を通って集まる
    const wO = prog(t, cue(2) - 0.2, 0.4);
    if (wO > 0) {
      const vy = cellY + 210 - sw * 10;
      for (let i = 0; i < 5; i++) {
        const st = cue(2) + 0.2 + i * 0.45, k = prog(t, st, 1.4), up = eio(prog(t, st + 1.4, 0.9));
        if (k <= 0) continue;
        const tx = 300 + i * 300;
        const x = lerp(60, tx, eio(k)), y = lerp(vy, cellY + 90, up);
        out += wbc(x, y + Math.sin(t * 3 + i) * 4, 36, t, { i, o: Math.min(1, k * 4) });
      }
      out += pop(badge('はっけっきゅう', { fill: '#8a6cc4', size: 44 }), t, cue(2) + 1.6, 840, 110);
    }
    out += kidShow('B', t, 1790, 870, { s: 0.5, start: cue(3) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 6. 鼻水は洗い流す、くしゃみは体が勝手に
SCENES.push({
  id: 'wash',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 640, HY = 430, HS = 0.95;
    const sn = prog(t, cue(1) - 0.2, 0.4);
    const sneezeT = cue(1) + 2.4, burst = prog(t, sneezeT, 0.25) * (1 - prog(t, sneezeT + 2.4, 0.5));
    const recoil = burst > 0 ? Math.sin(clamp((t - sneezeT) / 0.4) * Math.PI) * 14 : 0;
    out += g(headSide(HX, HY, HS, t, { airway: 1, nerve: win(t, cue(1) + 0.6, sneezeT + 0.6, 0.3), eyes: burst > 0.2 ? 'closed' : 'open' }), { r: -recoil * 0.3 });
    // さらさらの鼻水がウイルスを運び出す
    const NX = HX + 214 * HS, NY = HY + 66 * HS;
    const wO = win(t, cue(0) + 0.4, cue(1) - 0.2, 0.4);
    if (wO > 0) {
      for (let i = 0; i < 9; i++) {
        const ph = ((t * 0.45 + i / 9) % 1);
        const x = lerp(HX + 40 * HS, NX + 40, ph), y = ph < 0.75 ? lerp(HY + 30 * HS, NY, ph / 0.75) : NY + (ph - 0.75) * 4 * 260;
        out += `<ellipse cx="${x}" cy="${y}" rx="22" ry="28" fill="#bfe3f7" opacity="${0.85 * wO}"/>`;
        if (i % 3 === 0) out += virus(x, y, 12, { col: VCOL[i % 3], rot: t * 60, face: false, o: wO });
      }
      out += pop(badge('さらさらの はなみず', { fill: '#4f86c0', size: 44 }), t, cue(0) + 1.2, 1350, 330, { end: cue(1) - 0.2 });
      out += pop(badge('ウイルスを あらいながす', { fill: C.blueUi, size: 44 }), t, cue(0) + 3.0, 1350, 450, { end: cue(1) - 0.2 });
    }
    // くしゃみ
    if (sn > 0) {
      out += callout(HX + 110 * HS, HY + 0, 1250, 220, 'はなの しんけい', win(t, cue(1) + 0.8, sneezeT + 0.6, 0.3), { col: C.ochre, size: 40 });
      if (burst > 0) {
        const e = eo(clamp((t - sneezeT) / 0.8));
        for (let i = 0; i < 26; i++) {
          const a = (rnd(i, 3) - 0.5) * 1.0, d = 60 + e * (220 + rnd(i, 4) * 340);
          out += `<circle cx="${NX + Math.cos(a) * d}" cy="${NY + Math.sin(a) * d}" r="${5 + rnd(i, 5) * 9}" fill="#9fd0ee" opacity="${burst * (1 - e * 0.6)}"/>`;
        }
        out += g(text(0, 0, 'ハクション！', { size: 96, w: 900, fill: C.blueUi }), { x: 1350, y: 400, o: burst, s: lerp(1.3, 1, eo(clamp((t - sneezeT) / 0.3))) });
      }
      out += pop(badge('からだが かってに おこす', { fill: C.ochre, size: 44 }), t, sneezeT + 1.2, 1350, 580);
    }
    return out;
  },
});

// 7. 熱：脳の「目もり」が上がる
SCENES.push({
  id: 'fever',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 560, HY = 470, HS = 0.95;
    const br = prog(t, cue(1) - 0.2, 0.6);
    const mk = eio(prog(t, cue(2) + 2.6, 1.2));   // 目もりが上がる
    const body = eio(prog(t, cue(3) + 1.2, 3.2));  // 体温が上がる
    out += headSide(HX, HY, HS, t, { brain: br, spot: prog(t, cue(1) + 1.2, 0.4), flush: body });
    out += pop(badge('ねつは どうして？', { fill: C.red, size: 48 }), t, cue(0) + 0.3, 960, 200, { end: cue(1) - 0.2 });
    // 目もり（体温計の形で）
    const gO = prog(t, cue(1) + 1.6, 0.5);
    if (gO > 0) {
      const SX = HX + 30 * HS, SY = HY - 10 * HS;
      out += `<path d="M ${SX} ${SY} Q ${(SX + 1380) / 2} ${SY - 200} 1330 300" fill="none" stroke="${C.ochre}" stroke-width="6" stroke-dasharray="14 10" opacity="${gO}"/>`;
      let c = card(560, 680);
      c += thermo(60, 40, lerp(0.35, 0.72, body), { s: 1.0, mark: lerp(0.35, 0.78, mk), markO: 1, label: 'めもり' });
      c += g(text(60, 0, 'からだの おんど', { size: 34, w: 900, fill: C.red }), { x: 0, y: 300, o: prog(t, cue(3) + 0.6, 0.4) });
      out += g(c, { x: 1420, y: 470, o: gO, s: lerp(0.94, 1, eo(gO)) });
      out += pop(badge('たいおんを きめる「めもり」', { fill: C.ochre, size: 40 }), t, cue(1) + 2.4, 960, 200, { end: cue(2) + 0.2 });
    }
    // 合図の物質が脳へ
    const aO = win(t, cue(2) + 0.2, cue(3) + 0.4, 0.4);
    if (aO > 0) {
      for (let i = 0; i < 10; i++) {
        const ph = ((t * 0.5 + i / 10) % 1);
        const x = HX + (-20 + 30 * Math.sin(i * 2.3)) * HS, y = lerp(HY + 420 * HS, HY - 10 * HS, ph);
        out += `<path d="M ${x} ${y - 12} L ${x + 4} ${y - 4} L ${x + 12} ${y} L ${x + 4} ${y + 4} L ${x} ${y + 12} L ${x - 4} ${y + 4} L ${x - 12} ${y} L ${x - 4} ${y - 4} Z" fill="${C.yellow}" stroke="${C.ochre}" stroke-width="2" opacity="${aO * Math.min(1, (1 - ph) * 3)}"/>`;
      }
      out += pop(badge('あいずの ぶっしつ', { fill: C.ochre, size: 38 }), t, cue(2) + 0.6, 960, 200, { end: cue(3) + 0.4 });
    }
    out += pop(badge('めもりが あがる', { fill: C.red, size: 44 }), t, cue(2) + 3.4, 1420, 70, { end: cue(3) + 0.6 });
    out += pop(badge('じぶんで たいおんを あげる', { fill: C.red, size: 44 }), t, cue(3) + 1.6, 960, 200);
    out += heatLines(HX + 20, HY - 230 * HS, t, prog(t, cue(3) + 2.4, 0.5));
    return out;
  },
});

// 8. 上がりかけは寒い：血の管をしぼる・ふるえる
SCENES.push({
  id: 'shiver',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f2f6fa"/>` + topBadge();
    const lv = lerp(0.35, 0.72, eio(prog(t, cue(2) + 0.8, 5.5)));
    // 左：目もりと体温（体温計）
    let c = card(460, 680) + thermo(60, 40, lv, { s: 1.0, mark: 0.78, label: 'めもり' });
    const gap = win(t, cue(0) + 1.4, cue(1) + 0.2, 0.3);
    if (gap > 0) {
      const y1 = 40 + lerp(110, -250, 0.78), y2 = 40 + lerp(110, -250, lv);
      c += g(`<path d="M 130 ${y1} L 150 ${y1} L 150 ${y2} L 130 ${y2}" fill="none" stroke="#4f86c0" stroke-width="7"/>`, { o: gap });
    }
    out += g(c, { x: 330, y: 470 });
    out += pop(badge('まだ ひくい', { fill: '#4f86c0', size: 36 }), t, cue(0) + 1.8, 705, 330, { end: cue(1) + 0.2 });
    // 右：体
    const vas = lerp(1, 0.25, eio(prog(t, cue(1) + 1.0, 1.0)));
    const cold = eio(prog(t, cue(1) + 1.4, 1.2));
    const shk = prog(t, cue(2) + 0.2, 0.3);
    const BX = 1060 + shk * Math.sin(t * 38) * 5, BY = 560;
    out += bodyFig(BX, BY, 1.0, t, { vas, cold, warm: prog(t, cue(2) + 1.0, 0.8) });
    // 熱がにげない（手から出る熱の波に ×）
    const hO = prog(t, cue(1) + 0.4, 0.4) * (1 - prog(t, cue(2) - 0.2, 0.3));
    if (hO > 0) {
      const blk = prog(t, cue(1) + 2.2, 0.3);
      [[-1, -40], [1, -40]].forEach(([sd, hy]) => {
        const hx = BX + sd * 170;
        out += g(`<path d="M ${sd * 50} -20 q ${sd * 16} -10 ${sd * 32} 0 t ${sd * 32} 0 M ${sd * 50} 20 q ${sd * 16} -10 ${sd * 32} 0 t ${sd * 32} 0" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" opacity="${1 - blk * 0.6}"/>` + g(cross(sd * 82, 0, 0.42, C.blueUi), { o: blk }), { x: hx, y: BY + hy, o: hO });
      });
      out += pop(badge('ちの くだを しぼる', { fill: '#b43c36', size: 40 }), t, cue(1) + 1.0, 1600, 300);
      out += pop(badge('ねつを にがさない', { fill: C.blueUi, size: 40 }), t, cue(1) + 2.4, 1600, 400);
    }
    // ふるえて熱を作る
    out += shakeLines(BX, BY - 140, 300, t, shk * (1 - prog(t, cue(3) - 0.2, 0.3)), '#4f86c0', 130);
    out += pop(badge('ぶるぶる', { fill: '#4f86c0', size: 46 }), t, cue(2) + 0.4, 1600, 300, { end: cue(3) });
    out += pop(badge('ねつを つくる', { fill: C.red, size: 44 }), t, cue(2) + 1.6, 1600, 410, { end: cue(3) });
    // まとめ：手足が冷たい・寒い
    const sO = prog(t, cue(3) + 0.2, 0.4);
    if (sO > 0) {
      out += pop(badge('てあしが つめたい', { fill: '#4f86c0', size: 42 }), t, cue(3) + 0.4, 1560, 300);
      out += pop(badge('さむく かんじる', { fill: '#4f86c0', size: 42 }), t, cue(3) + 1.4, 1560, 410);
      [[-170, -40], [170, -40], [-70, 214], [70, 214]].forEach(([dx, dy], i) => {
        out += g(`<path d="M 0 -26 L 0 26 M -22 -13 L 22 13 M -22 13 L 22 -13" stroke="#7fb0e0" stroke-width="7" stroke-linecap="round"/>`, { x: BX + dx * 1.0 + (i % 2 ? 60 : -60), y: BY + dy - 50, o: prog(t, cue(3) + 0.8 + i * 0.15, 0.3), r: t * 20 });
      });
    }
    out += kidShow('S', t, 1790, 870, { s: 0.48, start: cue(4) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 9. おまけ：いつも熱が出るわけではない
SCENES.push({
  id: 'always',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(badge('かぜでも、ねつが でない ことも', { fill: C.accent, size: 46 }), t, cue(0) + 0.4, 960, 190);
    const zO = win(t, cue(0) + 0.6, cue(1) - 0.1, 0.4);
    if (zO > 0) {
      let z = card(760, 460);
      z += virus(-220, -20, 60, { col: VCOL[0], rot: t * 30 }) + text(-220, 120, 'かぜ', { size: 44, w: 900 });
      z += `<path d="M -110 -20 L -10 -20 M -36 -42 L -10 -20 L -36 2" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
      z += thermo(110, 10, 0.36, { s: 0.48 }) + text(240, -20, '？', { size: 110, w: 900, fill: C.ochre });
      out += g(z, { x: 960, y: 520, o: zO, s: lerp(0.94, 1, eo(zO)) });
    }
    const aO = prog(t, cue(1) - 0.2, 0.4);
    if (aO > 0) {
      let a = card(640, 460) + text(0, -170, 'おとな', { size: 50, w: 900 });
      a += g(person(260, '#8aa7b8'), { x: -110, y: 170 }) + thermo(120, 40, 0.38, { s: 0.42 });
      a += text(0, 200, 'たいてい ねつは でない', { size: 38, w: 900, fill: C.blueUi });
      out += g(a, { x: 560, y: 520, o: aO, s: lerp(0.94, 1, eo(aO)) });
    }
    const bO = prog(t, cue(1) + 2.6, 0.4);
    if (bO > 0) {
      let b = card(640, 460) + text(0, -170, 'ちいさい こ', { size: 50, w: 900 });
      b += g(person(170, '#e0a37a'), { x: -110, y: 130 }) + thermo(120, 40, 0.62, { s: 0.42 });
      b += `<path d="M -240 -40 a 34 34 0 1 0 34 44 a 26 26 0 1 1 -34 -44 Z" fill="${C.yellow}"/>` + text(-226, 50, 'よる', { size: 30, w: 900, fill: C.ochre });
      b += text(0, 200, 'よる、ねつが でる ことも', { size: 38, w: 900, fill: C.redUi });
      out += g(b, { x: 1300, y: 520, o: bO, s: lerp(0.94, 1, eo(bO)) });
    }
    // まだ調べている途中
    const cO = prog(t, cue(2) - 0.1, 0.4);
    if (cO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.97 * cO}"/>`;
      let c = card(1000, 400);
      c += thermo(-330, 20, 0.7, { s: 0.48 }) + text(-200, 10, '＝', { size: 70, w: 900, fill: C.muted });
      c += wbc(-60, 10, 56, t) + virus(70, 10, 34, { col: VCOL[0], rot: t * 30 });
      c += text(220, 10, '？', { size: 130, w: 900, fill: C.ochre });
      c += text(30, -160, 'ねつは たたかいに やくだつ？', { size: 46, w: 900 });
      c += g(badge('まだ しらべている とちゅう', { fill: C.ochre, size: 40 }), { x: 100, y: 150, o: prog(t, cue(2) + 2.2, 0.4) });
      out += g(c, { x: 860, y: 500, o: cO, s: lerp(0.95, 1, eo(cO)) });
    }
    out += kidShow('K', t, 1700, 880, { s: 0.5, start: cue(2) + 0.6, n: 0, bubble: false });
    return out;
  },
});

// 10. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -560;
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'からだが、じぶんで ねつを つくっている', { size: 54, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['あいずで めもりが あがる', C.ochre], ['ふるえて ねつを つくる', C.red], ['あがりかけは さむい', '#4f86c0']], t, 960, 600, { start: 2.4, step: 0.9, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [g(thermo(0, 0, 0.6, { s: 0.2, ticks: false }), { x: -20 }) + g(blanketIcon(), { x: 30, y: 10 }), 'ねつの あがりかけ、さむがって いないか', C.ink, cue(1)],
        [g(thermo(0, 0, 0.5, { s: 0.2, ticks: false }), { x: -26 }) + `<circle cx="30" cy="-20" r="16" fill="#f6b500"/><path d="M 30 14 a 14 14 0 1 0 14 18 a 10 10 0 1 1 -14 -18 Z" fill="${C.ochre}"/>`, 'あさと よるの すうじを くらべる', C.ink, cue(2)],
        [warnIcon, 'いきが くるしそう・ひどく ねむそうなら おいしゃさんに', C.red, cue(3)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.9 }) + text(90, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, st, 200, 340 + i * 140); });
      // 記録のノート
      const mO = prog(t, cue(2) + 0.4, 0.5);
      if (mO > 0) {
        let m = `<rect x="-200" y="-180" width="400" height="330" rx="24" fill="#fff" stroke="${C.line}" stroke-width="6" filter="url(#shadow)"/>`;
        m += text(0, -130, 'ねつの きろく', { size: 38, w: 900, fill: C.ochre });
        m += `<line x1="-160" y1="-90" x2="160" y2="-90" stroke="${C.line}" stroke-width="4"/>`;
        m += text(-150, -30, 'あさ', { size: 40, w: 900, anchor: 'start' }) + text(150, -30, '？℃', { size: 40, w: 900, anchor: 'end', fill: C.red });
        m += text(-150, 60, 'よる', { size: 40, w: 900, anchor: 'start' }) + text(150, 60, '？℃', { size: 40, w: 900, anchor: 'end', fill: C.red });
        b += g(m, { x: 1580, y: 290, o: mO, s: lerp(0.9, 1, eo(mO)) });
      }
      // 毛布にくるまって ふるえる おとうと（熱の上がりかけ）
      const st = cue(1) + 0.4, shk = prog(t, st + 0.6, 0.3) * (1 - prog(t, cue(3), 0.4));
      let bro = kidShow('B', t, 1600, 770, { s: 0.55, start: st, n: 2, enter: 'pop', bubble: false, mouth: 'flat', look: [-4, -2] });
      bro += blanket(1600, 770, 0.55, back(clamp((t - st) / 0.6)));
      b += g(bro, { x: shk * Math.sin(t * 38) * 4 }) + shakeLines(1600, 770 - 100, 160, t, shk, '#5b8fd0', 125);
      b += kidShow('K', t, 1790, 860, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
      out += g(b, { o: bO });
    }
    return out;
  },
});
function blanketIcon() {
  return `<path d="M -26 -24 Q 0 -30 26 -24 Q 40 0 36 26 L -36 26 Q -40 0 -26 -24 Z" fill="#6a9fd8"/><circle cx="0" cy="-34" r="14" fill="${SKIN}"/>`;
}

// 11. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「かぜ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
