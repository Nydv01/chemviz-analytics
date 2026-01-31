
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

/* ===================== Demo User (TEMPORARY ONLY) ===================== */

const DEMO_USER: User = {
  id: -1,
  username: "demo",
  email: "demo@chemviz.app",
  first_name: "Demo",
  last_name: "User",
}

/* ===================== Provider ===================== */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * 🚨 IMPORTANT:
   * Demo mode is RUNTIME ONLY
   * It NEVER survives browser reload
   */
  const [isDemoMode, setIsDemoMode] = useState(false)

  /* ===================== Session Bootstrap ===================== */

  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async () => {
      try {
        const res = await authAPI.getCurrentUser()

        if (!isMounted) return

        setUser(res.user)
        setIsDemoMode(false)
      } catch {
        
        if (!isMounted) return
        setUser(null)
        setIsDemoMode(false)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [])

  /* ===================== Login ===================== */

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await authAPI.login(username, password)
      setUser(res.user)
      setIsDemoMode(false)
      return
    } catch (error: any) {
      /**
       * ✅ Demo mode allowed ONLY if:
       * - user explicitly logs in as demo
       * - backend is unreachable
       */
      const networkFailure =
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError")

      if (username === "demo" && password === "demo" && networkFailure) {
        setUser(DEMO_USER)
        setIsDemoMode(true)
        return
      }

      throw error
    }
  }, [])

  /* ===================== Logout ===================== */

  const logout = useCallback(async () => {
    try {
      if (!isDemoMode) {
        await authAPI.logout()
      }
    } catch {
      // ignore backend logout failure
    } finally {
      setUser(null)
      setIsDemoMode(false)
    }
  }, [isDemoMode])

  /* ===================== Context Value ===================== */

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
