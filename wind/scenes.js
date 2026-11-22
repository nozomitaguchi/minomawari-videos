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
  let en = enter || vpick(KID_ENTER, key); const ac = act || vpick(KID_ACT, key + 50);
  if (who === 'K' && (en === 'slideL' || en === 'slideR')) en = x > 960 ? 'slideR' : 'slideL';  // カメレオンは頭から入ってくる（うしろ向きに進まない）
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
  if (who === 'K') sx = Math.abs(sx) * (x > 960 ? -1 : 1);  // カメレオンは画面の内がわを向く（絵は右向き。右半分にいるときは左右を返す）
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
// みのまわり図鑑「風は、どうして ふくの？」（もとの記事：everyday-trivia trivia/wind-blow.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
const WD = { air: '#ffffff', hot: '#ff9a4a', hotDk: '#d4612a', blue: '#2f78c8', sea: '#3f8fc8', seaN: '#2b557e', sand: '#ecd9a6', sandN: '#8a8268', land: '#8fca7e', landN: '#4d7a5c', flag: '#e8412c' };

// ---------- 風の道具 ----------
// はた。(x, y) はポールの根もと、h はポールの高さ、w は布の長さ。
//   dir：+1 で右へなびく / -1 で左へなびく。k：0（たれさがる）〜1（よくなびく）
function flag(x, y, t, { h = 240, w = 130, dir = 1, k = 1, col = WD.flag, seed = 0, pw = 10 } = {}) {
  k = clamp(k);
  const top = y - h + 10, fh = w * 0.6, n = 10, up = [], lo = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const wave = Math.sin(t * 10 - u * 5.5 + seed) * w * 0.085 * u * k + Math.sin(t * 2.2 + u * 2 + seed) * w * 0.03 * u * (1 - k);
    const px = x + dir * (pw / 2 + u * w * lerp(0.32, 1, k) + Math.sin(u * Math.PI * 2) * w * 0.05 * (1 - k)), py = top + u * w * 0.72 * (1 - k) + wave;
    up.push(`${px.toFixed(1)} ${py.toFixed(1)}`); lo.push(`${px.toFixed(1)} ${(py + fh).toFixed(1)}`);
  }
  return `<rect x="${x - pw / 2}" y="${y - h}" width="${pw}" height="${h}" rx="${pw / 2}" fill="#8a6a4a"/><circle cx="${x}" cy="${y - h}" r="${pw * 0.9}" fill="#f6b500"/>` +
    `<path d="M ${up.join(' L ')} L ${lo.reverse().join(' L ')} Z" fill="${col}" stroke="${mix(col, '#000000', 0.25)}" stroke-width="${Math.max(2, w * 0.03)}" stroke-linejoin="round"/>`;
}
// 矢印（k：0〜1 でのびる）
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${ex} ${ey} L ${bx + nx} ${by + ny} L ${bx - nx} ${by - ny} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
// 空気のつぶ（小さな顔つき）
const airDot = (x, y, r = 11, col = WD.air, o = 1, face = false) =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" opacity="${o}" stroke="${mix(col, '#1e3a5a', 0.35)}" stroke-width="${r * 0.18}"/>` +
  (face ? `<circle cx="${(x - r * 0.32).toFixed(1)}" cy="${(y - r * 0.1).toFixed(1)}" r="${r * 0.13}" fill="#1e3a5a" opacity="${o}"/><circle cx="${(x + r * 0.32).toFixed(1)}" cy="${(y - r * 0.1).toFixed(1)}" r="${r * 0.13}" fill="#1e3a5a" opacity="${o}"/>` : '');
