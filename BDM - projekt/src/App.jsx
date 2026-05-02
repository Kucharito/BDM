import { Navigate, Route, Routes } from 'react-router-dom'
import AlertBanner from './components/AlertBanner'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
import MyEvents from './pages/MyEvents'
import MyTickets from './pages/MyTickets'
import EndedEvents from './pages/EndedEvents'
import { useWallet } from './hooks/useWallet'

function App() {
  const { hasMetaMask, walletError, isWrongNetwork, isAdmin } = useWallet()

  return (
    <div className="page-root">
      <Navbar />

      <main className="container page-content">
        {!hasMetaMask ? (
          <AlertBanner
            type="error"
            message="MetaMask not detected. Install MetaMask to interact with the smart contract."
          />
        ) : null}

        {walletError ? <AlertBanner type="error" message={walletError} /> : null}
        {isWrongNetwork ? (
          <AlertBanner type="error" message="Wrong network detected in wallet. Switch to the configured chain." />
        ) : null}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/create" element={isAdmin ? <CreateEvent /> : <Navigate to="/" replace />} />
          <Route path="/my-events" element={isAdmin ? <MyEvents /> : <Navigate to="/" replace />} />
          <Route path="/my-tickets" element={!isAdmin ? <MyTickets /> : <Navigate to="/" replace />} />
          <Route path="/ended-events" element={<EndedEvents />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
