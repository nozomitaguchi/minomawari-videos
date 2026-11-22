// みのまわり図鑑 動画「飛行機は、あんなに重いのに、どうして空を飛べるの？」
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
const TOPIC = 'ひこうき';
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
// ---------- ひこうきの道具 ----------
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const AC = { line: '#9db2c2', blue: '#2f6fb5', wing: '#c9d6e0', eng: '#7f8c96', win: '#5d87a8', air: '#6fb2e0', airD: '#2f7fb8', lift: '#2e9e5b', weight: '#d2452c', thrust: '#e58a1f', drag: '#7a6fd0', road: '#8a8f94' };
// 旅客機（横から。機首は左＝進む向き）。(x,y) は胴体のまん中。gear 0〜1 で車輪、r は機首の上げ（度）
function plane(x, y, s = 1, { gear = 1, r = 0 } = {}) {
  // 機首を右に描いてから、左右をうら返す
  let b = '';
  if (gear > 0.01) b += `<g transform="translate(0 ${(1 - gear) * -44})" opacity="${clamp(gear * 2)}"><rect x="146" y="30" width="8" height="44" fill="#6b7780"/><circle cx="150" cy="77" r="12" fill="#2b2f33"/><circle cx="150" cy="77" r="5" fill="#9aa5ad"/><rect x="-34" y="30" width="10" height="44" fill="#6b7780"/><circle cx="-43" cy="76" r="13" fill="#2b2f33"/><circle cx="-15" cy="76" r="13" fill="#2b2f33"/><circle cx="-43" cy="76" r="5" fill="#9aa5ad"/><circle cx="-15" cy="76" r="5" fill="#9aa5ad"/></g>`;
  b += `<path d="M -262 -8 L -306 -128 L -252 -128 L -176 -36 Z" fill="${AC.blue}"/>`;
  b += `<path d="M -236 -6 L -304 -24 L -274 4 L -200 6 Z" fill="${AC.wing}" stroke="${AC.line}" stroke-width="3" stroke-linejoin="round"/>`;
  b += `<path d="M -262 -8 L -190 -36 L 170 -36 Q 240 -34 264 2 Q 240 34 170 36 L -170 36 Q -236 28 -262 -8 Z" fill="#fff" stroke="${AC.line}" stroke-width="5" stroke-linejoin="round"/>`;
  b += `<path d="M -226 12 L 256 12 Q 232 34 170 36 L -170 36 Q -210 32 -226 12 Z" fill="#dfe8ee"/>`;
  for (let wx = -150; wx <= 160; wx += 24) b += `<rect x="${wx}" y="-20" width="12" height="14" rx="4" fill="${AC.win}"/>`;
  b += `<path d="M 200 -25 L 232 -19 L 244 -7 L 204 -9 Z" fill="#3d5a73"/><rect x="176" y="-24" width="15" height="42" rx="5" fill="none" stroke="${AC.line}" stroke-width="3"/>`;
  b += `<path d="M -30 8 L 90 8 L -50 86 L -104 86 Z" fill="${AC.wing}" stroke="${AC.line}" stroke-width="4" stroke-linejoin="round"/>`;
  b += `<rect x="-6" y="34" width="84" height="36" rx="18" fill="${AC.eng}"/><ellipse cx="76" cy="52" rx="7" ry="18" fill="#3d4a55"/>`;
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r}) scale(${-s} ${s})">${b}</g>`;
}
function arrow(x1, y1, x2, y2, col, w = 12, o = 1) {
  if (o <= 0.01 || Math.hypot(x2 - x1, y2 - y1) < 4) return '';
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/></g>`;
}
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
// つばさの切り口（前のはしは左。c は長さ、tilt は後ろ下がりの度）
const airfoil = (cx, cy, c, tilt = 0, fill = '#e3eaf0') => `<g transform="translate(${cx} ${cy}) rotate(${tilt})"><path d="M ${-c / 2} 0 C ${-c / 2} ${-0.21 * c} ${-0.1 * c} ${-0.2 * c} ${c / 2} 0 C ${0.1 * c} ${0.06 * c} ${-0.45 * c} ${0.1 * c} ${-c / 2} 0 Z" fill="${fill}" stroke="#8fa3b3" stroke-width="6" stroke-linejoin="round"/></g>`;
// 流れのすじ：h は遠くでの高さ（つばさのまん中から。上が −）。x での y
const WG = { cx: 960, cy: 470, c: 660, tilt: 8 };
function flowY(h, x, W = WG) {
  const u = (x - W.cx) / (W.c / 2), k = W.c / 660;
  const near = Math.exp(-Math.abs(h) / (170 * k));
  const bump = Math.exp(-Math.pow((u - 0.1) / 1.0, 2));
  const sw = eio(clamp((u + 1.3) / 3.0));
  const up = Math.exp(-Math.pow((u + 1.25) / 0.5, 2));
  return W.cy + h + ((h < 0 ? -130 : 40) * bump * near - up * near * 26 + sw * (150 * near + 20)) * k;
}
const FLOW_H = [-300, -215, -140, -75, 50, 115, 190, 270];
function flowLines(t, W = WG, { x0 = 60, x1 = 1860, rev = 1e9, o = 0.7, w = 6, dots = true, hs = FLOW_H } = {}) {
  let out = '';
  const k = W.c / 660, xe = Math.min(x1, rev);
  hs.forEach((h0, j) => {
    const h = h0 * k; let d = '';
    for (let x = x0; x <= xe; x += 20) d += `${x === x0 ? 'M' : 'L'} ${x} ${flowY(h, x, W).toFixed(1)} `;
    if (d) out += `<path d="${d}" fill="none" stroke="${AC.air}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
    if (dots) {
      const sp = (h < 0 ? 1.35 : 1) * 320 * k, span = x1 - x0;
      for (let n = 0; n < 4; n++) { const x = x0 + ((t * sp + n * span / 4 + j * 97) % span); if (x < xe) out += `<circle cx="${x.toFixed(1)}" cy="${flowY(h, x, W).toFixed(1)}" r="${w * 1.25}" fill="${AC.airD}" opacity="${Math.min(1, o + 0.2)}"/>`; }
    }
  });
  return out;
}
const paperPlane = (x, y, s = 1, r = 0) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r}) scale(${s})"><path d="M -130 12 L 110 -46 L 78 2 Z" fill="#fff" stroke="#9db2c2" stroke-width="5" stroke-linejoin="round"/><path d="M -130 12 L 78 2 L 104 40 Z" fill="#dfe8ee" stroke="#9db2c2" stroke-width="5" stroke-linejoin="round"/></g>`;
const runway = (y, h, X = 0) => {
  let o = `<rect x="0" y="${y}" width="1920" height="${h}" fill="${AC.road}"/><rect x="0" y="${y}" width="1920" height="6" fill="#aab0b5"/>`;
  for (let i = 0; i < 11; i++) { const x = ((i * 220 + X) % 2420 + 2420) % 2420 - 250; o += `<rect x="${x.toFixed(1)}" y="${y + h * 0.5 - 6}" width="120" height="12" rx="3" fill="#f4f4ee"/>`; }
  return o;
};
const terminal = (x, y, s = 1) => `<g transform="translate(${x.toFixed(1)} ${y}) scale(${s})"><rect x="0" y="-110" width="460" height="110" fill="#dfe6ea"/><rect x="0" y="-122" width="460" height="14" fill="#b9c4cc"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${22 + i * 48}" y="-86" width="32" height="50" rx="4" fill="#9cc7e0"/>`).join('')}<rect x="520" y="-230" width="34" height="230" fill="#cfd8de"/><path d="M 496 -230 L 578 -230 L 590 -280 L 484 -280 Z" fill="#9cc7e0" stroke="#8fa3b3" stroke-width="5" stroke-linejoin="round"/><rect x="490" y="-294" width="94" height="16" rx="5" fill="#b9c4cc"/></g>`;

// 1. つかみ：空港。重い飛行機が、走って、ふわっと浮く
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c3 = cue(3);
    let out = skyRect('skh', 0, { h: 800 });
    out += cloud(520 + t * 6, 170, 0.9) + cloud(1380 + t * 4, 260, 0.6, '#fff', 0.85);
    out += `<path d="M 0 700 Q 480 660 960 690 T 1920 680 L 1920 760 L 0 760 Z" fill="#9fcf8e"/>`;
    out += terminal(1180, 712, 1.0);
    out += runway(744, 106);
    // 飛行機：ゆっくり動いてから、走って、浮く（機首は左＝進む向き）
    const S = 1.0, GY = 800 - 89 * S;
    const p = prog(t, c1 - 0.2, d1 * 0.8), q = clamp((p - 0.55) / 0.45), after = Math.max(0, t - (c1 - 0.2 + d1 * 0.8));
    const px = 1560 - 110 * eo(prog(t, 0.3, c1 - 0.5)) - 1050 * p * p - 16 * after;
    const py = GY - 430 * Math.pow(q, 1.6) - 6 * after;
    const pr = 13 * eio(clamp(q * 2.5));
    if (p > 0.05 && q < 0.6) for (let i = 0; i < 4; i++) out += `<line x1="${px + 300 + i * 46}" y1="${py - 30 + i * 22}" x2="${px + 300 + i * 46 + 120 * p}" y2="${py - 30 + i * 22}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${0.75 * p * (1 - q / 0.6)}"/>`;
    out += `<ellipse cx="${px}" cy="806" rx="${230 * (1 - q * 0.5)}" ry="${12 * (1 - q * 0.5)}" fill="#3d4247" opacity="${0.3 * (1 - q * 0.8)}"/>`;
    out += plane(px, py, S, { gear: 1 - prog(q, 0.55, 0.35), r: pr });
    out += pop(badge('とても おもい', { fill: AC.weight, size: 46 }), t, c0 + (cueE(0) - c0) * 0.55, 1450, 520, { end: c1 - 0.1 });
    out += arrow(1450, 566, 1450, 640, AC.weight, 14, win(t, c0 + (cueE(0) - c0) * 0.55 + 0.3, c1 - 0.1, 0.25));
    // 見ているデッキ
    out += `<rect x="0" y="850" width="1920" height="230" fill="#d9dde0"/><rect x="0" y="850" width="1920" height="8" fill="#b9c4cc"/>`;
    for (let i = 0; i < 9; i++) out += `<rect x="${20 + i * 82}" y="770" width="10" height="84" fill="#6b7780"/>`;
    out += `<rect x="0" y="766" width="700" height="10" rx="5" fill="#6b7780"/><rect x="0" y="812" width="690" height="8" rx="4" fill="#6b7780"/>`;
    const up = q > 0.05;
    out += kidShow('B', t, 250, 850, { s: 0.52, start: 0, n: 0, look: up ? [2, -9] : [8, -3], eyes: up ? 'wide' : 'open' });
    out += kidShow('S', t, 440, 850, { s: 0.52, start: 0, n: 1, bubble: false, look: up ? [-2, -9] : [8, -3], eyes: up ? 'wide' : 'open' });
    out += pop(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre }), t, c3 + 0.3, 1000, 440);
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${AC.blue}">飛行機</tspan>は、あんなに <tspan fill="${AC.weight}">重い</tspan>のに</text>`, { x: 960, y: 400, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして 空を 飛べるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(plane(0, 0, 0.8, { gear: 0, r: 10 }), t, t0 + 1.8, 960 - (t - t0) * 14, 820 - (t - t0) * 5);
    }
    return out;
  },
});