// かどの丸い四角の道。u がふえると時計まわり（上の辺は左→右、右の辺は下へ、下の辺は右→左、左の辺は上へ）
function rrPos(cx, cy, hw, hh, r, u) {
  const sx = 2 * (hw - r), sy = 2 * (hh - r), q = Math.PI * r / 2, P = 2 * sx + 2 * sy + 4 * q;
  let d = (((u % 1) + 1) % 1) * P, a;
  if (d < sx) return [cx - hw + r + d, cy - hh]; d -= sx;
  if (d < q) { a = -Math.PI / 2 + d / r; return [cx + hw - r + Math.cos(a) * r, cy - hh + r + Math.sin(a) * r]; } d -= q;
  if (d < sy) return [cx + hw, cy - hh + r + d]; d -= sy;
  if (d < q) { a = d / r; return [cx + hw - r + Math.cos(a) * r, cy + hh - r + Math.sin(a) * r]; } d -= q;
  if (d < sx) return [cx + hw - r - d, cy + hh]; d -= sx;
  if (d < q) { a = Math.PI / 2 + d / r; return [cx - hw + r + Math.cos(a) * r, cy + hh - r + Math.sin(a) * r]; } d -= q;
  if (d < sy) return [cx - hw, cy + hh - r - d]; d -= sy;
  a = Math.PI + d / r; return [cx - hw + r + Math.cos(a) * r, cy - hh + r + Math.sin(a) * r];
}
// だんだん速くなって、そのあと同じ速さ（進んだ量）
const ramp = (tau, up = 2) => (tau <= 0 ? 0 : tau < up ? tau * tau / (2 * up) : tau - up / 2);
// おんどけい（lv：0 つめたい 〜 1 あたたかい）
function thermo(x, y, lv, s = 1) {
  lv = clamp(lv); const h = 150, col = mix('#3f8fd8', '#e8502c', clamp((lv - 0.38) / 0.4)), fill = 22 + (h - 40) * lv;
  let o = `<rect x="-17" y="${-h}" width="34" height="${h + 14}" rx="17" fill="#fff" stroke="${C.ink}" stroke-width="5"/><circle cx="0" cy="28" r="31" fill="#fff" stroke="${C.ink}" stroke-width="5"/>`;
  o += `<circle cx="0" cy="28" r="21" fill="${col}"/><rect x="-8" y="${-fill}" width="16" height="${fill + 14}" rx="8" fill="${col}"/>`;
  for (let i = 0; i < 4; i++) o += `<line x1="22" y1="${-30 - i * 30}" x2="34" y2="${-30 - i * 30}" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
  return g(o, { x, y, s });
}
// 白いふちの字（空や海の上に置く）
const olText = (x, y, str, { size = 44, fill = '#fff', ol = '#1e3a5a', sw = 10 } = {}) =>
  text(x, y, str, { size, w: 900, fill, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });

// 海辺（左が海、右が陸）。night：夜。warm：陸のあたたまりぐあい（-1 ひえた 〜 1 あたたまった）
const BEACH_Y = 765;
function beach(id, t, { night = false, warm = 0 } = {}) {
  let o = '';
  if (night) {
    o += `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141d36"/><stop offset="1" stop-color="#3a4a74"/></linearGradient><rect width="1920" height="1080" fill="url(#${id})"/>` + stars(23, 70);
    o += `<circle cx="250" cy="170" r="150" fill="#fff6c8" opacity="0.16" filter="url(#glow)"/><circle cx="250" cy="170" r="62" fill="#fff3c0"/><circle cx="228" cy="152" r="12" fill="#ead99a"/><circle cx="270" cy="190" r="9" fill="#ead99a"/>`;
  } else o += skyRect(id, 0);
  const sea = night ? WD.seaN : WD.sea, sand = night ? WD.sandN : WD.sand;
  let land = night ? WD.landN : WD.land;
  if (warm > 0) land = mix(land, '#e9c070', 0.38 * warm);
  if (warm < 0) land = mix(land, '#3e5f7a', 0.5 * -warm);
  o += `<rect x="0" y="${BEACH_Y + 12}" width="1000" height="320" fill="${sea}"/>`;
  for (let j = 0; j < 5; j++) {
    const x = 60 + j * 180 + Math.sin(t * 1.3 + j) * 14;
    o += `<path d="M ${x} ${BEACH_Y + 40 + (j % 2) * 26} q 34 -18 68 0 t 68 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="${night ? 0.35 : 0.7}"/>`;
  }
  o += `<path d="M 880 1080 L 880 ${BEACH_Y + 34} Q 950 ${BEACH_Y + 4} 1030 ${BEACH_Y} L 1920 ${BEACH_Y} L 1920 1080 Z" fill="${warm > 0 ? mix(sand, '#f3c489', 0.45 * warm) : warm < 0 ? mix(sand, '#5a6a7a', 0.4 * -warm) : sand}"/>`;
  o += `<path d="M 1180 1080 L 1180 ${BEACH_Y + 6} Q 1230 ${BEACH_Y - 6} 1290 ${BEACH_Y - 8} L 1920 ${BEACH_Y - 8} L 1920 1080 Z" fill="${land}"/>`;
  if (warm > 0) o += `<ellipse cx="1500" cy="${BEACH_Y}" rx="420" ry="46" fill="#ffb060" opacity="${0.5 * warm}" filter="url(#glow)"/>`;
  const wall = night ? '#b9b2a6' : '#f4ead8';
  o += house(1560, BEACH_Y - 6, 0.62, wall, night ? '#7a4a44' : '#c0624c') + tree(1690, BEACH_Y - 6, 0.6, night ? '#2f5f45' : '#3f8f4a');
  if (night) o += `<rect x="${1560 + 26 * 0.62}" y="${BEACH_Y - 6 - 64 * 0.62}" width="${22 * 0.62}" height="${20 * 0.62}" fill="#ffe27a"/>`;
  o += olText(300, BEACH_Y + 44, 'うみ', { size: 50 }) + olText(1440, BEACH_Y + 44, 'りく', { size: 50, ol: night ? '#22382c' : '#2f5f38' });
  return o;
}
// 海辺をぐるりと回る空気のつぶ。adv：進んだ量（+ で昼の向き＝下は海から陸へ）。heat：陸の上であたたまる色にする量
const LOOP = { cx: 900, cy: 470, hw: 480, hh: 250, r: 150 };
function loopDots(adv, { o = 1, heat = 0, n = 26 } = {}) {
  let out = '';
  for (let L = 0; L < 3; L++) for (let i = 0; i < n - L * 3; i++) {
    const m = n - L * 3, u = (i + rnd(i, 20 + L) * 0.35) / m - adv * (1 + L * 0.12);
    const [x, y] = rrPos(LOOP.cx, LOOP.cy, LOOP.hw - L * 44, LOOP.hh - L * 44, LOOP.r - L * 30, u);
    const h = heat * clamp((x - 1000) / 220) * clamp((y - 250) / 190);
    out += airDot(x, y, 10, mix(WD.air, WD.hot, h), o);
  }
  return out;
}

// 1. つかみ：公園の旗がパタパタ。でも風は見えない
const LEAVES = Array.from({ length: 7 }, (_, i) => [rnd(i, 31) * 2200, 300 + rnd(i, 32) * 420, 0.7 + rnd(i, 33) * 0.6]);
SCENES.push({
  id: 'hook',
  draw(t) {
    const c1 = cue(1), d1 = cueE(1) - c1;
    let out = skyRect('skh', 0) + sunDisc(1700, 170, 72, 0);
    out += cloud(((300 + t * 26) % 2300) - 180, 240, 1) + cloud(((1100 + t * 20) % 2300) - 180, 150, 0.7) + cloud(((1750 + t * 16) % 2300) - 180, 330, 0.55, '#fff', 0.85);
    out += `<path d="M 0 790 Q 420 690 860 770 T 1920 730 L 1920 1080 L 0 1080 Z" fill="#93cf8c"/>`;
    // 風にゆれる木（右へかたむく）
    const lean = 5 + Math.sin(t * 2.6) * 2.5;
    out += `<g transform="translate(1590 800) rotate(${lean})">${tree(0, 0, 1.5)}</g>` + `<g transform="translate(1790 830) rotate(${lean * 0.8})">${tree(0, 0, 1.0, '#4c9a55')}</g>`;
    out += `<path d="M 0 880 Q 620 800 1240 890 T 1920 860 L 1920 1080 L 0 1080 Z" fill="#5fae5f"/>`;
    // 旗（右へなびく）
    out += flag(1100, 820, t, { h: 400, w: 210, dir: 1, k: 0.82 + 0.18 * Math.sin(t * 1.7), pw: 14 });
    // 風に飛ばされる葉っぱ（左から右へ）
    LEAVES.forEach(([x0, y0, s], i) => {
      const x = ((x0 + t * 360 * s) % 2300) - 150, y = y0 + Math.sin(t * 2.4 + i * 1.7) * 46;
      out += `<g transform="translate(${x} ${y}) rotate(${t * 220 * s + i * 50}) scale(${s})"><path d="M -22 0 Q 0 -18 22 0 Q 0 18 -22 0 Z" fill="${['#6fb85a', '#d9a23a', '#8cc46a'][i % 3]}"/><path d="M -22 0 L 22 0" stroke="#4d7f3a" stroke-width="3"/></g>`;
    });
    // 見えない風（点線の矢印と ？）
    const gk = prog(t, c1 + d1 * 0.5, 0.5);
    if (gk > 0) {
      const sh = Math.sin(t * 5) * 10;
      out += g(`<path d="M -170 -34 L 60 -34 L 60 -74 L 170 0 L 60 74 L 60 34 L -170 34 Z" fill="rgba(255,255,255,0.18)" stroke="#fff" stroke-width="8" stroke-dasharray="20 16" stroke-linejoin="round"/>` + olText(-50, 2, '？', { size: 84 }), { x: 850 + sh, y: 440, o: gk });
      out += pop(badge('かぜは めに みえない', { fill: C.blueUi, size: 44 }), t, c1 + d1 * 0.5 + 0.4, 850, 290);
    }
    // 子どもたち（旗を見る）
    const eyes = t > c1 ? 'wide' : 'open';
    out += kidShow('S', t, 250, 880, { s: 0.5, start: 0, n: 0, eyes, look: [7, -5], bubble: false });
    out += kidShow('B', t, 440, 880, { s: 0.5, start: 0, n: 1, eyes, look: [7, -5] });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 250);
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${WD.blue}">風</tspan>は、</text>`, { x: 960, y: 430, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${WD.blue}">ふく</tspan>の？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      // 旗と、流れる風の線（左から右へ）
      let ic = flag(60, 110, t, { h: 220, w: 120, dir: 1, k: 1 });
      for (let i = 0; i < 4; i++) {
        const f = (t * 0.6 + i / 4) % 1, x = lerp(-420, -60, f), y = -80 + i * 44 + Math.sin(i * 2.3) * 10;
        ic += `<line x1="${x - 90}" y1="${y}" x2="${x}" y2="${y}" stroke="${WD.blue}" stroke-width="9" stroke-linecap="round" opacity="${0.5 * Math.sin(f * Math.PI)}"/>`;
      }
      out += pop(ic, t, t0 + 1.8, 1060, 860);
    }
    return out;
  },
});

