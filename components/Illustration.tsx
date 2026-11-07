import type { IllustrationKey } from "@/lib/services-data";

/**
 * Original illustrations in the OptiFlow palette. Inline SVG: no image downloads, sharp at any size,
 * identical styling across the site. Each one shows the specific thing its page is about.
 */
const N = "#1b3a63", T = "#22b5c4", M = "#e4ecf1", L = "#d5dde4", W = "#ffffff";

const Bar = ({ x, y, w, c = L, h = 8 }: { x: number; y: number; w: number; c?: string; h?: number }) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={c} />;
const Win = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="14" fill={W} stroke={L} strokeWidth="2" />
    {[16, 30, 44].map((d) => <circle key={d} cx={x + d} cy={y + 16} r="4" fill={L} />)}
  </g>
);
const Check = ({ cx, cy, r = 12, c = T }: { cx: number; cy: number; r?: number; c?: string }) => (
  <g><circle cx={cx} cy={cy} r={r} fill={c} /><path d={`M${cx - r * 0.45} ${cy} l${r * 0.3} ${r * 0.32} l${r * 0.6} ${-r * 0.65}`} stroke={W} strokeWidth={r * 0.22} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
);
const Arrow = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  const p = (t: number) => `${x2 - s * Math.cos(a + t)},${y2 - s * Math.sin(a + t)}`;
  return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={N} strokeWidth="3" strokeLinecap="round" /><polygon points={`${x2},${y2} ${p(0.5)} ${p(-0.5)}`} fill={N} /></g>;
};
const Person = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <g><circle cx={x} cy={y} r="22" fill={c} /><path d={`M${x - 38} ${y + 78} q0 -46 38 -46 q38 0 38 46 z`} fill={c} /></g>
);

