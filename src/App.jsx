import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ABAS, CAND_COLS, LISTA_COLS, PIPE, REC, STATUS, sb } from "./config.js";
import { guardar, ms } from "./format.js";
import Login from "./components/Login.jsx";
import Resumo from "./components/Resumo.jsx";
import VagaLinha from "./components/VagaLinha.jsx";
import Detalhe from "./components/Detalhe.jsx";
import Aviso from "./components/Aviso.jsx";
import VisaoGeral from "./components/VisaoGeral.jsx";

const ORDENS = {
  nota: (x, y) => (y.vaga.nota_match ?? -1) - (x.vaga.nota_match ?? -1) || ms(y.vaga.publicado_em) - ms(x.vaga.publicado_em),
  data: (x, y) => ms(y.vaga.publicado_em) - ms(x.vaga.publicado_em),
  prazo: (x, y) => (x.vaga.prazo_inscricao || "9999").localeCompare(y.vaga.prazo_inscricao || "9999"),
};
const ROTULO_ABAS = [["visao", "Visão geral"], ["avaliar", "Para avaliar"], ["candidaturas", "Candidaturas"], ["arquivo", "Arquivo"]];
const RECARREGAR_MIN = 5; // busca dados novos sozinho a cada 5 minutos

function Marca() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <rect width="30" height="30" rx="8" fill="#e6f5c8" />
      <rect x="7" y="15" width="4" height="8" rx="1.5" fill="#00463c" />
      <rect x="13" y="11" width="4" height="12" rx="1.5" fill="#00463c" />
      <rect x="19" y="7" width="4" height="16" rx="1.5" fill="#00463c" />
    </svg>
  );
}

export default function App() {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda verificando
  const [itens, setItens] = useState([]);
  const [ultima, setUltima] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState(guardar.get("tab", "visao"));
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [menu, setMenu] = useState(false);
  const [rec, setRec] = useState(guardar.get("rec", "todas"));
  const [ordem, setOrdem] = useState(guardar.get("ord", "nota"));
  const [verElim, setVerElim] = useState(guardar.get("elim", "0") === "1");
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
    if (novo === "inscrita" && !it.data_inscricao && !("data_inscricao" in extra)) {
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
  const paraAvaliarTodas = useMemo(() => itens.filter(ABAS.avaliar), [itens]);
  const paraAvaliar = paraAvaliarTodas.filter((i) => i.vaga.match_recomendacao !== "eliminado");
  const nEliminadas = paraAvaliarTodas.length - paraAvaliar.length;
  const contagem = {
    visao: null,
    avaliar: paraAvaliar.length,
    candidaturas: itens.filter(ABAS.candidaturas).length,
    arquivo: itens.filter(ABAS.arquivo).length,
  };

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let a = itens.filter(ABAS[aba] || ABAS.avaliar);
    if (aba === "avaliar") {
      if (!verElim) a = a.filter((i) => i.vaga.match_recomendacao !== "eliminado");
      if (rec !== "todas") a = a.filter((i) => i.vaga.match_recomendacao === rec);
    }
    if (q) a = a.filter((i) => `${i.vaga.titulo || ""} ${i.vaga.empresa || ""}`.toLowerCase().includes(q));
    return [...a].sort(ORDENS[ordem] || ORDENS.nota);
  }, [itens, aba, rec, verElim, busca, ordem]);

  const escolher = (setter, chave) => (valor) => { setter(valor); guardar.set(chave, valor); };
  const escolherAba = escolher(setAba, "tab");
  const escolherRec = escolher(setRec, "rec");
  const escolherOrdem = escolher(setOrdem, "ord");

  // ---------- telas ----------
  if (sessao === undefined) return null;
  if (!sessao) return <Login />;

  const linha = (it) => <VagaLinha key={it.chave_unica} it={it} onMudar={mudar} onAbrir={setAberta} />;
  const vazio = busca.trim()
    ? "Nada encontrado para essa busca."
    : aba === "avaliar" ? "Nenhuma vaga esperando avaliação."
    : aba === "candidaturas" ? "Nenhuma candidatura ainda. Marque vagas como “Quero me inscrever” na aba Para avaliar."
    : "Nada arquivado.";
  const itemAberto = aberta && itens.find((x) => x.chave_unica === aberta.chave_unica);

  return (
    <>
      <header className="band">
        <div className="wrap">
          <div className="top">
            <div className="brand"><Marca /><h1>Busca de vagas</h1></div>
            <div className="who">
              <span className={"live" + (carregando ? " on" : "")} title={`Atualiza sozinho a cada ${RECARREGAR_MIN} minutos`}>
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
          <Resumo itens={itens} ultima={ultima} paraAvaliar={paraAvaliar} />
          <nav className="tabs" role="tablist">
            {ROTULO_ABAS.map(([k, rotulo]) => (
              <button key={k} className="tab" role="tab" type="button" aria-selected={aba === k} onClick={() => escolherAba(k)}>
                {rotulo}{contagem[k] != null && <i>{contagem[k]}</i>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="wrap" onClick={() => menu && setMenu(false)}>
        {aba === "visao" ? (
          erro ? <p className="empty" style={{ marginTop: 16 }}>Erro ao carregar: {erro}</p>
          : <VisaoGeral itens={itens} onAbrir={setAberta} />
        ) : (<>
        <div className="bar">
          <input type="search" placeholder="Buscar por cargo ou empresa" aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {aba === "avaliar" && (
            <div className="chips">
              {["todas", "candidatar", "avaliar", "pular"].map((r) => (
                <button key={r} className="chip" type="button" aria-pressed={rec === r} onClick={() => escolherRec(r)}>
                  {r === "todas" ? "Todas" : REC[r]}
                </button>
              ))}
            </div>
          )}
          <select aria-label="Ordenar" value={ordem} onChange={(e) => escolherOrdem(e.target.value)}>
            <option value="nota">Maior nota</option>
            <option value="data">Mais recentes</option>
            <option value="prazo">Prazo mais próximo</option>
          </select>
          {aba === "avaliar" && (
            <label className="chk">
              <input type="checkbox" checked={verElim} onChange={(e) => { setVerElim(e.target.checked); guardar.set("elim", e.target.checked ? "1" : "0"); }} />
              Mostrar eliminadas ({nEliminadas})
            </label>
          )}
        </div>

        <div className="lista" aria-live="polite">
          {erro && <p className="empty">Erro ao carregar: {erro}</p>}
          {!erro && carregando && !itens.length && <p className="empty">Carregando…</p>}
          {!erro && !carregando && !visiveis.length && <p className="empty">{vazio}</p>}
          {aba === "candidaturas"
            ? PIPE.map((s) => {
                const grupo = visiveis.filter((i) => i.status === s);
                if (!grupo.length) return null;
                return (
                  <div key={s} style={{ display: "grid", gap: 10 }}>
                    <h3 className="group"><b>{STATUS[s]}</b>{grupo.length}</h3>
                    {grupo.map(linha)}
                  </div>
                );
              })
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
