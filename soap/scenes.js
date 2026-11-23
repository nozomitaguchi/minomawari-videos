// みのまわり図鑑 動画「石けんで洗うと、どうしてよごれが落ちるの？」
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
const TOPIC = 'せっけん';
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
// ---------- せっけんの道具 ----------
// 色：水は青、油は黄色、石けんのつぶは「赤い丸い頭（水となかよし）＋黒いぎざぎざのしっぽ（油となかよし）」、すすは黒
const SP = { water: '#cfeaf8', waterD: '#7cc4ea', oil: '#f6c232', oilD: '#d59f10', oilInk: '#a67c00', head: '#e2473a', tail: '#2a2622', soot: '#2f2c2a', cloth: '#f6f1e7', clothL: '#dcd2c0', skin: '#f6d6bd', skinD: '#e6b99c', soap: '#fbe3ea', soapD: '#e7a9bb' };
const PAPER = `<rect width="1920" height="1080" fill="${C.paper}"/>`;
const WATERBG = `<rect width="1920" height="1080" fill="${SP.water}"/>`;
// 石けんのつぶ（マッチ棒の形）：頭は (x,y)、しっぽは ang（度）の向きへのびる
const mol = (x, y, ang, s = 1, o = 1) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${s})" opacity="${o}"><path d="M 12 0 l 7 -8 l 9 16 l 9 -16 l 9 16 l 9 -16 l 7 8" fill="none" stroke="${SP.tail}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle r="15" fill="${SP.head}"/><circle cx="-5" cy="-5" r="4.5" fill="#fff" opacity="0.6"/></g>`;
const oilBlob = (x, y, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="${Math.max(3, r * 0.06)}"/><ellipse cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" rx="${r * 0.22}" ry="${r * 0.13}" fill="#fff" opacity="0.65" transform="rotate(-30 ${(x - r * 0.35).toFixed(1)} ${(y - r * 0.4).toFixed(1)})"/>`;
const sootGrain = (x, y, r) => `<path d="M ${x - r} ${y - r * 0.2} L ${x - r * 0.4} ${y - r} L ${x + r * 0.6} ${y - r * 0.8} L ${x + r} ${y + r * 0.1} L ${x + r * 0.4} ${y + r} L ${x - r * 0.7} ${y + r * 0.8} Z" fill="${SP.soot}"/>`;
// とりかこまれたよごれ：まん中の玉（kind 'oil' | 'soot'）のまわりに n 本。頭が外、しっぽが内。k = つぶが近づききった度合い
function wrapped(x, y, r, kind, n, { s = 0.7, spin = 0, k = 1 } = {}) {
  let out = kind === 'oil' ? oilBlob(x, y, r) : sootGrain(x, y, r);
  for (let i = 0; i < n; i++) {
    const a = i / n * 360 + spin, rad = a * Math.PI / 180, d = r + 13 * s + (1 - k) * 90;
    out += mol(x + Math.cos(rad) * d, y + Math.sin(rad) * d, a + 180, s, clamp(k * 2));
  }
  return out;
}
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 }) + `</g>`;
const tagAt = (t, st, x, y, str, col, px, py, { end = 1e9, size = 42 } = {}) =>
  pop(`<line x1="0" y1="0" x2="${px - x}" y2="${py - y}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="${px - x}" cy="${py - y}" r="11" fill="${col}"/>` + badge(str, { fill: col, size }), t, st, x, y, { end });
