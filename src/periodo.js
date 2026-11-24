// Periodo da Visao geral: ultimos 7 ou 30 dias, ou um ano inteiro (por mes)
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const dd = (n) => String(n).padStart(2, "0");

export const dataVista = (it) => new Date(it.vaga.primeiro_visto_em || it.vaga.publicado_em);

// Categorias do grafico conforme o periodo: dias (14 ou 30) ou os 12 meses de um ano
export function montarPeriodo(periodo) {
  if (periodo === "7" || periodo === "30") {
    const n = Number(periodo);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const cats = Array.from({ length: n }, (_, i) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() - (n - 1 - i));
      return {
        rotulo: String(d.getDate()),
        grupo: `${MESES[d.getMonth()]}/${d.getFullYear()}`,
        dica: `${dd(d.getDate())}/${dd(d.getMonth() + 1)}/${d.getFullYear()} (${SEMANA[d.getDay()]})`,
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
    dica: `${m}/${ano}`,
    valores: {},
  }));
  const indice = (dt) => (dt.getFullYear() === ano ? dt.getMonth() : -1);
  return { cats, indice, titulo: "por mês" };
}

export const nomePeriodo = (p) => ({ "7": "últimos 7 dias", "30": "últimos 30 dias" }[p] || p);
export const anosDasVagas = (itens) => [...new Set(itens.map((i) => dataVista(i).getFullYear()))].sort((a, b) => b - a);
// filtra as vagas que caem no periodo
export function noPeriodo(itens, periodo) {
  const { indice } = montarPeriodo(periodo);
  return itens.filter((i) => indice(dataVista(i)) >= 0);
}
