import { useState } from "react";
import { COR_REC, ETAPAS_KANBAN, NOME_ETAPA, colunaKanban } from "../config.js";
import { fData, fLocal, ms } from "../format.js";
import { Anel } from "./graficos.jsx";

// cor de cada etapa (bolinha no titulo da coluna)
const COR_ETAPA = { em_analise: "var(--s3)", case: "var(--s5)", entrevista: "var(--s2)", contratado: "var(--s1)", reprovado: "var(--s4)" };

/**
 * Kanban das candidaturas: uma coluna por etapa. Arraste o cartao para outra coluna
 * ou use "Mover para" no cartao (funciona tambem no celular).
 */
export default function Kanban({ itens, onMudar, onAbrir }) {
  const [arrastando, setArrastando] = useState(null);
  const [sobre, setSobre] = useState(null);
  const porColuna = Object.fromEntries(ETAPAS_KANBAN.map((c) => [c, []]));
  itens.forEach((it) => { const c = colunaKanban(it.status); if (c) porColuna[c].push(it); });
  Object.values(porColuna).forEach((l) => l.sort((a, b) => ms(b.data_inscricao) - ms(a.data_inscricao)));

  function soltar(coluna) {
    const it = itens.find((x) => x.chave_unica === arrastando);
    setArrastando(null);
    setSobre(null);
    if (it && colunaKanban(it.status) !== coluna) onMudar(it, coluna);
  }

  return (
    <div className="kanban" role="list" aria-label="Candidaturas por etapa">
      {ETAPAS_KANBAN.map((c) => (
        <section key={c} role="listitem" className={"kcol" + (sobre === c ? " sobre" : "")}
          onDragOver={(e) => { if (arrastando) { e.preventDefault(); setSobre(c); } }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSobre(null); }}
          onDrop={(e) => { e.preventDefault(); soltar(c); }}>
          <h3 className="khead"><i style={{ background: COR_ETAPA[c] }} />{NOME_ETAPA[c]}<b>{porColuna[c].length}</b></h3>
          <div className="kcards">
            {porColuna[c].map((it) => (
              <article key={it.chave_unica} className={"kcard" + (arrastando === it.chave_unica ? " movendo" : "")} draggable
                onDragStart={(e) => { setArrastando(it.chave_unica); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", it.chave_unica); }}
                onDragEnd={() => { setArrastando(null); setSobre(null); }}>
                <div className="ktop">
                  <Anel nota={it.vaga.nota_match} cor={COR_REC[it.vaga.match_recomendacao] || "var(--faint)"} />
                  <div>
                    <button type="button" className="ttl" title={it.vaga.titulo} onClick={() => onAbrir(it)}>{it.vaga.titulo}</button>
                    <small>{it.vaga.empresa} · {fLocal(it.vaga)}</small>
                  </div>
                </div>
                {it.data_inscricao && <span className="pill">Inscrito em {fData(it.data_inscricao)}</span>}
                {it.etapa && <p className="knota">{it.etapa}</p>}
                <div className="kpe">
                  <select aria-label="Mover para" value={c} onChange={(e) => onMudar(it, e.target.value)}>
                    {ETAPAS_KANBAN.map((x) => <option key={x} value={x}>{NOME_ETAPA[x]}</option>)}
                  </select>
                  <a className="btn sm" href={it.vaga.link} target="_blank" rel="noopener noreferrer">Abrir ↗</a>
                </div>
              </article>
            ))}
            {!porColuna[c].length && <p className="kvazio">{arrastando ? "Solte aqui" : "Nenhuma vaga"}</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
