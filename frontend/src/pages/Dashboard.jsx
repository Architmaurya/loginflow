import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios";

const Dashboard = () => {
  const { user, logout, accessToken } = useAuth();

  // const fetchProfile = async () => {
  //   try {
  //     const res = await api.get("/auth/me", {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     });
  //     console.log("ME:", res.data);
  //     alert("Profile data printed in console");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to fetch profile");
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-xl bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-xl animate-slideDown text-center">
        <h1 className="text-3xl font-semibold text-white mb-2">
          Welcome, {user?.email}
        </h1>

        <p className="text-sm text-slate-400 mb-6">
          You are successfully logged In.
        </p>

        <div className="flex flex-col items-center gap-3">
          {/* <button
            onClick={fetchProfile}
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-medium"
          >
            Call protected /me API
          </button> */}

          <button
            onClick={logout}
            className="mt-2 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
