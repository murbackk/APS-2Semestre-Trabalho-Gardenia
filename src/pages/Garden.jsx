import { useState } from 'react'
import { Link } from 'react-router-dom'

function Garden() {
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [selectedTool, setSelectedTool] = useState('plantar')
  const [shopOpen, setShopOpen] = useState(false)
  const [gardenOpen, setGardenOpen] = useState(false)

  const plots = [
    { id: 1, plant: 'empty' },
    { id: 2, plant: 'grown' },
    { id: 3, plant: 'sprout' },
    { id: 4, plant: 'seed' },
    { id: 5, plant: 'grown' },
  ]

  const tools = [
    { id: 'regar', icon: '💧', name: 'Regar' },
    { id: 'plantar', icon: '🌱', name: 'Plantar' },
    { id: 'remover', icon: '✂️', name: 'Remover' },
    { id: 'colher', icon: '🧺', name: 'Colher' },
  ]

  return (
    <main className="game-screen">

      {/* BARRA SUPERIOR */}

      <header className="game-header">

        <button onClick={() => setGardenOpen(!gardenOpen)}>
          Jardins
        </button>

        <div className="resource">
          ❤️ 300/1000
        </div>

        <div className="resource">
          🪙 500
        </div>

        <div className="resource">
          🌱 2
        </div>

        <button className="settings-button">
          ⚙️
        </button>

      </header>

      {/* MENU DE JARDINS */}

      {gardenOpen && (
        <aside className="garden-menu">
          <h2>Meus jardins</h2>

          <div className="garden-option">
            <span>🌳</span>
            <strong>Jardim inicial</strong>
            <small>Desbloqueado</small>
          </div>

          <div className="garden-option locked">
            <span>🏰</span>
            <strong>Próximo jardim</strong>
            <small>❤️ 1000</small>
          </div>
        </aside>
      )}

      {/* ÁREA DE CULTIVO */}

      <section className="garden-area">

        <div className="plots-container">

          {plots.map((plot) => (

            <button
              key={plot.id}
              className={`plot ${
                selectedPlot === plot.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedPlot(plot.id)}
            >

              <span className="plant">
                {plot.plant === 'empty' && ' '}
                {plot.plant === 'seed' && '🌰'}
                {plot.plant === 'sprout' && '🌱'}
                {plot.plant === 'grown' && '🌿'}
              </span>

            </button>

          ))}

        </div>

        {selectedPlot && (
          <p className="selection-message">
            Canteiro {selectedPlot} selecionado
          </p>
        )}

      </section>

      {/* PAINEL DE SEMENTES */}

      <aside className="seed-panel">
        <h3>Minhas sementes</h3>

        <div className="seed-item">
          🌻
        </div>

        <p>Selecione para plantar</p>
      </aside>

      {/* LOJA */}

      {shopOpen && (
        <aside className="shop-panel">

          <h2>Loja de sementes</h2>

          <div className="shop-item">
            <span>🌻</span>
            <p>Flor amarela</p>
            <strong>🪙 500</strong>
          </div>

          <div className="shop-item">
            <span>🌺</span>
            <p>Flor rosa</p>
            <strong>🪙 500</strong>
          </div>

          <button onClick={() => setShopOpen(false)}>
            Fechar loja
          </button>

        </aside>
      )}

      {/* FERRAMENTAS */}

      <footer className="game-toolbar">

        {tools.map((tool) => (

          <button
            key={tool.id}
            className={
              selectedTool === tool.id ? 'tool active' : 'tool'
            }
            onClick={() => setSelectedTool(tool.id)}
          >

            <span>{tool.icon}</span>
            <small>{tool.name}</small>

          </button>

        ))}

        <button
          className="tool shop-button"
          onClick={() => setShopOpen(!shopOpen)}
        >
          <span>🌻</span>
          <small>Sementes</small>
        </button>

      </footer>

      <Link to="/" className="exit-game">
        Sair
      </Link>

    </main>
  )
}

export default Garden