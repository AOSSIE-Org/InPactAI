import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "../src/pages/HomePage"
import DashboardPage from "../src/pages/DashboardPage"
import SponsorshipsPage from "../src/pages/Sponsorships"
import CollaborationsPage from "../src/pages/Collaborations"
import MessagesPage from "../src/pages/Messages"

function App() {
  return (
    <Router>  
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/sponsorships" element={<SponsorshipsPage />} />
          <Route path="/dashboard/collaborations" element={<CollaborationsPage />} />
          <Route path="/dashboard/messages" element={<MessagesPage />} />
        </Routes>
    </Router>
  )
}

export default App

