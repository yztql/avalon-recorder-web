import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getOrCreateRoom,
  getGamesByRoomId,
  deleteGameById,
  subscribeRoomGames,
} from '../utils/roomApi'

function formatDate(iso) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function History() {
  const { roomCode } = useParams()
  const [room, setRoom] = useState(null)
  const [games, setGames] = useState([])

  useEffect(() => {
    let unsub = null

    async function init() {
      try {
        const r = await getOrCreateRoom(roomCode)
        setRoom(r)

        const rows = await getGamesByRoomId(r.id)
        setGames(rows)

        unsub = subscribeRoomGames(r.id, async () => {
          const latest = await getGamesByRoomId(r.id)
          setGames(latest)
        })
      } catch (err) {
        console.error(err)
        alert('加载历史失败')
      }
    }

    init()

    return () => {
      if (unsub) unsub()
    }
  }, [roomCode])

  async function handleDelete(gameId) {
    const ok = window.confirm('确定删除这局吗？')
    if (!ok) return

    try {
      await deleteGameById(gameId)
      if (room) {
        const rows = await getGamesByRoomId(room.id)
        setGames(rows)
      }
    } catch (err) {
      console.error(err)
      alert('删除失败')
    }
  }

  return (
    <div>
      <div className="card">
        <h2>历史对局</h2>
        <p>房间：{roomCode}</p>
      </div>

      {games.length === 0 && (
        <div className="card">
          <p>暂无历史记录</p>
        </div>
      )}

      {games.map((row) => {
        const game = row.game_data
        return (
          <div key={row.id} className="card">
            <Link to={`/room/${roomCode}/detail/${row.id}`} className="link-card">
              <div className="row-between">
                <span>{game.playerCount}人局</span>
                <span>{game.finished ? '已结束' : '进行中'}</span>
              </div>
              <p className="mt12">时间：{formatDate(row.created_at)}</p>
              <p className="mt12">玩家：{game.players.map((p) => p.name).join('、')}</p>
            </Link>

            <button className="btn danger full mt16" onClick={() => handleDelete(row.id)}>
              删除这局
            </button>
          </div>
        )
      })}
    </div>
  )
}