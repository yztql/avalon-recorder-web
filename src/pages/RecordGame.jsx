import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getCurrentMission,
  getCurrentCaptain,
  isProposalPassed,
  addProposal,
  moveToNextProposal,
  finishMission,
  getMissionStatus,
} from '../utils/game'
import { getGameRowById, updateGameInRoom } from '../utils/roomApi'

export default function RecordGame() {
  const navigate = useNavigate()
  const { roomCode, gameId } = useParams()

  const [gameRow, setGameRow] = useState(null)
  const [game, setGame] = useState(null)
  const [selectedTeamIds, setSelectedTeamIds] = useState([])
  const [votesMap, setVotesMap] = useState({})
  const [canSetMissionResult, setCanSetMissionResult] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const row = await getGameRowById(gameId)
        setGameRow(row)
        setGame(row.game_data)
      } catch (err) {
        console.error(err)
        alert('加载对局失败')
      }
    }
    load()
  }, [gameId])

  const status = useMemo(() => {
    return game ? getMissionStatus(game) : null
  }, [game])

  const isDirectMissionRound = useMemo(() => {
    if (!game) return false
    return (
      game.ruleConfig.fifthRoundDirectMission &&
      game.currentProposalRound === game.ruleConfig.maxProposalRounds
    )
  }, [game])

  async function persistGame(nextGame) {
    const updated = await updateGameInRoom(gameRow.id, nextGame)
    setGameRow(updated)
    setGame(updated.game_data)
  }

  function resetCurrentStepState() {
    setSelectedTeamIds([])
    setVotesMap({})
    setCanSetMissionResult(false)
  }

  function toggleTeamMember(playerId) {
    if (!status) return

    setSelectedTeamIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId)
      }
      if (prev.length >= status.requiredTeamSize) {
        alert('人数已满')
        return prev
      }
      return [...prev, playerId]
    })
  }

  function setVote(playerId, vote) {
    setVotesMap((prev) => ({
      ...prev,
      [playerId]: vote,
    }))
  }

  async function submitProposal() {
    if (!game || !status) return

    if (selectedTeamIds.length !== status.requiredTeamSize) {
      alert('队员人数不对')
      return
    }

    const voteEntries = game.players.map((player) => ({
      playerId: player.id,
      vote: votesMap[player.id],
    }))

    if (voteEntries.some((item) => !item.vote)) {
      alert('请完成所有投票')
      return
    }

    const captain = getCurrentCaptain(game)
    const passed = isProposalPassed(voteEntries)
    const nextGame = addProposal({ ...game }, {
      captainId: captain.id,
      teamPlayerIds: selectedTeamIds,
      votes: voteEntries,
      passed,
      isDirectMissionRound: false,
    })

    if (passed) {
      await persistGame(nextGame)
      setCanSetMissionResult(true)
      return
    }

    const movedGame = moveToNextProposal(nextGame)
    await persistGame(movedGame)
    resetCurrentStepState()
  }

  async function completeMission(result) {
    if (!game) return

    let nextGame = { ...game }

    if (isDirectMissionRound) {
      const currentMission = getCurrentMission(nextGame)

      if (selectedTeamIds.length !== currentMission.requiredTeamSize) {
        alert('队员人数不对')
        return
      }

      const captain = getCurrentCaptain(nextGame)

      nextGame = addProposal(nextGame, {
        captainId: captain.id,
        teamPlayerIds: selectedTeamIds,
        votes: [],
        passed: true,
        isDirectMissionRound: true,
      })
    }

    nextGame = finishMission(nextGame, result)
    await persistGame(nextGame)
    resetCurrentStepState()

    if (nextGame.finished) {
      navigate(`/room/${roomCode}/detail/${gameId}`)
    }
  }

  if (!game || !status) {
    return <div className="card">加载中...</div>
  }

  return (
    <div>
      <div className="card">
        <h2>当前对局</h2>
        <p>任务：第 {status.missionNumber} 个</p>
        <p>提队轮次：第 {status.proposalRound} 轮</p>
        <p>当前队长：{status.captainName}</p>
        <p>需要出队人数：{status.requiredTeamSize}</p>
        {isDirectMissionRound && <p className="warning">当前为第5轮直出，无需投票</p>}
      </div>

      <div className="card">
        <div className="section-title">
          选择队员（{selectedTeamIds.length} / {status.requiredTeamSize}）
        </div>
        <div className="chip-wrap">
          {game.players.map((player) => (
            <button
              key={player.id}
              className={`chip ${selectedTeamIds.includes(player.id) ? 'active' : ''}`}
              onClick={() => toggleTeamMember(player.id)}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      {!isDirectMissionRound && (
        <div className="card">
          <div className="section-title">记录投票</div>
          <div className="vote-list">
            {game.players.map((player) => (
              <div key={player.id} className="vote-row">
                <span>{player.name}</span>
                <div className="vote-actions">
                  <button
                    className={votesMap[player.id] === 'approve' ? 'approve active' : 'approve'}
                    onClick={() => setVote(player.id, 'approve')}
                  >
                    同意
                  </button>
                  <button
                    className={votesMap[player.id] === 'reject' ? 'reject active' : 'reject'}
                    onClick={() => setVote(player.id, 'reject')}
                  >
                    不同意
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn primary full mt16" onClick={submitProposal}>
            保存本轮投票
          </button>
        </div>
      )}

      {(canSetMissionResult || isDirectMissionRound) && (
        <div className="card">
          <div className="section-title">记录任务结果</div>
          <button className="btn success full" onClick={() => completeMission('success')}>
            任务成功
          </button>
          <button className="btn danger full mt16" onClick={() => completeMission('fail')}>
            任务失败
          </button>
        </div>
      )}
    </div>
  )
}