import { useState } from "react";
import { sb } from "../config.js";
import { Pepita, Simbolo } from "./Logo.jsx";

// Ilustracao: a bateia vista de cima — circulos na agua, graos de areia e uma pepita no centro (o achado)
function Arte() {
  const aneis = [150, 122, 96, 72, 50];
  // graos de areia espalhados (fixos, para a imagem nao mudar a cada visita)
  const graos = [
    [-118, -40, 2.2], [-96, 58, 1.6], [-70, -96, 1.8], [-40, 104, 2.4], [-128, 20, 1.4], [-20, -126, 1.6],
    [30, 118, 1.8], [62, -104, 2.2], [98, 64, 1.6], [120, -30, 2.4], [132, 18, 1.4], [84, -70, 1.8],
    [-58, 30, 1.4], [44, 40, 1.6], [-30, -58, 1.8], [52, -36, 1.4], [-84, -62, 1.6], [8, 76, 1.4],
  ];
  return (
    <svg viewBox="-170 -170 340 340" aria-hidden="true" className="bateia">
      <circle r="160" fill="#123a30" />
      {aneis.map((r, i) => (
        <circle key={r} r={r} fill="none" stroke="#f3ecdc" strokeOpacity={0.07 + i * 0.03} strokeWidth="1.5"
          strokeDasharray={i % 2 ? "4 10" : undefined} />
      ))}
      {graos.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#c9bfa8" opacity=".55" />)}
      <circle r="34" fill="#e0ac3f" opacity=".12" />
      <Pepita k={3.1} giro={-10} />
      <Pepita x={-92} y={-18} k={0.9} giro={20} />
      <Pepita x={74} y={88} k={0.7} giro={-30} />
      <path d="M30-46c.7 4 2.3 5.6 6.3 6.3-4 .7-5.6 2.3-6.3 6.3-.7-4-2.3-5.6-6.3-6.3 4-.7 5.6-2.3 6.3-6.3z" fill="#fff4d6" />
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
          <div className="login-marca"><Simbolo tamanho={56} fundo="#163d33" /><h1>garimpo</h1></div>
          <p>Garimpe as vagas que <b>combinam com você</b>.</p>
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
