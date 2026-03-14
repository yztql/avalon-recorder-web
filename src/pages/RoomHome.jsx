import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrCreateRoom } from '../utils/roomApi'

export default function RoomHome() {
  const { roomCode } = useParams()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const data = await getOrCreateRoom(roomCode)
        setRoom(data)
      } catch (err) {
        console.error(err)
        alert('房间加载失败')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [roomCode])

  if (loading) {
    return <div className="card">加载中...</div>
  }

  if (!room) {
    return <div className="card">房间不存在</div>
  }

  return (
    <div>
      <div className="card">
        <h2>房间：{room.code}</h2>
        <p>把当前链接发给朋友，大家就能看到同一个房间的数据</p>
      </div>

      <div className="card action-list">
        <Link className="btn primary" to={`/room/${roomCode}/create`}>
          新开一局
        </Link>
        <Link className="btn" to={`/room/${roomCode}/history`}>
          历史对局
        </Link>
      </div>
    </div>
  )
}