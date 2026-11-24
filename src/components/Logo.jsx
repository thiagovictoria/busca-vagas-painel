// Marca "garimpo": um "g" minusculo em areia com uma pepita de ouro dentro do olho da letra —
// o achado dentro do garimpo. Formas simples: le bem de 16px a 160px.
// fundo = verde-mata; letra = areia; pepita = ouro (com uma faceta de luz).

export function Pepita({ x = 0, y = 0, k = 1, giro = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${k})`}>
      <path d="M-5.4-.8-1.6-6l6.4.9 2 5.9-4.4 4.6-6.1-.9z" fill="#e0ac3f" />
      <path d="M-5.4-.8-1.6-6l6.4.9-4.3 3.6z" fill="#f7d58a" />
    </g>
  );
}

export function Simbolo({ tamanho = 32, fundo = "#0f2e26", letra = "#f3ecdc" }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={fundo} />
      <g transform="translate(2 0)">
        <circle cx="30" cy="27" r="12.5" fill="none" stroke={letra} strokeWidth="7" />
        <path d="M42.5 15v26a13 13 0 0 1-13 13h-7" fill="none" stroke={letra} strokeWidth="7" strokeLinecap="round" />
        <Pepita x={30.6} y={27} />
      </g>
    </svg>
  );
}

// barra superior: so o simbolo
export default function Logo({ tamanho = 36 }) {
  return (
    <span className="logo">
      <Simbolo tamanho={tamanho} fundo="#163d33" />
    </span>
  );
}
