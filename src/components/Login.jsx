import { useState } from "react";
import { sb } from "../config.js";
import { Simbolo } from "./Logo.jsx";

// Ilustracao: o garimpo. Muitas pedras cinzas (o cascalho) e poucas pepitas de ouro (as vagas que combinam)
function Arte() {
  // [x, y, raio, ouro?]
  const pedras = [
    [40, 178, 14], [78, 190, 10], [112, 172, 17], [150, 192, 9], [182, 176, 13], [222, 188, 11], [258, 170, 16],
    [298, 190, 10], [332, 176, 14], [372, 188, 9], [404, 172, 15], [444, 190, 11], [478, 178, 13],
    [60, 150, 9], [134, 140, 8], [204, 150, 10], [316, 146, 8], [388, 140, 9], [458, 150, 8],
  ];
  const pepitas = [[240, 118, 30], [96, 96, 14], [420, 92, 18]];
  const facetada = (cx, cy, r) => {
    const p = (a, k = 1) => [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k].map((n) => n.toFixed(1)).join(" ");
    const v = [-2.6, -1.7, -0.6, 0.4, 1.3, 2.2].map((a, i) => p(a, i % 2 ? 0.92 : 1.05));
    return { todo: `M${v.join("L")}Z`, luz: `M${v[0]}L${v[1]}L${v[2]}L${cx} ${cy}Z`, sombra: `M${v[2]}L${v[3]}L${v[4]}L${cx} ${cy}Z` };
  };
  return (
    <svg viewBox="0 0 520 220" aria-hidden="true">
      {pedras.map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.78} fill="#2a2b31" />)}
      {pepitas.map(([x, y, r], i) => {
        const f = facetada(x, y, r);
        return (
          <g key={i}>
            <path d={f.todo} fill="#e8a314" />
            <path d={f.luz} fill="#ffd36b" />
            <path d={f.sombra} fill="#c7850a" />
          </g>
        );
      })}
      <path d="M276 72c.8 4.6 2.6 6.4 7.2 7.2-4.6.8-6.4 2.6-7.2 7.2-.8-4.6-2.6-6.4-7.2-7.2 4.6-.8 6.4-2.6 7.2-7.2z" fill="#fff6d8" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEnviando(false);
    if (error) setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
    else setSenha("");
  }

  return (
    <div className="login">
      <section className="login-art">
        <div>
          <div className="login-marca"><Simbolo tamanho={56} fundo="#202127" /><h1>garimpo</h1></div>
          <p>Menos cascalho.<br />Mais vagas que <b>valem ouro</b>.</p>
        </div>
        <Arte />
      </section>
      <section className="login-form">
        <form onSubmit={entrar}>
          <h2>Entrar</h2>
          <label>
            E-mail
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          <button className="btn pri" type="submit" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
          <div className="err" role="alert">{erro}</div>
        </form>
      </section>
    </div>
  );
}
