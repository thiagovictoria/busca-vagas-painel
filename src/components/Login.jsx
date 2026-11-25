import { useState } from "react";
import { sb } from "../config.js";
import { Simbolo } from "./Logo.jsx";
import Garimpeiro from "./Garimpeiro.jsx";

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
          {/* o simbolo e o proprio "g": logo + "arimpo" = garimpo */}
          <h1 className="login-marca" aria-label="garimpo"><Simbolo destaque /><span aria-hidden="true">arimpo</span></h1>
          <p>Encontre as vagas que <b>combinam com você</b>.</p>
        </div>
        <Garimpeiro />
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
