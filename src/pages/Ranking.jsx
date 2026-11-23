import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRanking } from '../services/rankingService'
import './Ranking.css'

function Ranking() {
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadRanking() {
    setLoading(true)
    setError('')

    try {
      const data = await getRanking()
      setPlayers(data)
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
      setError('Não foi possível carregar o ranking. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRanking()
  }, [])

  const myPosition = players.findIndex((player) => player.userId === user?.id)

  return (
    <main className="ranking-page">
      <section className="ranking-card">
        <Link to="/jogo" className="ranking-back">← Voltar ao jardim</Link>

        <div className="ranking-heading">
          <span className="ranking-icon">🏆</span>
          <p className="ranking-eyebrow">GARDENIA</p>
          <h1>Ranking dos jardineiros</h1>
          <p className="ranking-subtitle">
            Veja quem cultivou a maior pontuação!
          </p>
        </div>

        {myPosition >= 0 && !loading && (
          <div className="ranking-my-position">
            Sua posição: <strong>#{myPosition + 1}</strong>
            <span> · </span>
            {players[myPosition].score} pontos
          </div>
        )}

        {loading ? (
          <p className="ranking-feedback">Carregando ranking... 🌱</p>
        ) : error ? (
          <div className="ranking-error">
            <p>{error}</p>
            <button type="button" onClick={loadRanking}>Tentar novamente</button>
          </div>
        ) : players.length === 0 ? (
          <p className="ranking-empty">
            Ainda não há pontuações registradas. Seja o primeiro a cultivar seu recorde!
          </p>
        ) : (
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Jogador</th>
                  <th>Pontuação</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.userId || `${player.name}-${index}`}
                    className={player.userId === user?.id ? 'ranking-current-user' : ''}
                  >
                    <td className="ranking-position">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td>
                      {player.name || 'Jardineiro'}
                      {player.userId === user?.id && (
                        <span className="ranking-you">Você</span>
                      )}
                    </td>
                    <td className="ranking-score">
                      {Number(player.score || 0).toLocaleString('pt-BR')} ❤️
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          className="ranking-refresh"
          onClick={loadRanking}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : '↻ Atualizar ranking'}
        </button>
      </section>
    </main>
  )
}

export default Ranking
