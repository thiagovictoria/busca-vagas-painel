import { useEffect, useRef, useState } from "react";

// Largura real do elemento (os graficos sao desenhados no tamanho em pixels de verdade)
function useTamanho() {
  const ref = useRef(null);
  const [t, setT] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setT({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    medir();
    return () => ro.disconnect();
  }, []);
  return [ref, t.w, t.h];
}

function teto(n) {
  if (n <= 4) return 4;
  const passo = n <= 10 ? 2 : n <= 25 ? 5 : n <= 50 ? 10 : Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / passo) * passo;
}

// Coluna com ponta arredondada (4px) em cima e base reta
function colunaPath(x, y, w, h, r) {
  r = Math.min(r, h, w / 2);
  if (h <= 0) return "";
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function Legenda({ series }) {
  if (series.length < 2) return null;
  return (
    <div className="legend">
      {series.map((s) => (
        <span key={s.k}><i style={{ background: s.cor }} />{s.nome}</span>
      ))}
    </div>
  );
}

/**
 * Colunas (empilhadas quando ha mais de uma serie).
 * categorias: [{rotulo, dica, valores: {serie: n}}]; series: [{k, nome, cor}]
 */
// altura omitida: o grafico ocupa o espaco que sobrar no cartao (classe .fig.auto)
export function Colunas({ categorias, series, altura, unidade = "vagas" }) {
  const [ref, W, Hmedida] = useTamanho();
  const [foco, setFoco] = useState(null);
  const temGrupo = categorias.some((c) => c.grupo);
  const H = altura || Hmedida || 240, esq = 4, base = temGrupo ? 44 : 26, topo = 18;
  const n = categorias.length;
  const totais = categorias.map((c) => series.reduce((s, x) => s + (c.valores[x.k] || 0), 0));
  const max = teto(Math.max(1, ...totais));
  const ih = H - base - topo;
  const banda = n ? (W - esq) / n : 0;
  const larg = Math.max(4, Math.min(24, banda * 0.62));
  const y = (v) => topo + ih - (v / max) * ih;
  const passoRotulo = Math.max(1, Math.ceil(36 / Math.max(banda, 1)));

  return (
    <div className={"fig" + (altura ? "" : " auto")} ref={ref} style={altura ? { height: altura } : undefined} onMouseLeave={() => setFoco(null)}>
      {W > 0 && (
        <svg role="img" aria-label={`Gráfico de colunas com ${n} categorias`}>
          {categorias.map((c, i) => {
            const cx = esq + banda * i + banda / 2;
            const x = cx - larg / 2;
            let acum = 0;
            const vis = series.filter((s) => (c.valores[s.k] || 0) > 0);
            return (
              <g key={i} opacity={foco === null || foco === i ? 1 : 0.45}>
                {vis.map((s, j) => {
                  const v = c.valores[s.k];
                  const y0 = y(acum), y1 = y(acum + v);
                  acum += v;
                  const ultimo = j === vis.length - 1;
                  const h = Math.max(0, y0 - y1 - (j > 0 ? 2 : 0)); // 2px de respiro entre segmentos
                  return ultimo
                    ? <path key={s.k} d={colunaPath(x, y1, larg, h, 4)} fill={s.cor} />
                    : <rect key={s.k} x={x} y={y1} width={larg} height={h} fill={s.cor} />;
                })}
                {totais[i] > 0 && banda >= 16 && <text className="cap" x={cx} y={y(totais[i]) - 6} textAnchor="middle">{totais[i]}</text>}
                {i % passoRotulo === 0 && <text x={cx} y={temGrupo ? H - 24 : H - 6} textAnchor="middle">{c.rotulo}</text>}
                {c.grupo && (i === 0 || c.grupo !== categorias[i - 1].grupo) && (
                  <g>
                    <line x1={esq + banda * i + 1} x2={esq + banda * i + 1} y1={y(0)} y2={H - 2} stroke="var(--line)" />
                    <text className="cap" x={esq + banda * i + 6} y={H - 4}>{c.grupo}</text>
                  </g>
                )}
                <rect x={esq + banda * i} y={0} width={banda} height={H} fill="transparent"
                  onMouseEnter={() => setFoco(i)} onTouchStart={() => setFoco(i)} />
              </g>
            );
          })}
          <line x1={esq} x2={W} y1={y(0)} y2={y(0)} stroke="var(--faint)" strokeWidth="1" />
        </svg>
      )}
      {foco !== null && W > 0 && (
        <div className="tip" style={{ left: Math.min(Math.max(esq + banda * foco + banda / 2, 80), W - 80), top: y(totais[foco]) }}>
          <b>{categorias[foco].dica || categorias[foco].rotulo}</b>
          {series.length > 1
            ? series.map((s) => (
                <span key={s.k}><i style={{ background: s.cor }} />{s.nome}: {categorias[foco].valores[s.k] || 0}</span>
              )).concat(<span key="t">Total: {totais[foco]}</span>)
            : <span>{totais[foco]} {unidade}</span>}
        </div>
      )}
    </div>
  );
}

/** Barras horizontais simples (HTML). itens: [{rotulo, valor, dica?}] */
export function Barras({ itens, cor = "var(--primary)", preencher = false }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <div className={"hbars" + (preencher ? " fill" : "")}>
      {itens.map((i) => (
        <div className="hb" key={i.rotulo} title={i.dica || `${i.rotulo}: ${i.valor}`}>
          <span>{i.rotulo}</span>
          <div className="tr"><i style={{ width: (i.valor / max) * 100 + "%", background: cor, opacity: i.valor ? 1 : 0.25 }} /></div>
          <b>{i.valor}</b>
        </div>
      ))}
    </div>
  );
}

