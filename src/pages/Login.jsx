
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'

import fundoLogin from '../assets/fundo-login.png'
import placaLogin from '../assets/placa-login.png'

const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string().min(1, 'Digite sua senha.')
})

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setErrors({})
    setMessage('')

    const result = loginSchema.safeParse({
      email,
      password
    })

    if (!result.success) {
      const fieldErrors = {}

      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })

      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/jogo')
    } catch (error) {
      setMessage('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="login-scene"
      style={{ backgroundImage: `url(${fundoLogin})` }}
    >

      <section className="login-container">

        {/* Placa Gardenia */}
        <img
          src={placaLogin}
          alt="Gardenia"
          className="login-sign"
        />

        {/* Formulário */}
        <div className="login-content">

          <h2>Bem-vindo de volta!</h2>

          <div className="login-divider">
            <span></span>
            <span className="divider-leaf">◆</span>
            <span></span>
          </div>

          <form onSubmit={handleSubmit}>

            {/* E-mail */}
            <div className="login-input-group">
              <span className="input-icon">✉</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                aria-label="E-mail"
              />
            </div>

            {errors.email && (
              <small className="login-error">
                {errors.email}
              </small>
            )}

            {/* Senha */}
            <div className="login-input-group">
              <span className="input-icon">🔒</span>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                aria-label="Senha"
              />
            </div>

            {errors.password && (
              <small className="login-error">
                {errors.password}
              </small>
            )}

            {/* Recuperação de senha */}
            <div className="forgot-password">
              <Link to="/recuperar-senha">
                Esqueceu sua senha?
              </Link>
            </div>

            {message && (
              <p className="login-error">
                {message}
              </p>
            )}

            {/* Entrar */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              <span>🌱</span>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Separador */}
            <div className="login-or">
              <span></span>
              ou
              <span></span>
            </div>

            {/* Criar conta */}
            <Link
              to="/cadastro"
              className="register-button"
            >
              <span>♟</span>
              Criar conta
            </Link>

          </form>

        </div>

      </section>
    </main>
  )
}

export default Login
