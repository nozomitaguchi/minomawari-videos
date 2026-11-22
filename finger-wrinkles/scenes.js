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
const TOPIC = 'ゆびの しわしわ';
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

// みのまわり図鑑 動画「おふろに はいると、どうして ゆびが しわしわに なるの？」（ゆびの しわしわ）
// 出どころ：everyday-trivia trivia/finger-wrinkles.md（絵の見本：assets/figures-finger-wrinkles.js、メモ：ideas/notes/finger-wrinkles.md）
// 水は青、神経は黄色、血管は赤（サイトの図と同じ）

// ---------- ゆびの道具 ----------
const FW = {
  skin: '#f6d6bd', skinDk: '#e2b497', skinLt: '#fbe7d6', flesh: '#f8c9b6', fleshDk: '#efb49e', wr: '#b47c5c',
  water: '#5aa9e6', waterDk: '#2f78b8', waterLt: '#bfe0f7', nerve: '#f2bd2c', nerveDk: '#b98a12', vessel: '#d9584a', vesselDk: '#a93b30',
  tile: '#e3f2f6', tileLn: '#cbe4ea', tub: '#ffffff', tubDk: '#cfd9de',
};
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
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
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// しわの線（たての なみなみ）。seed が同じなら、同じ形
function wrLines(wr, seed = 1, col = FW.wr, sw = 6) {
  if (wr <= 0) return '';
  let o = '';
  [-52, -27, 0, 27, 52].forEach((x, i) => {
    const y0 = -112 + Math.abs(x) * 0.8 + rnd(i, seed) * 16, n = 5 + (i + seed) % 2, seg = (98 - y0) / n, a = (9 + rnd(i, seed + 1) * 7) * wr * ((i + seed) % 2 ? 1 : -1);
    let d = `M ${x} ${y0.toFixed(1)}`;
    for (let k = 0; k < n; k++) d += ` q ${(k % 2 ? -a : a).toFixed(1)} ${(seg / 2).toFixed(1)} 0 ${seg.toFixed(1)}`;
    o += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${clamp(wr * 1.2)}"/>`;
  });
  return o;
}
// 指のはら（指先が上）。(0,0) は はらの まん中。wr = 0（つるつる）〜1（しわしわ）
function fingerPad(wr = 0, { seed = 1 } = {}) {
  let o = `<path d="M -80 220 V -70 Q -80 -150 0 -150 Q 80 -150 80 -70 V 220 Z" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M -60 132 Q 0 148 60 132" fill="none" stroke="${FW.skinDk}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
  if (wr < 1) o += `<g opacity="${0.55 * (1 - wr)}">` + [0, 1, 2].map(i => `<path d="M ${-36 + i * 11} ${-34 + i * 16} Q 0 ${-96 + i * 20} ${36 - i * 11} ${-34 + i * 16}" fill="none" stroke="${FW.skinDk}" stroke-width="4" stroke-linecap="round"/>`).join('') + `</g>`;
  return o + wrLines(wr, seed);
}
// 手（手のひら。指が上）。wr で指先にしわ
function handPalm(s = 1, wr = 0) {
  const st = `stroke="${FW.skinDk}" stroke-width="5"`;
  let o = `<rect x="-66" y="70" width="132" height="190" rx="48" fill="${FW.skin}" ${st}/>`;
  const F = [[-92, -150], [-42, -184], [8, -176], [58, -140]];
  o += F.map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="${-y + 20}" rx="22" fill="${FW.skin}" ${st}/>`).join('');
  o += `<rect x="-168" y="-36" width="52" height="150" rx="26" fill="${FW.skin}" ${st} transform="rotate(-32 -142 80)"/>`;
  o += `<rect x="-104" y="-76" width="216" height="210" rx="64" fill="${FW.skin}" ${st}/>`;
  o += `<path d="M -60 -6 Q -10 30 60 -14 M -66 44 Q -6 74 56 36" fill="none" stroke="${FW.skinDk}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
  if (wr > 0) F.forEach(([x, y], i) => [11, 22, 33].forEach((dx, k) => {
    const a = (k % 2 ? 4 : -4) * wr;
    o += `<path d="M ${x + dx} ${y + 14 + (k === 1 ? -4 : 2)} q ${a} 8 0 16 q ${-a} 8 0 16 q ${a} 8 0 16" fill="none" stroke="${FW.wr}" stroke-width="3.5" stroke-linecap="round" opacity="${clamp(wr * 1.2)}"/>`;
  }));
  return `<g transform="scale(${s})">${o}</g>`;
}
const drop = (x, y, s = 1, col = FW.water, o = 1) => o <= 0 ? '' : `<path d="M ${x} ${y - 16 * s} C ${x - 12 * s} ${y} ${x - 12 * s} ${y + 12 * s} ${x} ${y + 13 * s} C ${x + 12 * s} ${y + 12 * s} ${x + 12 * s} ${y} ${x} ${y - 16 * s} Z" fill="${col}" opacity="${o}"/>`;
const zap = (x, y, s = 1, o = 1) => o <= 0 ? '' : `<path d="M ${x + 4 * s} ${y - 18 * s} l ${-12 * s} ${18 * s} h ${9 * s} l ${-5 * s} ${18 * s} l ${15 * s} ${-22 * s} h ${-9 * s} l ${6 * s} ${-14 * s} Z" fill="${FW.nerve}" stroke="${FW.nerveDk}" stroke-width="${2.5 * s}" stroke-linejoin="round" opacity="${o}"/>`;
const clockFace = (a, r = 88) => `<circle r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="10"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<line x1="0" y1="${-r + 14}" x2="0" y2="${k % 3 ? -r + 22 : -r + 30}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" transform="rotate(${k * 30})"/>`).join('') +
  `<line x1="0" y1="0" x2="0" y2="${-r * 0.42}" stroke="${C.ink}" stroke-width="11" stroke-linecap="round" transform="rotate(${50 + a / 12})"/><line x1="0" y1="0" x2="0" y2="${-r * 0.66}" stroke="${C.redUi}" stroke-width="8" stroke-linecap="round" transform="rotate(${a})"/><circle r="9" fill="${C.ink}"/>`;

// 指先の中（横から見た だんめん）。p = { water, sig, shrink, pull, less }（どれも 0〜1）
const SEC = { X0: 110, X1: 1190, S: 380, B: 800, TOP: 210, V: 650, N: 540, L: 180 };
const secY = (x, pull) => SEC.S + pull * 50 * (1 - Math.cos((x - SEC.X0) / SEC.L * Math.PI * 2)) / 2;
function tipSection(t, p) {
  const { X0, X1, S, B, TOP, V, N, L } = SEC, W = X1 - X0;
  const pull = p.pull || 0, water = p.water || 0, sig = p.sig || 0, shrink = p.shrink || 0;
  const surf = (dy = 0) => { let d = ''; for (let x = X0; x <= X1; x += 15) d += `${x === X0 ? 'M' : 'L'} ${x} ${(secY(x, pull) + dy).toFixed(1)} `; return d; };
  let o = `<clipPath id="secc"><rect x="${X0}" y="${TOP}" width="${W}" height="${B - TOP}" rx="40"/></clipPath><g clip-path="url(#secc)">`;
  // お湯
  o += `<rect x="${X0}" y="${TOP}" width="${W}" height="${S - TOP + 60}" fill="${FW.waterLt}"/>`;
  for (let i = 0; i < 9; i++) o += `<path d="M ${X0 + 40 + i * 120 + Math.sin(t * 1.3 + i) * 14} ${TOP + 50 + (i % 3) * 34} q 22 -12 44 0 t 44 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  // 指の中
  o += `<path d="${surf()} L ${X1} ${B} L ${X0} ${B} Z" fill="${FW.flesh}"/>`;
  // 血管（赤い帯）
  const hv = lerp(46, 17, shrink);
  o += `<rect x="${X0 - 20}" y="${V - hv}" width="${W + 40}" height="${hv * 2}" rx="${hv}" fill="${FW.vessel}"/><rect x="${X0 - 20}" y="${V - hv * 0.55}" width="${W + 40}" height="${hv * 0.4}" rx="${hv * 0.2}" fill="#fff" opacity="0.25"/>`;
  for (let i = 0; i < 7; i++) { const f = ((t * 0.16 + i / 7) % 1); o += `<ellipse cx="${X0 + f * W}" cy="${V + Math.sin(i * 2.4) * hv * 0.35}" rx="${Math.min(13, hv * 0.5)}" ry="${Math.min(9, hv * 0.36)}" fill="${FW.vesselDk}" opacity="0.55"/>`; }
  // 神経（黄色い線）
  const nw = 9 + 5 * sig * (0.6 + 0.4 * Math.sin(t * 9));
  let nd = `M ${X0 - 10} ${N}`; for (let x = X0; x <= X1; x += 90) nd += ` q 22 ${(x / 90) % 2 ? 16 : -16} 45 0 t 45 0`;
  if (sig > 0) o += `<path d="${nd}" fill="none" stroke="#ffe27a" stroke-width="${nw + 14}" stroke-linecap="round" opacity="${0.45 * sig}"/>`;
  o += `<path d="${nd}" fill="none" stroke="${FW.nerve}" stroke-width="${nw}" stroke-linecap="round"/>`;
  // 汗の出口（山のてっぺんに開く）と、そこからしみこむ水
  for (let k = 1; k <= 5; k++) {
    const x = X0 + k * L, y0 = secY(x, pull), y1 = 470;
    o += `<path d="M ${x} ${N - 6} Q ${x + 30} ${N - 40} ${x + 14} ${y1 + 14}" fill="none" stroke="${FW.nerve}" stroke-width="7" stroke-linecap="round"/>`;
    o += `<path d="M ${x} ${y0 - 4} L ${x} ${y1 - 24}" stroke="#e39c82" stroke-width="20" stroke-linecap="round"/><circle cx="${x}" cy="${y1}" r="26" fill="#e39c82"/>`;
    o += `<path d="M ${x} ${y0 - 4} L ${x} ${y1 - 24}" stroke="${mix('#fde3d6', FW.water, clamp(water * 1.3 - k * 0.04))}" stroke-width="9" stroke-linecap="round"/><circle cx="${x}" cy="${y1}" r="15" fill="${mix('#fde3d6', FW.water, clamp(water * 1.6 - 0.5))}"/>`;
    if (water > 0 && water < 1) { const f = (t * 0.9 + k * 0.23) % 1; o += drop(x, lerp(y0 - 30, y1, f), 0.7, FW.waterDk, Math.min(1, f * 5, (1 - f) * 4)); }
    if (water > 0.5) o += `<circle cx="${x}" cy="${y1}" r="${40 + 6 * Math.sin(t * 3 + k)}" fill="${FW.water}" opacity="${0.22 * clamp((water - 0.5) * 2)}"/>`;
    if (sig > 0) { const f = (t * 0.8 + k * 0.31) % 1; o += zap(x + 10 + f * 26, lerp(y1 + 10, N, f), 1.1, sig * Math.min(1, f * 5, (1 - f) * 4)); }
  }
  if (sig > 0) for (let i = 0; i < 4; i++) { const f = (t * 0.35 + i / 4) % 1; o += zap(X0 + f * W, N - 34, 1.3, sig * Math.min(1, f * 8, (1 - f) * 8)); }
  // 皮ふ（外側のうすい層）
  o += `<path d="${surf()}" fill="none" stroke="${FW.skinLt}" stroke-width="44" stroke-linejoin="round" transform="translate(0 22)"/><path d="${surf()}" fill="none" stroke="${FW.skinDk}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (let k = 1; k <= 5; k++) { const x = X0 + k * L; o += `<ellipse cx="${x}" cy="${secY(x, pull) + 2}" rx="13" ry="7" fill="${mix('#c98a70', FW.waterDk, clamp(water * 2))}"/>`; }
  // 引っぱる矢印（谷のところが下へ）
  if (pull > 0.05) for (let k = 0; k < 6; k++) { const x = X0 + (k + 0.5) * L, y = secY(x, pull) + 56; o += g(arrow2(x, y, x, y + 34 + 26 * pull, '#fff', 9), { o: clamp(pull * 2) * 0.95 }); }
  // 血管がちぢむ矢印
  if (shrink > 0.02 && shrink < 1) [300, 650, 1000].forEach(x => { o += arrow2(x, V - 92, x, V - hv - 8, '#fff', 9) + arrow2(x, V + 92, x, V + hv + 8, '#fff', 9); });
  o += `</g><rect x="${X0}" y="${TOP}" width="${W}" height="${B - TOP}" rx="40" fill="none" stroke="${FW.skinDk}" stroke-width="8"/>`;
  return o;
}
// しわができる順番（右の一覧）。now = いまの番号（1〜4。0 ならまだ）
const STEPS = [['みずが しみこむ', FW.waterDk], ['しんけいが あいず', FW.nerveDk], ['けっかんが ちぢむ', FW.vesselDk], ['ひふが ひっぱられる', C.ochre]];
function stepList(t, now, tNow) {
  let o = '';
  STEPS.forEach(([s, col], i) => {
    const n = i + 1, on = n === now, done = n < now, k = on ? back(prog(t, tNow, 0.4)) : 1;
    o += g((on ? `<rect x="-282" y="-52" width="564" height="104" rx="30" fill="none" stroke="${col}" stroke-width="8"/>` : '') + `<rect x="-270" y="-40" width="540" height="80" rx="22" fill="#fff" filter="url(#shadow)"/>` +
      `<circle cx="-222" cy="0" r="30" fill="${col}"/>` + text(-222, 3, n, { size: 38, w: 900, fill: '#fff', ls: 0 }) + text(-176, 2, s, { size: 40, w: 900, anchor: 'start', fill: C.ink }), { x: 1560, y: 280 + i * 104, o: on || done ? 1 : 0.32, s: on ? lerp(0.9, 1, clamp(k)) : 0.94 });
  });
  return o;
}

// 1. つかみ：おふろで、指先がしわしわに
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), c3 = cue(3);
    let out = `<rect width="1920" height="1080" fill="${FW.tile}"/>`;
    for (let x = 0; x <= 1920; x += 160) out += `<line x1="${x}" y1="0" x2="${x}" y2="1080" stroke="${FW.tileLn}" stroke-width="5"/>`;
    for (let y = 100; y <= 1080; y += 160) out += `<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="${FW.tileLn}" stroke-width="5"/>`;
    // 湯気
    for (let i = 0; i < 4; i++) { const x = 190 + i * 270, f = (t * 0.22 + i * 0.27) % 1; out += `<path d="M ${x} ${560 - f * 260} q 34 -44 0 -88 q -34 -44 0 -88" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="${0.8 * Math.min(1, f * 4, (1 - f) * 3)}"/>`; }
    // 浴そう（うしろのふち → お湯）
    const WY = 650;
    out += `<ellipse cx="600" cy="${WY}" rx="560" ry="96" fill="${FW.tub}" stroke="${FW.tubDk}" stroke-width="8"/><ellipse cx="600" cy="${WY}" rx="520" ry="72" fill="${FW.waterLt}"/>`;
    out += `<path d="M 200 ${WY - 24} q 40 -14 80 0 t 80 0 M 700 ${WY - 34} q 40 -14 80 0 t 80 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
    // 子どもたちと、上げた手（お湯から上だけ見える）
    const wr = eio(prog(t, c0 + 1.0, Math.max(2, d0 - 1.4)));
    let kids = kidShow('B', t, 230, 772, { s: 0.62, start: 0.1, n: 1, enter: 'rise', look: [8, -2], bubble: false });
    kids += kidShow('S', t, 450, 818, { s: 0.62, start: 0.2, n: 0, enter: 'rise', look: [8, -4], bubble: false, eyes: wr > 0.5 && t < c3 ? 'wide' : null });
    kids += g(handPalm(0.32, wr), { x: 606, y: 588 + (1 - eo(prog(t, 0.5, 0.6))) * 130 });
    out += `<clipPath id="hbath"><rect x="0" y="0" width="1920" height="${WY - 6}"/></clipPath><g clip-path="url(#hbath)">${kids}</g>`;
    [[230, 108], [450, 104], [606, 36]].forEach(([x, r]) => { out += `<ellipse cx="${x}" cy="${WY - 6}" rx="${r}" ry="${r > 50 ? 15 : 9}" fill="none" stroke="#fff" stroke-width="6" opacity="0.9"/>`; });
    // 手を大きく見る（まるの中）
    const ZX = 900, ZY = 330, ZR = 215, zo = prog(t, 0.7, 0.5);
    out += g(`<line x1="626" y1="520" x2="${ZX - 176}" y2="${ZY + 124}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/><line x1="590" y1="512" x2="${ZX - 190}" y2="${ZY - 100}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="14 12"/>` +
      `<circle cx="${ZX}" cy="${ZY}" r="${ZR}" fill="#fff" stroke="${C.blueUi}" stroke-width="12"/><clipPath id="hzc"><circle cx="${ZX}" cy="${ZY}" r="${ZR - 6}"/></clipPath><g clip-path="url(#hzc)">${g(handPalm(1.05, wr), { x: ZX + 12, y: ZY + 50 })}</g>`, { o: zo });
    // あひる
    out += `<g transform="translate(${1010 + Math.sin(t * 1.1) * 10} ${WY - 22 + Math.sin(t * 2.2) * 4})"><ellipse cx="0" cy="8" rx="44" ry="26" fill="${C.yellow}"/><circle cx="30" cy="-22" r="22" fill="${C.yellow}"/><path d="M 48 -22 l 22 5 l -22 8 Z" fill="#f08a3c"/><circle cx="34" cy="-27" r="4" fill="${C.ink}"/></g>`;
    // 浴そう（手前）
    out += `<path d="M 40 ${WY} A 560 96 0 0 0 1160 ${WY} L 1160 1080 L 40 1080 Z" fill="${FW.tub}" stroke="${FW.tubDk}" stroke-width="8"/><path d="M 80 ${WY} A 520 72 0 0 0 1120 ${WY}" fill="none" stroke="${FW.tubDk}" stroke-width="5" opacity="0.7"/>`;
    out += talkBubble('S', 330, 400, 440, 530, 44);
    // 指先のしわ（上げた手をさす）
    out += tag(925, 225, 1190, 130, 'しわしわ', win(t, c0 + d0 * 0.6, c1 + 0.3, 0.3), { col: FW.wr, size: 46 });
    // 時計
    const ck = win(t, c0 + 0.6, c1 - 0.1, 0.3);
    if (ck > 0) out += g(clockFace(prog(t, c0 + 1.0, Math.max(2, d0 - 1.4)) * 660, 96), { x: 1520, y: 360, o: ck }) + g(text(1520, 520, 'しばらく すると…', { size: 46, w: 900 }), { o: ck });
    // くらべる：入ったばかり と しばらくすると
    const co = prog(t, c1 - 0.1, 0.4);
    if (co > 0) {
      let c = card(640, 620);
      c += g(fingerPad(0), { x: -155, y: -20, s: 0.9 }) + g(fingerPad(1, { seed: 3 }), { x: 155, y: -20, s: 0.9 });
      c += text(-155, -256, 'はいった ばかり', { size: 36, w: 900, fill: C.muted }) + text(155, -256, 'しばらく すると', { size: 36, w: 900, fill: C.muted });
      c += text(-155, 248, 'つるつる', { size: 50, w: 900, fill: FW.waterDk }) + text(155, 248, 'しわしわ', { size: 50, w: 900, fill: FW.wr });
      c += g(arrow2(-46, -20, 46, -20, C.ink, 12), { o: 1 - prog(t, c3 + 0.3, 0.3) }) + pop(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre, extra: 'stroke="#fff" stroke-width="16" paint-order="stroke" stroke-linejoin="round"' }), t, c3 + 0.4, 0, -24);
      out += g(c, { x: 1530, y: 420 - (1 - eo(co)) * 30, o: co });
    }
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${FW.waterDk}">おふろ</tspan>に はいると、どうして</text>`, { x: 960, y: 370, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">ゆびが <tspan fill="${FW.wr}">しわしわ</tspan>に なるの？</text>`, { x: 960, y: 550, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(fingerPad(0), { x: -200, s: 0.62 }) + arrow2(-90, 0, 70, 0, C.ink, 12) + g(fingerPad(1, { seed: 3 }), { x: 200, s: 0.62 }), t, t0 + 1.8, 960, 790);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'どうしてだと おもう？', { size: 84, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'ゆびの なかの けっかんが、きゅっと ちぢむから'], ['②', 'ひふが みずを すって、ふくらむから'], ['③', 'おゆの ねつで、ひふが のびるから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-640" y="-76" width="1280" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1260, 132) +
        `<circle cx="-560" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-560, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-494, 2, s, { size: 46, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 390 + i * 168);
    });
    out += kidShow('B', t, 1740, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1740, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 皮ふのいちばん外側の細胞は、水を吸うとふくらむ。昔の考え。でも、それだけではなかった
SCENES.push({
  id: 'swell',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    // 外側の細胞（ひらたい れんが）
    const CX = 520, sw = eio(prog(t, c0 + d0 * 0.45, 2.2)), H = lerp(40, 60, sw), GAP = 10, ROWS = 4, top = 640 - ROWS * (H + GAP);
    let b = `<rect x="${CX - 380}" y="${top - 170}" width="760" height="150" rx="24" fill="${FW.waterLt}"/>` + text(CX - 340, top - 130, 'みず', { size: 40, w: 900, fill: FW.waterDk, anchor: 'start' });
    for (let i = 0; i < 6; i++) b += `<path d="M ${CX - 330 + i * 120 + Math.sin(t * 1.3 + i) * 10} ${top - 70 + (i % 2) * 22} q 20 -11 40 0 t 40 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
    for (let r = 0; r < ROWS; r++) for (let c = -1; c < 4; c++) {
      const x = CX - 380 + c * 200 + (r % 2) * 100, y = top + r * (H + GAP);
      b += `<rect x="${x + 5}" y="${y}" width="190" height="${H}" rx="${H * 0.4}" fill="${mix(FW.skinLt, '#cfe6f7', sw * 0.8)}" stroke="${mix(FW.skinDk, FW.water, sw * 0.6)}" stroke-width="5"/>`;
    }
    b += `<rect x="${CX - 380}" y="640" width="760" height="110" fill="${FW.flesh}"/>`;
    // しみこむ しずく
    const dk = win(t, c0 + d0 * 0.3, c0 + d0 * 0.45 + 2.4, 0.3);
    for (let i = 0; i < 7; i++) { const f = (t * 0.7 + i * 0.19) % 1; b += drop(CX - 300 + i * 100, lerp(top - 40, top + 150, f), 1, FW.waterDk, dk * Math.min(1, f * 5, (1 - f) * 4)); }
    out += `<clipPath id="swc"><rect x="${CX - 380}" y="190" width="760" height="560" rx="30"/></clipPath>` + g(`<g clip-path="url(#swc)">${b}</g><rect x="${CX - 380}" y="${top - 170}" width="760" height="${750 - top + 170}" rx="30" fill="none" stroke="${FW.skinDk}" stroke-width="8"/>`, { o: prog(t, 0.2, 0.4) });
    // あつさ
    const bx = CX + 420;
    out += g(`<path d="M ${bx - 14} ${top} h 28 M ${bx} ${top} V 640 M ${bx - 14} 640 h 28" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`, { o: prog(t, c0 + d0 * 0.3, 0.4) });
    out += pop(badge('ふくらむ', { fill: FW.waterDk, size: 50, pad: 40 }), t, c0 + d0 * 0.45 + 1.2, CX, 170, { end: c1 + d1 * 0.3 });
    out += tag(CX - 120, top + H * 0.5, 330, 798, 'いちばん そとがわの さいぼう', prog(t, c0 + 0.8, 0.4), { col: FW.wr, size: 38 });
    // 昔の考え
    const oo = prog(t, c1 + 0.2, 0.5);
    if (oo > 0) {
      let c = card(700, 560);
      c += g(badge('むかしの かんがえ', { fill: C.ochre, size: 44, pad: 40 }), { y: -280 });
      c += g(fingerPad(1, { seed: 3 }), { x: -150, y: -10, s: 0.8 });
      const pu = 8 * Math.sin(t * 4);
      c += arrow2(-240, -40, -290 - pu, -40, FW.waterDk, 10) + arrow2(-60, -40, -10 + pu, -40, FW.waterDk, 10) + arrow2(-150, -150, -150, -196 - pu, FW.waterDk, 10);
      c += g(text(140, -80, 'ひふが', { size: 46, w: 900 }) + text(140, -16, 'ふくらむ から', { size: 46, w: 900, fill: FW.waterDk }) + text(140, 52, 'しわに なる', { size: 46, w: 900 }), { o: prog(t, c1 + d1 * 0.45, 0.4) });
      c += text(0, 222, 'と かんがえられて いた', { size: 40, w: 900, fill: C.muted });
      out += g(c, { x: 1420, y: 500 - (1 - eo(oo)) * 30, o: oo });
      // それだけではなかった
      out += pop(g(`<rect x="-320" y="-70" width="640" height="140" rx="30" fill="#fff" stroke="${C.red}" stroke-width="10"/>` + text(0, 4, 'それだけじゃ ない！', { size: 62, w: 900, fill: C.red }), { r: -7 }), t, c2 + 0.5, 1420, 712);
    }
    return out;
  },
});

// 4. 手がかりは神経：神経がはたらかない指は、水につけてもしわにならない → 体が自分でつくっている
SCENES.push({
  id: 'nerve',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c4 = cue(4), d4 = cueE(4) - c4;
    // 手と神経（黄色い線）
    const HX = 330, HY = 520;
    let h = handPalm(1.05);
    const nk = prog(t, c0 + 0.3, 1.0), pulse = 0.75 + 0.25 * Math.sin(t * 6);
    const np = 'M 0 250 L 0 40 ' + [[-70, -150], [-20, -184], [30, -176], [80, -140]].map(([x, y]) => `M 0 40 Q ${x * 0.5} -30 ${x} ${y + 30}`).join(' ') + ' M 0 110 Q -70 100 -128 34';
    h += `<g transform="scale(1.05)" opacity="${nk}"><path d="${np}" fill="none" stroke="#ffe27a" stroke-width="17" stroke-linecap="round" opacity="${0.4 * pulse}"/><path d="${np}" fill="none" stroke="${FW.nerve}" stroke-width="7" stroke-linecap="round"/></g>`;
    out += pop(h, t, 0.2, HX, HY);
    out += tag(HX + 22, HY + 150, HX + 190, 800, 'しんけい', prog(t, c0 + 1.0, 0.3), { col: FW.nerveDk, size: 46 });
    out += pop(badge('てがかりは「しんけい」', { fill: FW.nerve, color: C.ink, size: 48, pad: 40 }), t, c0 + 0.5, 420, 190);
    // 水につける：神経がはたらく指 と はたらかない指
    const soak = c1 + d1 * 0.5, wr = eio(prog(t, soak, 2.4));
    [[990, true, 'しんけいが はたらく'], [1500, false, 'しんけいが はたらかない']].forEach(([x, ok, name], i) => {
      let c = card(450, 620);
      c += text(0, -262, name, { size: 34, w: 900, fill: ok ? FW.nerveDk : C.muted });
      // 指（下向き）と、その中の神経
      c += `<g transform="translate(0 -30) rotate(180) scale(0.72)">${fingerPad(ok ? wr : 0, { seed: 3 })}</g>`;
      const nl = `M 0 -200 Q 14 -150 0 -110 T 0 -40`;
      c += ok ? `<path d="${nl}" fill="none" stroke="#ffe27a" stroke-width="18" stroke-linecap="round" opacity="${0.45 * pulse}"/><path d="${nl}" fill="none" stroke="${FW.nerve}" stroke-width="8" stroke-linecap="round"/>` + zap(34, -150 + ((t * 60) % 90), 1.1, 0.9)
        : `<path d="${nl}" fill="none" stroke="#a9a9a2" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 14"/>` + `<g transform="translate(46 -130)"><circle r="26" fill="#fff" stroke="${C.red}" stroke-width="6"/><path d="M -11 -11 L 11 11 M 11 -11 L -11 11" stroke="${C.red}" stroke-width="7" stroke-linecap="round"/></g>`;
      // 水の入った入れもの
      c += `<rect x="-150" y="10" width="300" height="130" fill="${FW.water}" opacity="0.4"/><path d="M -150 10 q 25 -10 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" fill="none" stroke="${FW.waterDk}" stroke-width="5" opacity="0.6"/><path d="M -160 -30 V 124 Q -160 144 -140 144 H 140 Q 160 144 160 124 V -30" fill="none" stroke="#8fb3c6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
      c += g(text(0, 216, ok ? 'しわしわ' : 'しわに ならない', { size: ok ? 54 : 46, w: 900, fill: ok ? FW.wr : FW.waterDk }), { o: prog(t, soak + 2.0 + i * 0.6, 0.4) });
      out += pop(c, t, c1 + 0.2 + i * d1 * 0.22, x, 500);
    });
    out += pop(badge('みずに つけても…', { fill: FW.waterDk, size: 40 }), t, soak - 0.6, 1245, 150, { end: c2 - 0.2 });
    // つまり、体が自分でつくっている
    const so = prog(t, c2 - 0.1, 0.5);
    if (so > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.97 * so}"/>` + topBadge();
      out += pop(badge('しわは、からだが じぶんで つくって いる', { fill: FW.wr, size: 54, pad: 46 }), t, c2 + 0.3, 1000, 250);
      out += kidShow('B', t, 300, 850, { s: 0.6, start: cue(3) - 0.9, n: 0, end: c4 + d4 * 0.2 });
      // 心臓や汗と同じ、考えなくても動く神経
      const io = prog(t, c4 + 0.2, 0.4);
      if (io > 0) {
        const beat = 1 + 0.1 * Math.max(0, Math.sin(t * 7));
        const items = [
          [`<path d="M 0 44 C -80 -10 -60 -70 -24 -70 C -8 -70 0 -56 0 -46 C 0 -56 8 -70 24 -70 C 60 -70 80 -10 0 44 Z" fill="${FW.vessel}" transform="scale(${beat})"/>`, 'しんぞう'],
          [drop(-30, -10, 2.2) + drop(26, 6, 2.6) + drop(-6, 40, 1.6), 'あせ'],
          [g(fingerPad(1, { seed: 3 }), { s: 0.4, y: -6 }), 'ゆびの しわ'],
        ];
        items.forEach(([ic, name], i) => {
          out += pop(`<circle r="112" fill="#fff" filter="url(#shadow)"/>` + ic + text(0, 160, name, { size: 46, w: 900 }), t, c4 + d4 * (0.12 + i * 0.16), 660 + i * 360, 520);
        });
        out += g(`<path d="M 560 712 v 18 h 920 v -18 M 1020 730 v 16" fill="none" stroke="${FW.nerveDk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`, { o: prog(t, c4 + d4 * 0.55, 0.3) });
        out += pop(badge('かんがえなくても うごく しんけい', { fill: FW.nerve, color: C.ink, size: 46, pad: 44 }), t, c4 + d4 * 0.6, 1020, 792);
      }
    }
    return out;
  },
});

