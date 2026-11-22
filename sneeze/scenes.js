// みのまわり図鑑 動画「くしゃみは、どうして出るの？」
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
const TOPIC = 'くしゃみ';
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
  if (who === 'K') sx = (x > 960 ? -1 : 1) * Math.abs(sx);  // カメレオンは画面の内がわを向く
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

// みのまわり図鑑「くしゃみは、どうして出るの？」（もとの記事：everyday-trivia trivia/sneeze-reflex.md）
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 色の約束：しらせ（しんけい）＝きいろ、すう いき＝あお、だす いき＝オレンジ、えんずい＝むらさき、めいれい＝あかの てんせん
const SZ = {
  in: '#4a90d9', inDk: '#2f6fb3', out: '#f0883a', outDk: '#c9641c', nerve: '#f5bd1f', nerveDk: '#b98608', med: '#8f6fd0', medDk: '#6a4bb0', cmd: '#d9503f',
  skin: '#f6d6bd', skinSh: '#ecc0a2', hair: '#4b3226', line: '#3a2a22', cav: '#dcecf5', lung: '#f4b3ba', brain: '#f3c0c8', mucus: '#cfe0a6', mucusDk: '#8fa85a', dust: '#8c979b', pollen: '#b9c940', shirt: '#8cc0aa',
};

// ---------- 小道具 ----------
function arrow(x1, y1, x2, y2, col, w = 14, k = 1, o = 1) {
  if (k <= 0.02 || o <= 0.01) return '';
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = w * 2.4;
  const bx = ex - Math.cos(a) * hd, by = ey - Math.sin(a) * hd, nx = -Math.sin(a) * hd * 0.75, ny = Math.cos(a) * hd * 0.75;
  return `<g opacity="${o}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M ${ex.toFixed(1)} ${ey.toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} Z" fill="${col}" stroke="${col}" stroke-width="${w * 0.3}" stroke-linejoin="round"/></g>`;
}
const olText = (x, y, str, { size = 44, fill = '#fff', ol = C.ink, sw = 10, anchor = 'middle' } = {}) =>
  text(x, y, str, { size, w: 900, fill, anchor, extra: `stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` });
const pointer = (x1, y1, x2, y2, col = C.ink, o = 1) => o <= 0.01 ? '' : `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9" fill="${col}"/></g>`;
// 折れ線の上の、割合 f（0〜1）の点
function along(pts, f) {
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let rem = clamp(f) * tot;
  for (let i = 1; i < pts.length; i++) {
    if (rem <= L[i - 1] || i === pts.length - 1) { const k = L[i - 1] ? clamp(rem / L[i - 1]) : 0; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; }
    rem -= L[i - 1];
  }
  return pts[pts.length - 1];
}
// 道にそって流れるつぶ（sp：1秒に道の何割進むか）
function flow(pts, t, { col = SZ.in, n = 6, sp = 0.6, r = 3, o = 1 } = {}) {
  if (o <= 0.01) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const f = (((t * sp + i / n) % 1) + 1) % 1, [x, y] = along(pts, f), a = Math.min(1, f * 6, (1 - f) * 6);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" opacity="${(a * o).toFixed(2)}"/>`;
  }
  return s;
}
// ほこり・かふん・けむり
const dustDot = (x, y, r = 8, o = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${SZ.dust}" opacity="${o}"/>`;
function pollenDot(x, y, r = 12, o = 1) {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; d += `M ${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} l ${(Math.cos(a) * r * 0.5).toFixed(1)} ${(Math.sin(a) * r * 0.5).toFixed(1)} `; }
  return `<g opacity="${o}"><path d="${d}" stroke="#7d8a22" stroke-width="${Math.max(2, r * 0.22)}" stroke-linecap="round"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${SZ.pollen}" stroke="#7d8a22" stroke-width="${Math.max(1.5, r * 0.16)}"/></g>`;
}
const smokeWisp = (x, y, s = 1, ph = 0, o = 1) => `<path d="M ${x} ${y} c ${-18 * s + Math.sin(ph) * 6} ${-26 * s} ${22 * s} ${-40 * s} ${4 * s} ${-70 * s} c ${-14 * s} ${-22 * s} ${10 * s + Math.cos(ph) * 6} ${-34 * s} ${4 * s} ${-52 * s}" fill="none" stroke="${SZ.dust}" stroke-width="${9 * s}" stroke-linecap="round" opacity="${0.75 * o}"/>`;
// はじける ぎざぎざ
function burst(r1, r2, n = 14, fill = '#fff', stroke = SZ.out, sw = 10) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r1 : r2; p.push(`${(Math.cos(a) * r * 1.5).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`); }
  return `<polygon points="${p.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}
const okMark = (s = 1) => `<g transform="scale(${s})"><circle r="40" fill="none" stroke="${C.red}" stroke-width="12"/></g>`;

// ---------- からだの よこの だんめん（みぎむき）----------
// あたまの まんなかは (110,62)、はなの さきは (168,64)、はなの あな (160,67)、はい (98,166)(134,166)、おうかくまく y≒197。
// lung：はいの ふくらみ 0〜1 ／ palate：のどちんこが さがる 0〜1 ／ glot：のどの すきまが ひらく 0〜1
// brain：のうを みせる 0〜1 ／ med：えんずいの ひかり ／ nerve：みはりやくの しんけい 0〜1 ／ nglow：しんけいの ひかり
const SB_OUT = 'M62 68C58 30 84 14 110 14C138 14 156 30 158 52L168 64L158 70C158 78 156 82 152 84C154 90 152 98 144 100L132 104L130 124H180C196 124 206 136 206 152V290H34V152C34 136 44 124 60 124H90L88 102C72 96 64 84 62 68Z';
const SB_HAIR = 'M62 68C58 30 84 14 110 14C134 14 150 26 156 42C140 30 120 28 100 32C84 36 74 50 72 68Z';
const SB_NASAL = 'M160 66C150 56 130 54 118 58L114 68C128 70 148 72 160 68Z';
const SB_MOUTH = 'M150 84C140 80 128 79 118 82L118 88C128 90 142 90 150 86Z';
const SB_AIR = 'M116 61C108 65 106 80 108 96V132';
const NV = { e1: 'M158 63C150 59 140 57 130 57', e2: 'M159 68C150 67 140 66 130 61', e3: 'M148 71C140 70 134 67 130 61', trunk: 'M130 59C122 52 112 46 104 50C100 52 98 54 97 57' };
const NV_PTS = [[159, 68], [145, 66.3], [130, 60], [121, 51.5], [110, 47.5], [102, 51], [97, 57]];
const IN_NOSE = [[204, 60], [176, 65], [160, 67], [140, 64], [122, 61], [112, 66], [107.5, 82], [108, 110], [108, 130]];
const IN_MOUTH = [[200, 92], [166, 88], [150, 85], [130, 84.5], [116, 86], [108.5, 96], [108, 130]];
const OUT_NOSE = [[108, 132], [108, 110], [107.5, 82], [112, 66], [122, 61], [140, 64], [160, 67], [176, 65]];
function sbody({ lung = 0, palate = 0, glot = 0, brain = 0, med = 0, nerve = 0, nglow = 0, trunk = false, nw = 1, eye = 'open', mouth = 0, inner = 1, lw = 1.3, shirt = SZ.shirt } = {}) {
  const st = `fill="none" stroke="${SZ.line}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"`;
  let s = `<path d="${SB_OUT}" fill="${SZ.skin}"/>`;
  s += `<path d="M60 124H180C196 124 206 136 206 152V290H34V152C34 136 44 124 60 124Z" fill="${shirt}"/><path d="M90 123H130L129 130Q110 138 91 130Z" fill="${SZ.skin}"/>`;
  if (inner) s += `<rect x="50" y="134" width="140" height="82" rx="22" fill="#fff6ee" opacity="0.94"/>`;
  s += `<path d="${SB_OUT}" ${st}/><path d="${SB_HAIR}" fill="${SZ.hair}"/>`;
  if (inner) {
    s += `<path d="${SB_NASAL}" fill="${SZ.cav}"/><path d="${SB_NASAL}" ${st}/>`;
    s += `<path d="${SB_MOUTH}" fill="#f3c9c0"/><path d="${SB_MOUTH}" ${st}/>`;
    s += `<path d="${SB_AIR}" fill="none" stroke="#d9a79a" stroke-width="10" stroke-linecap="round"/><path d="${SB_AIR}" fill="none" stroke="${SZ.cav}" stroke-width="6.5" stroke-linecap="round"/>`;
    s += `<path d="M108 130L97 146M108 130L121 146" fill="none" stroke="#d9a79a" stroke-width="7.5" stroke-linecap="round"/><path d="M108 130L97 146M108 130L121 146" fill="none" stroke="${SZ.cav}" stroke-width="4.5" stroke-linecap="round"/>`;
    const rx = lerp(17, 21, lung), ry = lerp(27, 35, lung), cy = lerp(167, 169, lung), dx = lung * 4;
    s += `<ellipse cx="${98 - dx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SZ.lung}" stroke="#d9838d" stroke-width="${lw}"/><ellipse cx="${134 + dx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SZ.lung}" stroke="#d9838d" stroke-width="${lw}"/>`;
    const dy = lerp(198, 208, lung), dc = lerp(22, 11, lung);
    s += `<path d="M52 ${dy}C84 ${dy - dc} 156 ${dy - dc} 188 ${dy}" fill="none" stroke="#b0633f" stroke-width="4.5" stroke-linecap="round"/>`;
    s += glot < 0.5 ? `<path d="M102.5 114H113.5" stroke="#8a5a40" stroke-width="3.2" stroke-linecap="round"/>` : `<path d="M101 114H103.6M112.4 114H115" stroke="${SZ.out}" stroke-width="3.2" stroke-linecap="round"/>`;
    const px = lerp(118, 110.5, palate), py = lerp(80, 85, palate);
    s += `<path d="M118.5 68C${lerp(116, 114, palate)} 72 ${lerp(116, 111, palate)} 77 ${px} ${py}" fill="none" stroke="${mix('#b0633f', SZ.cmd, palate)}" stroke-width="${lerp(4, 6, palate)}" stroke-linecap="round"/>`;
  }
  if (brain > 0) {
    const BR = 'M78 40C84 24 112 18 134 28C140 40 128 52 110 52C96 54 84 52 78 40Z';
    s += `<g opacity="${brain}"><path d="${BR}" fill="${SZ.brain}"/><path d="${BR}" ${st}/><path d="M90 34q8 -8 16 0M108 30q8 -6 14 2M96 44q8 -6 16 0M116 42q6 -5 12 0" fill="none" stroke="#d98a98" stroke-width="${lw}" stroke-linecap="round"/>`;
    s += (med > 0 ? `<rect x="85" y="45" width="23" height="32" rx="10" fill="${SZ.med}" opacity="${0.5 * med}"/>` : '') + `<rect x="90" y="50" width="13" height="22" rx="6" fill="${SZ.med}" stroke="${SZ.medDk}" stroke-width="${lw}"/></g>`;
  }
  if (nerve > 0) {
    const nd = NV.e1 + NV.e2 + NV.e3 + (trunk ? NV.trunk : '');
    s += `<g opacity="${nerve}">` + (nglow > 0 ? `<path d="${nd}" fill="none" stroke="${SZ.nerve}" stroke-width="${7.5 * nw}" stroke-linecap="round" opacity="${0.5 * nglow}"/>` : '') +
      `<path d="${nd}" fill="none" stroke="${SZ.nerveDk}" stroke-width="${3.4 * nw}" stroke-linecap="round"/><path d="${nd}" fill="none" stroke="${SZ.nerve}" stroke-width="${2.2 * nw}" stroke-linecap="round"/>` +
      [[158, 63], [159, 68], [148, 71]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${2.6 * nw}" fill="${SZ.nerve}" stroke="${SZ.nerveDk}" stroke-width="${0.8 * nw}"/>`).join('') + `</g>`;
  }
  s += eye === 'squint' ? `<path d="M134 45q6 -5 11 0" ${st} stroke-width="${lw * 1.4}"/>` : `<circle cx="140" cy="44" r="${eye === 'wide' ? 3.8 : 3}" fill="${SZ.line}"/>`;
  if (mouth > 0) s += `<ellipse cx="152.5" cy="85" rx="2.4" ry="${1 + 3 * mouth}" fill="#8e3b33"/>`;
  return s;
}
const put = (P, inner, o = 1) => `<g transform="translate(${P.x} ${P.y}) scale(${P.s})" opacity="${o}">${inner}</g>`;
const at = (P, x, y) => [P.x + P.s * x, P.y + P.s * y];

