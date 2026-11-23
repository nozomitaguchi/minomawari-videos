// みのまわり図鑑 動画「電車は、どうやって カーブを 曲がるの？」
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
const TOPIC = 'でんしゃ';
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
// ---------- 電車の道具 ----------
const TR = {
  body: '#f6f2e6', stripe: '#3b9b5f', dark: '#3c4650', glass: '#bfe0f2',
  rail: '#7d8790', railD: '#5d666e', tie: '#b08a5e', ballast: '#ddd3c0',
  steel: '#b9c2ca', steelD: '#7c8690', steelL: '#e3e8ec',
  out: '#e8742a', inn: '#2f7de1', fl: '#d9452f', grass: '#bfe3a8', grassD: '#a5d48f',
};
const rad = d => d * Math.PI / 180;
// 円の上の点（角度は度。右が0、上が90）
const onArc = (cx, cy, R, a) => [cx + R * Math.cos(rad(a)), cy - R * Math.sin(rad(a))];
function arcPath(cx, cy, R, a0, a1) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 2));
  let d = '';
  for (let i = 0; i <= n; i++) { const [x, y] = onArc(cx, cy, R, lerp(a0, a1, i / n)); d += (i ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1); }
  return d;
}
// 上から見た線路（円弧）。colO は外がわ、colI は内がわのレールの色
function trackArc(cx, cy, R, a0, a1, { gauge = 46, rail = 8, colO = TR.rail, colI = TR.rail, tieStep = 2, tieW = 10 } = {}) {
  let o = `<path d="${arcPath(cx, cy, R, a0, a1)}" fill="none" stroke="${TR.ballast}" stroke-width="${gauge + 56}"/>`;
  const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
  let ties = '';
  for (let a = lo + tieStep / 2; a <= hi; a += tieStep) {
    const [x1, y1] = onArc(cx, cy, R - gauge / 2 - 14, a), [x2, y2] = onArc(cx, cy, R + gauge / 2 + 14, a);
    ties += `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} `;
  }
  o += `<path d="${ties}" stroke="${TR.tie}" stroke-width="${tieW}" stroke-linecap="round"/>`;
  o += `<path d="${arcPath(cx, cy, R + gauge / 2, a0, a1)}" fill="none" stroke="${colO}" stroke-width="${rail}"/>`;
  o += `<path d="${arcPath(cx, cy, R - gauge / 2, a0, a1)}" fill="none" stroke="${colI}" stroke-width="${rail}"/>`;
  return o;
}
// 上から見た車両（右向き。front なら右のはしが先頭）
const carTop = (len = 190, w = 64, front = false) => {
  let o = `<rect x="${-len / 2}" y="${-w / 2}" width="${len}" height="${w}" rx="${front ? 18 : 10}" fill="${TR.body}" stroke="${TR.dark}" stroke-width="5"/>`;
  o += `<path d="M ${-len / 2 + 12} ${-w / 2 + 9} L ${len / 2 - 14} ${-w / 2 + 9} M ${-len / 2 + 12} ${w / 2 - 9} L ${len / 2 - 14} ${w / 2 - 9}" stroke="${TR.stripe}" stroke-width="7" stroke-linecap="round"/>`;
  o += `<rect x="${-len * 0.3}" y="${-w * 0.2}" width="${len * 0.34}" height="${w * 0.4}" rx="6" fill="#dcd8cb" stroke="${TR.dark}" stroke-width="3"/>`;
  if (front) {
    o += `<path d="M ${len / 2 - 40} ${-w / 2 + 14} L ${len / 2 - 14} ${-w / 2 + 16} L ${len / 2 - 14} ${w / 2 - 16} L ${len / 2 - 40} ${w / 2 - 14} Z" fill="#7fb6d6" stroke="${TR.dark}" stroke-width="3"/>`;
    o += `<circle cx="${len / 2 - 5}" cy="${-w * 0.27}" r="5" fill="#ffd23a"/><circle cx="${len / 2 - 5}" cy="${w * 0.27}" r="5" fill="#ffd23a"/>`;
  }
  return o;
};
// 円弧の線路の上の電車。aHead は先頭のはしの角度。角度がへる向き（時計回り）に進む
function trainOnArc(cx, cy, R, aHead, { n = 3, len = 190, w = 64, gap = 14 } = {}) {
  const da = (len + gap) / R * 180 / Math.PI; let o = '';
  for (let i = n - 1; i >= 0; i--) {
    const a = aHead + da * (i + 0.5), [x, y] = onArc(cx, cy, R, a);
    o += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(90 - a).toFixed(2)})">${carTop(len, w, i === 0)}</g>`;
  }
  return o;
}
// 横から見た電車（右向き。原点は車輪の下＝レールの上）
const trainSide = (wa = 0) => {
  let o = `<path d="M -50 -196 L -22 -236 L 6 -196 M -44 -238 L 30 -238" fill="none" stroke="${TR.dark}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<rect x="-200" y="-196" width="400" height="146" rx="22" fill="${TR.body}" stroke="${TR.dark}" stroke-width="6"/>`;
  o += `<rect x="-197" y="-110" width="394" height="20" fill="${TR.stripe}"/>`;
  [-168, -92].forEach(x => { o += `<rect x="${x}" y="-174" width="58" height="50" rx="8" fill="${TR.glass}" stroke="${TR.dark}" stroke-width="4"/>`; });
  o += `<rect x="-20" y="-178" width="52" height="118" rx="6" fill="#ebe6d6" stroke="${TR.dark}" stroke-width="4"/><rect x="-12" y="-170" width="36" height="42" rx="5" fill="${TR.glass}"/><line x1="6" y1="-178" x2="6" y2="-60" stroke="${TR.dark}" stroke-width="3"/>`;
  o += `<rect x="48" y="-174" width="52" height="50" rx="8" fill="${TR.glass}" stroke="${TR.dark}" stroke-width="4"/>`;
  o += `<path d="M 118 -176 L 176 -176 Q 190 -176 190 -162 L 190 -124 L 118 -124 Z" fill="#9fd0ea" stroke="${TR.dark}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<circle cx="186" cy="-76" r="8" fill="#ffd23a" stroke="${TR.dark}" stroke-width="3"/>`;
  o += `<rect x="-176" y="-54" width="352" height="22" rx="6" fill="${TR.dark}"/>`;
  [-140, -82, 82, 140].forEach(x => {
    o += `<g transform="translate(${x} -25) rotate(${wa})"><circle r="25" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="5"/><circle r="8" fill="${TR.dark}"/><line x1="0" y1="-20" x2="0" y2="20" stroke="${TR.steelD}" stroke-width="4"/><line x1="-20" y1="0" x2="20" y2="0" stroke="${TR.steelD}" stroke-width="4"/></g>`;
  });
  return o;
};
// 横から見た新幹線ふうの電車（右向き）
const shinSide = () => {
  let o = `<path d="M -200 -150 Q -200 -172 -178 -172 L 60 -172 Q 150 -168 214 -96 Q 226 -78 204 -66 L 188 -52 L -178 -52 Q -200 -52 -200 -74 Z" fill="#fbfbf7" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<path d="M -197 -96 L 212 -96 L 206 -84 L -197 -84 Z" fill="#2f6fc4"/>`;
  [-170, -116, -62, -8].forEach(x => { o += `<rect x="${x}" y="-150" width="38" height="32" rx="7" fill="${TR.glass}" stroke="${TR.dark}" stroke-width="3"/>`; });
  o += `<path d="M 78 -154 Q 130 -146 158 -118 L 96 -118 Q 82 -118 80 -132 Z" fill="#9fd0ea" stroke="${TR.dark}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<rect x="-176" y="-54" width="352" height="20" rx="6" fill="${TR.dark}"/>`;
  [-140, -86, 86, 140].forEach(x => { o += `<circle cx="${x}" cy="-24" r="24" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="5"/><circle cx="${x}" cy="-24" r="7" fill="${TR.dark}"/>`; });
  return o;
};

