// みのまわり図鑑 動画「海の水は、どうしてしょっぱいの？」
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
const TOPIC = 'うみ';
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
// ---------- うみの道具 ----------
const SEA = { top: '#49a8dc', deep: '#1f6fa8', floor: '#d2b888', rock: '#9b9388', rockD: '#6f695f', grass: '#7fc27a', river: '#3f9fe0' };
// 塩のつぶ（白いひしがた。ほんとうは水にとけて目に見えない）
const saltDot = (x, y, r = 8, o = 1) => `<rect x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}" width="${r * 2}" height="${r * 2}" rx="${r * 0.25}" transform="rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})" fill="#fff" stroke="#56788f" stroke-width="${Math.max(1.6, r * 0.3)}" opacity="${o}"/>`;
// 折れ線の上の点（f = 0〜1、長さで進む）と、折れ線の長さ
const plen = P => P.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - P[i][0], p[1] - P[i][1]), 0);
function along(P, f) {
  let d = clamp(f) * plen(P);
  for (let i = 1; i < P.length; i++) {
    const s = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (d <= s || i === P.length - 1) { const k = s ? clamp(d / s) : 0; return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; }
    d -= s;
  }
  return P[0];
}
const yOn = (P, x) => { for (let i = 1; i < P.length; i++) if (x <= P[i][0]) return lerp(P[i - 1][1], P[i][1], clamp((x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]))); return P[P.length - 1][1]; };
const pstr = P => P.map(p => p.join(' ')).join(' L ');
// 矢印
const arrow = (x1, y1, x2, y2, col, w = 14, o = 1) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.4, bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h;
  return `<g opacity="${o}"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M ${x2} ${y2} L ${bx - Math.sin(a) * h * 0.7} ${by + Math.cos(a) * h * 0.7} L ${bx + Math.sin(a) * h * 0.7} ${by - Math.cos(a) * h * 0.7} Z" fill="${col}" stroke="${col}" stroke-width="4" stroke-linejoin="round"/></g>`;
};
const warnIcon = (s = 1) => `<g transform="scale(${s})"><path d="M 0 -50 L 56 44 L -56 44 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` + text(0, 14, '!', { size: 56, w: 900 }) + `</g>`;
// コップ（中心 0,0、高さ 200）。[水, ふち] を返す
const gxl = y => -70 + (y + 100) / 200 * 14;
function glass(lvl, col = '#7cc4ea') {
  const top = -100 + 192 * (1 - lvl);
  const w = lvl > 0.005 ? `<path d="M ${gxl(top)} ${top} L ${-gxl(top)} ${top} L ${-gxl(92)} 92 Q 56 100 46 100 L -46 100 Q -56 100 ${gxl(92)} 92 Z" fill="${col}"/>` : '';
  const rim = `<path d="M -70 -100 L -56 92 Q -56 100 -46 100 L 46 100 Q 56 100 56 92 L 70 -100" fill="#eaf4fa" fill-opacity="0.22" stroke="#7fa7bd" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M -52 -78 L -45 50" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
  return [w, rim];
}
// 山 → 川 → 海 の断面
const GP = [[0, 420], [150, 330], [330, 200], [470, 300], [620, 410], [800, 500], [985, 562]];   // 地面
const FP = [[985, 562], [1110, 700], [1320, 780], [1920, 792]];                                  // 海の底
const RV = [[420, 264], [470, 300], [620, 410], [800, 500], [985, 562]];                         // 川
const seaPos = i => { const x = 1090 + rnd(i, 21) * 790; return [x, lerp(598, yOn(FP, x) - 24, rnd(i, 22))]; };
function land(t, { cloudX = 400, cloudY = 130, cloudO = 0, rain = 0, sun = 1, seaDots = 0, riverDots = 0, flash = 0, seaCol = SEA.top } = {}) {
  let o = `<linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3f3"/><stop offset="0.6" stop-color="#e3f3fc"/></linearGradient><rect width="1920" height="1080" fill="url(#lsky)"/>`;
  if (sun > 0) o += g(sunDisc(1790, 110, 60, 0), { o: sun });
  // 海
  o += `<linearGradient id="lsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${seaCol}"/><stop offset="0.5" stop-color="${SEA.deep}"/></linearGradient>`;
  const wave = Array.from({ length: 20 }, (_, i) => `${(985 + i * 935 / 19).toFixed(0)} ${(562 + Math.sin(t * 2 + i * 0.9) * 4).toFixed(1)}`).join(' L ');
  o += `<path d="M ${wave} L 1920 1080 L 985 1080 Z" fill="url(#lsea)"/>`;
  // 木と家
  o += tree(705, 452, 0.34) + tree(872, 528, 0.28, '#4d9a52') + house(930, 546, 0.3);
  // 陸と海の底
  o += `<path d="M 0 1080 L ${pstr(GP.concat(FP.slice(1)))} L 1920 1080 Z" fill="${SEA.floor}"/>`;
  o += `<path d="M 0 1080 L 0 420 L 150 330 L 330 200 L 470 300 L 600 395 L 800 1080 Z" fill="${SEA.rock}"/>`;
  o += `<path d="M 540 351 L 620 410 L 800 500 L 985 562 L 1010 590 L 940 614 L 800 566 L 620 476 L 548 424 Z" fill="${SEA.grass}"/>`;
  o += `<path d="M 330 200 L 296 340 L 372 452 M 150 330 L 196 480 M 330 200 L 404 350 M 40 470 L 96 600" stroke="${SEA.rockD}" stroke-width="7" fill="none" opacity="0.45" stroke-linecap="round" stroke-linejoin="round"/>`;
  // 川
  o += `<path d="M ${pstr(RV)}" fill="none" stroke="${SEA.river}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${pstr(RV)}" fill="none" stroke="#d3eefc" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 44" stroke-dashoffset="${(-t * 110).toFixed(1)}" opacity="0.9"/>`;
  // 雲と雨
  if (cloudO > 0) {
    if (rain > 0) for (let i = 0; i < 28; i++) {
      const x = cloudX - 125 + rnd(i, 31) * 250, gy = x > 985 ? 562 : yOn(GP, x), y = lerp(cloudY + 30, gy, (t * 1.25 + rnd(i, 32)) % 1);
      o += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 5).toFixed(1)}" y2="${(y + 22).toFixed(1)}" stroke="#3f8fd0" stroke-width="5" stroke-linecap="round" opacity="${0.85 * rain * cloudO}"/>`;
    }
    o += cloud(cloudX, cloudY, 1.1, mix('#ffffff', '#b4c2cf', rain * 0.8), cloudO);
  }
  // 塩のつぶ（川を流れる）
  if (riverDots > 0) for (let i = 0; i < 7; i++) { const [x, y] = along(RV, (t * 0.13 + i / 7) % 1); o += saltDot(x, y - 3, 7, riverDots); }
  // 塩のつぶ（海にたまる）
  for (let i = 0; i < Math.ceil(seaDots); i++) {
    const [x, y] = seaPos(i), k = clamp(seaDots - i);
    o += saltDot(x, y + Math.sin(t * 1.4 + i) * 4, 8 * (1 + 0.45 * flash * Math.abs(Math.sin(t * 6 + i * 0.4))), k);
  }
  return o;
}
// 指し線つきのラベル
const tagAt = (t, st, x, y, str, col, px, py, { end = 1e9, size = 42 } = {}) =>
  pop(`<line x1="0" y1="0" x2="${px - x}" y2="${py - y}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="${px - x}" cy="${py - y}" r="11" fill="${col}"/>` + badge(str, { fill: col, size }), t, st, x, y, { end });

