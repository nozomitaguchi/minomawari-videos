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
