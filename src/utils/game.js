import { getMissionSizes } from './rules'

function createPlayer(name, index) {
  return {
    id: `p_${index + 1}`,
    name: (name || '').trim() || `玩家${index + 1}`,
  }
}

export function createNewGame({ playerNames, playerCount }) {
  const players = playerNames.map((name, index) => createPlayer(name, index))
  const missionSizes = getMissionSizes(playerCount)

  const missions = missionSizes.map((size, index) => ({
    missionNumber: index + 1,
    requiredTeamSize: size,
    proposals: [],
    result: '',
  }))

  return {
    createdAt: new Date().toISOString(),
    playerCount,
    players,
    ruleConfig: {
      missionSizes,
      maxProposalRounds: 5,
      fifthRoundDirectMission: true,
    },
    currentMissionIndex: 0,
    currentCaptainIndex: 0,
    currentProposalRound: 1,
    missions,
    finished: false,
  }
}

export function getCurrentMission(game) {
  return game.missions[game.currentMissionIndex]
}

export function getCurrentCaptain(game) {
  return game.players[game.currentCaptainIndex]
}

export function nextCaptainIndex(game, currentIndex) {
  return (currentIndex + 1) % game.players.length
}

export function isProposalPassed(votes) {
  const approveCount = votes.filter((v) => v.vote === 'approve').length
  const rejectCount = votes.filter((v) => v.vote === 'reject').length
  return approveCount > rejectCount
}

export function addProposal(game, payload) {
  const mission = getCurrentMission(game)

  mission.proposals.push({
    round: game.currentProposalRound,
    captainId: payload.captainId,
    teamPlayerIds: payload.teamPlayerIds,
    votes: payload.votes || [],
    passed: payload.passed,
    isDirectMissionRound: !!payload.isDirectMissionRound,
  })

  return { ...game }
}

export function moveToNextProposal(game) {
  game.currentProposalRound += 1
  game.currentCaptainIndex = nextCaptainIndex(game, game.currentCaptainIndex)
  return { ...game }
}

export function finishMission(game, result) {
  const mission = getCurrentMission(game)
  mission.result = result

  if (game.currentMissionIndex >= game.missions.length - 1) {
    game.finished = true
    return { ...game }
  }

  game.currentMissionIndex += 1
  game.currentProposalRound = 1
  game.currentCaptainIndex = nextCaptainIndex(game, game.currentCaptainIndex)
  return { ...game }
}

export function getMissionStatus(game) {
  const mission = getCurrentMission(game)
  const captain = getCurrentCaptain(game)

  return {
    missionNumber: mission.missionNumber,
    requiredTeamSize: mission.requiredTeamSize,
    proposalRound: game.currentProposalRound,
    captainName: captain.name,
  }
}