// 1. つかみ：海はしょっぱいのに、川も雨もしょっぱくない
SCENES.push({
  id: 'hook',
  draw(t) {
    let out = land(t, { cloudX: 300, cloudY: 120, cloudO: prog(t, cue(2) - 0.7, 0.6), rain: prog(t, cue(2) - 0.1, 0.5) });
    const hide = cue(4) - 0.2;
    out += tagAt(t, cue(0) + 1.6, 1440, 410, 'うみの みず：しょっぱい', C.blueUi, 1440, 620, { end: hide });
    out += tagAt(t, cue(1) + 1.6, 1000, 290, 'かわの みず：しょっぱくない', C.accent, 716, 462, { end: hide });
    out += tagAt(t, cue(2) + 0.6, 760, 150, 'あめ：しょっぱくない', '#5b7f99', 420, 200, { end: hide });
    out += topBadge();
    out += kidShow('S', t, 130, 1000, { s: 0.5, start: 0.4, n: 0, look: [8, -4] });
    // 川のコップ と 海のコップ
    const cO = win(t, cue(4), cueE(4) + 0.5, 0.4);
    if (cO > 0) {
      let c = card(900, 380);
      const [w1, r1] = glass(0.78, '#a9dcf5'), [w2, r2] = glass(0.78, '#58aee0');
      c += g(w1 + r1, { x: -250, y: -30, s: 1.0 }) + g(w2 + r2, { x: 250, y: -30, s: 1.0 });
      c += text(-250, 130, 'かわの みず', { size: 42, w: 900 }) + text(250, 130, 'うみの みず', { size: 42, w: 900 });
      c += text(-250, -158, 'しょっぱくない', { size: 34, w: 900, fill: C.accent }) + text(250, -158, 'しょっぱい', { size: 34, w: 900, fill: C.blueUi });
      c += text(0, -30, '？', { size: 110, w: 900, fill: C.ochre });
      out += g(c, { x: 1180, y: 330 - (1 - eo(prog(t, cue(4), 0.5))) * 40, o: cO });
    }
    // 題名
    const t0 = cueE(4) + 0.6, tk = prog(t, t0, 0.6);
    if (tk > 0) {
      out += `<rect width="1920" height="1080" fill="${C.paper}" opacity="${eo(tk)}"/>`;
      out += pop(badge('みのまわり図鑑', { fill: C.accent, size: 38 }), t, t0 + 0.3, 960, 280);
      out += g(`<text x="0" y="0" font-size="120" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}"><tspan fill="${C.blue}">海の 水</tspan>は、</text>`, { x: 960, y: 470, o: prog(t, t0 + 0.6, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 0.6, 0.6))) });
      out += g(`<text x="0" y="0" font-size="124" font-weight="900" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.04em" fill="${C.ink}">どうして <tspan fill="${C.redUi}">しょっぱい</tspan>の？</text>`, { x: 960, y: 650, o: prog(t, t0 + 1.1, 0.4), s: lerp(0.94, 1, eo(prog(t, t0 + 1.1, 0.6))) });
      const [w2, r2] = glass(0.78, '#58aee0');
      let ic = w2; for (let i = 0; i < 7; i++) ic += saltDot(-36 + rnd(i, 3) * 72, -30 + rnd(i, 4) * 100, 7);
      out += pop(g(ic + r2, { s: 0.62 }), t, t0 + 1.8, 960, 850);
    }
    return out;
  },
});

