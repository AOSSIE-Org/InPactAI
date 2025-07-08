import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SponsorshipsPage from "./pages/Sponsorships";
import CollaborationsPage from "./pages/Collaborations";
import MessagesPage from "./pages/Messages";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import Contracts from "./pages/Contracts";
import Analytics from "./pages/Analytics";
import RoleSelection from "./pages/RoleSelection";
import NotificationsPage from "./pages/Notifications";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./pages/Brand/Dashboard";
import BasicDetails from "./pages/BasicDetails";
import Onboarding from "./components/Onboarding";
import { UserNav } from "./components/user-nav";
import { supabase } from "./utils/supabase";

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated) return;
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) return;
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${apiBaseUrl}/notifications/`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) return;
        const notifications = await res.json();
        const unread = notifications.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
  }, [isAuthenticated, user]);

  return (
    <>
      {location.pathname !== "/notifications" && <UserNav unreadCount={unreadCount} />}
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
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        {/* Protected Routes*/}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/sponsorships" element={
          <ProtectedRoute>
            <SponsorshipsPage />
          </ProtectedRoute>
        } />
        <Route path="/collaborations" element={
          <ProtectedRoute>
            <CollaborationsPage />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

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
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
