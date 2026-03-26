import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "../src/pages/HomePage";
import DashboardPage from "../src/pages/DashboardPage";
import SponsorshipsPage from "../src/pages/Sponsorships";
import CollaborationsPage from "../src/pages/Collaborations";
import CollaborationDetails from "../src/pages/CollaborationDetails";
import MessagesPage from "../src/pages/Messages";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import Contracts from "./pages/Contracts";
import Analytics from "./pages/Analytics";
import RoleSelection from "./pages/RoleSelection";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./pages/Brand/Dashboard";
import BasicDetails from "./pages/BasicDetails";
import Onboarding from "./components/Onboarding";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure the app loads
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="text-lg font-semibold text-purple-600">Loading Inpact...</div>
        <div className="text-xs text-gray-500 mt-2">Connecting to the platform</div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />
          <Route path="/choose-role" element={<RoleSelection />} />
          <Route path="/onboarding/brand" element={<div>Brand Onboarding (Coming Soon)</div>} />
          <Route path="/onboarding/creator" element={<div>Creator Onboarding (Coming Soon)</div>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/brand/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/basicDetails/:user" element={<BasicDetails />} />
          <Route path="/creator/messages" element={<MessagesPage />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

          {/* Protected Routes*/}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sponsorships"
            element={
              <ProtectedRoute>
                <SponsorshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/collaborations"
            element={
              <ProtectedRoute>
                <CollaborationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/collaborations/:id"
            element={
              <ProtectedRoute>
                <CollaborationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/contracts"
            element={
              <ProtectedRoute>
                <Contracts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
