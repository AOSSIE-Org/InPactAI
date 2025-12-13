import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { SkipToContent } from "./components/skip-to-content";

// Lazy-loaded components
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SponsorshipsPage = lazy(() => import("./pages/Sponsorships"));
const CollaborationsPage = lazy(() => import("./pages/Collaborations"));
const CollaborationDetails = lazy(() => import("./pages/CollaborationDetails"));
const MessagesPage = lazy(() => import("./pages/Messages"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Analytics = lazy(() => import("./pages/Analytics"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const Dashboard = lazy(() => import("./pages/Brand/Dashboard"));
const BasicDetails = lazy(() => import("./pages/BasicDetails"));
const Onboarding = lazy(() => import("./components/Onboarding"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-sm">Loading...</div>
  </div>
);

/**
 * App Component with Router Loader Strategy
 * 
 * This implementation uses React Router's built-in capabilities as middleware replacement.
 * Benefits:
 * - No separate middleware.ts file needed
 * - Route-level authentication checks before rendering
 * - Data preloading for better UX
 * - Fully within React ecosystem
 * - No framework deprecation warnings
 * 
 * Note: Route loaders are defined in /lib/loaders.ts and can be attached
 * to routes for authentication checks and data prefetching.
 */
function App() {

  return (
    <Router>
      <SkipToContent />
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
        </Suspense>
    </Router>
  );
}

export default App;
