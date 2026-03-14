import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import RoomHome from './pages/RoomHome'
import CreateGame from './pages/CreateGame'
import RecordGame from './pages/RecordGame'
import History from './pages/History'
import GameDetail from './pages/GameDetail'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomCode" element={<RoomHome />} />
        <Route path="/room/:roomCode/create" element={<CreateGame />} />
        <Route path="/room/:roomCode/record/:gameId" element={<RecordGame />} />
        <Route path="/room/:roomCode/history" element={<History />} />
        <Route path="/room/:roomCode/detail/:gameId" element={<GameDetail />} />
      </Routes>
    </Layout>
  )
}