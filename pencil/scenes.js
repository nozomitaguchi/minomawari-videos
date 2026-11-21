// みのまわり図鑑 動画「えんぴつは、どうして けしゴムで きえるの？」
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
const TOPIC = 'えんぴつ';
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
// みのまわり図鑑 動画「えんぴつは、どうして けしゴムで きえるの？」（えんぴつ）
// 出どころ：everyday-trivia trivia/pencil-basics.md, vinyl-eraser.md, crayon-resist-eraser.md

// ---------- えんぴつの道具 ----------
const PC = {
  paper: '#f7efd9', fiber: '#e3d6b6', fiberDk: '#cdbd96', gra: '#3d3d42', graLt: '#77777f', pencil: '#5d5d64',
  wood: '#ecc590', woodDk: '#c99b5e', paint: '#3f8f6a', paintLt: '#5aa884', paintDk: '#2f6f52',
  erSh: '#d9d9df', sleeve: '#2f7de1', sleeveDk: '#1f5fb8', crumb: '#c4c0b6', crumbDk: '#98948a',
  red: '#e2543e', redDk: '#b83a28', redLt: '#f09a8a', desk: '#ead9b6', deskDk: '#d9c59a',
  bread: '#efc37e', breadDk: '#b9803a', rubber: '#9a6a44', rubberDk: '#6f4a2c', old: '#f3e6c4',
};
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 44 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
const titleAt = (str, t, st, en = 1e9, col = C.ink, x = 960, y = 170, size = 46) => pop(badge(str, { fill: col, size }), t, st, x, y, { end: en });

