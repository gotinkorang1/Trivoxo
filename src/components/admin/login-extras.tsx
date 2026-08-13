/**
 * Rendered by Payload above the login form (`admin.components.beforeLogin`).
 * Adds a warm welcome line so the sign-in screen reads as a considered console
 * rather than a bare form on an empty canvas.
 */
export function LoginIntro() {
  return (
    <div className="tvx-login-intro">
      <h1 className="tvx-login-intro__title">Welcome back</h1>
      <p className="tvx-login-intro__subtitle">
        Sign in to the Trivoxo operations console.
      </p>
    </div>
  )
}

/**
 * Rendered below the login form (`admin.components.afterLogin`) — a quiet
 * footer with a route back to the public site and a staff-only note.
 */
export function LoginFooter() {
  return (
    <div className="tvx-login-footer">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- hard nav out of the admin to the public site */}
      <a href="/" className="tvx-login-footer__link">
        ← Back to trivoxogh.com
      </a>
      <p className="tvx-login-footer__note">Authorised staff only</p>
    </div>
  )
}
