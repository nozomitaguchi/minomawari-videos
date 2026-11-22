// みのまわり図鑑 動画「にじは、どうして雨のあとに出るの？」
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
const TOPIC = 'にじ';
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

// みのまわり図鑑 動画「にじは、どうして あめの あとに でるの？」（にじ）
// 出どころ：everyday-trivia trivia/rainbow-after-rain.md（絵の見本：assets/figures-rainbow.js、メモ：ideas/notes/rainbow.md）

// ---------- にじの道具 ----------
const RBC = ['#f0483e', '#ff9a2e', '#ffd93a', '#3cc35a', '#2f86ff', '#8a5cf0'];  // そとがわ（あか）→ うちがわ（むらさき）
const RB = { cloud: '#9aa3ad', cloudDk: '#858e98', drop: '#bfe3f7', dropLn: '#7fbfe6', streak: '#6fa9dc', grass: '#7fc474', grassDk: '#5fae5f', ray: '#fff6c2' };
const rad = a => a * Math.PI / 180;
const STROKE = `stroke="${C.ink}" stroke-width="12" paint-order="stroke" stroke-linejoin="round"`;
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（指す点が x, y。ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 42 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const okMark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="#3d9a5c"/><circle r="20" fill="none" stroke="#fff" stroke-width="9"/></g>`;
const ngMark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="#c94435"/><path d="M -16 -16 L 16 16 M 16 -16 L -16 16" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>`;
const skyG = (id, top, bot, { x = 0, y = 0, w = 1920, h = 1080 } = {}) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
// にじの弧。まん中 (cx, cy)、いちばん外の半径 R、色1本の太さ w。角度は度（0=右、90=上、180=左）。k は左から右へ出てくる割合
function bow(cx, cy, R, w, { o = 1, a0 = 180, a1 = 0, k = 1 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const ae = lerp(a0, a1, k); let s = '';
  RBC.forEach((c, i) => {
    const r = R - w * (i + 0.5), x1 = cx + r * Math.cos(rad(a0)), y1 = cy - r * Math.sin(rad(a0)), x2 = cx + r * Math.cos(rad(ae)), y2 = cy - r * Math.sin(rad(ae));
    s += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${a0 - ae > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${c}" stroke-width="${w + 1}"/>`;
  });
  return `<g opacity="${o}">${s}</g>`;
}
// にじ（まるい輪）
const ring = (cx, cy, R, w, o = 1) => o <= 0 ? '' : `<g opacity="${o}">` + RBC.map((c, i) => `<circle cx="${cx}" cy="${cy}" r="${R - w * (i + 0.5)}" fill="none" stroke="${c}" stroke-width="${w + 1}"/>`).join('') + `</g>`;
// ふっている雨
function rainFx(x0, x1, y0, y1, t, { n = 40, u = 1, o = 1, seed = 1, col = RB.streak } = {}) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(i, seed)), f = (t * (0.9 + rnd(i, seed + 2) * 0.5) + rnd(i, seed + 1)) % 1, y = lerp(y0, y1, f), len = 34 * u;
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - len * 0.2).toFixed(1)}" y2="${(y + len).toFixed(1)}" stroke="${col}" stroke-width="${(5 * u).toFixed(1)}" stroke-linecap="round" opacity="${(0.8 * Math.min(1, f * 6, (1 - f) * 6)).toFixed(2)}"/>`;
  }
  return `<g opacity="${o}">${s}</g>`;
}
// まるい雨つぶ
const drop = (cx, cy, r, o = 1) => o <= 0 ? '' : `<g opacity="${o}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${RB.drop}" fill-opacity="0.32" stroke="${RB.dropLn}" stroke-width="${Math.max(3, r * 0.045)}"/>` +
  `<path d="M ${cx - r * 0.62} ${cy - r * 0.42} A ${r * 0.75} ${r * 0.75} 0 0 1 ${cx - r * 0.2} ${cy - r * 0.72}" fill="none" stroke="#fff" stroke-width="${Math.max(3, r * 0.05)}" stroke-linecap="round" opacity="0.85"/></g>`;
