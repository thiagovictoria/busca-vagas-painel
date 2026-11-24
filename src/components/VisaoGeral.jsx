import { useState } from "react";
import { COR_REC, ETAPA, SERIES_REC, SITUACOES } from "../config.js";
import { fLocal, fModalidade } from "../format.js";
import { Anel, Barras, Colunas, Legenda } from "./graficos.jsx";

const FUNIL = [[0, "Encontradas"], [2, "Inscrito"], [3, "Em análise"], [4, "Case ou entrevista"], [5, "Proposta"], [6, "Contratado"]];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Resultado de cada vaga: da avaliacao da IA ou da sua inscricao
const SERIES_SITUACAO = [
  { k: "inscrito", nome: "Inscrito", cor: "var(--s1)" },
  { k: "avaliar", nome: "Para avaliar", cor: "var(--s3)" },
  { k: "descartada", nome: "Descartada", cor: "var(--s2)" },
  { k: "fora", nome: "Eliminada ou encerrada", cor: "var(--s4)" },
];
function situacao(it) {
  if ((ETAPA[it.status] ?? 0) >= 1) return "inscrito";
  if (it.status === "descartada") return "descartada";
  if (SITUACOES.avaliar.f(it)) return "avaliar";
  return "fora";
}

const dataVista = (it) => new Date(it.vaga.primeiro_visto_em || it.vaga.publicado_em);

// Categorias do grafico conforme o periodo: dias (14 ou 30) ou os 12 meses de um ano
function montarPeriodo(periodo) {
  if (periodo === "14" || periodo === "30") {
    const n = Number(periodo);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const cats = Array.from({ length: n }, (_, i) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() - (n - 1 - i));
      return {
        rotulo: String(d.getDate()),
        grupo: `${MESES[d.getMonth()]} ${d.getFullYear()}`,
        dica: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
        valores: {},
        ini: d,
      };
    });
    const indice = (dt) => {
      const d = new Date(dt);
      d.setHours(0, 0, 0, 0);
      const i = Math.round((d - cats[0].ini) / 864e5);
      return i >= 0 && i < n ? i : -1;
    };
    return { cats, indice, titulo: "por dia" };
  }
  const ano = Number(periodo);
  const cats = MESES.map((m, i) => ({
    rotulo: m,
    dica: new Date(ano, i, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    valores: {},
  }));
  const indice = (dt) => (dt.getFullYear() === ano ? dt.getMonth() : -1);
  return { cats, indice, titulo: "por mês" };
}

export default function VisaoGeral({ itens, onAbrir }) {
  const anos = [...new Set(itens.map((i) => dataVista(i).getFullYear()))].sort((a, b) => b - a);
  const [periodo, setPeriodo] = useState("14");
  const [cor, setCor] = useState("rec");

  // --- vagas encontradas no periodo ---
  const { cats, indice, titulo } = montarPeriodo(periodo);
  const series = cor === "rec" ? SERIES_REC : SERIES_SITUACAO;
  for (const it of itens) {
    const i = indice(dataVista(it));
    if (i < 0) continue;
    const k = cor === "rec" ? it.vaga.match_recomendacao || "pular" : situacao(it);
    cats[i].valores[k] = (cats[i].valores[k] || 0) + 1;
  }

  // --- distribuicao das notas ---
  const faixas = Array.from({ length: 10 }, (_, i) => ({
    rotulo: String(i * 10),
    dica: i === 9 ? "Nota de 90 a 100" : `Nota de ${i * 10} a ${i * 10 + 9}`,
    valores: { n: 0 },
  }));
  itens.map((i) => i.vaga.nota_match).filter((n) => n != null)
    .forEach((n) => faixas[Math.min(9, Math.floor(n / 10))].valores.n++);

  // --- funil ---
  const funil = FUNIL.map(([k, rotulo]) => ({ rotulo, valor: itens.filter((i) => (ETAPA[i.status] ?? 0) >= k).length }));

  // --- melhores para avaliar ---
  const melhores = itens
    .filter(SITUACOES.avaliar.f)
    .sort((a, b) => (b.vaga.nota_match ?? -1) - (a.vaga.nota_match ?? -1))
    .slice(0, 5);

  // --- modelo de trabalho e localidades ---
  const conta = (f) => {
    const m = new Map();
    itens.forEach((i) => { const k = f(i.vaga); m.set(k, (m.get(k) || 0) + 1); });
    return [...m].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
  };
  const modelos = conta((v) => fModalidade(v.modalidade) || "Não informado");
  const localidades = conta(fLocal).slice(0, 6);

  return (
    <div className="grid">
      <section className="panel w8">
        <div className="phead">
          <h3>Vagas encontradas {titulo}</h3>
          <div className="pctl">
            <select aria-label="Cores por" value={cor} onChange={(e) => setCor(e.target.value)}>
              <option value="rec">Avaliação da IA</option>
              <option value="sit">Resultado (inscrição)</option>
            </select>
            <select aria-label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="14">Últimos 14 dias</option>
              <option value="30">Últimos 30 dias</option>
              {anos.map((a) => <option key={a} value={String(a)}>Ano {a}</option>)}
            </select>
          </div>
        </div>
        <Legenda series={series} />
        <Colunas categorias={cats} series={series} />
        <details className="tabela">
          <summary>Ver em tabela</summary>
          <div className="scroll">
            <table>
              <thead><tr><th>{titulo === "por dia" ? "Dia" : "Mês"}</th>{series.map((s) => <th key={s.k}>{s.nome}</th>)}<th>Total</th></tr></thead>
              <tbody>
                {cats.map((d) => (
                  <tr key={d.dica}>
                    <td>{d.dica}</td>
                    {series.map((s) => <td key={s.k}>{d.valores[s.k] || 0}</td>)}
                    <td>{series.reduce((t, s) => t + (d.valores[s.k] || 0), 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="panel">
        <h3>Melhores para avaliar</h3>
        <p className="sub">As de maior nota esperando sua decisão.</p>
        {melhores.length ? (
          <ul className="top5">
            {melhores.map((it) => (
              <li key={it.chave_unica}>
                <Anel nota={it.vaga.nota_match} cor={COR_REC[it.vaga.match_recomendacao] || "var(--faint)"} />
                <div>
                  <button className="ttl" type="button" onClick={() => onAbrir(it)}>{it.vaga.titulo}</button>
                  <small>{it.vaga.empresa}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="foot">Nada esperando avaliação.</p>}
      </section>

      <section className="panel">
        <h3>Distribuição das notas</h3>
        <Colunas categorias={faixas} series={[{ k: "n", nome: "Vagas", cor: "var(--primary)" }]} />
      </section>

      <section className="panel">
        <h3>Andamento das candidaturas</h3>
        <Barras itens={funil} preencher />
      </section>

      <section className="panel">
        <h3>Onde estão as vagas</h3>
        <h4>Modelo de trabalho</h4>
        <Barras itens={modelos} />
        <h4>Localidades</h4>
        <Barras itens={localidades} />
      </section>
    </div>
  );
}
