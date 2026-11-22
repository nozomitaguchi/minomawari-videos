// みのまわり図鑑 動画「かに さされると、どうして かゆく なるの？」
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
const TOPIC = 'か（蚊）';
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
// みのまわり図鑑 動画「かに さされると、どうして かゆく なるの？」（か）
// 出どころ：everyday-trivia trivia/mosquito-bite-itch.md（絵の見本：assets/figures-mosquito.js）

// ---------- 蚊の道具 ----------
const MC = {
  body: '#4a4a4a', bodyLt: '#6b6b6b', stripe: '#f4f4f4', wing: '#e8f2f6', wingLn: '#7a8a90',
  skin: '#f6d6bd', skinSh: '#ecc0a2', epi: '#f3c9b5', der: '#eeb0a2', derLt: '#f4c4b8', derDk: '#e39a8b',
  blood: '#c8323c', bloodLt: '#e86a6a', vessel: '#f6c6c6', vline: '#b0484a',
  saliva: '#4f95d6', salivaDk: '#2f6fb0', hist: '#8f83bf', histDk: '#6c5fa3', mast: '#fbf3e4',
  bump: '#f2928a', bumpDk: '#d9655c', bump2: '#b5553f', bump2Dk: '#8c3b28', water: '#bfe6f5', waterDk: '#6fb6d6',
  ice: '#cde6f2', iceDk: '#7fb2cc', leaf: '#6fb36a', leafDk: '#4c9048', sheath: '#8a6a4a', sheathLt: '#b89468',
};
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
const fit = (str, maxW, size, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
const titleAt = (str, t, st, en = 1e9, col = C.ink, x = 960, y = 170, size = 46) => pop(badge(str, { fill: col, size }), t, st, x, y, { end: en });
const sparkle = (x, y, r, o = 1, col = C.yellow) => o <= 0.01 ? '' : `<path d="M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${col}" opacity="${clamp(o)}"/>`;
const drop = (x, y, s = 1, col = MC.saliva, dk = MC.salivaDk, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -16 C 8 -4 13 2 13 9 A 13 13 0 0 1 -13 9 C -13 2 -8 -4 0 -16 Z" fill="${col}" stroke="${dk}" stroke-width="3" opacity="${clamp(o)}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const itchMark = (x, y, s = 1, o = 1) => o <= 0.01 ? '' : `<path transform="translate(${x} ${y}) scale(${s})" d="M -30 -8 l 10 -16 l 10 16 l 10 -16 l 10 16 l 10 -16 M -24 26 l 10 -16 l 10 16 l 10 -16 l 10 16" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp(o)}"/>`;

// 蚊（横から。頭が 左。むねの まん中が 0,0、足の先は y=112）
//   belly: 0〜1 おなかが 血で 赤くふくらむ ／ fly: とんでいる（はねを ふるわせ、足を うしろへ）／ prob: 口を 下へ のばす（0〜1）
function mosq(t, { belly = 0, fly = 0, prob = 1 } = {}) {
  const wa = fly ? Math.sin(t * 60) * 26 : Math.sin(t * 3) * 2;
  const lg = fly ? `M -14 14 L -8 52 L 26 74 M 0 16 L 16 54 L 52 70 M 14 14 L 46 44 L 84 54` : `M -14 14 L -50 62 L -60 112 M 0 16 L 8 70 L 0 112 M 14 14 L 62 60 L 86 112`;
  let s = `<path d="${lg}" fill="none" stroke="${MC.body}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<ellipse cx="78" cy="16" rx="60" ry="${lerp(15, 27, belly)}" transform="rotate(10 78 16)" fill="${mix(MC.body, MC.blood, belly)}"/>`;
  if (belly < 0.6) s += `<path d="M 50 0 l -3 26 M 72 3 l -3 28 M 94 8 l -3 26 M 114 14 l -2 20" stroke="${MC.stripe}" stroke-width="5" stroke-linecap="round" opacity="${1 - belly / 0.6}"/>`;
  s += `<ellipse cx="44" cy="-34" rx="64" ry="15" transform="rotate(${-18 + wa} 2 -16)" fill="${MC.wing}" fill-opacity="0.85" stroke="${MC.wingLn}" stroke-width="3"/>`;
  s += `<ellipse cx="0" cy="0" rx="31" ry="25" fill="${MC.body}"/><path d="M -10 -12 l 16 0" stroke="${MC.stripe}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M -46 -18 l -30 -26 M -40 -22 l -16 -36" stroke="${MC.body}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<circle cx="-40" cy="-6" r="18" fill="${MC.body}"/><circle cx="-46" cy="-9" r="7" fill="#fff"/><circle cx="-48" cy="-9" r="4" fill="${C.ink}"/>`;
  const px = lerp(-128, -64, prob), py = lerp(30, 112, prob);
  s += `<line x1="-52" y1="4" x2="${px}" y2="${py}" stroke="${MC.body}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
const mosqAt = (x, footY, s, t, o = {}) => `<g transform="translate(${x} ${footY - 112 * s}) scale(${s})">${mosq(t, o)}</g>`;
// うで（横から。上の線が y）。ふくらみは 上の線の上に のる
const armSide = (x0, x1, y, h = 170) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" rx="${h / 2}" fill="${MC.skin}"/><path d="M ${x0 + h / 2} ${y + h - 16} L ${x1 - h / 2} ${y + h - 16}" stroke="${MC.skinSh}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`;
// ふくらみ（k: 0〜1 大きさ。hard: 次の日の かたい 赤茶色）
function bumpSide(x, y, r, k = 1, hard = false) {
  if (k <= 0.01) return '';
  const h = r * (hard ? 0.34 : 0.62) * k, w = r * (0.5 + 0.5 * k), c = hard ? MC.bump2 : MC.bump, d = hard ? MC.bump2Dk : MC.bumpDk;
  return `<ellipse cx="${x}" cy="${y + 14}" rx="${w * 1.5}" ry="${22 * k}" fill="${c}" opacity="${hard ? 0.45 : 0.4}"/>` +
    `<path d="M ${x - w} ${y + 2} C ${x - w * 0.7} ${y - h * 1.2} ${x + w * 0.7} ${y - h * 1.2} ${x + w} ${y + 2} Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/>` +
    (hard ? `<ellipse cx="${x}" cy="${y - h * 0.42}" rx="${w * 0.4}" ry="${h * 0.26}" fill="${d}" opacity="0.8"/>` : `<circle cx="${x}" cy="${y - h * 0.62}" r="${5 * k}" fill="${MC.bumpDk}"/><path d="M ${x - w * 0.5} ${y - h * 0.5} Q ${x - w * 0.3} ${y - h * 0.82} ${x - w * 0.05} ${y - h * 0.84}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`);
}
// 赤血球
const rbc = (x, y, r = 14, o = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d9453f" stroke="#8f1f22" stroke-width="3" opacity="${o}"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#ec7c70" opacity="${o}"/>`;
// 見張り役の細胞（肥満細胞）。burst: つぶを 出す（0〜1）、eyes: 'open' | 'wide'
const GRAN = [[-58, -38], [40, -62], [70, 10], [-24, 62], [-76, 24], [14, 0], [52, 58], [-14, -74], [-44, 6], [26, 34]];
function mastCell(t, r = 140, { burst = 0, eyes = 'open' } = {}) {
  const wob = 1 + Math.sin(t * 3) * 0.015 + (burst > 0 && burst < 1 ? Math.sin(burst * Math.PI) * 0.06 : 0);
  let s = `<g transform="scale(${wob})"><circle r="${r}" fill="${MC.mast}" stroke="${MC.hist}" stroke-width="9" ${burst > 0.05 ? 'stroke-dasharray="34 16"' : ''}/>`;
  GRAN.forEach(([x, y], i) => { const k = burst > 0 ? clamp(burst * 1.6 - i * 0.05) : 0; if (k < 1) s += `<circle cx="${x * r / 140}" cy="${y * r / 140 + 26}" r="${15 * r / 140}" fill="${MC.hist}" opacity="${1 - k}"/>`; });
  const ey = -r * 0.34, er = eyes === 'wide' ? 17 : 12;
  s += `<ellipse cx="${-r * 0.26}" cy="${ey}" rx="${er * 0.85}" ry="${er * 1.1}" fill="${C.ink}"/><ellipse cx="${r * 0.26}" cy="${ey}" rx="${er * 0.85}" ry="${er * 1.1}" fill="${C.ink}"/><circle cx="${-r * 0.26 + 4}" cy="${ey - 5}" r="${er * 0.3}" fill="#fff"/><circle cx="${r * 0.26 + 4}" cy="${ey - 5}" r="${er * 0.3}" fill="#fff"/>`;
  s += eyes === 'wide' ? `<ellipse cx="0" cy="${ey + 40}" rx="12" ry="15" fill="#8e3b33"/>` : `<path d="M -14 ${ey + 34} Q 0 ${ey + 46} 14 ${ey + 34}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  return s + '</g>';
}
// 皮ふの中の 背景（つぶつぶ）
const _derm = (() => { let s = ''; for (let i = 0; i < 60; i++) s += `<ellipse cx="${(rnd(i, 31) * 1920).toFixed(0)}" cy="${(rnd(i, 32) * 1080).toFixed(0)}" rx="${(16 + rnd(i, 33) * 26).toFixed(0)}" ry="${(8 + rnd(i, 34) * 10).toFixed(0)}" fill="${MC.derDk}" opacity="0.22" transform="rotate(${(rnd(i, 35) * 60 - 30).toFixed(0)} ${(rnd(i, 31) * 1920).toFixed(0)} ${(rnd(i, 32) * 1080).toFixed(0)})"/>`; return s; })();
// 蚊の頭を 大きく（口の つけねが 0,0。頭は その上）
const bigHead = t => `<path d="M -40 -150 L -120 -300 M 20 -160 L 10 -330" stroke="${MC.body}" stroke-width="12" stroke-linecap="round"/><ellipse cx="230" cy="-250" rx="270" ry="150" transform="rotate(-24 230 -250)" fill="${MC.bodyLt}"/>` +
  `<circle cx="0" cy="-100" r="104" fill="${MC.body}"/><ellipse cx="-34" cy="-112" rx="42" ry="52" fill="#fff"/><ellipse cx="-42" cy="-108" rx="22" ry="30" fill="${C.ink}"/><circle cx="-34" cy="-122" r="9" fill="#fff"/>`;

// 1. つかみ：うでに 蚊が とまる → 飛んでいったあと、ぷくっと ふくらんで かゆい
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="#e9f3dc"/><circle cx="300" cy="170" r="250" fill="#dcecc9"/><circle cx="1650" cy="330" r="330" fill="#dcecc9"/>`;
    const AY = 560, LX = 660;
    out += armSide(-120, 1210, AY) + `<ellipse cx="1260" cy="${AY + 84}" rx="120" ry="92" fill="${MC.skin}"/><path d="M 1200 ${AY + 16} Q 1290 ${AY - 40} 1330 ${AY + 20}" fill="none" stroke="${MC.skin}" stroke-width="44" stroke-linecap="round"/>`;
    // ふくらみ
    const bk = eo(prog(t, c1 + 3.4, 1.0));
    out += bumpSide(LX - 74, AY, 78, bk);
    // 蚊：右上から 来て とまり、左上へ 飛んでいく（どちらも 左向きに 進む）
    const inK = eo(prog(t, 0.3, 1.3)), outK = eio(prog(t, c1 + 0.2, 1.7));
    if (outK < 1) {
      const fly = inK < 1 || outK > 0 ? 1 : 0;
      const x = lerp(lerp(1560, LX, inK), -260, outK), y = lerp(lerp(90, AY, inK), 60, outK) + (fly ? Math.sin(t * 9) * 12 : 0);
      out += mosqAt(x, y, 1.25, t, { fly, prob: fly ? 0.15 : 1, belly: eo(prog(t, c0 + 1.2, 2.0)) });
    }
    out += g(text(0, 0, 'ぷくっ', { size: 76, w: 900, fill: MC.bumpDk }), { x: LX - 70, y: AY - 150, r: -5, o: win(t, c1 + 3.4, c3 - 0.2, 0.25), s: lerp(0.7, 1, eo(prog(t, c1 + 3.4, 0.4))) });
    const iO = prog(t, c1 + 5.2, 0.3);
    out += itchMark(LX - 250, AY - 70, 1.1, iO * (0.6 + 0.4 * Math.sin(t * 12))) + itchMark(LX + 110, AY - 60, 1.1, iO * (0.6 + 0.4 * Math.cos(t * 12)));
    out += kidShow('S', t, 1640, 850, { s: 0.62, start: c1 + 4.6, n: 0, side: 'left', size: 50 });
    out += g(text(0, 0, 'かは、もう いないのに…', { size: 62, w: 900, fill: C.ochre }), { x: 620, y: 250, o: win(t, c3 + 0.3, cueE(3) + 0.6, 0.3) });
    out += g(text(0, 0, '？', { size: 190, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 1130, y: 300, o: win(t, c3 + 2.6, cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${MC.body}">か</tspan>に さされると、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${MC.bumpDk}">かゆく</tspan> なるの？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(armSide(-330, 330, 0, 100) + bumpSide(130, 0, 60, 1) + mosqAt(-120, 0, 0.8, 1.2, { belly: 0.2 }), t, t0 + 1.8, 960, 800);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'かに さされると、かゆく なるのは どうして？', { size: 58, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'かの つばに、じぶんの からだが きづくから'], ['②', 'はりで さした きずが、いたむから'], ['③', 'かが どくを いれて、ひふを とかすから']];
    const cur = curLine(), osz = Math.min(...opts.map(([, s]) => fit(s, 1040, 46)));
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: osz, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(armSide(-130, 130, 0, 70) + bumpSide(0, 0, 54, 1) + text(110, -96, '？', { size: 110, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1650, 370);
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 血をすうのは メスだけ（卵を産むとき）。オスや 卵を産まないメスは 草の汁
SCENES.push({
  id: 'female',
  draw(t) {
    const c0 = cue(0), c1 = cue(1);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += titleAt('ちを すうのは、メスだけ', t, c0 + 0.2, 1e9, MC.blood, 960, 170, 50);
    // メス
    let a = card(800, 540) + armSide(-340, 340, 40, 90) + mosqAt(-40, 40, 1.15, t, { belly: eo(prog(t, c0 + 1.6, 2.0)) });
    a += g(badge('メス', { fill: MC.blood, size: 46 }), { x: -280, y: -200 });
    const eO = prog(t, c0 + 3.4, 0.5);
    a += g([[-30, 0], [0, -10], [30, 0], [-15, 14], [15, 14]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="20" fill="#fff" stroke="${MC.body}" stroke-width="4" transform="rotate(${x} ${x} ${y})"/>`).join('') + text(0, 62, 'たまご', { size: 34, w: 900, fill: MC.body }), { x: 250, y: -150, o: eO, s: lerp(0.7, 1, eo(eO)) });
    a += g(text(0, 0, 'たまごを うむ ときだけ、ちを すう', { size: 40, w: 900, fill: MC.blood }), { y: 210, o: prog(t, c0 + 3.8, 0.4) });
    out += pop(a, t, c0 + 0.5, 500, 500);
    // オス・卵を産まないメス
    let b = card(800, 540);
    b += `<path d="M -340 130 Q -100 60 300 110" fill="none" stroke="${MC.leafDk}" stroke-width="16" stroke-linecap="round"/><path d="M -60 84 Q 20 -40 180 -20 Q 120 90 -60 84 Z" fill="${MC.leaf}"/><path d="M -60 84 Q 60 30 180 -20" fill="none" stroke="${MC.leafDk}" stroke-width="5"/><path d="M -200 106 Q -260 20 -180 -30 Q -130 40 -200 106 Z" fill="${MC.leaf}"/>`;
    b += mosqAt(110, 28, 1.0, t + 2, {});
    b += g(badge('オス', { fill: C.blueUi, size: 46 }), { x: -280, y: -200 });
    b += g(text(0, 0, 'くさの しるなどを すう', { size: 40, w: 900, fill: MC.leafDk }), { y: 190, o: prog(t, c1 + 1.2, 0.4) });
    b += g(text(0, 0, 'たまごを うまない メスも', { size: 34, w: 900, fill: C.muted }), { y: 238, o: prog(t, c1 + 2.4, 0.4) });
    out += pop(b, t, c1 - 0.1, 1420, 500);
    return out;
  },
});

// 4. 1本に見える口は、さやと 6本の針。皮ふに入るのは 針のたばだけ
SCENES.push({
  id: 'mouth',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const SY = 730, HX = 800, PL = 400;
    out += `<rect x="0" y="${SY}" width="1920" height="${1080 - SY}" fill="${MC.der}"/><rect x="0" y="${SY}" width="1920" height="46" fill="${MC.epi}"/><line x1="0" y1="${SY}" x2="1920" y2="${SY}" stroke="${MC.skinSh}" stroke-width="5"/>`;
    out += g(text(0, 0, 'ひふ', { size: 44, w: 900, fill: '#a8584a' }), { x: 200, y: SY + 84, o: prog(t, 0.4, 0.4) });
    const open = eio(prog(t, c1 + 0.6, 1.0)) * (1 - eio(prog(t, c3 - 0.2, 0.7)));
    const down = eio(prog(t, c3 + 1.0, 1.8)), HY = lerp(250, 470, down), P0 = HY;
    // さや（下くちびる）
    const sx = HX - 190 * open, endY = Math.min(SY, P0 + PL), d = endY - P0, bow = d < PL ? 0.62 * Math.sqrt(PL * PL - d * d) : 0;
    const sh = `M ${sx} ${P0} Q ${sx - bow * 2} ${(P0 + endY) / 2} ${sx - (bow > 0 ? 6 : 0)} ${endY}`;
    // 6本の針
    let nd = '';
    const NC = ['#3d3d3d', '#7a5a3a', '#3d3d3d', '#b0484a', '#7a5a3a', '#3d3d3d'];
    for (let i = 0; i < 6; i++) {
      const ex = HX + (i - 2.5) * 72 * open + 90 * open, ey = P0 + PL + (down > 0 ? 0 : -Math.abs(i - 2.5) * 10 * open);
      nd += `<line x1="${HX + (i - 2.5) * 3}" y1="${P0}" x2="${ex + (i - 2.5) * 2 * (1 - open)}" y2="${ey}" stroke="${NC[i]}" stroke-width="${lerp(5, 9, open)}" stroke-linecap="round"/>`;
      const nk = prog(t, c1 + 1.8 + i * 0.32, 0.3) * (1 - prog(t, c3 - 0.4, 0.3));
      if (nk > 0) nd += g(`<circle r="26" fill="${C.ochre}"/>` + text(0, 3, String(i + 1), { size: 36, w: 900, fill: '#fff' }), { x: ex, y: ey + 42, o: nk, s: Math.max(back(nk), 0.001) });
    }
    out += nd;
    out += `<path d="${sh}" fill="none" stroke="${MC.sheath}" stroke-width="${lerp(26, 30, open)}" stroke-linecap="round"/><path d="${sh}" fill="none" stroke="${MC.sheathLt}" stroke-width="8" stroke-linecap="round" opacity="${0.5 + 0.5 * open}"/>`;
    out += g(bigHead(t), { x: HX, y: HY });
    // ラベル
    out += tag(HX + 14, 470, 1260, 400, '1ぽんの はりに みえる', win(t, c0 + 0.8, c1 + 0.3, 0.3), { size: 46 });
    out += tag(sx - 14, P0 + 200, 330, 470, 'さや', prog(t, c1 + 1.2, 0.3) * (1 - prog(t, c3 - 0.4, 0.3)), { col: MC.sheath, size: 52 });
    out += g(text(0, 0, '6ぽんの はり', { size: 60, w: 900, fill: C.ochre }), { x: 1250, y: 320, o: win(t, c1 + 3.6, c3 - 0.3, 0.3) });
    out += tag(HX - bow * 0.95, (P0 + endY) / 2, 300, 520, 'さやは、そとに のこる', prog(t, c3 + 3.4, 0.4), { col: MC.sheath, size: 44 });
    out += tag(HX + 6, SY + 60, 1300, 640, 'はいるのは、はりの たばだけ', prog(t, c3 + 2.2, 0.4), { col: C.redUi, size: 44 });
    out += kidShow('B', t, 1680, SY, { s: 0.5, start: cue(2) - 0.9, n: 0, side: 'left', size: 46, end: c3 + 0.4 });
    return out;
  },
});

// 5. 皮ふの中で、針の先が 曲がって 血管をさがす。だ液を出す。管は2本
const VES = [[820, 1090], [820, 760], [900, 640], [1160, 640]];
const vesP = u => { const [a, b, c, d] = VES, m = 1 - u; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]; };
SCENES.push({
  id: 'probe',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    const SY = 300, E = [623, SY];
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/><rect x="0" y="${SY}" width="1920" height="${1080 - SY}" fill="${MC.der}"/>` + _derm.replace(/cy="(\d+)"/g, (m, v) => `cy="${Math.max(+v, SY + 90)}"`) + `<rect x="0" y="${SY}" width="1920" height="56" fill="${MC.epi}"/><line x1="0" y1="${SY}" x2="1920" y2="${SY}" stroke="${MC.skinSh}" stroke-width="5"/>` + topBadge();
    // 血管
    const vd = `M ${VES[0]} C ${VES[1]} ${VES[2]} ${VES[3]} L 1980 640`;
    out += `<path d="${vd}" fill="none" stroke="${MC.vline}" stroke-width="104" stroke-linecap="round"/><path d="${vd}" fill="none" stroke="${MC.vessel}" stroke-width="92" stroke-linecap="round"/>`;
    for (let i = 0; i < 12; i++) { const u = ((t * 0.07 + i / 12) % 1) * 2, p = u < 1 ? vesP(u) : [lerp(1160, 1980, u - 1), 640]; out += rbc(p[0] + Math.sin(i * 2.3) * 14, p[1] + Math.cos(i * 1.7) * 16, 15); }
    out += tag(1250, 640, 1330, 800, 'けっかん', prog(t, c0 + 0.6, 0.4) * (1 - prog(t, c3 - 0.3, 0.3)), { col: MC.vline, size: 44 });
    out += g(text(0, 0, 'ひふの なか', { size: 44, w: 900, fill: '#a8584a' }), { x: 210, y: SY + 130, o: prog(t, 0.4, 0.4) });
    // さがす：左（ない）→ まん中（ない）→ 右（あった）
    const TG = [[500, 540], [690, 620], [872, 716]], seg = [[c0 + 0.5, c0 + 2.2], [c0 + 2.5, c0 + 4.2], [c0 + 4.5, 1e9]];
    let ti = 0, p = 0;
    seg.forEach(([a, b], i) => { if (t >= a) { ti = i; p = i < 2 ? Math.min(eo(prog(t, a, 0.8)), 1 - eio(prog(t, b - 0.6, 0.6))) : eo(prog(t, a, 1.0)); } });
    const T = [lerp(E[0], TG[ti][0], p), lerp(E[1], TG[ti][1], p)], K = [E[0], lerp(E[1], TG[ti][1], p * 0.75)];
    const nd = `M ${E[0]} ${E[1] - 6} Q ${K[0]} ${K[1]} ${T[0]} ${T[1]}`;
    // だ液（さがした所に のこる）
    const sPulse = 1 + 0.25 * Math.sin(t * 6) * win(t, c1, c2, 0.4);
    TG.forEach(([x, y], i) => { const k = prog(t, seg[i][0] + 0.7, 0.5); for (let j = 0; j < (i === 2 ? 6 : 3); j++) { const a = j * 2.1 + i, r = (26 + j * 13) * k; out += drop(x + Math.cos(a) * r - (i === 2 ? 40 : 0), y + Math.sin(a) * r * 0.8 - (i === 2 ? 30 : 0), 0.8 * sPulse, MC.saliva, MC.salivaDk, k * 0.95); } });
    out += `<path d="${nd}" fill="none" stroke="${MC.body}" stroke-width="12" stroke-linecap="round"/>`;
    // すう：針の中を 血が のぼる
    const suck = prog(t, c2 + 0.4, 0.6);
    if (suck > 0) out += `<path d="${nd}" fill="none" stroke="${MC.bloodLt}" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 14" stroke-dashoffset="${t * 60}" opacity="${suck}"/>`;
    out += mosqAt(700, SY, 1.1, t, { belly: eo(prog(t, c2 + 0.6, 6)) * 0.9 });
    [0, 1].forEach(i => { out += g(text(0, 0, 'ない…', { size: 44, w: 900, fill: C.muted }), { x: TG[i][0] - 10, y: TG[i][1] + 76, o: win(t, seg[i][0] + 0.8, seg[i][1] + 0.3, 0.2) }); });
    out += g(text(0, 0, 'あった！', { size: 54, w: 900, fill: MC.blood, extra: `stroke="#fff" stroke-width="10" paint-order="stroke"` }), { x: 1110, y: 540, o: win(t, c0 + 5.5, c1 - 0.2, 0.25) });
    out += titleAt('じっけんで みられた ようす', t, c0 + 0.3, c1 - 0.2, C.muted, 1330, 170, 40);
    out += g(text(0, 0, 'はりの さきが まがって、けっかんを さがす', { size: 46, w: 900 }), { x: 1260, y: 250, o: win(t, c0 + 1.2, c1 - 0.2, 0.3) });
    out += tag(TG[2][0] - 70, TG[2][1] - 56, 420, 800, 'だえき（つば）', win(t, c1 + 0.8, c3 - 0.3, 0.3), { col: MC.salivaDk, size: 48 });
    out += pop(card(860, 110) + drop(-374, 4, 1.4) + text(-330, 2, 'ちを かたまりにくく する ものが、はいっている', { size: 33, w: 900, anchor: 'start', fill: MC.salivaDk }), t, c2 + 0.5, 1420, 180, { end: c3 - 0.2 });
    // 管は 2本
    const iO = prog(t, c3 + 0.2, 0.5);
    if (iO > 0) {
      let c = card(640, 620) + text(0, -250, 'はりの なかの、2ほんの くだ', { size: 40, w: 900 });
      c += `<rect x="-150" y="-190" width="120" height="380" rx="26" fill="#e3f0fb" stroke="${MC.salivaDk}" stroke-width="7"/><rect x="30" y="-190" width="120" height="380" rx="26" fill="#fbe1e1" stroke="${MC.vline}" stroke-width="7"/>`;
      for (let i = 0; i < 4; i++) { const f = ((t * 0.5 + i / 4) % 1); c += drop(-90, -160 + f * 320, 1.3, MC.saliva, MC.salivaDk, Math.sin(f * Math.PI)); c += rbc(90, 160 - f * 320, 20, Math.sin(f * Math.PI)); }
      c += arrow2(-210, -90, -210, 60, MC.salivaDk, 12) + arrow2(210, 60, 210, -90, MC.vline, 12);
      c += text(-90, 236, 'だえき', { size: 42, w: 900, fill: MC.salivaDk }) + text(90, 236, 'ち', { size: 42, w: 900, fill: MC.blood });
      out += g(`<line x1="${(E[0] + T[0]) / 2 + 30}" y1="${(E[1] + T[1]) / 2 + 40}" x2="1140" y2="520" stroke="${C.blueUi}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>`, { o: iO });
      out += g(c, { x: 1470, y: 500, o: iO, s: lerp(0.9, 1, eo(iO)) });
    }
    return out;
  },
});

// 6. 見張り役の細胞が だ液に気づく → ヒスタミン → 血管が広がり、水分がしみ出す → ぷくっ
SCENES.push({
  id: 'alarm',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3), c4 = cue(4);
    let out = `<rect width="1920" height="1080" fill="${MC.derLt}"/>` + _derm + topBadge();
    const MX = 1000, MY = 400, VY = 750, MR = 160;
    // 血管（広がる）
    const wide = eio(prog(t, c3 + 0.8, 1.6)), vw = lerp(70, 124, wide);
    const vd = `M 560 1120 Q 560 ${VY} 780 ${VY} L 1980 ${VY}`;
    out += `<path d="${vd}" fill="none" stroke="${MC.vline}" stroke-width="${vw + 12}" stroke-linecap="round"/><path d="${vd}" fill="none" stroke="${MC.vessel}" stroke-width="${vw}" stroke-linecap="round"/>`;
    for (let i = 0; i < 9; i++) { const f = ((t * 0.05 + i / 9) % 1); out += rbc(lerp(800, 1980, f), VY + Math.sin(i * 2.1) * vw * 0.22, 14); }
    out += g(text(0, 0, 'けっかん', { size: 38, w: 900, fill: MC.vline }), { x: 1760, y: VY - vw / 2 - 40, o: prog(t, c1, 0.4) * (1 - prog(t, c3 + 0.4, 0.3)) });
    // 針の先と だ液
    out += `<path d="M 250 -20 Q 270 160 400 250" fill="none" stroke="${MC.body}" stroke-width="16" stroke-linecap="round"/>`;
    const reach = eo(prog(t, c2 - 0.6, 1.6));
    for (let i = 0; i < 7; i++) { const a = i * 0.9, sx = 410 + Math.cos(a) * 60 + (i % 3) * 36, sy = 270 + Math.sin(a) * 46 + (i % 2) * 40; const tx = MX - 215 + (i % 3) * 30, ty = MY - 80 + i * 26; out += drop(lerp(sx, tx, reach * (0.55 + 0.45 * rnd(i, 41))), lerp(sy, ty, reach * (0.55 + 0.45 * rnd(i, 42))) + Math.sin(t * 2 + i) * 6, 1.25, MC.saliva, MC.salivaDk, prog(t, 0.3 + i * 0.1, 0.3)); }
    out += tag(430, 300, 520, 170, 'かの だえき', prog(t, c0 + 0.6, 0.4) * (1 - prog(t, c3 - 0.3, 0.3)), { col: MC.salivaDk, size: 44 });
    out += g(text(0, 0, '？', { size: 200, w: 900, fill: C.ochre, extra: `stroke="#fff" stroke-width="18" paint-order="stroke"` }), { x: 1000, y: 430, o: win(t, c0 + 0.8, c1 - 0.2, 0.3) });
    // 見張り役の細胞
    const burstT = c2 + 3.2, burst = prog(t, burstT, 1.4), notice = t > c2 + 1.0;
    out += pop(mastCell(t, MR, { burst, eyes: notice ? 'wide' : 'open' }), t, c1 + 0.2, MX, MY);
    out += tag(MX + 116, MY - 106, 1440, 190, 'みはりやくの さいぼう', prog(t, c1 + 1.0, 0.4) * (1 - prog(t, c4 - 0.4, 0.3)), { col: MC.histDk, size: 44 });
    out += pop(text(0, 0, '！', { size: 130, w: 900, fill: C.red, extra: `stroke="#fff" stroke-width="14" paint-order="stroke"` }), t, c2 + 1.0, MX - 150, MY - 210, { end: burstT + 1.0 });
    // ヒスタミンの つぶ
    if (burst > 0) {
      const sink = eo(prog(t, c3 + 0.2, 1.6));
      for (let i = 0; i < 22; i++) {
        const a = i / 22 * Math.PI * 2 + 0.3, r = 172 + (80 + rnd(i, 51) * 150) * eo(clamp(burst * 1.2 - rnd(i, 52) * 0.2));
        let x = MX + Math.cos(a) * r, y = MY + Math.sin(a) * r * 0.8;
        const tx = 820 + i * 46, ty = VY - vw / 2 - 16 - rnd(i, 53) * 40;
        if (i % 2 === 0) { x = lerp(x, tx, sink); y = lerp(y, ty, sink); }
        out += `<circle cx="${x + Math.sin(t * 3 + i) * 5}" cy="${y + Math.cos(t * 2.6 + i) * 5}" r="13" fill="${MC.hist}" stroke="${MC.histDk}" stroke-width="3" opacity="${clamp(burst * 3)}"/>`;
      }
      out += pop(badge('ヒスタミン', { fill: MC.histDk, size: 50 }), t, burstT + 0.6, 1440, 330, { end: c4 - 0.3 });
    }
    // 水分が しみ出す
    const seep = prog(t, c3 + 2.0, 0.5);
    if (seep > 0) for (let i = 0; i < 14; i++) { const f = ((t * 0.35 + i / 14) % 1), x = 840 + i * 74 + Math.sin(i * 5) * 20; out += drop(x, VY - vw / 2 - 10 - f * 150, 1.0 + 0.3 * (i % 2), MC.water, MC.waterDk, seep * Math.sin(f * Math.PI)); }
    out += pop(badge('けっかんが ひろがる', { fill: MC.vline, size: 40 }), t, c3 + 1.2, 1620, VY + 2, { end: c4 - 0.3 });
    out += pop(badge('すいぶんが しみだす', { fill: MC.waterDk, size: 40 }), t, c3 + 2.6, 1360, 622, { end: c4 - 0.3 });
    // ぷくっ
    const pO = prog(t, c4 + 0.3, 0.5);
    if (pO > 0) {
      const bk = eo(prog(t, c4 + 0.9, 1.4));
      let c = card(620, 480) + armSide(-270, 270, -10, 110) + bumpSide(0, -10, 86, bk);
      c += g(text(0, 0, 'ぷくっ', { size: 60, w: 900, fill: MC.bumpDk }), { x: -170, y: -150, r: -6, o: prog(t, c4 + 1.2, 0.3) });
      c += itchMark(170, -100, 0.9, prog(t, c4 + 2.4, 0.3) * (0.6 + 0.4 * Math.sin(t * 12)));
      c += text(0, 146, 'ふくらんで、かゆく なる', { size: 40, w: 900, fill: MC.bumpDk }) + g(text(0, 198, '（と かんがえられている）', { size: 32, w: 900, fill: C.muted }), { o: prog(t, c4 + 3.0, 0.4) });
      out += g(c, { x: 1530, y: 350, o: pO, s: lerp(0.9, 1, eo(pO)) });
    }
    out += kidShow('S', t, 240, 850, { s: 0.55, start: cue(5) - 0.9, n: 0, side: 'right', size: 44 });
    return out;
  },
});

// 7. すぐのかゆみ と 次の日のかゆみ
SCENES.push({
  id: 'two',
  draw(t) {
    const c0 = cue(0), c1 = cue(1), c2 = cue(2), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += titleAt('かゆみは、2つ', t, c0 + 0.2, 1e9, C.ink, 960, 170, 52);
    const clock = `<circle r="40" fill="#fff" stroke="${C.ink}" stroke-width="7"/><path d="M 0 0 L 0 -26 M 0 0 L 18 0" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
    const cal = `<rect x="-40" y="-36" width="80" height="76" rx="12" fill="#fff" stroke="${C.ink}" stroke-width="7"/><rect x="-40" y="-36" width="80" height="24" rx="10" fill="${C.redUi}"/>` + text(0, 16, '+1', { size: 34, w: 900 });
    let a = card(800, 500) + g(clock, { x: -300, y: -170 }) + text(-240, -186, 'すぐ', { size: 52, w: 900, anchor: 'start', fill: MC.bumpDk }) + text(-240, -132, '2〜3ぷんご', { size: 38, w: 900, anchor: 'start', fill: C.muted });
    a += armSide(-330, 330, 40, 100) + bumpSide(0, 40, 92, eo(prog(t, c1 + 0.8, 1.2)));
    a += g(text(0, 0, 'あかくて、ぷっくり', { size: 46, w: 900, fill: MC.bumpDk }), { y: 198, o: prog(t, c1 + 2.0, 0.4) });
    out += pop(a, t, c1 - 0.1, 500, 480);
    let b = card(800, 500) + g(cal, { x: -300, y: -170 }) + text(-240, -186, 'つぎの ひ', { size: 52, w: 900, anchor: 'start', fill: MC.bump2Dk }) + text(-240, -132, '1〜2にちご', { size: 38, w: 900, anchor: 'start', fill: C.muted });
    b += armSide(-330, 330, 40, 100) + bumpSide(0, 40, 104, eo(prog(t, c2 + 1.0, 1.2)), true);
    b += g(text(0, 0, 'かたくて、あかちゃいろ', { size: 46, w: 900, fill: MC.bump2Dk }), { y: 198, o: prog(t, c2 + 2.4, 0.4) });
    out += pop(b, t, c2 - 0.1, 1420, 480);
    out += pop(badge('どちらが でるかは、ひとに よって ちがう', { fill: C.accent, size: 42 }), t, c3 + 0.4, 960, 800);
    return out;
  },
});

// 8. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -560, as = 'かの つばに、じぶんの からだが きづくから';
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 96, 2, as, { size: fit(as, 1060, 50, 900), w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['かが つば（だえき）を いれる', MC.salivaDk], ['みはりやくが きづく', MC.histDk], ['ぷくっと ふくらんで かゆい', MC.bumpDk]], t, 960, 600, { start: 2.4, step: 1.1, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const okIcon = `<circle r="24" fill="${C.accent}"/><path d="M -11 0 l 8 9 l 15 -17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      const items = [
        [g(eyeIcon(0.3)), 'すぐの ふくらみと、つぎの ひの ふくらみを くらべる', C.ink, cue(1)],
        [warnIcon(0.5), 'かくと、きずから ばいきんが はいる ことが ある', C.red, cue(2)],
        [okIcon, 'かかないで、せっけんと みずで あらって、ひやす', C.accent, cue(3)],
        [warnIcon(0.5), 'おおきい ときや、あつい ときは、おとなに みせる', C.red, cue(4)],
        [g(eyeIcon(0.3)), 'かは つかまえない。くちは、えや しゃしんで みる', C.ink, cue(5)],
      ];
      const isz = Math.min(...items.map(([, s]) => fit(s, 990, 44, 900)));
      items.forEach(([icn, s, col, st], i) => { b += pop(icn + text(64, 2, s, { size: isz, w: 900, anchor: 'start', fill: col }), t, st, 140, 320 + i * 100); });
      // 絵：すぐと 次の日 → かかない → 冷やす
      const PX = 1560, PYc = 500;
      let p = card(560, 560, { fill: '#fff' });
      const ph1 = 1 - prog(t, cue(2) - 0.3, 0.4);
      if (ph1 > 0) p += g(armSide(-250, 250, -110, 80) + bumpSide(0, -110, 70, 1) + text(0, -6, 'すぐ', { size: 36, w: 900, fill: MC.bumpDk }) + armSide(-250, 250, 110, 80) + bumpSide(0, 110, 80, 1, true) + text(0, 222, 'つぎの ひ', { size: 36, w: 900, fill: MC.bump2Dk }), { o: ph1 });
      const ph2 = prog(t, cue(2) - 0.1, 0.4);
      if (ph2 > 0) {
        let q = armSide(-250, 250, 20, 100) + bumpSide(0, 20, 84, 1);
        const sc = win(t, cue(2), cue(3) - 0.2, 0.3), ice = prog(t, cue(3) + 0.4, 0.5);
        if (sc > 0) q += g(`<path d="M -60 -150 Q -20 -70 -10 -40 M -20 -160 Q 10 -80 20 -40 M 20 -150 Q 40 -80 50 -40" fill="none" stroke="${MC.skinSh}" stroke-width="20" stroke-linecap="round"/>` + cross(10, -60, 0.8), { x: Math.sin(t * 14) * 10, o: sc }) + g(text(0, 0, 'かかない', { size: 44, w: 900, fill: C.red }), { y: 190, o: sc });
        if (ice > 0) q += g(`<path d="M -90 -10 Q -100 -110 0 -116 Q 100 -110 90 -10 Q 0 14 -90 -10 Z" fill="${MC.ice}" stroke="${MC.iceDk}" stroke-width="6"/><rect x="-22" y="-146" width="44" height="34" rx="8" fill="${MC.iceDk}"/><path d="M -40 -66 l 20 0 M 14 -80 l 22 0 M -10 -40 l 24 0" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`, { y: -6 + (1 - eo(ice)) * -60, o: ice }) + g(text(0, 0, 'ひやす', { size: 44, w: 900, fill: MC.iceDk }), { y: 190, o: ice });
        p += g(q, { o: ph2 });
      }
      b += pop(p, t, cue(1) + 0.4, PX, PYc);
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「か」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