// 線を k の割合だけ引く
const seg = (p, q, k, col, w, o = 1) => k <= 0 || o <= 0 ? '' : `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${lerp(p[0], q[0], k).toFixed(1)}" y2="${lerp(p[1], q[1], k).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
// 白い光のすじ
const beam = (p, q, k, w = 14, o = 1) => seg(p, q, k, '#fffbea', w * 2.6, 0.2 * o) + seg(p, q, k, '#fffbea', w, o);
// 小さな人のしるし（足もとが x, y）
const person = (x, y, s = 1, col = '#e0715f') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-13" y="-26" width="10" height="26" rx="5" fill="#35657f"/><rect x="3" y="-26" width="10" height="26" rx="5" fill="#35657f"/><rect x="-17" y="-72" width="34" height="52" rx="12" fill="${col}"/><circle cx="0" cy="-94" r="24" fill="${CH.skin}"/><path d="M -24 -96 A 24 24 0 0 1 24 -96 Q 0 -110 -24 -96 Z" fill="${CH.hairB}"/></g>`;
// 天気の小さな絵（まん中が 0,0）。kind: 'rain' 雨のあいだ / 'clear' すっかり晴れ / 'after' 雨雲が通りすぎた すぐあと
function wx(kind, w, h, t, id, { bowK = 1, who = true } = {}) {
  const u = h / 400, L = -w / 2, T = -h / 2, uu = Math.max(u, 0.4), gy = h * 0.3;
  const [top, bot] = { rain: ['#76828f', '#bcc4cc'], clear: ['#3f93dc', '#d6edfa'], after: ['#5797d6', '#d2e8f7'] }[kind];
  let a = `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient><rect x="${L}" y="${T}" width="${w}" height="${h}" fill="url(#${id}g)"/>`;
  if (kind === 'rain') {
    a += rainFx(L, -L, T + h * 0.2, gy, t, { n: Math.round(30 * w / 560), u: uu, seed: 5 });
    a += cloud(L + w * 0.27, T + h * 0.2, 1.5 * u, RB.cloudDk, 1) + cloud(L + w * 0.7, T + h * 0.17, 1.7 * u, RB.cloud, 1);
  } else if (kind === 'clear') {
    a += sunDisc(L + w * 0.24, T + h * 0.27, 40 * u, 0, { glow: 0.7 }) + cloud(L + w * 0.76, T + h * 0.24, 0.6 * u, '#fff', 0.9);
  } else {
    a += rainFx(w * 0.02, -L, T + h * 0.2, gy, t, { n: Math.round(16 * w / 560), u: uu, seed: 8 });
    a += bow(w * 0.2, gy + h * 0.06, h * 0.5, 9 * u, { k: bowK, o: 0.95 });
    a += sunDisc(L + w * 0.17, T + h * 0.24, 38 * u, 0, { glow: 0.7 }) + cloud(L + w * 0.78, T + h * 0.17, 1.5 * u, RB.cloud, 1);
  }
  a += `<path d="M ${L} ${gy + h * 0.04} Q 0 ${gy - h * 0.06} ${-L} ${gy + h * 0.04} L ${-L} ${-T} L ${L} ${-T} Z" fill="${kind === 'rain' ? '#6f9a74' : RB.grass}"/>`;
  if (who) a += person(L + w * 0.3, gy + h * 0.1, 0.62 * u);
  return `<clipPath id="${id}c"><rect x="${L}" y="${T}" width="${w}" height="${h}" rx="${24 * uu}"/></clipPath><g clip-path="url(#${id}c)">${a}</g><rect x="${L}" y="${T}" width="${w}" height="${h}" rx="${24 * uu}" fill="none" stroke="#fff" stroke-width="${8 * uu}"/>`;
}
// 雨つぶの中の光の道。i: 入る角度、r: 中での角度（度）。E 入口、B うしろ、X 出口、d 出ていく向き
const DR = { cx: 960, cy: 370, R: 230 };
function dropPath(r = 40.2, i = 59.4) {
  const { cx, cy, R } = DR, P = a => [cx + R * Math.cos(rad(a)), cy - R * Math.sin(rad(a))];
  const aE = 180 - i, aB = aE - (180 - 2 * r), aX = aB - (180 - 2 * r), D = 180 + 2 * i - 4 * r;
  return { E: P(aE), B: P(aB), X: P(aX), d: [Math.cos(rad(D)), Math.sin(rad(D))] };
}

