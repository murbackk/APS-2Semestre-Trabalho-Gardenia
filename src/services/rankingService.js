import { supabase } from '../lib/supabase'

// Salva ou atualiza o recorde do jogador autenticado.
export async function submitScore(score) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('É necessário estar autenticado.')
  }

  const { error } = await supabase.rpc('submit_score', {
    p_score: score,
  })

  if (error) throw error
}

// Consulta as pontuações em ordem decrescente.

export async function getRanking() {
  const pageSize = 1000
  let allData = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('scores')
      .select(`
        user_id,
        best_score,
        profiles (
          display_name
        )
      `)
      .order('best_score', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throw error

    allData = [...allData, ...(data || [])]

    hasMore = data?.length === pageSize
    from += pageSize
  }

  return allData.map((item) => {
    const profile = Array.isArray(item.profiles)
      ? item.profiles[0]
      : item.profiles

    return {
      userId: item.user_id,
      name: profile?.display_name || 'Jardineiro',
      score: Number(item.best_score) || 0,
    }
  })
}

