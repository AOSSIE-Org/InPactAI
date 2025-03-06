import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import "./index.css"
// import "../styles/globals.css"
// import { ThemeProvider } from "../src/components/theme-provider"
import HomePage from "../src/pages/HomePage"
import DashboardPage from "../src/pages/DashboardPage"
import SponsorshipsPage from "../src/pages/Sponsorships"
import CollaborationsPage from "../src/pages/Collaborations"
// import ContractsPage from "../pages/ContractsPage"
// import AnalyticsPage from "../pages/AnalyticsPage"
import MessagesPage from "../src/pages/Messages"

function App() {
  return (
    <Router>  
      {/* <ThemeProvider defaultTheme="system" storageKey="inpact-theme"> */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/sponsorships" element={<SponsorshipsPage />} />
          <Route path="/dashboard/collaborations" element={<CollaborationsPage />} />
          {/* <Route path="/dashboard/contracts" element={<ContractsPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} /> */}
          <Route path="/dashboard/messages" element={<MessagesPage />} />
        </Routes>
      {/* </ThemeProvider> */}
    </Router>
  )
}

export default App

