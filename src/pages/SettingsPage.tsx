import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

const THEME_KEY = 'chemviz-theme'
const NOTIFY_KEY = 'chemviz-notifications'

type ThemeMode = 'dark' | 'light'

type NotificationPrefs = {
  email: boolean
  browser: boolean
  reports: boolean
}

/* ------------------------------------------------------------------ */
/* Reusable Layout Components                                          */
/* ------------------------------------------------------------------ */

function Section({
  title,
  description,
  icon,
  children,
  delay = 0,
}: {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6"
    >
      <div className="flex gap-4 mb-6">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function Row({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MAIN SETTINGS PAGE                                                  */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  /* ------------------ THEME --------------------------------------- */

  const [theme, setTheme] = useState<ThemeMode>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark'
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem(THEME_KEY, next)
    document.documentElement.classList.toggle('dark', next === 'dark')

    toast({
      title: 'Theme updated',
      description: `Switched to ${next} mode`,
    })
  }

  /* ------------------ NOTIFICATIONS -------------------------------- */

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    browser: false,
    reports: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem(NOTIFY_KEY)
    if (saved) setNotifications(JSON.parse(saved))
  }, [])

  const updateNotification = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...notifications, [key]: value }
    setNotifications(next)
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(next))
  }

  /* ------------------ DATA EXPORT ---------------------------------- */

  const handleExportData = () => {
    const payload = {
      user,
      notifications,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chemviz-user-data.json'
    a.click()

    toast({
      title: 'Export complete',
      description: 'Your data has been downloaded.',
    })
  }

  /* ------------------ DELETE ACCOUNT (SAFE) ------------------------ */

  const handleDeleteAccount = () => {
    toast({
      title: 'Action blocked',
      description:
        'Account deletion must be performed via administrator approval.',
      variant: 'destructive',
    })
  }

  /* ---------------------------------------------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Account preferences and system configuration
          </p>
        </div>
      </div>

      {/* Profile */}
      <Section
        title="Profile"
        description="User identity and account information"
        icon={<User className="h-6 w-6" />}
        delay={0.05}
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {user?.first_name} {user?.last_name || ''}
            </h3>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section
        title="Appearance"
        description="Theme and visual preferences"
        icon={<Palette className="h-6 w-6" />}
        delay={0.1}
      >
        <Row label="Dark Mode" description="System-wide theme preference">
          <div className="flex items-center gap-3">
            <Sun className="h-4 w-4" />
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4" />
          </div>
        </Row>
      </Section>

      {/* Notifications */}
      <Section
        title="Notifications"
        description="How you receive updates"
        icon={<Bell className="h-6 w-6" />}
        delay={0.15}
      >
        <Row label="Email Notifications">
          <Switch
            checked={notifications.email}
            onCheckedChange={(v) => updateNotification('email', v)}
          />
        </Row>
        <Row label="Browser Notifications">
          <Switch
            checked={notifications.browser}
            onCheckedChange={(v) => updateNotification('browser', v)}
          />
        </Row>
        <Row label="Weekly Reports">
          <Switch
            checked={notifications.reports}
            onCheckedChange={(v) => updateNotification('reports', v)}
          />
        </Row>
      </Section>

      {/* Data & Privacy */}
      <Section
        title="Data & Privacy"
        description="Control your stored information"
        icon={<Shield className="h-6 w-6" />}
        delay={0.2}
      >
        <Row label="Export Account Data">
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </Row>
        <Row label="Retention Policy">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Database className="h-4 w-4" />
            Last 5 datasets retained
          </div>
        </Row>
      </Section>

      {/* Danger Zone */}
      <Section
        title="Account Actions"
        description="Critical actions"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        delay={0.25}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </div>
      </Section>
    </motion.div>
  )
}
