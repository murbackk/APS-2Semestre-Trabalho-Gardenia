
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'

import fundoLogin from '../assets/fundo-login.png'
import placaLogin from '../assets/placa-login.png'

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
    <main
      className="login-scene"
      style={{ backgroundImage: `url(${fundoLogin})` }}
    >
      <section className="login-container">

        <img
          src={placaLogin}
          alt="Placa do Gardenia"
          className="login-sign"
        />

        <div className="login-content cadastro-content">

          <h2>Crie sua conta!</h2>

          <div className="login-divider">
            <span></span>
            <span className="divider-leaf">❧</span>
            <span></span>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="login-input-group">
              <span className="input-icon">🌷</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome para o ranking"
              />
            </div>

            {errors.displayName && (
              <small className="login-error">
                {errors.displayName}
              </small>
            )}

            <div className="login-input-group">
              <span className="input-icon">✉</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>

            {errors.email && (
              <small className="login-error">
                {errors.email}
              </small>
            )}

            <div className="login-input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
              />
            </div>

            {errors.password && (
              <small className="login-error">
                {errors.password}
              </small>
            )}

            {message && (
              <p className="login-error">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>

          </form>

          <div className="login-or">
            ou
          </div>

          <Link to="/login" className="register-button">
            Já tenho uma conta
          </Link>

        </div>
      </section>
    </main>
  )
}

export default Cadastro
