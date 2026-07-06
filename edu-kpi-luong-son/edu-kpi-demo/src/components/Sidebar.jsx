import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  School,
  FolderArchive,
  BookMarked,
  LogOut,
} from "lucide-react";
import { useAuth, ROLE_LABEL } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Tổng quan KPI", icon: LayoutDashboard, roles: null },
  { to: "/hoc-sinh", label: "Học sinh", icon: GraduationCap, roles: ["ADMIN", "CAN_BO_VHXH"] },
  { to: "/truong-hoc", label: "Trường học", icon: School, roles: ["ADMIN", "CAN_BO_VHXH"] },
  { to: "/ho-so", label: "Hồ sơ giáo dục", icon: FolderArchive, roles: ["ADMIN", "CAN_BO_VHXH"] },
  { to: "/van-ban", label: "Kho văn bản", icon: BookMarked, roles: null },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-primary-600 text-white h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="text-gold-300 text-xs font-mono tracking-widest uppercase">
          Xã Lương Sơn · Lâm Đồng
        </div>
        <div className="font-display font-bold text-lg leading-snug mt-1">
          Số hóa Hồ sơ<br />Giáo dục
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role)).map(
          (item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-primary-600"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r bg-gold-300" />
                    )}
                    <Icon size={18} strokeWidth={2} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          }
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-white/60">Đăng nhập với vai trò</div>
        <div className="text-sm font-semibold text-gold-300 mb-3">
          {ROLE_LABEL[user?.role]}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
