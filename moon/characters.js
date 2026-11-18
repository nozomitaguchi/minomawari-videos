// みのまわり図鑑のキャラクター（オリジナル）
// おねえちゃん（6さいくらい）・おとうと（3さいくらい）・カメレオン
// どれも足もと（0,0）を基準に描く。t は秒（まばたき・ゆれ・口パク用）。

const CH = {
  skin: '#f6d6bd', skinShade: '#ecc0a2', cheek: '#f2a99a', line: '#3a2a22',
  hairG: '#4b3226', hairB: '#3a2a22',
  dress: '#5f9e86', dressDark: '#4f8873', collar: '#fffaf0', clip: '#f6b500',
  shirtB: '#e0715f', shortsB: '#35657f', shoe: '#6b4a3a', sock: '#fffaf0',
  cham: '#7cc04f', chamDark: '#5ea338', chamBelly: '#d6ef9e',
};

// 目：mode = 'open' | 'smile' | 'wide' | 'closed'
function chEyes(cx, cy, gap, t, mode = 'open', look = [0, 0], blinkSeed = 0) {
  const blink = [1.3, 3.9, 6.6, 9.8, 13.1, 16.4].some(b => ((t + blinkSeed) % 18) > b && ((t + blinkSeed) % 18) < b + 0.13);
  const m = blink ? 'closed' : mode;
  let o = '';
  [-1, 1].forEach(sd => {
    const x = cx + sd * gap, y = cy;
    if (m === 'closed') o += `<path d="M ${x - 11} ${y} Q ${x} ${y + 6} ${x + 11} ${y}" fill="none" stroke="${CH.line}" stroke-width="5" stroke-linecap="round"/>`;
    else if (m === 'smile') o += `<path d="M ${x - 12} ${y + 4} Q ${x} ${y - 10} ${x + 12} ${y + 4}" fill="none" stroke="${CH.line}" stroke-width="5.5" stroke-linecap="round"/>`;
    else {
      const r = m === 'wide' ? 13 : 11;
      o += `<ellipse cx="${x + look[0]}" cy="${y + look[1]}" rx="${r * 0.82}" ry="${r * 1.1}" fill="${CH.line}"/>`;
      o += `<circle cx="${x + look[0] + 3}" cy="${y + look[1] - 5}" r="${r * 0.32}" fill="#fff"/>`;
    }
  });
  return o;
}
// 口：mode = 'smile' | 'open' | 'o' | 'flat'、talk>0 で口パク
function chMouth(cx, cy, t, mode = 'smile', talk = 0) {
  if (talk > 0) {
    const k = 0.5 + 0.5 * Math.sin(t * 22) * Math.sin(t * 9.3);
    const h = 4 + 14 * Math.abs(k) * talk;
    return `<ellipse cx="${cx}" cy="${cy + 3}" rx="11" ry="${h / 2 + 2}" fill="#8e3b33"/>`;
  }
  if (mode === 'open') return `<path d="M ${cx - 15} ${cy - 2} Q ${cx} ${cy + 22} ${cx + 15} ${cy - 2} Z" fill="#8e3b33"/><path d="M ${cx - 7} ${cy + 9} Q ${cx} ${cy + 4} ${cx + 7} ${cy + 9}" fill="#e88a7c"/>`;
  if (mode === 'o') return `<ellipse cx="${cx}" cy="${cy + 4}" rx="8" ry="10" fill="#8e3b33"/>`;
  if (mode === 'flat') return `<path d="M ${cx - 8} ${cy + 3} L ${cx + 8} ${cy + 3}" stroke="${CH.line}" stroke-width="5" stroke-linecap="round"/>`;
  return `<path d="M ${cx - 12} ${cy} Q ${cx} ${cy + 12} ${cx + 12} ${cy}" fill="none" stroke="${CH.line}" stroke-width="5" stroke-linecap="round"/>`;
}