// 5. しわができる順番（考えられているしくみ）① 水がしみこむ ② 神経が合図を出す
SCENES.push({
  id: 'step1',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    const water = prog(t, c1 + d1 * 0.3, Math.max(2.5, d1 * 0.65)), sig = prog(t, c2 + 0.3, 1.0);
    out += g(tipSection(t, { water, sig }), { o: prog(t, 0.2, 0.5) });
    out += pop(badge('ゆびさきの なか', { fill: FW.wr, size: 40 }), t, 0.4, 300, 210);
    out += pop(badge('こう かんがえられて いる', { fill: C.ochre, size: 44, pad: 40 }), t, c0 + 0.4, 1560, 170);
    out += stepList(t, t < c1 ? 0 : t < c2 ? 1 : 2, t < c2 ? c1 : c2);
    out += g(text(1110, 262, 'おゆ', { size: 44, w: 900, fill: FW.waterDk, anchor: 'end' }), { o: prog(t, 0.6, 0.4) });
    out += tag(SEC.X0 + 2 * SEC.L, SEC.S, 600, 290, 'あせの でぐち', win(t, c1 + d1 * 0.25, c2 - 0.2, 0.3), { col: FW.waterDk, size: 40 });
    out += tag(SEC.X0 + 4.5 * SEC.L, SEC.N, 930, 740, 'しんけい', win(t, c2 + 0.2, 1e9, 0.3), { col: FW.nerveDk, size: 40 });
    out += tag(SEC.X0 + 1.2 * SEC.L, SEC.V, 330, 750, 'けっかん', win(t, 1.0, c1 + 0.3, 0.3), { col: FW.vesselDk, size: 40 });
    return out;
  },
});