// 2. 予想：晴れた日のお昼、海辺の旗はどっちになびく？
function miniBeach(w, h, t, { sky = '#86c2ef', sea = WD.sea, sand = WD.sand, id = 'mb' } = {}) {
  // (0,0) がまん中。左半分が海、右半分が陸。地面は下から 26%
  const gy = h / 2 - h * 0.26;
  return `<clipPath id="${id}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22"/></clipPath><g clip-path="url(#${id})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${sky}"/>` +
    `<rect x="${-w / 2}" y="${gy + 6}" width="${w / 2 + 10}" height="${h}" fill="${sea}"/>` +
    [0, 1, 2].map(j => `<path d="M ${-w / 2 + 24 + j * w * 0.15 + Math.sin(t * 1.3 + j) * 6} ${gy + 26 + (j % 2) * 12} q 14 -9 28 0 t 28 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`).join('') +
    `<path d="M ${-w * 0.06} ${h} L ${-w * 0.06} ${gy + 16} Q ${0} ${gy} ${w * 0.06} ${gy} L ${w / 2} ${gy} L ${w / 2} ${h} Z" fill="${sand}"/></g>`;
}
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1);
    out += pop(text(0, 0, 'よそうして みよう', { size: 64, w: 900 }), t, 0.3, 960, 130, { end: c1 - 0.1 });
    out += pop(text(0, 0, 'はたは、どっちに なびく？', { size: 64, w: 900 }), t, c1, 960, 130);
    // 海辺の絵（左が海、右が陸。旗はまだ見せない）
    let b = miniBeach(900, 200, t, { id: 'gmb' }) + sunDisc(350, -50, 30, 0, { glow: 0.5 });
    b += olText(-300, 76, 'うみ', { size: 38 }) + olText(300, 76, 'りく', { size: 38, ol: '#7a6238' });
    b += `<rect x="-5" y="-78" width="10" height="130" rx="5" fill="#8a6a4a"/><circle cx="0" cy="-78" r="9" fill="#f6b500"/>`;
    b += g(`<circle r="34" fill="${C.ochre}"/>` + text(0, 3, '？', { size: 46, w: 900, fill: '#fff' }), { x: 62, y: -58, s: 1 + Math.sin(t * 4) * 0.05 });
    b += pop(badge('はれて おだやかな ひの おひる', { fill: C.blueUi, size: 30 }), t, c0 + d0 * 0.45, -220, -104);
    // はじめは大きく見せて、選択肢が出る前に上へ小さくよける
    const mk = eio(prog(t, cue(2) - 1.1, 0.8));
    out += pop(b, t, c0 + d0 * 0.3, lerp(880, 860, mk), lerp(520, 302, mk), { s: lerp(1.7, 1, mk) });
    const opts = [['①', 'うみの ほうへ、なびく', -1, 1], ['②', 'かぜが なくて、たれさがる', 1, 0], ['③', 'りくの ほうへ、なびく', 1, 1]];
    const cur = curLine();
    opts.forEach(([n, s, dir, k], i) => {
      const on = cur === i + 2;
      out += pop((on ? `<rect x="-560" y="-68" width="1120" height="136" rx="30" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1100, 116) +
        `<circle cx="-470" cy="0" r="42" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-470, 3, n, { size: 48, w: 900, fill: '#fff' }) +
        text(-400, 2, s, { size: 52, w: 700, anchor: 'start' }) + flag(430, 46, t, { h: 92, w: 58, dir, k, pw: 7, seed: i }), t, cue(i + 2) - 0.2, 900, 500 + i * 132);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const cd = cueE(4) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = cd + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1730, y: 300, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 風の正体は、動いている空気。空気には重さがある
const AIRF = Array.from({ length: 64 }, (_, i) => [rnd(i, 41) * 2100, 150 + rnd(i, 42) * 560, 0.75 + rnd(i, 43) * 0.5]);
SCENES.push({
  id: 'air',
  draw(t) {
    const c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2;
    let out = skyRect('ska', 0);
    out += `<path d="M 0 800 Q 480 770 960 795 T 1920 790 L 1920 1080 L 0 1080 Z" fill="#8fca7e"/>`;
    // A：旗と、流れる空気のつぶ（左から右へ）
    const aO = 1 - prog(t, c1 - 0.5, 0.5);
    if (aO > 0) {
      let a = flag(1320, 800, t, { h: 380, w: 200, dir: 1, k: 0.85 + 0.15 * Math.sin(t * 1.7), pw: 14 });
      const show = prog(t, cue(0) + 0.3, 0.8);
      AIRF.forEach(([x0, y0, s], i) => {
        const x = ((x0 + t * 300 * s) % 2100) - 90, y = y0 + Math.sin(t * 1.8 + i) * 8;
        a += `<line x1="${x - 60 * s}" y1="${y}" x2="${x - 14}" y2="${y}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="${0.4 * show}"/>` + airDot(x, y, 11, WD.air, 0.95 * show);
      });
      a += pop(badge('かぜ ＝ うごいて いる くうき', { fill: C.blueUi, size: 50, pad: 40 }), t, cue(0) + 1.2, 800, 200);
      a += arrow(360, 330, 760, 330, '#ffffff', 16, eo(prog(t, cue(0) + 1.8, 0.7)), 0.9);
      out += g(a, { o: aO });
    }
    // B：空気の柱（上の空気の重さが、下を押す）
    const bO = prog(t, c1 - 0.3, 0.5);
    if (bO > 0) {
      let b = '';
      const press = prog(t, c2 + d2 * 0.45, 0.4), sq = press * (0.5 + 0.5 * Math.sin(t * 6)) * 10;
      for (let r = 0; r < 9; r++) for (let c = 0; c < 20; c++) {
        const inCol = c >= 8 && c <= 11, x = 100 + c * 90 + (r % 2) * 45 + Math.sin(t * 1.4 + r * 3 + c) * 5, y = 110 + r * 76 + Math.cos(t * 1.2 + r + c * 2) * 5 + (inCol ? sq * r / 8 : 0);
        b += airDot(x, y, 12, inCol ? '#ffffff' : '#d5e9f7', inCol ? 1 : 0.55);
      }
      const ck = prog(t, c1 + 0.4, 0.6);
      b += `<rect x="780" y="60" width="400" height="${735 * eo(ck)}" rx="24" fill="rgba(255,255,255,0.14)" stroke="#fff" stroke-width="8" stroke-dasharray="22 16" opacity="${ck}"/>`;
      b += pop(badge('くうきにも おもさが ある', { fill: C.blueUi, size: 48, pad: 40 }), t, c1 + 1.0, 420, 250);
      // 下向きの大きな矢印
      const ak = eo(prog(t, c2 + 0.2, 0.9)), bob = press * Math.sin(t * 6) * 8;
      b += arrow(980, 150 + bob, 980, 700 + bob, C.ochre, 34, ak, 0.95);
      b += pop(badge('うえの くうきの おもさ', { fill: C.ochre, size: 44 }), t, c2 + 0.6, 1500, 330);
      // 地面を押すしるし
      if (press > 0) {
        [-150, -75, 0, 75, 150].forEach((dx, i) => { b += arrow(980 + dx, 742, 980 + dx, 790 + Math.abs(Math.sin(t * 6)) * 6, C.redUi, 10, 1, press); });
        b += pop(badge('したを ぎゅっと おす', { fill: C.redUi, size: 44 }), t, c2 + d2 * 0.45 + 0.2, 1500, 640);
      }
      out += g(b, { o: bO });
      out += kidShow('S', t, 520, 800, { s: 0.42, start: c1 + 0.6, n: 0, bubble: false, look: [6, -8], eyes: press > 0 ? 'wide' : 'open' });
    }
    return out;
  },
});

// 4. 空気の「おしくらまんじゅう」。強いほうから弱いほうへ
const PB = { x0: 160, x1: 1440, y0: 430, y1: 730, gate: 800 };
const PUSH = (() => {
  const a = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) a.push([PB.x0 + 38 + c * 62 + (r % 2) * 14 + rnd(r * 10 + c, 51) * 12, PB.y0 + 34 + r * 46 + rnd(r * 10 + c, 52) * 10]);
  for (let i = 0; i < 12; i++) a.push([PB.gate + 80 + (i % 4) * 150 + rnd(i, 53) * 50, PB.y0 + 50 + Math.floor(i / 4) * 100 + rnd(i, 54) * 30]);
  // 門があいたあとの場所：x の順をたもったまま、箱ぜんたいに広がる
  const ord = a.map((p, i) => i).sort((i, j) => a[i][0] - a[j][0]), cols = 18, rows = 4;
  const tgt = a.map(() => [0, 0]);
  for (let cI = 0; cI < cols; cI++) {
    const grp = ord.slice(cI * rows, cI * rows + rows).sort((i, j) => a[i][1] - a[j][1]);
    grp.forEach((id, k) => { tgt[id] = [PB.x0 + 40 + cI * ((PB.x1 - PB.x0 - 80) / (cols - 1)) + (k % 2) * 16, PB.y0 + 42 + k * 72]; });
  }
  return a.map((p, i) => ({ h: p, g: tgt[i] }));
})();
const UNI = Array.from({ length: 72 }, (_, i) => [PB.x0 + 40 + (i % 18) * ((PB.x1 - PB.x0 - 80) / 17) + (Math.floor(i / 18) % 2) * 16, PB.y0 + 42 + Math.floor(i / 18) * 72]);
SCENES.push({
  id: 'push',
  draw(t) {
    const c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3);
    let out = PAPER + topBadge();
    const box = `<rect x="${PB.x0 - 14}" y="${PB.y0 - 14}" width="${PB.x1 - PB.x0 + 28}" height="${PB.y1 - PB.y0 + 28}" rx="30" fill="#e3f0f8" stroke="#8fb3c6" stroke-width="10"/>`;
    out += box;
    // A：どこも同じくらい。となりどうしで押し合う
    const aO = 1 - prog(t, c2 - 0.5, 0.4);
    if (aO > 0) {
      let a = '';
      UNI.forEach(([x, y], i) => {
        const jx = Math.sin(t * 7 + i * 1.9) * 9, jy = Math.cos(t * 6.2 + i * 2.7) * 7;
        a += airDot(x + jx, y + jy, 24, '#9fd0f0', 1, true);
      });
      // 押し合うしるし（となりどうしの間の小さな線）
      const pk = prog(t, cue(0) + 1.6, 0.5);
      for (let i = 0; i < 14; i++) {
        const j = (i * 5 + 3) % 54, [x, y] = UNI[j], on = Math.sin(t * 7 + i * 2.1) > 0.3 ? 1 : 0;
        if (j % 18 < 17) a += `<path d="M ${x + 28} ${y - 12} l 12 -10 M ${x + 30} ${y} l 16 0 M ${x + 28} ${y + 12} l 12 10" stroke="${C.redUi}" stroke-width="5" stroke-linecap="round" opacity="${pk * on}"/>`;
      }
      a += pop(badge('となりどうしで いつも おしあって いる', { fill: C.blueUi, size: 42 }), t, cue(0) + 1.2, 800, 330, { end: c1 - 0.1 });
      out += g(a, { o: aO });
      out += pop(badge('くうきの おしくらまんじゅう', { fill: C.accent, size: 50, pad: 40 }), t, cue(0) + 4.2, 1040, 200, { end: c1 - 0.2 });
    }
    // 風船：押すと、中の空気が押し返す
    const fO = win(t, c1 - 0.1, c2 - 0.4, 0.35);
    if (fO > 0) {
      const p = 0.5 + 0.5 * Math.sin((t - c1) * 3.2 - 1.2), dent = 46 * p;
      let f = card(900, 560);
      // ふうせん（右から指で押すと、右がへこむ）
      f += `<path d="M -40 -200 C 110 -200 ${190 - dent} -120 ${190 - dent} -10 C ${190 - dent} 100 110 190 -40 190 C -190 190 -260 90 -260 -10 C -260 -110 -190 -200 -40 -200 Z" fill="#f08a6a" stroke="#c9583c" stroke-width="8"/>`;
      f += `<path d="M -40 190 l -16 26 l 32 0 Z" fill="#c9583c"/><path d="M -40 216 q 20 30 -6 56" fill="none" stroke="${C.muted}" stroke-width="5" stroke-linecap="round"/>`;
      f += `<path d="M -190 -110 Q -150 -165 -90 -172" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.7"/>`;
      // 中の空気のつぶと、押し返す矢印
      [[-150, -40], [-80, -110], [-60, 30], [-140, 70], [10, -60], [40, 90], [-10, 130], [70, -130]].forEach(([x, y], i) => { f += airDot(x + Math.sin(t * 6 + i) * 6, y + Math.cos(t * 5 + i * 2) * 6, 20, '#ffe1d3', 1, true); });
      f += arrow(60, -10, 60 + 90 * p + 20, -10, '#fff', 16, 1, 0.5 + 0.5 * p);
      // 指（右から左へ押す）
      f += `<g transform="translate(${212 - dent} -10)"><rect x="0" y="-30" width="210" height="60" rx="30" fill="${CH.skin}" stroke="${CH.line}" stroke-width="6"/><path d="M 8 -16 Q 40 -24 50 -16 L 50 -4 Q 30 -2 6 -6 Z" fill="#fbe9df" stroke="${CH.skinShade}" stroke-width="3"/><path d="M 120 -30 L 120 30" stroke="${CH.skinShade}" stroke-width="4" opacity="0.6"/></g>`;
      f += text(0, -238, 'ふうせんを おすと…', { size: 44, w: 900 });
      f += g(badge('なかの くうきが おしかえす', { fill: C.redUi, size: 38 }), { x: 160, y: 232, o: prog(t, c1 + 2.4, 0.4) });
      out += g(f, { x: 800, y: 520, o: fO, s: lerp(0.94, 1, eo(prog(t, c1 - 0.1, 0.5))) });
    }
    // B：ぎゅうぎゅう と すいている。門があくと、強いほうから弱いほうへ流れる
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      const tOpen = c2 + d2 * 0.42, open = eo(prog(t, tOpen, 0.6));
      let b = '';
      PUSH.forEach(({ h, g: gg }, i) => {
        const delay = Math.max(0, (PB.gate - h[0]) / 640) * 2.2, k = eio(prog(t, tOpen + 0.2 + delay, 4.2));
        const amp = lerp(h[0] < PB.gate ? 5 : 3, 4, k);
        const x = lerp(h[0], gg[0], k) + Math.sin(t * 9 + i * 1.9) * amp, y = lerp(h[1], gg[1], k) + Math.cos(t * 8 + i * 2.7) * amp;
        b += airDot(x, y, 21, mix(h[0] < PB.gate ? '#6fb4e8' : '#bfe0f5', '#9fd0f0', k), 1, true);
      });
      // 門（まん中のしきり。上へあく）
      b += `<rect x="${PB.gate - 8}" y="${PB.y0 - 14}" width="16" height="${(PB.y1 - PB.y0 + 28) * (1 - open)}" rx="6" fill="#6f8fa3"/>`;
      const lab = 1 - prog(t, c3 - 0.7, 0.5);
      b += g(pop(badge('ぎゅうぎゅう', { fill: C.redUi, size: 46 }), t, c2 + 0.1, 470, 330) + pop(text(0, 0, 'おす ちから：つよい', { size: 36, w: 900, fill: C.redUi }), t, c2 + 0.5, 470, 250), { o: lab });
      b += g(pop(badge('すいて いる', { fill: C.blueUi, size: 46 }), t, c2 + 0.9, 1120, 330) + pop(text(0, 0, 'おす ちから：よわい', { size: 36, w: 900, fill: C.blueUi }), t, c2 + 1.3, 1120, 250), { o: lab });
      // 流れる向き（左から右へ）
      b += arrow(520, 792, 1080, 792, WD.blue, 26, eo(prog(t, tOpen + 0.5, 0.9)), 1);
      b += pop(badge('これが かぜ', { fill: WD.blue, size: 56, pad: 44 }), t, c3, 800, 270);
      out += g(b, { o: bO });
      // 箱の右の外に立てた旗（流れが出てくると、右へなびく）
      out += g(flag(1500, 730, t, { h: 250, w: 120, dir: 1, k: 0.12 + 0.88 * eio(prog(t, tOpen + 1.2, 1.6)) }), { o: bO });
    }
    out += kidShow('S', t, 1740, 840, { s: 0.5, start: cue(4) - 0.9, n: 0, bubble: false });
    out += talkBubble('S', 1600, 390, 1735, 604, 42);
    return out;
  },
});