// 2. 予想
const GUESS_ICON = [
  // エンジンが下へ風
  `<rect x="-44" y="-40" width="88" height="38" rx="19" fill="${AC.eng}"/><ellipse cx="-42" cy="-21" rx="7" ry="19" fill="#3d4a55"/><path d="M -24 8 L -24 34 M 0 8 L 0 40 M 24 8 L 24 34" stroke="${AC.air}" stroke-width="8" stroke-linecap="round"/><path d="M -34 28 L -24 42 L -14 28 M -10 34 L 0 48 L 10 34 M 14 28 L 24 42 L 34 28" fill="none" stroke="${AC.air}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  // つばさが空気を下へ曲げる
  `<g transform="rotate(8)"><path d="M -52 0 C -52 -22 -10 -21 52 0 C 10 6 -47 10 -52 0 Z" fill="#e3eaf0" stroke="#8fa3b3" stroke-width="5" stroke-linejoin="round"/></g><path d="M -58 -34 C -10 -52 30 -34 56 2" fill="none" stroke="${AC.air}" stroke-width="8" stroke-linecap="round"/><path d="M 40 -4 L 58 6 L 60 -14" fill="none" stroke="${AC.air}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M -58 30 C -10 30 26 34 52 46" fill="none" stroke="${AC.air}" stroke-width="8" stroke-linecap="round"/>`,
  // 軽いガス（ふうせん）
  `<ellipse cx="0" cy="-14" rx="32" ry="38" fill="#f08a8a"/><path d="M -6 24 L 6 24 L 0 16 Z" fill="#d86a6a"/><path d="M 0 24 q 10 12 0 24 t 0 14" fill="none" stroke="${C.muted}" stroke-width="4"/><ellipse cx="-11" cy="-28" rx="7" ry="11" fill="#fff" opacity="0.6"/>`,
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(plane(-640, -6, 0.3, { gear: 0 }) + text(60, 0, 'そらへ もちあげて いるのは、なに？', { size: 60, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'エンジンが したへ かぜを ふきだす'], ['②', 'つばさが くうきを したへ まげる'], ['③', 'なかに かるい ガスが はいって いる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }) + g(GUESS_ICON[i], { x: 510, y: 0, s: 0.92 }), t, cue(i + 1) - 0.2, 860, 400 + i * 164);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 360, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 旅客機は、どのくらい重い？
SCENES.push({
  id: 'heavy',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1);
    let out = PAPER + topBadge();
    out += pop(plane(0, 0, 1.9), t, 0.3, 960, 300);
    out += g(text(960, 110, 'りょかくき（ボーイング 787-9）', { size: 40, w: 900, fill: C.muted }), { o: prog(t, c0 + 0.5, 0.4) });
    // 重さ
    const wk = prog(t, c0 + d0 * 0.42, 0.4);
    if (wk > 0) {
      const n = Math.round(255 * eo(prog(t, c0 + d0 * 0.5, 1.3)));
      let c = card(700, 300) + text(0, -92, 'いちばん おもい とき', { size: 42, w: 900, fill: C.muted });
      c += `<text x="0" y="36" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${AC.weight}"><tspan font-size="60" fill="${C.ink}">やく </tspan>${n}<tspan font-size="70" fill="${C.ink}"> トン</tspan></text>`;
      out += g(c, { x: 520, y: 650, o: wk, s: lerp(0.94, 1, eo(wk)) });
    }
    // 乗れる人
    const pk = prog(t, c1 - 0.1, 0.4);
    if (pk > 0) {
      const m = Math.round(290 * eo(prog(t, c1 + 0.2, 1.6)));
      let c = card(760, 300);
      for (let i = 0; i < m; i++) c += `<circle cx="${-333 + (i % 29) * 23.8}" cy="${-112 + Math.floor(i / 29) * 15.5}" r="6" fill="${[C.blueUi, C.accent, C.redUi, C.ochre][i % 4]}"/>`;
      c += `<text x="0" y="90" font-size="92" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${C.blueUi}">${m}<tspan font-size="56" fill="${C.ink}"> にん のれる</tspan></text>`;
      out += g(c, { x: 1360, y: 650, o: pk, s: lerp(0.94, 1, eo(pk)) });
    }
    return out;
  },
});