// ---------- 前から見た車輪（輪軸）。絵では ななめを 大きく描いている ----------
const WS = { xi: 265, xt0: 291, xo: 395, rin: 210, rout: 150, rf: 242, ax: 26 };
WS.xr = (WS.xt0 + WS.xo) / 2;  // まん中にあるとき、レールがのる所
// まん中から lx はなれた所の、ふみづらの半径
const wsR = lx => WS.rin - (lx - WS.xt0) / (WS.xo - WS.xt0) * (WS.rin - WS.rout);
// 車輪1つ（右がわ。左は左右を反転して使う）
function wheelFront({ fl = null, wedge = 0 } = {}) {
  const { xi, xt0, xo, rin, rout, rf } = WS;
  let o = `<rect x="${xo - 4}" y="-46" width="20" height="92" rx="6" fill="${TR.steelD}"/>`;
  o += `<path d="M ${xo} ${-rout} L ${xt0} ${-rin} L ${xt0 - 6} ${-rf} L ${xi} ${-rf} L ${xi} ${rf} L ${xt0 - 6} ${rf} L ${xt0} ${rin} L ${xo} ${rout} Z" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<rect x="${xt0 + 14}" y="${-rout + 34}" width="${xo - xt0 - 34}" height="${(rout - 34) * 2}" rx="14" fill="${TR.steelL}" opacity="0.7"/>`;
  if (fl) o += `<path d="M ${xt0} ${-rin} L ${xt0 - 6} ${-rf} L ${xi} ${-rf} L ${xi} ${-rin + 26} Z M ${xt0} ${rin} L ${xt0 - 6} ${rf} L ${xi} ${rf} L ${xi} ${rin - 26} Z" fill="${fl}" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  if (wedge > 0) {
    // 平らだったら（点線）とのちがい
    o += `<path d="M ${xt0} ${-rin} L ${xo} ${-rin} L ${xo} ${-rout} Z" fill="${TR.out}" opacity="${0.45 * wedge}"/>`;
    o += `<line x1="${xt0}" y1="${-rin}" x2="${xo + 34}" y2="${-rin}" stroke="${TR.dark}" stroke-width="5" stroke-dasharray="12 10" opacity="${wedge}"/>`;
    o += `<line x1="${xt0}" y1="${-rin}" x2="${xo}" y2="${-rout}" stroke="${TR.out}" stroke-width="12" stroke-linecap="round" opacity="${wedge}"/>`;
    o += `<line x1="${xt0}" y1="${rin}" x2="${xo}" y2="${rout}" stroke="${TR.out}" stroke-width="12" stroke-linecap="round" opacity="${wedge}"/>`;
  }
  return o;
}
function wheelsetFront(o = {}) {
  const { xi, ax, xo } = WS;
  let s = `<rect x="${-xo - 60}" y="-20" width="${(xo + 60) * 2}" height="40" rx="10" fill="${TR.steelD}"/>`;
  s += `<rect x="${-xo - 66}" y="-34" width="42" height="68" rx="10" fill="${TR.dark}"/><rect x="${xo + 24}" y="-34" width="42" height="68" rx="10" fill="${TR.dark}"/>`;
  s += `<rect x="${-xi}" y="${-ax}" width="${xi * 2}" height="${ax * 2}" fill="#98a2ab" stroke="${TR.dark}" stroke-width="6"/>`;
  s += `<rect x="${-xi + 6}" y="${-ax + 8}" width="${xi * 2 - 12}" height="10" rx="5" fill="#fff" opacity="0.45"/>`;
  s += wheelFront(o) + `<g transform="scale(-1 1)">${wheelFront(o)}</g>`;
  return s;
}
// レールの切り口（top はレールの上の面）
const railCut = (x, top) =>
  `<rect x="${x - 7}" y="${top + 20}" width="14" height="56" fill="${TR.railD}"/><rect x="${x - 48}" y="${top + 72}" width="96" height="16" rx="4" fill="${TR.railD}"/><rect x="${x - 22}" y="${top}" width="44" height="30" rx="9" fill="${TR.railD}"/><rect x="${x - 15}" y="${top + 4}" width="30" height="6" rx="3" fill="#fff" opacity="0.35"/>`;
// 前から見た絵いっしき。s は外がわ（画面の左）へずれた大きさ
function frontView({ cx = 960, railTop = 700, s = 0, fl = null, wedge = 0, lines = 0 } = {}) {
  const rL = wsR(WS.xr - s), rR = wsR(WS.xr + s);
  const tilt = Math.atan((rL - rR) / (2 * WS.xr)) * 180 / Math.PI, cy = railTop - (rL + rR) / 2;
  let o = `<path d="M ${cx - 640} ${railTop + 138} Q ${cx - 600} ${railTop + 96} ${cx - 540} ${railTop + 96} L ${cx + 540} ${railTop + 96} Q ${cx + 600} ${railTop + 96} ${cx + 640} ${railTop + 138} Z" fill="${TR.ballast}"/>`;
  o += `<rect x="${cx - 500}" y="${railTop + 86}" width="1000" height="26" rx="8" fill="${TR.tie}"/>`;
  o += railCut(cx - WS.xr, railTop) + railCut(cx + WS.xr, railTop);
  let w = wheelsetFront({ fl, wedge });
  if (lines > 0) {
    // レールにのっている所の「まるの大きさ」（前から見ると たての線）
    const xl = -(WS.xr - s), xr2 = WS.xr + s;
    w += `<line x1="${xl}" y1="${-rL}" x2="${xl}" y2="${rL}" stroke="${TR.out}" stroke-width="14" stroke-linecap="round" opacity="${lines}"/>`;
    w += `<line x1="${xr2}" y1="${-rR}" x2="${xr2}" y2="${rR}" stroke="${TR.inn}" stroke-width="14" stroke-linecap="round" opacity="${lines}"/>`;
  }
  o += `<g transform="translate(${cx - s} ${cy}) rotate(${tilt})">${w}</g>`;
  return { svg: o, cy, rL, rR, xL: cx - WS.xr, xR: cx + WS.xr };
}
// 上から見た輪軸（右へ進む向き。左手がわ＝上が colA、右手がわ＝下が colB）
function wheelsetTop(gauge, { colA = TR.steelD, colB = TR.steelD, len = 96, w = 40 } = {}) {
  const h = gauge / 2;
  // 車輪は まん中がわ（つばのある がわ）が 長い
  const wheel = (sy, col) => `<path d="M ${-len / 2} ${sy * (h - w / 2)} L ${len / 2} ${sy * (h - w / 2)} L ${len * 0.36} ${sy * (h + w / 2)} L ${-len * 0.36} ${sy * (h + w / 2)} Z" fill="${col}" stroke="${TR.dark}" stroke-width="5" stroke-linejoin="round"/>`;
  return `<rect x="-11" y="${-h}" width="22" height="${gauge}" fill="#98a2ab" stroke="${TR.dark}" stroke-width="5"/>` + wheel(-1, colA) + wheel(1, colB);
}
// 注意のしるし
const warnIcon = () => `<path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 });
// 矢印（x1,y1 → x2,y2）
function arrow(x1, y1, x2, y2, col = C.ink, wdt = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = wdt * 2.6;
  const p = k => `${x2 - h * Math.cos(a + k)} ${y2 - h * Math.sin(a + k)}`;
  return `<path d="M ${x1} ${y1} L ${x2} ${y2} M ${p(0.5)} L ${x2} ${y2} L ${p(-0.5)}" fill="none" stroke="${col}" stroke-width="${wdt}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// 左（画面の内がわ）を向いたカメレオン。吹き出しは talkBubble で べつに出す
const chamL = (t, x, y, o = {}) => `<g transform="translate(${2 * x} 0) scale(-1 1)">${kidShow('K', t, x, y, { enter: 'pop', ...o, bubble: false })}</g>`;
const OPTS = [['①', 'うんてんしさんが ハンドルで まげている'], ['②', 'しゃりんが ななめの かたちに なっている'], ['③', 'そとがわの しゃりんだけ はやく まわっている']];

// 1. つかみ：電車がカーブを曲がっていく（上から見たところ）
SCENES.push({
  id: 'hook',
  draw(t) {
    const CX = 960, CY = 1150, R = 800;
    let out = `<rect width="1920" height="1080" fill="${TR.grass}"/>`;
    out += [[300, 250, 190, 70], [1500, 190, 220, 80], [960, 720, 380, 120], [1760, 820, 160, 60], [150, 780, 150, 60]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TR.grassD}" opacity="0.55"/>`).join('');
    out += trackArc(CX, CY, R, 205, -25, { gauge: 46, rail: 8, tieStep: 1.6 });
    // 線路と子どもの間には さく（線路には入らない）
    let posts = '';
    for (let k = 200; k >= -20; k -= 3) { const [x1, y1] = onArc(CX, CY, R - 80, k); posts += `M ${x1.toFixed(1)} ${y1.toFixed(1)} l 0 -22 `; }
    out += `<path d="${arcPath(CX, CY, R - 80, 200, -20)}" fill="none" stroke="#fffaf0" stroke-width="6"/><path d="${arcPath(CX, CY, R - 80, 200, -20).replace(/ (-?[0-9.]+) L/g, (m, v) => ' ' + (+v - 14).toFixed(1) + ' L')}" fill="none" stroke="#fffaf0" stroke-width="5"/><path d="${posts}" stroke="#fffaf0" stroke-width="7" stroke-linecap="round"/>`;
    out += tree(170, 360, 0.8) + tree(330, 450, 0.6) + house(1690, 400, 0.9) + tree(1840, 450, 0.7) + tree(1540, 300, 0.6, '#4f9d58');
    // 電車：左下から入って、カーブにそって右下へ（角度がへる向き＝時計回り）
    const aH = lerp(196, -55, prog(t, 0.2, cueE(3) + 0.4));
    out += trainOnArc(CX, CY, R, aH, { n: 3 });
    // カーブのしるし
    const ck = win(t, cue(1) + 0.2, cue(3) - 0.2, 0.4);
    if (ck > 0) {
      const [hx, hy] = onArc(CX, CY, R + 96, 52), [px, py] = onArc(CX, CY, R + 96, 56);
      out += g(`<path d="${arcPath(CX, CY, R + 96, 128, 54)}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>` + arrow(px, py, hx, hy, '#fff', 12), { o: ck * 0.95 });
      out += pop(badge('カーブ', { fill: C.blueUi, size: 46, pad: 40 }), t, cue(1) + 0.4, 960, 170, { end: cue(3) - 0.2 });
    }
    out += kidShow('S', t, 905, 835, { s: 0.42, start: 0.3, n: 0, look: [3, -9], bubble: false });
    out += kidShow('B', t, 1045, 835, { s: 0.42, start: 0.5, n: 1, look: [-2, -9], bubble: false });
    out += talkBubble('S', 960, 545, 905, 835 - 452 * 0.42 - 6);
    out += pop(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre, extra: `stroke="#fffaf0" stroke-width="20" paint-order="stroke" stroke-linejoin="round"` }), t, cue(3) + 0.6, 975, 560);
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 230);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${TR.stripe}">電車</tspan>は、どうやって</text>`, { x: 960, y: 410, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="128" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${TR.out}">カーブ</tspan>を 曲がるの？</text>`, { x: 960, y: 590, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const ic = `<line x1="-330" y1="0" x2="330" y2="0" stroke="${TR.rail}" stroke-width="10" stroke-linecap="round"/>` + trainSide(0);
      out += pop(ic, t, t0 + 1.8, 960, 930, { s: 0.9 });
    }
    return out;
  },
});

// 2. 予想
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'どうやって まがっている？', { size: 80, w: 900 }), t, 0.3, 900, 215);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 45, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 400 + i * 168);
    });
    out += kidShow('B', t, 1700, 860, { s: 0.66, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1700, y: 330, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. カーブでは、外がわのレールのほうが長い（上から見たところ）
SCENES.push({
  id: 'curve',
  draw(t) {
    const CX = 560, CY = 830, RO = 540, RI = 380, RM = 460, A0 = 176, A1 = 4;
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const hl = prog(t, cue(0) + 1.4, 0.5), back2 = prog(t, cue(2) - 0.3, 0.5);
    const colO = mix(TR.rail, TR.out, hl * (1 - back2)), colI = mix(TR.rail, TR.inn, prog(t, cue(0) + 3.6, 0.5) * (1 - back2));
    out += trackArc(CX, CY, RM, A0, A1, { gauge: RO - RI, rail: 18, colO, colI, tieStep: 5, tieW: 16 });
    out += pop(badge('うえから みた カーブ', { fill: C.blueUi, size: 40 }), t, 0.3, 1480, 190, { end: cue(1) - 0.2 });
    // レールの名前
    out += pop(text(0, 0, 'そとがわの レール', { size: 46, w: 900, fill: TR.out }), t, cue(0) + 1.5, 560, 215);
    out += pop(text(0, 0, 'うちがわの レール', { size: 46, w: 900, fill: TR.inn }), t, cue(0) + 3.7, 560, 620);
    // 長さくらべ：点が同じだけ回ると、のびる棒の長さがちがう
    const k = eio(prog(t, cue(1) + 0.9, 2.6));
    const cO = win(t, cue(1) - 0.1, 99, 0.4);
    if (cO > 0) {
      const a = lerp(A0, A1, k);
      if (k > 0 && back2 < 1) {
        const [ox, oy] = onArc(CX, CY, RO, a), [ix, iy] = onArc(CX, CY, RI, a);
        out += g(`<path d="${arcPath(CX, CY, RO, A0, a)}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/><path d="${arcPath(CX, CY, RI, A0, a)}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>` +
          `<circle cx="${ox}" cy="${oy}" r="22" fill="${TR.out}" stroke="#fff" stroke-width="6"/><circle cx="${ix}" cy="${iy}" r="22" fill="${TR.inn}" stroke="#fff" stroke-width="6"/>`, { o: 1 - back2 });
      }
      const SC = 0.33, lo = RO * rad(A0 - A1) * SC, li = RI * rad(A0 - A1) * SC;
      let c = card(700, 330) + text(0, -112, 'ながさ くらべ', { size: 44, w: 900 });
      c += text(-310, -30, 'そと', { size: 38, w: 900, anchor: 'start', fill: TR.out }) + `<rect x="-215" y="-52" width="${Math.max(lo * k, 0.1)}" height="44" rx="22" fill="${TR.out}"/>`;
      c += text(-310, 62, 'うち', { size: 38, w: 900, anchor: 'start', fill: TR.inn }) + `<rect x="-215" y="40" width="${Math.max(li * k, 0.1)}" height="44" rx="22" fill="${TR.inn}"/>`;
      out += g(c, { x: 1500, y: 400, o: cO });
      out += pop(badge('そとがわの ほうが ながい', { fill: TR.out, size: 42 }), t, cue(1) + 3.6, 1500, 640, { end: cue(2) - 0.1 });
    }
    // 車輪：外の車輪のほうが たくさん進む
    const wk = prog(t, cue(2) + 0.2, 0.4);
    if (wk > 0) {
      const m = eio(prog(t, cue(2) + 0.8, 4.2)), a = lerp(168, 12, m);
      out += `<path d="${arcPath(CX, CY, RO, 168, a)}" fill="none" stroke="${TR.out}" stroke-width="20" stroke-linecap="round"/><path d="${arcPath(CX, CY, RI, 168, a)}" fill="none" stroke="${TR.inn}" stroke-width="20" stroke-linecap="round"/>`;
      const [x, y] = onArc(CX, CY, RM, a);
      out += g(`<g transform="rotate(${90 - a})">${wheelsetTop(RO - RI, { colA: TR.out, colB: TR.inn })}</g>`, { x, y, o: wk });
      out += pop(badge('そとの しゃりん：たくさん すすむ', { fill: TR.out, size: 38 }), t, cue(2) + 1.2, 1500, 640);
      out += pop(badge('うちの しゃりん：すこし', { fill: TR.inn, size: 38 }), t, cue(2) + 3.4, 1500, 740);
    }
    return out;
  },
});

// 4. 車輪は、右と左が1本のじくでつながっている
function wheelsetOblique(a) {
  const rx = 62, ry = 170, D = 280, th = 30;
  const wheel = cx => {
    let o = `<ellipse cx="${cx - th}" cy="0" rx="${rx}" ry="${ry}" fill="${TR.steelD}" stroke="${TR.dark}" stroke-width="6"/>`;
    o += `<rect x="${cx - th}" y="${-ry}" width="${th}" height="${ry * 2}" fill="${TR.steelD}"/>`;
    o += `<line x1="${cx - th}" y1="${-ry}" x2="${cx}" y2="${-ry}" stroke="${TR.dark}" stroke-width="6"/><line x1="${cx - th}" y1="${ry}" x2="${cx}" y2="${ry}" stroke="${TR.dark}" stroke-width="6"/>`;
    o += `<ellipse cx="${cx}" cy="0" rx="${rx}" ry="${ry}" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="6"/>`;
    o += `<ellipse cx="${cx}" cy="0" rx="${rx * 0.74}" ry="${ry * 0.74}" fill="${TR.steelL}"/>`;
    for (let k = 0; k < 4; k++) { const b = a + k * Math.PI / 2; o += `<line x1="${cx}" y1="0" x2="${cx + rx * 0.7 * Math.cos(b)}" y2="${ry * 0.7 * Math.sin(b)}" stroke="${TR.steelD}" stroke-width="9" stroke-linecap="round"/>`; }
    o += `<circle cx="${cx + rx * 0.56 * Math.cos(a)}" cy="${ry * 0.56 * Math.sin(a)}" r="17" fill="${C.red}" stroke="#fff" stroke-width="4"/>`;
    o += `<ellipse cx="${cx}" cy="0" rx="16" ry="32" fill="${TR.steelD}" stroke="${TR.dark}" stroke-width="4"/>`;
    return o;
  };
  let o = `<ellipse cx="-10" cy="${ry + 14}" rx="${D + 110}" ry="20" fill="#3d311f" opacity="0.1"/>`;
  o += wheel(-D);
  o += `<rect x="${-D}" y="-24" width="${D * 2 - th - rx + 6}" height="48" fill="#98a2ab" stroke="${TR.dark}" stroke-width="6"/><rect x="${-D + 14}" y="-16" width="${D * 2 - th - rx - 26}" height="9" rx="4" fill="#fff" opacity="0.45"/>`;
  o += wheel(D);
  return o;
}
SCENES.push({
  id: 'axle',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const WX = 800, WY = 610;
    // 電車と、車輪の場所
    out += pop(`<line x1="-250" y1="0" x2="250" y2="0" stroke="${TR.rail}" stroke-width="10" stroke-linecap="round"/>` + trainSide(0), t, 0.3, 330, 360, { s: 0.7 });
    const zk = prog(t, 0.9, 0.5);
    if (zk > 0) {
      out += g(`<circle cx="${330 + 140 * 0.7}" cy="${360 - 25 * 0.7}" r="32" fill="none" stroke="${C.red}" stroke-width="8"/>` +
        `<path d="M ${330 + 140 * 0.7 + 24} ${360 - 25 * 0.7 + 22} L ${WX - 250} ${WY - 150}" stroke="${C.red}" stroke-width="6" stroke-dasharray="6 12" stroke-linecap="round" fill="none"/>`, { o: zk });
    }
    out += pop(wheelsetOblique(Math.max(0, t - 1.2) * 2.4), t, 1.1, WX, WY);
    out += pop(badge('じく', { fill: C.ink, size: 40 }), t, cue(0) + 3.6, WX - 40, WY - 78);
    out += pop(text(0, 0, 'みぎと ひだりが がっちり つながっている', { size: 44, w: 900 }), t, cue(0) + 4.4, 1150, 330, { end: cue(1) });
    out += pop(text(0, 0, 'みぎも ひだりも、おなじだけ まわる', { size: 46, w: 900, fill: C.red }), t, cue(1) + 0.3, 1130, 330, { end: cue(3) - 0.2 });
    out += kidShow('B', t, 1740, 840, { s: 0.5, start: cue(2) - 0.9, n: 0 });
    // それなのに、カーブを曲がっていく
    const qk = prog(t, cue(3) + 0.2, 0.5);
    if (qk > 0) {
      const a = lerp(150, 60, ((t - cue(3)) * 0.16) % 1);
      let c = card(480, 290);
      c += `<clipPath id="axc"><rect x="-220" y="-125" width="440" height="250" rx="20"/></clipPath><g clip-path="url(#axc)"><rect x="-240" y="-145" width="480" height="290" fill="${TR.grass}"/>` +
        trackArc(0, 330, 360, 160, 20, { gauge: 30, rail: 6, tieStep: 4, tieW: 7 }) + trainOnArc(0, 330, 360, a, { n: 2, len: 110, w: 40, gap: 10 }) + `</g>`;
      out += g(c, { x: 1470, y: 330, o: qk, s: lerp(0.9, 1, eo(qk)) });
      out += pop(text(0, 0, '？', { size: 130, w: 900, fill: C.ochre, extra: `stroke="#fffaf0" stroke-width="18" paint-order="stroke" stroke-linejoin="round"` }), t, cue(3) + 1.0, 1650, 230);
    }
    return out;
  },
});

// 5. ひみつは車輪の形：外がわほど細い（前から見たところ）
SCENES.push({
  id: 'cone',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const wk = prog(t, cue(1) + 0.6, 0.6);
    const fv = frontView({ wedge: wk });
    out += g(fv.svg, { o: prog(t, 0.2, 0.4) });
    out += pop(badge('まえから みた しゃりん', { fill: C.blueUi, size: 42 }), t, 0.5, 960, 180, { end: cue(1) + 3.2 });
    out += pop(text(0, 0, 'そとがわ', { size: 42, w: 900, fill: C.muted }) + arrow(-110, 0, -190, 0, C.muted, 8), t, cue(1) + 2.2, 330, fv.cy - 4);
    out += pop(text(0, 0, 'そとがわ', { size: 42, w: 900, fill: C.muted }) + arrow(110, 0, 190, 0, C.muted, 8), t, cue(1) + 2.2, 1590, fv.cy - 4);
    // ふとい・ほそい
    const lab = (x, y, s, col, st) => pop(text(0, 0, s, { size: 48, w: 900, fill: col }), t, st, x, y);
    out += lab(960 - WS.xt0 + 44, fv.cy - WS.rin - 76, 'ふとい', TR.out, cue(1) + 3.4) + lab(960 + WS.xt0 - 44, fv.cy - WS.rin - 76, 'ふとい', TR.out, cue(1) + 3.4);
    out += lab(960 - WS.xo - 130, fv.cy - WS.rout + 14, 'ほそい', TR.inn, cue(1) + 4.2) + lab(960 + WS.xo + 130, fv.cy - WS.rout + 14, 'ほそい', TR.inn, cue(1) + 4.2);
    out += pop(badge('そとへ いくほど ほそい', { fill: TR.out, size: 46, pad: 40 }), t, cue(1) + 5.0, 960, 150);
    return out;
  },
});

// 6. カーブでは、車輪が外がわへずれる → 外は太いところ、内は細いところ
SCENES.push({
  id: 'shift',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const sk = eio(prog(t, cue(0) + 1.4, 1.6)), ln = prog(t, cue(1) + 0.8, 0.5);
    const fv = frontView({ s: 26 * sk, lines: ln });
    out += fv.svg;
    out += pop(badge('カーブの そとがわ', { fill: TR.out, size: 40 }), t, cue(0) + 0.2, 320, 200);
    out += pop(badge('カーブの うちがわ', { fill: TR.inn, size: 40 }), t, cue(0) + 0.5, 1600, 200);
    const ak = win(t, cue(0) + 1.2, cue(1) + 0.4, 0.4);
    out += g(text(40, 0, 'そとがわへ ずれる', { size: 48, w: 900 }) + arrow(-210, 0, -330, 0, C.ink, 12), { x: 1000, y: 200, o: ak });
    // レールにのる所
    if (ln > 0) {
      const xl = 960 - 26 * sk - (WS.xr - 26 * sk), xr2 = 960 - 26 * sk + (WS.xr + 26 * sk);
      out += g(`<circle cx="${fv.xL}" cy="700" r="26" fill="none" stroke="${TR.out}" stroke-width="9"/><circle cx="${fv.xR}" cy="700" r="26" fill="none" stroke="${TR.inn}" stroke-width="9"/>`, { o: ln });
      out += pop(badge('ふとい ところ', { fill: TR.out, size: 46, pad: 36 }), t, cue(1) + 1.2, 240, 470);
      out += pop(badge('ほそい ところ', { fill: TR.inn, size: 46, pad: 36 }), t, cue(1) + 3.6, 1680, 470);
      out += g(`<line x1="420" y1="456" x2="${xl - 16}" y2="${fv.cy - 120}" stroke="${TR.out}" stroke-width="7" stroke-dasharray="4 13" stroke-linecap="round"/>`, { o: prog(t, cue(1) + 1.4, 0.3) });
      out += g(`<line x1="1500" y1="456" x2="${xr2 + 16}" y2="${fv.cy - 110}" stroke="${TR.inn}" stroke-width="7" stroke-dasharray="4 13" stroke-linecap="round"/>`, { o: prog(t, cue(1) + 3.8, 0.3) });
    }
    return out;
  },
});

// 7. 同じ1回転でも、太いところのほうが長く進む → 自然に内がわへ向きを変える
SCENES.push({
  id: 'roll',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A まるを1回転ころがす
    const aO = 1 - prog(t, cue(1) - 0.5, 0.4);
    if (aO > 0) {
      const k = eio(prog(t, cue(0) + 1.0, 3.0)), X0 = 640;
      const row = (y0, r, col) => {
        const x = X0 + 2 * Math.PI * r * k;
        let o = `<line x1="540" y1="${y0}" x2="1720" y2="${y0}" stroke="${C.line}" stroke-width="10" stroke-linecap="round"/>`;
        o += `<line x1="${X0}" y1="${y0}" x2="${x}" y2="${y0}" stroke="${col}" stroke-width="16" stroke-linecap="round"/>`;
        o += `<line x1="${X0}" y1="${y0 - 18}" x2="${X0}" y2="${y0 + 18}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
        o += `<g transform="translate(${x} ${y0 - r - 8}) rotate(${k * 360})"><circle r="${r}" fill="${TR.steelL}" stroke="${col}" stroke-width="14"/><line x1="0" y1="0" x2="0" y2="${r - 14}" stroke="${TR.steelD}" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="${r - 22}" r="13" fill="${C.red}"/><circle r="13" fill="${TR.steelD}"/></g>`;
        return o;
      };
      let a = row(450, 96, TR.out) + row(750, 62, TR.inn);
      a += pop(badge('ふとい ところ', { fill: TR.out, size: 42 }), t, 0.3, 330, 350) + pop(badge('ほそい ところ', { fill: TR.inn, size: 42 }), t, 0.5, 330, 680);
      a += pop(badge('おなじ 1かいてん', { fill: C.ink, size: 46, pad: 40 }), t, cue(0) + 0.3, 1130, 190);
      const e = cue(0) + 4.1;
      a += pop(text(0, 0, 'ながく すすむ', { size: 50, w: 900, fill: TR.out }), t, e, X0 + 2 * Math.PI * 96 + 300, 350);
      a += pop(text(0, 0, 'みじかい', { size: 50, w: 900, fill: TR.inn }), t, e + 0.5, X0 + 2 * Math.PI * 62 + 230, 680);
      out += g(a, { o: aO });
    }
    // B 上から見たカーブ：外の車輪が長く進むので、内がわへ向きが変わる
    const bO = prog(t, cue(1) - 0.2, 0.5);
    if (bO > 0) {
      const CX = 1560, CY = 770, RO = 760, RI = 560, RM = 660;
      const m = eio(prog(t, cue(1) + 0.6, 4.4)), a = lerp(177, 120, m);
      let b = trackArc(CX, CY, RM, 194, 102, { gauge: RO - RI, rail: 16, tieStep: 3.4, tieW: 16 });
      b += `<path d="${arcPath(CX, CY, RO, 177, a)}" fill="none" stroke="${TR.out}" stroke-width="20" stroke-linecap="round"/><path d="${arcPath(CX, CY, RI, 177, a)}" fill="none" stroke="${TR.inn}" stroke-width="20" stroke-linecap="round"/>`;
      const [x, y] = onArc(CX, CY, RM + 14, a);
      b += `<g transform="translate(${x} ${y}) rotate(${90 - a})">${wheelsetTop(RO - RI, { colA: TR.out, colB: TR.inn, len: 110, w: 46 })}</g>`;
      // 向きを変える矢印（内がわへ）
      const ak = prog(t, cue(1) + 3.0, 0.5);
      if (ak > 0) { const [hx, hy] = onArc(CX, CY, 400, 128), [px, py] = onArc(CX, CY, 400, 133); b += g(`<path d="${arcPath(CX, CY, 400, 168, 130)}" fill="none" stroke="${C.accent}" stroke-width="14" stroke-linecap="round"/>` + arrow(px, py, hx, hy, C.accent, 14), { o: ak }); }
      b += pop(badge('うえから みた カーブ', { fill: C.blueUi, size: 38 }), t, cue(1), 400, 230);
      b += pop(badge('そとの しゃりん：ながく すすむ', { fill: TR.out, size: 38 }), t, cue(1) + 0.9, 420, 370);
      b += pop(badge('うちの しゃりん：みじかい', { fill: TR.inn, size: 38 }), t, cue(1) + 1.9, 420, 480);
      b += pop(badge('しぜんに うちがわへ まがる', { fill: C.accent, size: 44, pad: 38 }), t, cue(1) + 3.2, 420, 630);
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 8. 紙コップを横にして転がすと、細いほうへ曲がる（上から見たところ）
function cupTop(roll) {
  // たおした紙コップ。上（-y）が のみ口、下が 底。roll は ころがった角度
  const L = 130, rm = 95, rb = 62;
  let o = `<path d="M ${-rm} ${-L} L ${rm} ${-L} L ${rb} ${L} L ${-rb} ${L} Z" fill="#fffdf6" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  for (let k = 0; k < 8; k++) {
    const b = roll + k * Math.PI / 4, c = Math.cos(b), s = Math.sin(b);
    if (c <= 0.08) continue;
    o += `<line x1="${rm * s * 0.96}" y1="${-L + 22}" x2="${rb * s * 0.96}" y2="${L - 8}" stroke="${k % 2 ? '#e8742a' : '#2f7de1'}" stroke-width="${3 + 9 * c}" stroke-linecap="round" opacity="${0.35 + 0.6 * c}"/>`;
  }
  o += `<rect x="${-rm - 3}" y="${-L - 4}" width="${rm * 2 + 6}" height="20" rx="10" fill="#fff" stroke="${TR.dark}" stroke-width="6"/>`;
  return o;
}
SCENES.push({
  id: 'cup',
  draw(t) {
    const PX = 960, PY = 1130, RC = 618, RMO = 748, RBO = 488, F0 = 132, F1 = 66;
    let out = `<rect width="1920" height="1080" fill="#f6ead3"/>` + [200, 520, 840].map(y => `<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="#ead9bb" stroke-width="6"/>`).join('') + topBadge();
    const m = eio(prog(t, cue(1) + 0.3, cueE(1) - cue(1) - 0.6)), f = lerp(F0, F1, m);
    // まっすぐには進まない
    const sO = win(t, cue(1) - 0.1, cue(2) - 0.2, 0.4);
    if (sO > 0) {
      const [sx, sy] = onArc(PX, PY, RC, F0);
      const d = [Math.sin(rad(F0)), Math.cos(rad(F0))];  // はじめに進む向き
      out += g(`<line x1="${sx + d[0] * 150}" y1="${sy + d[1] * 150}" x2="${sx + d[0] * 590}" y2="${sy + d[1] * 590}" stroke="${C.muted}" stroke-width="8" stroke-dasharray="18 16" stroke-linecap="round"/>` +
        g(text(0, 0, 'まっすぐ？', { size: 40, w: 900, fill: C.muted }), { x: sx + d[0] * 400 - 120, y: sy + d[1] * 400 - 30 }) +
        g(cross(0, 0, 0.5), { x: sx + d[0] * 610, y: sy + d[1] * 610, o: prog(t, cue(1) + 2.2, 0.3) }), { o: sO });
    }
    // 通ったあと
    if (m > 0) out += `<path d="${arcPath(PX, PY, RMO, F0, f)}" fill="none" stroke="${TR.out}" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 22"/><path d="${arcPath(PX, PY, RBO, F0, f)}" fill="none" stroke="${TR.inn}" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 22"/>`;
    const roll = RC * rad(F0 - f) / 78;
    out += g(`<g transform="rotate(${90 - f}) translate(0 ${-RC})"><ellipse cx="14" cy="10" rx="92" ry="140" fill="#3d311f" opacity="0.1"/>${cupTop(roll)}</g>`, { x: PX, y: PY, o: prog(t, 0.3, 0.4) });
    out += pop(badge('かみコップを よこに して ころがす', { fill: C.blueUi, size: 40 }), t, cue(0) + 0.3, 1180, 190, { end: cue(1) + 0.2 });
    // 名前
    const lO = win(t, cue(0) + 1.6, cue(1) + 0.2, 0.3);
    if (lO > 0) {
      const [mx, my] = onArc(PX, PY, RMO + 50, F0), [bx, by] = onArc(PX, PY, RBO - 46, F0);
      out += g(text(mx - 30, my - 10, 'ふとい ほう', { size: 40, w: 900, fill: TR.out, anchor: 'end' }) + text(bx + 10, by + 30, 'ほそい ほう', { size: 40, w: 900, fill: TR.inn, anchor: 'end' }), { o: lO });
    }
    out += pop(badge('ほそい ほうへ まがる', { fill: TR.inn, size: 46, pad: 40 }), t, cue(1) + 2.8, 1500, 190);
    // 車輪も同じ考え方
    const wO = prog(t, cue(2), 0.5);
    if (wO > 0) {
      let c = card(490, 330);
      // 車輪（前から見たところ）と、同じ向きに ならべた 紙コップ（まん中がわが ふとく、外がわが ほそい）
      c += `<g transform="translate(0 -66) scale(0.36)">${wheelsetFront({ wedge: 1 })}</g>`;
      c += `<g transform="translate(-119 66) rotate(90) scale(0.4)">${cupTop(0.4)}</g><g transform="translate(119 66) rotate(-90) scale(0.4)">${cupTop(0.4)}</g>`;
      c += text(0, 132, 'しゃりんも おなじ かんがえかた', { size: 30, w: 900 });
      out += g(c, { x: 318, y: 300, o: wO, s: lerp(0.9, 1, eo(wO)) });
    }
    out += chamL(t, 1760, 850, { s: 0.8, start: cue(3) - 0.9, n: 0 }) + talkBubble('K', 1560, 590, 1668, 706);
    return out;
  },
});

// 9. つば（フランジ）：急なカーブでは、レールの横に当たって案内する
SCENES.push({
  id: 'flange',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const fk = prog(t, cue(0) + 1.6, 0.5);
    const sk = eio(prog(t, cue(1) + 1.6, 1.4));
    // 当たったあと、少しだけ はねかえって また当たる
    const bump = sk >= 1 ? Math.max(0, Math.sin((t - cue(1) - 3.0) * 5)) * 3 * (1 - prog(t, cue(1) + 3.0, 2.5)) : 0;
    const fv = frontView({ s: 30 * sk - bump, fl: mix(TR.steel, TR.fl, fk) });
    // 左の車輪の 下のほう（レールにのる所）に よる
    const zk = eio(prog(t, cue(1) + 0.2, 1.2));
    const zs = lerp(1, 1.5, zk), zx = lerp(0, 225, zk), zy = lerp(0, -430, zk);
    out += `<g transform="translate(${zx} ${zy}) scale(${zs})">${fv.svg}`;
    // 当たった所
    const hit = prog(t, cue(1) + 3.0, 0.3);
    if (hit > 0) {
      const hx = fv.xL + 24, hy = 716;
      let st = '';
      for (let k = 0; k < 7; k++) { const a = -0.3 + k * 0.52, r1 = 26, r2 = 48 + 8 * Math.sin(t * 9 + k); st += `<line x1="${hx + r1 * Math.cos(a)}" y1="${hy + r1 * Math.sin(a) * 0.9}" x2="${hx + r2 * Math.cos(a)}" y2="${hy + r2 * Math.sin(a) * 0.9}" stroke="${C.yellow}" stroke-width="7" stroke-linecap="round"/>`; }
      out += g(st, { o: hit * (0.55 + 0.45 * Math.abs(Math.sin(t * 6))) });
    }
    out += `</g>`;
    // 名前
    const [lx, rx2] = [960 - (WS.xi + 14), 960 + (WS.xi + 14)];
    const nO = win(t, cue(0) + 1.8, cue(1) + 0.3, 0.3);
    if (nO > 0) {
      out += g(badge('つば', { fill: TR.fl, size: 50, pad: 40 }), { x: 960, y: 200, o: nO, s: Math.max(back(prog(t, cue(0) + 1.8, 0.5)), 0.001) });
      out += g(`<path d="M 890 232 L ${lx + 14} ${fv.cy - WS.rf - 14} M 1030 232 L ${rx2 - 14} ${fv.cy - WS.rf - 14}" stroke="${TR.fl}" stroke-width="7" stroke-dasharray="4 13" stroke-linecap="round" fill="none"/>`, { o: nO });
      out += g(text(960, fv.cy - 70, 'うちがわの はしの でっぱり', { size: 36, w: 900, fill: C.muted }), { o: nO });
    }
    out += pop(badge('きゅうな カーブ', { fill: C.blueUi, size: 42 }), t, cue(1) + 1.2, 500, 210);
    out += pop(badge('つばが レールの よこに あたる', { fill: TR.fl, size: 42 }), t, cue(1) + 3.2, 500, 350, { end: cue(2) - 0.1 });
    out += g(text(1050, 700, 'レール', { size: 40, w: 900, fill: C.muted }), { o: prog(t, cue(1) + 1.6, 0.4) });
    out += pop(badge('レールから はずれるのを ふせぐ', { fill: C.accent, size: 44, pad: 38 }), t, cue(2) + 0.4, 500, 350);
    return out;
  },
});

// 10. まっすぐな線路では くねくね → 新幹線は ななめが小さい
function wheelIcon(drop) {
  // 前から見た車輪の下がわ（レールにのる所）。drop が ななめの大きさ
  let o = `<path d="M -70 -150 L 62 -150 L 62 ${-drop} L -44 0 L -50 30 L -70 30 Z" fill="${TR.steel}" stroke="${TR.dark}" stroke-width="6" stroke-linejoin="round"/>`;
  o += `<line x1="-44" y1="0" x2="96" y2="0" stroke="${TR.dark}" stroke-width="5" stroke-dasharray="10 9"/>`;
  o += `<path d="M -44 0 L 62 0 L 62 ${-drop} Z" fill="${TR.out}" opacity="0.5"/><line x1="-44" y1="0" x2="62" y2="${-drop}" stroke="${TR.out}" stroke-width="10" stroke-linecap="round"/>`;
  return o;
}
SCENES.push({
  id: 'shinkansen',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    // A まっすぐな線路で くねくね（上から見たところ。右へ進む）
    const aO = 1 - prog(t, cue(1) - 0.5, 0.4);
    if (aO > 0) {
      const YM = 520, GA = 200;
      let a = `<rect x="-20" y="${YM - GA / 2 - 28}" width="1960" height="${GA + 56}" fill="${TR.ballast}"/>`;
      for (let x = 30; x < 1920; x += 74) a += `<line x1="${x}" y1="${YM - GA / 2 - 14}" x2="${x}" y2="${YM + GA / 2 + 14}" stroke="${TR.tie}" stroke-width="16" stroke-linecap="round"/>`;
      a += `<line x1="-20" y1="${YM - GA / 2}" x2="1940" y2="${YM - GA / 2}" stroke="${TR.rail}" stroke-width="16"/><line x1="-20" y1="${YM + GA / 2}" x2="1940" y2="${YM + GA / 2}" stroke="${TR.rail}" stroke-width="16"/>`;
      const X0 = 240, X1 = 1680, AMP = 22, W = 2 * Math.PI * 2.5 / (X1 - X0);
      const x = lerp(X0, X1, prog(t, cue(0) + 0.4, cueE(0) - cue(0) + 0.6));
      let d = '';
      for (let xx = X0; xx <= x; xx += 8) d += (d ? ' L ' : 'M ') + xx + ' ' + (YM + AMP * Math.sin((xx - X0) * W)).toFixed(1);
      if (d) a += `<path d="${d}" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 16"/>`;
      const yaw = Math.atan(AMP * W * Math.cos((x - X0) * W)) * 180 / Math.PI;
      a += `<g transform="translate(${x} ${YM + AMP * Math.sin((x - X0) * W)}) rotate(${yaw})">${wheelsetTop(GA, { len: 110, w: 46 })}</g>`;
      a += pop(badge('まっすぐな せんろ（うえから）', { fill: C.blueUi, size: 40 }), t, 0.3, 1100, 200);
      a += pop(text(0, 0, 'くね くね', { size: 64, w: 900, fill: C.red }), t, cue(0) + 3.2, 960, 760);
      out += g(a, { o: aO });
    }
    // B ふつうの電車と 新幹線の くらべ
    const bO = prog(t, cue(1) - 0.2, 0.5);
    if (bO > 0) {
      const one = (title, sub, chip, col, icon, drop) => {
        let c = card(740, 560);
        c += text(0, -222, title, { size: 50, w: 900 });
        c += `<g transform="translate(-170 -20) scale(0.62)"><line x1="-260" y1="0" x2="260" y2="0" stroke="${TR.rail}" stroke-width="10" stroke-linecap="round"/>${icon}</g>`;
        c += `<g transform="translate(190 -30) scale(0.9)">${wheelIcon(drop)}<rect x="-18" y="2" width="92" height="22" rx="8" fill="${TR.railD}"/></g>`;
        c += text(190, 40, 'しゃりんの ななめ', { size: 28, w: 700, fill: C.muted });
        c += text(0, 110, sub, { size: 46, w: 900, fill: col });
        c += g(badge(chip, { fill: col, size: 38 }), { y: 204 });
        return c;
      };
      out += g(one('ふつうの でんしゃ', 'ななめ 1/20 が おおい', 'カーブを まがりやすく', TR.out, trainSide(0), 44), { x: 530, y: 500 - (1 - eo(bO)) * 30, o: bO });
      const b2 = prog(t, cue(1) + 1.6, 0.5);
      out += g(one('しんかんせん', 'ななめ 1/40（ちいさい）', 'はやくても ゆれにくく', TR.inn, shinSide(), 22), { x: 1390, y: 500 - (1 - eo(b2)) * 30, o: b2 });
    }
    return out;
  },
});

