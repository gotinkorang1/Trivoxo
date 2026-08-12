'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  applyTheme,
  readActiveTheme,
  syncThemeFromStorage,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/lib/theme'

function subscribeToTheme(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY) {
      syncThemeFromStorage()
    }
    callback()
  }

  window.addEventListener(THEME_CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeToTheme, readActiveTheme, () => 'light')

  function toggleTheme() {
    const nextTheme: Theme = readActiveTheme() === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={cn(
        'group relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-elevated text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-link hover:shadow-soft',
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'absolute size-4.5 transition-all duration-300',
          isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'absolute size-4.5 transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
        )}
      />
      <span className="sr-only">Toggle colour theme</span>
    </button>
  )
}
