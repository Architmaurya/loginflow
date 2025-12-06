import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") || ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {

      // 🔥 FIX: Skip refresh if NO cookie present
      const hasRefreshCookie = document.cookie.includes("jwt=");
      if (!hasRefreshCookie) {
        console.log("⏩ No refresh token cookie found — skipping refresh.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.post("/auth/refresh");

        console.log("🔄 Refresh success:", res.data);

        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);

      } catch (err) {
        console.log("❌ Refresh failed — clearing session");

        setUser(null);
        setAccessToken("");
        localStorage.removeItem("accessToken");

      } finally {
        setLoading(false);
      }
    };

    tryRefresh();
  }, []);

  const setAuthFromLoginResponse = (data) => {
    console.log("✅ Login success:", data);

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      console.log("🚪 Logged out");
    } catch (err) {
      console.log("Logout error:", err);
    }

    setUser(null);
    setAccessToken("");
    localStorage.removeItem("accessToken");
  };

  const value = {
    user,
    accessToken,
    loading,
    logout,
    setAuthFromLoginResponse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
