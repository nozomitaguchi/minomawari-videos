// みのまわり図鑑 動画「ろくおんした じぶんの こえは どうして ちがって きこえるの？」
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
const TOPIC = 'こえ';
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

// みのまわり図鑑 動画「ろくおんした じぶんの こえは どうして ちがって きこえるの？」（こえ）
// 出どころ：everyday-trivia trivia/voice-recorded.md（絵の見本：assets/figures-voice.js、メモ：ideas/notes/recorded-voice.md）
// 色の約束：くうきの みち＝あお、ほねの みち＝オレンジ、うずまき＝むらさき

// ---------- こえの道具 ----------
const VR = {
  air: '#3f8fd8', airDk: '#2a6fb5', airSoft: '#e3f0fa', bone: '#f08a2e', boneDk: '#c96a14', boneSoft: '#fde8d2',
  coch: '#8a6fd0', cochDk: '#6a4fb5', cochSoft: '#e9e2f8', skull: '#f3e2c4', skullDk: '#d6bd94', drum: '#e9a0a0', drumDk: '#b96a6a',
  wall: '#f7edda', floor: '#dcbc90', floorDk: '#c9a676',
};
const rad = a => a * Math.PI / 180;
// 指し線つきのラベル（指す点が x, y。ラベルの まん中が bx, by）
const tag = (x, y, bx, by, str, o = 1, { col = C.ink, size = 40 } = {}) => {
  if (o <= 0) return '';
  const w = tw(str, size, 900) + 52;
  return g(`<line x1="${x}" y1="${y}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/>` +
    `<rect x="${bx - w / 2}" y="${by - size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.8}" fill="#fff" stroke="${col}" stroke-width="4"/>` + ctext(bx, by + 2, str, { size, w: 900, fill: col }), { o });
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>${text(0, 14, '!', { size: 56, w: 900 })}</g>`;
// 矢じり（先が x, y。a は進む向き・ラジアン）
const arrowHead = (x, y, a, col, h = 30) =>
  `<path d="M ${x + Math.cos(a) * h * 0.45} ${y + Math.sin(a) * h * 0.45} L ${x - Math.cos(a - 0.55) * h} ${y - Math.sin(a - 0.55) * h} L ${x - Math.cos(a + 0.55) * h} ${y - Math.sin(a + 0.55) * h} Z" fill="${col}"/>`;
// 道を k（0〜1）まで描く。描きおわったら、白い点線が進む向きへ流れる
function road(d, col, w, k = 1, { o = 1, flow = true, speed = 26 } = {}) {
  if (k <= 0 || o <= 0) return '';
  let s = `<path d="${d}" pathLength="100" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(100 * k).toFixed(2)} 300"/>`;
  if (flow && k >= 1) s += `<path d="${d}" pathLength="100" fill="none" stroke="#fff" stroke-width="${w * 0.36}" stroke-linecap="round" stroke-dasharray="2.2 7.8" stroke-dashoffset="${(-NOW.t * speed).toFixed(2)}" opacity="0.85"/>`;
  return `<g opacity="${o}">${s}</g>`;
}
// 折れ線にそった ギザギザ（ほねの ふるえ）
function zigPoly(pts, amp = 12, step = 26) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`, sgn = 1, carry = step;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    let p = carry;
    while (p < L - 4) { d += ` L ${(x1 + ux * p - uy * amp * sgn).toFixed(1)} ${(y1 + uy * p + ux * amp * sgn).toFixed(1)}`; sgn = -sgn; p += step; }
    carry = p - L;
  }
  const [xe, ye] = pts[pts.length - 1];
  return d + ` L ${xe} ${ye}`;
}
function zig(pts, k = 1, { amp = 12, step = 26, col = VR.bone, w = 10, o = 1, head = 28 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const a2 = amp * (1 + 0.22 * Math.sin(NOW.t * 31)), [xa, ya] = pts[pts.length - 2], [xe, ye] = pts[pts.length - 1], ang = Math.atan2(ye - ya, xe - xa);
  const dd = zigPoly(pts.slice(0, -1).concat([[xe - Math.cos(ang) * head * 0.7, ye - Math.sin(ang) * head * 0.7]]), a2, step);
  return `<g opacity="${o}"><path d="${dd}" pathLength="100" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(100 * k).toFixed(2)} 300"/>` +
    (head && k >= 0.97 ? arrowHead(xe, ye, ang, col, head) : '') + `</g>`;
}
// 音の波（弧）。まん中 (x, y)、角度 a0〜a1（度。0=右、90=下）
function arcs(x, y, n, r0, gap, a0, a1, col = VR.air, sw = 8, o = 1, ph = 0) {
  if (o <= 0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const r = r0 + (i + ph) * gap, p = a => [x + r * Math.cos(rad(a)), y + r * Math.sin(rad(a))], [x1, y1] = p(a0), [x2, y2] = p(a1);
    s += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${(o * Math.min(1, (i + ph) * 1.5) * (1 - (i + ph) / (n + 0.2))).toFixed(2)}"/>`;
  }
  return s;
}
// なみ線（x0 から x1 まで。len=なみの長さ、amp=高さ）。ph で右へ進む
function wavy(x0, x1, y, len, amp, col, w = 9, ph = 0, o = 1) {
  if (o <= 0 || x1 - x0 < 4) return '';
  let d = '';
  for (let x = x0; x <= x1; x += 4) d += `${d ? 'L' : 'M'} ${x} ${(y + Math.sin((x / len - ph) * Math.PI * 2) * amp).toFixed(1)} `;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
}
// うずまき（かぎゅう）。まん中 (0,0)、大きさ r
function spiralG(r, col = VR.coch, sw = 0.28) {
  const pts = [];
  for (let i = 0; i <= 48; i++) { const k = i / 48, a = -Math.PI * 0.15 - k * Math.PI * 2 * 2.2, rr = r * (1 - 0.88 * k); pts.push(`${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`); }
  return `<path d="M ${pts.join(' L ')}" fill="none" stroke="${col}" stroke-width="${r * sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// よこむきの あたま（右むき）。(x, y) が あたまの まん中、s=1 で 高さ およそ 96。
//   みみは (-10, 2)、うずまきは (6, 4)、くちは (40, 21)。flip で左むき。
const PH_FACE = 'M-34-4C-36-30-16-46 6-46C28-46 42-30 42-12L48 0L42 4C42 10 41 14 37 16C39 22 36 28 28 30L16 32L14 46H-16L-18 28C-28 20-33 10-34-4Z';
// （CH は characters.js で あとから 決まるので、使うときに 読む）
const phWho = who => ({
  S: { hair: CH.hairG, shirt: CH.dress }, B: { hair: CH.hairB, shirt: CH.shirtB },
  M: { hair: '#6b4630', shirt: '#d48aa0' }, F: { hair: '#8a5f3c', shirt: '#6f9fd0' },
}[who]);
function phead(x, y, s, { who = 'S', talk = 0, inner = false, glow = 0, glowCol = VR.coch, hand = 0, skull = 0, eyes = 'open', mouth = 'smile', flip = false, body = true, o = 1 } = {}) {
  if (o <= 0) return '';
  const P = phWho(who), T = NOW.t, ln = `stroke="${CH.line}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"`;
  const blink = [1.1, 4.3, 7.4, 10.9, 14.2, 17.7, 21.3, 25.2, 29.4, 33.3].some(b => T > b && T < b + 0.13);
  let q = '';
  if (body) q += `<path d="M-46 84 C-46 58 -30 47 -16 45 L14 45 C32 47 46 60 46 84 Z" fill="${P.shirt}" ${ln}/>`;
  if (who === 'S') q += `<path d="M-28-30C-58-36-70-4-58 26C-56 6-48-8-30-12Z" fill="${P.hair}" ${ln}/>`;
  if (who === 'M') q += `<path d="M-34-10C-44 14-36 34-18 38L-16 2Z" fill="${P.hair}" ${ln}/>`;
  q += `<path d="${PH_FACE}" fill="${CH.skin}" ${ln}/>`;
  q += `<path d="M-36-2C-40-34-14-50 8-50C30-50 46-34 42-16C34-30 18-36 2-34C-12-32-20-20-22-2Z" fill="${P.hair}" ${ln}/>`;
  if (who === 'S') q += `<ellipse cx="-29" cy="-27" rx="3.4" ry="5" fill="${CH.clip}" transform="rotate(-40 -29 -27)"/>`;
  if (who === 'B') q += `<path d="M2-50q4-8 12-6q-5 2-4 7Z" fill="${P.hair}" ${ln}/>`;
  q += `<circle cx="24" cy="6" r="5.5" fill="${CH.cheek}" opacity="0.6"/>`;
  const em = blink ? 'closed' : eyes;
  if (em === 'closed') q += `<path d="M23-11q3.5 2.5 7 0" fill="none" ${ln}/>`;
  else if (em === 'smile') q += `<path d="M23-10q3.5-4.5 7 0" fill="none" ${ln}/>`;
  else q += `<ellipse cx="27" cy="-12" rx="${em === 'wide' ? 3.3 : 2.6}" ry="${em === 'wide' ? 4.2 : 3.4}" fill="${CH.line}"/><circle cx="28" cy="-13.4" r="0.9" fill="#fff"/>`;
  if (talk > 0) q += `<ellipse cx="38.5" cy="21" rx="4.2" ry="${(1.6 + 2.6 * Math.abs(Math.sin(T * 11) * Math.sin(T * 4.7))).toFixed(2)}" fill="#8e3b33"/>`;
  else if (mouth === 'o') q += `<ellipse cx="38.5" cy="21" rx="3.2" ry="4.2" fill="#8e3b33"/>`;
  else if (mouth === 'flat') q += `<path d="M33 21h6" fill="none" ${ln}/>`;
  else q += `<path d="M32 19.5q4 3.5 7.5-0.5" fill="none" ${ln}/>`;
  if (skull > 0) q += `<path d="M-28-6C-28-28-12-40 6-40C24-40 36-28 36-12C36 6 26 20 8 22C-12 24-28 14-28-6Z" fill="${VR.skull}" fill-opacity="${0.55 * skull}" stroke="${VR.skullDk}" stroke-width="1.6" stroke-dasharray="3 3" opacity="${skull}"/>`;
  if (inner) q += (glow > 0 ? `<circle cx="6" cy="4" r="13" fill="${glowCol}" opacity="${0.55 * glow}" filter="url(#soft)"/>` : '') + `<circle cx="6" cy="4" r="8.6" fill="${VR.cochSoft}"/><g transform="translate(6 4)">${spiralG(7.6, VR.coch, 0.3)}</g>`;
  q += `<ellipse cx="-10" cy="2" rx="6" ry="9" fill="${CH.skin}" ${ln}/><path d="M-11-3q4 5 0 10" fill="none" ${ln}/>`;
  if (hand > 0) {
    const hy = (1 - eo(hand)) * 46;
    q += `<g transform="translate(0 ${hy})" opacity="${Math.min(1, hand * 3)}"><path d="M-12 12L-4 66" fill="none" stroke="${CH.line}" stroke-width="14.4" stroke-linecap="round"/><path d="M-12 12L-4 66" fill="none" stroke="${CH.skin}" stroke-width="11" stroke-linecap="round"/>` +
      `<path d="M-7 46L-4 66" fill="none" stroke="${P.shirt}" stroke-width="12.4" stroke-linecap="round"/>` +
      `<ellipse cx="-10" cy="2" rx="12.5" ry="15.5" fill="${CH.skin}" ${ln}/><path d="M-19-6q9-4 17 0M-20 2q10-4 19 0M-19 10q9-4 17 0" fill="none" ${ln}/></g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" opacity="${o}">${q}</g>`;
}
// あたまの上の点（画面の座標）
const hp = (x, y, s, ux, uy, flip = false) => [x + (flip ? -1 : 1) * ux * s, y + uy * s];
// くちから出て、ぐるっと みみに入る 青い道
function loopD(x, y, s, flip = false) {
  const p = (ux, uy) => hp(x, y, s, ux, uy, flip).map(v => v.toFixed(1)).join(' ');
  return `M ${p(47, 22)} C ${p(84, 26)} ${p(86, -74)} ${p(10, -70)} C ${p(-46, -68)} ${p(-56, -22)} ${p(-27, -4)}`;
}
function airLoop(x, y, s, k, { flip = false, o = 1, w = 11, col = VR.air } = {}) {
  if (k <= 0 || o <= 0) return '';
  const [ex, ey] = hp(x, y, s, -27, -4, flip), ang = flip ? Math.PI - Math.atan2(18, 29) : Math.atan2(18, 29);
  return road(loopD(x, y, s, flip), col, w, k, { o }) + (k >= 0.97 ? g(arrowHead(ex + Math.cos(ang) * 8, ey + Math.sin(ang) * 8, ang, col, w * 2.6), { o }) : '');
}
// あたまの中の オレンジの道（くち・のどから うずまきへ）
function boneIn(x, y, s, k, { flip = false, o = 1, w = 9 } = {}) {
  if (k <= 0 || o <= 0) return '';
  const a = hp(x, y, s, 31, 24, flip), b = hp(x, y, s, 12, 9.5, flip), c = hp(x, y, s, 3, 40, flip), d = hp(x, y, s, 5.4, 14, flip);
  return zig([a, b], k, { amp: s * 1.5, step: s * 3.4, w, o, head: w * 2.4 }) + zig([c, d], k, { amp: s * 1.5, step: s * 3.4, w, o, head: w * 2.4 });
}
// スマホ（150 × 280）。mode: 'rec' ろくおん中 / 'play' さいせい中 / 'wave' 青い波だけ
function phoneG(x, y, s, mode, { o = 1, r = 0, thin = true } = {}) {
  if (o <= 0) return '';
  const T = NOW.t;
  let q = `<rect x="-75" y="-140" width="150" height="280" rx="26" fill="${C.housing}"/><rect x="-63" y="-118" width="126" height="226" rx="10" fill="#fdfdf6"/><rect x="-16" y="119" width="32" height="7" rx="3.5" fill="#8a9096"/><circle cx="0" cy="-129" r="4" fill="#5a6066"/>`;
  if (mode === 'rec') {
    q += `<circle cx="0" cy="-62" r="24" fill="${C.red}" opacity="${0.6 + 0.4 * Math.abs(Math.sin(T * 3.2))}"/>` + text(0, -8, 'ろくおん', { size: 22, w: 900, fill: C.red, ls: 0 });
    for (let i = 0; i < 7; i++) { const h = 10 + 34 * Math.abs(Math.sin(T * 7 + i * 1.9) * Math.sin(T * 3.1 + i)); q += `<rect x="${-48 + i * 14.5}" y="${52 - h / 2}" width="9" height="${h}" rx="4.5" fill="${VR.air}"/>`; }
  } else {
    if (mode === 'play') q += `<circle cx="0" cy="-62" r="26" fill="${VR.air}"/><path d="M -8 -75 L 13 -62 L -8 -49 Z" fill="#fff"/>` + text(0, -8, 'さいせい', { size: 22, w: 900, fill: VR.airDk, ls: 0 });
    else q += text(0, -60, 'ろくおんの', { size: 20, w: 900, fill: VR.airDk, ls: 0 }) + text(0, -32, 'こえ', { size: 24, w: 900, fill: VR.airDk, ls: 0 });
    q += wavy(-50, 50, 52, 26, thin ? 13 : 22, VR.air, 6, T * 1.6);
  }
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${o}">${q}</g>`;
}
// 文字が はばに 入るように、大きさを決める
const fitSize = (str, size, maxW, w = 700) => Math.min(size, Math.floor(size * maxW / tw(str, size, w)));
// ふちつきの 大きな文字
const big = (x, y, str, size, fill, { o = 1, r = 0, s = 1, stroke = '#fff', sw = 14 } = {}) => g(text(0, 0, str, { size, w: 900, fill, extra: `stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round"` }), { x, y, o, r, s });
// へやの かべと ゆか
const roomBg = () => `<rect width="1920" height="1080" fill="${VR.wall}"/><rect x="0" y="870" width="1920" height="210" fill="${VR.floor}"/><rect x="0" y="862" width="1920" height="16" fill="${VR.floorDk}"/>`;