// 1. つかみ：夕立がやんで、うしろからお日さま。前の空に にじ
SCENES.push({
  id: 'hook',
  draw(t) {
    const k = eio(prog(t, cue(0) - 0.2, 3.4));          // 雨がやんで、明るくなる
    let out = skyG('skh', mix('#76828f', '#4c97dc', k), mix('#bcc4cc', '#d6edfa', k));
    out += g(sunDisc(250, 240, 84, 0), { o: eo(prog(t, cue(0) + 1.4, 2.2)) });
    out += rainFx(lerp(-40, 900, k), 1960, 230, 800, t, { n: 70, seed: 3, o: lerp(1, 0.7, k) });
    out += bow(1340, 900, 560, 22, { k: eo(prog(t, cue(1) - 0.3, 1.8)), o: 0.92 });
    const cx = lerp(0, 760, k);
    out += cloud(260 + cx * 1.4, 230, 1.9, RB.cloudDk, 1) + cloud(760 + cx, 190, 2.1, RB.cloud, 1) + cloud(1240 + cx * 0.6, 220, 2.0, RB.cloudDk, 1) + cloud(1700 + cx * 0.3, 180, 2.2, RB.cloud, 1);
    out += `<path d="M 0 770 Q 420 650 860 750 T 1920 700 L 1920 1080 L 0 1080 Z" fill="${mix('#7d9d83', '#93cf8c', k)}"/>`;
    out += house(1180, 790, 0.9) + house(1420, 770, 0.7, '#f4ead8', '#5d7fa8') + tree(1640, 790, 0.9, mix('#3d7a52', '#3f8f4a', k));
    out += `<path d="M 0 880 Q 620 780 1240 900 T 1920 870 L 1920 1080 L 0 1080 Z" fill="${mix('#5f8a66', '#5fae5f', k)}"/>`;
    // 子どもたち（前の空を見上げる）
    const eyes = t > cue(1) + 0.6 ? 'wide' : 'open';
    out += kidShow('S', t, 230, 862, { s: 0.5, start: 0, n: 0, eyes, look: [6, -8] });
    out += kidShow('B', t, 400, 862, { s: 0.5, start: 0, n: 1, eyes, look: [6, -8], bubble: false });
    // 雨のあいだ・すっかり晴れた空 には出ない
    const c3 = cue(3), d3 = cueE(3) - c3;
    [['rain', 'あめの あいだ', c3 + 0.4, 640], ['clear', 'すっかり はれ', c3 + d3 * 0.42, 1090]].forEach(([kind, label, st, x], i) => {
      const inner = card(420, 330) + g(wx(kind, 372, 220, t, 'hk' + i), { y: -34 }) + text(0, 122, label, { size: 40, w: 900 }) + g(cross(0, -34, 0.9), { o: prog(t, st + 0.8, 0.25) });
      out += pop(inner, t, st, x, 300, { end: cueE(3) + 0.5 });
    });
    out += pop(text(0, 0, '？', { size: 220, w: 900, fill: '#fff', extra: STROKE }), t, cue(4) + 0.5, 1340, 610, { end: cueE(4) + 0.7 });
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      const l1 = 'にじは、どうして', W1 = tw(l1, 128, 900, 0.04), wn = tw('にじ', 128, 900, 0.04);
      out += `<linearGradient id="rbt" gradientUnits="userSpaceOnUse" x1="${-W1 / 2}" y1="0" x2="${-W1 / 2 + wn}" y2="0"><stop offset="0" stop-color="${RBC[0]}"/><stop offset="0.3" stop-color="${RBC[1]}"/><stop offset="0.55" stop-color="${RBC[3]}"/><stop offset="0.8" stop-color="${RBC[4]}"/><stop offset="1" stop-color="${RBC[5]}"/></linearGradient>`;
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="url(#rbt)">にじ</tspan>は、どうして</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blueUi}">あめの あと</tspan>に でるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(wx('after', 440, 250, t, 'ttl', { who: false }), t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'にじが みつかりやすいのは、いつ？', { size: 72, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'あめが いちばん つよく', 'ふっているとき', 'rain'], ['②', 'あまぐもが とおりすぎて、', 'すぐに おひさまが でたとき', 'after'], ['③', 'あめが やんで なんじかんも たった、', 'よく はれたとき', 'clear']];
    const cur = curLine();
    opts.forEach(([n, a, b, kind], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-86" width="1200" height="172" rx="34" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 152) +
        `<circle cx="-510" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-510, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-440, -30, a, { size: 46, w: 700, anchor: 'start' }) + text(-440, 32, b, { size: 46, w: 700, anchor: 'start' }) +
        g(wx(kind, 170, 112, t, 'gs' + i, { who: false }), { x: 480 }), t, cue(i + 1) - 0.2, 900, 400 + i * 178);
    });
    out += kidShow('B', t, 1720, 850, { s: 0.58, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 420, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. にじが出る場所：いつも お日さまの反対がわ
SCENES.push({
  id: 'where',
  draw(t) {
    let out = skyG('skw', '#4f93d6', '#d4ecfa') + topBadge();
    const GY = 830, BX = 1400, R = 400;
    const k1 = prog(t, cue(1) - 0.2, 0.6);
    // どこにでも出る？
    [[330, 560, 150], [900, 440, 170], [1500, 540, 160]].forEach(([x, y, r], i) => {
      const st = cue(0) + 0.5 + i * 0.9, o = win(t, st, cue(1) - 0.1, 0.3);
      if (o <= 0) return;
      out += bow(x, y, r, 8, { o: o * 0.5 }) + g(text(0, 0, '？', { size: 110, w: 900, fill: '#fff', extra: STROKE }), { x, y: y - 46, o, s: Math.max(back(prog(t, st, 0.4)), 0.001) });
    });
    // 右：雨雲と雨、にじ
    out += rainFx(990, 1860, 250, GY - 40, t, { n: 46, seed: 4, o: k1 });
    out += bow(BX, GY, R, 16, { k: eo(prog(t, cue(1) + 0.9, 1.4)), o: 0.95 });
    out += g(cloud(1300, 220, 1.5, RB.cloudDk, 1) + cloud(1640, 195, 1.8, RB.cloud, 1), { o: k1 });
    // 左：お日さま
    out += pop(sunDisc(0, 0, 72, 0), t, cue(1) - 0.1, 210, 280);
    out += g(text(210, 400, 'おひさま', { size: 40, w: 900, fill: '#fff', extra: STROKE }), { o: prog(t, cue(1) + 0.3, 0.4) });
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RB.grass}"/><rect x="0" y="${GY}" width="1920" height="14" fill="${RB.grassDk}"/>`;
    // はんたいがわ
    out += pop(badge('いつも おひさまの はんたいがわ', { fill: C.blueUi, size: 46 }), t, cue(1) + 0.4, 735, 170, { end: cue(3) - 0.3 });
    const a1 = win(t, cue(1) + 0.8, cue(2) - 0.1, 0.3);
    out += g(arrow2(690, 610, 330, 360, C.ink, 9) + arrow2(840, 610, 1070, 520, C.ink, 9), { o: a1 });
    // 背中にお日さま、前に雨つぶ
    const L = eo(prog(t, cue(2) + 0.2, 1.4)), lo = prog(t, cue(2), 0.3);
    [[300, 300, 1300, 450], [300, 330, 1240, 520], [290, 270, 1340, 375]].forEach(([x1, y1, x2, y2], i) => { out += seg([x1, y1], [x2, y2], L, RB.ray, 12 - i * 2, 0.9 * lo); });
    out += tag(712, 745, 440, 620, 'せなかに おひさま', prog(t, cue(2) + 0.8, 0.3));
    out += tag(1400, 560, 1400, 665, 'まえに あめつぶ', prog(t, cue(2) + (cueE(2) - cue(2)) * 0.5, 0.3), { col: C.blueUi });
    out += kidShow('B', t, 760, GY + 6, { s: 0.44, start: 0.2, n: 0, look: [7, -5] });
    return out;
  },
});

// 4. 雨つぶの中：入るときに曲がる → うしろではね返る → 出るときにまた曲がる
SCENES.push({
  id: 'drop', night: true,
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(9, 40) + topBadge(true);
    const { cx, cy, R } = DR, P = dropPath();
    // しずくの形ではなく、まん丸
    const aO = 1 - prog(t, cue(1) - 1.3, 0.4);
    if (aO > 0) {
      const tear = `<path d="M 0 -170 C 40 -80 110 -20 110 50 A 110 110 0 0 1 -110 50 C -110 -20 -40 -80 0 -170 Z" fill="${RB.drop}" fill-opacity="0.32" stroke="${RB.dropLn}" stroke-width="8"/>`;
      let a = pop(tear + g(cross(0, 10, 1.0), { o: prog(t, cue(0) + 1.9, 0.25) }), t, cue(0) + 0.3, 560, 420);
      a += g(text(560, 660, 'しずくの かたち', { size: 48, w: 900, fill: '#f4efe2' }), { o: prog(t, cue(0) + 0.6, 0.4) });
      a += g(text(1340, 660, 'ほとんど まんまる', { size: 48, w: 900, fill: '#f4efe2' }) + okMark(1500, 300, 1.1), { o: prog(t, cue(0) + 3.0, 0.4) });
      out += g(a, { o: aO });
    }
    const mv = eio(prog(t, cue(1) - 1.1, 0.9));          // まん丸の雨つぶが、大きくなって まん中へ
    out += drop(lerp(1340, cx, mv), lerp(430, cy, mv), lerp(130, R, mv), prog(t, cue(0) + 2.6, 0.3));
    // 光の道
    out += g(sunDisc(110, P.E[1], 46, 0), { o: prog(t, cue(1) - 0.5, 0.4) });
    out += beam([170, P.E[1]], P.E, eo(prog(t, cue(1) - 0.2, 0.9)));
    out += g(`<line x1="${P.E[0]}" y1="${P.E[1]}" x2="${P.E[0] + 250}" y2="${P.E[1]}" stroke="#f4efe2" stroke-width="5" stroke-dasharray="14 12" opacity="0.7"/>`, { o: win(t, cue(1) + 1.0, cue(2) + 0.2, 0.3) });
    out += beam(P.E, P.B, eo(prog(t, cue(1) + 1.2, 1.0)));
    out += beam(P.B, P.X, eo(prog(t, cue(2) + 0.7, 0.9)));
    const end = [P.X[0] + P.d[0] * 330, P.X[1] + P.d[1] * 330], k3 = eo(prog(t, cue(3) + 0.6, 0.9));
    out += beam(P.X, end, k3);
    if (k3 >= 1) out += `<path d="M ${end[0] + P.d[0] * 26} ${end[1] + P.d[1] * 26} L ${end[0] - P.d[1] * 22} ${end[1] + P.d[0] * 22} L ${end[0] + P.d[1] * 22} ${end[1] - P.d[0] * 22} Z" fill="#fffbea"/>`;
    // うしろで ぴかっ
    const fl = win(t, cue(2) + 0.6, cue(2) + 1.6, 0.25);
    if (fl > 0) out += `<circle cx="${P.B[0]}" cy="${P.B[1]}" r="${40 + 30 * fl}" fill="#fffbea" opacity="${0.5 * fl}" filter="url(#soft)"/>`;
    out += tag(P.E[0], P.E[1], 430, 300, '① はいるとき まがる', prog(t, cue(1) + 1.6, 0.3), { col: C.ochre });
    out += tag(P.B[0], P.B[1], 1560, 290, '② うしろで はねかえる', prog(t, cue(2) + 1.0, 0.3), { col: C.blueUi });
    out += tag(P.X[0], P.X[1], 1440, 650, '③ でるとき また まがる', prog(t, cue(3) + 0.9, 0.3), { col: C.redUi });
    return out;
  },
});

