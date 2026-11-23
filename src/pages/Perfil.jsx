import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import './Perfil.css';

const perfilSchema = z.object({
  displayName: z.string()
    .trim()
    .min(3, 'O nome precisa ter pelo menos 3 caracteres.')
    .max(20, 'O nome pode ter no máximo 20 caracteres.')
})

function Perfil() {
  const { user, logout, updateProfile, scoreError, pendingScore } = useAuth()
  const navigate = useNavigate()

  const nomeAtual = user?.user_metadata?.display_name || ''
  const [displayName, setDisplayName] = useState(nomeAtual)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const result = perfilSchema.safeParse({ displayName })

    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    if (result.data.displayName === nomeAtual) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await updateProfile(result.data.displayName)
      setDisplayName(result.data.displayName)
      setEditing(false)
      setMessage('Seu perfil foi atualizado com sucesso!')
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      setError('Não foi possível atualizar seu perfil. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDisplayName(nomeAtual)
    setError('')
    setMessage('')
    setEditing(false)
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/')
    } catch (err) {
      setError('Não foi possível sair da conta. Tente novamente.')
      setLoggingOut(false)
    }
  }

  return (
    <main className="profile-page">
      <Link to="/jogo" className="profile-back">← Voltar ao jardim</Link>

      <section className="profile-card">
        <div className="profile-avatar" aria-hidden="true">🌻</div>
        <p className="profile-eyebrow">GARDENIA</p>
        <h1>Meu perfil</h1>
        <p className="profile-description">
          Cuide das suas informações de jardineiro.
        </p>

        {message && <p className="profile-success" role="status">{message}</p>}
        {error && <p className="profile-error" role="alert">{error}</p>}

        <form className="profile-form" onSubmit={handleSave}>
          <label htmlFor="profile-name">Nome de usuário</label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!editing || saving}
            maxLength={20}
            placeholder="Seu nome"
          />
          <small>Esse nome identifica você no ranking (3 a 20 caracteres).</small>

          <label htmlFor="profile-email">E-mail</label>
          <input
            id="profile-email"
            type="email"
            value={user?.email || ''}
            disabled
            readOnly
          />
          <small>O e-mail da conta não pode ser alterado nesta tela.</small>

          {editing ? (
            <div className="profile-actions">
              <button className="profile-save" type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button className="profile-cancel" type="button" onClick={handleCancel} disabled={saving}>
                Cancelar
              </button>
            </div>
          ) : (
            <button className="profile-save" type="button" onClick={() => {
              setMessage('')
              setError('')
              setEditing(true)
            }}>
              Editar perfil
            </button>
          )}
        </form>

        {pendingScore !== null && (
          <p className="profile-notice">Sua pontuação está aguardando o envio.</p>
        )}
        {scoreError && <p className="profile-error">{scoreError}</p>}

        <div className="profile-divider" />
        <button className="profile-logout" type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Saindo...' : 'Sair da conta'}
        </button>
      </section>
    </main>
  )
}

export default Perfil