// えんぴつ（先が右。先の点が 0,0。L: 長さ、cut: 中の芯を見せる 0〜1）
function pencilPic(L = 600, { cut = 0, col = PC.paint, lt = PC.paintLt, dk = PC.paintDk, lead = PC.gra } = {}) {
  let s = `<rect x="${-L}" y="-35" width="${L - 108}" height="70" fill="${col}"/><rect x="${-L}" y="-35" width="${L - 108}" height="22" fill="${lt}"/><rect x="${-L}" y="13" width="${L - 108}" height="22" fill="${dk}"/>`;
  s += `<rect x="${-L - 8}" y="-35" width="18" height="70" rx="5" fill="${dk}"/>`;
  s += `<path d="M -110 -35 L -34 -11 L -34 11 L -110 35 Z" fill="${PC.wood}"/><path d="M -110 -35 L -34 -11 L -34 -4 L -110 -13 Z" fill="#f5d9ae"/><path d="M -34 -11 L 0 0 L -34 11 Z" fill="${lead}"/>`;
  if (cut > 0) s += g(`<rect x="${-L + 150}" y="-35" width="${L - 258}" height="70" fill="${PC.wood}"/><rect x="${-L + 150}" y="-35" width="${L - 258}" height="6" fill="${PC.woodDk}"/><rect x="${-L + 150}" y="29" width="${L - 258}" height="6" fill="${PC.woodDk}"/>` +
    `<path d="M ${-L + 150} -11 L -34 -11 L -34 11 L ${-L + 150} 11 Z" fill="${lead}"/>`, { o: cut });
  return s;
}
// 消しゴム（まん中が 0,0。右がわに 紙のケース）
function eraserPic(w = 220, h = 110, { dirty = 0 } = {}) {
  let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.14}" fill="#fff" stroke="${PC.erSh}" stroke-width="4"/>`;
  if (dirty > 0) s += `<path d="M ${-w / 2 + 2} ${-h * 0.2} Q ${-w / 2 + w * 0.16} 0 ${-w / 2 + 2} ${h * 0.34} Z" fill="${PC.gra}" opacity="${0.75 * dirty}"/><rect x="${-w / 2 + 2}" y="${-h / 2 + h * 0.3}" width="${w * 0.07}" height="${h * 0.56}" rx="${w * 0.03}" fill="${PC.gra}" opacity="${0.75 * dirty}"/>`;
  s += `<path d="M ${-w * 0.14} ${-h / 2 - 3} L ${w / 2 + 3} ${-h / 2 - 3} L ${w / 2 + 3} ${h / 2 + 3} L ${-w * 0.14} ${h / 2 + 3} Z" fill="${PC.sleeve}"/><rect x="${-w * 0.14}" y="${-h * 0.12}" width="${w * 0.64 + 3}" height="${h * 0.24}" fill="#fff"/>` +
    `<rect x="${-w * 0.14}" y="${h / 2 - h * 0.12}" width="${w * 0.64 + 3}" height="${h * 0.12 + 3}" fill="${PC.sleeveDk}"/>`;
  return s;
}
// 消しかす（くるっと まるまった 消しゴムのくず）。dots: 中の黒いつぶの数
function crumbPic(x, y, s = 1, rot = 0, dots = 3, o = 1, col = PC.crumb) {
  if (o <= 0.01) return '';
  let b = `<path d="M -52 0 C -54 -20 -20 -22 0 -16 C 24 -24 54 -16 52 2 C 54 18 22 20 0 15 C -22 22 -50 18 -52 0 Z" fill="${col}" stroke="${PC.crumbDk}" stroke-width="4"/><path d="M -34 -4 Q -10 8 14 -4 Q 30 -10 38 2" fill="none" stroke="${PC.crumbDk}" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>`;
  for (let i = 0; i < dots; i++) b += `<ellipse cx="${-30 + i * (60 / Math.max(1, dots - 1 || 1)) + (dots === 1 ? 30 : 0)}" cy="${(i % 2 ? 6 : -5)}" rx="8" ry="5.5" fill="${PC.gra}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity="${clamp(o)}">${b}</g>`;
}
// 黒鉛のつぶ
const gp = (x, y, r = 9, a = 0, o = 1, col = PC.gra) => o <= 0.01 ? '' : `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.66}" fill="${col}" transform="rotate(${a} ${x} ${y})" opacity="${clamp(o)}"/>`;
// 紙を横から大きく見た絵（せんいが からまっている）
const _fm = {};
function fiberMat(x0, x1, y, depth = 170, seed = 1) {
  const key = [x0, x1, y, depth, seed].join(','); if (_fm[key]) return _fm[key];
  const id = 'fm' + seed + '_' + x0;
  let s = `<clipPath id="${id}"><rect x="${x0}" y="${y - 16}" width="${x1 - x0}" height="${depth + 16}" rx="12"/></clipPath><g clip-path="url(#${id})"><rect x="${x0}" y="${y + 8}" width="${x1 - x0}" height="${depth}" fill="${PC.paper}"/>`;
  const n = Math.round((x1 - x0) / 8);
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(i, seed) * (x1 - x0), yy = y + 6 + Math.pow(rnd(i, seed + 1), 0.8) * (depth - 16), len = 50 + rnd(i, seed + 2) * 70, a = (rnd(i, seed + 3) - 0.5) * 0.9;
    const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2, b = (rnd(i, seed + 4) - 0.5) * 26;
    s += `<path d="M ${(x - dx).toFixed(1)} ${(yy - dy).toFixed(1)} Q ${x.toFixed(1)} ${(yy + b).toFixed(1)} ${(x + dx).toFixed(1)} ${(yy + dy).toFixed(1)}" fill="none" stroke="${i % 3 ? PC.fiber : PC.fiberDk}" stroke-width="${(6 + rnd(i, seed + 5) * 3).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return _fm[key] = s + '</g>';
}
const PY = 640;   // 紙の表面の高さ（大きくした絵）
// ノート（わくの中に 線）
function notebook(x, y, w, h, { lines = 5, fill = '#fff' } = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}" filter="url(#shadow)"/>`;
  for (let i = 1; i <= lines; i++) s += `<line x1="${x + 30}" y1="${y + i * h / (lines + 1)}" x2="${x + w - 30}" y2="${y + i * h / (lines + 1)}" stroke="#cfe0ee" stroke-width="4"/>`;
  return s + `<line x1="${x + 90}" y1="${y + 14}" x2="${x + 90}" y2="${y + h - 14}" stroke="#f2c4c0" stroke-width="4"/>`;
}
const deskBg = () => `<rect width="1920" height="1080" fill="${PC.desk}"/>` + [0, 1, 2, 3].map(i => `<path d="M 0 ${150 + i * 260} Q 960 ${120 + i * 260 + (i % 2 ? 40 : -30)} 1920 ${160 + i * 260}" fill="none" stroke="${PC.deskDk}" stroke-width="5" opacity="0.5"/>`).join('');

