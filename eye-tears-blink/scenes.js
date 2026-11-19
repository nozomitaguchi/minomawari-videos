// みのまわり図鑑 動画「昼は青いのに、どうして夕やけは赤い？」
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
const TOPIC = 'なみだ';
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
// みのまわり図鑑 動画「泣くと、どうして鼻水まで出るの？」（なみだ）
// 出どころ：everyday-trivia trivia/eye-tears-blink.md

// ---------- 道具 ----------
const TEAR = { drop: '#5fb0f0', dropDark: '#2f86d0', film: '#bfe3ff', gland: '#f4b8b0', glandDark: '#d98a80', tube: '#f3c3bb', tubeDark: '#d48f86', snot: '#d9eefa' };
function arrow2(x1, y1, x2, y2, col = C.ink, w = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L ${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${col}"/>`;
}
// 指し線つきのラベル（(x,y) を指して、(tx,ty) に文字）
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 46 } = {}) => {
  if (o <= 0) return '';
  const an = tx < x ? 'end' : 'start', w = tw(str, size, 900);
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${an === 'end' ? tx - w - 30 : tx - 14}" y="${ty - size * 0.8}" width="${w + 44}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` +
    text(an === 'end' ? tx - 8 : tx + 8, ty + 2, str, { size, w: 900, fill: col, anchor: an }), { o });
};
// なみだのつぶ
const drop = (x, y, r = 10, o = 1) => o <= 0 ? '' : `<g opacity="${clamp(o)}"><path d="M ${x} ${y - r * 1.7} Q ${x + r * 1.05} ${y - r * 0.2} ${x} ${y + r} Q ${x - r * 1.05} ${y - r * 0.2} ${x} ${y - r * 1.7} Z" fill="${TEAR.drop}" stroke="${TEAR.dropDark}" stroke-width="2.5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.28}" fill="#fff" opacity="0.8"/></g>`;
const dot = (x, y, r = 9, o = 1) => o <= 0 ? '' : `<g opacity="${clamp(o)}"><circle cx="${x}" cy="${y}" r="${r}" fill="${TEAR.drop}" stroke="${TEAR.dropDark}" stroke-width="2.5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff" opacity="0.8"/></g>`;
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });

// ---------- 目のアップ（顔の右がわを前から見た絵。左が目じり、右が目がしらと鼻） ----------
// 場面では g(closeup(...), { x: CU.x, y: CU.y }) で置く。中の座標は カードの中心が (0,0)。
const CU = { x: 700, y: 480, w: 1080, h: 700 };
const CUZ = [1.22, -60, -40];  // ふだんの大きさ（目を大きめに）
// 2つの zoom のあいだ（カメラがまっすぐ動くように、倍率とずれを別々にまぜる）
const zoomMix = (A, B, k) => { const z = lerp(A[0], B[0], k), ox = lerp(A[1] * (1 - A[0]), B[1] * (1 - B[0]), k), oy = lerp(A[2] * (1 - A[0]), B[2] * (1 - B[0]), k); return [z, ox / (1 - z), oy / (1 - z)]; };
const EYE = { cx: -150, cy: -40, w: 260, h: 105, hl: 80 };
const eyeT = x => clamp((x - EYE.cx + EYE.w) / (2 * EYE.w));
const upY = x => { const k = eyeT(x); return EYE.cy - 4 * EYE.h * k * (1 - k); };
const loY = x => { const k = eyeT(x); return EYE.cy + 4 * EYE.hl * k * (1 - k); };
const ALMOND = `M ${EYE.cx - EYE.w} ${EYE.cy} Q ${EYE.cx} ${EYE.cy - 2 * EYE.h} ${EYE.cx + EYE.w} ${EYE.cy} Q ${EYE.cx} ${EYE.cy + 2 * EYE.hl} ${EYE.cx - EYE.w} ${EYE.cy} Z`;
// 涙点（上と下）・涙腺・鼻の穴
const PX = EYE.cx + EYE.w * 0.84;
const PUN = { u: [PX, upY(PX)], l: [PX, loY(PX)] };
const GLAND = [-300, -168];
const NOSTRIL = [300, 252];
// なみだの通り道（上の涙点を通る道と、下の涙点を通る道）
const PATH_U = [GLAND, [-322, -118], [-250, -62], [-120, -26], [10, -34], [PX - 8, -60], PUN.u, [PX, -86], [100, -90], [148, -80], [166, -50], [172, 40], [200, 140], [262, 208], [NOSTRIL[0] - 6, NOSTRIL[1] - 8]];
const PATH_L = [GLAND, [-322, -118], [-250, -62], [-120, -4], [10, -10], [PX - 8, -22], PUN.l, [PX, -2], [100, 4], [148, -10], [166, -30], [172, 40], [200, 140], [262, 208], [NOSTRIL[0] - 6, NOSTRIL[1] - 8]];
// 道の中の目じるし（番号は点の番号）： 0 涙腺 / 2〜5 目の表面 / 6 涙点 / 10 涙のう / 14 鼻
function pathLens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
const PL_U = pathLens(PATH_U), PL_L = pathLens(PATH_L);
// 点の番号 s（小数可）→ 道の長さ
const idxLen = (L, s) => { const i = Math.min(L.length - 2, Math.floor(s)); return lerp(L[i], L[i + 1], s - i); };
function pathAt(P, L, d) {
  d = clamp(d, 0, L[L.length - 1]);
  let i = 1; while (i < L.length - 1 && L[i] < d) i++;
  const k = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)];
}
// つぶを道にそって流す。a〜b は点の番号。fadeIn/fadeOut は はしで消す。
function flowDots(t, { a = 0, b = 14, n = 10, speed = 60, seed = 1, o = 1, r = 9, t0 = 0, fadeEnd = true } = {}) {
  if (o <= 0) return '';
  let out = '';
  for (let i = 0; i < n; i++) {
    const useU = i % 2 === 0, P = useU ? PATH_U : PATH_L, L = useU ? PL_U : PL_L;
    const da = idxLen(L, a), db = idxLen(L, b), span = db - da;
    const ph = rnd(i, seed) ;
    const k = ((Math.max(0, t - t0) * speed / span) + ph) % 1;
    const [x, y] = pathAt(P, L, da + k * span);
    const fo = Math.min(clamp(k / 0.08), fadeEnd ? clamp((1 - k) / 0.12) : 1) * clamp((t - t0) * 2 + ph * 0) * o;
    out += dot(x, y, r, fo);
  }
  return out;
}
// 目のアップ本体
//  film: なみだの膜 / gland: 涙腺を見せる / tubes: 管を見せる / lid: まぶたが閉じる量 / puncta: 涙点の丸
//  zoom: [倍率, 中心x, 中心y] / extra: 中に重ねる絵（同じ座標） / labelEye: めじり・めがしら
function closeup(t, { film = 0, gland = 0, glandPulse = 0, tubes = 0, tubeGlow = 0, lid = 0, puncta = 0, zoom = CUZ, extra = '', under = '', dust = [], look = [0, 0], filmTop = 1 } = {}) {
  const id = 'cu' + NOW.i;
  let s = `<clipPath id="${id}"><rect x="${-CU.w / 2}" y="${-CU.h / 2}" width="${CU.w}" height="${CU.h}" rx="48"/></clipPath>`;
  s += `<clipPath id="${id}e"><path d="${ALMOND}"/></clipPath>`;
  let c = `<rect x="${-CU.w / 2}" y="${-CU.h / 2}" width="${CU.w}" height="${CU.h}" fill="${CH.skin}"/>`;
  c += `<ellipse cx="-160" cy="210" rx="200" ry="90" fill="${CH.cheek}" opacity="0.35"/>`;
  // まゆげ
  c += `<path d="M -440 -196 Q -220 -282 30 -214" fill="none" stroke="${CH.hairB}" stroke-width="30" stroke-linecap="round"/>`;
  // 鼻（右がわ）
  c += `<path d="M 222 -300 Q 196 40 252 176" fill="none" stroke="${CH.skinShade}" stroke-width="14" stroke-linecap="round"/>`;
  c += `<path d="M 252 176 Q 214 214 236 252 Q 262 280 310 270 Q 380 292 560 262 L 560 350 L 230 350 Z" fill="${CH.skinShade}" opacity="0.55"/>`;
  c += `<path d="M 252 176 Q 214 214 236 252 Q 262 280 310 270" fill="none" stroke="${mix(CH.skinShade, '#a87060', 0.35)}" stroke-width="9" stroke-linecap="round"/>`;
  c += `<ellipse cx="${NOSTRIL[0] + 8}" cy="${NOSTRIL[1]}" rx="36" ry="15" fill="#9c5f52" transform="rotate(-8 ${NOSTRIL[0] + 8} ${NOSTRIL[1]})"/>`;
  c += under;
  // 涙腺（ひふの下にあるので、点線のふちで見せる）
  if (gland > 0) {
    const pu = 1 + glandPulse * 0.08 * Math.sin(t * 7);
    let gl = '';
    [[-34, -10, 34], [4, -22, 30], [36, -4, 28], [-6, 16, 30], [26, 22, 22]].forEach(([dx, dy, r]) => { gl += `<circle cx="${dx}" cy="${dy}" r="${r}" fill="${TEAR.gland}"/>`; });
    gl += `<ellipse cx="0" cy="0" rx="78" ry="56" fill="none" stroke="${TEAR.glandDark}" stroke-width="5" stroke-dasharray="12 9"/>`;
    c += g(gl, { x: GLAND[0], y: GLAND[1], s: pu, o: gland });
  }
  // 管（涙小管・涙のう・鼻涙管）
  if (tubes > 0) {
    const tp = `M ${PUN.u[0]} ${PUN.u[1]} L ${PX} -86 Q ${PX + 4} -94 100 -90 L 150 -80 M ${PUN.l[0]} ${PUN.l[1]} L ${PX} -2 Q ${PX + 4} 6 100 4 L 150 -10 M 166 -60 L 172 40 Q 186 130 ${NOSTRIL[0] - 8} ${NOSTRIL[1] - 10}`;
    let tb = `<path d="${tp}" fill="none" stroke="${TEAR.tubeDark}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>`;
    tb += `<path d="${tp}" fill="none" stroke="${TEAR.tube}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`;
    tb += `<ellipse cx="164" cy="-46" rx="26" ry="50" fill="${TEAR.tube}" stroke="${TEAR.tubeDark}" stroke-width="5"/>`;
    if (tubeGlow > 0) tb += `<path d="${tp}" fill="none" stroke="#ffe27a" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" opacity="${tubeGlow * (0.35 + 0.15 * Math.sin(t * 6))}"/>`;
    c += g(tb, { o: tubes });
  }
  // 目
  let e = `<path d="${ALMOND}" fill="#fdfcf8"/>`;
  let ein = `<ellipse cx="${EYE.cx + 40}" cy="${EYE.cy + 30}" rx="${EYE.w}" ry="40" fill="#ebe6dc" opacity="0.6"/>`;
  ein += `<circle cx="${EYE.cx - 8 + look[0]}" cy="${EYE.cy + 4 + look[1]}" r="70" fill="#7a5235"/><circle cx="${EYE.cx - 8 + look[0]}" cy="${EYE.cy + 4 + look[1]}" r="70" fill="none" stroke="#5a3a24" stroke-width="6"/>`;
  ein += `<circle cx="${EYE.cx - 8 + look[0]}" cy="${EYE.cy + 4 + look[1]}" r="32" fill="${C.ink}"/><circle cx="${EYE.cx - 30 + look[0]}" cy="${EYE.cy - 18 + look[1]}" r="13" fill="#fff"/>`;
  dust.forEach(([x, y, o]) => { if (o > 0) ein += `<path d="M ${x - 9} ${y - 4} L ${x + 2} ${y - 10} L ${x + 10} ${y - 1} L ${x + 3} ${y + 9} L ${x - 8} ${y + 6} Z" fill="#6f675a" opacity="${o}"/><circle cx="${x + 15}" cy="${y + 9}" r="5" fill="#6f675a" opacity="${o}"/>`; });
  if (film > 0) {
    const top = lerp(EYE.cy + EYE.hl + 10, EYE.cy - EYE.h - 10, filmTop);
    ein += `<g opacity="${film}"><rect x="${EYE.cx - EYE.w}" y="${top}" width="${EYE.w * 2}" height="${EYE.h + EYE.hl + 30}" fill="${TEAR.film}" opacity="${0.2 + 0.06 * Math.sin(t * 3)}"/>`;
    ein += `<path d="M ${EYE.cx - 150} ${EYE.cy - 62} Q ${EYE.cx - 40} ${EYE.cy - 92} ${EYE.cx + 90} ${EYE.cy - 66}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="${0.7 * clamp(filmTop * 1.4 - 0.4)}"/></g>`;
  }
  e += `<g clip-path="url(#${id}e)">${ein}</g>`;
  // 目がしらのピンクのところ
  e += `<ellipse cx="${EYE.cx + EYE.w - 22}" cy="${EYE.cy}" rx="18" ry="12" fill="#eba3a0"/>`;
  // 涙点（小さな穴）
  e += `<circle cx="${PUN.u[0]}" cy="${PUN.u[1]}" r="5" fill="#9c5f52"/><circle cx="${PUN.l[0]}" cy="${PUN.l[1]}" r="5" fill="#9c5f52"/>`;
  // まぶたのふち
  e += `<path d="M ${EYE.cx - EYE.w} ${EYE.cy} Q ${EYE.cx} ${EYE.cy + 2 * EYE.hl} ${EYE.cx + EYE.w} ${EYE.cy}" fill="none" stroke="#c99a86" stroke-width="5"/>`;
  // まぶた（閉じる）
  if (lid > 0) {
    let up = '', dn = '';
    for (let i = 0; i <= 40; i++) { const x = EYE.cx - EYE.w + i / 40 * EYE.w * 2; up += (i ? ' L ' : 'M ') + x + ' ' + (upY(x) - 2); dn = ` L ${x} ${lerp(upY(x), loY(x), lid)}` + dn; }
    e += `<path d="${up}${dn} Z" fill="${CH.skin}"/>`;
    let edge = ''; for (let i = 0; i <= 40; i++) { const x = EYE.cx - EYE.w + i / 40 * EYE.w * 2; edge += (i ? ' L ' : 'M ') + x + ' ' + lerp(upY(x), loY(x), lid); }
    e += `<path d="${edge}" fill="none" stroke="${CH.line}" stroke-width="8" stroke-linecap="round"/>`;
  }
  // 上まぶたのふちと まつげ
  const lidY = x => lerp(upY(x), loY(x), lid);
  e += `<path d="M ${EYE.cx - EYE.w} ${EYE.cy} Q ${EYE.cx} ${lerp(EYE.cy - 2 * EYE.h, EYE.cy + 2 * EYE.hl, lid)} ${EYE.cx + EYE.w} ${EYE.cy}" fill="none" stroke="${CH.line}" stroke-width="9" stroke-linecap="round"/>`;
  for (let i = 0; i < 7; i++) {
    const x = EYE.cx - EYE.w + 30 + i * 52, y = lidY(x), dir = lid > 0.5 ? 1 : -1;
    e += `<path d="M ${x} ${y} q ${-10 - (6 - i) * 2} ${dir * 16} ${-18 - (6 - i) * 3} ${dir * 24}" fill="none" stroke="${CH.line}" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (puncta > 0) {
    [PUN.u, PUN.l].forEach(([x, y]) => { e += `<circle cx="${x}" cy="${y}" r="${16 + 3 * Math.sin(t * 6)}" fill="none" stroke="${C.red}" stroke-width="4" opacity="${puncta}"/>`; });
  }
  c += e + extra;
  const [z, fx, fy] = zoom;
  s += `<g clip-path="url(#${id})"><g transform="translate(${-fx * (z - 1)} ${-fy * (z - 1)}) scale(${z})">${c}</g></g>`;
  s += `<rect x="${-CU.w / 2}" y="${-CU.h / 2}" width="${CU.w}" height="${CU.h}" rx="48" fill="none" stroke="#fff" stroke-width="10"/>`;
  return `<g filter="url(#shadow)"><rect x="${-CU.w / 2}" y="${-CU.h / 2}" width="${CU.w}" height="${CU.h}" rx="48" fill="#fff"/></g>` + s;
}
const cuAt = (t, o) => g(closeup(t, o), { x: CU.x, y: CU.y });
// アップの中の座標 → 画面の座標（zoom も考える）
const cuPt = (x, y, zoom = CUZ) => { const [z, fx, fy] = zoom; return [CU.x + fx + (x - fx) * z, CU.y + fy + (y - fy) * z]; };

// 泣いている顔（おとうとに重ねる。x, y は足もと、s は大きさ）
function cryOverlay(t, x, y, s, { tears = 1, snot = 0 } = {}) {
  const bob = Math.sin((NOW.t + 1) * 2.6 + 1) * 3;
  let o = `<ellipse cx="0" cy="-261" rx="9" ry="6" fill="${CH.skinShade}"/>`;
  // まゆ（こまり顔：内がわが上がる）
  o += `<path d="M -56 -304 L -22 -314 M 56 -304 L 22 -314" stroke="${CH.line}" stroke-width="6" stroke-linecap="round"/>`;
  if (tears > 0) {
    [-1, 1].forEach(sd => {
      o += `<path d="M ${sd * 34} -270 Q ${sd * 50} -252 ${sd * 52} -230 Q ${sd * 54} -218 ${sd * 60} -212" fill="none" stroke="${TEAR.drop}" stroke-width="8" stroke-linecap="round" opacity="${0.85 * tears}"/>`;
      for (let k = 0; k < 2; k++) {
        const p = ((t * 0.9 + k * 0.5 + (sd > 0 ? 0.25 : 0)) % 1);
        o += drop(sd * (62 + p * 8), -206 + p * 60, 7, tears * (1 - p));
      }
    });
  }
  if (snot > 0) {
    const L = 9 + 3 * Math.sin(t * 2.2) + 4 * snot;
    o += `<path d="M -9 -257 Q -14 ${-257 + L * 0.6} -9 ${-257 + L} Q -4 ${-257 + L * 0.6} -4 -257 Z" fill="${TEAR.snot}" stroke="#7fb2d6" stroke-width="2.5" opacity="${snot}"/>`;
    o += `<path d="M 9 -257 Q 14 ${-257 + L * 0.5} 9 ${-257 + L * 0.8} Q 4 ${-257 + L * 0.5} 4 -257 Z" fill="${TEAR.snot}" stroke="#7fb2d6" stroke-width="2.5" opacity="${snot}"/>`;
  }
  return `<g transform="translate(${x} ${y + bob * s}) scale(${s})">${o}</g>`;
}
// へやの背景
const room = () => `<rect width="1920" height="1080" fill="#f6eedd"/><rect x="0" y="780" width="1920" height="300" fill="#e8d6b8"/>` +
  `<rect x="1180" y="170" width="440" height="330" rx="16" fill="#cfe6f3" stroke="#fff" stroke-width="16"/><line x1="1400" y1="170" x2="1400" y2="500" stroke="#fff" stroke-width="10"/>` +
  `<rect x="140" y="560" width="260" height="230" rx="18" fill="#c9a77c"/><rect x="160" y="580" width="220" height="90" rx="10" fill="#b8946a"/><rect x="160" y="684" width="220" height="90" rx="10" fill="#b8946a"/>`;
// たまねぎ・けむり・目（なみだの種類の絵）
const onion = `<path d="M 0 -70 Q 60 -20 50 30 Q 40 62 0 64 Q -40 62 -50 30 Q -60 -20 0 -70 Z" fill="#f0e2c4" stroke="#c9a76a" stroke-width="5"/><path d="M 0 -70 Q 22 -10 18 60 M 0 -70 Q -22 -10 -18 60" fill="none" stroke="#d9c08e" stroke-width="4"/><path d="M 0 -70 q -6 -26 4 -40" fill="none" stroke="#7aa65a" stroke-width="6" stroke-linecap="round"/>`;
const smoke = t => [0, 1, 2].map(k => { const p = (t * 0.4 + k / 3) % 1; return `<circle cx="${Math.sin(p * 6 + k) * 14}" cy="${40 - p * 110}" r="${16 + p * 18}" fill="#b9b4ab" opacity="${0.7 * (1 - p)}"/>`; }).join('');
const miniFace = (mood) => {
  let f = `<circle r="52" fill="${CH.skin}" stroke="${CH.skinShade}" stroke-width="4"/>`;
  if (mood === 'happy') f += `<path d="M -26 -6 q 8 -10 16 0 M 10 -6 q 8 -10 16 0" fill="none" stroke="${CH.line}" stroke-width="5" stroke-linecap="round"/><path d="M -20 16 Q 0 34 20 16" fill="#8e3b33"/>`;
  else if (mood === 'sad') f += `<circle cx="-18" cy="-6" r="6" fill="${CH.line}"/><circle cx="18" cy="-6" r="6" fill="${CH.line}"/><path d="M -16 26 Q 0 14 16 26" fill="none" stroke="${CH.line}" stroke-width="5" stroke-linecap="round"/>`;
  else f += `<ellipse cx="-18" cy="-6" rx="7" ry="9" fill="${CH.line}"/><ellipse cx="18" cy="-6" rx="7" ry="9" fill="${CH.line}"/><ellipse cx="0" cy="24" rx="9" ry="11" fill="#8e3b33"/>`;
  f += drop(30, 14, 8);
  return f;
};
const mirrorIcon = `<ellipse cx="0" cy="-6" rx="44" ry="54" fill="#dff1fa" stroke="${C.ochre}" stroke-width="10"/><path d="M -18 -34 q 10 -12 24 -10" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><rect x="-9" y="46" width="18" height="34" rx="8" fill="${C.ochre}"/>`;
const punctumIcon = `<path d="M -70 0 Q 0 -60 70 0 Q 0 46 -70 0 Z" fill="#fff" stroke="${C.ink}" stroke-width="6"/><circle cx="-6" cy="0" r="22" fill="#7a5235"/><circle cx="-6" cy="0" r="10" fill="${C.ink}"/><ellipse cx="58" cy="0" rx="8" ry="6" fill="#eba3a0"/><circle cx="48" cy="11" r="5" fill="#9c5f52"/><circle cx="48" cy="11" r="13" fill="none" stroke="${C.red}" stroke-width="4"/>`;

// 1. つかみ：泣くと鼻水まで出る
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = room();
    const BX = 800, BY = 840, BS = 1.45;
    out += kidShow('B', t, BX, BY, { s: BS, start: -1, n: 0, eyes: 'closed', mouth: 'open', bubble: false, enter: 'pop', act: 'nod' });
    out += cryOverlay(t, BX, BY, BS, { tears: prog(t, 0.3, 0.6), snot: prog(t, cue(1) + 0.4, 0.8) });
    // えーん
    [0, 1].forEach(k => {
      const st = 0.4 + k * 1.6, p = prog(t, st, 0.4);
      if (p > 0) out += g(text(0, 0, 'えーん', { size: 72, w: 900, fill: C.blueUi }), { x: BX + (k ? 250 : -260), y: 360 + k * 40 + Math.sin(t * 14) * 3, o: p * (1 - prog(t, cue(1), 0.4)), s: lerp(0.6, 1, back(p)), r: k ? 8 : -8 });
    });
    // なみだ・はなみず のラベル
    out += callout(BX - 52 * BS, BY - 232 * BS, 400, 470, 'なみだ', prog(t, cue(1) - 0.2, 0.3) * (1 - prog(t, cueE(3) + 0.3, 0.3)), { col: TEAR.dropDark, size: 50 });
    out += callout(BX - 9 * BS, BY - 250 * BS, 400, 640, 'はなみず', prog(t, cue(1) + 0.9, 0.3) * (1 - prog(t, cueE(3) + 0.3, 0.3)), { col: '#5b8fb0', size: 50 });
    out += kidShow('S', t, 1480, 840, { s: 0.62, start: cue(1) + 0.6, n: 1 });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1130, y: 330, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${TEAR.dropDark}">なく</tspan>と、どうして</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="130" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#5b8fb0">はなみず</tspan>まで でるの？</text>`, { x: 960, y: 600, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = drop(-120, 10, 34) + arrow2(-60, 0, 50, 0, C.muted, 10) + `<path d="M 100 -60 Q 92 10 112 40 Q 96 56 110 70 Q 130 84 160 74" fill="none" stroke="${CH.skinShade}" stroke-width="12" stroke-linecap="round"/><path d="M 120 76 q -4 24 2 40" stroke="#8fc0e0" stroke-width="12" stroke-linecap="round"/>`;
      out += pop(ic, t, t0 + 1.8, 940, 800);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'ないた ときの はなみずは なに？', { size: 76, w: 900 }), t, 0.3, 820, 200);
    const opts = [['①', 'めから はなへ ながれこんだ なみだ'], ['②', 'かなしいと、はなも はなみずを つくる'], ['③', 'おおきな こえで、のどから みずが あがる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 46, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(drop(-40, 0, 40) + text(60, -10, '？', { size: 150, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1690, 330);
    out += kidShow('S', t, 1690, 840, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1500, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. なみだは いつも出ている
SCENES.push({
  id: 'always',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const film = prog(t, cue(1) + 0.4, 1.2);
    out += pop(closeup(t, { film, filmTop: 1 }), t, 0.2, CU.x, CU.y, { d: 0.5 });
    out += pop(badge('ないて いない ときも', { fill: C.blueUi, size: 46 }), t, cue(0) + 0.8, 1580, 300);
    out += pop(drop(0, 0, 30), t, cue(0) + 1.4, 1580, 450);
    const [ex, ey] = cuPt(EYE.cx + 60, EYE.cy - 50);
    out += callout(ex, ey, 1360, 640, 'うすい なみだの まく', prog(t, cue(1) + 1.6, 0.3), { col: TEAR.dropDark, size: 44 });
    return out;
  },
});

// 4. 涙腺で作られる
SCENES.push({
  id: 'gland',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const gl = prog(t, cue(0) + 1.4, 0.5);
    const flow = flowDots(t, { a: 0, b: 4, n: 8, speed: 70, seed: 3, t0: cue(1) + 0.6, o: prog(t, cue(1) + 0.6, 0.4) });
    out += cuAt(t, { film: 1, gland: gl, glandPulse: 1, extra: flow });
    // めじり・めがしら
    const lb = win(t, 0.3, cue(1) + 0.2, 0.3);
    out += g(text(0, 0, 'めじり', { size: 40, w: 900, fill: C.muted }), { x: cuPt(EYE.cx - EYE.w + 40, 0)[0], y: cuPt(0, 80)[1], o: lb });
    out += g(text(0, 0, 'めがしら', { size: 40, w: 900, fill: C.muted }), { x: cuPt(EYE.cx + EYE.w - 30, 0)[0], y: cuPt(0, 80)[1], o: lb });
    const [gx, gy] = cuPt(GLAND[0], GLAND[1]);
    out += callout(gx + 40, gy - 30, 1360, 280, 'るいせん', prog(t, cue(1) + 0.3, 0.3), { col: TEAR.glandDark, size: 54 });
    out += pop(badge('めじりの うえの ほう', { fill: C.ochre, size: 44 }), t, cue(0) + 1.6, 1590, 470);
    out += pop(badge('ここで なみだを つくる', { fill: TEAR.glandDark, size: 44 }), t, cue(1) + 1.4, 1590, 600);
    return out;
  },
});

// 5. まばたきで広がる
SCENES.push({
  id: 'blink',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // まばたきの時刻
    const B = [cue(0) + 1.0, cue(0) + 3.2, cue(1) + 2.0, cue(2) + 0.8, cue(2) + 2.4, cue(2) + 4.2];
    let lid = 0; B.forEach(b => { const p = (t - b) / 0.36; if (p > 0 && p < 1) lid = Math.max(lid, Math.sin(p * Math.PI)); });
    // なみだが広がる（最初のまばたきのあと、上から下へ）
    const ft = eio(prog(t, B[0] + 0.18, 0.9));
    // ごみ：2つ目の場面で出てきて、まばたきで目がしらへ流れる
    const dO = prog(t, cue(1) - 0.2, 0.3), wash = eio(prog(t, B[2] + 0.18, 1.6));
    const dust = [[-260, -10], [-170, 30], [-90, -40], [-20, 20]].map(([x, y], i) => [lerp(x, EYE.cx + EYE.w - 40, wash * (0.8 + 0.05 * i)), lerp(y, EYE.cy + 6, wash), dO * (1 - prog(wash, 0.75, 0.25))]);
    out += cuAt(t, { film: 1, filmTop: Math.max(0.0001, ft), lid, dust, extra: flowDots(t, { a: 1, b: 5, n: 6, speed: 80, seed: 5, t0: B[0], o: ft }) });
    out += pop(badge('ぱちっ', { fill: C.blueUi, size: 50 }), t, B[0] - 0.1, 1560, 260, { end: B[0] + 1.6 });
    out += pop(badge('めの ぜんたいに ひろがる', { fill: C.blueUi, size: 42 }), t, cue(0) + 2.4, 1580, 400);
    out += pop(badge('ごみも ながす', { fill: C.accent, size: 46 }), t, cue(1) + 0.8, 1580, 530);
    // 1分に15〜20回
    const cO = prog(t, cue(2) - 0.1, 0.4);
    if (cO > 0) {
      const sec = clamp((t - cue(2)) / 4) * 60;
      let c = `<circle r="70" fill="#fff" stroke="${C.ink}" stroke-width="8"/><rect x="-14" y="-96" width="28" height="22" rx="6" fill="${C.ink}"/>`;
      c += `<path d="M 0 0 L 0 -58 A 58 58 0 ${sec > 30 ? 1 : 0} 1 ${Math.sin(sec / 60 * Math.PI * 2) * 58} ${-Math.cos(sec / 60 * Math.PI * 2) * 58} Z" fill="${C.accentSoft}"/>`;
      c += `<line x1="0" y1="0" x2="${Math.sin(sec / 60 * Math.PI * 2) * 56}" y2="${-Math.cos(sec / 60 * Math.PI * 2) * 56}" stroke="${C.redUi}" stroke-width="7" stroke-linecap="round"/><circle r="8" fill="${C.ink}"/>`;
      out += g(c, { x: 1420, y: 700, o: cO });
      out += g(text(0, -24, '1ぷんに', { size: 40, w: 900, fill: C.muted, anchor: 'start' }) + text(0, 34, '15〜20かい', { size: 60, w: 900, fill: C.blueUi, anchor: 'start' }), { x: 1520, y: 700, o: prog(t, cue(2) + 0.8, 0.3) });
    }
    return out;
  },
});

