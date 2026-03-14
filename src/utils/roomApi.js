import { supabase } from './supabase'

export async function getRoomByCode(code) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createRoom({ code, name }) {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ code, name }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrCreateRoom(code) {
  const existing = await getRoomByCode(code)
  if (existing) return existing
  return createRoom({
    code,
    name: code,
  })
}

export async function createGameInRoom(roomId, game) {
  const { data, error } = await supabase
    .from('games')
    .insert([
      {
        room_id: roomId,
        player_count: game.playerCount,
        finished: game.finished,
        game_data: game,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGameInRoom(gameRowId, game) {
  const { data, error } = await supabase
    .from('games')
    .update({
      player_count: game.playerCount,
      finished: game.finished,
      game_data: game,
    })
    .eq('id', gameRowId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getGamesByRoomId(roomId) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getGameRowById(gameId) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (error) throw error
  return data
}

export async function deleteGameById(gameId) {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)

  if (error) throw error
}

export function subscribeRoomGames(roomId, onChange) {
  const channel = supabase
    .channel(`room-games-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        onChange()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}