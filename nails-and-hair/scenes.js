// みのまわり図鑑 動画「つめや髪は、どうして切っても痛くない？」
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
const TOPIC = 'つめと かみ';
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
// ---------- つめと かみの道具 ----------
const SKIN = '#f6d6bd', SKIN2 = '#ecc0a2', SKIN3 = '#e2ad8c', HAIRC = '#4b3226';
const BED = '#f0a7a3', NAILW = '#fbf6ec', MATRIX = '#e58f7c';
let CLIPN = 0;
// 指を横から切って見た絵（右向き、指先が右）。flow: つめが押し出される動き
function fingerSide(x, y, s, t, { flow = 0, bedGlow = 0, matrixGlow = 0, sensor = 0, cutLine = 0, tipLen = 70 } = {}) {
  const id = 'fs' + (CLIPN++);
  const tipX = 140 + tipLen;
  let b = `<path d="M -760 -92 L 40 -92 Q 160 -92 160 10 Q 160 112 40 112 L -760 112 Z" fill="${SKIN}"/>`;
  b += `<path d="M -760 112 L 40 112 Q 120 112 150 50" fill="none" stroke="${SKIN2}" stroke-width="10" stroke-linecap="round"/>`;
  // 爪床（つめの下のやわらかいところ）
  b += `<rect x="-260" y="-92" width="390" height="34" rx="12" fill="${BED}"/>`;
  for (let k = 0; k < 6; k++) b += `<line x1="${-240 + k * 62}" y1="-62" x2="${-200 + k * 62}" y2="-62" stroke="#d65b5b" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
  if (bedGlow > 0) b += `<rect x="-266" y="-98" width="402" height="46" rx="16" fill="none" stroke="${C.red}" stroke-width="7" opacity="${bedGlow * (0.6 + 0.4 * Math.sin(t * 5))}"/>`;
  if (sensor > 0) for (let k = 0; k < 5; k++) b += `<circle cx="${-210 + k * 80}" cy="-74" r="${9 + 3 * Math.sin(t * 6 + k)}" fill="${C.yellow}" stroke="${C.ochre}" stroke-width="3" opacity="${sensor}"/>`;
  // 根元（つめを作るところ）
  b += `<path d="M -380 -96 Q -390 -60 -350 -54 L -260 -58 L -260 -96 Z" fill="${MATRIX}"/>`;
  if (matrixGlow > 0) b += `<ellipse cx="-320" cy="-76" rx="${84 + 6 * Math.sin(t * 5)}" ry="${44 + 4 * Math.sin(t * 5)}" fill="none" stroke="${C.ochre}" stroke-width="7" opacity="${matrixGlow}"/>`;
  // つめの板
  const plate = `M -370 -112 L ${tipX - 20} -112 Q ${tipX} -112 ${tipX} -98 Q ${tipX} -88 ${tipX - 20} -88 L -370 -88 Z`;
  b += `<clipPath id="${id}"><path d="${plate}"/></clipPath>`;
  b += `<g clip-path="url(#${id})"><rect x="-380" y="-120" width="${tipX + 400}" height="40" fill="${NAILW}" opacity="0.62"/><rect x="130" y="-120" width="${tipX}" height="40" fill="${NAILW}"/>`;
  if (flow > 0) for (let k = -2; k < 18; k++) {
    const xx = -380 + ((k * 40 + t * 28) % 760);
    b += `<line x1="${xx}" y1="-114" x2="${xx}" y2="-86" stroke="#d9c9ae" stroke-width="4" opacity="${0.8 * flow}"/>`;
  }
  b += `</g><path d="${plate}" fill="none" stroke="#cdb998" stroke-width="4"/>`;
  // 根元の皮ふ（つめの根元をおおう）
  b += `<path d="M -460 -92 L -460 -100 Q -380 -150 -262 -112 L -262 -92 Z" fill="${SKIN}"/><path d="M -460 -100 Q -380 -150 -262 -112" fill="none" stroke="${SKIN2}" stroke-width="6"/>`;
  if (cutLine > 0) b += g(`<line x1="${tipX - 34}" y1="-150" x2="${tipX - 34}" y2="-60" stroke="${C.red}" stroke-width="7" stroke-dasharray="12 9"/>`, { o: cutLine });
  return g(b, { x, y, s });
}
// 上から見た指とつめ（指先が上）
function fingerTop(x, y, s, t, { hl = null, lunula = 1, tip = 1, base = 330 } = {}) {
  let b = `<path d="M -110 ${base} L -110 -120 Q -110 -230 0 -230 Q 110 -230 110 -120 L 110 ${base} Z" fill="${SKIN}"/>`;
  b += `<path d="M -78 -150 Q -78 -205 0 -205 Q 78 -205 78 -150 L 78 40 Q 78 60 58 60 L -58 60 Q -78 60 -78 40 Z" fill="${BED}"/>`;
  b += `<path d="M -70 -150 L -70 30 M 70 -150 L 70 30" stroke="#e48d8b" stroke-width="5" opacity="0.6"/>`;
  // 白い先
  if (tip > 0) b += `<path d="M -80 -170 Q -80 -258 0 -258 Q 80 -258 80 -170 Q 40 -190 0 -190 Q -40 -190 -80 -170 Z" fill="${NAILW}" stroke="#e3d6bd" stroke-width="4"/>`;
  // 白い三日月
  if (lunula > 0) b += `<path d="M -50 60 Q -50 8 0 8 Q 50 8 50 60 Z" fill="#fbe4dc" opacity="${0.9 * lunula}"/>`;
  b += `<path d="M -78 -150 Q -78 -205 0 -205 Q 78 -205 78 -150 L 78 40 Q 78 60 58 60 L -58 60 Q -78 60 -78 40 Z" fill="#fff" opacity="0.18" stroke="#e8b9b0" stroke-width="5"/>`;
  b += `<path d="M -84 64 Q 0 40 84 64 L 84 90 L -84 90 Z" fill="${SKIN}"/><path d="M -84 64 Q 0 40 84 64" fill="none" stroke="${SKIN2}" stroke-width="6"/>`;
  if (base > 270) b += `<path d="M -60 200 Q 0 214 60 200 M -60 250 Q 0 262 60 250" fill="none" stroke="${SKIN2}" stroke-width="6" stroke-linecap="round"/>`;
  else if (base > 150) b += `<path d="M -60 140 Q 0 154 60 140" fill="none" stroke="${SKIN2}" stroke-width="6" stroke-linecap="round"/>`;
  if (hl === 'pink') b += `<path d="M -84 -150 L 84 -150 L 84 66 L -84 66 Z" fill="none" stroke="${C.red}" stroke-width="8" stroke-dasharray="16 10" opacity="${0.7 + 0.3 * Math.sin(t * 5)}"/>`;
  if (hl === 'tip') b += `<ellipse cx="0" cy="-212" rx="104" ry="64" fill="none" stroke="${C.blueUi}" stroke-width="8" stroke-dasharray="16 10" opacity="${0.7 + 0.3 * Math.sin(t * 5)}"/>`;
  if (hl === 'lunula') b += `<ellipse cx="0" cy="40" rx="76" ry="46" fill="none" stroke="${C.ochre}" stroke-width="8" stroke-dasharray="16 10" opacity="${0.7 + 0.3 * Math.sin(t * 5)}"/>`;
  return g(b, { x, y, s });
}
// 頭の皮ふを切って見た絵。grow: 髪ののび、cells: 根元の細胞がふえるようす
function scalp(x, y, s, t, { len = 260, cells = 0, deadLabel = 0, flow = 1 } = {}) {
  const id = 'sc' + (CLIPN++);
  let b = `<rect x="-330" y="0" width="660" height="340" rx="24" fill="#f7dccb"/><rect x="-330" y="0" width="660" height="40" fill="#efc2a6"/>`;
  b += `<path d="M -40 0 L -40 230 Q -40 250 -20 260 M 40 0 L 40 230 Q 40 250 20 260" fill="none" stroke="#e2a98e" stroke-width="10"/>`;
  b += `<ellipse cx="0" cy="262" rx="64" ry="54" fill="#e8a08a"/><ellipse cx="0" cy="290" rx="26" ry="22" fill="#cf6f66"/>`;
  // 髪（根元から上へ）
  const top = -len;
  b += `<clipPath id="${id}"><rect x="-14" y="${top}" width="28" height="${len + 250}" rx="14"/></clipPath>`;
  b += `<g clip-path="url(#${id})"><rect x="-14" y="${top}" width="28" height="${len + 250}" fill="${HAIRC}"/>`;
  if (flow > 0) for (let k = 0; k < 20; k++) { const yy = 250 - ((k * 40 + t * 22) % 800); b += `<line x1="-14" y1="${yy}" x2="14" y2="${yy - 6}" stroke="#6b4a36" stroke-width="5"/>`; }
  b += `</g>`;
  if (cells > 0) for (let k = 0; k < 7; k++) {
    const a = k * 0.9 + t * 0.6, ph = (t * 0.9 + k / 7) % 1;
    b += `<circle cx="${Math.cos(a) * 34}" cy="${250 + Math.sin(a) * 18 - ph * 20}" r="${8 + 4 * Math.sin(ph * Math.PI)}" fill="#fff3ea" stroke="#c96a60" stroke-width="3" opacity="${cells}"/>`;
  }
  return g(b, { x, y, s });
}
// 細胞（k: 0 生きている → 1 ケラチンでいっぱい・生きていない）
function cellK(x, y, k, t, i = 0) {
  const rx = lerp(42, 56, k), ry = lerp(40, 18, k);
  let b = `<ellipse rx="${rx}" ry="${ry}" fill="${mix('#f7c1b5', '#f1e2b8', k)}" stroke="${mix('#de8e82', '#cdb98a', k)}" stroke-width="5"/>`;
  if (k > 0.15) for (let j = -2; j <= 2; j++) b += `<line x1="${-rx * 0.7}" y1="${j * ry * 0.3}" x2="${rx * 0.7}" y2="${j * ry * 0.3}" stroke="#c9a65a" stroke-width="4" opacity="${clamp((k - 0.15) * 1.6)}"/>`;
  if (k < 0.85) {
    const o = 1 - clamp(k / 0.85);
    b += `<circle cx="${rx * 0.36}" cy="${ry * 0.1}" r="${11 * o + 2}" fill="#c9746a" opacity="${o}"/>`;
    const ey = -ry * 0.25;
    b += `<g opacity="${o}"><circle cx="-14" cy="${ey}" r="4.5" fill="${C.ink}"/><circle cx="2" cy="${ey}" r="4.5" fill="${C.ink}"/><path d="M -12 ${ey + 12} Q -6 ${ey + 17} 0 ${ey + 12}" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  return g(b, { x, y: y + Math.sin(t * 3 + i) * 2 * (1 - k) });
}
// 爪切り・はさみ
const clipper = (o = 0) => `<rect x="-120" y="6" width="240" height="24" rx="12" fill="#9aa4ad"/><g transform="rotate(${-o * 6} -120 4)"><rect x="-120" y="-20" width="240" height="24" rx="12" fill="#c3cad0"/></g><path d="M 112 -18 Q 132 4 112 28" fill="none" stroke="#6f7a83" stroke-width="8" stroke-linecap="round"/><g transform="rotate(${o * 10} 60 -24)"><path d="M 60 -24 L -150 -84 Q -168 -88 -164 -70 L -150 -62 L 60 -12 Z" fill="#d9dfe4" stroke="#9aa4ad" stroke-width="4"/></g><circle cx="60" cy="-18" r="12" fill="#6f7a83"/>`;
const scissors = (o = 0) => {
  const a = 14 * o;
  return `<g transform="rotate(${-a})"><path d="M 0 0 L 150 -10 L 150 4 Z" fill="#b8c0c7"/><circle cx="-56" cy="-20" r="30" fill="none" stroke="${C.redUi}" stroke-width="12"/></g>` +
    `<g transform="rotate(${a})"><path d="M 0 0 L 150 10 L 150 -4 Z" fill="#9aa4ad"/><circle cx="-56" cy="20" r="30" fill="none" stroke="${C.redUi}" stroke-width="12"/></g><circle r="8" fill="#6f7a83"/>`;
};
// 髪のたば（hook用）。cut: 切った量、fall: 落ちる
function hairLock(x, y, t, cutK = 0) {
  let b = '';
  for (let i = 0; i < 7; i++) {
    const dx = -60 + i * 20, w = Math.sin(t * 1.5 + i) * 6;
    b += `<path d="M ${dx} -260 Q ${dx + 14 + w} -60 ${dx - 6} 120" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`;
  }
  if (cutK > 0) {
    const fy = eio(clamp(cutK)) * 150, o = 1 - clamp((cutK - 0.3) / 0.4);
    let f = '';
    for (let i = 0; i < 7; i++) { const dx = -60 + i * 20; f += `<path d="M ${dx - 2} 120 Q ${dx - 4} 170 ${dx - 6} 210" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`; }
    b += g(f, { y: fy, o, r: cutK * 10 });
  } else {
    for (let i = 0; i < 7; i++) { const dx = -60 + i * 20; b += `<path d="M ${dx - 6} 120 Q ${dx - 6} 170 ${dx - 6} 210" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`; }
  }
  return g(b, { x, y });
}
// 手の甲（look用）
function handBack(x, y, s, t) {
  let b = `<rect x="-190" y="40" width="380" height="330" rx="90" fill="${SKIN}"/>`;
  const F = [[-150, -40, -14, 0.82], [-62, -150, -4, 1], [30, -170, 2, 1.04], [118, -130, 8, 0.96], [-250, 120, -40, 0.9]];
  F.forEach(([fx, fy, r, sc], i) => {
    b += `<g transform="translate(${fx + 20} ${fy + 160}) rotate(${r}) scale(${sc})"><rect x="-40" y="-170" width="80" height="230" rx="40" fill="${SKIN}"/>` +
      `<rect x="-26" y="-150" width="52" height="74" rx="22" fill="${BED}"/><path d="M -26 -146 Q 0 -168 26 -146" fill="${NAILW}" stroke="#e3d6bd" stroke-width="3"/>` +
      `<path d="M -${14 + (i === 4 ? 6 : 0)} -76 Q 0 ${-100 - (i === 4 ? 6 : 0)} ${14 + (i === 4 ? 6 : 0)} -76 Z" fill="#fbe4dc"/></g>`;
  });
  return g(b, { x, y, s });
}
const warnIcon = `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
const callout = (x, y, tx, ty, str, o = 1, { col = C.ink, size = 42 } = {}) => {
  if (o <= 0) return '';
  return g(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` + g(badge(str, { fill: col, size }), { x: tx, y: ty }), { o });
};
const arrowR = (x1, y, x2, col = C.ink, w = 10) => `<path d="M ${x1} ${y} L ${x2} ${y} M ${x2 - 26} ${y - 22} L ${x2} ${y} L ${x2 - 26} ${y + 22}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// 1. つかみ：つめを ぱちん、髪を ちょきちょき
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f4f0e6"/>`;
    // A つめ
    const aO = prog(t, 0.3, 0.5);
    const cutT = cue(0) + 1.4, ck = prog(t, cutT, 0.25);
    let a = card(520, 640) + fingerTop(0, 40, 0.85, t, { tip: 1 - ck, base: 250 });
    if (ck > 0) a += g(`<path d="M -80 -170 Q -80 -258 0 -258 Q 80 -258 80 -170 Q 40 -190 0 -190 Q -40 -190 -80 -170 Z" fill="${NAILW}" stroke="#e3d6bd" stroke-width="4"/>`, { s: 0.85, x: 0, y: 40 + eio(prog(t, cutT, 1.0)) * 120, o: 1 - prog(t, cutT + 0.7, 0.4), r: ck * 20 });
    a += g(clipper(1 - ck), { x: 20, y: -230, s: 0.7, o: win(t, cue(0) + 0.6, cutT + 0.8, 0.3) });
    a += g(text(0, 0, 'ぱちん！', { size: 58, w: 900, fill: C.ochre }), { x: 150, y: -110, o: win(t, cutT, cutT + 1.4, 0.2) });
    out += g(a, { x: 470, y: 440, o: aO, s: lerp(0.94, 1, eo(aO)) });
    // B 髪
    const bO = prog(t, cue(0) + 1.8, 0.5);
    if (bO > 0) {
      const cT = cue(0) + 2.8, hk = prog(t, cT, 1.6);
      let b = card(520, 640) + hairLock(0, 40, t, hk);
      const sn = Math.abs(Math.sin(clamp((t - (cT - 0.8)) / 1.2) * Math.PI * 3));
      b += g(scissors(sn), { x: -150, y: 160, o: win(t, cT - 0.8, cT + 1.0, 0.3) });
      b += g(text(0, 0, 'ちょきちょき', { size: 50, w: 900, fill: C.ochre }), { x: 60, y: -270, o: win(t, cT - 0.6, cT + 1.6, 0.2) });
      out += g(b, { x: 1080, y: 440, o: bO, s: lerp(0.94, 1, eo(bO)) });
    }
    out += pop(badge('いたくない', { fill: C.accent, size: 48 }), t, cue(1) + 0.4, 1440, 190, { end: cueE(3) + 0.4 });
    out += kidShow('B', t, 1650, 840, { s: 0.55, start: 0.6, n: 0, side: 'left' });
    out += g(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre }), { x: 1420, y: 180, o: win(t, cue(3), cueE(3) + 0.6, 0.3) });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 200);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#c46b62">つめ</tspan>や <tspan fill="#7a5638">かみ</tspan>は、</text>`, { x: 960, y: 380, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして きっても <tspan fill="${C.accent}">いたくない</tspan>？</text>`, { x: 960, y: 560, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = g(clipper(0), { x: -150, s: 0.6 }) + g(scissors(0.5), { x: 60, s: 0.7 }) + text(220, -10, '？', { size: 90, w: 900, fill: C.ochre });
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
    const opts = [['①', 'つめや かみは、とても かたいから'], ['②', 'からだが、いたみを がまんしているから'], ['③', 'みえている ところは、もう いきていないから']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-630" y="-76" width="1260" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1240, 132) +
        `<circle cx="-530" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-530, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-460, 2, s, { size: 48, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 820, 380 + i * 160);
    });
    out += pop(g(clipper(0), { s: 0.6 }) + text(110, -40, '？', { size: 100, w: 900, fill: C.ochre }), t, cue(0) + 0.6, 1700, 330);
    out += kidShow('S', t, 1720, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1560, y: 600, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 根元で作られて、押し出される
SCENES.push({
  id: 'root',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sh = eio(prog(t, cue(2) - 0.4, 0.9));
    const FX = lerp(1080, 760, sh), FY = lerp(470, 330, sh), FS = lerp(1.15, 0.75, sh);
    out += fingerSide(FX, FY, FS, t, { flow: prog(t, cue(1) + 0.4, 0.5), matrixGlow: win(t, cue(0) + 1.2, cue(2) - 0.3, 0.4) });
    out += pop(badge('ゆびを よこから みると', { fill: C.muted, size: 36 }), t, 0.3, 960, 140, { end: cue(1) + 1.2 });
    out += callout(FX - 320 * FS, FY - 76 * FS, FX - 520 * FS, FY + 150 * FS, 'つめの ねもと', win(t, cue(0) + 1.4, cue(2) - 0.3, 0.3), { col: '#c25a4a', size: 42 });
    out += callout(FX - 100 * FS, FY - 100 * FS, FX - 40 * FS, FY - 250 * FS, 'つめ', prog(t, cue(0) + 0.6, 0.3) * (1 - prog(t, cue(1), 0.3)), { col: C.ochre, size: 40 });
    // 新しい細胞が押し出す
    const fO = win(t, cue(1) + 0.2, cue(2) - 0.3, 0.4);
    if (fO > 0) {
      for (let i = 0; i < 6; i++) {
        const ph = (t * 0.25 + i / 6) % 1;
        const x = FX + lerp(-330, -60, ph) * FS, y = FY - 100 * FS;
        out += g(`<circle r="${14 * FS}" fill="#f7c1b5" stroke="#de8e82" stroke-width="3"/>`, { x, y: y + 2, o: fO * Math.min(1, (1 - ph) * 4) });
      }
      out += g(arrowR(FX - 160 * FS, FY - 180 * FS, FX + 120 * FS, C.ochre, 12), { o: fO });
      out += pop(badge('おしだす', { fill: C.ochre, size: 44 }), t, cue(1) + 1.6, FX + 260 * FS, FY - 180 * FS, { end: cue(2) - 0.3 });
    }
    // 髪も同じ
    const hO = prog(t, cue(2) - 0.1, 0.5);
    if (hO > 0) {
      const len = lerp(170, 280, eio(prog(t, cue(2) + 0.6, 4.5)));
      out += g(card(760, 600), { x: 1400, y: 500, o: hO });
      out += g(scalp(1400, 470, 0.8, t, { len, cells: 1 }), { o: hO });
      out += g(badge('かみも おなじ', { fill: '#7a5638', size: 44 }), { x: 1400, y: 150, o: hO });
      out += callout(1400, 470 + 262 * 0.8, 1640, 720, 'ねもと', prog(t, cue(2) + 1.6, 0.3), { col: '#c25a4a', size: 40 });
    }
    return out;
  },
});

// 4. ケラチンでいっぱいになって、生きるのをやめる
SCENES.push({
  id: 'keratin',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#fbf4ea"/>` + topBadge();
    // ベルトのように細胞が右へ進みながら変わる
    const bO = prog(t, 0.2, 0.5) * (1 - prog(t, cue(2) - 0.3, 0.4) * 0.7);
    const run = prog(t, cue(0) + 0.6, 0.5);
    const N = 9, X0 = 260, X1 = 1660;
    let belt = `<rect x="${X0 - 80}" y="420" width="${X1 - X0 + 160}" height="120" rx="60" fill="#efe3cf"/>`;
    for (let i = 0; i < N; i++) {
      const ph = ((i / N) + t * 0.035 * run) % 1;
      const x = lerp(X0, X1, ph), k = clamp((ph - 0.25) / 0.55) * prog(t, cue(0) + 1.0, 1.5);
      belt += g(cellK(x, 480, cue(1) - 0.4 > t ? Math.min(k, 0.7) : k, t, i), { o: Math.min(1, ph * 12, (1 - ph) * 12) });
    }
    belt += g(badge('いきている', { fill: '#d9776b', size: 40 }), { x: X0 + 40, y: 340 });
    belt += g(badge('ケラチンで いっぱい', { fill: '#b8923e', size: 40 }), { x: 960, y: 340, o: prog(t, cue(0) + 2.2, 0.4) });
    belt += g(badge('もう いきていない', { fill: C.muted, size: 40 }), { x: X1 - 60, y: 340, o: prog(t, cue(1) + 0.4, 0.4) });
    belt += g(arrowR(X0 + 120, 640, X1 - 120, '#c9b48e', 12), {});
    belt += g(text(960, 700, 'おしだされる', { size: 40, w: 900, fill: '#a8916a' }), {});
    out += g(belt, { o: bO });
    out += pop(badge('ケラチン ＝ かたい たんぱくしつ', { fill: '#b8923e', size: 42 }), t, cue(0) + 3.6, 960, 180, { end: cue(2) - 0.3 });
    // だから、見えているところは生きていない
    const cO = prog(t, cue(2) - 0.1, 0.5);
    if (cO > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${0.9 * cO}"/>`;
      let c = card(620, 520) + fingerTop(0, 70, 0.62, t, { base: 180 }) + g(`<ellipse cx="0" cy="${70 - 212 * 0.62}" rx="80" ry="54" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="14 9"/>`, {});
      c += text(0, -210, 'つめ', { size: 48, w: 900, fill: '#c46b62' });
      let d = card(620, 520) + `<rect x="-300" y="80" width="600" height="150" rx="0" fill="#f7dccb"/><rect x="-300" y="80" width="600" height="26" fill="#efc2a6"/>`;
      for (let i = 0; i < 5; i++) d += `<path d="M ${-120 + i * 60} 90 Q ${-110 + i * 60 + Math.sin(t + i) * 8} -40 ${-130 + i * 60} -150" fill="none" stroke="${HAIRC}" stroke-width="16" stroke-linecap="round"/>`;
      d += `<rect x="-200" y="-160" width="400" height="240" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="14 9" rx="20"/>` + text(0, -210, 'かみ', { size: 48, w: 900, fill: '#7a5638' });
      out += g(c, { x: 620, y: 470, o: cO, s: lerp(0.95, 1, eo(cO)) });
      out += g(d, { x: 1300, y: 470, o: cO, s: lerp(0.95, 1, eo(cO)) });
      out += pop(badge('みえている ところは もう いきていない', { fill: C.muted, size: 46 }), t, cue(2) + 1.4, 960, 160);
    }
    return out;
  },
});

