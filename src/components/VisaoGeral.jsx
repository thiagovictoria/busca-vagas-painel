import { COR_REC, SERIES_REC, ABAS, FIM } from "../config.js";
import { diaCurto, fModalidade } from "../format.js";
import { Anel, Barras, Colunas, Legenda } from "./graficos.jsx";

const DIAS = 14;
// ate que etapa cada situacao chegou (reprovado e sem retorno: ao menos inscrita)
const ETAPA = { nova: 0, descartada: 0, aprovada: 1, inscrita: 2, reprovado: 2, sem_retorno: 2, em_analise: 3, case: 4, entrevista: 4, proposta: 5, contratado: 6 };
const FUNIL = ["Encontradas", "Quero me inscrever", "Inscritas", "Em análise", "Case ou entrevista", "Proposta"];

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export default function VisaoGeral({ itens, onAbrir }) {
  // --- vagas encontradas por dia, pela recomendacao ---
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Array.from({ length: DIAS }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - (DIAS - 1 - i));
    return d;
  });
  const porDia = dias.map((d) => ({
    rotulo: diaCurto(d),
    dica: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" }),
    valores: {},
  }));
  let noPeriodo = 0, recomendadas = 0;
  for (const it of itens) {
    const visto = new Date(it.vaga.primeiro_visto_em || it.vaga.publicado_em);
    visto.setHours(0, 0, 0, 0);
    const i = Math.round((visto - dias[0]) / 864e5);
    if (i < 0 || i >= DIAS) continue;
    const r = it.vaga.match_recomendacao || "pular";
    porDia[i].valores[r] = (porDia[i].valores[r] || 0) + 1;
    noPeriodo++;
    if (r === "candidatar") recomendadas++;
  }

  // --- distribuicao das notas ---
  const faixas = Array.from({ length: 10 }, (_, i) => ({
    rotulo: String(i * 10),
    dica: i === 9 ? "Nota de 90 a 100" : `Nota de ${i * 10} a ${i * 10 + 9}`,
    valores: { n: 0 },
  }));
  const notas = itens.map((i) => i.vaga.nota_match).filter((n) => n != null);
  notas.forEach((n) => faixas[Math.min(9, Math.floor(n / 10))].valores.n++);
  const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null;
  const acima70 = notas.filter((n) => n >= 70).length;

  // --- funil ---
  const funil = FUNIL.map((rotulo, k) => ({ rotulo, valor: itens.filter((i) => (ETAPA[i.status] ?? 0) >= k).length }));
  const inscritas = funil[2].valor;

  // --- melhores para avaliar ---
  const melhores = itens
    .filter((i) => ABAS.avaliar(i) && i.vaga.match_recomendacao !== "eliminado")
    .sort((a, b) => (b.vaga.nota_match ?? -1) - (a.vaga.nota_match ?? -1))
    .slice(0, 5);

  // --- modelo de trabalho e cidades ---
  const conta = (f) => {
    const m = new Map();
    itens.forEach((i) => { const k = f(i.vaga); m.set(k, (m.get(k) || 0) + 1); });
    return [...m].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
  };
  const modelos = conta((v) => fModalidade(v.modalidade) || "Não informado");
  const cidades = conta((v) => v.cidade || (fModalidade(v.modalidade) === "Remoto" ? "Remoto" : "Não informada")).slice(0, 6);
  const descartadas = itens.filter((i) => FIM.includes(i.status)).length;

  return (
    <div className="grid">
      <section className="panel wide">
        <h3>Vagas encontradas por dia</h3>
        <p className="sub">
          {plural(noPeriodo, "vaga", "vagas")} nos últimos {DIAS} dias, {plural(recomendadas, "recomendada", "recomendadas")} pela IA.
          Cada coluna mostra a recomendação.
        </p>
        <Legenda series={SERIES_REC} />
        <Colunas categorias={porDia} series={SERIES_REC} />
        <details className="tabela">
          <summary>Ver em tabela</summary>
          <div className="scroll">
            <table>
              <thead><tr><th>Dia</th>{SERIES_REC.map((s) => <th key={s.k}>{s.nome}</th>)}<th>Total</th></tr></thead>
              <tbody>
                {porDia.map((d) => (
                  <tr key={d.rotulo}>
                    <td>{d.rotulo}</td>
                    {SERIES_REC.map((s) => <td key={s.k}>{d.valores[s.k] || 0}</td>)}
                    <td>{SERIES_REC.reduce((t, s) => t + (d.valores[s.k] || 0), 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="panel">
        <h3>Distribuição das notas</h3>
        <p className="sub">
          {media == null ? "Sem notas ainda." : `Nota média ${media}; ${plural(acima70, "vaga", "vagas")} com 70 ou mais.`}
        </p>
        <Colunas categorias={faixas} series={[{ k: "n", nome: "Vagas", cor: "var(--s1)" }]} altura={220} />
      </section>

      <section className="panel">
        <h3>Andamento das candidaturas</h3>
        <p className="sub">
          {inscritas ? `${plural(inscritas, "inscrição", "inscrições")} até agora.` : "Nenhuma inscrição ainda."}
          {descartadas ? ` ${plural(descartadas, "vaga descartada", "vagas descartadas")}.` : ""}
        </p>
        <Barras itens={funil} />
      </section>

      <section className="panel third">
        <h3>Melhores para avaliar</h3>
        <p className="sub">As de maior nota esperando sua decisão.</p>
        {melhores.length ? (
          <ul className="top5">
            {melhores.map((it) => (
              <li key={it.chave_unica}>
                <Anel nota={it.vaga.nota_match} cor={COR_REC[it.vaga.match_recomendacao] || "var(--faint)"} />
                <div>
                  <button className="ttl" type="button" style={{ fontSize: 15 }} onClick={() => onAbrir(it)}>{it.vaga.titulo}</button>
                  <small>{it.vaga.empresa}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="foot">Nada esperando avaliação.</p>}
      </section>

      <section className="panel third">
        <h3>Modelo de trabalho</h3>
        <p className="sub">Todas as vagas encontradas.</p>
        <Barras itens={modelos} />
      </section>

      <section className="panel third">
        <h3>Cidades</h3>
        <p className="sub">Onde estão as vagas.</p>
        <Barras itens={cidades} />
      </section>
    </div>
  );
}
