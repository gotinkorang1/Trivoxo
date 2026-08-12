'use client'

import { useEffect } from 'react'
import { useSyncExternalStore } from 'react'
import {
  readActiveTheme,
  syncThemeFromStorage,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  updateFavicon,
  type Theme,
} from '@/lib/theme'

function subscribe(callback: () => void) {
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

function getTheme(): Theme {
  return readActiveTheme()
}

export function ThemeFavicon() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light')

  useEffect(() => {
    updateFavicon(theme)
  }, [theme])

  return null
}
