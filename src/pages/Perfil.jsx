import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Perfil() {
  const { user, logout, scoreError, pendingScore } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      alert('Não foi possível sair da conta.')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">🌻</div>

        <h1>Gardenia</h1>
        <h2>Minha conta</h2>

        <p>
          Bem-vindo, {user.user_metadata?.display_name}!
        </p>

        <p>
          Você está autenticado no Gardenia.
        </p>

        {pendingScore !== null && (
          <p>Sua pontuação está aguardando o envio.</p>
        )}

        {scoreError && (
          <p className="form-error">{scoreError}</p>
        )}

        <button
          className="auth-button"
          onClick={handleLogout}
        >
          Sair da conta
        </button>

        <Link to="/jogo">
          Voltar ao jardim
        </Link>
      </section>
    </main>
  )
}

export default Perfil