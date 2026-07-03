import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

// Redirects to / if user is not logged in
function ProtectedRoute({ children }) {
  const { loggedIn } = useApp();
  return loggedIn ? children : <Navigate to="/" replace />;
}

// All app routes live here, inside the providers
function AppLayout() {
  return (
    <>
      <Header />
      <main className="mainContent">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/movies"    element={<MoviesPage />} />
          <Route path="/series"    element={<SeriesPage />} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}