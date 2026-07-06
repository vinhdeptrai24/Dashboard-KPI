import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/apiClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ls_token");
    const cachedUser = localStorage.getItem("ls_user");
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem("ls_token", data.token);
    localStorage.setItem("ls_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("ls_token");
    localStorage.removeItem("ls_user");
    setUser(null);
  }

  const value = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong AuthProvider");
  return ctx;
}

export const ROLE_LABEL = {
  ADMIN: "Quản trị viên",
  CAN_BO_VHXH: "Cán bộ Văn hóa - Xã hội",
  LANH_DAO_UBND: "Lãnh đạo UBND xã",
};

export const CAN_EDIT_ROLES = ["ADMIN", "CAN_BO_VHXH"];