// ---------- よこがお（むねから うえ、みぎむき）。(0,0) が あたまの まんなか、はなの さきは (48,0)、くちは (38,21) ----------
function shead({ hair = SZ.hair, tail = false, eye = 'open', mouth = 'flat', sleeve = false, tissue = false, hand = false, lw = 1.6, shirt = SZ.shirt } = {}) {
  const face = 'M-34-4C-36-30-16-46 6-46C28-46 42-30 42-12L48 0L42 4C42 10 41 14 37 16C39 22 36 28 28 30L16 32L14 46H-16L-18 28C-28 20-33 10-34-4Z';
  const st = `fill="none" stroke="${SZ.line}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"`;
  let s = tail ? `<path d="M-34-20c-16 0-20 16-14 30 2-10 6-16 14-18Z" fill="${hair}"/>` : '';
  s += `<path d="M-18 42H16C36 44 48 54 50 74H-52C-50 54 -38 44 -18 42Z" fill="${shirt}" stroke="${SZ.line}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path d="${face}" fill="${SZ.skin}"/><path d="${face}" ${st}/>`;
  s += `<path d="M-36-2C-40-34-14-50 8-50C30-50 46-34 42-16C34-30 18-36 2-34C-12-32-20-20-22-2Z" fill="${hair}"/>`;
  s += eye === 'squint' ? `<path d="M20-12q6-5 11 0" ${st} stroke-width="${lw * 1.3}"/>` : `<circle cx="26" cy="-12" r="${eye === 'wide' ? 3.4 : 2.8}" fill="${SZ.line}"/>`;
  s += mouth === 'open' ? `<ellipse cx="34.5" cy="21.5" rx="4.6" ry="4.4" fill="#8e3b33"/>` : mouth === 'o' ? `<ellipse cx="35.5" cy="21.5" rx="3" ry="3.2" fill="#8e3b33"/>` : `<path d="M31.5 21.5h5" ${st}/>`;
  s += `<ellipse cx="-10" cy="2" rx="6" ry="9" fill="${SZ.skin}" stroke="${SZ.line}" stroke-width="${lw}"/><circle cx="24" cy="6" r="6" fill="#f2a99a" opacity="0.55"/>`;
  if (sleeve) s += `<path d="M2 78C16 54 32 28 50 12C58 6 68 14 64 24C54 44 42 62 34 78Z" fill="#6f9fd0" stroke="${SZ.line}" stroke-width="${lw}" stroke-linejoin="round"/><path d="M46 16C52 12 60 16 60 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>`;
  if (tissue) s += `<path d="M32 -4L60 -8L64 34L34 34Z" fill="#fff" stroke="${SZ.line}" stroke-width="${lw}" stroke-linejoin="round"/><path d="M40 4L56 2M40 14L58 12" stroke="#d6dde2" stroke-width="2" stroke-linecap="round"/><ellipse cx="54" cy="40" rx="9" ry="7" fill="${SZ.skin}" stroke="${SZ.line}" stroke-width="${lw}"/>`;
  if (hand) s += `<ellipse cx="50" cy="12" rx="10" ry="16" fill="${SZ.skin}" stroke="${SZ.line}" stroke-width="${lw}"/><path d="M50 28L44 60" stroke="${SZ.skin}" stroke-width="13" stroke-linecap="round"/>`;
  return s;
}
// はなから でる いきおいの せん（(0,0) から みぎへ）
const blastLines = (k, col = SZ.out, len = 260, w = 12) => k <= 0 ? '' : [-0.26, -0.09, 0.09, 0.26].map((a, i) => { const l = len * (i % 3 ? 1 : 0.8) * eo(k); return `<line x1="${Math.cos(a) * 20}" y1="${Math.sin(a) * 20}" x2="${Math.cos(a) * (20 + l)}" y2="${Math.sin(a) * (20 + l)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; }).join('');

// ---------- 1. つかみ：はなが ムズムズ、はっ はっ ハクション！ ----------
const roomBg = () => `<rect width="1920" height="1080" fill="#fbefd9"/><rect y="806" width="1920" height="274" fill="#e9cfa6"/><rect y="798" width="1920" height="14" fill="#d9b98a"/>`;
const windowPic = (x, y, w, h) => `<rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 32}" rx="12" fill="#fff" stroke="#d9b98a" stroke-width="6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe3f7"/>` +
  `<circle cx="${x + w * 0.72}" cy="${y + h * 0.3}" r="${w * 0.13}" fill="#fff3b8"/>` + cloud(x + w * 0.32, y + h * 0.66, w / 520, '#fff', 0.95) +
  `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#fff" stroke-width="12"/><line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#fff" stroke-width="12"/>`;
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1;
    const KX = 900, KY = 910, KS = 1.1, NX = KX, NY = KY - 338 * KS;   // はなの あたり
    let out = roomBg() + `<polygon points="150,150 530,150 1250,806 560,806" fill="#fff3b8" opacity="0.5"/>` + windowPic(150, 150, 380, 330);
    // くしゃみの しゅんかん
    const f1 = (t - c1) / d1, sn = c1 + d1 * 0.6, imp = t > sn ? Math.exp(-(t - sn) * 1.6) : 0;
    // ひかりの なかを ただよう ほこり
    for (let i = 0; i < 26; i++) {
      const u = rnd(i, 61), v = rnd(i, 62), bx = lerp(lerp(150, 530, u), lerp(560, 1250, u), v), by = lerp(150, 806, v);
      const x = bx + Math.sin(t * 0.5 + i * 1.3) * 22 + imp * (260 + rnd(i, 63) * 300), y = by + Math.cos(t * 0.4 + i) * 16 - imp * 60;
      out += dustDot(x, y, 4 + rnd(i, 64) * 4, 0.55 * (1 - imp * 0.8));
    }
    // はなへ ちかづく ほこり 3つ
    [[620, 420], [1130, 380], [700, 620]].forEach(([sx, sy], i) => {
      const k = eio(prog(t, c0 - 0.4 + i * 0.25, d0 * 0.8));
      if (t < sn) out += dustDot(lerp(sx, NX - 14 + i * 14, k) + Math.sin(t * 5 + i) * 8 * (1 - k * 0.5), lerp(sy, NY + 6, k) + Math.cos(t * 4 + i) * 6, 7, 0.9);
      else { const a = t - sn; out += dustDot(NX + 60 + a * (700 + i * 160), NY + 20 + (i - 1) * 50 * a + a * a * 80, 7, clamp(1 - a / 1.4)); }
    });
    // おねえちゃん
    const muz = t >= c0 + d0 * 0.2 && t < c1, ha1 = f1 >= 0 && f1 < 0.3, ha2 = f1 >= 0.3 && f1 < 0.6, hx = t >= sn && t < sn + 0.9;
    const rot = hx ? lerp(11, 0, eo(prog(t, sn + 0.25, 0.6))) * eo(prog(t, sn, 0.1)) : ha2 ? -8 * eo(prog(t, c1 + d1 * 0.3, 0.2)) : ha1 ? -4 * eo(prog(t, c1, 0.2)) : 0;
    const kid = kidShow('S', t, KX, KY, { s: KS, start: 0, n: 0, enter: 'pop', eyes: hx ? 'closed' : (ha1 || ha2) ? 'wide' : muz ? 'open' : null, mouth: hx ? 'open' : (ha1 || ha2) ? 'o' : muz ? 'flat' : null, look: muz ? [0, 7] : [0, 0] });
    out += `<g transform="rotate(${rot.toFixed(2)} ${KX} ${KY})">${kid}</g>`;
    // ムズムズ
    const mo = win(t, c0 + d0 * 0.2, c1 + 0.1, 0.25);
    if (mo > 0) {
      out += g([-1, 1].map(sd => `<path d="M ${sd * 26} -6 q ${sd * 8} ${-8 + Math.sin(t * 22) * 4} ${sd * 16} 0 q ${sd * 8} ${8 + Math.sin(t * 22 + 1) * 4} ${sd * 16} 0" fill="none" stroke="${SZ.cmd}" stroke-width="6" stroke-linecap="round"/>`).join(''), { x: NX, y: NY + 6, o: mo });
      out += g(olText(0, 0, 'ムズムズ…', { size: 86, fill: SZ.cmd, ol: '#fff', sw: 16 }), { x: 1330, y: 470, o: mo, r: Math.sin(t * 16) * 2.5 });
    }
    // はっ、はっ
    [[0, 1240, 430, 96], [0.3, 1420, 330, 120]].forEach(([fr, x, y, size]) => { const st = c1 + d1 * fr; out += pop(olText(0, 0, 'はっ', { size, fill: SZ.in, ol: '#fff', sw: 16 }), t, st, x, y, { d: 0.3, end: sn + 0.05 }); });
    // ハクション！
    const bk = prog(t, sn, 0.25), bo = Math.min(bk * 4, 1 - prog(t, cueE(1) + 0.1, 0.3));
    if (bo > 0) {
      out += g(blastLines(bk, SZ.out, 220, 14), { x: NX + 110, y: NY + 30, o: bo });
      out += g(burst(190, 250) + olText(0, 8, 'ハクション！', { size: 86, fill: SZ.out, ol: '#fff', sw: 8 }), { x: 1440, y: 440, s: Math.max(back(bk), 0.001) * (1 + Math.sin(t * 30) * 0.012), o: bo });
    }
    // かってに でる
    out += pop(badge('とめようと しても、かってに でる', { fill: C.blueUi, size: 42 }), t, cue(3) + d0 * 0.4, 1500, 520, { end: cueE(4) + 0.6 });
    out += pop(olText(0, 0, 'どうして？', { size: 130, fill: C.ochre, ol: '#fff', sw: 20 }), t, cue(4) + 0.6, 1480, 320, { end: cueE(4) + 0.6 });
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 240);
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${SZ.outDk}">くしゃみ</tspan>は、</text>`, { x: 960, y: 420, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="150" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.blueUi}">出る</tspan>の？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(olText(0, 0, 'はっ', { size: 64, fill: SZ.in, ol: '#fff', sw: 12 }), t, t0 + 1.7, 620, 850) + pop(olText(0, 0, 'はっ', { size: 76, fill: SZ.in, ol: '#fff', sw: 12 }), t, t0 + 1.85, 800, 840);
      out += pop(burst(74, 104, 12, '#fff', SZ.out, 7) + olText(0, 4, 'ハクション！', { size: 42, fill: SZ.out, ol: '#fff', sw: 4 }), t, t0 + 2.0, 1180, 840);
    }
    return out;
  },
});