// 5. あたたまった空気はのぼる → まわりから流れこむ
const CELL = { cx: 1290, cy: 470, hw: 270, hh: 235, r: 110 };
SCENES.push({
  id: 'warm',
  draw(t) {
    const c1 = cue(1), c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3;
    let out = skyRect('skw', 0) + sunDisc(960, 96, 60, 0);
    const wk = prog(t, c1 + 0.3, 1.2);
    // 地面：まん中があたたかい、両がわがつめたい
    out += `<path d="M 0 790 L 1920 790 L 1920 1080 L 0 1080 Z" fill="${mix('#8fca7e', '#7fb6b0', wk * 0.6)}"/>`;
    out += `<path d="M 700 790 L 1220 790 L 1280 1080 L 640 1080 Z" fill="${mix('#8fca7e', '#f2a65a', wk)}"/>`;
    if (wk > 0) {
      out += `<ellipse cx="960" cy="790" rx="300" ry="40" fill="#ffb060" opacity="${0.55 * wk}" filter="url(#glow)"/>`;
      // お日さまの光
      [-110, 0, 110].forEach((dx, i) => { out += `<line x1="${960 + dx * 0.3}" y1="170" x2="${960 + dx}" y2="770" stroke="#fff3b8" stroke-width="10" stroke-linecap="round" stroke-dasharray="26 22" stroke-dashoffset="${-t * 80}" opacity="${0.45 * wk * (1 - prog(t, c2 + 1.5, 1.0) * 0.7)}"/>`; });
    }
    out += pop(olText(0, 0, 'あたたかい', { size: 46, ol: '#b5551f' }), t, c1 + 0.9, 960, 824);
    out += pop(olText(0, 0, 'つめたい', { size: 42, ol: '#2f5f8a' }), t, c1 + 1.5, 330, 824) + pop(olText(0, 0, 'つめたい', { size: 42, ol: '#2f5f8a' }), t, c1 + 1.7, 1590, 824);
    // 空気のつぶ（まん中でのぼり、上で外へ、両がわで下り、下でまん中へ）
    const dO = prog(t, c1 + 0.2, 0.6), adv = ramp(t - c2 - 0.3, 2.2) * 0.05;
    if (dO > 0) for (let side = -1; side <= 1; side += 2) for (let L = 0; L < 3; L++) {
      const m = 20 - L * 3;
      for (let i = 0; i < m; i++) {
        const u = (i + rnd(i, 60 + L) * 0.3) / m + adv * (1 + L * 0.15);
        let [x, y] = rrPos(CELL.cx, CELL.cy, CELL.hw - L * 46, CELL.hh - L * 46, CELL.r - L * 28, u);
        // まん中（のぼるところ）と下のまん中寄りは、あたたまった色
        const h = clamp((1180 - x) / 140) * clamp((y - 250) / 170) * prog(t, c1 + 1.2, 1.6);
        if (side < 0) x = 1920 - x;
        out += airDot(x, y, 11, mix(WD.air, WD.hot, h), dO);
      }
    }
    // つかみのおさらい：？のカード
    const qO = win(t, cue(0) - 0.2, c1 - 0.2, 0.4);
    if (qO > 0) {
      let q = card(1000, 330);
      for (let i = 0; i < 18; i++) q += airDot(-390 + (i % 6) * 44 + Math.sin(t * 8 + i) * 4, -70 + Math.floor(i / 6) * 44 + Math.cos(t * 7 + i * 2) * 4, 17, '#6fb4e8', 1, true);
      for (let i = 0; i < 4; i++) q += airDot(190 + (i % 2) * 130 + Math.sin(t * 5 + i) * 4, -60 + Math.floor(i / 2) * 70 + Math.cos(t * 4 + i * 2) * 4, 17, '#bfe0f5', 1, true);
      q += text(-280, 100, 'つよい', { size: 40, w: 900, fill: C.redUi }) + text(256, 100, 'よわい', { size: 40, w: 900, fill: C.blueUi });
      q += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 0, y: -24, s: 1 + Math.sin(t * 4) * 0.05 });
      q += text(0, -205, 'おす ちからの ちがいは、どうして できる？', { size: 42, w: 900 });
      out += g(q, { x: 960, y: 470, o: qO });
    }
    out += pop(badge('ばしょに よる あたたかさの ちがい', { fill: C.ochre, size: 46, pad: 38 }), t, c1 + 0.4, 960, 250, { end: c2 - 0.1 });
    // のぼる矢印と、流れこむ矢印
    out += arrow(960, 580, 960, 300, WD.hotDk, 30, eo(prog(t, c2 + 0.6, 1.0)), 0.92);
    out += pop(badge('かるく なって のぼる', { fill: WD.hotDk, size: 44 }), t, c2 + 1.6, 960, 232, { end: c3 + d3 * 0.3 });
    const ik = eo(prog(t, c3 + d3 * 0.42, 0.9));
    out += arrow(360, 742, 800, 742, WD.blue, 26, ik, 0.95) + arrow(1560, 742, 1120, 742, WD.blue, 26, ik, 0.95);
    out += pop(badge('したの おす ちからが よわく なる', { fill: C.redUi, size: 38 }), t, c3 + 0.4, 960, 650, { end: c3 + d3 * 0.42 + 2.6 });
    out += pop(badge('まわりから ながれこむ ＝ かぜ', { fill: WD.blue, size: 48, pad: 40 }), t, c3 + d3 * 0.42 + 0.8, 960, 232);
    // 両がわの旗（まん中へ向かってなびく）
    const fk = 0.1 + 0.9 * eio(prog(t, c3 + d3 * 0.42 + 0.3, 1.4));
    out += flag(250, 790, t, { h: 230, w: 110, dir: 1, k: fk }) + flag(1670, 790, t, { h: 230, w: 110, dir: -1, k: fk, seed: 2 });
    return out;
  },
});