// 1. つかみ：スマホで 声を ろくおんして、きいてみる
SCENES.push({
  id: 'hook',
  draw(t) {
    const c0 = cue(0), d0 = cueE(0) - c0, tP = c0 + d0 * 0.6, c1 = cue(1), c3 = cue(3);
    let out = roomBg();
    // まど と たな
    out += `<rect x="120" y="150" width="330" height="270" rx="14" fill="#cfe6f5" stroke="#b08455" stroke-width="16"/><line x1="285" y1="150" x2="285" y2="420" stroke="#b08455" stroke-width="10"/><line x1="120" y1="285" x2="450" y2="285" stroke="#b08455" stroke-width="10"/>` + cloud(240, 240, 0.45, '#fff', 0.9);
    out += `<rect x="1680" y="130" width="170" height="130" rx="10" fill="#fffaf0" stroke="#b08455" stroke-width="12"/><circle cx="1728" cy="182" r="18" fill="${C.yellow}"/><path d="M 1700 248 L 1760 196 L 1800 228 L 1822 212 L 1838 248 Z" fill="#7fb77e"/>`;
    out += `<rect x="1790" y="800" width="64" height="70" rx="8" fill="#c98a5a"/><circle cx="1822" cy="760" r="54" fill="#7fb77e"/><circle cx="1786" cy="790" r="30" fill="#6aa76a"/><circle cx="1858" cy="784" r="32" fill="#6aa76a"/>`;
    // スマホ（さいごは 右へ よける）
    const mv = eio(prog(t, c3 - 0.1, 0.7));
    const PX = lerp(1180, 1650, mv), PY = lerp(470, 590, mv), PS = lerp(1.75, 1.3, mv), play = t >= tP;
    const sw = Math.sin(t * 2) * 2;
    out += pop(phoneG(0, 0, PS, play ? 'play' : 'rec', { r: sw }), t, 0.3, PX, PY);
    // ろくおん：おとうとの「あー」が スマホへ
    const kx = 420, ky = 890, ks = 0.62, mouth = [kx + 40, ky - 242 * ks];
    const recO = win(t, c0 + 0.3, tP - 0.1, 0.25);
    if (recO > 0) {
      out += arcs(mouth[0], mouth[1] - 20, 5, 60, 110, -42, 2, VR.air, 10, recO, (t * 1.3) % 1);
      out += big(720, 560 + Math.sin(t * 5) * 6, 'あー', 110, VR.air, { o: recO });
    }
    // さいせい：スマホから 声が出る
    const plO = win(t, tP + 0.1, c3 - 0.1, 0.3);
    if (plO > 0) {
      out += arcs(PX - 110, PY, 4, 60, 80, 140, 220, VR.air, 10, plO, (t * 1.3) % 1) + arcs(PX + 110, PY, 4, 60, 80, -40, 40, VR.air, 10, plO, (t * 1.3) % 1);
      out += big(PX + 10, 150 + Math.sin(t * 5) * 5, 'あー', 84, VR.airDk, { o: plO, r: -4 });
    }
    // あれ？
    [[820, 300, 0, -10], [1560, 330, 0.25, 12]].forEach(([x, y, dl, r]) => { out += pop(big(0, 0, '？', 150, C.ochre, { r }), t, c1 + 0.2 + dl, x, y + Math.sin(t * 3 + dl * 9) * 8, { end: c3 - 0.1 }); });
    // 子どもたち
    const eyes = t > c1 ? 'wide' : 'open';
    out += kidShow('S', t, 200, ky, { s: ks, start: 0, n: 1, eyes, look: [8, -3], bubble: false });
    out += kidShow('B', t, kx, ky, { s: ks, start: 0, n: 0, eyes, look: [8, -3], mouth: t > c0 + 0.3 && t < tP ? 'open' : null });
    // いつもの こえ ≠ ろくおんの こえ ？
    out += pop(card(1040, 200) + text(-262, 4, 'いつもの こえ', { size: 50, w: 900 }) + text(-46, 2, '≠', { size: 92, w: 900, fill: C.red }) +
      text(192, 4, 'ろくおんの こえ', { size: 50, w: 900, fill: VR.airDk }) + text(450, 4, '？', { size: 88, w: 900, fill: C.ochre }), t, c3 + 0.6, 950, 420, { end: cueE(3) + 0.6 });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${VR.airDk}">ろくおん</tspan>した じぶんの こえは</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${VR.boneDk}">ちがって</tspan> きこえるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(phoneG(-170, 0, 0.62, 'play') + arcs(-110, 0, 3, 40, 44, -35, 35, VR.air, 9, 1, 0.4) + text(120, 0, '？', { size: 130, w: 900, fill: C.ochre }), t, t0 + 1.8, 960, 810);
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうしてだと おもう？', { size: 84, w: 900 }), t, 0.3, 900, 210);
    const opts = [['①', 'マイクが、こえを たかく かえて しまう'], ['②', 'スピーカーが ちいさくて、こえが ほそく なる'], ['③', 'いつもの こえには、ほねを とおる おとが まざる']];
    const cur = curLine();
    opts.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: fitSize(s, 50, 990), w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 900, 390 + i * 168);
    });
    out += kidShow('B', t, 1720, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1720, y: 250, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 耳の中の だんめん図（1100 × 620）。左が そと、右が あたまの 中
function earCut(t, { air = 0, drum = 0, bones = [0, 0, 0], pulse = 0, glow = 0, glowCol = VR.coch, airDim = 1, boneK = 0, boneO = 0, buzz = 0 } = {}) {
  const W = 1100, H = 620;
  let o = `<clipPath id="ecClip"><rect width="${W}" height="${H}" rx="36"/></clipPath><g clip-path="url(#ecClip)">`;
  o += `<rect width="${W}" height="${H}" fill="${VR.skull}"/>`;
  for (let i = 0; i < 34; i++) o += `<circle cx="${(250 + rnd(i, 41) * 830).toFixed(0)}" cy="${(20 + rnd(i, 42) * 580).toFixed(0)}" r="${(5 + rnd(i, 43) * 6).toFixed(1)}" fill="${VR.skullDk}" opacity="0.3"/>`;
  // ほねの ふるえ
  if (buzz > 0) for (let i = 0; i < 9; i++) {
    const top = i < 3, x = (top ? 290 + i * 190 : 270 + (i % 3) * 290) + rnd(i, 44) * 50, y = [40, 470, 566][Math.floor(i / 3)] + rnd(i, 45) * 20;
    o += wavy(x, x + 72, y, 24, 8 + 3 * Math.sin(t * 9 + i), VR.bone, 6, t * 3 + i * 0.37, buzz * 0.75);
  }
  o += `<rect width="172" height="${H}" fill="${VR.airSoft}"/><rect x="172" y="0" width="46" height="${H}" fill="${CH.skin}"/><line x1="218" y1="0" x2="218" y2="${H}" stroke="${CH.skinShade}" stroke-width="5"/>`;
  // そとの みみ
  o += `<path d="M 186 226 C 172 166 150 128 104 126 C 50 126 28 200 38 300 C 46 392 86 478 138 474 C 178 470 172 414 186 376 Z" fill="${CH.skin}" stroke="${CH.line}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M 150 244 C 132 190 90 196 88 284 C 88 352 106 400 134 408" fill="none" stroke="${CH.skinShade}" stroke-width="8" stroke-linecap="round"/>`;
  // みみの あな
  o += `<path d="M 150 256 C 300 244 430 262 566 254 L 566 346 C 430 338 300 354 150 346 Z" fill="${VR.airSoft}"/>`;
  o += `<path d="M 160 256 C 300 244 430 262 566 254 M 160 346 C 300 354 430 338 566 346" fill="none" stroke="${CH.skinShade}" stroke-width="8" stroke-linecap="round"/>`;
  // なかの へや と うずまき
  o += `<path d="M 566 250 C 620 208 736 222 758 284 C 770 326 742 372 680 376 C 624 380 584 364 566 350 Z" fill="#fcf6ea" stroke="${VR.skullDk}" stroke-width="6"/>`;
  if (glow > 0) o += `<circle cx="890" cy="306" r="150" fill="${glowCol}" opacity="${(0.55 * glow).toFixed(2)}" filter="url(#glow)"/>`;
  o += `<path d="M 742 280 C 772 274 792 262 812 248 L 812 366 C 792 352 772 338 742 330 Z" fill="${VR.cochSoft}" stroke="${VR.coch}" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<circle cx="890" cy="306" r="100" fill="${VR.cochSoft}" stroke="${VR.coch}" stroke-width="10"/><g transform="translate(890 306)">${spiralG(74, VR.coch, 0.2)}</g>`;
  // こまく
  const dx = Math.sin(t * 38) * 6 * drum;
  o += `<ellipse cx="${(566 + dx).toFixed(1)}" cy="300" rx="10" ry="50" fill="${VR.drum}" stroke="${VR.drumDk}" stroke-width="4"/>`;
  if (drum > 0) o += [-1, 1].map(sd => `<path d="M ${566 + sd * 28} 266 q ${sd * 9} 34 0 68" fill="none" stroke="${VR.drumDk}" stroke-width="5" stroke-linecap="round" opacity="${(0.75 * drum * Math.abs(Math.sin(t * 9))).toFixed(2)}"/>`).join('');
  // 3つの ちいさな ほね
  [[586, 298, 632, 258], [632, 258, 676, 300], [676, 300, 726, 303]].forEach(([x1, y1, x2, y2], i) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, r = Math.sin(t * 34 + i * 1.4) * 8 * bones[i];
    o += `<g transform="rotate(${r.toFixed(2)} ${mx} ${my})"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9a8560" stroke-width="27" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fffdf2" stroke-width="18" stroke-linecap="round"/>` +
      (i === 2 ? `<ellipse cx="735" cy="303" rx="9" ry="24" fill="#fffdf2" stroke="#9a8560" stroke-width="5"/>` : '') + `</g>`;
  });
  // あおい ふるえ（くうきの みち）
  if (air > 0) for (let i = 0; i < 6; i++) {
    const f = (i + (t * 0.9) % 1) / 6, x = 16 + f * 532, h = lerp(64, 30, clamp((x - 120) / 70)), ed = Math.min(1, f * 5, (1 - f) * 8);
    o += `<path d="M ${x.toFixed(1)} ${300 - h} Q ${(x + h * 0.42).toFixed(1)} 300 ${x.toFixed(1)} ${300 + h}" fill="none" stroke="${VR.air}" stroke-width="9" stroke-linecap="round" opacity="${(air * airDim * ed).toFixed(2)}"/>`;
  }
  if (pulse > 0) {
    const R = [[578, 300], [632, 258], [676, 300], [736, 303], [806, 306]];
    for (let i = 0; i < 3; i++) {
      const f = ((t * 0.8 + i / 3) % 1) * (R.length - 1), j = Math.min(R.length - 2, Math.floor(f)), u = f - j;
      o += `<circle cx="${lerp(R[j][0], R[j + 1][0], u).toFixed(1)}" cy="${lerp(R[j][1], R[j + 1][1], u).toFixed(1)}" r="11" fill="${VR.air}" stroke="#fff" stroke-width="4" opacity="${(pulse * airDim).toFixed(2)}"/>`;
    }
  }
  // オレンジの ふるえ（ほねの みち）
  o += zig([[250, 112], [600, 96], [772, 132], [838, 236]], boneK, { amp: 16, step: 30, w: 12, o: boneO, head: 34 });
  o += `</g><rect width="${W}" height="${H}" rx="36" fill="none" stroke="${VR.skullDk}" stroke-width="8"/>`;
  return o;
}

