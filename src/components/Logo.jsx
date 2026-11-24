// Marca "garimpo" — "Pepita": uma pepita de ouro lapidada, com facetas bem marcadas
// (separadas por linhas grafite, como um vitral) e um brilho. Fica nitida ate em 16px.

// so a pepita (sem fundo), em coordenadas 0..64 — usada no simbolo e na ilustracao da entrada
export function Pepita({ linha = "#17181c" }) {
  return (
    <g>
        <path d="M17 24L30 13.5L46 16L39 24.5L26 26Z" fill="#ffe08a"/>
        <path d="M46 16L53 30L43 34L39 24.5Z" fill="#f6bd36"/>
        <path d="M53 30L46 46.5L30 51.5L34 41L43 34Z" fill="#c7850a"/>
        <path d="M30 51.5L15 43L23.5 37L34 41Z" fill="#a86d05"/>
        <path d="M15 43L11.5 32L17 24L26 26L23.5 37Z" fill="#e8a314"/>
        <path d="M26 26L39 24.5L43 34L34 41L23.5 37Z" fill="#ffcf4d"/>
        <path d="M17 24L30 13.5L46 16L39 24.5L26 26Z" fill="none" stroke={linha} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M46 16L53 30L43 34L39 24.5Z" fill="none" stroke={linha} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M53 30L46 46.5L30 51.5L34 41L43 34Z" fill="none" stroke={linha} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M30 51.5L15 43L23.5 37L34 41Z" fill="none" stroke={linha} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M15 43L11.5 32L17 24L26 26L23.5 37Z" fill="none" stroke={linha} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M26 26L39 24.5L43 34L34 41L23.5 37Z" fill="none" stroke={linha} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M17 24L30 13.5L46 16L53 30L46 46.5L30 51.5L15 43L11.5 32Z" fill="none" stroke={linha} strokeWidth="2.4" strokeLinejoin="round"/>
        <path d="M53.5 6c.45 2.6 1.4 3.55 4 4-2.6.45-3.55 1.4-4 4-.45-2.6-1.4-3.55-4-4 2.6-.45 3.55-1.4 4-4z" fill="#fff4cc"/>
    </g>
  );
}

export function Simbolo({ tamanho = 32, fundo = "#17181c" }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={fundo} />
      <g transform="translate(32 33) scale(1.1) translate(-32 -32)">
        <Pepita linha={fundo} />
      </g>
    </svg>
  );
}

// simbolo + nome (Sora 800, minusculo)
export default function Logo({ tamanho = 34 }) {
  return (
    <span className="logo">
      <Simbolo tamanho={tamanho} fundo="#26272d" />
      <span className="logo-nome">garimpo</span>
    </span>
  );
}
