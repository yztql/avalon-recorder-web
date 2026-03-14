import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createNewGame } from '../utils/game'
import { createGameInRoom, getOrCreateRoom } from '../utils/roomApi'

export default function CreateGame() {
  const navigate = useNavigate()
  const { roomCode } = useParams()

  const [room, setRoom] = useState(null)
  const [playerCount, setPlayerCount] = useState(9)
  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: 9 }, (_, i) => `玩家${i + 1}`)
  )

  useEffect(() => {
    async function init() {
      const r = await getOrCreateRoom(roomCode)
      setRoom(r)
    }
    init()
  }, [roomCode])

  function handleSelectCount(count) {
    setPlayerCount(count)
    setPlayerNames(Array.from({ length: count }, (_, i) => `玩家${i + 1}`))
  }

  function handleNameChange(index, value) {
    const next = [...playerNames]
    next[index] = value
    setPlayerNames(next)
  }

  async function handleStart() {
    if (!room) return

    try {
      const game = createNewGame({
        playerCount,
        playerNames,
      })

      const row = await createGameInRoom(room.id, game)
      navigate(`/room/${roomCode}/record/${row.id}`)
    } catch (err) {
      console.error(err)
      alert('创建对局失败')
    }
  }

  return (
    <div>
      <div className="card">
        <h2>新开一局</h2>
        <div className="section-title">选择人数</div>
        <div className="chip-wrap">
          {[5, 6, 7, 8, 9, 10].map((count) => (
            <button
              key={count}
              className={`chip ${playerCount === count ? 'active' : ''}`}
              onClick={() => handleSelectCount(count)}
            >
              {count}人
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">玩家名单</div>
        <div className="input-list">
          {playerNames.map((name, index) => (
            <input
              key={index}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`请输入玩家${index + 1}名字`}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <button className="btn primary full" onClick={handleStart}>
          开始对局
        </button>
      </div>
    </div>
  )
}