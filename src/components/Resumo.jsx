import { EM_PROCESSO } from "../config.js";
import { fRel, ms } from "../format.js";

// Faixa verde: os quatro numeros do topo
export default function Resumo({ itens, ultima, porSit }) {
  const paraAvaliar = porSit.avaliar || [];
  const n = (k) => (porSit[k] || []).length;
  const fora = [[n("eliminadas"), "eliminada", "eliminadas"], [n("encerradas"), "encerrada", "encerradas"], [n("descartadas"), "descartada", "descartadas"]]
    .filter(([q]) => q).map(([q, um, v]) => `${q} ${q === 1 ? um : v}`);
  const emCandidatura = itens.length - paraAvaliar.length - n("eliminadas") - n("encerradas") - n("descartadas");
  if (emCandidatura) fora.unshift(`${emCandidatura} em candidaturas`);
  const recomendadas = paraAvaliar.filter((i) => i.vaga.match_recomendacao === "candidatar").length;
  const ultimas24h = paraAvaliar.filter((i) => Date.now() - ms(i.vaga.primeiro_visto_em) < 864e5).length;
  const paraInscrever = itens.filter((i) => i.status === "aprovada").length;
  const processo = itens.filter((i) => EM_PROCESSO.includes(i.status));
  const avancadas = processo.filter((i) => ["case", "entrevista", "proposta"].includes(i.status)).length;
  const coleta = ultima
    ? ultima.sucesso
      ? "Última coleta " + fRel(ultima.terminado_em || ultima.ciclo)
      : "Última coleta com falha"
    : "Sem coletas";

  const blocos = [
    [paraAvaliar.length, "para avaliar", [`${recomendadas} recomendadas · ${ultimas24h} nas últimas 24 h`,
      fora.length ? `${itens.length} encontradas, fora: ${fora.join(", ")}` : null]],
    [paraInscrever, "para inscrever", "marcadas como “quero me inscrever”"],
    [processo.length, "em processo", `${avancadas} em case, entrevista ou proposta`],
    [ultima ? ultima.novas_aprovadas ?? 0 : "—", "novas na última coleta", coleta],
  ];

  return (
    <div className="nums">
      {blocos.map(([n, rotulo, sub]) => (
        <div className="num" key={rotulo}>
          <b>{n}</b>
          <span>{rotulo}</span>
          {(Array.isArray(sub) ? sub : [sub]).filter(Boolean).map((t) => <small key={t}>{t}</small>)}
        </div>
      ))}
    </div>
  );
}