// 1. つかみ：えんぴつの字を 消しゴムで ごしごし → きえた
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c2 = cue(2), c3 = cue(3);
    let out = deskBg() + notebook(220, 170, 1100, 620);
    const LX = [440, 660, 880, 1100], LYc = 440, S = [c0 + 0.9, c0 + 2.0, c2 + 0.3, c2 + 1.4];
    'えんぴつ'.split('').forEach((ch, i) => { out += g(text(0, 0, ch, { size: 210, w: 900, fill: PC.pencil, ls: 0 }), { x: LX[i], y: LYc, o: 1 - prog(t, S[i] + 0.1, 0.7) }); });
    // 消しかす
    LX.forEach((x, i) => { for (let k = 0; k < 3; k++) out += crumbPic(x - 60 + k * 62 + rnd(i, k) * 20, 596 + rnd(i, k + 5) * 34, 0.62, rnd(i, k + 9) * 80 - 40, 2, prog(t, S[i] + 0.3 + k * 0.16, 0.2)); });
    out += g(pencilPic(560), { x: 900, y: 716, r: -3 });
    // 消しゴム
    let ex = LX[0]; for (let i = 1; i < 4; i++) ex += (LX[i] - LX[i - 1]) * eio(prog(t, S[i] - 0.4, 0.4));
    const rub = S.some(s => t > s && t < s + 0.9) ? 1 : 0, inK = eo(prog(t, c0 + 0.2, 0.6)), outK = eio(prog(t, S[3] + 1.0, 0.6));
    const ebx = lerp(lerp(1500, ex, inK), 1190, outK) + rub * Math.sin(t * 16) * 56, eby = lerp(lerp(120, LYc, inK), 668, outK) + rub * Math.cos(t * 16) * 16;
    out += g(g(eraserPic(250, 124), { r: -24 }), { x: ebx, y: eby, o: prog(t, c0 + 0.2, 0.3) });
    out += g(text(0, 0, 'ごしごし', { size: 60, w: 900, fill: C.ochre }), { x: 760 + Math.sin(t * 16) * 5, y: 244, o: win(t, c0 + 1.0, c0 + 3.0, 0.2) + win(t, c2 + 0.4, c2 + 2.2, 0.2), r: -5 });
    out += kidShow('S', t, 1620, 850, { s: 0.66, start: 0.3, n: 0, side: 'left', size: 50 });
    out += g(text(0, 0, '？', { size: 200, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 770, y: 430, o: win(t, c3 + 0.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">えんぴつは、どうして</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${PC.sleeve}">けしゴム</tspan>で きえるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(pencilPic(420), { x: 60, y: 0, r: -8 }) + g(eraserPic(210, 104), { x: 290, y: 4, r: 12 }), t, t0 + 1.8, 860, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'えんぴつの じが、けしゴムで きえるのは どうして？', { size: 56, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'けしゴムが、くろい いろを、しろく ぬりつぶすから'], ['②', 'けしゴムが、かみを、うすく けずりとるから'], ['③', 'くろい つぶが、かみから、けしゴムに、くっつくから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 42)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(g(eraserPic(230, 114), { r: -16 }) + text(96, -110, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1670, 360);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 書けるしくみ：芯（黒鉛＋ねん土）→ 紙にこすれて くだける → つぶが せんいに くっつく
SCENES.push({
  id: 'write',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A. えんぴつの中
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const TX = 1560, TY = 410, SC = 1.5;
      let a = g(pencilPic(820, { cut: prog(t, c0 + 0.6, 0.6) }), { x: TX, y: TY, s: SC });
      a += tag(TX - 420 * SC, TY, 1060, 250, 'しん', prog(t, c0 + 1.2, 0.3), { col: PC.gra, size: 50 });
      a += chipsRow([['こくえん（くろい こな）', PC.gra], ['＋ ねんど', PC.woodDk], ['→ やいて かためる', C.redUi]], t, 960, 620, { start: c0 + 2.6, step: 1.5, size: 42, gap: 26 });
      a += tag(TX - 560 * SC, TY - 26 * SC, 560, 250, 'まわりの き', prog(t, c1 + 0.4, 0.3), { col: PC.woodDk, size: 46 });
      a += chipsRow([['しんを まもる', PC.woodDk], ['てを くろく しない', PC.woodDk]], t, 960, 730, { start: c1 + 1.6, step: 1.6, size: 42, gap: 26 });
      out += g(a, { o: aO });
    }
    // B. 大きくして見る：芯がくだけて、つぶが せんいに くっつく
    const bO = prog(t, c2 - 0.2, 0.4);
    if (bO > 0) {
      const X0 = 80, X1 = 1560, PS = 2.6, tx = lerp(560, 1120, prog(t, c2 + 0.5, cueE(3) - c2 - 0.5));
      let b = fiberMat(X0, X1, PY, 170, 1);
      // 紙についた つぶ
      for (let i = 0; i < 26; i++) { const x = 570 + i * 22 + (rnd(i, 2) - 0.5) * 10; if (x < tx - 8) b += gp(x, PY + 2 + rnd(i, 3) * 18, 11 + rnd(i, 4) * 5, rnd(i, 5) * 180, clamp((tx - x) / 20)); }
      // くだけて とぶ つぶ
      if (t > c2 + 0.5 && t < cueE(3)) for (let i = 0; i < 5; i++) { const p = (t * 1.7 + i / 5) % 1; b += gp(tx - 10 - p * 80, PY - 6 - Math.sin(p * Math.PI) * 46, 9, p * 300, 1 - p); }
      b += g(pencilPic(900), { x: tx, y: PY - 2 + Math.sin(t * 22) * 1.5, s: PS, r: 125 });
      // ふつうの大きさの絵（左上）
      const k = prog(t, c2 + 0.5, cueE(3) - c2 - 0.5);
      b += notebook(110, 250, 410, 230, { lines: 3 }) + `<line x1="230" y1="382" x2="${230 + 190 * k}" y2="382" stroke="${PC.pencil}" stroke-width="9" stroke-linecap="round"/>` + g(pencilPic(190), { x: 232 + 190 * k, y: 380, r: 125, s: 0.9 });
      b += g(lensIcon(), { x: 222 + 190 * k, y: 394, s: 0.42 });
      b += g(text(0, 0, 'おおきく すると…', { size: 34, w: 900, fill: C.blueUi }), { x: 315, y: 524 });
      b += tag(300, PY + 96, 300, PY - 40, 'かみの せんい', prog(t, c2 + 1.6, 0.3), { col: PC.woodDk, size: 38 });
      b += tag(660, PY + 8, 760, 500, 'こくえんの つぶ', clamp((tx - 1010) / 40), { col: PC.gra, size: 40 });
      out += g(b, { o: bO });
      out += titleAt('しんが、すこしずつ くだける', t, c2 + 0.3, c3, PC.gra, 430, 180, 40) + titleAt('つぶが、かみの せんいに くっつく', t, c3 + 0.2, 1e9, PC.gra, 430, 180, 38);
    }
    out += kidShow('B', t, 1740, 850, { s: 0.48, start: c4 - 0.9, n: 0, side: 'left', size: 42 });
    return out;
  },
});

// 4. 消えるしくみ：消しゴムのほうに くっつきやすい → 表面にくっつく → 消しかすに つつまれる → とりのぞかれる → 新しい面
const ERP = { n: 24, x0: 520, dx: 40, w: 460, h: 330, cr: [1400, 1270, 1140, 1010, 880, 750] };
// 横から見た 大きな消しゴム（下の面が y）。dirty: 下の面の黒さ
function eraserBig(x, y, o = 1) {
  if (o <= 0.01) return '';
  const { w, h } = ERP;
  return g(`<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="34" fill="#fff" stroke="${PC.erSh}" stroke-width="6"/><path d="M ${-w / 2 - 4} ${-h - 4} L ${w / 2 + 4} ${-h - 4} L ${w / 2 + 4} ${-h * 0.42} L ${-w / 2 - 4} ${-h * 0.42} Z" fill="${PC.sleeve}"/><rect x="${-w / 2 - 4}" y="${-h * 0.8}" width="${w + 8}" height="${h * 0.16}" fill="#fff"/><rect x="${-w / 2 - 4}" y="${-h * 0.5}" width="${w + 8}" height="${h * 0.08}" fill="${PC.sleeveDk}"/>`, { x, y, o });
}
SCENES.push({
  id: 'erase',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4), c5 = cue(5);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge() + fiberMat(80, 1840, PY, 170, 2);
    // 消しゴムの動き：おりてくる → 右へ こする → 左へ もどりながら 消しかす → 上へ はなれる
    const sw1 = eio(prog(t, c2 + 0.4, cueE(2) + 0.5 - c2 - 0.4)), sw2 = eio(prog(t, c3 + 0.3, cueE(3) + 0.9 - c3 - 0.3));
    const rubbing = (t > c2 + 0.4 && sw1 < 1) || (t > c3 + 0.3 && sw2 < 1) ? 1 : 0;
    const sx = lerp(lerp(260, 1500, sw1), 500, sw2), sxMax = t > c3 ? 1500 : sx, ex = sx + rubbing * Math.sin(t * 11) * 34;
    const lift = eio(prog(t, c4 + 0.3, 1.0)), ey = lerp(-80, PY - 6, eo(prog(t, c0 + 0.4, 1.0))) - lift * 760;
    // 黒鉛のつぶ
    let parts = '';
    for (let i = 0; i < ERP.n; i++) {
      const x0 = ERP.x0 + i * ERP.dx, y0 = PY + 4 + rnd(i, 3) * 18, rel = ((i * 137) % 380) - 190, j = i % 6, cx = ERP.cr[j];
      const u1 = clamp((sxMax - (x0 - 150)) / 70);            // 紙 → 消しゴムの下の面
      const u2 = t > c3 + 0.3 ? clamp((cx + 70 - (sx + ERP.w / 2)) / 60) : 0;   // 消しゴム → 消しかす
      if (u2 >= 1) continue;   // 消しかすの中（消しかすの絵にかいてある）
      const px = lerp(lerp(x0, ex + rel, eo(u1)), cx + ((i * 53) % 60) - 30, u2), py = lerp(lerp(y0, ey - 12, eo(u1)), PY - 10, u2);
      parts += gp(px, py, 11 + rnd(i, 4) * 4, rnd(i, 5) * 180);
    }
    // 消しかす
    const sweepOff = eio(prog(t, c4 + 2.6, 1.6));
    let crumbs = '';
    ERP.cr.forEach((cx, j) => { const u = t > c3 + 0.3 ? clamp((cx + 70 - (sx + ERP.w / 2)) / 60) : 0; if (u > 0) crumbs += crumbPic(cx + sweepOff * (1900 - cx + 200) * (1 + j * 0.08), PY - 10 - Math.sin(sweepOff * Math.PI) * 60, 1.15 * back(u), rnd(j, 7) * 40 - 20 + sweepOff * 300, u >= 1 ? 5 : 0, 1 - prog(sweepOff, 0.75, 0.25)); });
    out += crumbs + eraserBig(ex, ey, 1 - prog(lift, 0.7, 0.3)) + g(parts, { o: 1 - prog(lift, 0.7, 0.3) * (t > c4 ? 1 : 0) });
    // ことば
    out += titleAt('けしゴムで こすると…？', t, c0 + 0.3, c1, C.ink) + g(text(0, 0, '？', { size: 170, w: 900, fill: C.ochre }), { x: 1000, y: 400, o: win(t, c0 + 1.2, c1 - 0.1, 0.3) });
    out += tag(700, PY + 12, 860, 500, 'こくえんの つぶ', win(t, c0 + 1.6, c1 + 0.3, 0.3), { col: PC.gra, size: 40 });
    // くっつきやすさ くらべ
    const kO = win(t, c1 + 0.3, c2 - 0.1, 0.35);
    if (kO > 0) {
      let k = card(900, 400) + ctext(0, -140, 'どっちに くっつきやすい？', { size: 40, w: 900, fill: C.muted });
      k += `<rect x="-380" y="-70" width="250" height="150" rx="24" fill="${PC.paper}" stroke="${PC.fiberDk}" stroke-width="6"/>` + ctext(-255, 6, 'かみ', { size: 54, w: 900, fill: PC.woodDk });
      k += `<rect x="130" y="-70" width="250" height="150" rx="24" fill="#fff" stroke="${PC.sleeve}" stroke-width="8"/>` + ctext(255, 6, 'けしゴム', { size: 50, w: 900, fill: PC.sleeveDk });
      const pk = eio(prog(t, c1 + 2.4, 1.2)), px = lerp(0, 96, pk);
      k += arrow2(-36, 5, -100, 5, PC.fiberDk, 7) + arrow2(40, 5, 112, 5, PC.sleeve, 18) + gp(px, 5, 22, 20);
      k += pop(badge('けしゴムの ほうに くっつきやすい', { fill: PC.sleeveDk, size: 40 }), t, c1 + 3.4, 0, 150);
      out += g(k, { x: 1280, y: 370, o: kO });
    }
    out += titleAt('つぶが、けしゴムの ひょうめんに くっつく', t, c2 + 0.3, c3, PC.sleeveDk) + titleAt('けしかすに つつみこまれる', t, c3 + 0.2, c4, PC.crumbDk);
    out += tag(ERP.cr[1], PY - 30, ERP.cr[1] + 60, 470, 'けしかす', win(t, c3 + 2.6, c4 + 2.4, 0.3), { col: PC.crumbDk, size: 44 });
    out += titleAt('かみからも、けしゴムからも、とりのぞかれる', t, c4 + 0.3, c5 - 0.1, C.accent);
    // 黒くなった面 → 消しかすになって はがれる → まだ黒くない面
    const fO = prog(t, c5 + 0.2, 0.4);
    if (fO > 0) {
      const X = [400, 960, 1520], Y = 400, pk = prog(t, c5 + 2.2, 1.6);
      let f = '';
      f += pop(g(eraserPic(300, 150, { dirty: 1 }), { r: 18 }) + ctext(0, 170, 'くろく なった めん', { size: 40, w: 900, fill: PC.gra }), t, c5 + 0.3, X[0], Y);
      f += pop(g(eraserPic(300, 150, { dirty: 1 - pk }), { r: 18 }) + ctext(0, 170, 'けしかすに なって はがれる', { size: 40, w: 900, fill: PC.crumbDk }), t, c5 + 1.6, X[1], Y);
      for (let i = 0; i < 3; i++) { const u = clamp(pk * 1.4 - i * 0.2); if (u > 0) f += crumbPic(X[1] - 176 - u * 44 - i * 16, Y - 30 + i * 22 + u * (30 + i * 10), 0.72, i * 50 + u * 120, 3, Math.min(1, u * 4)); }
      f += pop(g(eraserPic(300, 150), { r: 18 }) + ctext(0, 170, 'まだ くろく ない めん', { size: 40, w: 900, fill: PC.sleeveDk }), t, c5 + 4.4, X[2], Y);
      f += g(arrow2(X[0] + 200, Y, X[1] - 230, Y, C.ochre, 12), { o: prog(t, c5 + 1.4, 0.3) }) + g(arrow2(X[1] + 200, Y, X[2] - 220, Y, C.ochre, 12), { o: prog(t, c5 + 4.2, 0.3) });
      out += g(f, { o: fO });
    }
    out += titleAt('けしかすが でると、あたらしい めんが でて くる', t, c5 + 0.2, 1e9, C.ink);
    return out;
  },
});

// 5. 色えんぴつ（ろう入り）は消えにくい：ろうが紙の中まで入る・消しゴムになじみにくい
SCENES.push({
  id: 'color',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = '';
    // A. ノートで 消しくらべ
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const x0 = 620, x1 = 1420, y1 = 390, y2 = 620;
      let a = deskBg() + topBadge() + notebook(240, 190, 1440, 600, { lines: 0 });
      const d1 = prog(t, c0 + 0.4, 1.0), d2 = prog(t, c0 + 1.5, 1.0);
      const e1 = eio(prog(t, c0 + 2.8, c1 - c0 - 2.6)), e2 = eio(prog(t, c1 + 0.8, 3.0));
      // えんぴつの線：消しゴムが通ったところは 消える
      if (d1 > 0) a += `<line x1="${lerp(x0, x1, e1)}" y1="${y1}" x2="${lerp(x0, x1, d1)}" y2="${y1}" stroke="${PC.pencil}" stroke-width="16" stroke-linecap="round" opacity="${e1 >= 0.999 ? 0 : 1}"/>`;
      // 色えんぴつの線：消しゴムが通っても のこる
      if (d2 > 0) a += `<line x1="${x0}" y1="${y2}" x2="${lerp(x0, x1, d2)}" y2="${y2}" stroke="${PC.red}" stroke-width="16" stroke-linecap="round"/>` + `<line x1="${x0}" y1="${y2}" x2="${lerp(x0, x1, e2)}" y2="${y2}" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="${e2 > 0.001 ? 0.22 : 0}"/>`;
      a += g(g(pencilPic(190), { r: 28, s: 0.9 }), { x: 560, y: y1, o: prog(t, c0 + 0.2, 0.3) }) + text(310, y1 + 56, 'えんぴつ', { size: 44, w: 900, anchor: 'start', fill: PC.pencil });
      a += g(g(pencilPic(190, { col: PC.red, lt: PC.redLt, dk: PC.redDk, lead: PC.redDk }), { r: 28, s: 0.9 }), { x: 560, y: y2, o: prog(t, c0 + 1.3, 0.3) }) + g(text(310, y2 + 56, 'いろえんぴつ', { size: 40, w: 900, anchor: 'start', fill: PC.redDk }), { o: prog(t, c0 + 1.3, 0.3) });
      // 消しゴム
      const on1 = t > c0 + 2.8 && e1 < 1, on2 = t > c1 + 0.8 && e2 < 1;
      const exx = on2 || e2 >= 1 ? lerp(x0, x1, e2) : lerp(x0, x1, e1), eyy = lerp(y1, y2, eio(prog(t, c1 + 0.2, 0.5))), away = eio(prog(t, c1 + 4.0, 0.5));
      a += g(g(eraserPic(210, 104), { r: -22 }), { x: lerp(exx + ((on1 || on2) ? Math.sin(t * 16) * 30 : 0), 1040, away), y: lerp(eyy - 30, 724, away), o: prog(t, c0 + 2.5, 0.3) });
      a += pop(badge('きえた', { fill: C.accent, size: 44 }), t, c1 - 0.1, 1560, y1) + pop(badge('きえにくい', { fill: PC.redDk, size: 44 }), t, c1 + 4.0, 1540, y2);
      a += titleAt('ろうの はいった いろえんぴつは…', t, c1 + 0.2, 1e9, PC.redDk, 960, 250, 42);
      out += g(a, { o: aO });
    } else out += `<rect width="1920" height="1080" fill="${C.paper}"/>`;
    // B. 大きくして見る
    const bO = prog(t, c2 - 0.2, 0.4);
    if (bO > 0) {
      let b = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge() + fiberMat(80, 1840, PY, 170, 3);
      const sink = eio(prog(t, c2 + 0.8, 2.6));
      for (let i = 0; i < 24; i++) {
        const x = 480 + i * 42 + (rnd(i, 2) - 0.5) * 16, dy = lerp(-2, 34 + rnd(i, 3) * 84, sink * (0.55 + 0.45 * rnd(i, 6)));
        b += `<ellipse cx="${x}" cy="${PY + 6 + dy}" rx="${lerp(15, 22, sink)}" ry="${lerp(11, 9, sink)}" fill="${PC.red}" opacity="0.92"/><ellipse cx="${x - 4}" cy="${PY + 3 + dy}" rx="6" ry="3.5" fill="${PC.redLt}" opacity="0.9"/>`;
      }
      b += g(arrow2(0, 0, 0, 96, PC.redDk, 12), { x: 340, y: PY + 20, o: win(t, c2 + 0.8, c3 - 0.2, 0.3) }) + g(arrow2(0, 0, 0, 96, PC.redDk, 12), { x: 1560, y: PY + 20, o: win(t, c2 + 0.8, c3 - 0.2, 0.3) });
      // 消しゴムが こすっても、くっつかない
      const sw = prog(t, c3 + 0.6, cueE(3) - c3 + 0.6), ex = lerp(330, 1560, sw) + Math.sin(t * 11) * 30, ey = lerp(-80, PY - 6, eo(prog(t, c3 + 0.1, 0.6)));
      if (t > c3 + 0.1) b += eraserBig(ex, ey);
      b += g(`<rect x="-250" y="-40" width="500" height="80" rx="40" fill="#fff" stroke="${PC.red}" stroke-width="5"/><ellipse cx="-200" cy="0" rx="20" ry="14" fill="${PC.red}"/>` + text(-166, 2, 'ろう と いろの こな', { size: 36, w: 900, anchor: 'start', fill: PC.redDk }), { x: 1500, y: 280, o: win(t, c2 + 0.4, c3 - 0.1, 0.4) });
      b += pop(cross(-150, 0, 0.42, C.red) + text(-104, 2, 'くっつかない', { size: 46, w: 900, anchor: 'start', fill: C.red }), t, c3 + 2.2, ex, ey - 76);
      out += g(b, { o: bO });
      out += titleAt('ろうが とけて、かみの なかまで はいる', t, c2 + 0.3, c3, PC.redDk) + titleAt('ろうは、けしゴムに なじみにくい', t, c3 + 0.2, 1e9, PC.redDk);
    }
    return out;
  },
});

