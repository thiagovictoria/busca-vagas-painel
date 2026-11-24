// Marca "Garimpo": uma gema lapidada (a vaga boa, separada do cascalho) com um brilho.
// fundo = cor da marca; facetas em tons claros; brilho em verde-claro.
export function Simbolo({ tamanho = 32, fundo = "var(--primary)", claro = "#ffffff", brilho = "#b9f5d0" }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={fundo} />
      {/* coroa */}
      <path d="M7.5 12.5 11.5 8h9l4 4.5z" fill={claro} opacity=".95" />
      {/* pavilhao */}
      <path d="M7.5 12.5h17L16 25z" fill={claro} opacity=".72" />
      {/* lapidacao */}
      <path d="M11.5 8 13.6 12.5 16 25M20.5 8 18.4 12.5 16 25M7.5 12.5h17M13.6 12.5 16 8l2.4 4.5"
        fill="none" stroke={fundo} strokeWidth="1.1" strokeLinejoin="round" opacity=".55" />
      {/* brilho */}
      <path d="M25 4.2c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z" fill={brilho} />
    </svg>
  );
}

// simbolo + nome
export default function Logo({ tamanho = 32, nomeClasse = "" }) {
  return (
    <span className="logo">
      <Simbolo tamanho={tamanho} />
      <span className={"logo-nome " + nomeClasse}>garimpo</span>
    </span>
  );
}
