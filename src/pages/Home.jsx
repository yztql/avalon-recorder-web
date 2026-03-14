import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('Avalon-Saturday')

  function goRoom() {
    const code = roomCode.trim().toLowerCase()
    if (!code) {
      alert('请输入房间码')
      return
    }
    navigate(`/room/${code}`)
  }

  return (
    <div>
      <div className="card">
        <h2>阿瓦隆记录器</h2>
        <p>输入一个房间码，和朋友共享同一个对局空间</p>
      </div>

      <div className="card">
        <div className="section-title">房间码</div>
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="例如 Avalon-Saturday"
        />
        <button className="btn primary full mt16" onClick={goRoom}>
          进入房间
        </button>
      </div>
    </div>
  )
}