// 4. 4つの力（持ち上げているのは、つばさ）
SCENES.push({
  id: 'forces',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    let out = skyRect('skf', 0);
    // 飛行機は左へ進む → 雲は右へ流れる
    [[300, 220, 0.9, 60], [1100, 160, 0.6, 40], [1700, 620, 0.8, 70], [700, 700, 0.55, 50]].forEach(([x, y, s, v]) => { out += cloud((x + t * v) % 2300 - 190, y, s, '#fff', 0.8); });
    const PX = 960, PY = 450 + Math.sin(t * 1.4) * 5, S = 1.6;
    // エンジンが後ろへ押し出す空気
    const ek = prog(t, c3 - 0.1, 0.5);
    if (ek > 0) for (let i = 0; i < 5; i++) { const f = (t * 1.6 + i / 5) % 1; out += `<line x1="${PX - 20 + f * 300}" y1="${PY + 62 + (i % 3) * 16}" x2="${PX + 50 + f * 300}" y2="${PY + 62 + (i % 3) * 16}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="${ek * (1 - f) * 0.9}"/>`; }
    out += plane(PX, PY, S, { gear: 0 });
    const lab = (x, y, s, col, o, anchor = 'middle') => g(`<text x="0" y="0" font-size="46" font-weight="900" text-anchor="${anchor}" dominant-baseline="middle" letter-spacing="0.04em" fill="${col}" stroke="#fff" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${s}</text>`, { x, y, o });
    // 重さ と 持ち上げる力
    const k1 = eo(prog(t, c1 + 0.2, 0.6)), k1b = eo(prog(t, c1 + d1 * 0.5, 0.6));
    out += arrow(PX, PY + 60, PX, PY + 60 + 190 * k1, AC.weight, 20, k1) + lab(PX + 40, 660, 'おもさ', AC.weight, k1, 'start');
    out += arrow(PX, PY - 70, PX, PY - 70 - 200 * k1b, AC.lift, 20, k1b) + lab(PX + 40, 210, 'もちあげる ちから', AC.lift, k1b, 'start');
    // 前へ進める力 と 空気のていこう
    const k2 = eo(prog(t, c2 + 0.2, 0.6)), k2b = eo(prog(t, c2 + d2 * 0.45, 0.6));
    out += arrow(PX - 440, PY, PX - 440 - 210 * k2, PY, AC.thrust, 20, k2) + lab(400, 372, 'まえへ すすめる ちから', AC.thrust, k2);
    out += arrow(PX + 500, PY, PX + 500 + 210 * k2b, PY, AC.drag, 20, k2b) + lab(1570, 372, 'くうきの ていこう', AC.drag, k2b);
    // エンジンは前へ、つばさは上へ
    const e1 = prog(t, c3 + 0.2, 0.4), e2 = prog(t, c3 + d3 * 0.5, 0.4);
    out += g(`<circle cx="${PX - 58}" cy="${PY + 83}" r="${78 + Math.sin(t * 5) * 4}" fill="none" stroke="${AC.thrust}" stroke-width="9" stroke-dasharray="20 12"/>`, { o: e1 });
    out += pop(badge('エンジン：まえへ すすめる', { fill: AC.thrust, size: 42 }), t, c3 + 0.2, 560, 770) + pointer(700, 734, 850, 584, AC.thrust, prog(t, c3 + 0.5, 0.3));
    out += g(`<path d="M ${PX + 50} ${PY + 12} L ${PX - 150} ${PY + 12} L ${PX + 78} ${PY + 140} L ${PX + 170} ${PY + 140} Z" fill="none" stroke="${AC.lift}" stroke-width="9" stroke-dasharray="20 12" stroke-linejoin="round"/>`, { o: e2 });
    out += pop(badge('つばさ：もちあげる', { fill: AC.lift, size: 42 }), t, c3 + d3 * 0.5, 1330, 770) + pointer(1210, 734, 1090, 600, AC.lift, prog(t, c3 + d3 * 0.5 + 0.3, 0.3));
    out += kidShow('S', t, 1780, 850, { s: 0.42, start: c4 - 0.9, n: 0, size: 40 });
    return out;
  },
});

