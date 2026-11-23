
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import placaLogo from '../assets/placa-logo.png'
import { useAuth } from '../context/AuthContext'
import {
  loadGameProgress,
  saveGameProgress,
} from '../services/gameProgressService'

import plantarImg from '../assets/plantar.png'
import regadorImg from '../assets/regador.png'
import colherImg from '../assets/colher.png'
import tesouraImg from '../assets/tesoura.png'
import seedImg from '../assets/plantar.png'

const INITIAL_HEARTS = 300
const INITIAL_COINS = 500
const ACTION_TIME = 60 * 1000

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

function preparePlots(savedPlots) {
  return (savedPlots || INITIAL_PLOTS).map((plot) => ({
    ...plot,
    plant: plot.plant
      ? {
          ...plot.plant,
          actionStartedAt:
            plot.plant.actionStartedAt || Date.now(),
        }
      : null,
  }))
}

export default function Garden() {
  const { user, authLoading } = useAuth()

  const [hearts, setHearts] = useState(INITIAL_HEARTS)
  const [coins, setCoins] = useState(INITIAL_COINS)
  const [deadPlants, setDeadPlants] = useState(0)
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)

  const [plots, setPlots] = useState(INITIAL_PLOTS)
  const [dreamPlots, setDreamPlots] = useState(INITIAL_PLOTS)

  const [dreamGardenUnlocked, setDreamGardenUnlocked] =
    useState(false)

  const [currentGarden, setCurrentGarden] = useState('garden')

  const activePlots =
    currentGarden === 'dream' ? dreamPlots : plots

  const activeLimit = dreamGardenUnlocked ? 2500 : 1000

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
  // Controle da pausa do jogo
  const [isPaused, setIsPaused] = useState(false)
  const [pauseStartedAt, setPauseStartedAt] = useState(null)

  // Atualização visual independente para as barras de tempo
  const [timerNow, setTimerNow] = useState(Date.now())

  // Atualizar os temporizadores somente quando o jogo estiver ativo
useEffect(() => {
  if (isPaused) return

  const interval = setInterval(() => {
    setTimerNow(Date.now())
  }, 250)

  return () => clearInterval(interval)
}, [isPaused])

  // Atualizar os canteiros do jardim que está aberto
  function updateActivePlots(updater) {
    if (currentGarden === 'dream') {
      setDreamPlots(updater)
    } else {
      setPlots(updater)
    }
  }

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
          setDeadPlants(data.dead_plants ?? 0)
          setInventory(data.inventory)
          setPlots(preparePlots(data.plots))
          setDreamPlots(
            preparePlots(data.dream_plots || INITIAL_PLOTS)
          )

          setDreamGardenUnlocked(
            data.dream_garden_unlocked ?? false
          )
        } else {
          const initialProgress = {
            hearts: INITIAL_HEARTS,
            coins: INITIAL_COINS,
            deadPlants: 0,
            inventory: INITIAL_INVENTORY,
            plots: INITIAL_PLOTS,
            dreamPlots: INITIAL_PLOTS,
            dreamGardenUnlocked: false,
          }

          await saveGameProgress(user.id, initialProgress)

          if (cancelled) return

          setHearts(INITIAL_HEARTS)
          setCoins(INITIAL_COINS)
          setDeadPlants(0)
          setInventory(INITIAL_INVENTORY)
          setPlots(INITIAL_PLOTS)
          setDreamPlots(INITIAL_PLOTS)
          setDreamGardenUnlocked(false)
        }

        setCurrentGarden('garden')
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
          deadPlants,
          inventory,
          plots,
          dreamPlots,
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
    deadPlants,
    inventory,
    plots,
    dreamPlots,
    dreamGardenUnlocked,
    user?.id,
    loadedUserId,
  ])

  // Verificar se alguma planta ultrapassou os 60 segundos
  useEffect(() => {
    if (isPaused) return
    const now = timerNow

    const expiredPlots = plots.filter(
      (plot) =>
        plot.plant &&
        now - (plot.plant.actionStartedAt || now) >= ACTION_TIME
    )

    const expiredDreamPlots = dreamPlots.filter(
      (plot) =>
        plot.plant &&
        now - (plot.plant.actionStartedAt || now) >= ACTION_TIME
    )

    const totalDeaths =
      expiredPlots.length + expiredDreamPlots.length

    if (totalDeaths === 0) return

    const expiredIds = new Set(
      expiredPlots.map((plot) => plot.id)
    )

    const expiredDreamIds = new Set(
      expiredDreamPlots.map((plot) => plot.id)
    )

    setPlots((previous) =>
      previous.map((plot) =>
        expiredIds.has(plot.id) &&
        plot.plant &&
        now - (plot.plant.actionStartedAt || now) >= ACTION_TIME
          ? { ...plot, plant: null }
          : plot
      )
    )

    setDreamPlots((previous) =>
      previous.map((plot) =>
        expiredDreamIds.has(plot.id) &&
        plot.plant &&
        now - (plot.plant.actionStartedAt || now) >= ACTION_TIME
          ? { ...plot, plant: null }
          : plot
      )
    )

    setHearts((previous) =>
      Math.max(0, previous - totalDeaths * 10)
    )

    setCoins((previous) =>
      Math.max(0, previous - totalDeaths * 20)
    )

    setDeadPlants((previous) => previous + totalDeaths)

    setMessage(
      totalDeaths === 1
        ? 'Uma planta morreu por falta de cuidados! -10 ❤️ e -20 moedas.'
        : `${totalDeaths} plantas morreram por falta de cuidados! -${totalDeaths * 10} ❤️ e -${totalDeaths * 20} moedas.`
    )
  }, [timerNow, plots, dreamPlots, isPaused])

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
    setHearts(0)

    setModal({
      type: 'success',
      title: 'Dream Garden desbloqueado!',
      message:
        'Parabéns! Você alcançou 1.000 corações! O Dream Garden foi desbloqueado. Seus corações foram zerados e agora você pode conquistar até 2.500! 🌸',
    })
  }, [
    hearts,
    dreamGardenUnlocked,
    user?.id,
    loadedUserId,
  ])


  // Pausar o jogo
