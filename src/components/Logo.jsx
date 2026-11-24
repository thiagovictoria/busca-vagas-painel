// Marca "garimpo" — caminho B, "Pepita": uma pepita de ouro lapidada com um brilho,
// sobre grafite. A pepita e a vaga que vale ouro, separada do cascalho.
export function Simbolo({ tamanho = 32, fundo = "#17181c" }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={fundo} />
      <path d="M15 33 23 19 39 15.5 50 26 47 43 33 50.5 19 45z" fill="#e8a314" />
      <path d="M15 33 23 19 39 15.5 32 31z" fill="#ffd36b" />
      <path d="M39 15.5 50 26 47 43 32 31z" fill="#c7850a" />
      <path d="M15 33 32 31 33 50.5 19 45z" fill="#f2b52b" />
      <path d="M53 8.5c.4 2.3 1.3 3.2 3.6 3.6-2.3.4-3.2 1.3-3.6 3.6-.4-2.3-1.3-3.2-3.6-3.6 2.3-.4 3.2-1.3 3.6-3.6z" fill="#fff6d8" />
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