// 5. すき通る・ピンク・白い先・白い三日月
SCENES.push({
  id: 'clear',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const hl = t > cue(3) - 0.2 ? 'lunula' : t > cue(2) - 0.2 ? 'tip' : t > cue(1) - 0.2 ? 'pink' : null;
    out += fingerTop(640, 560, 1.15, t, { hl, base: 200 });
    // A 核がない → すき通る
    const aO = win(t, cue(0) + 0.4, cue(1) - 0.2, 0.4);
    if (aO > 0) {
      let a = card(640, 360);
      a += cellK(-180, -40, 0, t) + text(-180, 60, 'かく が ある', { size: 34, w: 900, fill: '#c9746a' });
      a += arrowR(-90, -40, 60, C.ink, 8);
      a += cellK(170, -40, 1, t) + text(170, 60, 'かく が ない', { size: 34, w: 900, fill: C.muted });
      a += g(badge('すきとおる', { fill: C.blueUi, size: 42 }), { x: 0, y: 130, o: prog(t, cue(0) + 3.4, 0.4) });
      out += g(a, { x: 1340, y: 420, o: aO, s: lerp(0.95, 1, eo(aO)) });
    }
    // B ピンク
    const bO = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.4);
    if (bO > 0) {
      let b = card(640, 300) + `<rect x="-240" y="-60" width="480" height="70" rx="20" fill="${BED}"/>`;
      for (let k = 0; k < 6; k++) b += `<line x1="${-210 + k * 80}" y1="-24" x2="${-160 + k * 80}" y2="-24" stroke="#d65b5b" stroke-width="7" stroke-linecap="round"/>`;
      b += `<rect x="-250" y="-100" width="500" height="40" rx="14" fill="${NAILW}" opacity="0.55" stroke="#cdb998" stroke-width="4"/>`;
      b += text(-250, -124, 'すきとおった つめ', { size: 30, w: 900, fill: '#a8916a', anchor: 'start' });
      b += text(0, 80, 'したの ちの いろが みえる', { size: 40, w: 900, fill: C.red });
      out += g(b, { x: 1340, y: 420, o: bO, s: lerp(0.95, 1, eo(bO)) });
      out += pop(badge('ピンク', { fill: '#d46f6c', size: 44 }), t, cue(1) + 0.6, 640, 140);
    }
    // C 白い先
    const cO = win(t, cue(2) - 0.1, cue(3) - 0.2, 0.4);
    if (cO > 0) {
      let c = card(640, 300);
      c += `<path d="M -260 30 L 120 30 Q 200 30 200 90 L -260 90 Z" fill="${SKIN}"/><rect x="-260" y="0" width="300" height="30" fill="${BED}"/>`;
      c += `<rect x="-260" y="-30" width="300" height="30" fill="${NAILW}" opacity="0.55"/><rect x="40" y="-30" width="210" height="30" rx="12" fill="${NAILW}" stroke="#e3d6bd" stroke-width="4"/>`;
      for (let k = 0; k < 4; k++) { const ph = (t * 0.8 + k / 4) % 1; c += `<path d="M ${-220 + k * 70} ${20 - ph * 34} q 8 12 0 18 q -8 -6 0 -18 Z" fill="#6aaee0" opacity="${1 - ph}"/>`; }
      c += cross(150, -50, 0.35, C.blueUi) + text(150, -100, 'みず', { size: 30, w: 900, fill: C.blueUi });
      c += text(0, 130, 'みずが とどかない → しろい', { size: 38, w: 900, fill: C.blueUi });
      out += g(c, { x: 1340, y: 420, o: cO, s: lerp(0.95, 1, eo(cO)) });
      out += pop(badge('しろい さき', { fill: C.blueUi, size: 44 }), t, cue(2) + 0.6, 640, 140);
    }
    // D 白い三日月
    const dO = prog(t, cue(3) - 0.1, 0.4);
    if (dO > 0) {
      out += pop(badge('しろい みかづき', { fill: C.ochre, size: 44 }), t, cue(3) + 0.6, 640, 140);
      out += g(badge('つめを つくる ところの さき', { fill: C.ochre, size: 40 }), { x: 1300, y: 380, o: prog(t, cue(3) + 1.4, 0.4) });
      out += g(`<line x1="${640 + 70 * 1.15}" y1="${560 + 40 * 1.15}" x2="1080" y2="410" stroke="${C.ochre}" stroke-width="5"/>`, { o: prog(t, cue(3) + 1.4, 0.4) });
    }
    out += kidShow('K', t, 1720, 850, { s: 0.5, start: cue(4) - 0.9, n: 0, side: 'left' });
    return out;
  },
});

