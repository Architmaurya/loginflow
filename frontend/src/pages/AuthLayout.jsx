import React from "react";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mb-5">{subtitle}</p>}
        {children}
        {/* <p className="mt-6 text-xs text-center text-slate-500">
          Advanced Auth · OTP · JWT · MongoDB
        </p> */}
      </div>
    </div>
  );
};

export default AuthLayout;
