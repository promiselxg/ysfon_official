"use client";

import { createContext, useContext, useEffect, useState } from "react";

import Cookies from "js-cookie";
import { useAuthStore } from "@/lib/authStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, loginUser, logoutUser } = useAuthStore();
  const [mounted, setIsMounted] = useState();
  // Auto-login on page refresh
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      useAuthStore.setState({ isAuthenticated: true });
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for authentication
export const useAuth = () => useContext(AuthContext);
