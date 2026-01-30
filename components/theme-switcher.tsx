"use client"

import type React from "react"

import { useTheme, type Theme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { Gamepad2, Sword, Zap } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: "retro",
      label: "Retro",
      icon: <Gamepad2 className="h-4 w-4" />,
      description: "Arcade 80s",
    },
    {
      value: "medieval",
      label: "Medieval",
      icon: <Sword className="h-4 w-4" />,
      description: "Fantasy RPG",
    },
    {
      value: "futuristic",
      label: "Futurista",
      icon: <Zap className="h-4 w-4" />,
      description: "Cyberpunk",
    },
  ]

  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-card/50 backdrop-blur-sm border-2 border-border">
      {themes.map((t) => (
        <Button
          key={t.value}
          variant={theme === t.value ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(t.value)}
          className="gap-2 transition-all relative overflow-hidden"
          title={t.description}
        >
          {t.icon}
          <span className="hidden sm:inline font-bold">{t.label}</span>
        </Button>
      ))}
    </div>
  )
}