// 11. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[1][1], { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const ring = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: ring, s: Math.max(back(ring), 0.001) });
      a += chipsRow([['カーブで そとへ ずれる', C.blueUi], ['そとは ふとい ところ', TR.out], ['うちは ほそい ところ', TR.inn], ['しぜんに まがる', C.accent]], t, 960, 660, { size: 34, gap: 26, start: 2.6, step: 0.8 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 370, 200);
      const tIcon = `<g transform="translate(0 34) scale(0.3)">${trainSide(0)}</g>`;
      const wIcon = `<g transform="scale(0.15)">${wheelsetFront({ wedge: 1, fl: TR.fl })}</g>`;
      const cIcon = `<g transform="rotate(64) scale(0.42)">${cupTop(0.5)}</g>`;
      const items = [
        [tIcon, 'ホームから、とまっている でんしゃの しゃりんを みる', C.ink],
        [wIcon, 'そとへ ほそく なっているか、つばが あるか さがす', C.ink],
        [g(warnIcon(), { s: 0.9 }), 'でんしゃが うごく ときは、きいろい せんの うちがわで', C.red],
        [cIcon, 'おうちで かみコップを ころがして、まがる むきを みる', C.ink],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 200, 345 + i * 132);
      });
      b += chamL(t, 1750, 830, { s: 0.66, start: cue(1) + 0.8, n: 0 });
      out += g(b, { o: bO });
    }
    return out;
  },
});