// 6. 涙点
SCENES.push({
  id: 'punctum',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const zk = eio(prog(t, cue(1) - 0.2, 1.2));
    const zoom = zoomMix(CUZ, [2.4, PX + 10, -44], zk);
    const flow = flowDots(t, { a: 1, b: 6.6, n: 12, speed: 90, seed: 7, t0: 0.4, r: lerp(9, 6, zk) });
    out += cuAt(t, { film: 1, puncta: prog(t, cue(1) + 1.6, 0.4), zoom, extra: flow });
    out += pop(arrow2(0, 0, 160, 0, TEAR.dropDark, 12) + text(80, -48, 'はなの ほうへ', { size: 40, w: 900, fill: TEAR.dropDark }), t, cue(0) + 1.2, 1400, 300, { end: cue(1) - 0.2 });
    const [ux, uy] = cuPt(PUN.u[0], PUN.u[1], zoom), [lx, ly] = cuPt(PUN.l[0], PUN.l[1], zoom);
    const lo = prog(t, cue(1) + 2.4, 0.3);
    out += callout(ux + 14, uy - 10, 1390, 230, 'うえの あな', lo, { col: C.red, size: 42 });
    out += callout(lx + 14, ly + 10, 1390, 390, 'したの あな', lo, { col: C.red, size: 42 });
    out += pop(badge('るいてん', { fill: C.red, size: 60, pad: 44 }), t, cue(3) + 0.3, 1560, 560);
    out += g(text(0, 0, 'なみだの すいこみぐち', { size: 40, w: 900, fill: C.muted }), { x: 1560, y: 650, o: prog(t, cue(3) + 1.6, 0.3) });
    out += kidShow('B', t, 1760, 845, { s: 0.48, start: cue(2) - 0.8, n: 0, side: 'left', end: cue(3) + 0.2 });
    return out;
  },
});

