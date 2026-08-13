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
