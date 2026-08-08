'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

function activeTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('trivoxo-theme-change', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('trivoxo-theme-change', callback)
    window.removeEventListener('storage', callback)
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeToTheme, activeTheme, () => 'light')

  function toggleTheme() {
    const nextTheme = activeTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    document.documentElement.style.colorScheme = nextTheme
    localStorage.setItem('trivoxo-theme', nextTheme)
    window.dispatchEvent(new Event('trivoxo-theme-change'))
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