// 5. 浮くには、空気と速さがいる（カメラは飛行機といっしょに動く）
const MINI = { cx: 0, cy: 10, c: 300, tilt: 8 };
SCENES.push({
  id: 'speed',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3;
    const t1 = c2 + 0.4, tL = c3 + d3 * 0.62;
    const f = prog(t, t1, tL - t1);                      // 速さ（0〜1）
    const dt = Math.max(0, t - t1), T = tL - t1, VM = 2600;
    const X = t < tL ? VM * dt * dt / (2 * T) : VM * T / 2 + VM * (t - tL);   // 進んだ道のり
    const lq = eo(prog(t, tL, 2.0));                     // 浮き上がり
    let out = skyRect('sks', 0, { h: 800 });
    [[300, 200, 0.8], [1100, 260, 0.6], [1900, 180, 0.9]].forEach(([x, y, s]) => { out += cloud(((x + X * 0.08) % 2500 + 2500) % 2500 - 250, y, s, '#fff', 0.85); });
    out += `<rect x="0" y="690" width="1920" height="80" fill="#9fcf8e"/>`;
    [0, 1].forEach(i => { out += terminal(((300 + i * 1500 + X * 0.3) % 3000 + 3000) % 3000 - 700, 722, 0.8); });
    out += runway(744, 106, X) + `<rect x="0" y="850" width="1920" height="230" fill="#7d8287"/>`;
    const S = 1.3, PX = 1000, PY = 800 - 89 * S - 190 * lq, pr = 9 * eio(prog(t, tL - 0.5, 1.5));
    // 流れる空気（飛行機は左へ進む → 空気は右へ）
    if (f > 0.02) for (let i = 0; i < 12; i++) {
      const y = 380 + (i * 53) % 380, len = 60 + 240 * f, x = ((i * 337 + X * 1.15) % 2300 + 2300) % 2300 - 300;
      out += `<line x1="${x.toFixed(1)}" y1="${y}" x2="${(x + len).toFixed(1)}" y2="${y}" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${0.55 * Math.min(1, f * 3)}"/>`;
    }
    out += `<ellipse cx="${PX}" cy="806" rx="${300 * (1 - lq * 0.4)}" ry="${14 * (1 - lq * 0.4)}" fill="#3d4247" opacity="${0.32 * (1 - lq * 0.6)}"/>`;
    out += plane(PX, PY, S, { gear: 1, r: pr });
    // 重さ と 持ち上げる力
    const lab = (x, y, s, col, o, anchor = 'middle') => g(`<text x="0" y="0" font-size="44" font-weight="900" text-anchor="${anchor}" dominant-baseline="middle" letter-spacing="0.04em" fill="${col}" stroke="#fff" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${s}</text>`, { x, y, o });
    const wO = prog(t, c0 + 0.3, 0.4), WL = 150, LL = 175 * f * f;
    out += arrow(PX + 130, PY - 40, PX + 130, PY - 40 + WL, AC.weight, 20, wO) + lab(PX + 170, PY + 40, 'おもさ', AC.weight, wO, 'start');
    out += arrow(PX - 30, PY - 70, PX - 30, PY - 70 - LL, AC.lift, 20, 1) + lab(PX - 30, PY - 110 - LL, 'もちあげる ちから', AC.lift, prog(f, 0.25, 0.2) * (1 - prog(t, tL - 0.3, 0.3)));
    out += pop(badge('とまって いると… もちあげる ちからは ない', { fill: C.blueUi, size: 42 }), t, c0 + 0.5, 860, 200, { end: c2 - 0.1 });
    // 小さな図：つばさのまわりを空気が流れる
    const mO = win(t, c1 + 0.2, c2 + 0.1, 0.4);
    if (mO > 0) {
      let m = card(620, 330) + `<clipPath id="mclip"><rect x="-290" y="-150" width="580" height="215" rx="16"/></clipPath><g clip-path="url(#mclip)"><rect x="-290" y="-150" width="580" height="215" fill="#eef6fb"/>${flowLines(t, MINI, { x0: -300, x1: 300, w: 4, hs: [-215, -140, -75, 50, 115] })}${airfoil(0, 10, 300, 8)}</g>`;
      m += text(0, 112, 'くうきが ながれると ちからが うまれる', { size: 30, w: 900, fill: C.blueUi });
      out += g(m, { x: 400, y: 450, o: mO, s: lerp(0.94, 1, eo(mO)) });
    }
    // 速さ
    const sO = prog(t, c2 + 0.2, 0.4);
    if (sO > 0) out += g(card(520, 170) + `<text x="0" y="6" font-size="96" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${C.blueUi}"><tspan font-size="46" fill="${C.ink}">じそく </tspan>${Math.round(270 * f)}<tspan font-size="50" fill="${C.ink}"> キロ</tspan></text>`, { x: 360, y: 200, o: sO });
    out += pop(badge('もちあげる ちから ＞ おもさ', { fill: AC.lift, size: 46, pad: 40 }), t, tL - 0.1, 1400, 150);
    out += pop(text(0, 0, 'ういた！', { size: 80, w: 900, fill: AC.lift, extra: 'stroke="#fff" stroke-width="14" stroke-linejoin="round" paint-order="stroke"' }), t, tL + 0.5, 1590, 290);
    return out;
  },
});

