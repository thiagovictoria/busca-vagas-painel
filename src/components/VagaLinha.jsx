import { COR_REC, GRUPOS_CAND, REC, STATUS, encerrada } from "../config.js";
import { fData, fLocal, fModalidade, fRel, fSal } from "../format.js";
import { Anel } from "./graficos.jsx";

export function Recomendacao({ valor }) {
  if (!valor) return null;
  return (
    <span className="rec"><i style={{ background: COR_REC[valor] }} />{REC[valor] || valor}</span>
  );
}

export default function VagaLinha({ it, onMudar, onAbrir }) {
  const v = it.vaga;
  const fechada = encerrada(it);
  const local = fLocal(v);
  const modelo = fModalidade(v.modalidade);

  let acoes = null;
  if (it.status === "nova" && !fechada)
    acoes = (
      <>
        <button className="btn sm pri" onClick={() => onMudar(it, "aprovada")}>Quero me inscrever</button>
        <button className="btn sm warn" onClick={() => onMudar(it, "descartada")}>Descartar</button>
      </>
    );
  else if (it.status === "aprovada")
    acoes = (
      <>
        <button className="btn sm pri" onClick={() => onMudar(it, "inscrita")}>Marcar inscrita</button>
        <button className="btn sm warn" onClick={() => onMudar(it, "descartada")}>Descartar</button>
      </>
    );
  else if (GRUPOS_CAND.includes(it.status))
    acoes = (
      <select aria-label="Situação" value={it.status} onChange={(e) => onMudar(it, e.target.value)}>
        {Object.keys(STATUS).filter((s) => s !== "nova").map((s) => (
          <option key={s} value={s}>{STATUS[s]}</option>
        ))}
      </select>
    );
  else if (it.status === "descartada")
    acoes = <button className="btn sm" onClick={() => onMudar(it, "nova")}>Voltar para avaliação</button>;

  return (
    <article className="row">
      <Anel nota={v.nota_match} cor={COR_REC[v.match_recomendacao] || "var(--faint)"} />
      <div>
        <button className="ttl" type="button" onClick={() => onAbrir(it)}>{v.titulo}</button>
        <div className="co"><Recomendacao valor={v.match_recomendacao} /><span>{v.empresa}</span></div>
        <div className="pills">
          <span className="pill">{local}</span>
          {modelo && modelo !== local && <span className="pill">{modelo}</span>}
          <span className="pill">{fSal(v)}</span>
          <span className="pill">Publicada {fRel(v.publicado_em)}</span>
          {fechada && <span className="pill alert">Encerrada {fData(v.encerrada_detectada_em)}</span>}
          {v.prazo_inscricao && <span className="pill">Prazo {fData(v.prazo_inscricao)}</span>}
          {it.data_inscricao && <span className="pill">Inscrita em {fData(it.data_inscricao)}</span>}
        </div>
        {v.match_eliminatorio ? (
          <div className="elim">{v.match_eliminatorio}</div>
        ) : (
          v.motivo_match && <div className="why">{v.motivo_match}</div>
        )}
      </div>
      <div className="acts">
        {acoes}
        <a className="btn sm" href={v.link} target="_blank" rel="noopener noreferrer">Abrir ↗</a>
      </div>
    </article>
  );
}