// 6. ③ 血管がちぢむ → 中身が少しへる ④ 皮ふが下へ引っぱられて、しわ
SCENES.push({
  id: 'step2',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    const shrink = eio(prog(t, c0 + d0 * 0.4, 2.0)), pull = eio(prog(t, c2 + d2 * 0.25, Math.max(2.2, d2 * 0.6)));
    out += tipSection(t, { water: 1, sig: 1 - 0.6 * prog(t, c1, 1.5), shrink, pull });
    out += pop(badge('ゆびさきの なか', { fill: FW.wr, size: 40 }), t, -1, 300, 210);
    out += pop(badge('こう かんがえられて いる', { fill: C.ochre, size: 44, pad: 40 }), t, -1, 1560, 170);
    out += stepList(t, t < c0 ? 2 : t < c2 ? 3 : 4, t < c2 ? c0 : c2);
    out += tag(SEC.X0 + 1.2 * SEC.L, SEC.V, 330, 750, 'けっかん', win(t, c0 + 0.2, c2 - 0.2, 0.3), { col: FW.vesselDk, size: 40 });
    out += pop(badge('きゅっ', { fill: FW.vesselDk, size: 54, pad: 40 }), t, c0 + d0 * 0.4 + 0.6, 650, 520, { end: c1 - 0.1 });
    out += pop(badge('なかみが すこし へる', { fill: '#fff', color: FW.vesselDk, size: 44, pad: 40 }), t, c1 + d1 * 0.4, 650, 520, { end: c2 - 0.1 });
    out += tag(SEC.X0 + 3.5 * SEC.L, SEC.S + 40, 760, 290, 'しわ', win(t, c2 + d2 * 0.25 + 1.6, 1e9, 0.3), { col: FW.wr, size: 50 });
    out += pop(badge('したへ ひっぱられる', { fill: C.ochre, size: 44, pad: 40 }), t, c2 + d2 * 0.25 + 0.4, 650, 520);
    out += kidShow('K', t, 1660, 890, { s: 0.62, start: cue(3) - 0.8, n: 0, bubble: false, mouth: lineOf('K') ? 'open' : 'smile' });
    out += talkBubble('K', 1580, 706, 1590, 772, 40);
    return out;
  },
});