// 5. 色に分かれるわけ：色ごとに曲がる角度がちがう
SCENES.push({
  id: 'colors', night: true,
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.night}"/>` + stars(9, 40) + topBadge(true);
    const { cx, cy, R } = DR, W = dropPath();
    out += sunDisc(110, W.E[1], 46, 0) + drop(cx, cy, R) + beam([170, W.E[1]], W.E, 1);
    // 白い光の中に いろいろな色
    const mk = prog(t, cue(0) + 0.8, 0.5);
    if (mk > 0) for (let i = 0; i < 14; i++) {
      const f = (t * 0.3 + i / 14) % 1, x = lerp(190, W.E[0] - 12, f);
      out += `<circle cx="${x.toFixed(1)}" cy="${W.E[1]}" r="8" fill="${RBC[i % 6]}" opacity="${mk}"/>`;
    }
    RBC.forEach((c, j) => { out += pop(ballG(0, 0, c, 22), t, cue(0) + 1.6 + j * 0.18, 215 + j * 90, 290); });
    out += pop(badge('いろいろな いろが まざっている', { fill: 'rgba(255,250,240,0.16)', color: '#f4efe2', size: 34 }), t, cue(0) + 2.8, 440, 400);
    // 前の場面の白い道（うすく）
    const wO = 0.5 * (1 - prog(t, cue(1) + 0.1, 0.5)), wEnd = [W.X[0] + W.d[0] * 330, W.X[1] + W.d[1] * 330];
    out += seg(W.E, W.B, 1, '#fffbea', 8, wO) + seg(W.B, W.X, 1, '#fffbea', 8, wO) + seg(W.X, wEnd, 1, '#fffbea', 8, wO);
    // 色ごとに少しずつちがう道
    const kA = eo(prog(t, cue(1) + 0.3, 1.0)), kB = eo(prog(t, cue(1) + 1.3, 1.0)), kC = eo(prog(t, cue(1) + 2.3, 1.2));
    const dim = 1 - 0.7 * win(t, cue(2) + 0.2, cue(3) - 0.1, 0.4);
    const ends = [];
    RBC.forEach((c, j) => {
      const p = dropPath(lerp(42.0, 38.4, j / 5)), e = [p.X[0] + p.d[0] * 330, p.X[1] + p.d[1] * 330], o = j === 0 || j === 5 ? 1 : dim;
      ends.push([p, e]);
      out += seg(W.E, p.B, kA, c, 8, o) + seg(p.B, p.X, kB, c, 8, o) + seg(p.X, e, kC, c, 9, o);
    });
    // 青やむらさきは、赤より少しだけ大きく曲がる
    const at = (j, len) => [ends[j][0].X[0] + ends[j][0].d[0] * len, ends[j][0].X[1] + ends[j][0].d[1] * len];
    const lo = win(t, cue(2) + 0.3, 1e9, 0.3);
    out += tag(...at(0, 235), 1150, 790, 'あか', lo, { col: '#d43a30', size: 44 });
    out += tag(...at(5, 230), 520, 650, 'むらさき', lo, { col: '#6f45d6', size: 44 });
    const cO = prog(t, cue(2) + 0.2, 0.4);
    if (cO > 0) {
      let c = card(680, 330) + text(0, -118, 'まがりかたの ちがい', { size: 40, w: 900 });
      c += `<rect x="-120" y="-70" width="240" height="200" rx="16" fill="${RB.drop}" opacity="0.6"/><line x1="-120" y1="-70" x2="-120" y2="130" stroke="${RB.dropLn}" stroke-width="8" stroke-linecap="round"/>`;
      c += `<line x1="-310" y1="-20" x2="-120" y2="-20" stroke="${C.ochre}" stroke-width="12" stroke-linecap="round"/><line x1="-120" y1="-20" x2="110" y2="-20" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/>`;
      const kk = eo(prog(t, cue(2) + 0.8, 0.9));
      c += seg([-120, -20], [110, 30], kk, RBC[0], 10) + seg([-120, -20], [110, 96], kk, RBC[5], 10);
      c += g(text(134, 30, 'あか', { size: 36, w: 900, fill: '#d43a30', anchor: 'start' }) + text(134, 98, 'むらさき', { size: 36, w: 900, fill: '#6f45d6', anchor: 'start' }), { o: prog(t, cue(2) + 1.5, 0.3) });
      out += g(c, { x: 1550, y: 310, o: cO });
    }
    out += kidShow('K', t, 1700, 846, { s: 0.56, start: cue(3) - 0.6, n: 0 });
    return out;
  },
});