// 2. 予想（正解は2番）
const OPTS = [['①', 'うみの いきものが、しおを だしている'], ['②', 'やまの いわの しおを、かわが はこぶ'], ['③', 'うみの そこに、しおの かたまりが ある']];
SCENES.push({
  id: 'guess',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    out += pop(text(0, 0, 'うみは どうして しょっぱい？', { size: 80, w: 900 }), t, 0.3, 900, 210);
    const cur = curLine();
    OPTS.forEach(([n, s], i) => {
      const on = cur === i + 1;
      out += pop((on ? `<rect x="-600" y="-76" width="1200" height="152" rx="32" fill="none" stroke="${C.ochre}" stroke-width="8"/>` : '') + card(1180, 132) +
        `<circle cx="-500" cy="0" r="44" fill="${[C.blueUi, C.accent, C.redUi][i]}"/>` + text(-500, 3, n, { size: 50, w: 900, fill: '#fff' }) +
        text(-430, 2, s, { size: 50, w: 700, anchor: 'start' }), t, cue(i + 1) - 0.2, 860, 390 + i * 168);
    });
    out += kidShow('B', t, 1730, 850, { s: 0.56, start: 0, n: 0, pose: 'think', mouth: 'flat', look: [-5, -7], bubble: false });
    const c0 = cueE(3) + 0.3;
    [3, 2, 1].forEach((n, i) => {
      const st = c0 + i * 1.0, o = win(t, st, st + 1.0, 0.18);
      if (o > 0) out += g(`<circle r="62" fill="${C.ochre}"/>` + text(0, 4, n, { size: 76, w: 900, fill: '#fff' }), { x: 1640, y: 230, o, s: lerp(1.25, 1, eo(prog(t, st, 0.3))) });
    });
    return out;
  },
});

// 3. 海の水には塩がとけている（1キログラムに およそ35グラム）
SCENES.push({
  id: 'salt',
  draw(t) {
    let out = `<rect width="1920" height="1080" fill="${C.paper}"/>` + topBadge();
    const e0 = cue(1) + 2.4, evR = prog(t, e0, 3.4), ev = eio(evR), lvl = lerp(0.8, 0, ev);
    const GX = 610, GY = 500, GS = 2.3, top = -100 + 192 * (1 - lvl);
    const [w, rim] = glass(lvl, mix('#58aee0', '#8fcdee', ev));
    let gl = w;
    for (let i = 0; i < 24; i++) {
      const fx = -42 + rnd(i, 41) * 84, fy = -48 + rnd(i, 42) * 128 + Math.sin(t * 1.6 + i) * 3;
      const row = i < 10 ? 0 : i < 18 ? 1 : 2, n = [10, 8, 6][row], idx = i - [0, 10, 18][row];
      const px = (idx - (n - 1) / 2) * 9, py = 91 - row * 8, k = ev * ev;
      gl += saltDot(lerp(fx, px, k), lerp(Math.max(fy, top + 12), py, k), 5.2, prog(t, cue(0) + 0.5 + i * 0.05, 0.3));
    }
    // ゆげ（水が空へ出ていく）
    const stO = Math.sin(Math.PI * evR);
    if (stO > 0.01) for (let k = 0; k < 4; k++) {
      const x = -45 + k * 30, ph = t * 3 + k, y0 = -108 - ((t * 30 + k * 13) % 40);
      gl += `<path d="M ${x} ${y0} q ${8 * Math.sin(ph)} -10 0 -20 q ${-8 * Math.sin(ph)} -10 0 -20" fill="none" stroke="#9cc7de" stroke-width="5" stroke-linecap="round" opacity="${stO * 0.9}"/>`;
    }
    out += g(gl + rim, { x: GX, y: GY, s: GS, o: prog(t, 0.2, 0.4) });
    out += g(text(0, 0, 'うみの みず', { size: 54, w: 900 }), { x: 262, y: 300, o: prog(t, 0.4, 0.4) });
    out += g(card(600, 190) + text(0, -34, 'しおの つぶは、ほんとうは', { size: 40, w: 900, fill: C.muted }) + text(0, 34, 'めに みえないよ', { size: 40, w: 900, fill: C.muted }), { x: 1330, y: 480, o: win(t, cue(0) + 1.4, e0 + 2.6, 0.4) });
    out += pop(badge('しおが とけている', { fill: C.blueUi, size: 44 }), t, cue(0) + 1.0, GX, 792, { end: e0 + 2.6 });
    out += pop(badge('1キログラム', { fill: C.ochre, size: 40 }), t, cue(1) + 0.4, 262, 500, { end: e0 + 3.0 });
    out += g(badge('かわかすと…', { fill: '#7f95a6', size: 40 }), { x: 262, y: 400, o: win(t, e0 - 0.3, e0 + 3.0, 0.3) });
    // のこった塩
    const rs = e0 + 3.3;
    out += g(`<path d="M 700 700 Q 900 660 1010 470" fill="none" stroke="${C.ochre}" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 16"/>`, { o: prog(t, rs, 0.4) });
    out += g(text(0, 0, 'のこった しおなど', { size: 48, w: 900 }), { x: 1330, y: 300, o: prog(t, rs, 0.4) });
    out += pop(badge('へいきんで およそ 35グラム', { fill: C.ochre, size: 48, pad: 40 }), t, rs + 0.3, 1330, 392);
    out += pop(badge('しおが のこった', { fill: C.blueUi, size: 44 }), t, rs + 0.1, GX, 792);
    // 台所の食塩
    const shaker = `<rect x="-52" y="-46" width="104" height="132" rx="24" fill="#fff" stroke="#7fa7bd" stroke-width="8"/><path d="M -44 20 L 44 20 L 44 62 Q 44 78 28 78 L -28 78 Q -44 78 -44 62 Z" fill="#eef0ea"/><path d="M -52 -40 Q -52 -92 0 -92 Q 52 -92 52 -40 Z" fill="#8fa0ad"/><circle cx="-20" cy="-66" r="5" fill="#fff"/><circle cx="0" cy="-74" r="5" fill="#fff"/><circle cx="20" cy="-66" r="5" fill="#fff"/>` + text(0, -8, 'しお', { size: 34, w: 900, fill: C.blueUi });
    out += pop(shaker, t, cue(2) + 0.2, 1100, 620, { s: 1.15 });
    out += g(text(0, 0, 'いちばん おおいのは', { size: 42, w: 900, anchor: 'start' }), { x: 1200, y: 580, o: prog(t, cue(2) + 0.6, 0.4) });
    out += g(text(0, 0, 'だいどころの しおの もと', { size: 50, w: 900, anchor: 'start', fill: C.blueUi }), { x: 1200, y: 656, o: prog(t, cue(2) + 1.6, 0.4) });
    return out;
  },
});

