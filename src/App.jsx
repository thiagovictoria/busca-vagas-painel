import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ABAS, CAND_COLS, LISTA_COLS, REC, SITUACOES, STATUS, sb } from "./config.js";
import Kanban from "./components/Kanban.jsx";
import { fLocal, fModalidade, guardar, ms } from "./format.js";
import Login from "./components/Login.jsx";
import Resumo from "./components/Resumo.jsx";
import VagaLinha from "./components/VagaLinha.jsx";
import Detalhe from "./components/Detalhe.jsx";
import Aviso from "./components/Aviso.jsx";
import VisaoGeral from "./components/VisaoGeral.jsx";
import Logo from "./components/Logo.jsx";
import { anosDasVagas, aplicarSelecao, noPeriodo, semSelecao } from "./periodo.js";

const ORDENS = {
  nota: (x, y) => (y.vaga.nota_match ?? -1) - (x.vaga.nota_match ?? -1) || ms(y.vaga.publicado_em) - ms(x.vaga.publicado_em),
  data: (x, y) => ms(y.vaga.publicado_em) - ms(x.vaga.publicado_em),
  prazo: (x, y) => (x.vaga.prazo_inscricao || "9999").localeCompare(y.vaga.prazo_inscricao || "9999"),
};
const ROTULO_ABAS = [["visao", "Visão geral"], ["vagas", "Vagas"], ["candidaturas", "Candidaturas"]];
const unicos = (lista) => [...new Set(lista)].sort((a, b) => a.localeCompare(b, "pt-BR"));
const RECARREGAR_MIN = 5; // busca dados novos sozinho a cada 5 minutos

