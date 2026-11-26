import { useEffect, useRef, useState } from "react";
import { COR_REC, CRIT, ESCOLHAS_STATUS, STATUS, sb } from "../config.js";
import { fData, fHora, fLocal, fModalidade, fSal } from "../format.js";
import { Anel } from "./graficos.jsx";
import { Recomendacao } from "./VagaLinha.jsx";

function Lista({ itens }) {
  if (!itens || !itens.length) return <p className="foot">—</p>;
  return <ul>{itens.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

// Painel lateral com tudo sobre a vaga e o formulario da candidatura
export default function Detalhe({ it, onFechar, onSalvar, aviso }) {
  const dlg = useRef(null);
  const v = it.vaga;
  const [descricao, setDescricao] = useState("Carregando…");
  const [historico, setHistorico] = useState(null);
  const [form, setForm] = useState({
    status: it.status,
    data: it.data_inscricao ? new Date(it.data_inscricao).toLocaleDateString("sv-SE") : "",
    etapa: it.etapa || "",
    obs: it.observacoes || "",
  });
  const [salvando, setSalvando] = useState(false);

  async function carregarHistorico() {
    const { data } = await sb
      .from("historico")
      .select("status_anterior,status_novo,origem,alterado_em")
      .eq("chave_unica", it.chave_unica)
      .order("alterado_em", { ascending: false });
    setHistorico(data || []);
  }

  useEffect(() => {
    const d = dlg.current;
    if (d && !d.open) d.showModal();
    if (d) d.scrollTop = 0;
    sb.from("vagas").select("descricao").eq("chave_unica", it.chave_unica).maybeSingle()
      .then(({ data }) => setDescricao((data && data.descricao) || "Sem descrição."));
    carregarHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [it.chave_unica]);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    const ok = await onSalvar(it, form.status, {
      observacoes: form.obs.trim() || null,
      etapa: form.etapa.trim() || null,
      data_inscricao: form.data ? new Date(form.data + "T12:00:00").toISOString() : null,
    });
    setSalvando(false);
    if (ok) carregarHistorico();
  }

  const campo = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const crit = v.match_criterios || {};

  return (
    <dialog ref={dlg} aria-labelledby="dTitle" onClose={onFechar}
      onClick={(e) => e.target === dlg.current && dlg.current.close()}>
      <div className="dh">
        <h2 id="dTitle">{v.titulo}</h2>
        <button className="btn sm" type="button" onClick={() => dlg.current.close()}>Fechar</button>
      </div>
      <div className="db">
        <div className="box hero">
          <Anel grande nota={v.nota_match} cor={COR_REC[v.match_recomendacao] || "var(--faint)"} />
          <div>
            <div className="co"><Recomendacao valor={v.match_recomendacao} />{v.empresa}</div>
            <div className="pills">
              <span className="pill">{fLocal(v)}</span>
              {v.modalidade && fModalidade(v.modalidade) !== fLocal(v) && <span className="pill">{fModalidade(v.modalidade)}</span>}
              <span className="pill">{fSal(v)}</span>
            </div>
            <p style={{ margin: "10px 0 0" }}>
              <a className="link" href={v.link} target="_blank" rel="noopener noreferrer">Abrir vaga na Gupy ↗</a>
            </p>
          </div>
        </div>

        <section className="box">
          <h3>Por que essa nota</h3>
          {v.match_eliminatorio && <div className="elim" style={{ marginTop: 0, marginBottom: 12 }}><b>Eliminatório:</b> {v.match_eliminatorio}</div>}
          {v.motivo_match && <p style={{ margin: "0 0 16px" }}>{v.motivo_match}</p>}
          <div className="crit">
            {Object.entries(CRIT).map(([k, [nome, max]]) => {
              const n = Number(crit[k] ?? 0);
              return (
                <div className="cr" key={k}>
                  <span>{nome}</span>
                  <div className="tr"><i style={{ width: Math.max(0, Math.min(100, (n / max) * 100)) + "%" }} /></div>
                  <b>{n} / {max}</b>
                </div>
              );
            })}
          </div>
        </section>

        <section className="box two">
          <div><h3>Pontos fortes</h3><Lista itens={v.match_pontos_fortes} /></div>
          <div><h3>Lacunas</h3><Lista itens={v.match_lacunas} /></div>
        </section>

        <section className="box">
          <h3>Minha candidatura</h3>
          <form className="form" onSubmit={salvar}>
            <label>Situação
              <select {...campo("status")}>
                {ESCOLHAS_STATUS.concat(ESCOLHAS_STATUS.includes(form.status) ? [] : [form.status]).map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
              </select>
            </label>
            <label>Data da inscrição<input type="date" {...campo("data")} /></label>
            <label className="full">Etapa atual (opcional)
              <input placeholder="Ex.: teste online, entrevista com gestor" {...campo("etapa")} />
            </label>
            <label className="full">Observações<textarea {...campo("obs")} /></label>
            <div className="full">
              <button className="btn pri" type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
            </div>
          </form>
        </section>

        <section className="box">
          <h3>Histórico</h3>
          <ul className="hist">
            {historico === null && <li>Carregando…</li>}
            {historico && !historico.length && <li>Sem registros.</li>}
            {historico && historico.map((h, i) => (
              <li key={i}>
                <time>{fHora(h.alterado_em)}</time>
                <span>
                  {h.status_anterior && (STATUS[h.status_anterior] || h.status_anterior) + " → "}
                  <b>{STATUS[h.status_novo] || h.status_novo}</b> · {h.origem === "usuario" ? "você" : h.origem === "telegram" ? "você · Telegram" : "robô"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="box">
          <h3>Detalhes da vaga</h3>
          <dl className="kv">
            {[
              ["Modelo", fModalidade(v.modalidade)],
              ["Contrato", v.tipo_contrato],
              ["Senioridade no título", v.senioridade_titulo],
              ["Publicada", fHora(v.publicado_em)],
              ["Vista pela 1ª vez", fHora(v.primeiro_visto_em)],
              ["Prazo de inscrição", v.prazo_inscricao ? fData(v.prazo_inscricao) : "—"],
              ["Situação na Gupy", v.encerrada_na_plataforma ? "Encerrada (detectada " + fHora(v.encerrada_detectada_em) + ")" : "Aberta"],
            ].map(([a, b]) => (
              <div key={a} style={{ display: "contents" }}><dt>{a}</dt><dd>{b || "—"}</dd></div>
            ))}
          </dl>
        </section>

        <section className="box">
          <h3>Descrição</h3>
          <div className="desc">{descricao}</div>
        </section>

        <p className="foot">
          Avaliada em {fHora(v.match_avaliado_em)} · versão {v.match_perfil_versao || "—"} · {v.match_modelo || "—"} · {it.chave_unica}
        </p>
      </div>
      {aviso}
    </dialog>
  );
}