// 6. ピンクの下は生きている・白い先を残して切る・つめの役目
SCENES.push({
  id: 'sensor',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sh = eio(prog(t, cue(2) - 0.4, 0.8));
    const FX = lerp(1080, 820, sh), FY = lerp(500, 380, sh), FS = lerp(1.15, 0.72, sh);
    out += fingerSide(FX, FY, FS, t, { bedGlow: win(t, cue(0) + 0.4, cue(1) + 0.4, 0.4), sensor: win(t, cue(0) + 2.4, cue(1) + 0.4, 0.4), cutLine: win(t, cue(1) + 0.6, cue(2) - 0.2, 0.3) });
    out += callout(FX - 60 * FS, FY - 60 * FS, FX - 200 * FS, FY + 230 * FS, 'いきている', win(t, cue(0) + 0.8, cue(1) + 0.4, 0.3), { col: C.red, size: 42 });
    out += pop(badge('ちの くだ ・ センサー', { fill: C.red, size: 40 }), t, cue(0) + 2.6, FX + 300 * FS, FY - 280 * FS, { end: cue(1) + 0.4 });
    // 白い先をのこして切る
    const kO = win(t, cue(1) + 0.4, cue(2) - 0.2, 0.3);
    if (kO > 0) {
      out += g(g(clipper(Math.abs(Math.sin(t * 3))), { s: 0.7 }), { x: FX + 260 * FS, y: FY - 250 * FS, o: kO });
      out += pop(badge('しろい さきを のこす', { fill: C.blueUi, size: 42 }), t, cue(1) + 1.2, FX - 200 * FS, FY - 300 * FS, { end: cue(2) - 0.2 });
      out += callout(FX + 145 * FS, FY - 60 * FS, FX + 300 * FS, FY + 220 * FS, 'このしたは ゆびさき', prog(t, cue(1) + 2.4, 0.3) * kO, { col: C.redUi, size: 38 });
    }
    // つめの役目
    const jO = prog(t, cue(2) - 0.1, 0.5);
    if (jO > 0) {
      let j = card(560, 380);
      j += `<rect x="-250" y="-100" width="270" height="70" rx="35" fill="${SKIN}"/><rect x="-90" y="-112" width="90" height="18" rx="9" fill="${NAILW}" stroke="#cdb998" stroke-width="3"/>`;
      j += `<rect x="-250" y="40" width="250" height="70" rx="35" fill="${SKIN2}"/>`;
      j += `<circle cx="20" cy="5" r="26" fill="${C.ochre}"/><circle cx="12" cy="-4" r="8" fill="#fff" opacity="0.5"/>`;
      j += text(0, 140, 'ちいさな ものを つまむ', { size: 36, w: 900 });
      out += g(j, { x: 1400, y: 640, o: jO, s: lerp(0.95, 1, eo(jO)) });
      out += pop(badge('ゆびさきを まもる', { fill: C.accent, size: 42 }), t, cue(2) + 0.8, 820, 640);
    }
    return out;
  },
});