// 3. おとが とどく みちは 2つ（くうきの みち・ほねの みち）
SCENES.push({
  id: 'paths',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const PX = 740, PY = 200, HX = 350, HY = 500, HS = 4.3, ear = hp(HX, HY, HS, -10, 2);
    const bn = prog(t, c(5) - 0.2, 0.5);  // ほねの みちの 番
    // みだし
    out += g(text(0, 0, 'おとが とどく みちは 2つ', { size: 60, w: 900 }), { x: 1290, y: 116, o: win(t, c(0) + 0.2, c(1) - 0.1, 0.3) });
    out += g(pop(badge('くうきの みち', { fill: VR.air, size: 48, pad: 42 }), t, c(1), 1070, 116), { o: lerp(1, 0.4, bn) });
    out += pop(badge('ほねの みち', { fill: VR.bone, size: 48, pad: 42 }), t, c(5), 1540, 116);
    // どこを 大きく 見ているか
    const pO = prog(t, 0.2, 0.4);
    out += g(`<line x1="${ear[0]}" y1="${ear[1] - 56}" x2="${PX}" y2="${PY + 34}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/><line x1="${ear[0]}" y1="${ear[1] + 56}" x2="${PX}" y2="${PY + 586}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 10"/>`, { o: pO });
    // ほかの人の声・まわりの音（あたまの 左から）
    const oth = win(t, c(4) + 0.2, c(5) - 0.2, 0.3);
    out += arcs(40, ear[1], 4, 50, 56, -32, 32, VR.air, 9, oth, (t * 1.1) % 1);
    const glA = prog(t, c(3) + d(3) * 0.62, 0.5) * (1 - bn), glB = prog(t, c(6) + 0.3 + d(6) * 0.55, 0.5);
    out += phead(HX, HY, HS, { who: 'S', inner: true, glow: Math.max(glA, glB), glowCol: bn > 0.5 ? VR.bone : VR.coch, skull: bn });
    if (bn > 0) for (let i = 0; i < 3; i++) out += wavy(HX - 150 + i * 100, HX - 86 + i * 100, HY - 240 - (i === 1 ? 26 : 0), 22, 8 + 3 * Math.sin(t * 9 + i), VR.bone, 6, t * 3 + i * 0.4, bn * prog(t, c(6) + 0.2, 0.4));
    out += g(`<circle cx="${ear[0]}" cy="${ear[1]}" r="56" fill="none" stroke="${C.ink}" stroke-width="5" stroke-dasharray="12 9"/>`, { o: pO });
    out += pop(badge('ほかの ひとの こえ・まわりの おと', { fill: VR.airDk, size: 32 }), t, c(4) + 0.3, 372, 190, { end: c(5) - 0.1 });
    // 耳の中
    const dr = Math.max(win(t, c(2) + d(2) * 0.55, c(5), 0.3), 0), b0 = c(3) + 0.3;
    out += g(earCut(t, {
      air: prog(t, c(1) + 0.2, 0.5), drum: dr, bones: [0, 1, 2].map(i => win(t, b0 + i * 0.45, c(5), 0.3)), pulse: win(t, b0 + 0.3, c(5) + 0.4, 0.3),
      glow: Math.max(glA, glB), glowCol: bn > 0.5 ? VR.bone : VR.coch, airDim: lerp(1, 0.25, bn), buzz: bn,
      boneO: prog(t, c(6) + 0.2, 0.3), boneK: prog(t, c(6) + 0.3, d(6) * 0.55),
    }) + g(text(960, 64, 'あたまの ほね', { size: 36, w: 900, fill: '#a3844f' }), { o: 0.9 }), { x: PX, y: PY, o: pO });
    // なまえ
    const offA = 1 - bn;
    out += tag(PX + 330, PY + 322, PX + 250, PY + 440, 'みみの あな', prog(t, c(2) + 0.3, 0.3) * offA);
    out += tag(PX + 562, PY + 254, PX + 470, PY + 192, 'こまく', prog(t, c(2) + d(2) * 0.55, 0.3), { col: VR.drumDk });
    out += tag(PX + 654, PY + 322, PX + 580, PY + 540, '3つの ちいさな ほね', prog(t, b0 + 0.2, 0.3) * offA);
    out += tag(PX + 900, PY + 404, PX + 950, PY + 500, 'うずまき', prog(t, c(3) + d(3) * 0.55, 0.3), { col: VR.cochDk });
    out += pop(badge('こまくを とおらずに、ちょくせつ うずまきへ', { fill: VR.boneDk, size: 36 }), t, c(6) + d(6) * 0.5, PX + 440, PY + 556);
    return out;
  },
});