// おねえちゃん：pose = 'stand' | 'point' | 'think' | 'wave' | 'cheer'
function sister(t, { pose = 'stand', eyes = 'open', mouth = 'smile', talk = 0, look = [0, 0], hop = 0 } = {}) {
  const bob = Math.sin(t * 2.2) * 3 - hop;
  const armL = { stand: 18, point: 18, think: 18, wave: 18, cheer: 150 }[pose];
  const armR = { stand: -18, point: -112, think: -140, wave: -150 + Math.sin(t * 9) * 18, cheer: -150 }[pose];
  const arm = (x, y, ang, hand = true) => `<g transform="translate(${x} ${y}) rotate(${ang})">
      <rect x="-13" y="-6" width="26" height="92" rx="13" fill="${CH.skin}"/>
      <rect x="-15" y="-10" width="30" height="34" rx="14" fill="${CH.collar}"/>
      ${hand ? `<circle cx="0" cy="88" r="15" fill="${CH.skin}"/>` : ''}</g>`;
  return `<g transform="translate(0 ${bob})">
    <!-- 足 -->
    <rect x="-34" y="-112" width="24" height="96" rx="11" fill="${CH.skin}"/>
    <rect x="10" y="-112" width="24" height="96" rx="11" fill="${CH.skin}"/>
    <rect x="-36" y="-52" width="28" height="36" rx="8" fill="${CH.sock}"/>
    <rect x="8" y="-52" width="28" height="36" rx="8" fill="${CH.sock}"/>
    <path d="M -42 -20 Q -42 -2 -24 -2 L -6 -2 Q -4 -16 -10 -22 Z" fill="${CH.shoe}"/>
    <path d="M 42 -20 Q 42 -2 24 -2 L 6 -2 Q 4 -16 10 -22 Z" fill="${CH.shoe}"/>
    <!-- 腕（うしろ） -->
    ${arm(-44, -248, armL)}
    <!-- ワンピース -->
    <path d="M -46 -262 Q 0 -276 46 -262 L 86 -104 Q 0 -86 -86 -104 Z" fill="${CH.dress}"/>
    <path d="M -86 -104 Q 0 -86 86 -104 L 84 -112 Q 0 -96 -84 -112 Z" fill="${CH.dressDark}"/>
    <circle cx="-34" cy="-150" r="6" fill="${CH.dressDark}"/><circle cx="20" cy="-130" r="6" fill="${CH.dressDark}"/><circle cx="44" cy="-176" r="6" fill="${CH.dressDark}"/>
    <path d="M -34 -264 Q -18 -244 0 -258 Q 18 -244 34 -264 Q 0 -278 -34 -264 Z" fill="${CH.collar}"/>
    <!-- 腕（まえ） -->
    ${arm(44, -248, armR)}
    <!-- 頭 -->
    <g transform="translate(0 -360)">
      ${(() => { const sw = Math.sin(t * 2.4) * 6; return `<path d="M 50 -96 Q 120 -112 ${146 + sw} -50 Q ${158 + sw} 10 ${130 + sw * 1.5} 70 Q ${136 + sw} 10 ${112} -36 Q 96 -70 56 -66 Z" fill="${CH.hairG}"/>
        <path d="M ${128 + sw} -40 Q ${140 + sw} 0 ${126 + sw * 1.3} 44" fill="none" stroke="#5e4234" stroke-width="4" stroke-linecap="round"/>`; })()}
      <circle cx="0" cy="0" r="92" fill="${CH.skin}"/>
      <path d="M -93 -2 Q -98 -98 0 -100 Q 98 -98 93 -2 Q 88 -40 64 -56 Q 30 -70 0 -68 Q -30 -70 -64 -56 Q -88 -40 -93 -2 Z" fill="${CH.hairG}"/>
      <path d="M -40 -90 Q -10 -80 0 -68 M 30 -92 Q 8 -80 2 -68" fill="none" stroke="#5e4234" stroke-width="4" stroke-linecap="round"/>
      <path d="M -84 -26 Q -94 10 -84 42" fill="none" stroke="${CH.hairG}" stroke-width="6" stroke-linecap="round"/>
      <path d="M 84 -26 Q 94 8 86 38" fill="none" stroke="${CH.hairG}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="74" cy="-84" rx="13" ry="19" fill="${CH.clip}" transform="rotate(40 74 -84)"/>
      <circle cx="-56" cy="30" r="14" fill="${CH.cheek}" opacity="0.7"/>
      <circle cx="56" cy="30" r="14" fill="${CH.cheek}" opacity="0.7"/>
      ${chEyes(0, 4, 34, t, eyes, look, 0)}
      ${chMouth(0, 40, t, mouth, talk)}
    </g>
  </g>`;
}