// ---------- 2. 予想 ----------
const noseIc = () => `<path d="M -34 -52 Q -4 -40 22 8 Q 34 30 10 36 Q -14 40 -36 32 Z" fill="${SZ.skin}" stroke="${SZ.line}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="6" cy="24" rx="9" ry="5" fill="${SZ.line}" opacity="0.6"/>`;
const GUESS_ICON = [
  // じゃまものを おいだす
  () => g(noseIc(), { x: -28 }) + arrow(4, 26, 58, 34, SZ.out, 8) + dustDot(44, 8, 6) + dustDot(60, 52, 5) + dustDot(30, 54, 4),
  // くうきを いれかえる
  () => `<ellipse cx="-22" cy="6" rx="20" ry="32" fill="${SZ.lung}" stroke="#d9838d" stroke-width="4"/><ellipse cx="22" cy="6" rx="20" ry="32" fill="${SZ.lung}" stroke="#d9838d" stroke-width="4"/><path d="M 0 -50 V -22 M 0 -22 L -12 -8 M 0 -22 L 12 -8" fill="none" stroke="#d9838d" stroke-width="6" stroke-linecap="round"/>` + arrow(-52, -44, -52, 30, SZ.in, 7) + arrow(52, 30, 52, -44, SZ.out, 7),
  // あたためる
  () => g(noseIc(), { x: -30 }) + [0, 1, 2].map(i => `<path d="M ${12 + i * 20} 36 q -10 -16 0 -32 q 10 -16 0 -32" fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/>`).join(''),
];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    const c0 = cue(0), d0 = cueE(0) - c0, q0 = c0 + d0 * 0.3;
    out += pop(text(0, 0, 'よそうして みよう', { size: 70, w: 900 }), t, 0.3, 960, 210, { end: q0 });
    out += pop(text(0, 0, 'くしゃみは、どうして でるの？', { size: 64, w: 900 }), t, q0 + 0.1, 960, 210);
    const opts = [['①', 'はなに はいった じゃまものを、おいだす ため'], ['②', 'からだの なかの くうきを、いれかえる ため'], ['③', 'はなの なかを、あたためる ため']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-650" y="-76" width="1300" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1280, 132) +
        `<circle cx="-550" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-550, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-480, 2, s, { size: 42, w: 700, anchor: 'start' }) + g(GUESS_ICON[i](), { x: 548, y: 0, s: 0.9 }), t, cue(i + 1) - 0.2, 850, 400 + i * 164);
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

// ---------- 3. はなの なかの みはりやく ----------
// はなの なかに とまる ほこりの ばしょ（だんめんの ざひょう）
const STUCK = [[151, 66.5], [142, 64.5], [134, 63], [146, 68.5], [138, 66.5], [129, 61.5]];
const trigCard = (label, icon) => card(240, 220) + icon + text(0, 76, label, { size: 42, w: 900 });
SCENES.push({
  id: 'guard',
  draw(t) {
    const P = { x: -396, y: 30, s: 8 };
    const c0 = cue(0), c1 = cue(1), d1 = cueE(1) - c1, c3 = cue(3), d3 = cueE(3) - c3;
    let out = PAPER + topBadge();
    const hit = c1 + d1 * 0.62, hit2 = c3 + d3 * 0.45;
    const fl = h => t > h ? clamp(1 - (t - h - 2.2) / 0.8) * (0.55 + 0.45 * Math.sin((t - h) * 11)) : 0;
    const base = prog(t, c0 + 0.6, 0.5) * (0.25 + 0.15 * Math.sin(t * 3));
    const ng = Math.max(base, fl(hit), fl(hit2));
    const startle = (t > hit && t < hit + 1.6) || (t > hit2 && t < hit2 + 1.6);
    out += put(P, sbody({ nerve: prog(t, c0 + 0.6, 0.5), nglow: ng, nw: 0.5, eye: startle ? 'wide' : 'open' }));
    // なまえ
    const [nx, ny] = at(P, 132, 59);
    out += pointer(1090, 206, nx, ny, SZ.nerveDk, prog(t, c0 + 1.2, 0.3));
    out += pop(badge('みはりやくの しんけい', { fill: SZ.nerveDk, size: 46 }), t, c0 + 1.0, 1380, 176);
    const [cx0, cy0] = at(P, 152, 68.5), lo0 = win(t, c0 + 0.3, c1 + 0.2, 0.3);
    out += pointer(1020, 680, cx0, cy0, C.blueUi, lo0) + g(text(1040, 682, 'はなの なか', { size: 44, w: 900, fill: C.blueUi, anchor: 'start' }), { o: lo0 });
    // きっかけ：ほこり・かふん・けむり
    const cards = [
      ['ほこり', [[-50, -44], [-10, -62], [36, -40], [-28, -14], [14, -22], [58, -66]].map(([x, y], i) => dustDot(x, y, 8 + (i % 3) * 2)).join(''), 1130],
      ['かふん', pollenDot(-42, -42, 15) + pollenDot(10, -58, 18) + pollenDot(46, -22, 13) + pollenDot(-8, -14, 11), 1400],
      ['けむり', smokeWisp(-44, 34, 0.85, t * 2) + smokeWisp(0, 34, 0.95, t * 2 + 1) + smokeWisp(44, 34, 0.75, t * 2 + 2), 1670],
    ];
    const cO = 1 - prog(t, c3 - 0.5, 0.4);
    const [hx, hy] = at(P, 160, 67);
    cards.forEach(([label, icon, cdx], i) => {
      const st = c1 + d1 * (0.02 + i * 0.16);
      out += g(pop(trigCard(label, icon), t, st, cdx, 356), { o: cO });
      // カードから はなへ とぶ つぶ
      for (let j = 0; j < 2; j++) {
        const n = i * 2 + j, st2 = st + 0.5 + j * 0.2, k = eio(prog(t, st2, Math.max(0.4, hit - st2)));
        if (k <= 0) continue;
        const [sx, sy] = at(P, STUCK[n][0], STUCK[n][1]);
        const k2 = eo(prog(t, hit, 0.5));
        const x = k < 1 ? lerp(cdx + (j ? 30 : -30), hx + 30, k) : lerp(hx + 30, sx, k2), y = k < 1 ? lerp(330, hy, k) - Math.sin(k * Math.PI) * 60 : lerp(hy, sy, k2);
        const jig = k2 >= 1 ? Math.sin(t * 9 + n) * 2 : 0;
        out += i === 1 ? pollenDot(x + jig, y, 9) : dustDot(x + jig, y, i === 2 ? 6 : 8, i === 2 ? 0.7 : 1);
      }
    });
    // きづいた！
    out += pop(burst(96, 132, 12, '#fff8d8', SZ.nerveDk, 7) + text(0, 4, 'きづいた！', { size: 44, w: 900, fill: SZ.nerveDk }), t, hit + 0.15, 1100, 660, { end: c3 - 0.2 });
    // カメレオン
    out += kidShow('K', t, 1690, 850, { s: 0.7, start: cue(2) - 0.9, n: 0, enter: 'slideR' });
    // つめたい くうき
    const co = prog(t, c3 - 0.1, 0.4);
    if (co > 0) {
      let c = card(700, 220);
      c += [0, 1, 2].map(i => arrow(250, -50 + i * 42, -230 + i * 30, -50 + i * 42, SZ.in, 12, eo(prog(t, c3 + 0.2 + i * 0.15, 0.6)))).join('');
      c += text(0, 74, 'きゅうに すった つめたい くうき', { size: 40, w: 900, fill: SZ.inDk });
      out += g(c, { x: 1400, y: 356, o: co });
      // はなへ ながれこむ あおい つぶ
      const pts = [[1040, 470], [960, 540], [hx + 20, hy], at(P, 150, 66), at(P, 136, 63.5), at(P, 122, 61)];
      out += flow(pts, t - c3, { col: SZ.in, n: 9, sp: 0.5, r: 11, o: co });
      out += pop(burst(96, 132, 12, '#fff8d8', SZ.nerveDk, 7) + text(0, 4, 'きづいた！', { size: 44, w: 900, fill: SZ.nerveDk }), t, hit2 + 0.15, 1100, 660);
    }
    return out;
  },
});

// ---------- 4. しらせは のうの おくの「えんずい」へ ----------
const CMD = [
  [[99, 72], [100, 92], [104, 112]],                       // のど
  [[97, 72], [99, 100], [118, 126], [150, 134], [165, 152]], // むね
  [[94, 72], [90, 104], [64, 134], [58, 180], [66, 198]],   // おなか（おうかくまく）
];
const dashLine = (P, pts, col, k, t) => {
  if (k <= 0) return '';
  const q = []; const N = 24;
  for (let i = 0; i <= N * k; i++) { const [x, y] = along(pts, i / N); q.push(at(P, x, y).map(v => v.toFixed(1)).join(' ')); }
  return q.length < 2 ? '' : `<path d="M ${q.join(' L ')}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="20 16" stroke-dashoffset="${(-t * 60).toFixed(1)}"/>`;
};
SCENES.push({
  id: 'brain',
  draw(t) {
    const P = { x: 190, y: 56, s: 3.5 };
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2, c3 = cue(3), d3 = cueE(3) - c3;
    let out = PAPER + topBadge();
    const sig = t > c0 + 0.3;
    const medOn = t > c1 + d1 * 0.4 ? 0.6 + 0.4 * Math.sin(t * 6) : 0;
    out += put(P, sbody({ brain: prog(t, 0.2, 0.5), med: medOn, nerve: 1, trunk: true, nw: 0.8, nglow: sig ? 0.5 + 0.4 * Math.sin(t * 8) : 0.2 }));
    // はなの なかの じゃまもの
    STUCK.slice(0, 4).forEach(([x, y], i) => { const [sx, sy] = at(P, x, y); out += dustDot(sx + Math.sin(t * 9 + i) * 1.5, sy, 4.5); });
    // しらせの つぶ
    if (sig) for (let i = 0; i < 3; i++) {
      const f = (((t - c0 - 0.3) * 0.55 + i / 3) % 1), [x, y] = at(P, ...along(NV_PTS, f));
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" fill="${SZ.nerve}" opacity="0.45" filter="url(#soft)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#fff" stroke="${SZ.nerveDk}" stroke-width="4"/>`;
    }
    // 「じゃまものが きた！」
    const [nx, ny] = at(P, 163, 66);
    const bo = win(t, c0 + d0 * 0.3, c2 - 0.2, 0.3);
    if (bo > 0) {
      const w = 620, h = 130, bx = 1330, by = 250;
      out += g(`<g filter="url(#shadow)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="54" fill="#fff8d8" stroke="${SZ.nerveDk}" stroke-width="6"/></g><path d="M ${-w / 2 + 6} 10 L ${nx + 40 - bx} ${ny - by} L ${-w / 2 + 6} 44 Z" fill="#fff8d8" stroke="${SZ.nerveDk}" stroke-width="6" stroke-linejoin="round"/><rect x="${-w / 2 + 3}" y="4" width="14" height="46" fill="#fff8d8"/>` +
        text(0, 3, 'じゃまものが きた！', { size: 52, w: 900, fill: SZ.nerveDk }), { x: bx, y: by, o: bo, s: lerp(0.9, 1, eo(prog(t, c0 + d0 * 0.3, 0.3))) });
    }
    out += pop(badge('しらせ', { fill: SZ.nerveDk, size: 42 }), t, c0 + d0 * 0.55, 1330, 400, { end: c2 - 0.2 });
    out += g(arrow(1220, 400, 1040, 400, SZ.nerve, 12), { o: win(t, c0 + d0 * 0.6, c2 - 0.2, 0.3) }) + g(text(960, 402, 'のうへ', { size: 40, w: 900, fill: SZ.nerveDk }), { o: win(t, c0 + d0 * 0.6, c2 - 0.2, 0.3) });
    // えんずい
    const [mx, my] = at(P, 91, 61);
    const mo = prog(t, c1 + d1 * 0.4, 0.3);
    out += pointer(250, 330, mx, my, SZ.medDk, mo);
    out += pop(badge('えんずい', { fill: SZ.medDk, size: 54, pad: 40 }), t, c1 + d1 * 0.4, 210, 300);
    out += g(text(210, 388, 'のうの したの ほう', { size: 36, w: 900, fill: SZ.medDk }), { o: prog(t, c1 + d1 * 0.6, 0.3) });
    // めいれい
    const lab = [['のど', 1060, 0, 1], ['むね', 1060, 0, 1], ['おなか', 190, -30, -1]];
    CMD.forEach((pts, i) => {
      const st = c2 + d2 * (0.12 + i * 0.2), k = eo(prog(t, st, 0.7));
      out += dashLine(P, pts, SZ.cmd, k, t);
      const [ex, ey] = at(P, ...pts[pts.length - 1]);
      if (k >= 1) { const pu = ((t - st) * 1.2) % 1; out += `<circle cx="${ex}" cy="${ey}" r="${14 + 30 * pu}" fill="none" stroke="${SZ.cmd}" stroke-width="6" opacity="${1 - pu}"/><circle cx="${ex}" cy="${ey}" r="11" fill="${SZ.cmd}"/>`; }
      const [name, tx, tdy, sd] = lab[i], ty = ey + tdy, lo = prog(t, st + 0.5, 0.3);
      out += pointer(tx - sd * 70, ty, ex + sd * 16, ey, C.ink, lo) + g(text(tx - sd * 50, ty + 2, name, { size: 46, w: 900, anchor: sd > 0 ? 'start' : 'end' }), { o: lo });
    });
    out += pop(badge('きんにくに めいれい', { fill: SZ.cmd, size: 46 }), t, c2 + d2 * 0.1, 1500, 640, { end: 1e9 });
    // はんしゃ
    out += pop(badge('はんしゃ', { fill: C.accent, size: 72, pad: 54 }), t, c3 + d3 * 0.45, 1450, 250);
    out += g(text(1450, 368, 'かんがえる まえに、', { size: 44, w: 900 }) + text(1450, 432, 'からだが かってに うごく', { size: 44, w: 900 }), { o: prog(t, c3 + 0.2, 0.4) });
    return out;
  },
});

// ---------- 5. すう・ためる・ドカン ----------
const stepChip = (n, label, col, on) => `<g opacity="${on ? 1 : 0.4}"><rect x="-125" y="-48" width="250" height="96" rx="48" fill="${on ? col : '#fff'}" stroke="${col}" stroke-width="6"/><circle cx="-80" cy="0" r="30" fill="${on ? '#fff' : col}"/>${text(-80, 3, n, { size: 40, w: 900, fill: on ? col : '#fff' })}${text(28, 3, label, { size: 44, w: 900, fill: on ? '#fff' : col })}</g>`;
SCENES.push({
  id: 'steps',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, s1 = cue(1), d1 = cueE(1) - s1, s2 = cue(3), d2 = cueE(3) - s2, s3 = cue(4), d3 = cueE(4) - s3;
    const boom = s3 + d3 * 0.5;
    const shake = t > boom ? Math.sin((t - boom) * 40) * 8 * Math.exp(-(t - boom) * 5) : 0;
    const P = { x: 150 + shake, y: 56, s: 3.5 };
    let out = PAPER + topBadge();
    const step = t >= s3 ? 3 : t >= s2 ? 2 : t >= s1 ? 1 : 0;
    const lung = eio(prog(t, s1 + d1 * 0.25, 2.4)) * (1 - eo(prog(t, boom, 0.3)));
    const pal = eio(prog(t, s2 + d2 * 0.3, 0.8)) * (1 - prog(t, boom - 0.2, 0.2));
    const glot = prog(t, boom - 0.1, 0.1);
    const inh = win(t, s1 + d1 * 0.2, s2 - 0.2, 0.4), exh = t > boom ? clamp(1 - (t - boom - 1.6) / 0.6) : 0;
    out += put(P, sbody({ lung, palate: pal, glot, mouth: inh > 0.3 ? 0.8 : exh > 0.3 ? 1 : 0, eye: exh > 0.3 ? 'squint' : inh > 0.3 ? 'wide' : 'open' }));
    // はなの なかの じゃまもの（ドカンで とびだす）
    const [tx0, ty0] = at(P, 170, 65);
    STUCK.slice(0, 4).forEach(([x, y], i) => {
      const [sx, sy] = at(P, x, y);
      if (t < boom) out += dustDot(sx + Math.sin(t * 9 + i) * 1.5, sy, 4.5);
      else { const a = t - boom; out += dustDot(tx0 + 40 + a * (520 + i * 130), ty0 + (i - 1.5) * 46 * a + a * a * 60, 9, clamp(1 - (a - 1.2) / 0.5)); }
    });
    // じゅんばんの ふだ
    [['1', 'すう', SZ.in], ['2', 'ためる', SZ.cmd], ['3', 'ドカン', SZ.out]].forEach(([n, label, col], i) => {
      out += pop(stepChip(n, label, col, step === 0 || step === i + 1), t, c0 + d0 * (0.3 + i * 0.25), 1130 + i * 270, 190);
      if (i < 2) out += g(arrow(1130 + i * 270 + 130, 190, 1130 + i * 270 + 142, 190, C.muted, 8), { o: prog(t, c0 + d0 * (0.45 + i * 0.25), 0.3) });
    });
    // 1 すう
    if (inh > 0) {
      const pk = (t - s1) % 1e9;
      out += put(P, flow(IN_NOSE, pk, { col: SZ.in, n: 7, sp: 0.55, r: 2.9, o: inh }) + flow(IN_MOUTH, pk + 0.3, { col: SZ.in, n: 5, sp: 0.55, r: 2.6, o: inh }) +
        flow([[108, 130], [98, 148], [96, 164]], pk, { col: SZ.in, n: 3, sp: 0.9, r: 2.4, o: inh }) + flow([[108, 130], [121, 148], [136, 164]], pk + 0.2, { col: SZ.in, n: 3, sp: 0.9, r: 2.4, o: inh }));
      const [ax, ay] = at(P, 206, 58), [bx, by] = at(P, 176, 64);
      out += arrow(ax + 40, ay - 8, bx + 10, by, SZ.in, 13, 1, inh);
    }
    const o1 = win(t, s1 + d1 * 0.3, s2 - 0.3, 0.3);
    if (o1 > 0) {
      const [dx, dy] = at(P, 188, lerp(198, 208, lung)), [lx, ly] = at(P, 150, 166);
      out += pointer(1040, 770, dx + 6, dy, C.ink, o1) + g(text(1060, 772, 'おうかくまく', { size: 44, w: 900, anchor: 'start', fill: '#8a4a2c' }), { o: o1 });
      out += pointer(1040, 670, lx, ly, C.ink, o1) + g(text(1060, 672, 'はい（ふくらむ）', { size: 44, w: 900, anchor: 'start', fill: '#b85a68' }), { o: o1 });
      const [qx, qy] = at(P, 116, 190);
      out += arrow(qx, qy - 12, qx, qy + 52, '#8a4a2c', 10, eo(prog(t, s1 + d1 * 0.35, 0.8)), o1);
      out += g(text(1400, 310, 'きんにくが ちぢんで', { size: 46, w: 900 }) + text(1400, 376, 'くうきを たくさん すいこむ', { size: 46, w: 900, fill: SZ.inDk }), { o: o1 });
    }
    // おとうと「はっ… はっ…」
    out += kidShow('B', t, 1560, 850, { s: 0.62, start: cue(2) - 0.9, n: 0, end: s2 + d2 * 0.2 });
    // 2 ためる：のどちんこの ところを おおきく
    const o2 = win(t, s2 + d2 * 0.25, s3 - 0.2, 0.3);
    if (o2 > 0) {
      const [rx, ry] = at(P, 113, 77), ZC = [1440, 520], ZR = 205, ZS = 9.5;
      out += `<g opacity="${o2}"><circle cx="${rx}" cy="${ry}" r="58" fill="none" stroke="${SZ.cmd}" stroke-width="6" stroke-dasharray="12 9"/><line x1="${rx + 54}" y1="${ry - 20}" x2="${ZC[0] - ZR + 14}" y2="${ZC[1] - 40}" stroke="${SZ.cmd}" stroke-width="5" stroke-dasharray="12 9"/>` +
        `<clipPath id="zcl"><circle cx="${ZC[0]}" cy="${ZC[1]}" r="${ZR}"/></clipPath><circle cx="${ZC[0]}" cy="${ZC[1]}" r="${ZR}" fill="#fff"/><g clip-path="url(#zcl)">${put({ x: ZC[0] - 118 * ZS, y: ZC[1] - 75 * ZS, s: ZS }, sbody({ lung, palate: pal, lw: 0.6 }))}</g>` +
        `<circle cx="${ZC[0]}" cy="${ZC[1]}" r="${ZR}" fill="none" stroke="${SZ.cmd}" stroke-width="10"/></g>`;
      const lo = o2 * prog(t, s2 + d2 * 0.45, 0.3);
      out += g(olText(ZC[0] + 92, ZC[1] - 112, 'はなの おく', { size: 34, fill: C.blueUi, ol: '#fff', sw: 8 }) + olText(ZC[0] + 110, ZC[1] + 106, 'くち', { size: 34, fill: '#b85a68', ol: '#fff', sw: 8 }) + olText(ZC[0] - 96, ZC[1] + 150, 'のど', { size: 34, fill: C.blueUi, ol: '#fff', sw: 8 }), { o: o2 });
      out += g(text(1440, 786, 'のどちんこが さがって、みちを ふさぐ', { size: 44, w: 900, fill: SZ.cmd }), { o: lo });
    }
    // 3 ドカン
    const o3 = prog(t, s3 + 0.2, 0.3);
    if (o3 > 0 && t < boom + 0.1) {
      const [gx, gy] = at(P, 116, 114), po = o3 * (1 - prog(t, boom - 0.2, 0.3));
      out += pointer(1040, 470, gx, gy, C.ink, po) + g(text(1060, 472, 'のどの すきまが ひらく', { size: 44, w: 900, anchor: 'start', fill: SZ.outDk }), { o: po });
    }
    if (exh > 0) {
      out += put(P, flow(OUT_NOSE, (t - boom), { col: SZ.out, n: 9, sp: 2.2, r: 3.2, o: exh }) + flow([[96, 164], [98, 148], [108, 130]], t - boom, { col: SZ.out, n: 3, sp: 2.4, r: 2.6, o: exh }) + flow([[136, 164], [121, 148], [108, 130]], t - boom + 0.2, { col: SZ.out, n: 3, sp: 2.4, r: 2.6, o: exh }));
      const bk = prog(t, boom, 0.25);
      out += g(blastLines(bk, SZ.out, 230, 14), { x: tx0 + 14, y: ty0, o: exh });
    }
    if (t > boom) {
      const bk = prog(t, boom, 0.25);
      out += g(burst(180, 240) + olText(0, 8, 'ハクション！', { size: 84, fill: SZ.out, ol: '#fff', sw: 8 }), { x: 1440, y: 500, s: Math.max(back(bk), 0.001) * (1 + Math.sin(t * 30) * 0.012 * exh), o: Math.min(1, bk * 4) });
      out += g(text(1440, 796, 'くうきが はなから いっきに でる', { size: 46, w: 900, fill: SZ.outDk }), { o: prog(t, boom + 0.5, 0.3) });
    }
    return out;
  },
});

