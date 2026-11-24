import { ETAPA, SITUACOES } from "../config.js";

// Icones simples (traço), um por número
const ICONES = {
  lupa: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />,
  lista: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  estrela: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  conversa: <path d="M4 5h16v11H9l-5 4z" />,
};

function Icone({ nome, cor }) {
  return (
    <div className="ic" style={{ background: `color-mix(in srgb, ${cor} 14%, transparent)`, color: cor }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONES[nome]}
      </svg>
    </div>
  );
}

// Os 4 números do topo
// Os numeros do topo (na Visao geral, ja filtrados pelo periodo)
export default function Resumo({ itens }) {
  const paraAvaliar = itens.filter(SITUACOES.avaliar.f);
  const blocos = [
    ["lupa", "var(--mute)", itens.length, "Vagas encontradas"],
    ["lista", "var(--sombra)", paraAvaliar.length, "Para avaliar"],
    ["check", "var(--s3)", itens.filter((i) => (ETAPA[i.status] ?? 0) >= 2).length, "Inscrições feitas"],
    ["conversa", "var(--s2)", itens.filter((i) => ["em_analise", "case", "entrevista", "proposta"].includes(i.status)).length, "Em processo seletivo"],
  ];
  return (
    <section className="wrap kpis" aria-label="Resumo">
      {blocos.map(([ic, cor, n, rotulo]) => (
        <div className="kpi" key={rotulo}>
          <Icone nome={ic} cor={cor} />
          <div><b>{n}</b><span>{rotulo}</span></div>
        </div>
      ))}
    </section>
  );
}