// おとうと：pose = 'stand' | 'point' | 'jump' | 'cheer'
function brother(t, { pose = 'stand', eyes = 'open', mouth = 'smile', talk = 0, look = [0, 0], hop = 0 } = {}) {
  const bob = Math.sin(t * 2.6 + 1) * 3 - hop;
  const armL = { stand: 20, point: 20, jump: 140, cheer: 150 }[pose];
  const armR = { stand: -20, point: -118, jump: -140, cheer: -150 }[pose];
  const arm = (x, y, ang) => `<g transform="translate(${x} ${y}) rotate(${ang})">
      <rect x="-12" y="-4" width="24" height="70" rx="12" fill="${CH.skin}"/>
      <rect x="-15" y="-10" width="30" height="34" rx="14" fill="${CH.shirtB}"/>
      <circle cx="0" cy="66" r="14" fill="${CH.skin}"/></g>`;
  return `<g transform="translate(0 ${bob})">
    <rect x="-30" y="-84" width="24" height="72" rx="11" fill="${CH.skin}"/>
    <rect x="6" y="-84" width="24" height="72" rx="11" fill="${CH.skin}"/>
    <path d="M -38 -18 Q -38 -2 -20 -2 L -4 -2 Q -2 -14 -8 -20 Z" fill="${CH.shoe}"/>
    <path d="M 38 -18 Q 38 -2 20 -2 L 4 -2 Q 2 -14 8 -20 Z" fill="${CH.shoe}"/>
    ${arm(-40, -190, armL)}
    <rect x="-44" y="-124" width="88" height="54" rx="16" fill="${CH.shortsB}"/>
    <rect x="-48" y="-200" width="96" height="92" rx="34" fill="${CH.shirtB}"/>
    <path d="M -16 -168 l 8 -10 l 8 10 l 8 -10 l 8 10" fill="none" stroke="#fff3df" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${arm(40, -190, armR)}
    <g transform="translate(0 -282)">
      <circle cx="0" cy="0" r="88" fill="${CH.skin}"/>
      <path d="M -90 4 Q -100 -60 -60 -88 Q -40 -104 -10 -100 Q 10 -108 34 -98 Q 70 -96 88 -60 Q 100 -30 90 4 L 84 -14 Q 78 -26 66 -22 L 58 -32 L 44 -22 L 32 -34 L 18 -22 L 4 -34 L -10 -22 L -24 -34 L -38 -22 L -52 -32 L -64 -22 Q -78 -26 -84 -14 Z" fill="${CH.hairB}"/>
      <path d="M -40 -92 Q -36 -108 -22 -104 M 20 -102 Q 30 -114 40 -100" fill="none" stroke="${CH.hairB}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="-88" cy="8" r="16" fill="${CH.skin}"/><circle cx="88" cy="8" r="16" fill="${CH.skin}"/>
      <circle cx="-52" cy="30" r="14" fill="${CH.cheek}" opacity="0.75"/>
      <circle cx="52" cy="30" r="14" fill="${CH.cheek}" opacity="0.75"/>
      ${chEyes(0, 6, 32, t, eyes, look, 4.2)}
      ${chMouth(0, 40, t, mouth, talk)}
    </g>
  </g>`;
}