const soapBar = (s = 1) => `<g transform="scale(${s})"><rect x="-90" y="-52" width="180" height="104" rx="38" fill="${SP.soap}" stroke="${SP.soapD}" stroke-width="7"/><ellipse cx="0" cy="0" rx="52" ry="24" fill="none" stroke="${SP.soapD}" stroke-width="5" opacity="0.7"/><path d="M -64 -30 Q -40 -42 -14 -40" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.9"/></g>`;
const sparkle = (x, y, r, o = 1) => `<path d="M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="#ffd23a" stroke="#fff" stroke-width="3" opacity="${o}"/>`;
// コップ（中心 0,0、高さ 200）
const gxl = y => -70 + (y + 100) / 200 * 14;
const glassRim = `<path d="M -70 -100 L -56 92 Q -56 100 -46 100 L 46 100 Q 56 100 56 92 L 70 -100" fill="#eaf4fa" fill-opacity="0.22" stroke="#7fa7bd" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M -52 -78 L -45 50" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
const gpoly = (ya, yb, col) => yb - ya < 0.3 ? '' : `<path d="M ${gxl(ya)} ${ya} L ${-gxl(ya)} ${ya} L ${-gxl(yb)} ${yb}` + (yb >= 92 ? ` Q 56 100 46 100 L -46 100 Q -56 100 ${gxl(92)} 92` : ` L ${gxl(yb)} ${yb}`) + ` Z" fill="${col}"/>`;
// 布（左のはしに立っている。右のふちが x = 300）
const clothWall = () => {
  let o = `<rect x="-20" y="-20" width="320" height="1120" fill="${SP.cloth}"/>`;
  for (let y = 10; y < 1080; y += 34) o += `<line x1="0" y1="${y}" x2="300" y2="${y}" stroke="${SP.clothL}" stroke-width="5"/>`;
  for (let x = 20; x < 300; x += 40) o += `<line x1="${x}" y1="0" x2="${x}" y2="1080" stroke="${SP.clothL}" stroke-width="5" opacity="0.6"/>`;
  return o + `<line x1="300" y1="0" x2="300" y2="1080" stroke="#b9ad98" stroke-width="8"/>`;
};
// 手のひら（指は上向き。中心 0,0）
function hand(x, y, s, { oil = 0, foam = 0, t = 0 } = {}) {
  const f = (fx, h) => `<rect x="${fx - 24}" y="${-90 - h}" width="48" height="${h + 40}" rx="24" fill="${SP.skin}"/>`;
  let o = `<rect x="-62" y="60" width="124" height="420" rx="40" fill="${SP.skin}"/>`;
  o += f(-78, 120) + f(-26, 160) + f(26, 150) + f(78, 105);
  o += `<rect x="-150" y="-36" width="62" height="150" rx="31" fill="${SP.skin}" transform="rotate(-34 -119 39)"/>`;
  o += `<rect x="-108" y="-110" width="216" height="220" rx="74" fill="${SP.skin}"/>`;
  o += `<path d="M -52 -24 Q 0 16 58 -34 M -62 30 Q -10 62 42 30" fill="none" stroke="${SP.skinD}" stroke-width="5" stroke-linecap="round"/>`;
  if (oil > 0) [[-42, -34, 36, 26], [40, 22, 30, 22], [-6, 64, 26, 18], [26, -178, 15, 20], [-78, -140, 13, 18]].forEach(([bx, by, rx, ry], i) => {
    o += `<ellipse cx="${bx + Math.sin(t * 2 + i) * 2}" cy="${by}" rx="${rx}" ry="${ry}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="3" opacity="${oil}"/><ellipse cx="${bx - rx * 0.3}" cy="${by - ry * 0.35}" rx="${rx * 0.25}" ry="${ry * 0.2}" fill="#fff" opacity="${0.7 * oil}"/>`;
  });
  if (foam > 0) for (let i = 0; i < 22; i++) {
    const bx = -90 + rnd(i, 11) * 180, by = -180 + rnd(i, 12) * 270, r = 14 + rnd(i, 13) * 20;
    o += `<circle cx="${bx + Math.sin(t * 3 + i) * 3}" cy="${by + Math.cos(t * 2.6 + i) * 3}" r="${r * clamp(foam * 1.4 - rnd(i, 14) * 0.4)}" fill="#fff" stroke="#cfe6f2" stroke-width="3" opacity="${0.95 * foam}"/>`;
  }
  return g(o, { x, y, s });
}

// 1. つかみ：水だけでは落ちない油のよごれが、石けんで落ちる
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="#f1efe4"/>`;
    for (let x = 0; x < 1920; x += 160) out += `<line x1="${x}" y1="0" x2="${x}" y2="760" stroke="#e4e0d2" stroke-width="4"/>`;
    for (let y = 120; y < 760; y += 160) out += `<line x1="0" y1="${y}" x2="1920" y2="${y}" stroke="#e4e0d2" stroke-width="4"/>`;
    // 流し
    out += `<path d="M 180 760 L 1220 760 L 1160 1080 L 240 1080 Z" fill="#dfe7eb"/><rect x="140" y="740" width="1120" height="34" rx="14" fill="#c3ced5"/>`;
    // 蛇口
    out += `<rect x="330" y="150" width="400" height="46" rx="20" fill="#b9c4cb"/><rect x="668" y="150" width="64" height="96" rx="22" fill="#b9c4cb"/><rect x="360" y="110" width="110" height="34" rx="14" fill="#8fa0ad"/><rect x="398" y="136" width="34" height="24" fill="#8fa0ad"/><rect x="300" y="120" width="50" height="110" rx="12" fill="#a7b3bb"/>`;
    const c1 = cue(1);
    const oil = 1 - prog(t, c1 + 1.5, 1.5), foam = win(t, c1 + 1.2, c1 + 4.4, 0.7);
    out += hand(700, 640, 1.0, { oil, foam, t });
    // 水
    out += `<rect x="678" y="240" width="44" height="330" rx="20" fill="#7cc4ea" opacity="0.6"/>`;
    for (let i = 0; i < 6; i++) { const f = (t * 1.6 + i / 6) % 1; out += `<line x1="${686 + (i % 3) * 14}" y1="${lerp(250, 520, f)}" x2="${686 + (i % 3) * 14}" y2="${lerp(250, 520, f) + 40}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`; }
    for (let i = 0; i < 8; i++) { const f = (t * 1.2 + i / 8) % 1, sd = i % 2 ? 1 : -1; out += `<circle cx="${700 + sd * (40 + f * 120)}" cy="${560 + f * f * 260 - f * 60}" r="${9 * (1 - f * 0.5)}" fill="#7cc4ea" opacity="${0.8 * (1 - f)}"/>`; }
    // 石けん
    const sIn = eio(prog(t, c1 + 0.2, 0.9)), sOut = eio(prog(t, c1 + 3.2, 0.8));
    if (sIn > 0 && sOut < 1) {
      const rub = win(t, c1 + 1.0, c1 + 3.2, 0.3);
      out += g(soapBar(1.1), { x: lerp(1500, 716, sIn) + Math.cos(t * 7) * 46 * rub + sOut * 760, y: 620 + Math.sin(t * 7) * 60 * rub - sOut * 60, r: -12 + Math.sin(t * 7) * 8 * rub });
    }
    // きれいになった
    const sp = prog(t, c1 + 4.2, 0.5);
    if (sp > 0) [[560, 470, 30], [850, 520, 36], [820, 760, 24], [590, 700, 22], [700, 420, 26]].forEach(([x, y, r], i) => { out += sparkle(x, y, r * (0.8 + 0.3 * Math.sin(t * 5 + i * 1.7)) * back(prog(t, c1 + 4.2 + i * 0.12, 0.4)), sp); });
    out += tagAt(t, cue(0) + 2.2, 1300, 330, 'みずだけでは おちない', C.blueUi, 668, 606, { end: c1 + 0.2 });
    out += pop(badge('せっけんで あらうと おちた！', { fill: C.redUi, size: 42 }), t, c1 + 4.3, 1380, 330, { end: cue(3) + 0.2 });
    out += topBadge();
    out += kidShow('B', t, 1560, 940, { s: 0.6, start: cue(2) - 0.9, n: 0, look: [-8, -4] });
    // 題名
    const t0 = cueE(3) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 270);
      out += g(`<text x="0" y="0" font-size="116" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="#d2607a">石けん</tspan>で あらうと、</text>`, { x: 960, y: 450, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="112" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${SP.oilInk}">よごれ</tspan>が 落ちるの？</text>`, { x: 960, y: 630, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      out += pop(g(soapBar(0.9), { x: -120 }) + wrapped(110, 0, 34, 'oil', 9, { s: 0.5 }), t, t0 + 1.8, 960, 840);
    }
    return out;
  },
});

