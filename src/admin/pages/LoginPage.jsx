import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { SITE_HOME } from '../../lib/basePath'
import { Button, Field, Input } from '../components/ui'

/**
 * /admin-login — NARA-branded, minimal, accessible.
 * Error copy is deliberately generic: no Firebase internals are exposed.
 */
export default function LoginPage() {
  const { status, login } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const next = location.state?.from?.pathname || '/admin'

  if (status === 'authenticated') return <Navigate to={next} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!values.email.trim() || !values.password) {
      setError('Enter your email and password.')
      return
    }
    setSending(true)
    try {
      await login(values.email, values.password)
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-5 py-12">
      <div className="w-full max-w-sm">
        <header className="text-center">
          <p className="font-serif text-3xl tracking-[0.22em] text-ink">NARA</p>
          <p className="mt-1.5 text-[9px] tracking-[0.5em] text-stone">REAL ESTATE</p>
          <p className="mt-8 text-[11px] tracking-[0.35em] text-stone">CMS SIGN IN</p>
        </header>

        <form onSubmit={submit} noValidate className="mt-8 space-y-6">
          <Field label="Email" required>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              autoComplete="username"
              autoFocus
              placeholder="you@nara.example"
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p role="alert" className="border-l-2 border-ink pl-3 text-[13px] leading-relaxed text-ink">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={sending} className="w-full py-3">
            {sending ? 'SIGNING IN…' : 'SIGN IN'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-stone">
          Access is limited to active NARA staff accounts.
        </p>
        <p className="mt-4 text-center text-[11px] text-stone">
          <a href={SITE_HOME} className="underline underline-offset-4 hover:text-ink">Back to the website</a>
        </p>
      </div>
    </main>
  )
}