// 4. はなすと、2つの みちの こえが まざる
SCENES.push({
  id: 'mix',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 520, HY = 530, HS = 4.6;
    const speak = t > c(0) + 0.2 && t < cueE(1) + 0.3 ? 1 : 0;
    const kA = prog(t, c(0) + d(0) * 0.3, d(0) * 0.55), kB = prog(t, c(1) + d(1) * 0.3, d(1) * 0.4);
    const gl = Math.max(prog(t, c(0) + d(0) * 0.85, 0.4) * 0.6, prog(t, c(2) + 0.3, 0.5) * (0.8 + 0.2 * Math.sin(t * 5)));
    out += phead(HX, HY, HS, { who: 'S', talk: speak, inner: true, glow: gl, skull: prog(t, c(1), 0.5) });
    out += airLoop(HX, HY, HS, kA) + boneIn(HX, HY, HS, kB);
    out += big(HX + 76 * HS, HY + 52 * HS + Math.sin(t * 5) * 5, 'あー', 80, C.ink, { o: win(t, c(0) + 0.3, cueE(1) + 0.3, 0.3) });
    out += tag(...hp(HX, HY, HS, 6, 4), HX - 250, HY + 190, 'うずまき', prog(t, c(0) + d(0) * 0.8, 0.3), { col: VR.cochDk });
    // 右：2つの みち
    const X = 1420;
    out += pop(card(760, 150) + wavy(-340, -240, 0, 50, 16, VR.air, 10, t * 1.2) + text(-200, -24, 'くうきの みち', { size: 48, w: 900, fill: VR.airDk, anchor: 'start' }) +
      text(-200, 34, 'くちから でて、ぐるっと みみへ', { size: 32, w: 700, fill: C.muted, anchor: 'start' }), t, c(0) + d(0) * 0.3, X, 300);
    out += pop(text(0, 0, '＋', { size: 84, w: 900 }), t, c(1) + 0.3, X, 420);
    out += pop(card(760, 150) + g(`<path d="${zigPoly([[-340, 0], [-240, 0]], 15, 17)}" fill="none" stroke="${VR.bone}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`) + text(-200, -24, 'ほねの みち', { size: 48, w: 900, fill: VR.boneDk, anchor: 'start' }) +
      text(-200, 34, 'あたまの ほねや からだの なかを とおる', { size: 32, w: 700, fill: C.muted, anchor: 'start' }), t, c(1) + 0.6, X, 540);
    out += pop(text(0, 0, '＝', { size: 84, w: 900 }), t, c(2) + 0.2, X, 658);
    out += pop(`<rect x="-380" y="-66" width="760" height="132" rx="28" fill="${VR.cochSoft}" stroke="${VR.coch}" stroke-width="7" filter="url(#shadow)"/>` + text(0, 2, 'いつもの じぶんの こえ', { size: 58, w: 900, fill: VR.cochDk }), t, c(2) + 0.5, X, 770);
    return out;
  },
});

