const GAME_LIST_KEY = 'AVALON_GAME_LIST'
const CURRENT_GAME_KEY = 'AVALON_CURRENT_GAME'

export function getGameList() {
  return JSON.parse(localStorage.getItem(GAME_LIST_KEY) || '[]')
}

export function saveGameList(list) {
  localStorage.setItem(GAME_LIST_KEY, JSON.stringify(list))
}

export function getCurrentGame() {
  return JSON.parse(localStorage.getItem(CURRENT_GAME_KEY) || 'null')
}

export function saveCurrentGame(game) {
  localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game))
}

export function clearCurrentGame() {
  localStorage.removeItem(CURRENT_GAME_KEY)
}

export function saveGame(game) {
  const list = getGameList()
  const index = list.findIndex((item) => item.id === game.id)

  if (index >= 0) {
    list[index] = game
  } else {
    list.unshift(game)
  }

  saveGameList(list)
}

export function getGameById(id) {
  return getGameList().find((item) => item.id === id) || null
}

export function deleteGameById(id) {
  const list = getGameList().filter((item) => item.id !== id)
  saveGameList(list)

  const currentGame = getCurrentGame()
  if (currentGame && currentGame.id === id) {
    clearCurrentGame()
  }
}

export function clearAllGames() {
  saveGameList([])
  clearCurrentGame()
}