// 6. ひとつの雨つぶから、ひとつの色：赤は高い雨つぶ、むらさきは低い雨つぶから
SCENES.push({
  id: 'which',
  draw(t) {
    let out = skyG('skq', '#3d78b8', '#a9d3ee') + topBadge();
    const GY = 830, EYE = [318, 702], DX = 1300, ang = j => lerp(27, 17, j / 5);
    const Y = j => EYE[1] - (DX - EYE[0]) * Math.tan(rad(ang(j)));   // j 番目の色を目に送る雨つぶの高さ
    const c1 = cue(1), d1 = cueE(1) - c1, tL = c1 + d1 * 0.45, c2 = cue(2);
    out += rainFx(880, 1900, 110, 780, t, { n: 34, seed: 6, o: 0.3 });
    // にじ（外がわが赤、内がわがむらさき）
    out += bow(DX, 900, 900 - Y(0) + 20, (Y(5) - Y(0) + 40) / 6, { k: eo(prog(t, c2 + 0.2, 1.6)), o: 0.62 });
    out += `<rect x="0" y="${GY}" width="1920" height="${1080 - GY}" fill="${RB.grass}"/><rect x="0" y="${GY}" width="1920" height="14" fill="${RB.grassDk}"/>`;
    // お日さまの光（左から）
    const sun = (y, st) => { const k = eo(prog(t, st, 0.9)); return k <= 0 ? '' : seg([0, y], [DX - 60, y], k, RB.ray, 10, 0.85) + (k >= 1 ? `<path d="M ${DX - 52} ${y} L ${DX - 86} ${y - 17} L ${DX - 86} ${y + 17} Z" fill="${RB.ray}"/>` : ''); };
    out += sun(Y(0), 0.2) + sun(Y(5), tL - 1.2);
    out += g(text(250, Y(0) - 44, 'おひさまの ひかり', { size: 36, w: 900, fill: '#fff', extra: `stroke="#2f5f95" stroke-width="10" paint-order="stroke" stroke-linejoin="round"` }), { o: prog(t, 0.9, 0.4) });
    // 雨つぶから出る色のおうぎ。target の色だけが目にとどく
    const fan = (y, target, st) => {
      const k = eo(prog(t, st, 1.2)), dimK = prog(t, st + 2.2, 0.5), gone = 1 - prog(t, c2 - 0.1, 0.5);
      let s = '';
      RBC.forEach((c, j) => {
        const a = rad(ang(j)), hit = j === target;
        const len = hit ? (DX - EYE[0]) / Math.cos(a) : Math.min((DX - 150) / Math.cos(a), (GY - y) / Math.sin(a));
        s += seg([DX, y], [DX - Math.cos(a) * len, y + Math.sin(a) * len], k, c, hit ? 11 : 7, hit ? 1 : lerp(0.95, 0.4, dimK) * gone);
      });
      return s;
    };
    out += fan(Y(0), 0, cue(0) + 0.6) + fan(Y(5), 5, tL);
    // あいだの雨つぶ（2 で出る）：それぞれ ひとつの色
    [1, 2, 3, 4].forEach((j, i) => {
      const st = c2 + 0.3 + i * 0.2, a = rad(ang(j)), len = (DX - EYE[0]) / Math.cos(a);
      out += seg([DX, Y(j)], [DX - Math.cos(a) * len, Y(j) + Math.sin(a) * len], eo(prog(t, st, 0.8)), RBC[j], 8) + drop(DX, Y(j), 17, prog(t, st - 0.2, 0.3));
    });
    const rr = lerp(46, 19, eio(prog(t, c2 - 0.2, 0.5)));
    out += drop(DX, Y(0), rr, prog(t, 0.2, 0.3)) + drop(DX, Y(5), rr, prog(t, tL - 1.4, 0.3));
    out += kidShow('S', t, 300, GY + 4, { s: 0.36, start: 0.1, n: 0, bubble: false, look: [8, -7] });
    // 目にとどいた しるし
    const sp = Math.max(win(t, cue(0) + 1.5, cue(0) + 2.6, 0.3), win(t, tL + 1.1, tL + 2.2, 0.3));
    if (sp > 0) out += `<circle cx="${EYE[0]}" cy="${EYE[1]}" r="${26 + 16 * sp}" fill="none" stroke="#fff" stroke-width="6" opacity="${sp}"/>`;
    out += pop(badge('めに とどくのは ひとつの いろだけ', { fill: C.ink, size: 40 }), t, cue(0) + 2.2, 1040, 700, { end: c1 - 0.2 });
    const before = t < c2;
    out += tag(DX + 34, Y(0), 1640, Y(0), before ? 'たかい：あか' : 'そとがわは あか', prog(t, c1 + 0.4, 0.3) * (1 - win(t, c2 - 0.3, c2 + 0.3, 0.3)), { col: '#d43a30' });
    out += tag(DX + 34, Y(5), 1640, Y(5), before ? 'ひくい：むらさき' : 'うちがわは むらさき', prog(t, tL + 0.6, 0.3) * (1 - win(t, c2 - 0.3, c2 + 0.3, 0.3)), { col: '#6f45d6' });
    return out;
  },
});