// 7. 髪：根元で作られて、外は生きていない
SCENES.push({
  id: 'hair',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f6f1ea"/>` + topBadge();
    const len = lerp(300, 400, eio(prog(t, 0.4, 10)));
    out += scalp(820, 520, 1.0, t, { len, cells: prog(t, cue(0) + 0.8, 0.4) });
    out += g(text(0, 0, 'あたまの ひふ', { size: 36, w: 900, fill: '#b9806a' }), { x: 1000, y: 560, o: prog(t, 0.6, 0.4) });
    out += callout(820, 520 + 262, 1180, 760, 'かみの もとの さいぼう', prog(t, cue(0) + 1.2, 0.3), { col: '#c25a4a', size: 40 });
    // 外に出ている髪は生きていない
    const dO = prog(t, cue(1) + 0.4, 0.4);
    out += g(`<rect x="${820 - 40}" y="${520 - len}" width="80" height="${len - 8}" rx="30" fill="none" stroke="${C.muted}" stroke-width="7" stroke-dasharray="14 9"/>`, { o: dO });
    out += callout(820 + 40, 520 - len * 0.6, 1180, 520 - len * 0.6, 'もう いきていない', dO, { col: C.muted, size: 40 });
    // はさみ
    const sO = prog(t, cue(2) - 0.1, 0.4);
    if (sO > 0) {
      const sn = Math.abs(Math.sin(clamp((t - cue(2)) / 1.4) * Math.PI * 3));
      out += g(scissors(sn), { x: 680, y: 520 - len * 0.75, o: sO });
      out += pop(badge('きっても いたくない', { fill: C.accent, size: 46 }), t, cue(2) + 1.0, 1350, 150);
    }
    return out;
  },
});