// 6. 海辺のお昼：うみかぜ（上では反対向き、ぐるりと回る）
SCENES.push({
  id: 'sea',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), c5 = cue(5);
    const tH = c0 + d0 * 0.42;  // 「陸は海より…」のあたり
    const warm = eio(prog(t, tH + 0.4, 3.5));
    let out = beach('sks', t, { warm }) + sunDisc(1600, 130, 64, 0);
    out += pop(badge('はれた ひの おひる', { fill: C.blueUi, size: 42 }), t, 0.4, 330, 110);
    // おんどけい：陸は早くあたたまる、海はゆっくり
    const thO = win(t, tH, c2 - 0.2, 0.4);
    if (thO > 0) {
      out += g(thermo(300, 600, 0.32 + 0.1 * warm, 1.1) + thermo(1450, 560, 0.32 + 0.58 * warm, 1.1), { o: thO });
      out += g(pop(badge('りくは あたたまりやすくて ひえやすい', { fill: WD.hotDk, size: 40 }), t, tH + 0.5, 1330, 300, { end: c1 - 0.1 }), { o: thO });
      out += g(pop(badge('うみは あたたまりにくい', { fill: WD.blue, size: 38 }), t, tH + 1.5, 420, 400, { end: c1 - 0.1 }), { o: thO });
    }
    // ぐるりと回る道（うすい帯）
    const mv = t - (c2 + 0.3), adv = ramp(mv, 2.4) * 0.034;
    const dO = prog(t, c1 + 0.3, 0.8);
    const trk = prog(t, c2 + 0.2, 0.8);
    if (trk > 0) out += `<rect x="${LOOP.cx - LOOP.hw + 44}" y="${LOOP.cy - LOOP.hh + 44}" width="${(LOOP.hw - 44) * 2}" height="${(LOOP.hh - 44) * 2}" rx="${LOOP.r - 30}" fill="none" stroke="#fff" stroke-width="130" opacity="${0.13 * trk}"/>`;
    // 下の大きな矢印（海から陸へ）
    const sk = eo(prog(t, c2 + d2 * 0.5, 1.0));
    out += arrow(500, 720, 1240, 720, WD.blue, 30, sk, 0.9);
    // のぼる矢印（陸の上）
    out += arrow(1380, 660, 1380, 330, WD.hotDk, 24, eo(prog(t, c2 + 0.3, 0.9)), 0.9);
    // 上の矢印（陸から海へ）
    const uk = eo(prog(t, c5 + 0.2, 1.0));
    out += arrow(1240, 220, 520, 220, '#eef6ff', 22, uk, 0.9);
    out += arrow(420, 330, 420, 620, '#eef6ff', 18, eo(prog(t, c5 + 1.0, 0.8)), 0.8);
    if (dO > 0) out += loopDots(adv, { o: dO, heat: prog(t, c1 + 0.8, 2.0) });
    out += pop(badge('りくの うえの くうきが あたたかい', { fill: WD.hotDk, size: 40 }), t, c1 + 1.0, 1500, 358, { end: c2 - 0.1 });
    out += pop(badge('りくで のぼる', { fill: WD.hotDk, size: 38 }), t, c2 + 0.9, 1640, 400, { end: cue(4) - 1.0 });
    out += pop(badge('うみから ながれこむ', { fill: WD.blue, size: 40 }), t, c2 + d2 * 0.5 + 0.5, 700, 600, { end: c3 - 0.1 });
    // 旗（海風で、陸のほうへなびく）
    out += flag(1010, BEACH_Y, t, { h: 250, w: 120, dir: 1, k: 0.1 + 0.9 * eio(prog(t, c2 + d2 * 0.5 + 0.4, 1.6)) });
    out += pop(badge('うみかぜ', { fill: WD.blue, size: 64, pad: 48 }), t, c3 + 1.2, 700, 590);
    out += pop(badge('うえでは はんたいむき', { fill: '#5d7fa8', size: 40 }), t, c5 + 0.6, 880, 130);
    // ぐるりと回るしるし
    const rk = prog(t, c5 + 2.0, 0.5);
    if (rk > 0) out += g(`<path d="M 70 0 A 70 70 0 1 0 0 70" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M 0 70 L 26 46 L 30 86 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>` + olText(0, 4, 'ぐるり', { size: 34 }), { x: 880, y: 400, o: rk, s: Math.max(back(rk), 0.001) });
    out += kidShow('B', t, 1810, BEACH_Y - 6, { s: 0.42, start: cue(4) - 0.9, n: 0, side: 'left', look: [-7, -2] });
    return out;
  },
});

