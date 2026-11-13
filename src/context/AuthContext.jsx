import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { supabase } from '../lib/supabase'
import { submitScore } from '../services/rankingService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingScore, setPendingScore] = useState(null)
  const [scoreError, setScoreError] = useState('')

  const sendingScore = useRef(false)

  const user = session?.user ?? null

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
      }

      if (mounted) {
        setSession(data?.session ?? null)
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Envia a pontuação pendente após a autenticação.
  useEffect(() => {
    if (
      !user ||
      pendingScore === null ||
      sendingScore.current
    ) {
      return
    }

    let active = true

    async function savePendingScore() {
      sendingScore.current = true
      setScoreError('')

      try {
        await submitScore(pendingScore)

        if (active) {
          setPendingScore(null)
        }
      } catch (error) {
        console.error(error)

        if (active) {
          setScoreError(
            'Não foi possível salvar sua pontuação. Tente novamente.'
          )
        }
      } finally {
        sendingScore.current = false
      }
    }

    savePendingScore()

    return () => {
      active = false
    }
  }, [user, pendingScore])

  async function login(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    if (error) throw error

    return data
  }

  async function register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (error) throw error

    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()

    if (error) throw error
  }

  function savePendingScore(score) {
    setPendingScore(score)
  }

  const value = {
    session,
    user,
    loading,
    pendingScore,
    scoreError,
    login,
    register,
    logout,
    savePendingScore
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth precisa estar dentro de AuthProvider'
    )
  }

  return context
}