// 7. しわの形は、毎回同じ。血管の場所がほとんど変わらないから
SCENES.push({
  id: 'same',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    out += pop(badge('しわの かたちは、まいかい おなじ', { fill: FW.wr, size: 50, pad: 44 }), t, c0 + 0.4, 1040, 150);
    const cards = [[400, '1かいめ', c0 + 0.8], [960, '1にち いじょう あと', c1 + d1 * 0.15]];
    cards.forEach(([x, name, st], i) => {
      let c = card(480, 560) + text(0, -226, name, { size: 40, w: 900, fill: C.muted });
      c += g(fingerPad(eio(prog(t, st + 0.5, 1.6)), { seed: 3 }), { y: -10, s: 0.92 });
      c += `<rect x="-150" y="-128" width="300" height="230" rx="20" fill="${FW.water}" opacity="${0.16 * win(t, st + 0.2, st + 2.6, 0.4)}"/>`;
      c += g(drop(-170, -190, 1.6) + drop(-140, -160, 1.1), { o: win(t, st + 0.2, st + 2.6, 0.4) });
      out += pop(c, t, st, x, 500);
    });
    // おなじ形
    const eq = c1 + d1 * 0.7;
    out += pop(`<circle r="58" fill="${C.ochre}"/>` + text(0, 2, '＝', { size: 70, w: 900, fill: '#fff' }), t, eq, 680, 500);
    out += pop(badge('おなじ かたち！', { fill: C.ochre, size: 46, pad: 40 }), t, eq + 0.4, 680, 792);
    // 血管の場所が、ほとんど変わらない
    const vo = prog(t, c2 + 0.1, 0.5);
    if (vo > 0) {
      let c = card(480, 560) + text(0, -226, 'ひふの した', { size: 40, w: 900, fill: FW.vesselDk });
      c += g(fingerPad(0.0, { seed: 3 }).replace(/<g opacity[^]*?<\/g>/, '') + wrLines(1, 3, FW.vessel, 11) + `<path d="M -27 98 Q -20 170 -10 220 M 27 98 Q 20 170 10 220 M 0 98 V 220 M -52 98 Q -44 160 -30 220 M 52 98 Q 44 160 30 220" fill="none" stroke="${FW.vessel}" stroke-width="9" stroke-linecap="round" opacity="0.85"/>`, { y: -10, s: 0.92 });
      out += g(c, { x: 1520, y: 500 - (1 - eo(vo)) * 30, o: vo });
      out += pop(badge('けっかんの ばしょが かわらない', { fill: FW.vesselDk, size: 38 }), t, c2 + d2 * 0.5, 1500, 792);
      out += g(arrow2(1210, 500, 1270, 500, C.ink, 12), { o: prog(t, c2 + 0.5, 0.3) });
    }
    return out;
  },
});

