import { createClient } from "@supabase/supabase-js";

// Chave publicavel: feita para ficar em paginas publicas. Os dados so saem com login (RLS).
const SB_URL = "https://mjayohnvehotudjdmbwt.supabase.co";
const SB_KEY = "sb_publishable_RabLRPw9lUqaIc8QmcJVbA_5oXXYEHj";

export const sb = createClient(SB_URL, SB_KEY);

export const STATUS = {
  nova: "Para avaliar",
  aprovada: "Quero me inscrever",
  inscrita: "Inscrito",
  em_analise: "Em análise",
  case: "Teste",
  entrevista: "Entrevista",
  proposta: "Proposta",
  contratado: "Contratado",
  descartada: "Descartada",
  reprovado: "Não avançou",
  sem_retorno: "Sem retorno",
};
export const PIPE = ["aprovada", "inscrita", "em_analise", "case", "entrevista", "proposta", "contratado"];
export const EM_PROCESSO = ["inscrita", "em_analise", "case", "entrevista", "proposta"];
export const FIM = ["descartada", "reprovado", "sem_retorno"];
export const GRUPOS_CAND = [...PIPE, "reprovado", "sem_retorno"];
// Etapas do kanban de candidaturas (poucas, de proposito). Situacoes antigas caem na etapa equivalente.
export const ETAPAS_KANBAN = ["em_analise", "case", "entrevista", "contratado", "reprovado"];
export const NOME_ETAPA = { em_analise: "Em análise", case: "Teste", entrevista: "Entrevista", contratado: "Contratado", reprovado: "Não avançou" };
export const colunaKanban = (status) =>
  ({ aprovada: "em_analise", inscrita: "em_analise", em_analise: "em_analise", case: "case", entrevista: "entrevista",
     proposta: "entrevista", contratado: "contratado", reprovado: "reprovado", sem_retorno: "reprovado" })[status] || null;
// escolhas no detalhe da vaga: voltar para avaliar, as etapas do kanban ou descartar
export const ESCOLHAS_STATUS = ["nova", ...ETAPAS_KANBAN, "descartada"];
// ate que etapa cada situacao chegou (reprovado e sem retorno: ao menos inscrito)
export const ETAPA = { nova: 0, descartada: 0, aprovada: 1, inscrita: 2, reprovado: 2, sem_retorno: 2, em_analise: 3, case: 4, entrevista: 4, proposta: 5, contratado: 6 };
export const REC = { candidatar: "Candidatar", avaliar: "Avaliar", pular: "Pular", eliminado: "Eliminado" };
// cores validadas para daltonismo (claro e escuro), definidas em styles.css
export const COR_REC = { candidatar: "var(--s1)", avaliar: "var(--s2)", pular: "var(--s3)", eliminado: "var(--s4)" };
export const SERIES_REC = Object.keys(REC).map((k) => ({ k, nome: REC[k], cor: COR_REC[k] }));
export const CRIT = {
  tecnico: ["Técnico", 35],
  area: ["Área", 25],
  senioridade: ["Senioridade", 15],
  requisitos: ["Requisitos", 15],
  local: ["Local", 10],
};

export const CAND_COLS = "chave_unica,status,etapa,inscrito_por,data_inscricao,observacoes,atualizado_em";
export const LISTA_COLS =
  CAND_COLS +
  ",vaga:vagas(titulo,empresa,cidade,estado,modalidade,tipo_contrato,salario_label,salario_min,salario_max," +
  "publicado_em,prazo_inscricao,link,senioridade_titulo,encerrada_na_plataforma,encerrada_detectada_em,primeiro_visto_em," +
  "nota_match,motivo_match,match_criterios,match_pontos_fortes,match_lacunas,match_recomendacao,match_eliminatorio," +
  "match_perfil_versao,match_modelo,match_avaliado_em)";

export const encerrada = (it) => !!it.vaga.encerrada_na_plataforma;
const eliminada = (it) => it.vaga.match_recomendacao === "eliminado";

// Situacao de cada vaga que ainda nao virou candidatura (os grupos nao se sobrepoem)
export const SITUACOES = {
  avaliar: { nome: "Para avaliar", f: (it) => it.status === "nova" && !encerrada(it) && !eliminada(it) },
  eliminadas: { nome: "Eliminadas", f: (it) => it.status === "nova" && !encerrada(it) && eliminada(it) },
  encerradas: { nome: "Encerradas", f: (it) => it.status === "nova" && encerrada(it) },
  descartadas: { nome: "Descartadas", f: (it) => it.status === "descartada" },
};
export const ABAS = {
  vagas: (it) => it.status === "nova" || it.status === "descartada",
  candidaturas: (it) => GRUPOS_CAND.includes(it.status),
};