// 7. 細い管で鼻へ
SCENES.push({
  id: 'nose',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const tb = prog(t, cue(0) + 0.8, 0.8);
    const flow = flowDots(t, { a: 2, b: 6.4, n: 8, speed: 85, seed: 8, t0: 0.4 }) + flowDots(t, { a: 6, b: 14, n: 10, speed: 85, seed: 9, t0: cue(0) + 1.2, o: tb });
    out += cuAt(t, { film: 1, tubes: tb, tubeGlow: win(t, cue(1), cueE(1) + 0.4, 0.3), extra: flow });
    const [dx, dy] = cuPt(186, 120), [nx, ny] = cuPt(NOSTRIL[0] + 30, NOSTRIL[1] - 60);
    out += callout(dx, dy, 1340, 300, 'ほそい くだ', prog(t, cue(0) + 2.0, 0.3), { col: TEAR.tubeDark, size: 46 });
    out += callout(nx, ny, 1340, 470, 'はなの なか', prog(t, cue(0) + 3.4, 0.3), { col: '#9c5f52', size: 46 });
    out += pop(badge('め と はな は つながっている', { fill: C.accent, size: 36 }), t, cue(1) + 0.6, 1580, 170);
    // はなの中で：かわく・からだに もどる
    const cO = prog(t, cue(2) + 0.6, 0.4);
    if (cO > 0) {
      let c = '';
      for (let k = 0; k < 3; k++) { const p = (t * 0.6 + k / 3) % 1; c += `<path d="M ${-20 + k * 20} ${-p * 60} q 10 -14 0 -28 q -10 -14 0 -28" fill="none" stroke="#9fc4dc" stroke-width="6" stroke-linecap="round" opacity="${1 - p}"/>`; }
      out += g(c + text(70, -30, 'かわく', { size: 44, w: 900, fill: '#5b8fb0', anchor: 'start' }), { x: 1440, y: 680, o: cO });
      out += g(arrow2(-40, -30, 30, 20, C.redUi, 9) + text(60, 0, 'からだに もどる', { size: 44, w: 900, fill: C.redUi, anchor: 'start' }), { x: 1420, y: 780, o: prog(t, cue(2) + 2.2, 0.4) });
    }
    return out;
  },
});