// 5. ろくおん：マイクが ひろうのは くうきの ふるえ だけ
SCENES.push({
  id: 'rec',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 430, HY = 540, HS = 4.6, PX = 1430, PY = 520, PS = 1.7;
    const fin = prog(t, c(2) - 0.1, 0.4);
    out += phead(HX, HY, HS, { who: 'S', talk: t < cueE(1) ? 1 : 0, inner: true, glow: 0.7, skull: 1 });
    out += boneIn(HX, HY, HS, prog(t, 0.3, 0.8));
    // あおい道：くち → マイク
    const m = hp(HX, HY, HS, 49, 22), kA = prog(t, c(0) + 0.4, 1.3);
    out += arcs(m[0], m[1], 5, 50, 120, -28, 22, VR.air, 9, prog(t, 0.4, 0.4) * 0.8, (t * 1.2) % 1);
    out += road(`M ${m[0] + 16} ${m[1]} C ${m[0] + 240} ${m[1] + 30} ${PX - 400} ${PY + 90} ${PX - 152} ${PY + 30}`, VR.air, 12, kA) + (kA >= 0.97 ? arrowHead(PX - 138, PY + 26, Math.atan2(-60, 248), VR.air, 32) : '');
    out += phoneG(PX, PY, PS, fin > 0.5 ? 'wave' : 'rec');
    out += tag(PX, PY + 122 * PS, PX + 220, PY + 250, 'マイク', prog(t, c(0) + d(0) * 0.35, 0.3));
    out += pop(badge('マイクが ひろうのは、くうきの ふるえ だけ', { fill: VR.airDk, size: 38 }), t, c(0) + d(0) * 0.5, 960, 190, { end: c(2) - 0.1 });
    // オレンジの道は、あたまの 中だけ
    const kO = prog(t, c(1) + 0.3, 1.0), xo = hp(HX, HY, HS, 50, 40);
    out += zig([[xo[0] + 20, xo[1] + 10], [xo[0] + 300, xo[1] + 26]], kO, { amp: 13, step: 24, w: 9, head: 0, o: 0.8 });
    out += pop(cross(0, 0, 0.5), t, c(1) + 1.3, xo[0] + 350, xo[1] + 28, { d: 0.3 });
    out += pop(badge('ほねの みちは、マイクに はいらない', { fill: VR.boneDk, size: 36 }), t, c(1) + d(1) * 0.45, 1010, 800);
    out += pop(badge('ろくおんの こえ ＝ くうきの みち だけ', { fill: VR.air, size: 50, pad: 46 }), t, c(2) + d(2) * 0.3, 960, 190);
    return out;
  },
});

