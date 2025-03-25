import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "../src/pages/HomePage"
import DashboardPage from "../src/pages/DashboardPage"
import SponsorshipsPage from "../src/pages/Sponsorships"
import CollaborationsPage from "../src/pages/Collaborations"
import MessagesPage from "../src/pages/Messages"
import LoginPage from "./pages/Login"
import SignupPage from "./pages/Signup"
import ForgotPasswordPage from "./pages/ForgotPassword"
import ResetPasswordPage from "./pages/ResetPassword"

import ContractsPage from "./pages/Contracts"

import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Brand/Dashboard"
import BasicDetails from "./pages/BasicDetails"

function App() {
  return (
    <Router>  
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>} />
          <Route path='/forgot-password' element={<ForgotPasswordPage/>} />
          <Route path='/reset-password' element={<ResetPasswordPage/>} />
          <Route path='/brand/dashboard' element={<Dashboard/>} />
          <Route path='/basicDetails/:user' element={<BasicDetails/>} />

         
          <Route path="/dashboard" element={<DashboardPage />}/>
            <Route path="/sponsorships" element={<SponsorshipsPage />} />
            <Route path="/collaborations" element={<CollaborationsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
           
            <Route path="/contracts" element={<ContractsPage></ContractsPage>}/>
      
          
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

