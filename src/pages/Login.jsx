import { Link } from 'react-router-dom'

function Login() {
  return (
    <main className="auth-page">

      <Link to="/" className="back-link">
        ← Voltar
      </Link>

      <section className="auth-card">

        <div className="auth-icon">🌱</div>

        <h1>Gardenia</h1>

        <h2>Bem-vindo!</h2>

        <p>Entre na sua conta para<br />
          cuidar do seu jardim.
        </p>

        <form>
          <label>Usuário</label>
          <input
            type="text"
            placeholder="Digite seu usuário"
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
          />

          <button type="button" className="auth-button">
            Entrar
          </button>
        </form>

        <p className="switch-page">
          Ainda não tem conta?
          <Link to="/cadastro"> Criar conta</Link>
        </p>

      </section>
    </main>
  )
}

export default Login