// 7. 夜：りくかぜ
SCENES.push({
  id: 'night', night: true,
  draw(t) {
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1;
    const cold = eio(prog(t, c0 + 0.6, 2.6));
    let out = beach('skn', t, { night: true, warm: -cold });
    out += pop(badge('よる', { fill: 'rgba(255,250,240,0.9)', color: C.ink, size: 46, pad: 40 }), t, 0.4, 500, 110);
    const thO = win(t, c0 + 0.3, c1 + 0.2, 0.4);
    if (thO > 0) {
      out += g(thermo(300, 600, 0.5, 1.1) + thermo(1450, 560, 0.62 - 0.44 * cold, 1.1), { o: thO });
      out += g(pop(badge('りくの ほうが ひえる', { fill: '#3f6f9a', size: 42 }), t, c0 + 1.2, 1400, 300), { o: thO });
    }
    const adv = ramp(t - c1 - 0.2, 2.0) * 0.034;
    const trk = prog(t, c1, 0.8);
    if (trk > 0) out += `<rect x="${LOOP.cx - LOOP.hw + 44}" y="${LOOP.cy - LOOP.hh + 44}" width="${(LOOP.hw - 44) * 2}" height="${(LOOP.hh - 44) * 2}" rx="${LOOP.r - 30}" fill="none" stroke="#fff" stroke-width="130" opacity="${0.09 * trk}"/>`;
    // 下の大きな矢印（陸から海へ）
    out += arrow(1240, 720, 500, 720, '#9cc8ee', 30, eo(prog(t, c1 + 0.6, 1.0)), 0.95);
    out += loopDots(-adv, { o: prog(t, c1 - 0.4, 0.8) * 0.85 });
    // 旗（陸風で、海のほうへなびく）
    out += flag(1010, BEACH_Y, t, { h: 250, w: 120, dir: -1, k: 0.1 + 0.9 * eio(prog(t, c1 + 0.9, 1.5)) });
    out += pop(badge('りくから うみへ', { fill: '#3f6f9a', size: 40 }), t, c1 + 1.2, 1300, 600, { end: c1 + d1 * 0.55 });
    out += pop(badge('りくかぜ', { fill: '#3f6f9a', size: 64, pad: 48 }), t, c1 + d1 * 0.55 + 0.2, 1290, 590);
    return out;
  },
});

