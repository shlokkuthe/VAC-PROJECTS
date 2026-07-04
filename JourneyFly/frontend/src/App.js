import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Dashboard from "./pages/Dashboard/Dashboard";
import Trips from "./pages/Trips/Trips";
import TripDetails from "./pages/TripDetails/TripDetails";
import CreateTrip from "./pages/CreateTrip/CreateTrip";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import NotFound from "./pages/NotFound/NotFound";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="global-loader-container">
                <div className="global-loader"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Route wrapper that redirects logged-in users away from auth pages (e.g. login, signup)
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="global-loader-container">
                <div className="global-loader"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            className: "toast-container",
                            style: {
                                background: "var(--card)",
                                color: "var(--text)",
                                border: "1px solid var(--border)",
                            },
                        }} 
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/"
                            element={
                                <MainLayout>
                                    <Home />
                                </MainLayout>
                            }
                        />

                        {/* Guest Auth Routes */}
                        <Route
                            path="/login"
                            element={
                                <GuestRoute>
                                    <AuthLayout>
                                        <Login />
                                    </AuthLayout>
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <GuestRoute>
                                    <AuthLayout>
                                        <Signup />
                                    </AuthLayout>
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <GuestRoute>
                                    <AuthLayout>
                                        <ForgotPassword />
                                    </AuthLayout>
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/reset-password"
                            element={
                                <GuestRoute>
                                    <AuthLayout>
                                        <ResetPassword />
                                    </AuthLayout>
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/verify-email"
                            element={
                                <AuthLayout>
                                    <VerifyEmail />
                                </AuthLayout>
                            }
                        />

                        {/* Protected User Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Dashboard />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/trips"
                            element={
                                <MainLayout>
                                    <Trips />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/trips/:id"
                            element={
                                <MainLayout>
                                    <TripDetails />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/create-trip"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <CreateTrip />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Profile />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Settings />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <MainLayout>
                                        <AdminDashboard />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* 404 Route */}
                        <Route
                            path="*"
                            element={
                                <MainLayout>
                                    <NotFound />
                                </MainLayout>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;