// ---------- 6. くしゃみの いきの はやさ・しぶき・そでで おおう ----------
const rulerPic = (x0, x1, y, labels) => {
  let s = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;
  labels.forEach((lb, i) => { const x = lerp(x0, x1, i / (labels.length - 1)); s += `<line x1="${x}" y1="${y - 24}" x2="${x}" y2="${y + 24}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>` + text(x, y + 62, lb, { size: 42, w: 900, anchor: i === labels.length - 1 ? 'end' : i === 0 ? 'start' : 'middle' }); });
  return s;
};
const germ = (x, y, r = 10) => { let d = ''; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; d += `M ${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} l ${(Math.cos(a) * r * 0.6).toFixed(1)} ${(Math.sin(a) * r * 0.6).toFixed(1)} `; } return `<path d="${d}" stroke="#4f7f2a" stroke-width="${Math.max(2, r * 0.3)}" stroke-linecap="round"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#8fc45a" stroke="#4f7f2a" stroke-width="${Math.max(1.5, r * 0.2)}"/>`; };
const stopwatch = (k) => `<rect x="-12" y="-92" width="24" height="26" rx="6" fill="${C.ink}"/><circle r="66" fill="#fff" stroke="${C.ink}" stroke-width="9"/>${[0, 90, 180, 270].map(a => `<line x1="0" y1="-52" x2="0" y2="-42" stroke="${C.muted}" stroke-width="6" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}` +
  `<path d="M 0 0 L 0 -50 A 50 50 0 ${k > 0.5 ? 1 : 0} 1 ${(Math.sin(k * Math.PI * 2) * 50).toFixed(1)} ${(-Math.cos(k * Math.PI * 2) * 50).toFixed(1)} Z" fill="${SZ.out}" opacity="0.35"/>` +
  `<line x1="0" y1="0" x2="0" y2="-48" stroke="${C.red}" stroke-width="8" stroke-linecap="round" transform="rotate(${k * 360})"/><circle r="8" fill="${C.ink}"/>`;
const xMark = (s = 1, col = C.blueUi) => `<g transform="scale(${s})"><path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke="${col}" stroke-width="14" stroke-linecap="round"/></g>`;
const oMark = (s = 1, col = C.red) => `<g transform="scale(${s})"><circle r="32" fill="none" stroke="${col}" stroke-width="12"/></g>`;
SCENES.push({
  id: 'speed',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), d2 = cueE(2) - c2;
    let out = PAPER + topBadge();
    const X0 = 470, X1 = 1790, RY = 690;
    const abO = 1 - prog(t, c2 - 0.5, 0.4);
    if (abO > 0) {
      const aO = 1 - prog(t, c1 - 0.5, 0.4), bO = prog(t, c1 - 0.2, 0.4);
      // A：1びょうに 10〜30メートル（3びょうごとに くりかえす）
      const la = c0 + d0 * 0.3, u = t > la ? (t - la) % 3.2 : -1, k = u < 0 ? 0 : clamp(u / 1.0);
      // B：しぶき
      const lb = c1 + 0.4, ub = t > lb ? (t - lb) % 4.0 : -1;
      const sneezing = (aO > 0.5 && u >= 0 && u < 1.3) || (bO > 0.5 && ub >= 0 && ub < 1.0);
      let s = g(shead({ tail: true, eye: sneezing ? 'squint' : 'open', mouth: sneezing ? 'open' : 'flat' }), { x: 250, y: 440, s: 4.2 });
      if (aO > 0) {
        let a = '';
        a += g(rulerPic(X0, X1, RY, ['0', '10メートル', '20メートル', '30メートル']), {});
        if (u >= 0) {
          const fade = 1 - prog(u, 2.7, 0.4);
          a += `<g opacity="${fade}">` + arrow(X0 + 10, 440, lerp(X0 + 60, X1, k), 440, SZ.out, 26) + arrow(X0 + 10, 560, lerp(X0 + 60, lerp(X0, X1, 1 / 3), k), 560, SZ.out, 26, 1, 0.6);
          if (k >= 1) a += g(olText(0, 0, '30メートル', { size: 46, fill: SZ.outDk, ol: '#fff', sw: 10, anchor: 'end' }), { x: X1 - 10, y: 380 }) + g(olText(0, 0, '10メートル', { size: 46, fill: SZ.outDk, ol: '#fff', sw: 10, anchor: 'start' }), { x: lerp(X0, X1, 1 / 3) + 30, y: 560 });
          a += `</g>`;
        }
        a += g(stopwatch(k), { x: 590, y: 250 }) + text(590, 352, '1びょう', { size: 40, w: 900 });
        a += pop(badge('いちばん はやい とき', { fill: SZ.outDk, size: 40 }), t, c0 + d0 * 0.2, 1270, 170);
        a += pop(olText(0, 0, '1びょうに 10〜30メートル', { size: 78, fill: SZ.outDk, ol: '#fff', sw: 14 }), t, c0 + d0 * 0.45, 1270, 276);
        s += g(a, { o: aO });
      }
      if (bO > 0) {
        let b = rulerPic(X0, X1, RY, ['0', '1メートル', '2メートル']);
        const gm = prog(t, c1 + d1 * 0.5, 0.4);
        if (ub >= 0) for (let i = 0; i < 44; i++) {
          const far = Math.pow(rnd(i, 71), 0.7), tx = lerp(X0 + 40, X1 - 20, far), ty = 390 + rnd(i, 72) * 230, dl = rnd(i, 73) * 0.25, k2 = eo(clamp((ub - dl) / (0.6 + far * 0.8)));
          if (k2 <= 0) continue;
          const x = lerp(462, tx, k2), fall = Math.max(0, ub - 1.6) * (20 + rnd(i, 74) * 30), y = lerp(470, ty, k2) + fall, o = clamp(1 - (ub - 3.2) / 0.6) * Math.min(1, k2 * 5), r = 7 + rnd(i, 75) * 7;
          b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#7fbfe8" stroke="${SZ.in}" stroke-width="3" opacity="${o.toFixed(2)}"/>`;
          if (i % 5 === 0 && gm > 0) b += g(germ(x, y, 12), { o: o * gm });
        }
        b += pop(olText(0, 0, 'しぶきは 2メートルほど とぶ', { size: 74, fill: SZ.inDk, ol: '#fff', sw: 14 }), t, c1 + d1 * 0.1, 1180, 200);
        b += pop(g(germ(-330, 0, 16), {}) + badge('びょうきの もとが はいって いる ことも', { fill: '#4f7f2a', size: 40 }), t, c1 + d1 * 0.5, 1210, 310);
        s += g(b, { o: bO });
      }
      out += g(s, { o: abO });
    }
    // C：てでは なく、そでや ティッシュで
    const cO = prog(t, c2 - 0.2, 0.4);
    if (cO > 0) {
      const cards = [
        ['て', { hand: true, mouth: 'open', eye: 'squint', tail: true }, 0, 'さわった ドアノブなどに つく', 0.05],
        ['そでの うちがわ', { sleeve: true, eye: 'squint' }, 1, '', 0.38],
        ['ティッシュ', { tissue: true, eye: 'squint', tail: true }, 1, '', 0.62],
      ];
      let c = '';
      cards.forEach(([label, o, ok, sub, fr], i) => {
        const st = c2 + d2 * fr;
        let cd = card(500, 560) + g(shead(o), { x: -40, y: -90, s: 3 });
        if (!ok) cd += germ(96, -70, 9) + germ(126, -40, 8) + germ(108, -18, 7) + arrow(140, 0, 176, 44, '#4f7f2a', 7) + `<g transform="translate(196 104)"><rect x="-14" y="-52" width="28" height="104" rx="8" fill="#c9cdd2" stroke="${SZ.line}" stroke-width="4"/><circle cx="-36" cy="0" r="24" fill="#e2c24a" stroke="${SZ.line}" stroke-width="4"/>${germ(-44, -12, 7)}${germ(-28, 10, 6)}</g>`;
        cd += text(0, sub ? 176 : 196, label, { size: 50, w: 900 }) + (sub ? text(0, 236, sub, { size: 34, w: 900, fill: '#4f7f2a' }) : '');
        cd += g(ok ? oMark(1.4) : xMark(1.4), { x: 178, y: -208, o: prog(t, st + 0.5, 0.2), s: lerp(1.5, 1, eo(prog(t, st + 0.5, 0.3))) });
        c += pop(cd, t, st, 380 + i * 580, 500);
      });
      c += pop(badge('くちと はなを おおう', { fill: C.accent, size: 46 }), t, c2 + d2 * 0.75, 1250, 150);
      out += g(c, { o: cO });
    }
    return out;
  },
});

