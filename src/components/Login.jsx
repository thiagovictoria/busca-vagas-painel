import { useState } from "react";
import { sb } from "../config.js";

// Ilustracao: colunas subindo com um anel de nota, no clima do painel
function Arte() {
  const cols = [38, 62, 48, 86, 70, 104, 92, 132];
  return (
    <svg viewBox="0 0 520 220" aria-hidden="true">
      <line x1="0" x2="520" y1="200" y2="200" stroke="rgba(255,255,255,.25)" />
      {cols.map((h, i) => (
        <rect key={i} x={20 + i * 46} y={200 - h} width="24" height={h} rx="4"
          fill={i === cols.length - 1 ? "#e6f5c8" : "rgba(230,245,200,.28)"} />
      ))}
      <g transform="translate(440 64)">
        <circle r="44" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="9" />
        <circle r="44" fill="none" stroke="#e6f5c8" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 44 * 0.92} 999`} transform="rotate(-90)" />
        <text y="10" textAnchor="middle" fill="#fff" style={{ font: "700 28px 'Inter Tight', sans-serif" }}>92</text>
      </g>
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
          <h1>Busca de vagas</h1>
          <p>As vagas certas, avaliadas e acompanhadas num só lugar.</p>
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
