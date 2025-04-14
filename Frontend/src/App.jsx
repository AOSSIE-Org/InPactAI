import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BasicDetails from "./pages/BasicDetails";
import ResetPasswordPage from "./pages/ResetPassword";
import Contracts from "./pages/Contracts";
import Analytics from "./pages/Analytics";

import ContractsPage from "./pages/Contracts";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Brand/Dashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/brand/dashboard" element={<Dashboard />} />
          <Route path="/basicDetails/:user" element={<BasicDetails />} />

          {/* Protected Routes */}
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
                <ContractsPage />
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