// 8. 入れかわる朝と夕方は「なぎ」
const NAGI = [
  ['あさ', '#ffd9c2', WD.sea, 0, 0, 'なぎ', 'あさなぎ'],
  ['ひる', '#86c2ef', WD.sea, 1, 1, 'うみかぜ', null],
  ['ゆうがた', '#f6a86a', '#4f7fae', 0, 0, 'なぎ', 'ゆうなぎ'],
  ['よる', '#27345a', WD.seaN, -1, 1, 'りくかぜ', null],
];
SCENES.push({
  id: 'nagi',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'うみべの かぜの いちにち', { size: 60, w: 900 }), t, 0.3, 960, 170);
    const tW = c0 + d0 * 0.6;  // 「朝と夕方には、風が弱くなります」
    NAGI.forEach(([name, sky, sea, dir, k, lab, lab2], i) => {
      const x = 270 + i * 460, calm = k === 0, st = 0.5 + i * 0.35;
      const hi = calm ? prog(t, tW + (i === 2 ? 0.5 : 0), 0.4) : 0;
      let p = (hi > 0 ? `<rect x="-216" y="-166" width="432" height="332" rx="34" fill="none" stroke="${C.ochre}" stroke-width="10" opacity="${hi}"/>` : '') + card(410, 310);
      p += miniBeach(380, 280, t, { sky, sea, sand: i === 3 ? WD.sandN : WD.sand, id: 'ng' + i });
      if (i === 0) p += `<circle cx="-140" cy="18" r="26" fill="#ffb37a"/>`;
      if (i === 1) p += sunDisc(120, -90, 24, 0, { glow: 0.5 });
      if (i === 2) p += `<circle cx="-140" cy="24" r="28" fill="#ff8a4a"/>`;
      if (i === 3) p += `<circle cx="-120" cy="-86" r="20" fill="#fff3c0"/>` + [[40, -100], [110, -60], [-30, -70], [150, -110]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="3" fill="#fff" opacity="0.8"/>`).join('');
      // 旗：なぎのときは、たれさがる
      p += flag(0, 68, t, { h: 150, w: 78, dir: dir || 1, k: calm ? 0.04 : 1, pw: 8, seed: i });
      if (dir) p += arrow(-dir * 130, 30, dir * 130 - dir * 70, 30, i === 3 ? '#9cc8ee' : WD.blue, 14, eo(prog(t, st + 0.8, 0.6)), 0.95);
      out += pop(p, t, st, x, 450);
      out += pop(badge(name, { fill: [C.ochre, C.blueUi, '#c8602c', '#3b4a78'][i], size: 40 }), t, st + 0.2, x, 262);
      // 下の名前
      if (calm) {
        const sw = lab2 ? prog(t, c2 + d2 * (i === 0 ? 0.08 : 0.5), 0.3) : 0;
        out += g(pop(badge(lab, { fill: C.accent, size: 50, pad: 40 }), t, c1 + 0.2 + (i === 2 ? 0.3 : 0), x, 680), { o: 1 - sw });
        if (sw > 0) out += g(badge(lab2, { fill: C.accent, size: 50, pad: 40 }), { x, y: 680, o: sw, s: lerp(1.2, 1, eo(sw)) });
        out += pop(text(0, 0, 'かぜが よわく なる', { size: 34, w: 900, fill: C.redUi }), t, tW + 0.3 + (i === 2 ? 0.5 : 0), x, 762);
      } else out += pop(text(0, 0, lab, { size: 44, w: 900, fill: i === 3 ? '#3b4a78' : WD.blue }), t, st + 0.9, x, 680);
      // つぎへの矢印
      if (i < 3) out += pop(`<path d="M -14 -22 L 14 0 L -14 22" fill="none" stroke="${C.muted}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, t, st + 0.5, x + 230, 450);
    });
    return out;
  },
});

