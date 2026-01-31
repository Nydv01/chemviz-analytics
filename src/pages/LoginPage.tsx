import React, { useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import {
  FlaskConical,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const { login } = useAuth()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ---------- 3D Card Tilt ---------- */
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-120, 120], [6, -6])
  const rotateY = useTransform(mx, [-120, 120], [-6, 6])

  const resetError = () => error && setError(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    resetError()
    setIsLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err: any) {
      setError(err?.message || "Unable to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    if (isLoading) return
    resetError()
    setIsLoading(true)
    try {
      await login("demo", "demo")
    } catch {
      setError("Demo login failed. Please retry.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">

      {/* ---------- Ambient Motion Lights ---------- */}
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-primary/30 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ opacity: [0.12, 0.3, 0.12] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-chart-2/30 rounded-full blur-[120px]"
      />

      {/* ================= LEFT BRANDING ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-primary/20 to-sidebar" />

        <div className="relative z-10 flex flex-col justify-center p-14 text-white">
          <div className="flex items-center gap-4 mb-12">
            <motion.div
              whileHover={{ scale: 1.12 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20"
            >
              <FlaskConical className="h-8 w-8" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">ChemViz</h1>
              <p className="text-white/70">Equipment Analytics Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Chemical Equipment
            <br />
            <span className="text-primary-foreground/80">
              Parameter Visualizer
            </span>
          </h2>

          <p className="text-lg text-white/70 max-w-md mb-12">
            Upload CSV datasets, analyze parameters, visualize trends, and
            generate professional PDF reports.
          </p>

          {/* ---------- Floating Feature Pills ---------- */}
          <div className="flex flex-wrap gap-4">
            {["CSV Analytics", "Interactive Charts", "PDF Reports"].map(
              (feature, i) => (
                <motion.div
                  key={feature}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 3.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.08 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  {feature}
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ================= RIGHT LOGIN ================= */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            mx.set(e.clientX - r.left - r.width / 2)
            my.set(e.clientY - r.top - r.height / 2)
          }}
          onMouseLeave={() => {
            mx.set(0)
            my.set(0)
          }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-10 rounded-3xl relative overflow-hidden">

            {/* ---------- Glass Light Sweep ---------- */}
            <motion.div
              initial={{ x: "-120%" }}
              whileHover={{ x: "120%" }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-muted-foreground">
                Sign in to your research dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Username */}
              <div className="space-y-2">
                <Label>Username</Label>
                <motion.div whileFocus={{ scale: 1.04 }}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      autoFocus
                      disabled={isLoading}
                      value={username}
                      onChange={(e) => {
                        resetError()
                        setUsername(e.target.value)
                      }}
                      className="pl-10 h-12 rounded-xl focus:ring-2 focus:ring-primary/40 transition-all"
                      placeholder="Enter username"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <motion.div whileFocus={{ scale: 1.04 }}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => {
                        resetError()
                        setPassword(e.target.value)
                      }}
                      className="pl-10 h-12 rounded-xl focus:ring-2 focus:ring-primary/40 transition-all"
                      placeholder="Enter password"
                    />
                  </div>
                </motion.div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              {/* Sign In Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl gap-2 shadow-lg"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* Demo */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full h-12 rounded-xl gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Try Demo Mode
              </Button>
            </motion.div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Demo credentials:{" "}
              <code className="rounded bg-muted px-2 py-0.5 text-xs">
                demo / demo
              </code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
