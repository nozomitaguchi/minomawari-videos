// みのまわり図鑑 動画「トイレは、流したあとも、どうして水が残るの？」
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
const TOPIC = 'トイレ';
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