function Scene({ k }: { k: IllustrationKey }) {
  switch (k) {
    case "operations":
      return (<>
        <rect x="36" y="70" width="100" height="52" rx="10" fill={N} /><Bar x={52} y={90} w={68} c={W} /><Bar x={52} y={104} w={40} c={T} h={6} />
        <rect x="186" y="70" width="100" height="52" rx="10" fill={W} stroke={N} strokeWidth="3" /><Bar x={202} y={90} w={68} c={L} /><Bar x={202} y={104} w={44} c={L} h={6} />
        <path d="M372 54 L414 96 L372 138 L330 96 Z" fill={W} stroke={T} strokeWidth="4" strokeLinejoin="round" />
        <rect x="470" y="70" width="110" height="52" rx="10" fill={W} stroke={N} strokeWidth="3" /><Bar x={486} y={90} w={78} c={L} /><Bar x={486} y={104} w={50} c={L} h={6} />
        <Arrow x1={136} y1={96} x2={184} y2={96} /><Arrow x1={286} y1={96} x2={328} y2={96} /><Arrow x1={414} y1={96} x2={468} y2={96} /><Arrow x1={372} y1={138} x2={372} y2={188} />
        <rect x="320" y="190" width="104" height="52" rx="10" fill={W} stroke={N} strokeWidth="3" /><Bar x={336} y={210} w={72} c={L} /><Bar x={336} y={224} w={40} c={L} h={6} />
        <rect x="170" y="190" width="100" height="52" rx="10" fill={W} stroke={N} strokeWidth="3" /><Bar x={186} y={210} w={68} c={L} /><Bar x={186} y={224} w={36} c={L} h={6} />
        <rect x="36" y="190" width="100" height="52" rx="10" fill={T} /><Bar x={52} y={210} w={68} c={W} /><Bar x={52} y={224} w={36} c={N} h={6} />
        <Arrow x1={320} y1={216} x2={272} y2={216} /><Arrow x1={170} y1={216} x2={138} y2={216} />
        <rect x="36" y="270" width="544" height="118" rx="14" fill={W} stroke={L} strokeWidth="2" />
        {[0, 1, 2].map((i) => (<g key={i}><Check cx={66} cy={298 + i * 32} r={11} /><Bar x={90} y={294 + i * 32} w={250 - i * 30} c={L} /><rect x="470" y={288 + i * 32} width="84" height="20" rx="10" fill={M} /></g>))}
      </>);
    case "automation":
      return (<>
        {[[112, 92], [528, 92], [112, 328], [528, 328]].map(([x, y], i) => (<line key={i} x1="320" y1="210" x2={x} y2={y} stroke={T} strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />))}
        <circle cx="320" cy="210" r="62" fill={N} /><circle cx="320" cy="210" r="40" fill="none" stroke={T} strokeWidth="8" /><circle cx="320" cy="210" r="14" fill={W} />
        {[0, 60, 120, 180, 240, 300].map((a) => (<rect key={a} x="314" y="142" width="12" height="16" rx="3" fill={T} transform={`rotate(${a} 320 210)`} />))}
        <rect x="70" y="50" width="84" height="84" rx="16" fill={W} stroke={L} strokeWidth="2" /><rect x="86" y="76" width="52" height="34" rx="5" fill="none" stroke={N} strokeWidth="4" /><polyline points="86,80 112,98 138,80" fill="none" stroke={N} strokeWidth="4" strokeLinejoin="round" />
        <rect x="486" y="50" width="84" height="84" rx="16" fill={W} stroke={L} strokeWidth="2" /><rect x="502" y="68" width="52" height="48" rx="5" fill="none" stroke={N} strokeWidth="4" /><path d="M502 84h52M502 100h52M522 68v48" stroke={T} strokeWidth="4" />
        <rect x="70" y="286" width="84" height="84" rx="16" fill={W} stroke={L} strokeWidth="2" /><path d="M112 302 q-20 0 -20 20 v14 h-8 v8 h56 v-8 h-8 v-14 q0 -20 -20 -20z" fill={N} /><circle cx="112" cy="356" r="6" fill={T} />
        <rect x="486" y="286" width="84" height="84" rx="16" fill={W} stroke={L} strokeWidth="2" /><rect x="502" y="304" width="52" height="46" rx="6" fill="none" stroke={N} strokeWidth="4" /><rect x="502" y="304" width="52" height="14" fill={N} /><Check cx={528} cy={336} r={9} />
      </>);
    case "dashboards":
      return (<>
        <Win x={36} y={36} w={568} h={348} />
        {[56, 238, 420].map((x, i) => (<g key={x}><rect x={x} y="72" width="164" height="76" rx="10" fill={M} /><Bar x={x + 14} y={88} w={60} c={L} h={7} /><rect x={x + 14} y={108} width={[88, 70, 104][i]} height="22" rx="6" fill={i === 1 ? T : N} /></g>))}
        <rect x="56" y="164" width="270" height="200" rx="10" fill={M} />
        {[70, 110, 90, 140, 120, 160].map((h, i) => (<rect key={i} x={76 + i * 40} y={344 - h} width="26" height={h} rx="5" fill={i % 2 ? T : N} />))}
        <rect x="344" y="164" width="240" height="106" rx="10" fill={M} />
        <polyline points="360,250 400,226 440,236 490,198 540,208 570,182" fill="none" stroke={T} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="344" y="282" width="240" height="82" rx="10" fill={M} />
        <circle cx="398" cy="323" r="26" fill="none" stroke={L} strokeWidth="14" /><circle cx="398" cy="323" r="26" fill="none" stroke={N} strokeWidth="14" strokeDasharray="100 164" transform="rotate(-90 398 323)" /><circle cx="398" cy="323" r="26" fill="none" stroke={T} strokeWidth="14" strokeDasharray="42 164" strokeDashoffset="-100" transform="rotate(-90 398 323)" />
        <Bar x={446} y={304} w={100} c={L} /><Bar x={446} y={324} w={78} c={L} /><Bar x={446} y={344} w={90} c={L} />
      </>);
    case "projects":
      return (<>
        <Win x={36} y={36} w={568} h={348} />
        {[56, 240, 424].map((x, c) => (<g key={x}>
          <rect x={x} y="68" width="160" height="280" rx="10" fill={M} /><Bar x={x + 12} y={82} w={64} c={c === 2 ? T : N} h={9} />
          {Array.from({ length: c === 0 ? 3 : 2 }).map((_, i) => (<g key={i}>
            <rect x={x + 10} y={106 + i * 78} width="140" height="66" rx="8" fill={W} stroke={L} strokeWidth="2" />
            {c === 1 && i === 0 && <rect x={x + 10} y={106} width="6" height="66" rx="3" fill={T} />}
            <Bar x={x + 24} y={120 + i * 78} w={90 - i * 12} c={L} /><Bar x={x + 24} y={136 + i * 78} w={60} c={L} h={6} />
            <circle cx={x + 132} cy={152 + i * 78} r="8" fill={[N, T, N][(i + c) % 3]} />
            {c === 2 && <Check cx={x + 128} cy={124 + i * 78} r={8} />}
          </g>))}
        </g>))}
        <rect x="56" y="358" width="528" height="10" rx="5" fill={L} /><rect x="56" y="358" width="330" height="10" rx="5" fill={T} />
      </>);
    case "email":
      return (<>
        <Win x={36} y={36} w={400} h={348} />
        {[0, 1, 2, 3].map((i) => (<g key={i}>
          <rect x="52" y={72 + i * 76} width="368" height="64" rx="10" fill={i === 0 ? M : W} stroke={L} strokeWidth="2" />
          <circle cx="86" cy={104 + i * 76} r="18" fill={[N, T, N, T][i]} /><Bar x={118} y={92 + i * 76} w={150} c={N} h={9} /><Bar x={118} y={112 + i * 76} w={230 - i * 24} c={L} h={7} />
          {i === 0 && <circle cx="396" cy="104" r="6" fill={T} />}
        </g>))}
        <rect x="462" y="110" width="150" height="104" rx="12" fill={W} stroke={N} strokeWidth="6" /><polyline points="466,118 537,174 608,118" fill="none" stroke={N} strokeWidth="6" strokeLinejoin="round" />
        <circle cx="596" cy="214" r="26" fill={T} /><path d="M584 214 l8 9 l16 -18" stroke={W} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="452" y="262" width="168" height="40" rx="20" fill={W} stroke={L} strokeWidth="2" /><text x="536" y="288" textAnchor="middle" fontSize="19" fontWeight="700" fill={N} fontFamily="ui-sans-serif,system-ui,sans-serif">you@company</text>
      </>);
    case "website":
      return (<>
        <Win x={36} y={44} w={384} h={308} />
        <Bar x={56} y={78} w={70} c={N} h={10} /><Bar x={250} y={80} w={30} c={L} h={7} /><Bar x={292} y={80} w={30} c={L} h={7} /><Bar x={334} y={80} w={30} c={L} h={7} /><rect x="372" y="74" width="32" height="18" rx="9" fill={T} />
        <rect x="56" y="106" width="344" height="110" rx="10" fill={N} /><Bar x={76} y={132} w={170} c={W} h={12} /><Bar x={76} y={154} w={120} c={T} h={8} /><rect x="76" y="176" width="86" height="24" rx="12" fill={T} />
        {[56, 176, 296].map((x) => (<g key={x}><rect x={x} y="230" width="104" height="96" rx="10" fill={M} /><circle cx={x + 24} cy={254} r="10" fill={T} /><Bar x={x + 12} y={276} w={70} c={L} /><Bar x={x + 12} y={292} w={50} c={L} h={6} /></g>))}
        <rect x="462" y="80" width="130" height="270" rx="24" fill={W} stroke={N} strokeWidth="6" /><rect x="506" y="90" width="42" height="7" rx="3.5" fill={N} />
        <rect x="476" y="112" width="102" height="62" rx="8" fill={N} /><Bar x={486} y={128} w={60} c={W} /><Bar x={486} y={144} w={40} c={T} h={6} />
        <rect x="476" y="184" width="102" height="34" rx="8" fill={M} /><rect x="476" y="226" width="102" height="34" rx="8" fill={M} />
        <rect x="476" y="300" width="102" height="34" rx="17" fill={T} /><circle cx="496" cy="317" r="8" fill={W} />
      </>);
    case "about":
      return (<>
        <rect x="52" y="52" width="536" height="316" rx="16" fill={W} stroke={L} strokeWidth="2" />
        <Person x={150} y={118} c={N} /><Person x={320} y={118} c={T} /><Person x={490} y={118} c={N} />
        <path d="M80 280 C 170 230, 240 330, 320 280 S 450 240, 500 276" fill="none" stroke={T} strokeWidth="8" strokeLinecap="round" />
        <path d="M80 308 C 170 258, 240 358, 320 308 S 450 268, 500 304" fill="none" stroke={N} strokeWidth="8" strokeLinecap="round" opacity=".85" />
        {[150, 320, 490].map((x) => (<circle key={x} cx={x} cy={226} r="9" fill={W} stroke={N} strokeWidth="4" />))}
        <Check cx={546} cy={288} r={24} />
      </>);
    case "contact":
      return (<>
        <path d="M70 110 q0 -30 30 -30 h200 q30 0 30 30 v90 q0 30 -30 30 h-130 l-50 40 v-40 q-50 0 -50 -30z" fill={T} />
        {[130, 200, 270].map((x) => (<circle key={x} cx={x} cy={155} r="12" fill={W} />))}
        <path d="M330 240 q0 -24 24 -24 h170 q24 0 24 24 v60 q0 24 -24 24 h-20 v32 l-44 -32 h-106 q-24 0 -24 -24z" fill={W} stroke={N} strokeWidth="5" strokeLinejoin="round" />
        <Bar x={356} y={246} w={130} c={N} h={9} /><Bar x={356} y={270} w={100} c={L} h={8} /><Bar x={356} y={290} w={118} c={L} h={8} />
        <rect x="420" y="56" width="160" height="108" rx="14" fill={W} stroke={N} strokeWidth="6" /><polyline points="424,66 500,126 576,66" fill="none" stroke={N} strokeWidth="6" strokeLinejoin="round" />
        <Check cx={566} cy={162} r={22} />
      </>);
    case "pro":
      return (<>
        <Win x={36} y={44} w={376} h={304} />
        <Bar x={56} y={78} w={64} c={N} h={10} /><Bar x={260} y={80} w={30} c={L} h={7} /><Bar x={302} y={80} w={30} c={L} h={7} /><rect x="346" y="74" width="48" height="18" rx="9" fill={T} />
        <rect x="56" y="106" width="336" height="96" rx="10" fill={N} /><Bar x={76} y={128} w={150} c={W} h={12} /><Bar x={76} y={150} w={110} c={T} h={8} /><rect x="76" y="168" width="80" height="22" rx="11" fill={T} />
        {[56, 170, 284].map((x) => (<g key={x}><rect x={x} y="218" width="108" height="112" rx="10" fill={M} /><circle cx={x + 24} cy={242} r="10" fill={T} /><Bar x={x + 12} y={266} w={72} c={L} /><Bar x={x + 12} y={282} w={50} c={L} h={6} /></g>))}
        <rect x="440" y="60" width="164" height="110" rx="12" fill={W} stroke={N} strokeWidth="6" /><polyline points="444,68 522,128 600,68" fill="none" stroke={N} strokeWidth="6" strokeLinejoin="round" />
        <Check cx={592} cy={170} r={22} />
        <rect x="430" y="214" width="176" height="42" rx="21" fill={W} stroke={L} strokeWidth="2" /><text x="518" y="241" textAnchor="middle" fontSize="18" fontWeight="700" fill={N} fontFamily="ui-sans-serif,system-ui,sans-serif">yourcompany.com</text>
        <rect x="450" y="282" width="136" height="66" rx="12" fill={W} stroke={L} strokeWidth="2" /><rect x="450" y="282" width="136" height="20" rx="12" fill={N} /><Check cx={518} cy={326} r={11} />
      </>);
    case "portfolio":
      return (<>
        {[0, 1, 2].map((i) => {
          const x = 36 + i * 194;
          return (<g key={i}>
            <rect x={x} y="70" width="174" height="280" rx="14" fill={W} stroke={L} strokeWidth="2" />
            <rect x={x + 12} y="82" width="150" height="120" rx="8" fill={M} />
            {i === 0 && <g><rect x={x + 40} y="94" width="94" height="96" rx="4" fill={W} stroke={L} strokeWidth="2" /><Bar x={x + 52} y={110} w={60} c={N} h={7} />{[0, 1, 2, 3].map((r) => <Bar key={r} x={x + 52} y={128 + r * 14} w={70 - r * 8} c={L} h={6} />)}<Check cx={x + 118} cy={176} r={9} /></g>}
            {i === 1 && <g>{[40, 70, 52, 88].map((h, b) => <rect key={b} x={x + 30 + b * 32} y={186 - h} width="20" height={h} rx="4" fill={b % 2 ? T : N} />)}</g>}
            {i === 2 && <g>{[0, 1, 2].map((c) => (<g key={c}><rect x={x + 24 + c * 46} y="96" width="38" height="92" rx="5" fill={W} /><rect x={x + 28 + c * 46} y="104" width="30" height="16" rx="3" fill={c === 2 ? T : N} /><rect x={x + 28 + c * 46} y="126" width="30" height="16" rx="3" fill={L} /></g>))}</g>}
            <Bar x={x + 14} y={218} w={110} c={N} h={10} /><Bar x={x + 14} y={238} w={140} c={L} /><Bar x={x + 14} y={254} w={100} c={L} />
            <rect x={x + 14} y="298" width="86" height="28" rx="14" fill={T} /><text x={x + 57} y="317" textAnchor="middle" fontSize="14" fontWeight="700" fill={W} fontFamily="ui-sans-serif,system-ui,sans-serif">DEMO</text>
          </g>);
        })}
      </>);
    case "faq":
      return (<>
        <path d="M60 90 q0 -34 34 -34 h190 q34 0 34 34 v90 q0 34 -34 34 h-110 l-50 40 v-40 q-64 0 -64 -34z" fill={T} />
        <text x="190" y="170" textAnchor="middle" fontSize="110" fontWeight="800" fill={W} fontFamily="ui-sans-serif,system-ui,sans-serif">?</text>
        <path d="M330 230 q0 -28 28 -28 h190 q28 0 28 28 v70 q0 28 -28 28 h-20 v34 l-48 -34 h-122 q-28 0 -28 -28z" fill={W} stroke={N} strokeWidth="5" strokeLinejoin="round" />
        <Bar x={360} y={236} w={150} c={N} h={9} /><Bar x={360} y={260} w={170} c={L} h={8} /><Bar x={360} y={280} w={120} c={L} h={8} /><Check cx={536} cy={318} r={14} />
      </>);
    case "legal":
      return (<>
        <rect x="150" y="50" width="250" height="320" rx="14" fill={W} stroke={L} strokeWidth="2" transform="rotate(-6 275 210)" />
        <rect x="220" y="44" width="250" height="320" rx="14" fill={W} stroke={N} strokeWidth="4" />
        <Bar x={246} y={80} w={120} c={N} h={12} />
        {[0, 1, 2, 3, 4, 5].map((r) => <Bar key={r} x={246} y={116 + r * 24} w={198 - (r % 3) * 30} c={L} h={8} />)}
        <path d="M400 262 l46 16 v38 q0 36 -46 56 q-46 -20 -46 -56 v-38z" fill={T} /><path d="M382 318 l14 15 l26 -30" stroke={W} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>);
    case "thanks":
      return (<>
        {[[110, 90, 10, T], [520, 110, 8, N], [90, 300, 8, N], [540, 300, 12, T], [180, 60, 6, N], [470, 70, 6, T], [330, 372, 8, T]].map(([x, y, r, c], i) => <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} />)}
        <circle cx="320" cy="190" r="96" fill={T} /><path d="M270 192 l38 40 l74 -82" stroke={W} strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="236" y="318" width="168" height="42" rx="21" fill={W} stroke={L} strokeWidth="2" /><Bar x={262} y={334} w={116} c={N} h={10} />
      </>);
    case "opspilot":
      return (<>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 52 + (i % 3) * 184, y = 62 + Math.floor(i / 3) * 160;
          return (<g key={i}>
            <rect x={x} y={y} width="164" height="140" rx="16" fill={W} stroke={T} strokeWidth="3" strokeDasharray="9 8" />
            {i === 0 && <path d={`M${x + 52} ${y + 40} h60 l-22 30 v28 l-16 -10 v-18z`} fill={N} />}
            {i === 1 && <g><rect x={x + 50} y={y + 40} width="64" height="62" rx="8" fill="none" stroke={N} strokeWidth="5" /><Check cx={x + 70} cy={y + 62} r={8} /><Bar x={x + 84} y={y + 58} w={20} c={L} h={6} /><Check cx={x + 70} cy={y + 84} r={8} /><Bar x={x + 84} y={y + 80} w={20} c={L} h={6} /></g>}
            {i === 2 && [0, 1, 2, 3].map((b) => <rect key={b} x={x + 48 + b * 18} y={y + 100 - (b + 1) * 16} width="12" height={(b + 1) * 16} rx="3" fill={b === 3 ? T : N} />)}
            {i === 3 && <g><circle cx={x + 82} cy={y + 70} r="32" fill="none" stroke={N} strokeWidth="6" /><circle cx={x + 82} cy={y + 70} r="16" fill={T} /></g>}
            {i === 4 && <g><circle cx={x + 82} cy={y + 70} r="32" fill={N} /><path d={`M${x + 82} ${y + 70} L${x + 82} ${y + 38} A32 32 0 0 1 ${x + 110} ${y + 86} Z`} fill={T} /></g>}
            {i === 5 && <g><path d={`M${x + 40} ${y + 70} q42 -40 84 0 q-42 40 -84 0z`} fill="none" stroke={N} strokeWidth="6" strokeLinejoin="round" /><circle cx={x + 82} cy={y + 70} r="12" fill={T} /></g>}
          </g>);
        })}
      </>);
  }
}

export default function Illustration({ name, label, className = "", priority = false }: { name: IllustrationKey; label: string; className?: string; priority?: boolean }) {
  return (
    <svg viewBox="0 0 640 420" role="img" aria-label={label} className={`block h-auto w-full ${className}`} {...(priority ? {} : {})}>
      <rect width="640" height="420" rx="20" fill={M} />
      <Scene k={name} />
    </svg>
  );
}