// 9. 正解 と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-432, 2, 'りくの ほうへ、なびく', { size: 62, w: 900, anchor: 'start' }) + flag(450, 62, t, { h: 124, w: 76, dir: 1, k: 1, pw: 8 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['ひるは りくが あたたまる', WD.hotDk], ['りくで くうきが のぼる', C.accent], ['うみから かぜが ふく', WD.blue]], t, 960, 660, { start: 2.4, step: 1.1, size: 36, gap: 28 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const flagIc = `<g transform="translate(-30 44)">${flag(0, 0, t, { h: 92, w: 58, dir: 1, k: 1, pw: 7 })}</g>`;
      const thinkIc = `<circle r="44" fill="${C.ochreSoft}" stroke="${C.ochre}" stroke-width="6"/>` + text(0, 4, '？', { size: 56, w: 900, fill: C.ochre });
      const items = [
        [flagIc, 'はれて おだやかな ひに、うみの ちかくで', 'ひると ゆうがたの はたの むきを くらべる', C.ink, 340],
        [thinkIc, '「ひるは うみから ふいて くるはず」と', 'よそうしてから みる', C.ink, 500],
        [warnIcon(0.9), 'うみべは、おとなと いっしょに あるく', 'かぜの つよい ひは、ちかづかない', C.red, 660],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + text(110, -28, s1, { size: 40, w: 900, anchor: 'start', fill: col }) + text(110, 30, s2, { size: 40, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 190, y);
      });
      // 昼と夕方の海辺（夕方は「どっちかな？」）
      const c1 = cue(1);
      let p = card(500, 330);
      p += g(miniBeach(210, 170, t, { id: 'lk0' }) + sunDisc(60, -50, 14, 0, { glow: 0.4 }) + flag(0, 42, t, { h: 96, w: 52, dir: 1, k: 1, pw: 6 }), { x: -122, y: -30 });
      p += g(miniBeach(210, 170, t, { id: 'lk1', sky: '#f6a86a', sea: '#4f7fae' }) + `<circle cx="-70" cy="16" r="16" fill="#ff8a4a"/>` + `<rect x="-3" y="-54" width="6" height="96" rx="3" fill="#8a6a4a"/><circle cx="0" cy="-54" r="5.4" fill="#f6b500"/>` +
        g(`<circle r="26" fill="${C.ochre}"/>` + text(0, 3, '？', { size: 36, w: 900, fill: '#fff' }), { x: 40, y: -36, s: 1 + Math.sin(t * 4) * 0.06 }), { x: 122, y: -30 });
      p += text(-122, 92, 'ひる', { size: 34, w: 900 }) + text(122, 92, 'ゆうがた', { size: 34, w: 900 }) + text(122, 132, 'どっちかな？', { size: 28, w: 900, fill: C.ochre }) + text(-122, 132, 'うみから くる？', { size: 28, w: 900, fill: WD.blue });
      b += pop(p, t, c1 + 0.6, 1600, 330);
      b += kidShow('K', t, 1690, 810, { s: 0.8, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ふく かぜ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