// 7. ほんとうは丸い輪：下は地面にかくれる。お日さまが低いほど大きく、夏のお昼は見えない
SCENES.push({
  id: 'circle',
  draw(t) {
    const HY = 600, R = 380, CX = 960;
    const gk = eo(prog(t, cue(0) + 2.6, 1.2));       // 地面が出てきて、下をかくす
    // お日さまの高さ（度）：ふつう → 低い → 高すぎる（夏のお昼）
    const h = lerp(lerp(14, 3, eio(prog(t, cue(1) - 0.2, 1.6))), 50, eio(prog(t, cue(2) - 0.2, 2.6)));
    const cyR = lerp(470, HY + R * h / 42, gk);
    let out = skyG('skc', '#4c97dc', '#d6edfa') + topBadge();
    out += cloud(1560, 150, 0.7, '#fff', 0.8);
    out += ring(CX, cyR, R, 16, prog(t, 0.3, 0.6));
    out += `<rect x="0" y="${HY}" width="1920" height="${1080 - HY}" fill="${RB.grass}" opacity="${0.9 * gk}"/><rect x="0" y="${HY}" width="1920" height="12" fill="${RB.grassDk}" opacity="${gk}"/>`;
    out += `<clipPath id="cdn"><rect x="0" y="${HY + 12}" width="1920" height="${1080 - HY}"/></clipPath>`;
    out += g(`<g clip-path="url(#cdn)"><circle cx="${CX}" cy="${cyR}" r="${R}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="16 14"/><circle cx="${CX}" cy="${cyR}" r="${R - 96}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="16 14"/></g>`, { o: gk * 0.9 });
    out += g(tree(230, HY + 14, 0.7) + house(1700, HY + 14, 0.75) + tree(1820, HY + 14, 0.55), { o: gk });
    out += pop(badge('ほんとうは まるい わ', { fill: C.accent, size: 42 }), t, cue(0) + 0.6, 1610, 290, { end: cue(1) - 0.3 });
    out += tag(CX + Math.sqrt(Math.max(0, R * R - Math.pow(740 - cyR, 2))) - 8, 740, 1650, 760, 'じめんの した', win(t, cue(0) + 4.0, cue(1) - 0.3, 0.3));
    // お日さまの高さ
    const dk = prog(t, cue(1) - 0.6, 0.5);
    if (dk > 0) {
      const hd = Math.min(78, h * 1.56), ax = 70, ay = 105, ar = 185, sx = ax - ar * Math.cos(rad(hd)), sy = ay - ar * Math.sin(rad(hd));
      let d = card(430, 350) + text(0, -132, 'おひさまの たかさ', { size: 36, w: 900 });
      d += `<path d="M ${ax - ar} ${ay} A ${ar} ${ar} 0 0 1 ${ax} ${ay - ar}" fill="none" stroke="${C.muted}" stroke-width="4" stroke-dasharray="8 10"/>`;
      d += `<line x1="${ax}" y1="${ay - 46}" x2="${sx}" y2="${sy}" stroke="${C.ochre}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
      d += `<line x1="-185" y1="${ay}" x2="185" y2="${ay}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
      d += person(ax, ay, 0.62) + `<circle cx="${sx}" cy="${sy}" r="24" fill="${C.yellow}" stroke="#e39a00" stroke-width="4"/>`;
      out += g(d, { x: 300, y: 320, o: dk });
    }
    out += pop(badge('おひさまが ひくい', { fill: C.ochre, size: 42 }), t, cue(1) + 0.8, 1620, 250, { end: cue(2) - 0.3 });
    out += pop(badge('にじは おおきい', { fill: C.accent, size: 42 }), t, cue(1) + 1.8, 1620, 340, { end: cue(2) - 0.3 });
    out += pop(badge('おひさまが たかすぎる', { fill: C.ochre, size: 40 }), t, cue(2) + 0.6, 1620, 250);
    out += pop(badge('にじは じめんの した', { fill: C.redUi, size: 40 }), t, cue(2) + 3.0, 1620, 340);
    out += pop(ngMark(-150, 0, 1.0) + text(-90, 2, 'みえない', { size: 56, w: 900, fill: '#fff', anchor: 'start', extra: STROKE }), t, cue(2) + 3.6, 960, 400);
    return out;
  },
});