// 4. 塩のふるさと：雨が山の岩をほんの少しずつとかす
const RK = [[0, 560], [230, 380], [470, 250], [700, 330], [900, 500], [1130, 640], [1330, 850]];
const RKR = RK.slice(2);
SCENES.push({
  id: 'rock',
  draw(t) {
    let out = `<linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9cfe6"/><stop offset="0.7" stop-color="#e6f2f9"/></linearGradient><rect width="1920" height="1080" fill="url(#rsky)"/>`;
    const rn = prog(t, cue(1) - 0.3, 0.6);
    out += `<path d="M 1180 1080 L 1330 850 L 1920 820 L 1920 1080 Z" fill="${SEA.grass}"/>`;
    out += `<path d="M 0 1080 L ${pstr(RK)} L 1420 1080 Z" fill="${SEA.rock}"/>`;
    out += `<path d="M 470 250 L 420 520 L 560 780 M 700 330 L 730 600 L 900 830 M 230 380 L 290 650 M 900 500 L 1020 800" stroke="${SEA.rockD}" stroke-width="9" fill="none" opacity="0.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    // とけたあとのくぼみ
    const dk = prog(t, cue(2) + 0.8, 4.0);
    [0.12, 0.3, 0.47, 0.66, 0.84].forEach((f, i) => { const [x, y] = along(RKR, f), k = clamp(dk * 5 - i * 0.6); if (k > 0) out += `<ellipse cx="${x - 6}" cy="${y + 12}" rx="${26 * k}" ry="${11 * k}" fill="${SEA.rockD}" opacity="0.8" transform="rotate(34 ${x} ${y})"/>`; });
    // 岩をつたう水
    const wk = prog(t, cue(2) + 0.3, 1.8), WL = plen(RKR);
    if (wk > 0) out += `<path d="M ${pstr(RKR)}" fill="none" stroke="${SEA.river}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(WL * eo(wk)).toFixed(0)} ${WL.toFixed(0)}" opacity="0.9"/>`;
    // とけ出したつぶ（水といっしょに下へ）
    const d0 = cue(2) + 1.2;
    if (t > d0) for (let i = 0; i < 8; i++) {
      const age = t - d0 - i * 0.45; if (age < 0) continue;
      const f0 = [0.12, 0.3, 0.47, 0.66, 0.84, 0.2, 0.4, 0.58][i], f = f0 + ((age * 0.16) % (1.02 - f0));
      const [x, y] = along(RKR, f);
      out += saltDot(x, y - 4, 9, clamp(age * 3) * clamp((1.0 - f) * 12));
    }
    // 雲と雨
    for (let i = 0; i < 34; i++) {
      const x = 330 + rnd(i, 51) * 560, gy = yOn(RK, x), y = lerp(170, gy, (t * 1.2 + rnd(i, 52)) % 1);
      out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 6).toFixed(1)}" y2="${(y + 26).toFixed(1)}" stroke="#3f8fd0" stroke-width="6" stroke-linecap="round" opacity="${0.85 * rn}"/>`;
    }
    out += cloud(600, 130, 1.5, mix('#ffffff', '#aebdca', rn * 0.85), 1) + cloud(380, 150, 1.0, mix('#ffffff', '#b9c6d2', rn * 0.85), 1);
    out += topBadge();
    // 問い
    out += g(text(0, 0, 'しおは どこから', { size: 68, w: 900 }) + text(0, 96, 'きたのかな？', { size: 68, w: 900 }), { x: 1440, y: 300, o: win(t, 0.4, cue(1) - 0.4, 0.35) });
    // 雨のしずくを大きくして見る
    const lO = win(t, cue(1) - 0.1, cue(3) - 0.3, 0.4);
    if (lO > 0) {
      const LX = 1480, LY = 360, R = 190;
      let l = `<line x1="${760 - LX}" y1="${330 - LY}" x2="${-R * 0.93}" y2="${-R * 0.3}" stroke="${C.blueUi}" stroke-width="5" stroke-dasharray="6 12" stroke-linecap="round"/><circle cx="${760 - LX}" cy="${330 - LY}" r="26" fill="none" stroke="${C.blueUi}" stroke-width="6"/>`;
      l += `<circle r="${R}" fill="#f1f8fc" stroke="${C.blueUi}" stroke-width="14"/>`;
      l += `<path d="M 0 -130 C 40 -60 96 -10 96 50 A 96 96 0 0 1 -96 50 C -96 -10 -40 -60 0 -130 Z" fill="#62b4e6"/><path d="M -50 30 A 56 56 0 0 0 -14 104" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2 + 0.4, k = eio(prog(t, cue(1) + 0.8 + i * 0.35, 1.2));
        const x0 = Math.cos(a) * 160, y0 = Math.sin(a) * 150, x1 = -50 + rnd(i, 61) * 100, y1 = -10 + rnd(i, 62) * 110;
        l += `<circle cx="${lerp(x0, x1, k) + Math.sin(t * 2 + i) * 3}" cy="${lerp(y0, y1, k) + Math.cos(t * 2.3 + i) * 3}" r="12" fill="#8d7fb8" stroke="#fff" stroke-width="3" opacity="${prog(t, cue(1) + 0.5 + i * 0.35, 0.3)}"/>`;
      }
      l += text(0, -R - 52, 'あめの しずく', { size: 46, w: 900 });
      out += g(l, { x: LX, y: LY, o: lO });
      out += pop(badge('くうきの ガスが すこし とけている', { fill: '#6f629c', size: 36 }), t, cue(1) + 1.6, 1470, 610, { end: cue(3) - 0.3 });
    }
    out += pop(badge('いわが ほんの すこしずつ とける', { fill: C.ink, size: 42 }), t, cue(2) + 1.6, 520, 790);
    out += kidShow('K', t, 1690, 880, { s: 0.7, start: cue(3) - 0.9, n: 0, bubble: false });
    out += talkBubble('K', 1420, 610, 1632, 764);
    return out;
  },
});

// 5. 川が海へ運ぶ。海の底の熱い水からも加わる
SCENES.push({
  id: 'river',
  draw(t) {
    const sd = lerp(0, 16, prog(t, cue(0) + 2.2, cueE(1) - cue(0) - 2.2));
    let out = land(t, { cloudX: 320, cloudY: 110, cloudO: 1, rain: 1, riverDots: prog(t, 0.3, 0.6), seaDots: sd });
    out += topBadge();
    out += tagAt(t, cue(0) + 1.0, 1010, 300, 'かわが うみへ はこぶ', C.accent, 720, 458, { end: cue(1) - 0.2 });
    out += g(text(0, 0, 'せかいじゅうの かわが はこぶ しお', { size: 46, w: 900 }), { x: 1180, y: 250, o: win(t, cue(1) + 0.3, cue(2) - 0.4, 0.4) });
    out += pop(badge('1ねんに およそ 40おくトン', { fill: C.ochre, size: 52, pad: 42 }), t, cue(1) + 2.8, 1180, 350, { end: cue(2) - 0.4 });
    out += g(text(0, 0, '（みつもり）', { size: 36, w: 700, fill: C.muted }), { x: 1180, y: 432, o: win(t, cue(1) + 3.4, cue(2) - 0.4, 0.4) });
    // 海の底：熱い水がふき出すところ
    const v0 = cue(2) - 0.4, vO = prog(t, v0, 0.6);
    if (vO > 0) {
      let u = `<linearGradient id="usea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a7fb5"/><stop offset="0.7" stop-color="#0f3f66"/></linearGradient><rect width="1920" height="1080" fill="url(#usea)"/>`;
      // ふき出す熱い水
      for (let i = 0; i < 16; i++) {
        const f = (t * 0.22 + i / 16) % 1, x = 960 + Math.sin(i * 2.3 + f * 4) * (16 + f * 110), y = lerp(500, 120, f);
        u += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(24 + f * 80).toFixed(1)}" fill="#ffd9a6" opacity="${((1 - f) * 0.5).toFixed(2)}"/>`;
      }
      // 海の底の岩と、下のマグマ
      u += `<path d="M 0 664 L 700 652 L 880 640 L 922 516 L 998 516 L 1040 640 L 1220 652 L 1920 664 L 1920 1080 L 0 1080 Z" fill="#5d5146"/>`;
      u += `<ellipse cx="960" cy="900" rx="560" ry="100" fill="#ff6a1e" opacity="0.95" filter="url(#glow)"/><ellipse cx="960" cy="930" rx="420" ry="70" fill="#ffb04a" opacity="0.9" filter="url(#soft)"/>`;
      u += `<path d="M 960 840 L 960 520" stroke="#ffb36b" stroke-width="30" stroke-linecap="round" opacity="0.85"/>`;
      // しみこむ海の水
      [-1, 1].forEach(sd2 => {
        const d = `M ${960 + sd2 * 470} 600 C ${960 + sd2 * 470} 760 ${960 + sd2 * 300} 800 ${960 + sd2 * 60} 800`;
        u += `<path d="${d}" fill="none" stroke="#9fd6f5" stroke-width="9" stroke-linecap="round" stroke-dasharray="20 22" stroke-dashoffset="${(-t * 60).toFixed(1)}"/>`;
        u += `<path d="M ${960 + sd2 * 44} 800 l ${sd2 * 34} -22 l 0 44 Z" fill="#9fd6f5"/>`;
      });
      // つぶ（まわりの岩からとけこんだもの）
      for (let i = 0; i < 10; i++) {
        const f = (t * 0.17 + i / 10) % 1;
        u += saltDot(960 + (rnd(i, 71) - 0.5) * f * 520, lerp(500, 170, f), 9, clamp((1 - f) * 4) * clamp(f * 8));
      }
      u += g(text(0, 0, 'うみの そこ', { size: 42, w: 900, fill: '#e8f1f6' }), { x: 250, y: 608, o: prog(t, v0 + 0.6, 0.4) });
      u += g(text(0, 0, 'しみこんだ うみの みず', { size: 36, w: 900, fill: '#cfeafa' }), { x: 300, y: 742, o: prog(t, v0 + 1.2, 0.4) });
      u += g(text(0, 0, 'マグマの ねつ', { size: 40, w: 900, fill: '#fff0d6' }), { x: 1600, y: 760, o: prog(t, v0 + 1.6, 0.4) });
      u += pop(badge('あつい みずが ふきだす', { fill: '#c8602c', size: 46 }), t, v0 + 1.0, 1440, 330);
      u += pop(badge('ここからも くわわる', { fill: C.blueUi, size: 46 }), t, cue(2) + 3.2, 470, 330);
      u += topBadge(true);
      out += g(u, { o: vO });
    }
    return out;
  },
});

