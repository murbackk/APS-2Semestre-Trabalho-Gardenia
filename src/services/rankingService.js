import { supabase } from '../lib/supabase'

// Salvar ou atualizar o recorde do jogador.
export async function submitScore(score) {
  const { data: { user } } =
    await supabase.auth.getUser()

  if (!user) {
    throw new Error('É necessário estar autenticado.')
  }

  const { error } = await supabase.rpc(
    'submit_score',
    {
      p_score: score
    }
  )

  if (error) throw error
}

// Consultar ranking compartilhado.
export async function getRanking() {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      best_score,
      profiles (
        display_name
      )
    `)
    .order('best_score', {
      ascending: false
    })

  if (error) throw error

  return data.map((item) => ({
    name: item.profiles.display_name,
    score: item.best_score
  }))
}