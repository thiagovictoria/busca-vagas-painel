const dt = (s) => (s ? new Date(s) : null);

export const fData = (s) =>
  s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

export const fHora = (s) =>
  s ? new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export function fRel(s) {
  const d = dt(s);
  if (!d) return "—";
  const h = (Date.now() - d) / 36e5;
  if (h < 1) return "há " + Math.max(1, Math.round(h * 60)) + " min";
  if (h < 24) return "há " + Math.round(h) + " h";
  const dias = Math.round(h / 24);
  return dias === 1 ? "ontem" : "há " + dias + " dias";
}

const brl = (n) => "R$ " + Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export function fSal(v) {
  if (v.salario_min && v.salario_max)
    return v.salario_min === v.salario_max
      ? brl(v.salario_min)
      : brl(v.salario_min) + " a " + brl(v.salario_max).replace("R$ ", "");
  if (v.salario_max) return "até " + brl(v.salario_max);
  if (v.salario_min) return "a partir de " + brl(v.salario_min);
  return v.salario_label || "Salário não informado";
}


const MODALIDADE = { remote: "Remoto", hybrid: "Híbrido", "on-site": "Presencial", onsite: "Presencial", presencial: "Presencial" };
export const fModalidade = (m) => (m ? MODALIDADE[String(m).toLowerCase()] || m : "");

// "Rio de Janeiro / RJ"; vaga remota sem cidade vira "Remoto"
export const fLocal = (v) =>
  [v.cidade, v.estado].filter(Boolean).join(" / ") || (fModalidade(v.modalidade) === "Remoto" ? "Qualquer lugar" : "Local não informado");

export const diaCurto = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export const ms = (s) => (s ? new Date(s).getTime() : 0);

// localStorage pode nao existir (modo privado): nunca quebrar por isso
export const guardar = {
  get(k, padrao) {
    try {
      return localStorage.getItem("painel." + k) ?? padrao;
    } catch {
      return padrao;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("painel." + k, v);
    } catch {
      /* sem armazenamento */
    }
  },
};
