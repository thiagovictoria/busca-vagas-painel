import { COR_REC, SERIES_REC, SITUACOES } from "../config.js";
import { fLocal, fModalidade } from "../format.js";
import { Anel, Barras, Colunas, Legenda, Rosca } from "./graficos.jsx";
import { dataVista, montarPeriodo, nomePeriodo } from "../periodo.js";

// itens ja chegam filtrados pelo periodo escolhido no topo da Visao geral
export default function VisaoGeral({ itens, periodo, onAbrir }) {

  // --- vagas encontradas no periodo ---
  const { cats, indice, titulo } = montarPeriodo(periodo);
  const series = SERIES_REC;
  for (const it of itens) {
    const i = indice(dataVista(it));
    if (i < 0) continue;
    const k = it.vaga.match_recomendacao || "pular";
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

  // --- rosca: os mesmos dados do grafico "Vagas encontradas" (mesmo periodo), somados por recomendacao ---
  const fatias = SERIES_REC.map((s) => ({ ...s, valor: cats.reduce((t, c) => t + (c.valores[s.k] || 0), 0) }));

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
        <h3>Vagas encontradas {titulo}</h3>
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
        <h3>Vagas por recomendação da IA</h3>
        <Rosca fatias={fatias} rotuloTotal={`vagas · ${nomePeriodo(periodo)}`} />
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