// 6. どうして川はしょっぱくない？ 雨の新しい水がいつもたされる
SCENES.push({
  id: 'fresh',
  draw(t) {
    const rn = lerp(0.35, 1, prog(t, cue(1) - 0.3, 0.6));
    let out = g(land(t, { cloudX: 500, cloudY: 150, cloudO: 1, rain: rn, riverDots: 0, sun: 0 }), { x: 0, y: -70, s: 1.35 });
    // 川のつぶは少しだけ
    for (let i = 0; i < 3; i++) { const [x, y] = along(RV, (t * 0.16 + i / 3) % 1); out += saltDot(x * 1.35, (y - 3) * 1.35 - 70, 9); }
    out += topBadge();
    out += g(card(760, 190) + text(0, -36, 'かわは どうして', { size: 54, w: 900 }) + text(0, 40, 'しょっぱくないの？', { size: 54, w: 900 }), { x: 1400, y: 240, o: win(t, 0.4, cue(1) - 0.3, 0.4) });
    out += pop(badge('あめの あたらしい みずが', { fill: C.blueUi, size: 46 }), t, cue(1) + 0.4, 1400, 200);
    out += pop(badge('いつも たされる', { fill: C.blueUi, size: 46 }), t, cue(1) + 1.5, 1400, 296);
    out += tagAt(t, cue(1) + 2.8, 560, 720, 'かわの しおは ほんの すこし', C.accent, 890, 520, { size: 38 });
    return out;
  },
});

