import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

import Garden from './pages/Garden'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Perfil from './pages/Perfil'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

function Home() {
  return (
    <main className="home-screen">
      <img
        src="/src/assets/placa-inicial.png"
        alt="Gardenia - ursinho e placa"
        className="welcome-art"
      />

      <Link to="/Login" className="play-button">
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

        <Link to="/" className="auth-button">
          Voltar ao início
        </Link>
      </section>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/cadastro" element={<Cadastro />} />

          <Route path="/jogo" element={<Garden />} />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App