// 8. なみだの3つの種類
SCENES.push({
  id: 'kinds',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'なみだの 3つの しゅるい', { size: 72, w: 900 }), t, cue(0) + 0.2, 960, 200);
    const cur = curLine();
    const items = [
      ['ふだんの なみだ', ['いつも めを', 'うるおして まもる'], g(eyeIcon(0.8), {}) + `<path d="M -60 -30 Q 0 -66 60 -30" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>` + drop(90, 40, 16), C.blueUi],
      ['しげきの なみだ', ['ごみ・けむり・たまねぎを', 'あらいながす'], g(onion, { x: -50, y: 10 }) + g(smoke(t), { x: 60, y: 0 }) + drop(110, 50, 14), C.accent],
      ['きもちの なみだ', ['うれしい・かなしい・', 'こわい'], g(miniFace('happy'), { x: -110, s: 0.8 }) + g(miniFace('sad'), { x: 0, s: 0.8 }) + g(miniFace('scared'), { x: 110, s: 0.8 }), C.redUi],
    ];
    items.forEach(([h, sub, ic, col], i) => {
      const x = 360 + i * 600, on = cur === i + 1;
      const c = (on ? `<rect x="-270" y="-270" width="540" height="540" rx="40" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(520, 520) +
        g(ic, { y: -100, s: 1.5 }) + `<rect x="-200" y="40" width="400" height="76" rx="38" fill="${col}"/>` + ctext(0, 80, h, { size: 44, w: 900, fill: '#fff' }) +
        sub.map((l, k) => text(0, 162 + k * 46, l, { size: 36, w: 700, fill: C.muted })).join('');
      out += pop(c, t, cue(i + 1) - 0.2, x, 540);
    });
    return out;
  },
});

// 9. たくさん泣くと、あふれて鼻へ
SCENES.push({
  id: 'cry',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(4) - 0.7, 0.35);
    if (aO > 0) {
      const many = prog(t, cue(0) + 1.0, 1.0);
      let ex = flowDots(t, { a: 0, b: 14, n: 12, speed: 90, seed: 11, t0: 0.2 }) + flowDots(t, { a: 0, b: 6.2, n: Math.round(24 * many), speed: 120, seed: 12, t0: 0.2, o: many });
      // 目の表面にたまる
      const pool = prog(t, cue(1) + 0.4, 1.4);
      if (pool > 0) {
        let pp = ''; for (let i = 0; i <= 30; i++) { const x = EYE.cx - EYE.w + 30 + i / 30 * (EYE.w * 2 - 60); pp += (i ? ' L ' : 'M ') + x + ' ' + (loY(x) - 4 - 18 * pool * Math.sin(i / 30 * Math.PI)); }
        for (let i = 30; i >= 0; i--) { const x = EYE.cx - EYE.w + 30 + i / 30 * (EYE.w * 2 - 60); pp += ` L ${x} ${loY(x) + 2}`; }
        ex += `<path d="${pp} Z" fill="${TEAR.drop}" opacity="0.55"/>`;
      }
      // 涙点の前でつまる
      ex += g(text(0, 0, 'まんいん！', { size: 38, w: 900, fill: C.red }), { x: PX - 20, y: -150, o: win(t, cue(1) + 0.6, cue(2) + 0.6, 0.3) });
      // ほおを流れる
      const ov = prog(t, cue(2) + 0.2, 0.6);
      if (ov > 0) {
        [[-200, 0], [-80, 0.4]].forEach(([x0, ph]) => {
          const y0 = loY(x0) + 2, len = 150 * eo(ov);
          ex += `<path d="M ${x0 - 8} ${y0} Q ${x0 - 34} ${y0 + len * 0.45} ${x0 - 22} ${y0 + len} L ${x0 + 2} ${y0 + len} Q ${x0 - 12} ${y0 + len * 0.45} ${x0 + 12} ${y0} Z" fill="${TEAR.drop}" opacity="0.6"/>`;
          for (let k = 0; k < 2; k++) { const p = (t * 0.7 + ph + k * 0.5) % 1; ex += drop(x0 - 12, y0 + len + p * 90, 13, ov * (1 - p)); }
        });
      }
      // はなから出る
      const ns = prog(t, cue(2) + 1.4, 0.8);
      if (ns > 0) {
        const L = 40 + 50 * ns + 6 * Math.sin(t * 3);
        ex += `<path d="M ${NOSTRIL[0] - 10} ${NOSTRIL[1] + 6} Q ${NOSTRIL[0] - 22} ${NOSTRIL[1] + L * 0.6} ${NOSTRIL[0] - 4} ${NOSTRIL[1] + L} Q ${NOSTRIL[0] + 14} ${NOSTRIL[1] + L * 0.6} ${NOSTRIL[0] + 14} ${NOSTRIL[1] + 6} Z" fill="${TEAR.drop}" opacity="0.7" stroke="${TEAR.dropDark}" stroke-width="3"/>`;
      }
      let a = cuAt(t, { film: 1, gland: 1, glandPulse: many, tubes: 1, tubeGlow: win(t, cue(1) + 0.2, cue(2), 0.3), extra: ex, look: [0, 6] });
      a += pop(badge('なみだが いっぱい', { fill: C.blueUi, size: 44 }), t, cue(0) + 1.4, 1560, 240);
      a += pop(badge('ながす みちが おいつかない', { fill: C.redUi, size: 38 }), t, cue(1) + 0.6, 1560, 370);
      const [cx, cy] = cuPt(-222, 150);
      a += callout(cx, cy, 1340, 500, 'ほおを ながれる', prog(t, cue(2) + 1.0, 0.3), { col: TEAR.dropDark, size: 42 });
      a += kidShow('K', t, 1440, 845, { s: 0.55, start: cue(3) - 0.7, n: 0, side: 'right' });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(4) - 0.35, 0.35);
    if (bO > 0) {
      let b = room();
      const BX = 760, BY = 840, BS = 1.45;
      b += kidShow('B', t, BX, BY, { s: BS, start: -1, n: 1, eyes: 'closed', mouth: 'open', bubble: false, enter: 'pop', act: 'nod' });
      b += cryOverlay(t, BX, BY, BS, { tears: 1, snot: 1 });
      b += callout(BX + 9 * BS, BY - 250 * BS, 1120, 470, 'はなみずの おおくは なみだ', prog(t, cue(4) + 1.6, 0.3), { col: '#5b8fb0', size: 48 });
      // 目から鼻への道（点線）
      const dl = prog(t, cue(4) + 0.4, 0.8);
      if (dl > 0) b += `<path d="M ${BX + 34 * BS} ${BY - 270 * BS} Q ${BX + 20 * BS} ${BY - 262 * BS} ${BX + 8 * BS} ${BY - 258 * BS}" fill="none" stroke="${TEAR.dropDark}" stroke-width="6" stroke-dasharray="8 7" opacity="${dl}"/>`;
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 10. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      const CX = 960, CY = 330, NX = -560;
      let a = pop(card(1300, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.blueUi}"/>` + text(NX, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'めから はなへ ながれこんだ なみだ', { size: 56, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['るいせんで つくる', TEAR.glandDark], ['るいてんに はいる', C.red], ['くだを とおって はなへ', C.accent]], t, 960, 600, { start: 2.4, step: 0.9, size: 40 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const items = [
        [mirrorIcon, 'かがみで、めがしらを みる', C.ink, cue(1)],
        [punctumIcon, 'したの まぶたの ふち、はなの ちかくの あな', C.ink, cue(2)],
        [g(punctumIcon, { s: 1 }).replace('cy="11" r="5"', 'cy="-12" r="5"').replace('cy="11" r="13"', 'cy="-12" r="13"'), 'うえの まぶたにも ある', C.ink, cue(3)],
        [warnIcon, 'まぶたを ひっぱったり、さわったり しない', C.red, cue(4)],
      ];
      items.forEach(([ic, s, col, st], i) => { b += pop(g(ic, { s: 0.8 }) + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, st, 230, 330 + i * 135); });
      // かがみの中の目がしら（涙点に丸）
      const mO = prog(t, cue(1) + 0.4, 0.5);
      if (mO > 0) {
        let m = `<clipPath id="mir"><ellipse cx="0" cy="0" rx="190" ry="240"/></clipPath><rect x="-26" y="230" width="52" height="120" rx="20" fill="${C.ochre}"/>`;
        let mi = `<rect x="-200" y="-250" width="400" height="500" fill="${CH.skin}"/><path d="M 120 -250 Q 96 0 140 250" fill="none" stroke="${CH.skinShade}" stroke-width="12"/>`;
        // 目の右はし（目がしら）を大きく
        mi += `<path d="M -320 0 Q -120 -170 80 0 Q -120 130 -320 0 Z" fill="#fdfcf8"/><circle cx="-210" cy="0" r="90" fill="#7a5235"/><circle cx="-210" cy="0" r="42" fill="${C.ink}"/>`;
        mi += `<ellipse cx="62" cy="0" rx="16" ry="12" fill="#eba3a0"/>`;
        mi += `<path d="M -320 0 Q -120 -170 80 0" fill="none" stroke="${CH.line}" stroke-width="9"/><path d="M -320 0 Q -120 130 80 0" fill="none" stroke="#c99a86" stroke-width="6"/>`;
        const pu = [38, -0.5 * (1 - Math.pow((38 + 120) / 200, 2)) * 170 + 0], qu = [38, 0];
        const uy = (() => { const k = (38 + 320) / 400; return -2 * k * (1 - k) * 170; })(), ly = (() => { const k = (38 + 320) / 400; return 2 * k * (1 - k) * 130; })();
        mi += `<circle cx="38" cy="${uy}" r="6" fill="#9c5f52"/><circle cx="38" cy="${ly}" r="6" fill="#9c5f52"/>`;
        const r1 = prog(t, cue(2) + 1.0, 0.4), r2 = prog(t, cue(3) + 0.6, 0.4);
        mi += g(`<circle r="${22 + 3 * Math.sin(t * 6)}" fill="none" stroke="${C.red}" stroke-width="6"/>`, { x: 38, y: ly, o: r1 });
        mi += g(`<circle r="${22 + 3 * Math.sin(t * 6)}" fill="none" stroke="${C.red}" stroke-width="6"/>`, { x: 38, y: uy, o: r2 });
        m += `<g clip-path="url(#mir)">${mi}</g><ellipse cx="0" cy="0" rx="190" ry="240" fill="none" stroke="${C.ochre}" stroke-width="22"/>`;
        m += `<path d="M -120 -150 q 30 -50 90 -60" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`;
        b += g(m, { x: 1500, y: 430, o: mO, s: lerp(0.9, 1, eo(mO)) });
      }
      b += kidShow('K', t, 1790, 845, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「め」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
