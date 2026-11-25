// Ilustracao animada da entrada: um garimpeiro no rio peneira a bateia, ve o brilho,
// pega a pepita, levanta e pula de alegria. Ciclo de 9s, so com SVG + CSS (sem biblioteca).
// Com "reduzir movimento" ligado no sistema, a cena fica parada.
const PELE = "#c68b5e", CHAPEU = "#d9b45a", FAIXA = "#8a5a2b", CAMISA = "#e9dfc6", CALCA = "#3c5148";

function Pepita({ x, y, k = 1, className }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M-5.4-.8-1.6-6l6.4.9 2 5.9-4.4 4.6-6.1-.9z" fill="#e0ac3f" />
      <path d="M-5.4-.8-1.6-6l6.4.9-4.3 3.6z" fill="#f7d58a" />
    </g>
  );
}

const Brilho = ({ x, y, k = 1, className }) => (
  <path className={className} transform={`translate(${x} ${y}) scale(${k})`}
    d="M0-7c.8 4.3 2.7 6.2 7 7-4.3.8-6.2 2.7-7 7-.8-4.3-2.7-6.2-7-7 4.3-.8 6.2-2.7 7-7z" fill="#fff4d6" />
);

export default function Garimpeiro() {
  return (
    <svg viewBox="0 0 400 330" className="garimpeiro" aria-hidden="true">
      {/* fundo: margem do rio */}
      <ellipse cx="200" cy="258" rx="185" ry="20" fill="#123a30" />

      <g className="g-pulo">
        {/* pernas (dentro da agua) */}
        <rect x="183" y="196" width="15" height="80" rx="7" fill={CALCA} />
        <rect x="203" y="196" width="15" height="80" rx="7" fill={CALCA} />
        {/* tronco */}
        <rect x="175" y="136" width="51" height="72" rx="16" fill={CAMISA} />
        <path d="M187 138v66M214 138v66" stroke={FAIXA} strokeWidth="4" strokeLinecap="round" opacity=".7" />
        {/* cabeca */}
        <circle cx="200" cy="114" r="19" fill={PELE} />
        <circle cx="193" cy="113" r="2" fill="#2b1d14" />
        <circle cx="207" cy="113" r="2" fill="#2b1d14" />
        <path className="g-boca-calma" d="M194 122q6 4 12 0" fill="none" stroke="#2b1d14" strokeWidth="2" strokeLinecap="round" />
        <path className="g-boca-feliz" d="M192 120q8 11 16 0z" fill="#2b1d14" />
        {/* chapeu */}
        <ellipse cx="200" cy="99" rx="34" ry="7" fill={CHAPEU} />
        <rect x="184" y="78" width="32" height="23" rx="9" fill={CHAPEU} />
        <rect x="184" y="92" width="32" height="5" fill={FAIXA} />

        {/* bracos e bateia balancando juntos */}
        <g className="g-balanco">
          <path d="M180 148 166 200" stroke={CAMISA} strokeWidth="13" strokeLinecap="round" />
          <ellipse cx="200" cy="207" rx="44" ry="12" fill="#5a3d26" />
          <ellipse cx="200" cy="205" rx="36" ry="8" fill="#7a5636" />
          <ellipse cx="200" cy="205" rx="22" ry="4.5" fill="#8fb3a8" opacity=".55" />
          <circle cx="166" cy="202" r="6.5" fill={PELE} />
          {/* a pepita aparecendo na bateia */}
          <g className="g-achado">
            <Pepita x={212} y={205} k={0.9} />
            <Brilho x={222} y={196} k={0.8} className="g-cintila" />
          </g>
        </g>

        {/* braco que levanta a pepita (gira no ombro) */}
        <g className="g-braco">
          <path d="M221 148 234 200" stroke={CAMISA} strokeWidth="13" strokeLinecap="round" />
          <circle cx="234" cy="202" r="6.5" fill={PELE} />
          <g className="g-na-mao">
            <Pepita x={236} y={212} k={1.5} />
          </g>
        </g>
      </g>

      {/* agua do rio na frente das pernas */}
      <path d="M14 250q31-9 62 0t62 0 62 0 62 0 62 0 62 0V330H14z" fill="#143f34" />
      <g className="g-ondas">
        <path d="M70 268q16-5 32 0t32 0" fill="none" stroke="#f3ecdc" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" />
        <path d="M250 280q16-5 32 0t32 0 32 0" fill="none" stroke="#f3ecdc" strokeOpacity=".16" strokeWidth="2" strokeLinecap="round" />
        <path d="M130 300q16-5 32 0t32 0 32 0" fill="none" stroke="#f3ecdc" strokeOpacity=".12" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="200" cy="252" rx="34" ry="5" fill="none" stroke="#f3ecdc" strokeOpacity=".22" strokeWidth="1.5" />
      </g>
      {/* respingos quando ele cai na agua */}
      <g className="g-respingo">
        <circle cx="168" cy="244" r="3" fill="#8fc2b2" />
        <circle cx="156" cy="236" r="2" fill="#8fc2b2" />
        <circle cx="232" cy="244" r="3" fill="#8fc2b2" />
        <circle cx="245" cy="236" r="2" fill="#8fc2b2" />
      </g>

      {/* faiscas de alegria em volta da pepita levantada */}
      <g className="g-festa">
        <Brilho x={272} y={58} k={1.2} />
        <Brilho x={300} y={96} k={0.8} />
        <Brilho x={240} y={44} k={0.7} />
        <circle cx="290" cy="70" r="3" fill="#e0ac3f" />
        <circle cx="258" cy="30" r="2.5" fill="#f7d58a" />
        <circle cx="312" cy="62" r="2" fill="#f7d58a" />
      </g>
    </svg>
  );
}
