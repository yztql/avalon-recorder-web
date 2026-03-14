import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGameRowById } from '../utils/roomApi'

function formatDate(iso) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function GameDetail() {
  const { gameId } = useParams()
  const [row, setRow] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getGameRowById(gameId)
        setRow(data)
      } catch (err) {
        console.error(err)
        alert('加载详情失败')
      }
    }
    load()
  }, [gameId])

  const game = row?.game_data || null

  const playerMap = useMemo(() => {
    if (!game) return {}
    return game.players.reduce((acc, player) => {
      acc[player.id] = player.name
      return acc
    }, {})
  }, [game])

  if (!game || !row) {
    return <div className="card">加载中...</div>
  }

  return (
    <div>
      <div className="card">
        <h2>对局详情</h2>
        <p>人数：{game.playerCount}人</p>
        <p>时间：{formatDate(row.created_at)}</p>
        <p>玩家：{game.players.map((p) => p.name).join('、')}</p>
      </div>

      {game.missions.map((mission) => (
        <div key={mission.missionNumber} className="card">
          <div className="section-title">
            第{mission.missionNumber}任务（需{mission.requiredTeamSize}人）
          </div>
          <p>
            结果：
            {mission.result === 'success'
              ? '成功'
              : mission.result === 'fail'
              ? '失败'
              : '未完成'}
          </p>

          {mission.proposals.map((proposal, index) => (
            <div key={index} className="proposal-block">
              <p>第{proposal.round}轮</p>
              <p>队长：{playerMap[proposal.captainId]}</p>
              <p>队伍：{proposal.teamPlayerIds.map((id) => playerMap[id]).join('、')}</p>
              <p>通过：{proposal.passed ? '通过' : '未通过'}</p>
              <p>直出轮：{proposal.isDirectMissionRound ? '是' : '否'}</p>

              {!proposal.isDirectMissionRound && (
                <p>
                  投票：
                  {proposal.votes
                    .map((vote) => `${playerMap[vote.playerId]}:${vote.vote === 'approve' ? '同意' : '反对'}`)
                    .join('；')}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}