/** Anel da nota (0 a 100), na cor da recomendacao */
export function Anel({ nota, cor, grande = false }) {
  const r = 42, c = 2 * Math.PI * r;
  const p = nota == null ? 0 : Math.max(0, Math.min(100, nota)) / 100;
  return (
    <div className={"ring" + (grande ? " big" : "")} title="Nota de match (0 a 100)">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--soft)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={cor} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`} />
      </svg>
      <b>{nota ?? "–"}</b>
    </div>
  );
}

/**
 * Rosca interativa. fatias: [{k, nome, cor, valor}]
 * Passe o mouse (ou toque) numa fatia ou na legenda: o centro mostra a quantidade e o %.
 */
export function Rosca({ fatias, rotuloTotal = "vagas" }) {
  const [foco, setFoco] = useState(null);
  const total = fatias.reduce((t, f) => t + f.valor, 0);
  const R = 72, C = 2 * Math.PI * R, GAP = 2.5;
  let acum = 0;
  const visiveis = fatias.filter((f) => f.valor > 0);
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);
  const atual = foco && fatias.find((f) => f.k === foco);
  return (
    <div className="rosca" onMouseLeave={() => setFoco(null)}>
      <svg viewBox="0 0 200 200" role="img" aria-label={`Rosca com ${total} ${rotuloTotal}`}>
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="26" />
        {visiveis.map((f) => {
          const len = (f.valor / total) * C;
          const ini = acum;
          acum += len;
          const ativo = foco === f.k;
          return (
            <circle key={f.k} cx="100" cy="100" r={R} fill="none" stroke={f.cor}
              strokeWidth={ativo ? 32 : 26}
              strokeDasharray={`${Math.max(0, len - (visiveis.length > 1 ? GAP : 0))} ${C}`}
              strokeDashoffset={-ini} transform="rotate(-90 100 100)"
              opacity={foco && !ativo ? 0.35 : 1}
              style={{ transition: "stroke-width .15s, opacity .15s", cursor: "pointer" }}
              onMouseEnter={() => setFoco(f.k)} onTouchStart={() => setFoco(f.k)} />
          );
        })}
        <text x="100" y="98" textAnchor="middle" className="rosca-n">{atual ? atual.valor : total}</text>
        <text x="100" y="120" textAnchor="middle" className="rosca-l">
          {atual ? `${atual.nome} · ${pct(atual.valor)}%` : rotuloTotal}
        </text>
      </svg>
      <ul className="rosca-leg">
        {fatias.map((f) => (
          <li key={f.k} className={foco === f.k ? "on" : ""} onMouseEnter={() => setFoco(f.k)} onClick={() => setFoco(foco === f.k ? null : f.k)}>
            <i style={{ background: f.cor }} />
            <span>{f.nome}</span>
            <b>{f.valor}</b>
            <small>{pct(f.valor)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
