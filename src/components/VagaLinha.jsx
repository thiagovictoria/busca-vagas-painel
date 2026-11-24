import { PIPE, REC, STATUS, encerrada } from "../config.js";
import { corNota, fData, fLocal, fRel, fSal } from "../format.js";

export function Recomendacao({ valor }) {
  if (!valor) return null;
  return <span className={"rec " + valor}>{REC[valor] || valor}</span>;
}

export default function VagaLinha({ it, onMudar, onAbrir }) {
  const v = it.vaga;
  const fechada = encerrada(it);

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
  else if (PIPE.includes(it.status))
    acoes = (
      <select aria-label="Situação" value={it.status} onChange={(e) => onMudar(it, e.target.value)}>
        {Object.keys(STATUS)
          .filter((s) => s !== "nova")
          .map((s) => (
            <option key={s} value={s}>{STATUS[s]}</option>
          ))}
      </select>
    );
  else if (it.status !== "nova")
    acoes = <button className="btn sm" onClick={() => onMudar(it, "nova")}>Voltar para avaliação</button>;

  return (
    <article className="row">
      <div className={"score " + corNota(v)} title="Nota de match">{v.nota_match ?? "–"}</div>
      <div>
        <button className="ttl" type="button" onClick={() => onAbrir(it)}>{v.titulo}</button>
        <div className="co"><Recomendacao valor={v.match_recomendacao} />{v.empresa}</div>
        <div className="meta">
          <span>{fLocal(v)}</span>
          {v.modalidade && <span>{v.modalidade}</span>}
          <span>{fSal(v)}</span>
          <span>Publicada {fRel(v.publicado_em)}</span>
          {fechada && <span className="tag">Encerrada {fData(v.encerrada_detectada_em)}</span>}
          {v.prazo_inscricao && <span>Prazo {fData(v.prazo_inscricao)}</span>}
          {it.data_inscricao && <span>Inscrita em {fData(it.data_inscricao)}</span>}
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