// 2. 予想（正解は2番）
const OPTS = [['①', 'あぶらを とかして、けして しまう'], ['②', 'あぶらを かこんで、みずの なかへ はこぶ'], ['③', 'あわで、あぶらを こすりとる']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = PAPER + topBadge();
    out += pop(text(0, 0, 'せっけんは なにを している？', { size: 80, w: 900 }), t, 0.3, 900, 210);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 390 + i * 168);
    });
    out += kidShow('S', t, 1730, 850, { s: 0.5, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1640, y: 230, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 水と油は、まぜても分かれる。油のよごれは水だけでは流れない
SCENES.push({
  id: 'separate',
  draw(t) {
    let out = PAPER + topBadge();
    const GX = 470, GY = 500, GS = 2.3, yT = -70, yM = -22, yB = 92;
    const pour = prog(t, cue(0) + 0.8, 0.9), mixK = prog(t, cue(0) + 2.1, 0.6), sep = eio(prog(t, cue(1) + 0.4, 4.2));
    let gl = '';
    if (mixK <= 0) gl += gpoly(yM, yB, SP.waterD) + gpoly(lerp(yM, yT, pour), yM, SP.oil);
    else {
      const lb = yT + (yM - yT) * sep;   // 油の層の下のふち
      gl += gpoly(yT, yB, SP.waterD);
      for (let i = 0; i < 34; i++) {
        const bx = (rnd(i, 21) - 0.5) * 96, by = lerp(yT + 10, yB - 8, rnd(i, 22));
        const rise = clamp(sep * 1.7 - rnd(i, 23) * 0.6), y = lerp(by, yT + 4, rise) + Math.sin(t * 3 + i) * 2 * (1 - sep);
        if (y > lb + 1) gl += `<circle cx="${(bx * (0.82 + 0.1 * Math.sin(t * 2.2 + i))).toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.5 + rnd(i, 24) * 4).toFixed(1)}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="1" opacity="${mixK}"/>`;
      }
      gl += gpoly(yT, lb, SP.oil);
    }
    // まぜるスプーン
    const stir = win(t, cue(0) + 1.9, cue(0) + 3.7, 0.3);
    if (stir > 0) { const sx = Math.sin(t * 9) * 26; gl += `<g opacity="${stir}"><line x1="${sx * 1.6}" y1="-170" x2="${sx}" y2="50" stroke="#9aa7b1" stroke-width="7" stroke-linecap="round"/><ellipse cx="${sx}" cy="58" rx="12" ry="18" fill="#9aa7b1"/></g>`; }
    out += g(gl + glassRim, { x: GX, y: GY, s: GS, o: prog(t, 0.2, 0.4) });
    out += pop(badge('みず', { fill: C.blueUi, size: 40 }), t, 0.5, 190, 620, { end: cue(0) + 2.2 });
    out += pop(badge('あぶら', { fill: SP.oilInk, size: 40 }), t, cue(0) + 0.9, 190, 400, { end: cue(0) + 2.2 });
    out += pop(badge('まぜる', { fill: '#7f95a6', size: 46 }), t, cue(0) + 2.0, GX, 800, { end: cue(1) + 0.2 });
    out += tagAt(t, cue(1) + 2.4, 940, 330, 'あぶらは うえ', SP.oilInk, GX + 100, GY - 46 * GS);
    out += tagAt(t, cue(1) + 3.2, 940, 620, 'みずは した', C.blueUi, GX + 100, GY + 40 * GS);
    out += pop(badge('わかれた！', { fill: C.redUi, size: 46 }), t, cue(1) + 4.4, GX, 800);
    // 布についた油のよごれ
    const c2 = cue(2), cO = prog(t, c2 - 0.2, 0.5);
    if (cO > 0) {
      const CX = 1500, CY = 480;
      let c = `<rect x="-200" y="-200" width="400" height="400" rx="16" fill="${SP.cloth}" stroke="#b9ad98" stroke-width="6"/>`;
      for (let y = -170; y < 200; y += 34) c += `<line x1="-196" y1="${y}" x2="196" y2="${y}" stroke="${SP.clothL}" stroke-width="5"/>`;
      for (let x = -160; x < 200; x += 40) c += `<line x1="${x}" y1="-196" x2="${x}" y2="196" stroke="${SP.clothL}" stroke-width="5" opacity="0.6"/>`;
      c += `<path d="M -70 -20 Q -80 -70 -20 -66 Q 40 -90 66 -30 Q 96 20 50 56 Q 0 90 -50 56 Q -90 30 -70 -20 Z" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="5"/><ellipse cx="-24" cy="-30" rx="18" ry="10" fill="#fff" opacity="0.6"/>`;
      // 水が流れても、油はのこる
      const wO = prog(t, c2 + 0.8, 0.5);
      for (let i = 0; i < 9; i++) {
        const y = -180 + i * 45, f = (t * 0.7 + rnd(i, 31)) % 1, x = lerp(-330, 330, f);
        c += `<line x1="${x - 60}" y1="${y}" x2="${x + 60}" y2="${y}" stroke="${SP.waterD}" stroke-width="12" stroke-linecap="round" opacity="${0.75 * wO * Math.sin(Math.PI * f)}"/>`;
      }
      out += g(c, { x: CX, y: CY, o: cO });
      out += g(text(0, 0, 'ぬのに ついた あぶら', { size: 46, w: 900 }), { x: CX, y: 215, o: cO });
      out += pop(badge('みずだけでは ながれない', { fill: C.blueUi, size: 42 }), t, c2 + 2.2, CX, 770);
    }
    return out;
  },
});

// 4. 石けんのつぶは、マッチ棒の形
SCENES.push({
  id: 'match',
  draw(t) {
    let out = PAPER + topBadge();
    const zo = eio(prog(t, cue(0) + 2.0, 1.3));
    if (zo < 1) {
      out += g(soapBar(1), { x: 960, y: 470, s: lerp(1.7, 7, zo), o: 1 - zo });
      out += g(lensIcon(), { x: 1040 + Math.sin(t * 1.6) * 30, y: 420 + Math.cos(t * 1.6) * 16, s: 1.1, o: prog(t, 0.6, 0.4) * (1 - zo) });
      out += g(text(0, 0, 'せっけんを おおきく して みると…', { size: 54, w: 900 }), { x: 960, y: 210, o: win(t, 0.5, cue(0) + 2.2, 0.4) });
    }
    if (zo > 0) {
      const MX = 470, MY = 500;
      out += g(mol(0, 0, 0, 7), { x: MX, y: MY, s: lerp(0.3, 1, zo), o: zo });
      out += g(text(0, 0, 'せっけんの つぶ', { size: 54, w: 900 }), { x: 700, y: 330, o: win(t, cue(0) + 3.2, cue(1) - 0.2, 0.4) });
      // マッチ棒
      const mk = prog(t, cue(1) + 0.2, 0.5);
      if (mk > 0) {
        const m = `<rect x="-20" y="-15" width="470" height="30" rx="8" fill="#e8c88f" stroke="#c9a468" stroke-width="4"/><ellipse cx="-36" cy="0" rx="56" ry="42" fill="#b3402e"/><ellipse cx="-50" cy="-12" rx="16" ry="10" fill="#fff" opacity="0.35"/>`;
        out += pop(m, t, cue(1) + 0.2, MX + 20, 250);
        out += g(text(0, 0, 'マッチぼう みたいな かたち', { size: 50, w: 900, anchor: 'start' }), { x: 1010, y: 252, o: prog(t, cue(1) + 0.9, 0.4) });
      }
      // 頭としっぽ
      const c2 = cue(2);
      for (let i = 0; i < 3; i++) out += pop(`<path d="M 0 -26 C 12 -8 20 2 20 12 A 20 20 0 0 1 -20 12 C -20 2 -12 -8 0 -26 Z" fill="${SP.waterD}"/>`, t, c2 + 0.5 + i * 0.15, 250 + (i % 2) * 60, 400 + i * 90);
      for (let i = 0; i < 3; i++) out += pop(oilBlob(0, 0, 22), t, c2 + 3.0 + i * 0.15, 1010 + (i % 2) * 64, 420 + i * 78);
      out += tagAt(t, c2 + 0.3, 480, 750, 'まるい あたま：みずと なかよし', C.blueUi, MX, MY + 112, { size: 40 });
      out += tagAt(t, c2 + 2.8, 1250, 750, 'ながい しっぽ：あぶらと なかよし', SP.oilInk, 760, MY + 58, { size: 40 });
    }
    out += kidShow('S', t, 1790, 920, { s: 0.56, start: cue(3) - 0.9, n: 0, look: [-8, -2] });
    return out;
  },
});

// 5. 水と油のさかいめに、ずらりとならぶ
SCENES.push({
  id: 'line',
  draw(t) {
    const BY = 470;
    let out = `<rect width="1920" height="1080" fill="#fbe08a"/>`;
    const wave = Array.from({ length: 30 }, (_, i) => `${(i * 1920 / 29).toFixed(0)} ${(BY + Math.sin(t * 1.6 + i * 0.8) * 4).toFixed(1)}`).join(' L ');
    out += `<path d="M ${wave} L 1920 1080 L 0 1080 Z" fill="${SP.water}"/>`;
    out += topBadge();
    out += g(text(0, 0, 'あぶら', { size: 76, w: 900, fill: SP.oilInk }), { x: 190, y: 290, o: prog(t, 0.3, 0.4) });
    out += g(text(0, 0, 'みず', { size: 76, w: 900, fill: C.blueUi }), { x: 190, y: 700, o: prog(t, 0.5, 0.4) });
    for (let i = 0; i < 15; i++) {
      const k = eio(prog(t, cue(0) + 0.8 + i * 0.24, 1.3));
      const x0 = 380 + rnd(i, 41) * 1300, y0 = 600 + rnd(i, 42) * 200 + Math.sin(t * 2 + i) * 8, a0 = rnd(i, 43) * 360 + t * 20;
      const x1 = 330 + i * 90, y1 = BY + 22 + Math.sin(t * 1.6 + (x1 / 1920 * 29) * 0.8) * 4;
      out += mol(lerp(x0, x1, k), lerp(y0, y1, k), lerp(a0, 270, k), 1.5, prog(t, 0.4 + i * 0.05, 0.3));
    }
    const c1 = cue(1);
    out += tagAt(t, c1 + 0.2, 640, 700, 'あたまは みずの ほうへ', C.blueUi, 600, BY + 50);
    out += tagAt(t, c1 + 2.4, 1240, 240, 'しっぽは あぶらの ほうへ', SP.oilInk, 1230, BY - 66);
    out += pop(badge('みずと あぶらを なじませる', { fill: C.redUi, size: 46, pad: 40 }), t, c1 + 4.6, 1320, 640);
    return out;
  },
});

// 6. しっぽが油にささって、とりかこみ、水の中へ運ぶ
SCENES.push({
  id: 'wrap',
  draw(t) {
    let out = WATERBG;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const dk = eio(prog(t, c2 + 0.3, 2.2)), mv = eio(prog(t, c2 + 0.8, 3.0));
    const bx = lerp(392, 1040, mv), by = 480 + Math.sin(t * 1.5) * 8 * mv, r = lerp(150, 112, dk);
    // 油のよごれ（はじめは布にぺたっとついている）
    out += oilBlob(bx, by, r);
    const N = 13, S = 1.3;
    let mols = '';
    for (let i = 0; i < N; i++) {
      const a = lerp(-82 + i * (164 / (N - 1)), -180 + (i + 0.5) * (360 / N), dk) + mv * 40, rad = a * Math.PI / 180;
      const k1 = eio(prog(t, c0 + 0.4 + i * 0.2, 2.4)), k2 = eio(prog(t, c1 + 0.3 + i * 0.13, 0.7));
      const x0 = 1300 + rnd(i, 51) * 560, y0 = 120 + rnd(i, 52) * 700, a0 = rnd(i, 53) * 360;
      const d = lerp(r + 120, r + 13 * S, k2), hx = bx + Math.cos(rad) * d, hy = by + Math.sin(rad) * d;
      mols += mol(lerp(x0, hx, k1), lerp(y0, hy, k1) + Math.sin(t * 2 + i) * 6 * (1 - k2), lerp(a0, a + 180, k1), S, prog(t, c0 + 0.3 + i * 0.2, 0.3));
    }
    // 水の中をただよう、ほかのつぶ
    for (let i = 0; i < 7; i++) out += mol(520 + rnd(i, 61) * 1300 + Math.sin(t * 0.7 + i) * 20, 110 + rnd(i, 62) * 760 + Math.cos(t * 0.9 + i) * 16, rnd(i, 63) * 360 + t * 12, 0.9, 0.55 * prog(t, c0 + 0.6, 0.6));
    out += clothWall() + mols;
    out += g(text(0, 0, 'ぬの', { size: 64, w: 900, fill: '#8a7d68' }), { x: 150, y: 250 });
    const cl = prog(t, c2 + 2.4, 0.5);
    if (cl > 0) [[340, 400, 22], [350, 520, 28], [336, 600, 18]].forEach(([x, y, rr], i) => { out += sparkle(x, y, rr * back(prog(t, c2 + 2.4 + i * 0.15, 0.4)), cl); });
    out += topBadge();
    out += tagAt(t, c0 + 0.3, 760, 210, 'あぶらの よごれ', SP.oilInk, 440, 390, { end: c1 - 0.2 });
    out += pop(badge('しっぽが あぶらに ささる', { fill: C.ink, size: 44 }), t, c1 + 1.0, 1180, 230, { end: c2 - 0.2 });
    out += pop(badge('ぐるりと とりかこむ', { fill: C.redUi, size: 44 }), t, c1 + 3.2, 1180, 330, { end: c2 - 0.2 });
    out += pop(badge('ちいさな つぶに なって、みずの なかへ', { fill: C.blueUi, size: 42 }), t, c2 + 2.0, 1040, 770);
    out += kidShow('K', t, 1700, 900, { s: 0.7, start: cue(3) - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1450, 640, 1642, 784);
    return out;
  },
});

// 7. すすもとりかこむ。かこまれたよごれは布にもどらず、すすぎの水と流れていく
SCENES.push({
  id: 'noreturn',
  draw(t) {
    let out = WATERBG;
    const c0 = cue(0), c1 = cue(1), c2 = cue(2);
    const flow = prog(t, c2 + 0.5, 3.4), fx = 1900 * flow * flow;
    // すすぎの水の流れ
    if (flow > 0) for (let i = 0; i < 16; i++) {
      const f = (t * 0.6 + rnd(i, 71)) % 1, x = lerp(300, 2000, f), y = 80 + rnd(i, 72) * 780;
      out += `<line x1="${x - 90}" y1="${y}" x2="${x + 90}" y2="${y}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="${0.7 * clamp(flow * 3) * Math.sin(Math.PI * f)}"/>`;
    }
    const bounce = B => -B * Math.sin(Math.PI * prog(t, c1 + 1.0, 2.8));
    // とりかこまれた油（前の場面のつづき）
    const ox = 820 + bounce(350) + fx, oy = 520 + Math.sin(t * 1.5) * 8;
    out += wrapped(ox, oy, 70, 'oil', 11, { s: 0.85, spin: t * 8 });
    // すす
    const SY = [300, 640, 420, 760, 200], MX = [600, 1080, 1300, 1480, 1160], MY = [250, 640, 380, 560, 180];
    let soots = '';
    SY.forEach((sy, i) => {
      const wk = prog(t, c0 + 0.8 + i * 0.3, 1.3), go = eio(prog(t, c0 + 2.6 + i * 0.3, 2.2));
      const x = lerp(326, MX[i], go) + (i === 0 ? bounce(200) : 0) + fx, y = lerp(sy, MY[i], go) + Math.sin(t * 1.7 + i) * 6 * go;
      soots += wrapped(x, y, 24, 'soot', 7, { s: 0.6, spin: i * 20 + t * 10 * go, k: wk });
    });
    out += clothWall() + soots;
    out += g(text(0, 0, 'ぬの', { size: 64, w: 900, fill: '#8a7d68' }), { x: 150, y: 520 });
    out += topBadge();
    out += tagAt(t, c0 + 0.3, 780, 690, 'すす（こなの よごれ）', C.ink, 352, 758, { end: c0 + 2.8, size: 40 });
    out += pop(badge('すすも とりかこむ', { fill: C.ink, size: 44 }), t, c0 + 3.0, 1100, 770, { end: c1 - 0.2 });
    // もどらない
    const xo = win(t, c1 + 1.8, c2 - 0.1, 0.3);
    if (xo > 0) out += g(cross(400, 520, 0.42) + cross(380, 250, 0.3), { o: xo });
    out += tagAt(t, c1 + 0.3, 1240, 300, 'まわりが みずと なかよし', C.blueUi, ox + 64, oy - 52, { end: c2 - 0.2 });
    out += pop(badge('ぬのに もどらない', { fill: C.redUi, size: 46 }), t, c1 + 2.6, 760, 770, { end: c2 - 0.2 });
    out += pop(badge('すすぎの みずと いっしょに ながれる', { fill: C.blueUi, size: 44 }), t, c2 + 1.2, 1100, 780);
    return out;
  },
});

// 8. ミセル：頭を外に向けた小さな玉。内がわによごれを取りこむ
const MIC = [[600, 470], [1320, 470]];
SCENES.push({
  id: 'micelle',
  draw(t) {
    let out = WATERBG + topBadge();
    const c0 = cue(0), c1 = cue(1), gk = eio(prog(t, c0 + 2.6, 2.8));
    const tk = c1 + 3.0, inK = eio(prog(t, tk, 1.8));   // よごれを取りこむ
    // 取りこまれる油のつぶ（つぶの下をくぐって、まん中へ）
    if (t > tk - 0.6) out += g(oilBlob(0, 0, 40), { x: MIC[1][0], y: lerp(130, MIC[1][1], inK), o: prog(t, tk - 0.5, 0.4) });
    for (let j = 0; j < 2; j++) for (let i = 0; i < 16; i++) {
      const id = j * 16 + i, a = i / 16 * 360 + t * 6, rad = a * Math.PI / 180, R = 112 + (j === 1 ? 26 * inK : 0);
      const x0 = 240 + rnd(id, 81) * 1460 + Math.sin(t * 0.8 + id) * 26, y0 = 150 + rnd(id, 82) * 640 + Math.cos(t * 0.9 + id) * 20, a0 = rnd(id, 83) * 360 + t * 16;
      const k = eio(prog(t, c0 + 2.6 + rnd(id, 84) * 0.8, 2.0));
      out += mol(lerp(x0, MIC[j][0] + Math.cos(rad) * R, k), lerp(y0, MIC[j][1] + Math.sin(rad) * R, k), lerp(a0, a + 180, k), 1.35, prog(t, 0.3 + id * 0.02, 0.3));
    }
    out += pop(badge('たくさん あつまると…', { fill: '#7f95a6', size: 44 }), t, c0 + 1.0, 960, 200, { end: c0 + 4.6 });
    out += tagAt(t, c0 + 5.4, 310, 230, 'あたまは そと', C.blueUi, MIC[0][0] - 84, MIC[0][1] - 84, { end: c1 + 2.6 });
    out += pop(badge('ミセル', { fill: C.redUi, size: 60, pad: 50 }), t, c1 + 0.5, 960, 190);
    out += pop(badge('うちがわに よごれを とりこむ', { fill: SP.oilInk, size: 42 }), t, tk + 1.6, 1320, 760);
    return out;
  },
});

// 9. 石けんは、油とアルカリから作る
SCENES.push({
  id: 'made',
  draw(t) {
    let out = PAPER + topBadge();
    const c1 = cue(1), c2 = cue(2), c3 = cue(3), mv = eio(prog(t, c1 + 0.1, 0.9));
    out += g(text(0, 0, 'せっけんは なにから できている？', { size: 62, w: 900 }), { x: 960, y: 220, o: win(t, 0.4, c2 - 0.3, 0.4) });
    out += g(soapBar(1), { x: lerp(960, 1660, mv), y: 500, s: lerp(2.2, 1.4, mv), o: prog(t, 0.3, 0.4) });
    out += g(text(0, 0, '？', { size: 150, w: 900, fill: C.ochre }), { x: 1270, y: 440, o: win(t, 0.8, c1, 0.3) });
    const Y = 500, lab = (x, s, st) => g(text(0, 0, s, { size: 44, w: 900 }), { x, y: Y + 172, o: prog(t, st + 0.3, 0.4) });
    const fat = `<rect x="-78" y="-50" width="156" height="100" rx="20" fill="#fff6e6" stroke="#e3cfae" stroke-width="7"/><path d="M -50 -14 Q -20 -34 10 -12 M -20 22 Q 16 4 50 24" fill="none" stroke="#f0dfc2" stroke-width="7" stroke-linecap="round"/>`;
    const coco = `<circle cx="-24" cy="4" r="56" fill="#8a5a3a"/><circle cx="-44" cy="-10" r="7" fill="#5e3a22"/><circle cx="-18" cy="-18" r="7" fill="#5e3a22"/><circle cx="-30" cy="10" r="7" fill="#5e3a22"/>` + `<path d="M 60 -34 C 76 -10 88 4 88 20 A 28 28 0 0 1 32 20 C 32 4 44 -10 60 -34 Z" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="4"/>`;
    const flask = `<path d="M -22 -70 L 22 -70 L 22 -20 L 64 56 Q 70 70 54 70 L -54 70 Q -70 70 -64 56 L -22 -20 Z" fill="#eef3f6" stroke="#7f95a6" stroke-width="7" stroke-linejoin="round"/><path d="M -38 12 L 38 12 L 60 54 Q 64 64 54 64 L -54 64 Q -64 64 -60 54 Z" fill="#c9d6de"/><rect x="-28" y="-80" width="56" height="14" rx="6" fill="#7f95a6"/>` + g(warnIcon(0.36), { y: 34 });
    out += pop(fat, t, c1 + 0.9, 230, Y, { s: 1.5 }) + lab(230, 'うしの あぶら', c1 + 0.9);
    out += pop(coco, t, c1 + 2.2, 580, Y, { s: 1.5 }) + lab(630, 'ヤシの あぶら など', c1 + 2.2);
    out += pop(text(0, 0, '＋', { size: 110, w: 900, fill: C.muted }), t, c1 + 3.8, 918, Y);
    out += pop(flask, t, c1 + 4.2, 1100, Y, { s: 1.5 }) + lab(1100, 'アルカリ', c1 + 4.2);
    out += g(arrow(1250, Y, 1440, Y, C.ochre, 18), { o: prog(t, c1 + 5.6, 0.4) });
    out += g(text(0, 0, 'まぜて つくる', { size: 38, w: 900, fill: C.ochre }), { x: 1340, y: Y - 60, o: prog(t, c1 + 5.8, 0.4) });
    out += g(text(0, 0, 'せっけん', { size: 44, w: 900 }), { x: 1660, y: Y + 172, o: prog(t, c1 + 6.2, 0.4) });
    // 油からできていた
    const hk = prog(t, c2 + 0.4, 0.5);
    out += g(`<rect x="60" y="${Y - 150}" width="800" height="370" rx="44" fill="none" stroke="${SP.oilD}" stroke-width="10" stroke-dasharray="26 18"/>`, { o: hk });
    out += pop(badge('せっけんは あぶらから できていた！', { fill: SP.oilInk, size: 52, pad: 44 }), t, c2 + 1.2, 960, 220);
    // アルカリはあぶない
    out += g(`<circle cx="1100" cy="${Y - 4}" r="114" fill="none" stroke="${C.red}" stroke-width="10"/>`, { o: prog(t, c3 + 0.2, 0.4) });
    out += pop(g(warnIcon(0.8), { x: -640 }) + text(-580, 2, 'アルカリは あぶない くすり。せっけんづくりは まねしない', { size: 44, w: 900, anchor: 'start', fill: C.red }), t, c3 + 0.4, 960, 790);
    return out;
  },
});
const arrow = (x1, y1, x2, y2, col, w = 14) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.4, bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h;
  return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${bx - Math.sin(a) * h * 0.7} ${by + Math.cos(a) * h * 0.7} L ${bx + Math.sin(a) * h * 0.7} ${by - Math.cos(a) * h * 0.7} Z" fill="${col}" stroke="${col}" stroke-width="4" stroke-linejoin="round"/>`;
};
// ふたのしまるボトル（中心 0,0）。mode: 'mix' ふったところ / 'sep' 分かれたところ
function bottle(t, mode, shake = 0) {
  const sx = Math.sin(t * 22) * 9 * shake;
  let o = `<rect x="-26" y="-150" width="52" height="34" rx="8" fill="${C.redUi}"/>`;
  o += `<path d="M -30 -116 L 30 -116 L 62 -70 L 62 110 Q 62 130 42 130 L -42 130 Q -62 130 -62 110 L -62 -70 Z" fill="#f3f9fc" stroke="#7fa7bd" stroke-width="7" stroke-linejoin="round"/>`;
  o += `<path d="M -58 -20 L 58 -20 L 58 108 Q 58 126 42 126 L -42 126 Q -58 126 -58 108 Z" fill="${SP.waterD}"/>`;
  if (mode === 'sep') o += `<rect x="-58" y="-50" width="116" height="34" fill="${SP.oil}"/>`;
  else { o += `<rect x="-58" y="-50" width="116" height="34" fill="${SP.waterD}"/>`; for (let i = 0; i < 16; i++) o += `<circle cx="${-46 + rnd(i, 91) * 92}" cy="${-40 + rnd(i, 92) * 150 + Math.sin(t * 5 + i) * 4}" r="${5 + rnd(i, 93) * 5}" fill="${SP.oil}" stroke="${SP.oilD}" stroke-width="1.5"/>`; }
  return `<g transform="translate(${sx} 0) rotate(${sx * 0.8})">${o}</g>`;
}

// 10. 答え と みてみよう
SCENES.push({
  id: 'look',
  draw(t) {
    let out = PAPER + topBadge();
    const aO = 1 - prog(t, cue(1) - 0.6, 0.5);
    if (aO > 0) {
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[1][1], { size: 50, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['しっぽが あぶらに ささる', C.ink], ['ぐるりと とりかこむ', C.redUi], ['みずの なかへ はこぶ', C.blueUi]], t, 960, 660, { start: 2.6, step: 1.4, size: 34, gap: 26 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const items = [
        [g(bottle(0, 'mix'), { s: 0.34 }), 'おとなと、ボトルに みずと あぶらを いれ、ふたを しめて ふる', C.ink],
        [g(bottle(0, 'sep'), { s: 0.34 }), 'おいて おくと、うえと したに わかれるかな？', C.ink],
        [soapBar(0.42), 'せっけんを すこし たして ふると、どう かわる？', C.ink],
        [warnIcon(0.8), 'せっけんすいは のまない。めに いれない', C.red],
        [warnIcon(0.8), 'おわったら、てを あらう', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 40, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 190, 322 + i * 116);
      });
      // ボトルの絵：ふる → 分かれる → 石けんをたすと？
      const st = t < cue(2) ? 0 : t < cue(3) ? 1 : 2;
      let w = card(330, 420);
      w += g(bottle(t, st === 1 ? 'sep' : 'mix', st === 0 ? win(t, cue(1) + 1.0, cue(2) - 0.3, 0.3) : st === 2 ? win(t, cue(3) + 1.6, cue(4) - 0.2, 0.3) : 0), { y: 30, s: 1.1 });
      if (st === 2) w += g(soapBar(0.4), { x: 96, y: -150, o: win(t, cue(3) + 0.2, cue(3) + 1.8, 0.3) }) + g(`<circle r="46" fill="${C.ochre}"/>` + text(0, 4, '？', { size: 60, w: 900, fill: '#fff' }), { x: 110, y: -140, o: prog(t, cue(3) + 2.0, 0.4) });
      b += pop(w, t, cue(1) + 0.4, 1700, 560);
      b += kidShow('K', t, 1660, 280, { s: 0.6, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「せっけんで あらうと、どうして よごれが おちるの？」のページへ ／ 出典は 概要欄に', { size: 27, w: 700, fill: '#d9e6dc' }), { x: 1090, y: 800, o: prog(t, 2.0, 0.5) });
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