// 7. 海は塩を集める。水だけが空へ、塩はのこる
SCENES.push({
  id: 'evap',
  draw(t) {
    const c4 = cue(4);
    const sd = lerp(16, 44, eio(prog(t, 0.3, cue(1) - 0.3)));
    const cx = lerp(1400, 400, eio(prog(t, c4 + 1.3, 2.2)));
    let out = land(t, { cloudX: cx, cloudY: 130, cloudO: prog(t, c4 + 0.1, 0.9), rain: prog(t, c4 + 3.5, 0.5), riverDots: 1, seaDots: sd, flash: win(t, cue(2), cueE(2) + 0.3, 0.3) });
    // ほかの川からも
    const oO = win(t, 0.5, cue(1) - 0.2, 0.4);
    if (oO > 0) {
      for (let i = 0; i < 4; i++) { const f = (t * 0.3 + i / 4) % 1; out += saltDot(lerp(1915, 1700, f), 592 + Math.sin(i * 2) * 6 + f * 30, 8, oO * (1 - f)); }
      out += g(arrow(1900, 520, 1790, 560, C.accent, 10) + text(1880, 478, 'ほかの かわからも', { size: 34, w: 900, anchor: 'end', fill: C.accent }), { o: oO });
    }
    out += pop(badge('すべての かわから しおが あつまる', { fill: C.accent, size: 42 }), t, cue(0) + 0.6, 1300, 320, { end: cue(1) - 0.2 });
    // 蒸発：水だけが空へ
    const eO = win(t, cue(1) + 0.2, c4 + 1.6, 0.5);
    if (eO > 0) {
      [1200, 1420, 1640].forEach((x, i) => {
        const k = eo(prog(t, cue(1) + 0.5 + i * 0.3, 1.4)), y1 = lerp(540, 330, k);
        let d = `M ${x} 540`; for (let y = 540; y > y1; y -= 10) d += ` L ${(x + Math.sin((540 - y) / 34 + t * 2.4) * 16).toFixed(1)} ${y}`;
        const xe = x + Math.sin((540 - y1) / 34 + t * 2.4) * 16;
        out += `<g opacity="${eO}"><path d="${d}" fill="none" stroke="#6fb9ea" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${xe} ${y1 - 30} L ${xe - 24} ${y1 + 4} L ${xe + 24} ${y1 + 4} Z" fill="#6fb9ea"/></g>`;
        for (let j = 0; j < 3; j++) { const f = (t * 0.45 + j / 3 + i * 0.2) % 1; out += `<circle cx="${x + 44 + Math.sin(f * 7 + i) * 10}" cy="${lerp(548, 340, f)}" r="7" fill="#8fcff5" opacity="${eO * Math.sin(Math.PI * f) * prog(t, cue(1) + 1.0, 0.5)}"/>`; }
      });
      out += pop(badge('みずだけ そらへ（じょうはつ）', { fill: C.blueUi, size: 44 }), t, cue(1) + 1.8, 1400, 250, { end: c4 + 0.8 });
    }
    out += pop(badge('しおは うみに のこる', { fill: C.ochre, size: 44 }), t, cue(2) + 0.2, 1500, 796);
    // めぐる水
    out += pop(badge('くもに なって', { fill: '#7f95a6', size: 38 }), t, c4 + 1.0, 1130, 250, { end: c4 + 3.4 });
    out += pop(badge('あめに なって、また かわへ', { fill: C.blueUi, size: 40 }), t, c4 + 3.6, 1000, 300);
    out += topBadge();
    out += kidShow('B', t, 250, 960, { s: 0.56, start: cue(3) - 0.9, n: 0, look: [8, -4] });
    return out;
  },
});