// 6. つばさは、空気を下へ曲げている（答えの場面）
SCENES.push({
  id: 'turn',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
    const rev = lerp(60, 1900, eo(prog(t, 0.3, 2.2)));
    out += flowLines(t, WG, { rev });
    // 圧力（上は弱い、下は強い）
    const pO = win(t, c2 + 0.2, c4 - 0.2, 0.4);
    if (pO > 0) {
      out += g(`<ellipse cx="930" cy="330" rx="330" ry="80" fill="#bfe0f5" opacity="0.55" filter="url(#soft)"/><ellipse cx="950" cy="590" rx="330" ry="76" fill="#ffc9a3" opacity="0.7" filter="url(#soft)"/>`, { o: pO });
    }
    out += pop(airfoil(0, 0, WG.c, WG.tilt), t, 0.2, WG.cx, WG.cy);
    out += g(text(WG.cx - 30, WG.cy - 26, 'つばさ（よこから みた きりくち）', { size: 34, w: 900, fill: '#6f8392' }), { o: win(t, 0.6, c1 - 0.1, 0.3) });
    out += pop(badge('まえから きた くうき', { fill: AC.airD, size: 42 }), t, c0 + 0.2, 330, 245, { end: c2 - 0.1 }) + arrow(210, 305, 380, 305, AC.airD, 12, win(t, c0 + 0.5, c2 - 0.1, 0.3));
    out += pop(badge('したむきに まがる', { fill: AC.airD, size: 42 }), t, c0 + d0 * 0.55, 1560, 330, { end: c2 - 0.1 });
    out += arrow(1380, 500, 1560, 610, AC.airD, 18, win(t, c0 + d0 * 0.55 + 0.3, c2 - 0.1, 0.3));
    // 押すと、押し返される
    const a1 = win(t, c1 + 0.2, c2 - 0.1, 0.3), a2 = win(t, c1 + d1 * 0.5, c2 - 0.1, 0.3);
    out += arrow(1250, 560, 1250, 740, AC.airD, 24, a1) + g(badge('くうきを したへ おす', { fill: AC.airD, size: 40 }), { x: 1250, y: 800, o: a1 });
    out += arrow(880, 400, 880, 210, AC.lift, 24, a2) + g(badge('つばさは うえへ おしかえされる', { fill: AC.lift, size: 40 }), { x: 880, y: 150, o: a2 });
    if (pO > 0) {
      let p = '';
      for (let i = 0; i < 5; i++) { const x = 730 + i * 100; p += arrow(x, 300 + i * 6, x, 330 + i * 6, '#5a9fd0', 8, 1); p += arrow(x + 20, 640 + i * 10, x + 20, 560 + i * 10, '#e8742c', 13, prog(t, c2 + d2 * 0.55, 0.4)); }
      p += g(badge('うえ：おす ちからが よわい', { fill: '#4d93c6', size: 40 }), { x: 900, y: 215 });
      p += g(badge('した：おす ちからが つよい', { fill: '#e8742c', size: 40 }), { x: 940, y: 730, o: prog(t, c2 + d2 * 0.55, 0.4) });
      out += g(p, { o: pO });
    }
    // 下から上へ、押し上げられる
    const l3 = win(t, c3 + 0.2, c4 - 0.2, 0.3);
    out += arrow(1420, 560, 1420, 300, AC.lift, 34, l3) + g(badge('うえへ おしあげられる', { fill: AC.lift, size: 44 }), { x: 1560, y: 250, o: l3 });
    // 同じことを、別の側から見た説明
    const s4 = prog(t, c4 + 0.1, 0.4);
    if (s4 > 0) {
      out += arrow(880, 400, 880, 220, AC.lift, 28, s4);
      out += pop(badge('くうきを したへ まげる はんどう', { fill: AC.airD, size: 38 }), t, c4 + 0.2, 500, 790);
      out += pop(text(0, 0, '＝', { size: 70, w: 900, fill: C.ink }), t, c4 + 0.9, 960, 790);
      out += pop(badge('うえと したの おす ちからの ちがい', { fill: '#e8742c', size: 38 }), t, c4 + 1.3, 1440, 790);
      out += pop(badge('どちらも ただしい', { fill: AC.lift, size: 46, pad: 40 }), t, c4 + 2.2, 960, 140);
    }
    return out;
  },
});