// 6. 昔はパンで消した → 1770年、プリーストリーが本に書いた → 天然のゴム
const breadPic = (s = 1) => g(`<path d="M -120 20 C -130 -50 -70 -90 0 -90 C 70 -90 130 -50 120 20 C 116 62 60 76 0 76 C -60 76 -116 62 -120 20 Z" fill="${PC.bread}" stroke="${PC.breadDk}" stroke-width="8"/><path d="M -70 -44 Q -50 -64 -26 -50 M 4 -58 Q 28 -74 50 -54 M 66 -26 Q 86 -30 94 -8" fill="none" stroke="${PC.breadDk}" stroke-width="7" stroke-linecap="round"/>` + [[-50, 10], [0, 30], [46, 6], [-10, -14]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#fbe2b0"/>`).join(''), { s });
const rubberCube = (s = 1) => g(`<rect x="-60" y="-60" width="120" height="120" rx="14" fill="${PC.rubber}" stroke="${PC.rubberDk}" stroke-width="7"/><path d="M -40 -38 Q -20 -48 4 -40" fill="none" stroke="#c49a74" stroke-width="8" stroke-linecap="round"/>`, { s });
const bookPic = (s = 1) => g(`<path d="M -220 -130 L 220 -130 L 220 140 L -220 140 Z" fill="#7a4a2a"/><path d="M -206 -140 Q -100 -160 0 -130 L 0 126 Q -100 100 -206 120 Z" fill="${PC.old}" stroke="#c9b68a" stroke-width="4"/><path d="M 206 -140 Q 100 -160 0 -130 L 0 126 Q 100 100 206 120 Z" fill="${PC.old}" stroke="#c9b68a" stroke-width="4"/>` +
  [0, 1, 2, 3, 4].map(i => `<line x1="-176" y1="${-100 + i * 36}" x2="-30" y2="${-92 + i * 36}" stroke="#b9a67c" stroke-width="6" stroke-linecap="round"/><line x1="30" y1="${-92 + i * 36}" x2="176" y2="${-100 + i * 36}" stroke="#b9a67c" stroke-width="6" stroke-linecap="round"/>`).join('') +
  `<line x1="30" y1="96" x2="176" y2="88" stroke="${C.redUi}" stroke-width="7" stroke-linecap="round"/>`, { s });
SCENES.push({
  id: 'bread',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = deskBg() + topBadge();
    // A. パンで消す
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      const x0 = 420, x1 = 1220, y = 520, e = eio(prog(t, c0 + 2.6, cueE(0) - c0 - 2.2));
      let a = `<rect x="260" y="230" width="1160" height="520" rx="10" fill="${PC.old}" filter="url(#shadow)"/>`;
      a += `<line x1="${lerp(x0, x1, e)}" y1="${y}" x2="${x1}" y2="${y}" stroke="${PC.pencil}" stroke-width="16" stroke-linecap="round" opacity="${e >= 0.999 ? 0 : 1}"/>`;
      for (let i = 0; i < 8; i++) a += `<circle cx="${x0 + 40 + i * 100}" cy="${y + 50 + rnd(i, 2) * 26}" r="${7 + rnd(i, 3) * 5}" fill="${PC.bread}" stroke="${PC.breadDk}" stroke-width="3" opacity="${clamp((lerp(x0, x1, e) - (x0 + 40 + i * 100)) / 30)}"/>`;
      a += pop(g(breadPic(1.0), { x: Math.sin(t * 15) * 26 * (e > 0 && e < 1 ? 1 : 0), r: -8 }), t, c0 + 1.6, lerp(x0, x1, e), y - 60);
      a += titleAt('けしゴムが なかった ころは、パンで けした', t, c0 + 0.8, 1e9, PC.breadDk, 840, 300, 42);
      out += g(a, { o: aO });
    }
    // B. 1770年、本に書いた → 天然のゴム
    const bO = prog(t, c2 - 0.2, 0.4);
    if (bO > 0) {
      let b = pop(badge('1770ねん', { fill: C.ink, size: 64, pad: 50 }), t, c2 + 0.2, 420, 230);
      b += pop(text(0, 0, 'イギリスの かがくしゃ プリーストリー', { size: 44, w: 900 }), t, c2 + 1.4, 1120, 230);
      b += pop(bookPic(1.25), t, c2 + 2.4, 440, 520);
      const q = ['「えんぴつの あとを けすのに、', '　とても むいた ものを みた」'];
      b += pop(card(900, 260) + q.map((s, i) => text(-400, -40 + i * 76, s, { size: 46, w: 900, anchor: 'start' })).join('') + text(400, 100, 'と、ほんに かいた', { size: 34, w: 700, anchor: 'end', fill: C.muted }), t, c2 + 4.2, 1220, 470);
      b += g(`<line x1="610" y1="630" x2="780" y2="560" stroke="${C.redUi}" stroke-width="6" stroke-linecap="round" stroke-dasharray="4 14"/>`, { o: prog(t, c2 + 4.6, 0.4) });
      // 天然のゴム
      const rk = prog(t, c3 + 1.4, 2.4), lx0 = 880, lx1 = 1300, ly = 760;
      b += g(`<line x1="${lerp(lx0, lx1, eio(rk))}" y1="${ly}" x2="${lx1}" y2="${ly}" stroke="${PC.pencil}" stroke-width="14" stroke-linecap="round" opacity="${rk >= 0.999 ? 0 : 1}"/>`, { o: prog(t, c3 + 0.2, 0.3) });
      b += pop(g(rubberCube(1.0), { x: Math.sin(t * 15) * 18 * (rk > 0 && rk < 1 ? 1 : 0), r: -10 }), t, c3 + 0.3, lerp(lx0, lx1, eio(rk)), ly - 56);
      b += pop(badge('てんねんの ゴム', { fill: PC.rubberDk, size: 50, pad: 40 }), t, c3 + 0.6, 1550, 750);
      out += g(b, { o: bO });
    }
    out += kidShow('K', t, 1690, 846, { s: 0.7, start: c1 - 0.9, n: 0, bubble: false, end: c2 - 0.3 });
    out += talkBubble('K', 1500, 600, 1754, 712, 46);   // しっぽの先は カメレオンの頭
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
        text(NX + 96, 2, 'くろい つぶが、かみから、けしゴムに、くっつくから', { size: 44, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['しんが くだけて かみに つく', PC.gra], ['けしゴムに くっつく', PC.sleeveDk], ['けしかすに つつまれる', PC.crumbDk]], t, 960, 600, { start: 2.4, step: 1.1, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const qm = text(0, 2, '？', { size: 52, w: 900, fill: C.ochre });
      const items = [
        [g(eyeIcon(0.3)), 'じを けしたら、けしかすを みる', C.ink, cue(1)],
        [crumbPic(0, 0, 0.5, -10, 2), 'しろい けしゴムなのに、けしかすは はいいろ', C.ink, cue(2)],
        [gp(0, 0, 16, 20), 'くろい つぶを、つつみこんで とったから', PC.gra, cue(3)],
        [g(eyeIcon(0.3)), 'けす まえの じと、けした あとの かみを くらべる', C.ink, cue(4)],
        [qm, 'えんぴつと いろえんぴつ、けしくらべも おもしろい', PC.redDk, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 900, 38, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 310 + i * 96); });
      // ノートと 消しかす、ルーペで見ると 中に黒いつぶ
      const PX = 1500, PYc = 520;
      let p = card(700, 480, { fill: PC.desk }) + `<rect x="-300" y="-190" width="600" height="300" rx="14" fill="#fff"/>`;
      p += text(-250, -60, 'あ', { size: 130, w: 900, fill: PC.pencil, anchor: 'start', ls: 0 }) + g(text(-90, -60, 'い', { size: 130, w: 900, fill: PC.pencil, anchor: 'start', ls: 0 }), { o: 0.12 });
      p += g(eraserPic(170, 84), { x: 196, y: -120, r: -20 });
      [[-30, 40], [40, 60], [100, 30], [-90, 64]].forEach(([x, y], i) => { p += crumbPic(x, y, 0.5, i * 47 - 30, 2); });
      const lO = prog(t, cue(2) + 0.6, 0.4);
      p += g(`<line x1="40" y1="60" x2="150" y2="130" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="4 12" stroke-linecap="round"/><circle cx="210" cy="150" r="96" fill="#eef6f8" stroke="${C.blueUi}" stroke-width="12"/>` + crumbPic(210, 150, 1.5, -12, 5), { o: lO });
      p += g(ctext(-130, 190, 'けしかすは はいいろ', { size: 36, w: 900, fill: PC.crumbDk }), { o: lO });
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「えんぴつ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
