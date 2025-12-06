import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const App = () => {
  const { user } = useAuth();

  // Backend base URL from env
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const pingBackend = () => {
      fetch(`${API_URL}/auth/welcome`)
        .then(() => console.log("🔥 Backend keep-alive ping success"))
        .catch(() => console.log("⚠ Backend ping failed"));
    };

    pingBackend(); // first call immediately

    const interval = setInterval(pingBackend, 180000); // every 3 min

    return () => clearInterval(interval);
  }, [API_URL]);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