// 7. よくあるまちがい（煙の実験）と、紙飛行機
const MW = { cx: 900, cy: 470, c: 660, tilt: 8 };
// 煙のしるし：tau 秒後の x（つばさの上は速く、下は少しおそい）
function puffX(h, tau) {
  const near = Math.exp(-Math.abs(h) / 170), kk = h < 0 ? 0.75 * near : -0.18 * near;
  let x = 430;
  for (let s = 0; s < tau; s += 0.04) x += 330 * (1 + kk * Math.exp(-Math.pow((x - MW.cx) / 340, 2))) * Math.min(0.04, tau - s);
  return x;
}
SCENES.push({
  id: 'myth',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c4 = cue(4), d4 = cueE(4) - c4;
    let out = PAPER;
    // A：よく聞く説明（まちがい）
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      let a = topBadge() + pop(badge('よく きく せつめい', { fill: '#8c8c86', size: 46 }), t, 0.3, 960, 170);
      let c = card(1240, 470) + airfoil(0, 20, 760, 0);
      // 上と下に分かれた空気が、後ろで同時に出会う（という、まちがった絵）
      const lp = ((t - c0 - 0.6) % 3.2) / 2.2, k = clamp(lp);
      if (t > c0 + 0.6) {
        const tx = lerp(-380, 380, k);
        const top = 20 - 118 * Math.sin(Math.PI * k) * (1 - 0.25 * k), bot = 20 + 62 * Math.sin(Math.PI * k);
        c += `<path d="M -380 20 C -380 -150 -60 -150 380 20" fill="none" stroke="${AC.air}" stroke-width="7" stroke-dasharray="14 12"/><path d="M -380 20 C -300 110 60 90 380 20" fill="none" stroke="#e8a45a" stroke-width="7" stroke-dasharray="14 12"/>`;
        c += `<circle cx="${tx}" cy="${top - 14}" r="20" fill="${AC.airD}"/><circle cx="${tx}" cy="${bot + 14}" r="20" fill="#e8742c"/>`;
        if (k >= 1) c += text(416, 24, 'どうじ？', { size: 44, w: 900, fill: C.muted, anchor: 'start' });
      }
      c += text(-520, 20, 'わかれる', { size: 40, w: 900, fill: C.muted });
      c += text(0, 186, '「うえと したの くうきが、うしろで どうじに であう」', { size: 40, w: 900 });
      a += g(c, { x: 960, y: 500, o: prog(t, 0.5, 0.4) });
      const xk = prog(t, c1 + 0.2, 0.3);
      a += g(cross(960, 480, 3.2), { o: xk * 0.9, s: 1 }) + pop(badge('これは まちがい', { fill: C.red, size: 60, pad: 50 }), t, c1 + 0.4, 960, 800);
      out += g(a, { o: aO });
    }
    // B：煙を流した実験
    const bO = win(t, c2 - 0.3, c4 - 0.3, 0.4);
    if (bO > 0) {
      let b = `<rect width="1920" height="1080" fill="#eef6fb"/>` + topBadge();
      b += flowLines(t, MW, { o: 0.3, dots: false, x0: 100, x1: 1800 });
      b += airfoil(MW.cx, MW.cy, MW.c, MW.tilt);
      const TE = MW.cx + MW.c / 2;
      b += `<line x1="${TE}" y1="250" x2="${TE}" y2="760" stroke="${C.muted}" stroke-width="5" stroke-dasharray="14 12"/>` + text(TE, 800, 'うしろの はし', { size: 36, w: 900, fill: C.muted });
      // 煙のしるし（たてにならんだ点）。3.4秒ごとに流す
      const P0 = c2 + 0.5, per = 2.9;
      for (let n = 0; n < 4; n++) {
        const tau = t - (P0 + n * per);
        if (tau <= 0 || tau > 5.2) continue;
        const pts = FLOW_H.slice(1, 7).map(h => { const x = puffX(h, tau); return [x, flowY(h, x, MW), h]; });
        [pts.filter(p => p[2] < 0 && p[0] < 1640), pts.filter(p => p[2] > 0 && p[0] < 1640)].forEach((grp, gi) => {
          if (grp.length > 1) b += `<path d="M ${grp.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')}" fill="none" stroke="${gi ? '#e8742c' : AC.airD}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`;
          grp.forEach(p => { b += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="17" fill="${gi ? '#e8742c' : AC.airD}"/>`; });
        });
      }
      b += pop(badge('けむりを ながした じっけん（ケンブリッジだいがく）', { fill: C.muted, size: 36 }), t, c2 + 0.2, 1160, 110);
      b += pop(badge('うえの くうきが、ずっと さきに つく', { fill: AC.airD, size: 44 }), t, c2 + d2 * 0.55, 1400, 195);
      b += text(400, 300, 'うえを とおる くうき', { size: 38, w: 900, fill: AC.airD, anchor: 'end' }) + text(400, 690, 'したを とおる くうき', { size: 38, w: 900, fill: '#e8742c', anchor: 'end' });
      b += kidShow('B', t, 1760, 850, { s: 0.5, start: c3 - 0.9, n: 0, bubble: false, look: [-8, -4] });
      b += talkBubble('B', 1700, 590, 1760, 655, 40);
      out += g(b, { o: bO });
    }
    // C：紙飛行機の平らなつばさ
    const cO = prog(t, c4 - 0.2, 0.4);
    if (cO > 0) {
      const k = prog(t, c4, d4 + 1.2);
      let c = skyRect('skm', 0) + cloud(420, 620, 0.8, '#fff', 0.8) + cloud(1500, 240, 0.7, '#fff', 0.8);
      // 紙飛行機は左へ進む（機首は左）
      c += paperPlane(lerp(1750, 560, k), lerp(260, 470, k) + Math.sin(t * 2.2) * 10, 1.5, -9 + Math.sin(t * 2.2 + 1) * 3);
      let m = card(760, 330) + text(0, -112, 'かみひこうきの つばさを よこから みると', { size: 34, w: 900, fill: C.muted });
      m += `<rect x="-250" y="-22" width="500" height="14" rx="5" fill="#fff" stroke="#8fa3b3" stroke-width="5"/>`;
      m += text(0, -58, 'うえ：たいら', { size: 36, w: 900, fill: AC.airD }) + text(0, 30, 'した：たいら', { size: 36, w: 900, fill: '#e8742c' });
      m += text(0, 108, 'うえと したが おなじ かたち', { size: 40, w: 900 });
      c += g(m, { x: 1380, y: 620, o: prog(t, c4 + d4 * 0.2, 0.4) });
      c += pop(badge('それでも ちゃんと とぶ', { fill: AC.lift, size: 50, pad: 44 }), t, c4 + d4 * 0.65, 560, 760);
      out += g(c, { o: cO });
    }
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, 'つばさが くうきを したへ まげる', { size: 54, w: 900, anchor: 'start' }) + g(GUESS_ICON[1], { x: 540, y: 0, s: 0.9 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['はしって くうきを ながす', C.blueUi], ['つばさが くうきを したへ まげる', AC.airD], ['その はんどうで うえへ', AC.lift]], t, 960, 660, { start: 2.4, step: 1.1, size: 34, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const items = [
        [paperPlane(0, 0, 0.42, -6), 'かみひこうきの つばさを よこから みる', C.ink],
        [plane(0, -4, 0.2, { r: 8 }), 'しゃりんが どこで じめんから はなれる？', C.ink],
        [warnIcon(0.82), 'かみひこうきは ひとの かおに むけて とばさない', C.red],
        [warnIcon(0.82), 'くうこうでは きめられた ばしょから みる', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 330 + i * 128);
      });
      // 展望デッキから見る
      const ck = prog(t, cue(1) + 0.3, 0.5);
      if (ck > 0) {
        const k = ((t - cue(1)) % 6) / 6, q = clamp((k - 0.45) / 0.55);
        let p = g(card(480, 300), { x: 1620, y: 250 });
        p += `<clipPath id="lkc"><rect x="1400" y="120" width="440" height="260" rx="18"/></clipPath><g clip-path="url(#lkc)">${skyRect('lks', 0, { x: 1400, y: 120, w: 440, h: 260 })}<rect x="1400" y="330" width="440" height="50" fill="${AC.road}"/>${plane(1800 - 330 * k, 322 - 89 * 0.3 - 130 * Math.pow(q, 1.5), 0.3, { r: 12 * eio(clamp(q * 2.5)) })}</g>`;
        b += g(p, { o: ck });
      }
      b += kidShow('K', t, 1700, 800, { s: 0.72, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ひこうき」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
