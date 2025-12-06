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
      try {
        const res = await api.post("/auth/refresh");
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);
      } catch (err) {
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
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {}
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
