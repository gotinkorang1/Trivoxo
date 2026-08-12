'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth, useConfig } from '@payloadcms/ui'

type AdminNotification = {
  id: number | string
  title: string
  message?: string | null
  category?: string | null
  adminURL?: string | null
  readAt?: string | null
  createdAt: string
}

const POLL_MS = 30_000

const CATEGORY_ICON: Record<string, string> = {
  booking: '🧾',
  payment: '💳',
  review: '⭐',
  enquiry: '✉️',
  event_order: '🎟️',
  account: '👤',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/**
 * Staff notification bell (rendered via admin.components.afterNavLinks).
 * Polls the signed-in user's own unread alerts every 30s and lets them open or
 * dismiss each one. Read state is per-user, enforced server-side.
 */
export function NotificationBell() {
  const { user } = useAuth()
  const { config } = useConfig()
  const apiBase = `${config?.serverURL ?? ''}${config?.routes?.api ?? '/api'}`
  const collectionURL = `${apiBase}/admin-notifications`

  const [items, setItems] = useState<AdminNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const userId = user?.id

  // Poll the signed-in user's unread alerts. The loader is defined inside the
  // effect and only sets state after the awaited fetch resolves.
  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    let active = true

    const load = async () => {
      const params = new URLSearchParams({
        'where[recipient][equals]': String(userId),
        'where[readAt][exists]': 'false',
        sort: '-createdAt',
        limit: '8',
        depth: '0',
      })
      try {
        const res = await fetch(`${collectionURL}?${params}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok || !active) return
        const data = (await res.json()) as { docs: AdminNotification[]; totalDocs: number }
        if (!active) return
        setItems(data.docs ?? [])
        setUnread(data.totalDocs ?? 0)
      } catch {
        // Network blips are non-fatal; the next poll retries.
      }
    }

    void load()
    const timer = window.setInterval(() => void load(), POLL_MS)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(timer)
    }
  }, [collectionURL, userId])

  // Close the dropdown on an outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const markRead = useCallback(
    async (id: number | string) => {
      try {
        await fetch(`${collectionURL}/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readAt: new Date().toISOString() }),
        })
      } catch {
        /* optimistic — refresh will reconcile */
      }
      setItems((prev) => prev.filter((n) => n.id !== id))
      setUnread((n) => Math.max(0, n - 1))
    },
    [collectionURL],
  )

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const params = new URLSearchParams({
      'where[recipient][equals]': String(userId),
      'where[readAt][exists]': 'false',
    })
    try {
      await fetch(`${collectionURL}?${params}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAt: new Date().toISOString() }),
      })
    } catch {
      /* non-fatal */
    }
    setItems([])
    setUnread(0)
  }, [collectionURL, userId])

  const openItem = useCallback(
    (n: AdminNotification) => {
      void markRead(n.id)
      setOpen(false)
      if (n.adminURL) window.location.assign(n.adminURL)
    },
    [markRead],
  )

  if (!userId) return null

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="nav__link"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <span style={{ position: 'relative', fontSize: 18, lineHeight: 1 }}>
          🔔
          {unread > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -10,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 8,
                background: '#f15a29',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: '16px',
                textAlign: 'center',
              }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
        <span className="nav__link-label">Notifications</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 100,
            top: '100%',
            left: 0,
            marginTop: 6,
            width: 320,
            maxWidth: '90vw',
            background: 'var(--theme-elevation-0, #fff)',
            color: 'var(--theme-elevation-800, #172033)',
            border: '1px solid var(--theme-elevation-150, #e8e2da)',
            borderRadius: 10,
            boxShadow: '0 12px 34px rgba(12,29,53,.18)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderBottom: '1px solid var(--theme-elevation-150, #e8e2da)',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <span>Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f15a29',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div style={{ padding: '18px 14px', fontSize: 13, color: 'var(--theme-elevation-500, #637083)' }}>
              You&apos;re all caught up.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 380, overflowY: 'auto' }}>
              {items.map((n) => (
                <li key={n.id} style={{ borderBottom: '1px solid var(--theme-elevation-100, #f0ece6)' }}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    style={{
                      display: 'flex',
                      gap: 10,
                      width: '100%',
                      padding: '11px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1.3 }}>
                      {CATEGORY_ICON[n.category ?? ''] ?? '🔔'}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                      {n.message && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: 12,
                            color: 'var(--theme-elevation-500, #637083)',
                          }}
                        >
                          {n.message}
                        </span>
                      )}
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--theme-elevation-400, #90a0b0)' }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
