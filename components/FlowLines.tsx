/** Three flowing lines echoing the logo mark. Decorative. */
export default function FlowLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 420" fill="none" aria-hidden="true" className={className}>
      <g strokeWidth="34" strokeLinecap="round">
        <path className="flow-line" d="M20 190 H110 C190 190 210 110 290 80 C340 62 400 70 450 70" stroke="#1b3a63" />
        <path className="flow-line" d="M20 270 H120 C200 270 230 190 310 160 C360 142 440 150 600 150" stroke="#22b5c4" />
        <path className="flow-line" d="M120 360 C200 360 240 300 300 250 C330 225 360 230 380 245" stroke="#22b5c4" />
      </g>
    </svg>
  );
}
