import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Garden from './pages/Garden'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'

import './App.css'

function Home() {
  return (
    <main className="home-screen">

      <img
        src="/src/assets/placa-inicial.png"
        alt="Gardenia - ursinho e placa"
        className="welcome-art"
      />

      <Link to="/login" className="play-button">
        <span className="play-icon"></span>
        PLAY
      </Link>

    </main>
  )
}

function NotFound() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Ops!</h1>
        <p>Essa página não foi encontrada.</p>
        <a href="/" className="auth-button">
          Voltar ao início
        </a>
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/jogo" element={<Garden />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App