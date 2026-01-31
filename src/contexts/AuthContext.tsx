/**
 * Authentication Context – Production Grade (FIXED)
 *
 * ✔ Django session auth
 * ✔ Clean demo fallback
 * ✔ No phantom API calls
 * ✔ Zero TypeScript errors
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"

import type { User } from "@/types/equipment"
import { authAPI } from "@/services/api"

/* ===================== Types ===================== */

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isDemoMode: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/* ===================== Context ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* ===================== Demo User ===================== */

const DEMO_USER: User = {
  id: 0,
  username: "demo",
  email: "demo@chemical-lab.edu",
  first_name: "Demo",
  last_name: "User",
}

/* ===================== Provider ===================== */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  /* ---------- Bootstrap Session ---------- */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authAPI.getCurrentUser()
        setUser(res.user)
        setIsDemoMode(false)
      } catch {
        // fallback to demo if exists
        if (localStorage.getItem("demo_session") === "true") {
          setUser(DEMO_USER)
          setIsDemoMode(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  /* ---------- Login ---------- */
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await authAPI.login(username, password)
      setUser(res.user)
      setIsDemoMode(false)
      localStorage.removeItem("demo_session")
    } catch (error: any) {
      const networkFail =
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError")

      if (username === "demo" && password === "demo" && networkFail) {
        localStorage.setItem("demo_session", "true")
        setUser(DEMO_USER)
        setIsDemoMode(true)
        return
      }

      throw error
    }
  }, [])

  /* ---------- Logout ---------- */
  const logout = useCallback(async () => {
    try {
      if (!isDemoMode) {
        await authAPI.logout()
      }
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem("demo_session")
      setUser(null)
      setIsDemoMode(false)
    }
  }, [isDemoMode])

  /* ---------- Context Value ---------- */
  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isDemoMode,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ===================== Hook ===================== */

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return ctx
}