function pauseGame() {
  setPauseStartedAt(Date.now())
  setIsPaused(true)
}

// Retomar o jogo sem descontar o tempo pausado
function resumeGame() {
  if (pauseStartedAt) {
    const pausedDuration = Date.now() - pauseStartedAt

    // Ajustar os temporizadores do jardim inicial
    setPlots((previous) =>
      previous.map((plot) => ({
        ...plot,
        plant: plot.plant
          ? {
              ...plot.plant,
              actionStartedAt:
                (plot.plant.actionStartedAt || Date.now()) +
                pausedDuration,
            }
          : null,
      }))
    )

    // Ajustar os temporizadores do Dream Garden
    setDreamPlots((previous) =>
      previous.map((plot) => ({
        ...plot,
        plant: plot.plant
          ? {
              ...plot.plant,
              actionStartedAt:
                (plot.plant.actionStartedAt || Date.now()) +
                pausedDuration,
            }
          : null,
      }))
    )
  }

  setTimerNow(Date.now())
  setPauseStartedAt(null)
  setIsPaused(false)
}

  function addHearts(points) {
    setHearts((previous) =>
      Math.min(activeLimit, previous + points)
    )
  }

  // Alternar entre os jardins
  function selectGarden(garden) {
    if (garden === 'dream' && !dreamGardenUnlocked) {
      setMessage('O Dream Garden ainda está bloqueado! 🔒')
      return
    }

    setCurrentGarden(garden)
    setSelectedPlot(null)
    setGardenOpen(false)
    setShopOpen(false)
    setSelectedTool('plant')

    setMessage(
      garden === 'dream'
        ? 'Bem-vindo ao Dream Garden! 🌸'
        : 'Bem-vindo de volta ao Jardim inicial! 🌻'
    )
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
    const plot = activePlots.find((item) => item.id === plotId)

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

      updateActivePlots((previous) =>
        previous.map((item) =>
          item.id === plotId
            ? {
                ...item,
                plant: {
                  type: selectedSeed,
                  stage: 'seed',
                  watered: false,
                  actionStartedAt: Date.now(),
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

      updateActivePlots((previous) =>
        previous.map((item) =>
          item.id === plotId
            ? {
                ...item,
                plant: {
                  ...item.plant,
                  stage: nextStage,
                  watered: true,
                  actionStartedAt: Date.now(),
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

      updateActivePlots((previous) =>
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

      updateActivePlots((previous) =>
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
      deadPlants: 0,
      inventory: INITIAL_INVENTORY,
      plots: INITIAL_PLOTS,
      dreamPlots: INITIAL_PLOTS,
      dreamGardenUnlocked: false,
    }

    try {
      await saveGameProgress(user.id, initialProgress)

      setHearts(INITIAL_HEARTS)
      setCoins(INITIAL_COINS)
      setDeadPlants(0)
      setInventory(INITIAL_INVENTORY)
      setPlots(INITIAL_PLOTS)
      setDreamPlots(INITIAL_PLOTS)
      setDreamGardenUnlocked(false)

      setCurrentGarden('garden')
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

  // Calcular o tempo restante de cada planta
  function getTimerInfo(plant) {
    if (!plant) return null

    const startedAt = plant.actionStartedAt || timerNow

    const remaining = Math.max(
      0,
      ACTION_TIME - (timerNow - startedAt)
    )

    const percentage = (remaining / ACTION_TIME) * 100

    let color = '#55a85b'

    if (percentage <= 25) {
      color = '#d94c43'
    } else if (percentage <= 50) {
      color = '#e4b942'
    }

    return {
      percentage,
      color,
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
    <main
      className={`garden-screen ${
        currentGarden === 'dream' ? 'dream-garden-screen' : ''
      }`}
    >
      <header className="garden-header">
        <Link
          to="/"
          className="garden-logo"
          aria-label="Gardenia - página inicial"
        >
          <img src={placaLogo} alt="Gardenia" />
        </Link>

        <div className="resources">
          <span>❤️ {hearts}/{activeLimit}</span>
          <span>💰 {coins}</span>
          <span className="dead-plants-counter">
            🥀 {deadPlants}
          </span>
        </div>

        <Link to="/perfil" className="profile-button">
          👤 Perfil
        </Link>

        <button
          className="reset-button"
          onClick={handleResetProgress}
          disabled={resetting}
        >
          🔄 Reiniciar progresso
        </button>

         
         <button
  className="pause-button"
  onClick={pauseGame}
  disabled={resetting}
>
  ⏸ Pause
</button>

      </header>

      <section className="garden-content">
        <div className="garden-top">
          <div>
            <h1>
              {currentGarden === 'dream'
                ? 'Dream Garden'
                : 'Meu Jardim'}
            </h1>

            <p>
              {currentGarden === 'dream'
                ? 'Cultive seus sonhos e faça este jardim florescer!'
                : 'Cuide das suas plantas e faça seu jardim florescer!'}
            </p>
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
            <div
              className={`garden-option ${
                currentGarden === 'garden' ? 'active' : ''
              }`}
              role="button"
              tabIndex={0}
              onClick={() => selectGarden('garden')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') selectGarden('garden')
              }}
              style={{ cursor: 'pointer' }}
            >
              <span>🌻</span>
              <strong>Jardim inicial</strong>
              <small>Desbloqueado</small>
            </div>

            <div
              className={`garden-option ${
                currentGarden === 'dream' ? 'active' : ''
              } ${!dreamGardenUnlocked ? 'locked' : ''}`}
              role="button"
              tabIndex={dreamGardenUnlocked ? 0 : -1}
              onClick={() => selectGarden('dream')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') selectGarden('dream')
              }}
              style={{
                cursor: dreamGardenUnlocked ? 'pointer' : 'not-allowed',
              }}
            >
              <span>🌸</span>
              <strong>Dream Garden</strong>
              <small>
                {dreamGardenUnlocked ? 'Desbloqueado' : '🔒 1000 ❤️'}
              </small>
            </div>
          </div>
        )}

        <div className="garden-message">
          {message}
        </div>

        <section className="plots-container">
          {activePlots.map((plot) => {
            const timer = getTimerInfo(plot.plant)

            return (
              <div className="plot-wrapper" key={plot.id}>
                <button
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

                {timer && (
                  <div className="plant-timer">
                    <div className="plant-timer-track">
                      <div
                        className="plant-timer-fill"
                        style={{
                          width: `${timer.percentage}%`,
                          backgroundColor: timer.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
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

      {/* TELA DE JOGO PAUSADO */}
{isPaused && (
  <div className="pause-overlay">
    <div className="pause-content">

      <h1>Jogo pausado</h1>

      <button
        className="pause-resume"
        onClick={resumeGame}
      >
        Voltar
      </button>

      <Link
        to="/"
        className="pause-exit"
      >
        Sair
      </Link>

    </div>
  </div>
)}

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
