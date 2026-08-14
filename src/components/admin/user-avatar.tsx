'use client'

import { useEffect, useState } from 'react'
import { useAuth, useConfig } from '@payloadcms/ui'

type MediaLike = { url?: string | null; sizes?: { thumbnail?: { url?: string | null } } }

function initials(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? '?').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

function urlFrom(avatar: unknown): string | undefined {
  if (avatar && typeof avatar === 'object') {
    const m = avatar as MediaLike
    return m.sizes?.thumbnail?.url ?? m.url ?? undefined
  }
  return undefined
}

/**
 * Admin header avatar (admin.components.graphics? no — admin.avatar). Renders the
 * signed-in staff member's uploaded profile picture, falling back to their
 * initials. If the auth context hasn't populated the avatar relationship, it
 * fetches it once at depth 1.
 */
export function UserAvatar() {
  const { user } = useAuth()
  const { config } = useConfig()
  const apiBase = `${config?.serverURL ?? ''}${config?.routes?.api ?? '/api'}`

  const rawAvatar = (user as { avatar?: unknown })?.avatar
  // Populated relationship → derive during render, no state needed.
  const populated = urlFrom(rawAvatar)
  const [fetched, setFetched] = useState<string>()

  useEffect(() => {
    // Only when the avatar exists but is unpopulated (just an id): resolve once.
    if (populated || rawAvatar == null || !user?.id) return
    let cancelled = false
    void fetch(`${apiBase}/users/${user.id}?depth=1`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setFetched(urlFrom(data?.avatar))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [apiBase, user?.id, rawAvatar, populated])

  const src = populated ?? fetched
  const size = 25
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    )
  }

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#0c1d35',
        color: '#f9b233',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initials(user?.name, user?.email)}
    </span>
  )
}
