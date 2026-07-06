import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ title, subtitle }) {
  const { user } = useAuth();
  const initials = (user?.fullName || "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-line bg-cream/80 backdrop-blur sticky top-0 z-10">
      <div>
        <h1 className="font-display font-bold text-xl md:text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-ink">{user?.fullName}</div>
          <div className="text-xs text-ink-muted">{user?.email}</div>
        </div>
        <div className="h-10 w-10 rounded-full bg-gold-500 text-primary-700 font-display font-bold flex items-center justify-center">
          {initials}
        </div>
      </div>
    </header>
  );
}