// 8. 何のため？ つかみやすくなるという考え。早くなった実験と、ちがいが出なかった実験。まだわかっていない
function marbleBowl(x, y, s = 1) {
  const cols = ['#e8574c', '#f6b500', '#36b24a', '#8a5cf0', '#2f86ff'];
  let o = `<path d="M -120 -40 Q -120 50 -60 50 H 60 Q 120 50 120 -40 Z" fill="${FW.waterLt}" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
  cols.forEach((c, i) => { o += `<circle cx="${-64 + i * 32}" cy="${22 - (i % 2) * 8}" r="16" fill="${c}"/><circle cx="${-69 + i * 32}" cy="${16 - (i % 2) * 8}" r="5" fill="#fff" opacity="0.7"/>`; });
  return `<g transform="translate(${x} ${y}) scale(${s})">${o}</g>`;
}
SCENES.push({
  id: 'why',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    // 何のため？
    const q0 = 1 - prog(t, c1 - 0.3, 0.4);
    if (q0 > 0) out += g(pop(g(fingerPad(1, { seed: 3 }), { s: 1.0 }), t, c0 + 0.2, 760, 500) + pop(text(0, 0, '？', { size: 300, w: 900, fill: C.ochre }), t, c0 + 0.9, 1130, 470) + pop(badge('なんの ため？', { fill: C.ochre, size: 56, pad: 46 }), t, c0 + 1.2, 960, 840 - 30), { o: q0 });
    const po = prog(t, c1 - 0.1, 0.4);
    if (po > 0) {
      out += pop(badge('しわは なんの ため？', { fill: C.ochre, size: 46, pad: 40 }), t, c1, 1000, 150);
      // 考え：タイヤのみぞのように
      let a = card(560, 560) + g(badge('かんがえ', { fill: C.accent, size: 36 }), { y: -280 });
      a += `<g transform="translate(-130 -70)"><circle r="104" fill="#3a3f45"/><circle r="50" fill="#cfd4d9"/><circle r="18" fill="#8d959c"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<path d="M 0 -100 q 12 16 0 30" fill="none" stroke="#9aa3ab" stroke-width="8" stroke-linecap="round" transform="rotate(${k * 30 + t * 30})"/>`).join('')}</g>`;
      for (let i = 0; i < 6; i++) { const f = (t * 0.9 + i / 6) % 1; a += drop(-250 + i * 48, lerp(-230, -180, f), 0.8, FW.water, Math.min(1, f * 5, (1 - f) * 4)); }
      a += `<path d="M -250 40 q 30 -10 60 0 t 60 0 t 60 0 t 60 0" fill="none" stroke="${FW.water}" stroke-width="8" stroke-linecap="round"/>`;
      a += g(fingerPad(1, { seed: 3 }), { x: 150, y: -80, s: 0.6 });
      a += text(-130, 80, 'タイヤの みぞ', { size: 36, w: 900 }) + text(150, 80, 'ゆびの しわ', { size: 36, w: 900 });
      a += text(0, 166, 'ぬれた ものを', { size: 42, w: 900, fill: FW.waterDk }) + text(0, 222, 'つかみやすく する？', { size: 42, w: 900, fill: FW.waterDk });
      out += pop(a, t, c1 + 0.3, 340, 500);
      // 実験：早く移せた
      const barRow = (y, name, len, col, st) => text(-230, y, name, { size: 34, w: 900, anchor: 'start' }) + `<rect x="-60" y="${y - 20}" width="${len * eo(prog(t, st, 0.8))}" height="40" rx="20" fill="${col}"/>`;
      let b = card(560, 560) + g(badge('ある じっけん', { fill: C.blueUi, size: 36 }), { y: -280 });
      b += marbleBowl(-120, -130, 0.9) + arrow2(-10, -150, 60, -150, C.ink, 9) + `<path d="M 60 -170 Q 60 -80 110 -80 H 190 Q 240 -80 240 -170 Z" fill="#fff" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
      const mv = ((t - c2) * 0.6 % 1 + 1) % 1; b += `<circle cx="${lerp(-120, 150, eio(mv))}" cy="${-150 - Math.sin(mv * Math.PI) * 60}" r="15" fill="#e8574c"/>`;
      b += text(-240, -30, 'みずの なかの ビーだまを うつす', { size: 28, w: 900, fill: C.muted, anchor: 'start' });
      b += barRow(46, 'しわしわ', 170, FW.wr, c2 + d2 * 0.45) + barRow(106, 'つるつる', 240, '#b9b6ab', c2 + d2 * 0.55) + text(240, 6, 'かかった じかん', { size: 26, w: 900, fill: C.muted, anchor: 'end' });
      b += g(text(0, 200, 'しわしわの ほうが はやい', { size: 40, w: 900, fill: FW.wr }), { o: prog(t, c2 + d2 * 0.7, 0.4) });
      out += pop(b, t, c2 + 0.2, 960, 500);
      // べつの実験：ちがいが出なかった
      let d = card(560, 560) + g(badge('べつの じっけん', { fill: C.redUi, size: 36 }), { y: -280 });
      d += marbleBowl(-120, -130, 0.9) + arrow2(-10, -150, 60, -150, C.ink, 9) + `<path d="M 60 -170 Q 60 -80 110 -80 H 190 Q 240 -80 240 -170 Z" fill="#fff" stroke="#8fb3c6" stroke-width="8" stroke-linejoin="round"/>`;
      d += text(-240, -30, 'ぬれた ものを うつす', { size: 28, w: 900, fill: C.muted, anchor: 'start' });
      d += barRow(46, 'しわしわ', 210, FW.wr, c3 + d3 * 0.4) + barRow(106, 'つるつる', 210, '#b9b6ab', c3 + d3 * 0.5) + text(240, 6, 'かかった じかん', { size: 26, w: 900, fill: C.muted, anchor: 'end' });
      d += g(text(0, 200, 'ちがいが でなかった', { size: 40, w: 900, fill: C.redUi }), { o: prog(t, c3 + d3 * 0.7, 0.4) });
      out += pop(d, t, c3 + 0.2, 1580, 500);
      // まだわかっていない
      const uo = prog(t, c4 + 0.2, 0.5);
      if (uo > 0) out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.8 * uo}"/>` + topBadge() + pop(g(`<rect x="-520" y="-130" width="1040" height="260" rx="50" fill="#fff" stroke="${C.ochre}" stroke-width="12" filter="url(#shadow)"/>` + text(-320, 8, '？', { size: 190, w: 900, fill: C.ochre }) + text(90, -44, 'なんの ためかは', { size: 60, w: 900 }) + text(90, 46, 'まだ わかって いない', { size: 66, w: 900, fill: C.ochre }), {}), t, c4 + 0.5, 960, 480);
    }
    return out;
  },
});