// 6. ほねの みちは、たかい おとほど よわめる → ろくおんは ひくい ひびきが たりない
function voiceBars(t, t0, both, { miss = 0 } = {}) {
  // ひくい・たかい の棒。both: オレンジ（ほねの みち）も のせる。miss: たりない ぶんを 点線で
  let o = '';
  [['ひくい おと', -105, 150, 120], ['たかい おと', 105, 170, 26]].forEach(([nm, x, hb, ho], i) => {
    const k1 = eo(prog(t, t0 + 0.3 + i * 0.15, 0.6)), k2 = eo(prog(t, t0 + 0.9 + i * 0.15, 0.6));
    o += `<rect x="${x - 55}" y="${130 - hb * k1}" width="110" height="${hb * k1}" rx="10" fill="${VR.air}"/>`;
    if (both) o += `<rect x="${x - 55}" y="${130 - hb - ho * k2}" width="110" height="${ho * k2}" rx="10" fill="${VR.bone}" opacity="${k2 > 0 ? 1 : 0}"/>`;
    else if (miss > 0) o += `<rect x="${x - 52}" y="${133 - hb - ho}" width="104" height="${ho - 6}" rx="10" fill="none" stroke="${VR.bone}" stroke-width="5" stroke-dasharray="12 9" opacity="${miss}"/>`;
    o += text(x, 168, nm, { size: 32, w: 900 });
  });
  return o + `<line x1="-190" y1="131" x2="190" y2="131" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
}
SCENES.push({
  id: 'low',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A：ほねの みちを 通ると
    const aO = 1 - prog(t, c(1) - 0.5, 0.4);
    if (aO > 0) {
      let a = `<rect x="800" y="250" width="320" height="510" rx="36" fill="${VR.skull}" stroke="${VR.skullDk}" stroke-width="8"/>`;
      for (let i = 0; i < 16; i++) a += `<circle cx="${(830 + rnd(i, 51) * 260).toFixed(0)}" cy="${(280 + rnd(i, 52) * 450).toFixed(0)}" r="${(5 + rnd(i, 53) * 6).toFixed(1)}" fill="${VR.skullDk}" opacity="0.3"/>`;
      a += pop(badge('ほねの みち', { fill: VR.bone, size: 46, pad: 40 }), t, 0.3, 960, 196);
      const ph = t * 0.9, i0 = c(0) + 0.3, kIn = prog(t, i0, 0.9), kMid = prog(t, i0 + 0.8, 0.7), kOut = prog(t, i0 + 1.4, 0.9);
      [['ひくい おと', 400, 170, 46, 42, 'よく とどく', VR.boneDk], ['たかい おと', 620, 46, 46, 13, 'よわく なる', C.muted]].forEach(([nm, y, len, a1, a2, res, col]) => {
        a += g(text(80, y, nm, { size: 50, w: 900, anchor: 'start' }), { o: prog(t, i0 - 0.1, 0.3) });
        a += wavy(380, lerp(380, 800, kIn), y, len, a1, VR.bone, 11, ph * 170 / len);
        a += wavy(800, lerp(800, 1120, kMid), y, len, (a1 + a2) / 2, VR.bone, 11, ph * 170 / len, 0.35);
        a += wavy(1120, lerp(1120, 1500, kOut), y, len, a2, VR.bone, 11, ph * 170 / len);
        a += g(text(1540, y, res, { size: 48, w: 900, fill: col, anchor: 'start' }), { o: prog(t, i0 + 2.3, 0.4) });
      });
      out += g(a, { o: aO });
    }
    // B：じぶんで きく こえ と ろくおんの こえ
    const bO = prog(t, c(1) - 0.2, 0.4);
    if (bO > 0) {
      const bars = (t0, both, o) => g(voiceBars(t, t0, both, o), { y: 24, s: 1.12 });
      let b = pop(`<rect x="-330" y="-22" width="44" height="44" rx="10" fill="${VR.air}"/>` + text(-272, 2, 'くうきの みち', { size: 38, w: 900, fill: VR.airDk, anchor: 'start' }) +
        `<rect x="40" y="-22" width="44" height="44" rx="10" fill="${VR.bone}"/>` + text(98, 2, 'ほねの みち', { size: 38, w: 900, fill: VR.boneDk, anchor: 'start' }), t, c(1) + 0.2, 565, 176);
      b += pop(card(480, 500) + text(0, -200, 'じぶんで きく こえ', { size: 44, w: 900 }) + bars(c(1), true), t, c(1) - 0.1, 310, 500);
      b += pop(badge('ひくい おとが つよい', { fill: VR.boneDk, size: 36 }), t, c(1) + d(1) * 0.55, 310, 800);
      b += pop(card(480, 500) + text(0, -200, 'ろくおんの こえ', { size: 44, w: 900, fill: VR.airDk }) + bars(c(2), false, { miss: prog(t, c(2) + d(2) * 0.45, 0.4) }), t, c(2) - 0.1, 820, 500);
      b += tag(820 - 118, 500 - 66, 820 + 76, 500 - 140, 'たりない', prog(t, c(2) + d(2) * 0.5, 0.3), { col: VR.boneDk, size: 34 });
      b += pop(badge('たかく、ほそく きこえる', { fill: VR.airDk, size: 36 }), t, c(2) + d(2) * 0.7, 820, 800);
      // スマホで きいている おねえちゃん
      const s0 = c(2) + 0.5, KS = 0.8, KY = 890;
      b += pop(phoneG(0, 0, 0.95, 'play'), t, s0, 1240, 650) + arcs(1325, 650, 3, 40, 46, -35, 35, VR.air, 9, prog(t, s0 + 0.5, 0.3), (t * 1.2) % 1);
      b += kidShow('S', t, 1640, KY, { s: KS, start: s0 + 0.2, n: 0, eyes: lineOf('S') ? 'wide' : 'open', look: [-8, 0], bubble: false });
      b += talkBubble('S', 1470, 330, 1626, KY - KID_HEAD.S[0] * KS - 6, 40);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 7. ろくおんの こえは、まわりの ひとが きいている こえ
SCENES.push({
  id: 'others',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 360, HY = 530, HS = 4.2, m = hp(HX, HY, HS, 49, 22);
    const L = [['M', 1330, 350, 3.2], ['F', 1610, 570, 2.8]];
    out += arcs(m[0], m[1], 6, 50, 130, -30, 14, VR.air, 9, prog(t, 0.4, 0.4) * 0.6, (t * 1.1) % 1);
    out += phead(HX, HY, HS, { who: 'S', talk: t < cueE(0) + 0.3 ? 1 : 0, inner: true, glow: 0.8, skull: 0.8 });
    out += airLoop(HX, HY, HS, prog(t, 0.3, 0.8)) + boneIn(HX, HY, HS, prog(t, 0.5, 0.8));
    L.forEach(([who, x, y, s], i) => {
      const e = hp(x, y, s, -10, 2, true), kA = prog(t, c(0) + 0.5 + i * 0.4, 1.2), ex = e[0] - 16 * s, ey = e[1] - 3 * s;
      out += phead(x, y, s, { who, flip: true, inner: true, glow: kA >= 1 ? 0.7 : 0, eyes: 'smile' });
      const p1 = [m[0] + 250, m[1] - 70 + i * 90], p2 = [ex - 250, ey + 76];
      out += road(`M ${m[0] + 16} ${m[1]} C ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${ex} ${ey}`, VR.air, 11, kA) + (kA >= 0.97 ? arrowHead(ex + 6, ey, Math.atan2(ey - p2[1], ex - p2[0]), VR.air, 30) : '');
    });
    out += pop(badge('まわりの ひとには、くうきの みち だけ', { fill: VR.airDk, size: 38 }), t, c(0) + d(0) * 0.45, 1300, 116);
    // ろくおんの こえ ＝ みんなが きいている こえ
    out += pop(card(880, 164) + phoneG(-370, 0, 0.48, 'wave') + text(-290, -36, 'ろくおんの こえ', { size: 44, w: 900, fill: VR.airDk, anchor: 'start' }) + text(-290, 30, '＝ みんなが きいて いる こえ', { size: 40, w: 900, anchor: 'start' }), t, c(1) + d(1) * 0.2, 1010, 756);
    out += pop(badge('じぶんには 2つの みち', { fill: C.accent, size: 38 }), t, c(2) + 0.2, 400, 180);
    return out;
  },
});

// 8. みみを ふさぐと、ほねの みちが よく わかる
SCENES.push({
  id: 'cover',
  draw(t) {
    const c = cue, d = k => cueE(k) - cue(k);
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const HX = 540, HY = 550, HS = 4.8;
    const hand = prog(t, c(0) + 0.4, 0.6), blk = prog(t, c(0) + 1.0, 0.4), boom = prog(t, c(2) + 0.2, 0.5), bT = lineOf('B') ? 1 : 0;
    const speak = (t > c(0) + 1.0 && t < cueE(1)) || (t > c(2) + 0.2 && t < cueE(2)) ? 1 : 0;
    const hop = bT ? Math.abs(Math.sin(t * 9)) * 10 : 0, Y = HY - hop;
    // ひびく（あたまの 中で 大きく）
    if (boom > 0) for (let i = 0; i < 3; i++) { const f = ((t * 0.9 + i / 3) % 1), [gx, gy] = hp(HX, Y, HS, 6, 4); out += `<circle cx="${gx}" cy="${gy}" r="${40 + f * 190}" fill="none" stroke="${VR.bone}" stroke-width="12" opacity="${(boom * 0.5 * (1 - f)).toFixed(2)}"/>`; }
    out += phead(HX, Y, HS, { who: 'B', talk: speak, inner: true, glow: Math.max(prog(t, c(1) + 0.3, 0.4), 0.3), glowCol: VR.bone, hand, skull: prog(t, c(1), 0.4), eyes: bT ? 'wide' : 'open', mouth: bT ? 'o' : 'smile' });
    out += airLoop(HX, Y, HS, prog(t, 0.2, 0.6), { o: lerp(1, 0.3, blk) });
    out += pop(cross(0, 0, 0.42), t, c(0) + 1.1, ...hp(HX, Y, HS, -31, -9), { d: 0.3 });
    out += boneIn(HX, Y, HS, prog(t, 0.4, 0.6), { w: lerp(9, 13, boom) });
    out += big(HX + 76 * HS, Y + 50 * HS + Math.sin(t * 5) * 5, 'あー', 80, C.ink, { o: speak ? 1 : 0 });
    out += tag(...hp(HX, Y, HS, -31, -9), 190, 400, 'みみを ふさぐ', win(t, c(0) + 1.4, c(2) - 0.2, 0.3), { col: VR.airDk, size: 36 });
    out += pop(badge('きこえるのは、おもに ほねの みち', { fill: VR.boneDk, size: 40 }), t, c(1) + d(1) * 0.3, 1340, 196);
    // ボワン
    out += pop(big(0, 0, 'ボワン', 104, VR.bone, { r: -8 + Math.sin(t * 14) * 2 }), t, c(2) + d(2) * 0.45, 190, 640);
    // くらべ
    const cO = prog(t, c(2) - 0.1, 0.4);
    if (cO > 0) {
      let q = card(740, 340);
      q += text(-330, -92, 'ふさがない', { size: 40, w: 900, anchor: 'start' }) + wavy(-70, 320, -92, 70, 16, VR.bone, 9, t * 1.4);
      q += `<line x1="-330" y1="-24" x2="330" y2="-24" stroke="${C.line}" stroke-width="4"/>`;
      q += text(-330, 60, 'ふさぐ', { size: 40, w: 900, anchor: 'start', fill: VR.boneDk }) + wavy(-70, 320, 60, 130, 16 + 30 * eo(prog(t, c(2) + 0.5, 0.8)), VR.bone, 13, t * 0.75);
      q += g(text(0, 140, 'おおきく、こもって ひびく', { size: 38, w: 900, fill: VR.boneDk }), { o: prog(t, c(2) + d(2) * 0.5, 0.4) });
      out += g(q, { x: 1420, y: 620, o: cO });
    }
    out += talkBubble('B', 1230, 330, ...hp(HX, Y, HS, 52, -22), 46);
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
      const ans = 'いつもの こえには、ほねを とおる おとが まざる';
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.redUi}"/>` + text(-530, 3, '③', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, ans, { size: fitSize(ans, 56, 1010, 900), w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['じぶんには 2つの みち', C.accent], ['ろくおんは くうきの みち だけ', VR.airDk], ['ひくい ひびきが たりない', VR.boneDk]], t, 960, 660, { size: 34, start: 2.6, step: 1.2 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const earIc = `<clipPath id="lkEar"><circle r="56"/></clipPath><circle r="56" fill="${VR.boneSoft}"/><g clip-path="url(#lkEar)">${phead(-5, 4, 1.08, { who: 'B', hand: 1, body: false, mouth: 'o' })}</g>`;
      const cmpIc = wavy(-52, 52, -20, 40, 9, VR.bone, 8, 0) + wavy(-52, 52, 22, 70, 20, VR.bone, 10, 0.2);
      const items = [
        [earIc, 'てのひらで りょうみみを そっと おおって「あー」', C.ink, 320],
        [cmpIc, 'おおわない ときと、こえを くらべる', C.ink, 426],
        [phoneG(0, 0, 0.36, 'rec'), 'かぞくと おなじ ことばを ろくおんして、ききくらべる', C.ink, 532],
        [warnIcon(0.8), 'みみの あなに、ゆびや ものを いれない', C.red, 652],
        [warnIcon(0.8), 'みみの そばで、おおきな こえを ださない', C.red, 752],
      ];
      items.forEach(([ic, s1, col, y], i) => { b += pop(ic + text(110, 2, s1, { size: 38, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 210, y); });
      // 絵：みみを おおって「あー」
      const sp = t > cue(1) + 0.6 && t < cueE(2) ? 1 : 0;
      b += pop(card(440, 360) + phead(-44, -34, 2.3, { who: 'B', hand: prog(t, cue(1) + 0.5, 0.5), talk: sp, inner: true, glow: 0.8, glowCol: VR.bone }) + big(132, 60, 'あー', 60, C.ink, { o: sp }), t, cue(1) + 0.3, 1570, 400);
      b += kidShow('K', t, 1640, 838, { s: 0.74, start: cue(3) + 0.3, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「こえ」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
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
