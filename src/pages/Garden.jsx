
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  loadGameProgress,
  saveGameProgress,
} from '../services/gameProgressService'

const INITIAL_HEARTS = 300
const INITIAL_COINS = 500

const INITIAL_INVENTORY = {
  amarela: 2,
  rosa: 0,
}

const INITIAL_PLOTS = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  plant: null,
}))

const SEEDS = {
  amarela: {
    name: 'Semente amarela',
    icon: '🌻',
    price: 100,
  },
  rosa: {
    name: 'Semente rosa',
    icon: '🌷',
    price: 100,
  },
}

export default function Garden() {
  const { user, authLoading } = useAuth()

  const [hearts, setHearts] = useState(INITIAL_HEARTS)
  const [coins, setCoins] = useState(INITIAL_COINS)
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)
  const [plots, setPlots] = useState(INITIAL_PLOTS)

  const [dreamGardenUnlocked, setDreamGardenUnlocked] =
    useState(false)

  const [selectedSeed, setSelectedSeed] = useState('amarela')
  const [selectedTool, setSelectedTool] = useState('plant')

  const [shopOpen, setShopOpen] = useState(false)
  const [gardenOpen, setGardenOpen] = useState(false)

  const [selectedPlot, setSelectedPlot] = useState(null)
  const [message, setMessage] = useState('Escolha uma semente e plante!')
  const [modal, setModal] = useState(null)

  const [progressLoading, setProgressLoading] = useState(true)
  const [loadedUserId, setLoadedUserId] = useState(null)
  const [resetting, setResetting] = useState(false)

  // Carregar o progresso do jogador
  useEffect(() => {
    let cancelled = false

    async function loadProgress() {
      if (!user?.id) {
        setProgressLoading(false)
        setLoadedUserId(null)
        return
      }

      setProgressLoading(true)
      setLoadedUserId(null)

      try {
        const data = await loadGameProgress(user.id)

        if (cancelled) return

        if (data) {
          setHearts(data.hearts)
          setCoins(data.coins)
          setInventory(data.inventory)
          setPlots(data.plots)
          setDreamGardenUnlocked(
            data.dream_garden_unlocked ?? false
          )
        } else {
          const initialProgress = {
            hearts: INITIAL_HEARTS,
            coins: INITIAL_COINS,
            inventory: INITIAL_INVENTORY,
            plots: INITIAL_PLOTS,
            dreamGardenUnlocked: false,
          }

          await saveGameProgress(user.id, initialProgress)

          if (cancelled) return

          setHearts(INITIAL_HEARTS)
          setCoins(INITIAL_COINS)
          setInventory(INITIAL_INVENTORY)
          setPlots(INITIAL_PLOTS)
          setDreamGardenUnlocked(false)
        }

        setLoadedUserId(user.id)
      } catch (error) {
        console.error('Erro ao carregar progresso:', error)

        if (!cancelled) {
          setMessage('Não foi possível carregar seu progresso.')
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false)
        }
      }
    }

    if (!authLoading) {
      loadProgress()
    }

    return () => {
      cancelled = true
    }
  }, [user?.id, authLoading])

  // Salvar automaticamente no Supabase
  useEffect(() => {
    if (!user?.id || loadedUserId !== user.id) return

    async function saveProgress() {
      try {
        await saveGameProgress(user.id, {
          hearts,
          coins,
          inventory,
          plots,
          dreamGardenUnlocked,
        })
      } catch (error) {
        console.error('Erro ao salvar progresso:', error)
      }
    }

    saveProgress()
  }, [
    hearts,
    coins,
    inventory,
    plots,
    dreamGardenUnlocked,
    user?.id,
    loadedUserId,
  ])

  // Desbloquear o Dream Garden ao atingir 1000 corações
  useEffect(() => {
    if (
      !user?.id ||
      loadedUserId !== user.id ||
      hearts < 1000 ||
      dreamGardenUnlocked
    ) {
      return
    }

    setDreamGardenUnlocked(true)

    setModal({
      type: 'success',
      title: 'Dream Garden desbloqueado!',
      message:
        'Parabéns! Você alcançou 1.000 corações e desbloqueou um novo jardim! Seu próximo sonho começa aqui! 🌸',
    })
  }, [
    hearts,
    dreamGardenUnlocked,
    user?.id,
    loadedUserId,
  ])

  function addHearts(points) {
    setHearts((previous) => Math.min(1000, previous + points))
  }

  // Comprar sementes
  function buySeed(type) {
    if (coins < SEEDS[type].price) {
      setMessage('Você não tem moedas suficientes! 💰')
      return
    }

    setCoins((previous) => previous - SEEDS[type].price)

    setInventory((previous) => ({
      ...previous,
      [type]: previous[type] + 1,
    }))

    setMessage(`Você comprou ${SEEDS[type].name}! 🌱`)
  }

  // Plantar, regar, colher ou remover
  function handlePlotClick(plotId) {
    const plot = plots.find((item) => item.id === plotId)

    if (!plot) return

    // PLANTAR
    if (selectedTool === 'plant') {
      if (plot.plant) {
        setMessage('Este canteiro já possui uma planta!')
        return
      }

      if (inventory[selectedSeed] <= 0) {
        setMessage('Você não possui essa semente!')
        return
      }

      setPlots((previous) =>
        previous.map((item) =>
          item.id === plotId
            ? {
                ...item,
                plant: {
                  type: selectedSeed,
                  stage: 'seed',
                  watered: false,
                },
              }
            : item
        )
      )

      setInventory((previous) => ({
        ...previous,
        [selectedSeed]: previous[selectedSeed] - 1,
      }))

      addHearts(10)
      setMessage('Semente plantada! +10 ❤️')
      return
    }

    // REGAR
    if (selectedTool === 'water') {
      if (!plot.plant) {
        setMessage('Plante uma semente antes de regar!')
        return
      }

      if (plot.plant.stage === 'grown') {
        setMessage('Sua planta já está adulta! 🌻')
        return
      }

      const nextStage =
        plot.plant.stage === 'seed' ? 'sprout' : 'grown'

      setPlots((previous) =>
        previous.map((item) =>
          item.id === plotId
            ? {
                ...item,
                plant: {
                  ...item.plant,
                  stage: nextStage,
                  watered: true,
                },
              }
            : item
        )
      )

      addHearts(5)
      setCoins((previous) => previous + 25)
      setMessage('Planta regada! +5 ❤️ e +25 moedas 💰')
      return
    }

    // COLHER
    if (selectedTool === 'harvest') {
      if (!plot.plant) {
        setMessage('Não há planta para colher!')
        return
      }

      if (plot.plant.stage !== 'grown') {
        setMessage('Espere a planta crescer para colher!')
        return
      }

      setPlots((previous) =>
        previous.map((item) =>
          item.id === plotId
            ? { ...item, plant: null }
            : item
        )
      )

      addHearts(20)
      setCoins((previous) => previous + 100)
      setMessage('Planta colhida! +20 ❤️ e +100 moedas 💰')
      return
    }

    // REMOVER
    if (selectedTool === 'remove') {
      if (!plot.plant) {
        setMessage('Este canteiro já está vazio!')
        return
      }

      setPlots((previous) =>
        previous.map((item) =>
          item.id === plotId
            ? { ...item, plant: null }
            : item
        )
      )

      setMessage('Planta removida.')
    }
  }

  // Ícone de cada estágio da planta
  function getPlantIcon(plant) {
    if (!plant) return '🟫'

    if (plant.type === 'amarela') {
      if (plant.stage === 'seed') return '🌱'
      if (plant.stage === 'sprout') return '🌿'
      if (plant.stage === 'grown') return '🌻'
    }

    if (plant.type === 'rosa') {
      if (plant.stage === 'seed') return '🌱'
      if (plant.stage === 'sprout') return '🌿'
      if (plant.stage === 'grown') return '🌷'
    }

    return '🌱'
  }

  // Abrir a confirmação de reinício
  function handleResetProgress() {
    setModal({
      type: 'confirm',
      title: 'Recomeçar seu jardim?',
      message:
        'Todo o progresso atual será reiniciado. Seu perfil e sua pontuação no ranking serão preservados.',
    })
  }

  // Confirmar reinício
  async function confirmResetProgress() {
    if (!user?.id) return

    setResetting(true)

    const initialProgress = {
      hearts: INITIAL_HEARTS,
      coins: INITIAL_COINS,
      inventory: INITIAL_INVENTORY,
      plots: INITIAL_PLOTS,
      dreamGardenUnlocked: false,
    }

    try {
      await saveGameProgress(user.id, initialProgress)

      setHearts(INITIAL_HEARTS)
      setCoins(INITIAL_COINS)
      setInventory(INITIAL_INVENTORY)
      setPlots(INITIAL_PLOTS)
      setDreamGardenUnlocked(false)

      setSelectedSeed('amarela')
      setSelectedTool('plant')
      setSelectedPlot(null)

      setShopOpen(false)
      setGardenOpen(false)

      setMessage('Seu jardim está pronto para recomeçar!')

      setModal({
        type: 'success',
        title: 'Jardim reiniciado!',
        message:
          'Seu progresso foi reiniciado com sucesso. Seu perfil e ranking continuam salvos! 🌱',
      })
    } catch (error) {
      console.error('Erro ao reiniciar progresso:', error)

      setModal({
        type: 'error',
        title: 'Não foi possível reiniciar',
        message:
          'Ocorreu um erro ao salvar seu novo progresso. Tente novamente.',
      })
    } finally {
      setResetting(false)
    }
  }

  if (authLoading || progressLoading) {
    return (
      <main className="garden-loading">
        <h2>Preparando seu jardim... 🌱</h2>
      </main>
    )
  }

  return (
    <main className="garden-screen">
      <header className="garden-header">
        <Link to="/" className="garden-logo">
          🌱 Gardenia
        </Link>

        <div className="resources">
          <span>❤️ {hearts}/1000</span>
          <span>💰 {coins}</span>
        </div>

        <button
          className="reset-button"
          onClick={handleResetProgress}
          disabled={resetting}
        >
          🔄 Reiniciar progresso
        </button>
      </header>

      <section className="garden-content">
        <div className="garden-top">
          <div>
            <h1>Meu Jardim</h1>
            <p>Cuide das suas plantas e faça seu jardim florescer!</p>
          </div>

          <button
            className="garden-menu-button"
            onClick={() => setGardenOpen(!gardenOpen)}
          >
            🌳 Meus jardins
          </button>
        </div>

        {gardenOpen && (
          <div className="garden-menu">
            <div className="garden-option active">
              <span>🌻</span>
              <strong>Jardim inicial</strong>
              <small>Desbloqueado</small>
            </div>

            <div
              className={`garden-option ${
                dreamGardenUnlocked ? 'unlocked' : 'locked'
              }`}
            >
              <span>🌸</span>
              <strong>Dream Garden</strong>

              <small>
                {dreamGardenUnlocked
                  ? 'Desbloqueado! ✨'
                  : '🔒 1000 ❤️'}
              </small>

              {dreamGardenUnlocked && (
                <span className="unlocked-label">
                  Disponível
                </span>
              )}
            </div>
          </div>
        )}

        <div className="garden-message">
          {message}
        </div>

        <section className="plots-container">
          {plots.map((plot) => (
            <button
              key={plot.id}
              className={`plot ${
                selectedPlot === plot.id ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedPlot(plot.id)
                handlePlotClick(plot.id)
              }}
            >
              <span className="plant-icon">
                {getPlantIcon(plot.plant)}
              </span>

              {plot.plant && (
                <small>
                  {plot.plant.stage === 'seed'
                    ? 'Semente'
                    : plot.plant.stage === 'sprout'
                    ? 'Crescendo'
                    : 'Adulta'}
                </small>
              )}
            </button>
          ))}
        </section>

        <section className="game-panel">
          <div className="seed-panel">
            <h2>Minhas sementes</h2>

            <div className="seed-options">
              <button
                className={
                  selectedSeed === 'amarela' ? 'selected' : ''
                }
                onClick={() => {
                  setSelectedSeed('amarela')
                  setSelectedTool('plant')
                }}
              >
                🌻 Amarela: {inventory.amarela}
              </button>

              <button
                className={
                  selectedSeed === 'rosa' ? 'selected' : ''
                }
                onClick={() => {
                  setSelectedSeed('rosa')
                  setSelectedTool('plant')
                }}
              >
                🌷 Rosa: {inventory.rosa}
              </button>
            </div>
          </div>

          <div className="tools-panel">
            <h2>Ferramentas</h2>

            <div className="tool-options">
              <button
                className={
                  selectedTool === 'plant' ? 'selected' : ''
                }
                onClick={() => setSelectedTool('plant')}
              >
                🌱 Plantar
              </button>

              <button
                className={
                  selectedTool === 'water' ? 'selected' : ''
                }
                onClick={() => setSelectedTool('water')}
              >
                💧 Regar
              </button>

              <button
                className={
                  selectedTool === 'harvest' ? 'selected' : ''
                }
                onClick={() => setSelectedTool('harvest')}
              >
                🧺 Colher
              </button>

              <button
                className={
                  selectedTool === 'remove' ? 'selected' : ''
                }
                onClick={() => setSelectedTool('remove')}
              >
                🗑️ Remover
              </button>
            </div>
          </div>

          <div className="shop-panel">
            <button
              className="shop-button"
              onClick={() => setShopOpen(!shopOpen)}
            >
              🛒 Loja de sementes
            </button>

            {shopOpen && (
              <div className="shop-content">
                <h2>Comprar sementes</h2>

                <p>🌻 Semente amarela — 100 moedas</p>
                <button onClick={() => buySeed('amarela')}>
                  Comprar amarela
                </button>

                <p>🌷 Semente rosa — 100 moedas</p>
                <button onClick={() => buySeed('rosa')}>
                  Comprar rosa
                </button>
              </div>
            )}
          </div>
        </section>
      </section>

      {/* AVISOS E CONFIRMAÇÕES CENTRALIZADOS */}
      {modal && (
        <div className="modal-overlay">
          <div
            className="game-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-modal-title"
          >
            <div className="modal-icon">
              {modal.type === 'confirm' && '🌱'}
              {modal.type === 'success' && '🌸'}
              {modal.type === 'error' && '🌷'}
            </div>

            <h2 id="game-modal-title">{modal.title}</h2>

            <p>{modal.message}</p>

            {modal.type === 'confirm' ? (
              <div className="modal-buttons">
                <button
                  className="modal-cancel"
                  onClick={() => setModal(null)}
                  disabled={resetting}
                >
                  Cancelar
                </button>

                <button
                  className="modal-confirm"
                  onClick={() => {
                    setModal(null)
                    confirmResetProgress()
                  }}
                  disabled={resetting}
                >
                  {resetting ? 'Reiniciando...' : 'Sim, reiniciar'}
                </button>
              </div>
            ) : (
              <button
                className="modal-confirm"
                onClick={() => setModal(null)}
              >
                Continuar
              </button>
            )}
          </div>
        </div>
      )}

      <footer className="garden-footer">
        <Link to="/">Sair do jardim</Link>
      </footer>
    </main>
  )
}