// 9. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2);
    const aO = 1 - prog(t, c2 - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1400, 170) + `<circle cx="-610" cy="0" r="50" fill="${C.blueUi}"/>` + text(-610, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-530, 2, 'ゆびの なかの けっかんが、きゅっと ちぢむから', { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 330);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 350, y: 330, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['しんけいが あいず', FW.nerveDk], ['けっかんが ちぢむ', FW.vesselDk], ['ひふが ひっぱられる', C.ochre]], t, 960, 500, { start: 2.6, step: 1.1, size: 38 });
      // ② も本当。でも、それだけではしわにならない
      a += pop(card(1400, 200) + `<circle cx="-610" cy="-36" r="42" fill="${C.accent}"/>` + text(-610, -33, '②', { size: 48, w: 900, fill: '#fff' }) + text(-540, -36, 'ひふが みずを すって ふくらむのも、ほんとう', { size: 44, w: 900, anchor: 'start' }) +
        g(text(-540, 44, 'でも、それだけでは しわに ならない', { size: 46, w: 900, anchor: 'start', fill: C.red }), { o: prog(t, c1 + d1 * 0.5, 0.4) }), t, c1 + 0.2, 960, 690);
      out += g(a, { o: aO });
    }
    const bO = prog(t, c2 - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, c2 - 0.2, 400, 190);
      const bathIc = `<path d="M -56 -6 H 56 V 16 Q 56 40 30 40 H -30 Q -56 40 -56 16 Z" fill="#fff" stroke="#8fb3c6" stroke-width="6" stroke-linejoin="round"/><rect x="-48" y="-2" width="96" height="12" fill="${FW.waterLt}"/><path d="M -24 -24 q 8 -10 0 -20 M 4 -24 q 8 -10 0 -20 M 30 -24 q 8 -10 0 -20" fill="none" stroke="#9cc4dc" stroke-width="5" stroke-linecap="round"/>`;
      const items = [
        [bathIc, 'おふろで、ゆびさきと ての こうを くらべる', 'どっちが さきに しわしわに なるかな', C.ink, 360],
        [warnIcon(0.9), 'おふろは、おとなと いっしょに', 'あつい おゆに ながく はいりすぎない。のぼせる まえに でる', C.red, 560],
      ];
      items.forEach(([ic, s1, s2, col, y], i) => {
        b += pop(ic + text(110, -30, s1, { size: 42, w: 900, anchor: 'start', fill: col }) + text(110, 32, s2, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 2), 190, y);
      });
      // 指先（はら）と 手のこう
      let p = card(470, 300);
      p += g(fingerPad(eio(prog(t, c2 + 2.0, 5)), { seed: 3 }), { x: -110, y: -10, s: 0.5 }) + text(-110, 120, 'ゆびさき', { size: 34, w: 900 });
      p += `<g transform="translate(110 -4) scale(0.36)"><rect x="-66" y="70" width="132" height="190" rx="48" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7"/>${[[-92, -150], [-42, -184], [8, -176], [58, -140]].map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="${-y + 20}" rx="22" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7"/><rect x="${x + 9}" y="${y + 8}" width="26" height="30" rx="11" fill="#fbeee6" stroke="${FW.skinDk}" stroke-width="4"/>`).join('')}<rect x="116" y="-36" width="52" height="150" rx="26" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7" transform="rotate(32 142 80)"/><rect x="-104" y="-76" width="216" height="210" rx="64" fill="${FW.skin}" stroke="${FW.skinDk}" stroke-width="7"/></g>` + text(110, 120, 'ての こう', { size: 34, w: 900 });
      p += text(0, -112, 'どっちが さき？', { size: 36, w: 900, fill: C.ochre });
      b += pop(p, t, c2 + 0.6, 1610, 300);
      b += kidShow('K', t, 1720, 800, { s: 0.72, start: c2 + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「ゆび」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
