import { useEffect, useState } from "react";
import { COR_REC, REC, SERIES_REC, SITUACOES } from "../config.js";
import { fLocal, fModalidade } from "../format.js";
import { Anel, Barras, Colunas, Legenda, Rosca } from "./graficos.jsx";
import { dataVista, montarPeriodo, nomePeriodo } from "../periodo.js";
import Resumo from "./Resumo.jsx";

const MODELOS = ["Presencial", "Híbrido", "Remoto"];
const faixaNota = (n) => (n == null ? null : Math.min(9, Math.floor(n / 10)));
const semSelecao = () => ({ rec: null, tempo: null, nota: null, modelo: null, local: null });

/**
 * Visao geral com filtro cruzado: clicar numa coluna, fatia ou barra filtra os outros graficos e os numeros.
 * Cada grafico usa os filtros dos OUTROS graficos (o seu proprio item fica destacado).
 * itens ja chegam filtrados pelo periodo.
 */
export default function VisaoGeral({ itens, periodo, anos, onPeriodo, onAbrir }) {
  const [sel, setSel] = useState(semSelecao);
  // trocar o periodo limpa o dia/mes escolhido
  useEffect(() => setSel((s) => ({ ...s, tempo: null })), [periodo]);

  const { cats, indice, titulo } = montarPeriodo(periodo);
  const DIM = {
    rec: (it) => it.vaga.match_recomendacao || "pular",
    tempo: (it) => indice(dataVista(it)),
    nota: (it) => faixaNota(it.vaga.nota_match),
    modelo: (it) => fModalidade(it.vaga.modalidade) || "Não informado",
    local: (it) => fLocal(it.vaga),
  };
  // vagas que passam em todos os filtros, menos o da dimensao "exceto"
  const filtrar = (exceto) =>
    itens.filter((it) => Object.keys(DIM).every((d) => d === exceto || sel[d] === null || DIM[d](it) === sel[d]));
  const alternar = (d) => (v) => setSel((s) => ({ ...s, [d]: s[d] === v ? null : v }));
  const todas = filtrar(null);

  // --- vagas encontradas no periodo (colunas) ---
  for (const it of filtrar("tempo")) {
    const i = indice(dataVista(it));
    if (i < 0) continue;
    const k = DIM.rec(it);
    cats[i].valores[k] = (cats[i].valores[k] || 0) + 1;
  }

  // --- rosca por recomendacao ---
  const paraRosca = filtrar("rec");
  const fatias = SERIES_REC.map((s) => ({ ...s, valor: paraRosca.filter((i) => DIM.rec(i) === s.k).length }));

  // --- distribuicao das notas ---
  const faixas = Array.from({ length: 10 }, (_, i) => ({
    rotulo: String(i * 10),
    dica: i === 9 ? "Nota de 90 a 100" : `Nota de ${i * 10} a ${i * 10 + 9}`,
    valores: { n: 0 },
  }));
  filtrar("nota").forEach((it) => { const f = faixaNota(it.vaga.nota_match); if (f !== null) faixas[f].valores.n++; });

  // --- melhores para avaliar ---
  const melhores = todas.filter(SITUACOES.avaliar.f)
    .sort((a, b) => (b.vaga.nota_match ?? -1) - (a.vaga.nota_match ?? -1))
    .slice(0, 5);

  // --- modelo de trabalho e localidades ---
  const conta = (lista, f) => {
    const m = new Map();
    lista.forEach((i) => { const k = f(i); m.set(k, (m.get(k) || 0) + 1); });
    return [...m].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
  };
  const modelosConta = conta(filtrar("modelo"), DIM.modelo);
  const modelos = MODELOS.map((m) => modelosConta.find((x) => x.rotulo === m) || { rotulo: m, valor: 0 })
    .concat(modelosConta.filter((x) => !MODELOS.includes(x.rotulo)));
  // localidades: as 5 maiores do periodo (lista fixa), contadas com os outros filtros
  const ordemLocais = conta(itens, DIM.local).slice(0, 5).map((x) => x.rotulo);
  if (sel.local && !ordemLocais.includes(sel.local)) ordemLocais.push(sel.local);
  const locaisConta = conta(filtrar("local"), DIM.local);
  const localidades = ordemLocais.map((l) => locaisConta.find((x) => x.rotulo === l) || { rotulo: l, valor: 0 });

  // --- filtros ativos ---
  const ativos = [
    sel.rec && ["rec", `Recomendação: ${REC[sel.rec]}`],
    sel.tempo !== null && cats[sel.tempo] && ["tempo", `${titulo === "por dia" ? "Dia" : "Mês"}: ${cats[sel.tempo].dica}`],
    sel.nota !== null && ["nota", `Nota: ${sel.nota * 10} a ${sel.nota === 9 ? 100 : sel.nota * 10 + 9}`],
    sel.modelo && ["modelo", `Modelo: ${sel.modelo}`],
    sel.local && ["local", `Localidade: ${sel.local}`],
  ].filter(Boolean);

  return (
    <>
      <div className="wrap filtros-ativos" aria-live="polite">
        {ativos.length ? (
          <>
            {ativos.map(([d, txt]) => (
              <button key={d} type="button" className="chip" aria-pressed="true" onClick={() => setSel((s) => ({ ...s, [d]: null }))}>
                {txt} <span aria-hidden="true">✕</span>
              </button>
            ))}
            <button type="button" className="btn sm soft" onClick={() => setSel(semSelecao())}>✕ Limpar filtros</button>
          </>
        ) : null}
      </div>

      <Resumo itens={todas} />

      <div className="wrap">
        <div className="grid">
          <section className="panel w8 l1">
            <div className="phead">
              <h3>Vagas encontradas {titulo}</h3>
              <label className="pctl">Período
                <select value={periodo} onChange={(e) => onPeriodo(e.target.value)}>
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  {anos.map((a) => <option key={a} value={String(a)}>{a}</option>)}
                </select>
              </label>
            </div>
            <Legenda series={SERIES_REC} />
            <Colunas categorias={cats} series={SERIES_REC} selecionado={sel.tempo} onSelecionar={alternar("tempo")} />
            <details className="tabela">
              <summary>Ver em tabela</summary>
              <div className="scroll">
                <table>
                  <thead><tr><th>{titulo === "por dia" ? "Dia" : "Mês"}</th>{SERIES_REC.map((s) => <th key={s.k}>{s.nome}</th>)}<th>Total</th></tr></thead>
                  <tbody>
                    {cats.map((d) => (
                      <tr key={d.dica}>
                        <td>{d.dica}</td>
                        {SERIES_REC.map((s) => <td key={s.k}>{d.valores[s.k] || 0}</td>)}
                        <td>{SERIES_REC.reduce((t, s) => t + (d.valores[s.k] || 0), 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          <section className="panel l1">
            <h3>Melhores para avaliar</h3>
            <p className="sub">As de maior nota esperando sua decisão.</p>
            {melhores.length ? (
              <ul className="top5">
                {melhores.map((it) => (
                  <li key={it.chave_unica}>
                    <Anel nota={it.vaga.nota_match} cor={COR_REC[it.vaga.match_recomendacao] || "var(--faint)"} />
                    <div>
                      <button className="ttl um" type="button" title={it.vaga.titulo} onClick={() => onAbrir(it)}>{it.vaga.titulo}</button>
                      <small className="um">{it.vaga.empresa}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="foot">Nada esperando avaliação com esses filtros.</p>}
          </section>

          <section className="panel l2">
            <h3>Distribuição das notas</h3>
            <Colunas categorias={faixas} series={[{ k: "n", nome: "Vagas", cor: "var(--primary)" }]}
              selecionado={sel.nota} onSelecionar={alternar("nota")} />
          </section>

          <section className="panel l2">
            <h3>Vagas encontradas</h3>
            <Rosca fatias={fatias} rotuloTotal={nomePeriodo(periodo)} selecionado={sel.rec} onSelecionar={alternar("rec")} />
          </section>

          {/* dois cartoes, um abaixo do outro, na mesma coluna */}
          <div className="pilha">
            <section className="panel">
              <h3>Modelo de trabalho</h3>
              <Barras itens={modelos} preencher selecionado={sel.modelo} onSelecionar={alternar("modelo")} />
            </section>
            <section className="panel">
              <h3>Localidades</h3>
              <Barras itens={localidades} preencher selecionado={sel.local} onSelecionar={alternar("local")} />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
