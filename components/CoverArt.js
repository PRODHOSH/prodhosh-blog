// Default artwork for posts without a cover image. Flat Bauhaus-style compositions
// in the site palette, picked deterministically from the slug so a post always
// keeps the same cover.
const C = { orange: "#ff5400", ink: "#0b0b0b", cream: "#fdf8f5", peach: "#fcae88", pink: "#f9e2e1" };

const designs = [
  // 0 — orange field, cream disc with ink core
  () => (
    <>
      <rect width="640" height="360" fill={C.orange} />
      <circle cx="450" cy="180" r="128" fill={C.cream} />
      <circle cx="450" cy="180" r="52" fill={C.ink} />
      <rect x="56" y="236" width="188" height="14" fill={C.ink} />
      <rect x="56" y="268" width="112" height="14" fill={C.ink} />
    </>
  ),
  // 1 — peach field, ink quarter circle, orange sun
  () => (
    <>
      <rect width="640" height="360" fill={C.peach} />
      <path d="M0 360 V110 A250 250 0 0 1 250 360 Z" fill={C.ink} />
      <circle cx="486" cy="116" r="68" fill={C.orange} />
      <rect x="366" y="236" width="200" height="56" rx="28" fill={C.cream} />
    </>
  ),
  // 2 — ink field, orange half disc
  () => (
    <>
      <rect width="640" height="360" fill={C.ink} />
      <path d="M110 360 A210 210 0 0 1 530 360 Z" fill={C.orange} />
      <circle cx="320" cy="108" r="38" fill={C.peach} />
      <rect x="48" y="48" width="96" height="12" fill={C.cream} />
      <rect x="48" y="76" width="56" height="12" fill={C.cream} />
    </>
  ),
  // 3 — pink field, three bars and a cream disc
  () => (
    <>
      <rect width="640" height="360" fill={C.pink} />
      <circle cx="190" cy="190" r="104" fill={C.cream} />
      <circle cx="190" cy="190" r="34" fill={C.orange} />
      <rect x="380" y="70" width="52" height="290" fill={C.orange} />
      <rect x="452" y="140" width="52" height="220" fill={C.ink} />
      <rect x="524" y="210" width="52" height="150" fill={C.peach} />
    </>
  ),
  // 4 — cream field, orange ring, peach ground
  () => (
    <>
      <rect width="640" height="360" fill={C.cream} />
      <rect y="268" width="640" height="92" fill={C.peach} />
      <circle cx="320" cy="168" r="104" fill="none" stroke={C.orange} strokeWidth="38" />
      <circle cx="532" cy="86" r="26" fill={C.ink} />
      <rect x="64" y="64" width="12" height="12" fill={C.ink} />
      <rect x="92" y="64" width="12" height="12" fill={C.ink} />
      <rect x="120" y="64" width="12" height="12" fill={C.ink} />
    </>
  ),
  // 5 — orange field, ink slab, cream disc straddling the edge
  () => (
    <>
      <rect width="640" height="360" fill={C.orange} />
      <rect width="230" height="360" fill={C.ink} />
      <circle cx="230" cy="180" r="92" fill={C.cream} />
      <circle cx="504" cy="262" r="52" fill={C.peach} />
      <rect x="400" y="60" width="160" height="14" fill={C.ink} />
    </>
  ),
];

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export default function CoverArt({ seed }) {
  const Design = designs[hash(seed) % designs.length];
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%", display: "block" }}>
      <Design />
    </svg>
  );
}
