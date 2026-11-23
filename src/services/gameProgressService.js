
import { supabase } from '../lib/supabase'

export async function loadGameProgress(userId) {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function saveGameProgress(userId, progress) {
  const { error } = await supabase
    .from('game_progress')
    .upsert(
      {
        user_id: userId,
        hearts: progress.hearts,
        coins: progress.coins,
        dead_plants: progress.deadPlants ?? 0,
        inventory: progress.inventory,
        plots: progress.plots,
        dream_plots: progress.dreamPlots,
        dream_garden_unlocked:
          progress.dreamGardenUnlocked ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) throw error
}