// 12. おわり
SCENES.push({
  id: 'end',
  draw(t) {
    const D = sceneDur(NOW.i);
    let out = `<rect width="1920" height="1080" fill="${C.accent}"/>`;
    out += pop(text(0, 0, 'みのまわり図鑑', { size: 120, w: 900, fill: '#fff' }), t, 0.3, 960, 360);
    out += g(text(0, 0, 'まいにち見ているものを、前より くわしく。', { size: 44, w: 700, fill: '#e6efe8' }), { x: 960, y: 500, o: prog(t, 0.9, 0.5) });
    out += g(`<rect x="-560" y="-60" width="1120" height="120" rx="60" fill="rgba(255,255,255,0.14)"/>` + text(0, 2, 'nozomitaguchi.github.io/everyday-trivia', { size: 46, w: 700, fill: '#fff', ls: 0.02 }), { x: 960, y: 660, o: prog(t, 1.4, 0.5) });
    out += g(text(0, 0, 'もっと くわしくは サイトの「でんしゃの しゃりん」のページへ ／ 出典は 概要欄に', { size: 34, w: 700, fill: '#d9e6dc' }), { x: 960, y: 800, o: prog(t, 2.0, 0.5) });
    // 左に立つ子は動画ごとに変わる（END_SWAP）。動きも kidShow が動画ごとに選ぶ
    const [kL, kR] = END_SWAP ? ['B', 'S'] : ['S', 'B'];
    out += kidShow(kL, t, 150, 1060, { s: 0.52, start: 0.8, n: 0, bubble: false });
    out += kidShow(kR, t, 310, 1060, { s: 0.52, start: 1.0, n: 1, bubble: false });
    out += chamL(t, 1660, 1040, { s: 0.7, start: 1.2, n: 2 });
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
