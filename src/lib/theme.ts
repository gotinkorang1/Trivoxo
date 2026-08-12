export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'trivoxo-theme'
export const THEME_CHANGE_EVENT = 'trivoxo-theme-change'

export const FAVICON = {
  light: '/favicon/favicon-light.png',
  dark: '/favicon/favicon-dark.png',
} as const

export function resolveTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function readActiveTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function updateFavicon(theme: Theme) {
  const href = FAVICON[theme]
  const links = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"]',
  )

  if (links.length === 0) {
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = href
    document.head.appendChild(link)
    return
  }

  links.forEach((link) => {
    link.removeAttribute('media')
    link.href = href
  })
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {}
  updateFavicon(theme)
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export function syncThemeFromStorage() {
  const theme = resolveTheme()
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  updateFavicon(theme)
}
