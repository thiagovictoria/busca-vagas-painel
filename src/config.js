import { createClient } from "@supabase/supabase-js";

// Chave publicavel: feita para ficar em paginas publicas. Os dados so saem com login (RLS).
const SB_URL = "https://mjayohnvehotudjdmbwt.supabase.co";
const SB_KEY = "sb_publishable_RabLRPw9lUqaIc8QmcJVbA_5oXXYEHj";

export const sb = createClient(SB_URL, SB_KEY);

export const STATUS = {
  nova: "Nova",
  aprovada: "Quero me inscrever",
  inscrita: "Inscrita",
  em_analise: "Em análise",
  case: "Case",
  entrevista: "Entrevista",
  proposta: "Proposta",
  contratado: "Contratado",
  descartada: "Descartada",
  reprovado: "Reprovado",
  sem_retorno: "Sem retorno",
};
export const PIPE = ["aprovada", "inscrita", "em_analise", "case", "entrevista", "proposta", "contratado"];
export const EM_PROCESSO = ["inscrita", "em_analise", "case", "entrevista", "proposta"];
export const FIM = ["descartada", "reprovado", "sem_retorno"];
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
export const ABAS = {
  avaliar: (it) => it.status === "nova" && !encerrada(it),
  candidaturas: (it) => PIPE.includes(it.status),
  arquivo: (it) => FIM.includes(it.status) || (it.status === "nova" && encerrada(it)),
};