// 8. のびる速さと、35年はかったお医者さん
SCENES.push({
  id: 'speed',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.3, 0.4);
    if (aO > 0) {
      let a = card(1200, 460) + text(0, -170, '1にちに のびる ながさ（おとな）', { size: 44, w: 900 });
      const k1 = eo(prog(t, cue(0) + 0.6, 0.8)), k2 = eo(prog(t, cue(0) + 2.6, 1.0));
      a += g(fingerTop(0, 0, 0.18, t), { x: -470, y: -40 }) + `<rect x="-380" y="-60" width="${180 * k1}" height="44" rx="22" fill="#e08f86"/>` + text(-380 + 180 * k1 + 20, -38, 'つめ やく 0.1ミリ', { size: 40, w: 900, anchor: 'start', fill: '#c46b62' });
      a += `<path d="M -490 60 Q -470 100 -480 140 M -470 60 Q -450 100 -460 140 M -450 60 Q -430 100 -440 140" fill="none" stroke="${HAIRC}" stroke-width="10" stroke-linecap="round"/>` + `<rect x="-380" y="80" width="${540 * k2}" height="44" rx="22" fill="#8a6446"/>` + g(text(-380 + 540 * k2 + 20, 102, 'かみ やく 0.3ミリ', { size: 40, w: 900, anchor: 'start', fill: '#7a5638' }), { o: k2 });
      out += g(a, { x: 960, y: 470, o: aO * prog(t, cue(0) - 0.1, 0.4) });
    }
    // ビーンさん
    const bO = prog(t, cue(1) - 0.1, 0.5);
    if (bO > 0) {
      out += pop(badge('アメリカの おいしゃさん ビーンさん', { fill: C.blueUi, size: 42 }), t, cue(1) + 0.2, 960, 160);
      // 親指のつめと印
      const mk = (t * 0.12) % 1;
      let th = fingerTop(0, 0, 0.75, t);
      th += `<line x1="-55" y1="${lerp(30, -110, mk) * 0.75}" x2="55" y2="${lerp(30, -110, mk) * 0.75}" stroke="${C.blueUi}" stroke-width="8" stroke-linecap="round"/>`;
      out += g(th, { x: 640, y: 560, o: bO });
      out += g(text(0, 0, 'しるし', { size: 36, w: 900, fill: C.blueUi }), { x: 780, y: 560 + lerp(30, -110, mk) * 0.75, o: bO });
      // 年をかぞえる
      const yrs = Math.min(35, Math.floor(clamp((t - cue(1) - 1.2) / 3.4) * 35));
      let c = card(520, 300) + text(0, -70, 'はかりつづけた', { size: 40, w: 900, fill: C.muted }) + text(0, 30, `${yrs}ねん`, { size: 110, w: 900, fill: C.blueUi });
      out += g(c, { x: 1150, y: 400, o: bO * (1 - prog(t, cue(3) - 0.2, 0.4)) });
      // 年をとると、おそくなる
      const sO = prog(t, cue(3) - 0.1, 0.4);
      if (sO > 0) {
        const k1 = eo(prog(t, cue(3) + 0.4, 0.8)), k2 = eo(prog(t, cue(3) + 1.6, 0.8));
        let s = card(640, 360) + text(0, -120, '1にちに のびる ながさ', { size: 38, w: 900 });
        s += text(-270, -30, '32さい', { size: 36, w: 900, anchor: 'start' }) + `<rect x="-130" y="-52" width="${370 * k1}" height="44" rx="22" fill="#e08f86"/>`;
        s += text(-270, 60, '67さい', { size: 36, w: 900, anchor: 'start' }) + `<rect x="-130" y="38" width="${286 * k2}" height="44" rx="22" fill="#e9b3ac"/>`;
        s += g(badge('すこし おそく なる', { fill: C.redUi, size: 36 }), { x: 0, y: 140, o: prog(t, cue(3) + 2.6, 0.4) });
        out += g(s, { x: 1150, y: 470, o: sO, s: lerp(0.95, 1, eo(sO)) });
      }
    }
    out += kidShow('S', t, 1760, 860, { s: 0.48, start: cue(2) - 0.9, n: 0, side: 'left', end: cue(3) + 0.6 });
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
      const CX = 960, CY = 330, NX = -600;
      let a = pop(card(1380, 170) + `<circle cx="${NX}" cy="0" r="50" fill="${C.redUi}"/>` + text(NX, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(NX + 98, 2, 'みえている ところは、もう いきていない', { size: 54, w: 900, anchor: 'start' }), t, 0.4, CX, CY);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: CX + NX, y: CY, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['ねもとで うまれる', '#c25a4a'], ['おされて でてくる', C.ochre], ['ケラチンで いっぱい', '#b8923e']], t, 960, 600, { start: 2.4, step: 0.9, size: 38, gap: 30 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 180);
      const moon = `<rect x="-26" y="-36" width="52" height="72" rx="20" fill="${BED}"/><path d="M -18 36 Q 0 6 18 36 Z" fill="#fbe4dc"/>`;
      const items = [
        [moon, '10ぽんの ゆびの しろい みかづきを くらべる', C.ink, cue(1)],
        [moon + text(40, -30, '?', { size: 44, w: 900, fill: C.ochre }), 'どの ゆびが いちばん おおきい？ よそうしてから', C.ink, cue(2)],
        [warnIcon, 'しろい さきを のこす・つめきりは おうちの ひとと', C.red, cue(3)],
      ];
      items.forEach(([icn, s, col, st], i) => { b += pop(g(icn, { s: 0.9 }) + text(90, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, st, 200, 340 + i * 140); });
      const hO = prog(t, cue(1) + 0.4, 0.5);
      if (hO > 0) b += g(handBack(0, 0, 0.9, t), { x: 1560, y: 330, o: hO, s: lerp(0.9, 1, eo(hO)) });
      b += kidShow('K', t, 1740, 870, { s: 0.5, start: cue(1) + 0.8, n: 1, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「つめと かみ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
  CLIPN = 0;
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
