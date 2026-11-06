import { Link } from 'react-router-dom'

function Cadastro() {
  return (
    <main className="auth-page">

      <Link to="/" className="back-link">
        ← Voltar
      </Link>

      <section className="auth-card">

        <div className="auth-icon">🌷</div>

        <h1>Gardenia</h1>

        <h2>Crie sua conta!</h2>

        <p>Comece a cultivar seu próprio jardim.</p>

        <form>
          <label>Nome de usuário</label>
          <input
            type="text"
            placeholder="Escolha um usuário"
          />

          <label>E-mail</label>
          <input
            type="email"
            placeholder="Digite seu e-mail"
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Crie uma senha"
          />

          <button type="button" className="auth-button">
            Criar conta
          </button>
        </form>

        <p className="switch-page">
          Já tem uma conta?
          <Link to="/login"> Login</Link>
        </p>

      </section>
    </main>
  )
}

export default Cadastro