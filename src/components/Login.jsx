import { useState } from "react";
import { sb } from "../config.js";

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
    <section id="login">
      <form onSubmit={entrar}>
        <h1>Painel de vagas</h1>
        <p>Entre com o usuário que você criou no Supabase (Authentication → Users).</p>
        <label>
          E-mail
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        <button className="btn pri" type="submit" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <div className="err" role="alert">{erro}</div>
      </form>
    </section>
  );
}
