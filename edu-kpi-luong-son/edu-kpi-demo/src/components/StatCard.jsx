import React from "react";

export default function StatCard({ label, value, suffix, icon: Icon, accent = "primary" }) {
  const accentMap = {
    primary: "bg-primary-50 text-primary-500",
    gold: "bg-gold-100 text-gold-600",
    danger: "bg-red-50 text-danger",
  };
  return (
    <div className="bg-white rounded-card shadow-card border border-line p-5 flex items-start justify-between">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </div>
        <div className="mt-2 font-mono font-semibold text-2xl text-ink">
          {value}
          {suffix && <span className="text-base text-ink-muted ml-1">{suffix}</span>}
        </div>
      </div>
      {Icon && (
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
