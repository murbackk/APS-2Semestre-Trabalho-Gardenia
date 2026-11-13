import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'

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
      navigate('/perfil')
    } catch (error) {
      setMessage('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="back-link">
        ← Voltar
      </Link>

      <section className="auth-card">
        <div className="auth-icon">🌱</div>

        <h1>Gardenia</h1>
        <h2>Bem-vindo!</h2>

        <p>
          Entre na sua conta para
          <br />
          cuidar do seu jardim.
        </p>

        <form onSubmit={handleSubmit}>
          <label>E-mail</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
          />

          {errors.email && (
            <small className="form-error">
              {errors.email}
            </small>
          )}

          <label>Senha</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />

          {errors.password && (
            <small className="form-error">
              {errors.password}
            </small>
          )}

          {message && (
            <p className="form-error">{message}</p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
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