import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'

const cadastroSchema = z.object({
  displayName: z.string()
    .trim()
    .min(3, 'O nome precisa ter pelo menos 3 caracteres.')
    .max(20, 'O nome pode ter no máximo 20 caracteres.'),

  email: z.string()
    .email('Digite um e-mail válido.'),

  password: z.string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
})

function Cadastro() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setErrors({})
    setMessage('')

    const result = cadastroSchema.safeParse({
      displayName,
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
      const data = await register(
        email,
        password,
        displayName.trim()
      )

      if (data.session) {
        navigate('/perfil')
      } else {
        setMessage(
          'Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.'
        )
      }
    } catch (error) {
      setMessage(
        error.message === 'User already registered'
          ? 'Este e-mail já está cadastrado.'
          : 'Não foi possível criar a conta. Verifique os dados.'
      )
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
        <div className="auth-icon">🌷</div>

        <h1>Gardenia</h1>
        <h2>Crie sua conta!</h2>

        <p>Comece a cultivar seu próprio jardim.</p>

        <form onSubmit={handleSubmit}>
          <label>Nome para o ranking</label>

          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Escolha seu nome"
          />

          {errors.displayName && (
            <small className="form-error">
              {errors.displayName}
            </small>
          )}

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
            placeholder="Crie uma senha"
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
            {loading ? 'Criando conta...' : 'Criar conta'}
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