// 8. できたばかりの海 → 今の海。入る塩と つもる塩が だいたい同じ
const BAL_FLOOR = 770, BAL_TOP = 330;
const balPos = i => [540 + rnd(i, 81) * 1320, lerp(BAL_TOP + 44, BAL_FLOOR - 30, rnd(i, 82))];
SCENES.push({
  id: 'balance',
  draw(t) {
    const age = eio(prog(t, cue(1) + 0.3, cueE(1) - cue(1) - 0.6));
    let out = `<linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6f2"/><stop offset="0.3" stop-color="#e6f4fc"/></linearGradient><rect width="1920" height="1080" fill="url(#bsky)"/>`;
    out += `<linearGradient id="bsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix('#8fd0f0', SEA.top, age)}"/><stop offset="0.6" stop-color="${mix('#5fb2de', SEA.deep, age)}"/></linearGradient>`;
    const wave = Array.from({ length: 30 }, (_, i) => `${(250 + i * 1670 / 29).toFixed(0)} ${(BAL_TOP + Math.sin(t * 2 + i * 0.9) * 4).toFixed(1)}`).join(' L ');
    out += `<path d="M ${wave} L 1920 1080 L 250 1080 Z" fill="url(#bsea)"/>`;
    // 左の陸・川・海の底
    out += `<path d="M 0 1080 L 0 196 L 120 236 L 262 ${BAL_TOP} L 340 560 L 500 ${BAL_FLOOR} L 1920 ${BAL_FLOOR} L 1920 1080 Z" fill="${SEA.floor}"/>`;
    out += `<path d="M 0 196 L 120 236 L 262 ${BAL_TOP} L 300 450 L 0 520 Z" fill="${SEA.grass}"/>`;
    out += `<path d="M 0 200 L 120 240 L 262 ${BAL_TOP + 4}" fill="none" stroke="${SEA.river}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M 0 200 L 120 240 L 262 ${BAL_TOP + 4}" fill="none" stroke="#d3eefc" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 44" stroke-dashoffset="${(-t * 110).toFixed(1)}"/>`;
    // 川から入ってくるつぶ
    for (let i = 0; i < 5; i++) {
      const f = (t * 0.22 + i / 5) % 1, P = [[0, 196], [120, 236], [262, BAL_TOP], [420, 430], [640, 470]];
      const [x, y] = along(P, f); out += saltDot(x, y, 8, clamp((1 - f) * 5));
    }
    // 海のつぶ
    const n = lerp(9, 66, age);
    for (let i = 0; i < Math.ceil(n); i++) { const [x, y] = balPos(i); out += saltDot(x, y + Math.sin(t * 1.4 + i) * 4, 8, clamp(n - i)); }
    // 海の底につもる
    const c3 = cue(3), sk = prog(t, c3 + 2.4, 3.0);
    if (sk > 0) {
      out += `<rect x="560" y="${BAL_FLOOR - 16 * sk}" width="1360" height="${16 * sk + 2}" fill="#f4f1e6" opacity="0.95"/>`;
      for (let i = 0; i < 6; i++) { const f = (t * 0.25 + i / 6) % 1; out += saltDot(1150 + i * 78 + Math.sin(f * 6 + i) * 8, lerp(600, BAL_FLOOR - 12, f), 8, clamp(f * 5) * clamp((1 - f) * 6)); }
    }
    // ラベル
    const e1 = cue(2) - 0.3;
    out += pop(badge('できたばかりの うみ', { fill: C.blueUi, size: 48 }), t, 0.5, 960, 130, { end: cue(1) - 0.2 });
    out += pop(text(0, 0, 'すこし しょっぱい くらい', { size: 46, w: 900 }), t, cue(0) + 2.6, 960, 232, { end: cue(1) - 0.2 });
    const tk = eo(prog(t, cue(1) + 0.2, cueE(1) - cue(1) - 0.6)), tO = win(t, cue(1), e1, 0.3);
    if (tO > 0) {
      out += g(text(960, 96, 'ながい ながい じかん', { size: 46, w: 900 }) + arrow(620, 170, lerp(660, 1300, tk), 170, C.ochre, 14), { o: tO });
      out += pop(badge('しょっぱい うみに', { fill: C.blueUi, size: 46 }), t, cueE(1) - 1.6, 960, 252, { end: e1 });
    }
    const qO = win(t, cue(2) + 0.2, cue(4) - 0.3, 0.4);
    out += g(card(1100, 150) + text(0, 2, 'これからも どんどん しょっぱく なる？', { size: 50, w: 900 }), { x: 1090, y: 150, o: qO });
    // 入る塩 と つもる塩
    out += g(arrow(300, 372, 470, 440, '#fff', 16) + arrow(300, 372, 470, 440, C.accent, 10), { o: prog(t, c3 + 0.3, 0.4) });
    out += pop(badge('かわから はいる しお', { fill: C.accent, size: 42 }), t, c3 + 0.5, 760, 450);
    out += g(arrow(1380, 590, 1380, 740, '#fff', 16) + arrow(1380, 590, 1380, 740, C.ochre, 10), { o: prog(t, c3 + 2.4, 0.4) });
    out += pop(badge('うみの そこに つもる しお', { fill: C.ochre, size: 42 }), t, c3 + 2.6, 1380, 540);
    out += pop(badge('だいたい おなじ', { fill: C.redUi, size: 54, pad: 44 }), t, c3 + 4.4, 800, 640);
    // これ以上しょっぱくならない（と考えられている）
    out += pop(badge('もう これいじょう しょっぱく ならない', { fill: C.ink, size: 48, pad: 40 }), t, cue(4) + 0.6, 1090, 130);
    out += g(text(0, 0, 'と かんがえられて いる', { size: 42, w: 900 }), { x: 1090, y: 228, o: prog(t, cue(4) + 2.4, 0.4) });
    out += topBadge();
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
      let a = pop(card(1240, 170) + `<circle cx="-530" cy="0" r="50" fill="${C.accent}"/>` + text(-530, 3, '②', { size: 56, w: 900, fill: '#fff' }) +
        text(-440, 2, OPTS[1][1], { size: 54, w: 900, anchor: 'start' }), t, 0.4, 960, 440);
      const rg = prog(t, 1.2, 0.5);
      a += g(`<circle r="64" fill="none" stroke="${C.red}" stroke-width="10"/>` + text(0, -130, 'せいかい！', { size: 58, w: 900, fill: C.red }), { x: 430, y: 440, o: rg, s: Math.max(back(rg), 0.001) });
      a += chipsRow([['あめが いわを とかす', '#6f629c'], ['かわが うみへ はこぶ', C.accent], ['みずだけ そらへ、しおは のこる', C.blueUi]], t, 960, 660, { start: 2.8, step: 1.6, size: 34, gap: 26 });
      out += g(a, { o: aO });
    }
    const bO = prog(t, cue(1) - 0.3, 0.5);
    if (bO > 0) {
      let b = pop(badge('みてみよう', { fill: C.accent, size: 56, pad: 44 }), t, cue(1) - 0.2, 400, 190);
      const dish = full => `<ellipse cx="0" cy="8" rx="58" ry="22" fill="#fff" stroke="#7fa7bd" stroke-width="6"/>` + (full ? `<ellipse cx="0" cy="6" rx="42" ry="13" fill="#7cc4ea"/>` : [[-22, 4], [-6, 10], [10, 2], [24, 8], [0, 0]].map(([x, y]) => saltDot(x, y, 6)).join(''));
      const mapIc = `<rect x="-50" y="-36" width="100" height="72" rx="8" fill="#e9f3dc" stroke="#7a9a6a" stroke-width="5"/><path d="M 10 -36 L 50 -36 L 50 36 L 26 36 Q 4 0 10 -36 Z" fill="#7cc4ea"/><path d="M -36 -18 Q -16 -4 -4 4 T 22 12" fill="none" stroke="${SEA.river}" stroke-width="7" stroke-linecap="round"/><path d="M -42 -10 l 10 -16 l 10 16 Z" fill="${SEA.rock}"/>`;
      const items = [
        [dish(true), 'おとなと、しおみずを こざらに いれて まどべに おく', C.ink],
        [dish(false), 'みずが なくなったら、なにが のこるかな？', C.ink],
        [mapIc, 'ちずで、やまから うみまで かわを ゆびで たどる', C.ink],
        [warnIcon(0.8), 'しおみずは くちに いれない。ちいさい こに とどかない ところへ', C.red],
        [warnIcon(0.8), 'うみで あそぶ ときも、うみの みずは のまない', C.red],
      ];
      items.forEach(([ic, s, col], i) => {
        b += pop(ic + text(100, 2, s, { size: 42, w: 900, anchor: 'start', fill: col }), t, cue(i + 1), 190, 322 + i * 116);
      });
      // まどべの小皿：水がへって、白いつぶがのこる
      const dk = eio(prog(t, cue(1) + 1.5, cue(3) - cue(1) - 1.5));
      let w = card(420, 250) + `<rect x="-170" y="-100" width="340" height="130" rx="10" fill="#cfe9f8" stroke="#b08a5a" stroke-width="10"/><line x1="0" y1="-100" x2="0" y2="30" stroke="#b08a5a" stroke-width="8"/>` + sunDisc(-90, -40, 26, 0, { glow: 0.5 });
      w += `<rect x="-190" y="30" width="380" height="16" rx="6" fill="#b08a5a"/>`;
      w += `<ellipse cx="70" cy="66" rx="92" ry="26" fill="#fff" stroke="#7fa7bd" stroke-width="6"/>` + (dk < 0.98 ? `<ellipse cx="70" cy="64" rx="${70 * (1 - dk * 0.9)}" ry="${16 * (1 - dk * 0.9)}" fill="#7cc4ea"/>` : '');
      [[36, 60], [58, 70], [82, 58], [104, 68], [70, 62], [48, 66], [92, 72]].forEach(([x, y], i) => { w += saltDot(x, y, 6, clamp(dk * 3 - i * 0.25)); });
      b += pop(w, t, cue(1) + 0.4, 1640, 500);
      b += kidShow('K', t, 1650, 280, { s: 0.6, start: cue(1) + 0.8, n: 0, bubble: false });
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
    out += g(text(0, 0, 'もっと くわしくは サイトの「うみの みずは どうして しょっぱいの？」のページへ ／ 出典は 概要欄に', { size: 29, w: 700, fill: '#d9e6dc' }), { x: 1070, y: 800, o: prog(t, 2.0, 0.5) });
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