// カメレオン：横向き。左右の目を別々に動かせる（eyeL=手前の目, eyeR=奥の目 の角度）。color で体の色が変わる。
function chameleon(t, { color = CH.cham, eyeL = null, eyeR = null, mouth = 'smile', talk = 0, holdLens = false } = {}) {
  const dark = typeof mix === 'function' ? mix(color, '#24461a', 0.3) : CH.chamDark;
  const light = typeof mix === 'function' ? mix(color, '#ffffff', 0.45) : CH.chamBelly;
  const aN = eyeL ?? (Math.sin(t * 1.3) * 45), aF = eyeR ?? (Math.sin(t * 0.8 + 2) * 70 - 40);
  const bob = Math.sin(t * 2) * 3;
  // しっぽ（うずまき）
  const cx = -122, cy = -60, pts = [];
  for (let i = 0; i <= 40; i++) { const k = i / 40, a = -Math.PI / 4 - k * Math.PI * 2.1, r = 54 - 40 * k; pts.push(`${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`); }
  const leg = (x, back) => `<path d="M ${x} -66 Q ${x - 14} -36 ${x + 4} -12" fill="none" stroke="${back ? dark : color}" stroke-width="17" stroke-linecap="round"/>
    <ellipse cx="${x + 8}" cy="-8" rx="15" ry="9" fill="${back ? dark : color}"/>`;
  const turret = (x, y, r, ang) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${color}"/>
    <circle r="${r - 3}" fill="none" stroke="${dark}" stroke-width="3" stroke-dasharray="5 6" opacity="0.7"/>
    <g transform="rotate(${ang})"><circle cx="${r * 0.45}" cy="0" r="${r * 0.52}" fill="#fff"/><circle cx="${r * 0.62}" cy="0" r="${r * 0.32}" fill="${CH.line}"/><circle cx="${r * 0.7}" cy="${-r * 0.12}" r="${r * 0.1}" fill="#fff"/></g></g>`;
  return `<g transform="translate(0 ${bob})">
    <path d="M -78 -96 L ${pts.join(' L ')}" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    ${leg(-50, true)}${leg(34, true)}
    <path d="M -88 -92 C -88 -150 36 -170 76 -122 C 98 -94 84 -58 42 -54 L -52 -54 C -78 -56 -88 -72 -88 -92 Z" fill="${color}"/>
    <path d="M -76 -66 C -40 -50 30 -50 70 -66 C 60 -56 44 -52 30 -52 L -52 -52 C -64 -54 -72 -58 -76 -66 Z" fill="${light}"/>
    <path d="M -50 -136 l 12 -12 l 8 12 l 12 -14 l 8 14 l 12 -14 l 8 14" fill="none" stroke="${dark}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
    ${[[-46, -104], [-14, -116], [18, -102], [-26, -80], [40, -88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${dark}" opacity="0.35"/>`).join('')}
    ${leg(-36, false)}${leg(50, false)}
    <g transform="translate(86 -112)">
      ${turret(46, -54, 16, aF)}
      <path d="M -30 -4 C -26 -48 30 -62 62 -34 L 92 -8 C 98 6 88 20 66 24 L -6 26 C -26 24 -32 10 -30 -4 Z" fill="${color}"/>
      <path d="M -22 -30 Q 4 -80 46 -46 Q 10 -50 -22 -30 Z" fill="${color}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/>
      ${talk > 0 ? `<ellipse cx="62" cy="14" rx="18" ry="${4 + 7 * Math.abs(Math.sin(t * 20)) * talk}" fill="#7a2f28"/>`
        : mouth === 'open' ? `<path d="M 30 10 Q 62 34 90 4 Q 60 16 30 10 Z" fill="#7a2f28"/>`
        : `<path d="M 30 12 Q 60 24 88 4" fill="none" stroke="${CH.line}" stroke-width="5" stroke-linecap="round"/>`}
      <circle cx="84" cy="-10" r="3" fill="${dark}"/>
      <circle cx="44" cy="16" r="9" fill="${CH.cheek}" opacity="0.55"/>
      ${turret(14, -6, 27, aN)}
    </g>
    ${holdLens ? `<g transform="translate(222 -150) rotate(-20)">
      <rect x="-8" y="10" width="16" height="70" rx="8" fill="#9a7438"/>
      <circle cx="0" cy="-26" r="40" fill="#e7f3f6" fill-opacity="0.85" stroke="#35657f" stroke-width="10"/>
      <path d="M -22 -44 A 28 28 0 0 1 2 -56" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>
      <path d="M 64 -70 Q 120 -66 190 -84" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/><circle cx="196" cy="-86" r="12" fill="${color}"/>` : ''}
  </g>`;
}
