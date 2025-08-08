import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/vehicles/VehiclesPage";
import LeasesPage from "./pages/leases/LeasesPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import UsersPage from "./pages/users/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={
          !user ? <RegisterPage /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Vehicle routes */}
        <Route path="vehicles/*" element={<VehiclesPage />} />

        {/* Lease routes */}
        <Route path="leases/*" element={<LeasesPage />} />

        {/* Payment routes */}
        <Route path="payments/*" element={<PaymentsPage />} />

        {/* User management routes (Admin only) */}
        <Route path="users/*" element={<UsersPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