// ---------- 7. はなの なかの「リセット」／まぶしい ひかり ----------
const switchPic = (on) => `<rect x="-100" y="-46" width="200" height="92" rx="46" fill="${mix('#b9c0c4', '#36b24a', on)}" stroke="${C.ink}" stroke-width="6"/><circle cx="${lerp(-54, 54, on)}" cy="0" r="36" fill="#fff" stroke="${C.ink}" stroke-width="6"/>`;
const sunPic = (r, t) => `<circle r="${r * 1.9}" fill="#ffd94a" opacity="0.35" filter="url(#glow)"/>` + Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${-r - 22}" x2="0" y2="${-r - 62 - (i % 2) * 22}" stroke="#f6b500" stroke-width="12" stroke-linecap="round" transform="rotate(${i * 30 + t * 14})"/>`).join('') + `<circle r="${r}" fill="#ffd94a" stroke="#f6b500" stroke-width="8"/>`;
SCENES.push({
  id: 'reset',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, c1 = cue(1), d1 = cueE(1) - c1, c2 = cue(2), c3 = cue(3), d3 = cueE(3) - c3, c4 = cue(4);
    let out = PAPER + topBadge();
    const pO = 1 - prog(t, c3 - 0.5, 0.4);
    if (pO > 0) {
      const ton = c1 + d1 * 0.55, on = prog(t, ton, 0.35), sp = eio(prog(t, ton, 1.0));
      const off = 14 * t + 80 * Math.max(0, t - ton - 0.4) * sp, ph = 2.2 * t + 5.5 * Math.max(0, t - ton - 0.3) * sp;
      const PX = 180, PY = 210, PW = 1560, PH = 610;
      let p = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="36" fill="#fff7f0"/><clipPath id="rcl"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="36"/></clipPath><g clip-path="url(#rcl)">`;
      // さいぼう
      for (let i = 0; i < 8; i++) p += `<rect x="${PX + i * 195}" y="650" width="195" height="190" fill="#f8dcc8" stroke="${SZ.line}" stroke-width="5"/><circle cx="${PX + i * 195 + 97}" cy="738" r="28" fill="#c3a6dc" stroke="#8f6fd0" stroke-width="4"/>`;
      // はなみず（ねばねば）と、つかまった ごみ
      const sq = (t > ton - 0.5 && t < ton + 0.6) ? Math.sin(clamp((t - ton + 0.5) / 1.1) * Math.PI) * 26 : 0;
      let top = `M ${PX} 600 L ${PX} 486`;
      for (let x = PX; x <= PX + PW; x += 60) top += ` L ${x} ${(482 + Math.sin(x * 0.011 + off * 0.02) * 9 + sq * Math.exp(-Math.pow((x - 960) / 260, 2))).toFixed(1)}`;
      p += `<path d="${top} L ${PX + PW} 600 Z" fill="${SZ.mucus}" stroke="${SZ.mucusDk}" stroke-width="5" stroke-linejoin="round"/>`;
      for (let i = 0; i < 9; i++) {
        const x = PX - 60 + ((((i * 197 + 80 - off) % (PW + 120)) + PW + 120) % (PW + 120)), y = 520 + rnd(i, 81) * 46;
        p += i % 3 === 1 ? pollenDot(x, y, 11) : dustDot(x, y, 9 + rnd(i, 82) * 6);
        const x2 = PX - 60 + ((((i * 197 + 170 - off) % (PW + 120)) + PW + 120) % (PW + 120));
        p += `<ellipse cx="${x2.toFixed(1)}" cy="${(508 + rnd(i, 83) * 60).toFixed(1)}" rx="26" ry="7" fill="#fff" opacity="0.45"/>`;
      }
      // とても ほそい け（せんもう）
      for (let i = 0; i < 53; i++) { const x = PX + 15 + i * 29.5, sw = Math.sin(ph * 2 - i * 0.42) * 26 - 8; p += `<path d="M ${x} 652 Q ${x} 620 ${(x + sw).toFixed(1)} 596" fill="none" stroke="#b9805e" stroke-width="6" stroke-linecap="round"/>`; }
      p += `</g><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="36" fill="none" stroke="${C.blueUi}" stroke-width="8"/>`;
      p += pop(badge('はなの うちがわを おおきく みると', { fill: C.blueUi, size: 40 }), t, 0.3, 960, 150);
      // なまえ
      const l1 = win(t, c0 + d0 * 0.15, c1 - 0.2, 0.3), l2 = win(t, c0 + d0 * 0.55, c1 - 0.2, 0.3);
      p += pointer(520, 392, 520, 508, SZ.mucusDk, l1) + g(text(520, 350, 'ねばねばの はなみずが', { size: 42, w: 900, fill: '#5f7a2c' }) + text(1010, 350, 'ごみを つかまえる', { size: 42, w: 900 }), { o: l1 });
      p += pointer(1480, 392, 1480, 618, '#8a5a40', l2) + g(text(1480, 300, 'とても ほそい けが', { size: 42, w: 900, fill: '#8a5a40' }) + text(1480, 352, 'はなみずを はこぶ', { size: 42, w: 900, fill: '#8a5a40' }), { o: l2 });
      p += arrow(1180, 440, 780, 440, SZ.inDk, 14, eo(prog(t, c0 + d0 * 0.6, 0.6)), l2);
      // くしゃみの おす ちから
      const ak = eo(prog(t, c1 + d1 * 0.12, ton - c1 - d1 * 0.12)), aO = win(t, c1 + d1 * 0.1, c2 - 0.1, 0.3);
      p += arrow(960, 250, 960, 470 + sq * 0.6, SZ.out, 40, ak, aO) + g(text(1070, 290, 'くしゃみの おす ちから', { size: 46, w: 900, fill: SZ.outDk, anchor: 'start' }), { o: aO });
      // スイッチ
      const so = prog(t, c1 + d1 * 0.3, 0.3);
      p += g(switchPic(on), { x: 440, y: 330, o: so }) + g(text(440, 420, on > 0.5 ? 'スイッチ オン！' : 'スイッチ', { size: 40, w: 900, fill: on > 0.5 ? '#2f8f3f' : C.muted }), { o: so });
      p += arrow(1500, 440, 1040, 440, SZ.inDk, 18, eo(prog(t, ton + 0.4, 0.6)), prog(t, ton + 0.4, 0.3)) + g(text(1290, 384, 'はなみずを おくりだす', { size: 42, w: 900, fill: SZ.inDk }), { o: prog(t, ton + 0.6, 0.3) * (1 - prog(t, c2 - 0.3, 0.3)) });
      p += pop(badge('はなの なかの「リセット」', { fill: C.accent, size: 60, pad: 46 }), t, c2 + 0.2, 1080, 310);
      out += g(p, { o: pO });
    }
    // まぶしい ひかり
    const lO = prog(t, c3 - 0.3, 0.4);
    if (lO > 0) {
      const sn = c3 + d3 * 0.6, sneezing = t > sn && t < sn + 1.3, bk = prog(t, sn, 0.25);
      let l = g(sunPic(96, t), { x: 1590, y: 270 });
      l += g(shead({ tail: true, eye: 'squint', mouth: sneezing ? 'open' : 'flat' }), { x: 520, y: 470, s: 4.6 });
      l += [0, 1, 2].map(i => `<line x1="1470" y1="${300 + i * 26}" x2="${690}" y2="${400 + i * 22}" stroke="#f6b500" stroke-width="9" stroke-linecap="round" stroke-dasharray="26 22" stroke-dashoffset="${(-t * 90).toFixed(0)}" opacity="0.8"/>`).join('');
      l += pop(badge('まぶしい ひかり', { fill: '#c98a00', size: 46 }), t, c3 + 0.1, 1130, 180);
      const bo = Math.min(1, bk * 4) * (1 - prog(t, c4 - 0.3, 0.3));
      if (bo > 0) {
        l += g(blastLines(bk, SZ.out, 200, 13), { x: 750, y: 474, o: bo * clamp(1 - (t - sn - 1.2) / 0.5) });
        l += g(burst(150, 200) + olText(0, 8, 'ハクション！', { size: 70, fill: SZ.out, ol: '#fff', sw: 8 }), { x: 1270, y: 610, s: Math.max(back(bk), 0.001), o: bo });
      }
      l += pop(olText(0, 0, '？', { size: 230, fill: C.ochre, ol: '#fff', sw: 24 }), t, c4 + 0.1, 1270, 560);
      l += pop(badge('わけは まだ わかって いない', { fill: C.ochre, size: 48 }), t, c4 + 0.5, 1270, 760);
      out += g(l, { o: lO });
    }
    return out;
  },
});

// ---------- 8. 答え と みてみよう ----------
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1360, 170) + `<circle cx="-590" cy="0" r="50" fill="${C.blueUi}"/>` + text(-590, 3, '①', { size: 56, w: 900, fill: '#fff' }) +
        text(-506, 2, 'はなに はいった じゃまものを、おいだす ため', { size: 46, w: 900, anchor: 'start' }) + g(GUESS_ICON[0](), { x: 596, y: 0, s: 1.0 }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 370, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['はなの みはりやくが きづく', SZ.nerveDk], ['のうの おくから めいれい', SZ.medDk], ['すう → ためる → ドカン', SZ.outDk]], t, 960, 660, { start: 2.6, step: 1.4, size: 34, gap: 24 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      const c3 = cue(3), d3 = cueE(3) - c3;
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const items = [
        [g(shead({ mouth: 'o', eye: 'wide' }), { s: 0.72, y: -8 }), 'かぞくの「はっ はっ」と「ハクション！」を みくらべる', C.ink, cue(1)],
        [g(shead({ sleeve: true, eye: 'squint', tail: true }), { s: 0.72, y: -8 }), 'じぶんは、そでの うちがわで くちと はなを おおう', C.ink, cue(2)],
        [warnIcon(0.82), 'はなの なかに、ゆびや ものを いれない', C.red, c3],
        [warnIcon(0.82), 'こしょうなどで、わざと くしゃみを ださない', C.red, c3 + d3 * 0.5],
        [warnIcon(0.82), 'ひとの ほうを むいて、くしゃみを しない', C.red, cue(4)],
      ];
      items.forEach(([ic, s, col, st], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, st, 190, 312 + i * 112);
      });
      // えの カード：はっ はっ → そでで おおう
      const k2 = prog(t, cue(2) - 0.2, 0.4);
      let p = card(330, 300);
      p += g(g(shead({ mouth: 'o', eye: 'wide' }), { x: -40, y: -26, s: 1.9 }) + olText(86, -84, 'はっ', { size: 44, fill: SZ.in, ol: '#fff', sw: 8 }) + olText(108, -24, 'はっ', { size: 36, fill: SZ.in, ol: '#fff', sw: 8 }), { o: 1 - k2 });
      p += g(g(shead({ sleeve: true, eye: 'squint', tail: true }), { x: -30, y: -26, s: 1.9 }), { o: k2 });
      b += pop(p, t, cue(1) + 0.3, 1690, 400);
      b += kidShow('K', t, 1710, 840, { s: 0.75, start: cue(1) + 0.8, n: 0, bubble: false, enter: 'slideR' });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「くしゃみは どうして でるの？」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    // 左に立つ子は動画ごとに変わる（END_SWAP）。動きも kidShow が動画ごとに選ぶ
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += pop(`<g transform="scale(-1 1)">${chameleon(NOW.t, { holdLens: true })}</g>`, t, 1.2, 1700, 1040, { s: 0.7 });
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