// 8. だから雨のあと：3つがそろうとき
SCENES.push({
  id: 'after',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, sw = cue(2) - 0.9, aO = 1 - prog(t, sw, 0.4);
    // 3つ そろうと にじ
    if (aO > 0) {
      let a = g(text(960, 200, '3つ そろうと、にじが できる', { size: 62, w: 900 }), { o: prog(t, cue(0) + 0.2, 0.4) });
      const icons = [
        sunDisc(-110, -70, 46, 0, { glow: 0.5 }) + person(90, 70, 1.25) + arrow2(-60, -42, 44, 4, C.ochre, 9),
        person(-150, 60, 1.25) + [[40, -100], [110, -40], [30, 10], [150, -110], [170, 30], [90, 50]].map(([x, y]) => drop(x, y, 20)).join(''),
        sunDisc(-130, -60, 40, 0, { glow: 0.5 }) + [[70, -30, 0], [140, 40, 1], [160, -90, 2]].map(([x, y]) => `<line x1="-84" y1="-50" x2="${x - 30}" y2="${y - 8}" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="38" fill="#fff6c2" opacity="0.8" filter="url(#soft)"/>` + drop(x, y, 24)).join(''),
      ];
      const labels = ['おひさまが うしろ', 'まえに あめつぶ', 'あめつぶに ひかりが あたる'], cols = [C.ochre, C.blueUi, '#d4612a'];
      [0, 0.34, 0.63].forEach((f, i) => {
        const st = c1 + d1 * f, ck = prog(t, st, 0.35);
        a += pop(card(540, 420) + g(text(0, 10, '？', { size: 150, w: 900, fill: C.line }), { o: 1 - ck }) +
          g(g(icons[i], { y: -30, s: 1.15 }) + text(0, 156, labels[i], { size: 38, w: 900 }), { o: ck, s: lerp(0.9, 1, eo(ck)) }) +
          `<circle cx="-210" cy="-150" r="40" fill="${cols[i]}"/>` + text(-210, -147, i + 1, { size: 48, w: 900, fill: '#fff' }), t, cue(0) + 1.0 + i * 0.5, 360 + i * 600, 540);
      });
      out += g(a, { o: aO });
    }
    // 3つの場面でくらべる
    const bO = prog(t, sw + 0.3, 0.4);
    if (bO > 0) {
      let b = chipsRow([['① おひさまが うしろ', C.ochre], ['② まえに あめつぶ', C.blueUi], ['③ ひかりが あたる', '#d4612a']], t, 1020, 170, { size: 36, gap: 28, start: sw + 0.3, step: 0.15 });
      const P = [
        ['rain', 'あめの あいだ', 'おひさまが くもの なか', cue(2) - 0.2, false],
        ['clear', 'すっかり やんだ あと', 'あめつぶが ない', cue(3) - 0.2, false],
        ['after', 'とおりすぎた すぐあと', '3つ そろった！', cue(4) - 0.2, true],
      ];
      P.forEach(([kind, ttl, why, st, ok], i) => {
        const x = 360 + i * 600, mt = ok ? cue(4) + 3.4 : st + 2.0, mk = prog(t, mt, 0.3);
        let p = (ok && mk > 0 ? `<rect x="-286" y="-196" width="572" height="392" rx="34" fill="none" stroke="${C.ochre}" stroke-width="10" opacity="${mk}"/>` : '') +
          wx(kind, 540, 360, t, 'af' + i, { bowK: eo(prog(t, cue(4) + 1.4, 1.6)) });
        p += g(ok ? okMark(220, -130, 1.1) : ngMark(220, -130, 1.1), { o: mk });
        p += g(badge(ttl, { fill: ok ? C.accent : C.ink, size: 38 }), { y: 236 });
        p += g(text(0, 312, why, { size: 38, w: 900, fill: ok ? C.accent : C.redUi }), { o: prog(t, mt - 0.4, 0.3) });
        b += pop(p, t, st, x, 480);
      });
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
      let a = pop(card(1240, 190) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, -36, 'あまぐもが とおりすぎて、', { size: 52, w: 900, anchor: 'start' }) + text(-440, 36, 'すぐに おひさまが でたとき', { size: 52, w: 900, anchor: 'start' }) +
        g(wx('after', 210, 140, t, 'ans', { who: false }), { x: 480 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="66" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -150, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['おひさまが うしろ', C.ochre], ['まえに あめつぶ', C.blueUi], ['ひかりが あたる', '#d4612a']], t, 960, 680, { start: 2.6, step: 0.9 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const sunIc = `<circle r="34" fill="${C.yellow}"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${Math.cos(rad(a)) * 44}" y1="${Math.sin(rad(a)) * 44}" x2="${Math.cos(rad(a)) * 58}" y2="${Math.sin(rad(a)) * 58}" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round"/>`).join('');
      const sprayIc = `<rect x="-52" y="-12" width="60" height="24" rx="8" fill="${C.accent}"/><path d="M 8 -8 L 26 -14 L 26 14 L 8 8 Z" fill="${C.ink}"/>` + [[44, -22], [50, 0], [44, 22], [66, -34], [72, -10], [72, 12], [66, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${RB.streak}"/>`).join('');
      const items = [
        [sunIc, 'よく はれた ひに、おとなと いっしょに', 'おひさまを せなかに して たつ', C.ink, 330],
        [sprayIc, 'ホースや きりふきで まえに みずしぶき', '→ あたまの かげの まわりに にじ', C.ink, 480],
        [warnIcon(0.9), 'おひさまは ぜったいに ちょくせつ みない', null, C.red, 620],
        [warnIcon(0.9), 'みずは ひとや でんきの ものに むけない', null, C.red, 730],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + (s2 ? text(110, -28, s1, { size: 40, w: 900, anchor: 'start', fill: col }) + text(110, 30, s2, { size: 40, w: 900, anchor: 'start', fill: col }) : text(110, 2, s1, { size: 40, w: 900, anchor: 'start', fill: col })), t, cue(i + 1), 210, y);
      });
      // 絵：お日さまを背中に、前に水しぶき。頭のかげのまわりに にじ
      const GY = 806, KX = 1290, KS = 0.56, HD = [1700, GY - 4], NZ = [KX + 96, GY - 166], sk = prog(t, cue(2) + 0.6, 0.6);
      let p = `<rect x="1130" y="${GY - 6}" width="760" height="14" rx="7" fill="${RB.grassDk}"/>`;
      p += g(sunIc, { x: 1200, y: 280, s: 1.5 });
      p += seg([1262, 330], [1262 + 200, 330 + 128], eo(prog(t, cue(1) + 0.8, 0.8)), C.yellow, 9, 0.9) + seg([1240, 362], [1240 + 150, 362 + 96], eo(prog(t, cue(1) + 0.9, 0.8)), C.yellow, 7, 0.9);
      // かげ（お日さまの反対がわへのびる）
      p += `<path d="M ${KX - 30} ${GY - 2} L ${HD[0] - 30} ${GY - 14} A 24 14 0 1 1 ${HD[0] - 28} ${GY + 6} L ${KX + 30} ${GY + 4} Z" fill="#3d311f" opacity="0.26"/>`;
      if (sk > 0) {
        for (let i = 0; i < 110; i++) {
          const f = (t * 0.45 + rnd(i, 21)) % 1, a = rad(-34 + rnd(i, 22) * 50), d = 30 + f * 470;
          p += `<circle cx="${(NZ[0] + Math.cos(a) * d).toFixed(1)}" cy="${(NZ[1] + Math.sin(a) * d * 0.8 + f * f * 170).toFixed(1)}" r="${(4 + rnd(i, 23) * 4).toFixed(1)}" fill="${RB.streak}" opacity="${(0.5 * sk * Math.min(1, f * 8, (1 - f) * 3)).toFixed(2)}"/>`;
        }
        p += ring(HD[0], HD[1], 190, 9, 0.95 * eo(prog(t, cue(2) + (cueE(2) - cue(2)) * 0.55, 0.8)));
        p += `<rect x="1130" y="${GY + 8}" width="760" height="240" fill="${C.paper}"/>`;
      }
      b += g(p, { o: prog(t, cue(1) + 0.2, 0.4) });
      b += g(`<path d="M ${KX - 120} ${GY - 4} Q ${KX - 70} ${GY - 210} ${NZ[0] - 26} ${NZ[1] + 4}" fill="none" stroke="${C.accent}" stroke-width="10" stroke-linecap="round"/><rect x="${NZ[0] - 34}" y="${NZ[1] - 9}" width="38" height="18" rx="5" fill="${C.ink}" transform="rotate(-12 ${NZ[0]} ${NZ[1]})"/>`, { o: sk });
      b += kidShow('S', t, KX, GY, { s: KS, start: cue(1) + 0.3, n: 0, bubble: false, pose: 'point', look: [8, 0] });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「にじ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