export default function App() {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda verificando
  const [itens, setItens] = useState([]);
  const [ultima, setUltima] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState(() => { const t = guardar.get("tab", "visao"); return ROTULO_ABAS.some(([k]) => k === t) ? t : "vagas"; });
  const [sit, setSit] = useState("avaliar");
  const [periodo, setPeriodo] = useState(guardar.get("periodo", "7"));
  const [selVisao, setSelVisao] = useState(semSelecao);
  const [loc, setLoc] = useState("todas");
  const [mod, setMod] = useState("todos");
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [menu, setMenu] = useState(false);
  const [rec, setRec] = useState(() => { const r = guardar.get("rec", "todas"); return r === "eliminado" ? "todas" : r; });
  const [ordem, setOrdem] = useState(guardar.get("ord", "nota"));
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState(null);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  // ---------- login ----------
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data } = sb.auth.onAuthStateChange((_ev, s) => setSessao(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // ---------- dados ----------
  const carregar = useCallback(async () => {
    setCarregando(true);
    const todos = [];
    for (let de = 0; ; de += 1000) {
      const { data, error } = await sb.from("candidaturas").select(LISTA_COLS).range(de, de + 999);
      if (error) { setErro(error.message); setCarregando(false); return; }
      todos.push(...data.filter((x) => x.vaga));
      if (data.length < 1000) break;
    }
    const { data: ex } = await sb.from("execucoes")
      .select("ciclo,terminado_em,sucesso,novas_aprovadas,erros")
      .order("ciclo", { ascending: false }).limit(1);
    setItens(todos);
    setUltima((ex && ex[0]) || null);
    setErro("");
    setAtualizadoEm(new Date());
    setCarregando(false);
  }, []);

  const logado = !!sessao;
  useEffect(() => { if (logado) carregar(); }, [logado, carregar]);

  // atualiza sozinho: ao voltar para a pagina e a cada RECARREGAR_MIN minutos (nunca com o detalhe aberto)
  useEffect(() => {
    if (!logado) return;
    const f = () => { if (document.visibilityState === "visible" && !aberta) carregar(); };
    document.addEventListener("visibilitychange", f);
    const t = setInterval(f, RECARREGAR_MIN * 60000);
    return () => { document.removeEventListener("visibilitychange", f); clearInterval(t); };
  }, [logado, aberta, carregar]);

  // ---------- avisos ----------
  function avisar(msg, desfazer) {
    clearTimeout(timer.current);
    setToast({ msg, desfazer });
    timer.current = setTimeout(() => setToast(null), desfazer ? 7000 : 3500);
  }

  async function gravar(chave, patch) {
    const { data, error } = await sb.from("candidaturas").update(patch).eq("chave_unica", chave).select(CAND_COLS);
    if (error || !data || !data.length) {
      avisar("Não foi possível salvar" + (error ? ": " + error.message : " (sem permissão)"));
      return null;
    }
    setItens((lista) => lista.map((x) => (x.chave_unica === chave ? { ...x, ...data[0] } : x)));
    return data[0];
  }

  // muda a situacao (e o que mais vier em extra); silencioso = sem "Desfazer"
  async function mudar(it, novo, extra = {}, silencioso = false) {
    const antes = { status: it.status, data_inscricao: it.data_inscricao, inscrito_por: it.inscrito_por, observacoes: it.observacoes, etapa: it.etapa };
    const patch = { ...extra, status: novo };
    // marcou "Inscrito": ja entra em "Em analise" e guarda a data da inscricao
    if (["inscrita", "em_analise"].includes(novo) && !it.data_inscricao && !("data_inscricao" in extra)) {
      patch.data_inscricao = new Date().toISOString();
      patch.inscrito_por = it.inscrito_por || "voce";
    }
    const ok = await gravar(it.chave_unica, patch);
    if (!ok) return false;
    if (silencioso) avisar("Candidatura salva");
    else if (novo !== antes.status)
      avisar(`“${it.vaga.titulo}” → ${STATUS[novo]}`, async () => {
        if (await gravar(it.chave_unica, antes)) avisar("Desfeito");
      });
    return true;
  }

  // ---------- listas ----------
  const porSit = useMemo(() => {
    const r = {};
    for (const k in SITUACOES) r[k] = itens.filter(SITUACOES[k].f);
    return r;
  }, [itens]);
  const anos = useMemo(() => anosDasVagas(itens), [itens]);
  const itensPeriodo = useMemo(() => noPeriodo(itens, periodo), [itens, periodo]);
  const itensVisao = useMemo(() => aplicarSelecao(itensPeriodo, periodo, selVisao), [itensPeriodo, periodo, selVisao]);
  const localidades = useMemo(() => unicos(itens.map((i) => fLocal(i.vaga))), [itens]);
  const modelos = useMemo(() => unicos(itens.map((i) => fModalidade(i.vaga.modalidade) || "Não informado")), [itens]);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let a = aba === "vagas" ? porSit[sit] || [] : itens.filter(ABAS.candidaturas);
    if (aba === "vagas" && rec !== "todas") a = a.filter((i) => i.vaga.match_recomendacao === rec);
    if (loc !== "todas") a = a.filter((i) => fLocal(i.vaga) === loc);
    if (mod !== "todos") a = a.filter((i) => (fModalidade(i.vaga.modalidade) || "Não informado") === mod);
    if (q) a = a.filter((i) => `${i.vaga.titulo || ""} ${i.vaga.empresa || ""}`.toLowerCase().includes(q));
    return [...a].sort(ORDENS[ordem] || ORDENS.nota);
  }, [itens, porSit, aba, sit, rec, loc, mod, busca, ordem]);

  const escolher = (setter, chave) => (valor) => { setter(valor); guardar.set(chave, valor); };
  const escolherAba = escolher(setAba, "tab");
  const escolherRec = escolher(setRec, "rec");
  const escolherOrdem = escolher(setOrdem, "ord");

  // ---------- telas ----------
  if (sessao === undefined) return null;
  if (!sessao) return <Login />;

  const linha = (it) => <VagaLinha key={it.chave_unica} it={it} onMudar={mudar} onAbrir={setAberta} />;
  const filtrando = busca.trim() || (aba === "vagas" && rec !== "todas") || loc !== "todas" || mod !== "todos";
  const vazio = filtrando
    ? "Nada encontrado com esses filtros."
    : aba === "candidaturas" ? "Nenhuma candidatura ainda. Depois de se candidatar na Gupy, clique em “Inscrito” na vaga."
    : { avaliar: "Nenhuma vaga esperando avaliação.", eliminadas: "Nenhuma vaga eliminada.", encerradas: "Nenhuma vaga encerrada antes de você decidir.", descartadas: "Nenhuma vaga descartada." }[sit];
  const limpar = () => { setBusca(""); escolherRec("todas"); setLoc("todas"); setMod("todos"); };
  const itemAberto = aberta && itens.find((x) => x.chave_unica === aberta.chave_unica);

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <div className="brand"><h1 aria-label="Garimpo"><Logo /></h1></div>
          <nav className="tabs" role="tablist">
            {ROTULO_ABAS.map(([k, rotulo]) => (
              <button key={k} className="tab" role="tab" type="button" aria-selected={aba === k} onClick={() => escolherAba(k)}>
                {rotulo}
              </button>
            ))}
          </nav>
          <div className="who">
            <span className={"live" + (carregando ? " on" : "")}
              title={`Atualiza sozinho a cada ${RECARREGAR_MIN} minutos` + (ultima ? ` · última coleta do robô: ${new Date(ultima.terminado_em || ultima.ciclo).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : "")}>
              <i /><span>{carregando ? "Atualizando…" : atualizadoEm ? "Atualizado às " + atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
            </span>
            <div className="menu">
              <button className="avatar" type="button" aria-label="Conta" aria-expanded={menu} onClick={() => setMenu(!menu)}>
                {(sessao.user.email || "?")[0].toUpperCase()}
              </button>
              {menu && (
                <div className="menu-pop">
                  <p>{sessao.user.email}</p>
                  <button className="btn ghost" type="button" onClick={() => { setMenu(false); sb.auth.signOut(); }}>Sair</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* numeros sempre no mesmo lugar; na Visao geral seguem o periodo e os filtros dos graficos */}
      <Resumo itens={aba === "visao" ? itensVisao : itens} />

      <main className="wrap" onClick={() => menu && setMenu(false)}>
        {aba === "visao" ? (
          erro ? <p className="empty" style={{ marginTop: 16 }}>Erro ao carregar: {erro}</p>
          : <VisaoGeral itens={itensPeriodo} periodo={periodo} anos={anos}
            sel={selVisao} setSel={setSelVisao}
            onPeriodo={(p) => { setPeriodo(p); guardar.set("periodo", p); setSelVisao((s) => ({ ...s, tempo: null })); }} onAbrir={setAberta} />
        ) : (<>
        <div className="bar">
          {(aba === "vagas" || filtrando) && <div className="bar-top">
            {aba === "vagas" ? (
              <div className="chips" role="group" aria-label="Situação">
                {Object.entries(SITUACOES).map(([k, x]) => (
                  <button key={k} className="chip" type="button" aria-pressed={sit === k} onClick={() => setSit(k)}>
                    {x.nome}<b className="n">{(porSit[k] || []).length}</b>
                  </button>
                ))}
              </div>
            ) : <span />}
            {filtrando && <button className="btn sm soft" type="button" onClick={limpar}>✕ Limpar filtros</button>}
          </div>}
          <div className={"filtros" + (aba === "candidaturas" ? " f3" : "")}>
            <label className="busca">Buscar
              <input type="search" placeholder="Cargo ou empresa" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </label>
            {aba === "vagas" && <label>Recomendação
              <select value={rec} onChange={(e) => escolherRec(e.target.value)}>
                <option value="todas">Todas</option>
                {Object.entries(REC).filter(([k]) => k !== "eliminado").map(([k, n]) => <option key={k} value={k}>{n}</option>)}
              </select>
            </label>}
            <label>Localidade
              <select value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option value="todas">Todas</option>
                {localidades.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label>Modelo de trabalho
              <select value={mod} onChange={(e) => setMod(e.target.value)}>
                <option value="todos">Todos</option>
                {modelos.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            {aba === "vagas" && <label>Ordenar por
              <select value={ordem} onChange={(e) => escolherOrdem(e.target.value)}>
                <option value="nota">Maior nota</option>
                <option value="data">Mais recentes</option>
                <option value="prazo">Prazo mais próximo</option>
              </select>
            </label>}
          </div>
        </div>

        <div className="lista" aria-live="polite">
          {erro && <p className="empty">Erro ao carregar: {erro}</p>}
          {!erro && carregando && !itens.length && <p className="empty">Carregando…</p>}
          {!erro && !carregando && !visiveis.length && <p className="empty">{vazio}</p>}
          {aba === "candidaturas" && visiveis.length > 0
            ? <Kanban itens={visiveis} onMudar={mudar} onAbrir={setAberta} />
            : visiveis.map(linha)}
        </div>
        </>)}
      </main>

      {itemAberto && (
        <Detalhe
          it={itemAberto}
          onFechar={() => setAberta(null)}
          onSalvar={(it, status, extra) => mudar(it, status, extra, true)}
          aviso={<Aviso aviso={toast} onFechar={() => setToast(null)} />}
        />
      )}

      {!itemAberto && <Aviso aviso={toast} onFechar={() => setToast(null)} />}
    </>
  );
}
