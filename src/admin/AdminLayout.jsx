import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../lib/firestore/admins'
import { Button } from './components/ui'
import { cx } from './lib/cx'

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/properties', label: 'Properties' },
  { to: '/admin/inquiries', label: 'Inquiries' },
  { to: '/admin/viewings', label: 'Viewings' },
  { to: '/admin/seller-leads', label: 'Seller Leads' },
  { to: '/admin/editorial', label: 'Editorial' },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/settings', label: 'Settings' },
]

function NavItems({ onNavigate }) {
  return (
    <ul className="space-y-0.5">
      {NAV.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'block border-l-2 px-4 py-2.5 text-[13px] transition-colors',
                isActive
                  ? 'border-ink bg-paper text-ink'
                  : 'border-transparent text-stone hover:border-line hover:text-ink',
              )
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

function Identity({ onLogout }) {
  const { admin, user } = useAuth()
  const label = admin?.displayName || user?.email || 'Administrator'
  const role = admin?.role ? (ROLE_LABELS[admin.role] || admin.role) : ''
  return (
    <div className="border-t border-line px-4 py-4">
      <p className="truncate text-[13px] text-ink" title={user?.email || ''}>{label}</p>
      <p className="mt-0.5 text-[11px] tracking-wide text-stone">{role}</p>
      <div className="mt-3 flex items-center gap-4">
        <a href="/" className="text-[11px] tracking-[0.14em] text-stone underline underline-offset-4 hover:text-ink">VIEW SITE</a>
        <button type="button" onClick={onLogout} className="text-[11px] tracking-[0.14em] text-stone underline underline-offset-4 hover:text-ink">LOG OUT</button>
      </div>
    </div>
  )
}

/** Persistent sidebar on desktop, deliberate drawer on mobile. */
export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col justify-between border-r border-line bg-ivory md:flex">
        <div>
          <div className="px-4 py-6">
            <p className="font-serif text-xl tracking-[0.22em] text-ink">NARA</p>
            <p className="mt-1 text-[9px] tracking-[0.5em] text-stone">CMS</p>
          </div>
          <nav aria-label="CMS sections"><NavItems /></nav>
        </div>
        <Identity onLogout={handleLogout} />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ivory px-5 py-4 md:hidden">
        <div>
          <p className="font-serif text-lg tracking-[0.2em] text-ink">NARA</p>
          <p className="text-[9px] tracking-[0.5em] text-stone">CMS</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open CMS navigation" aria-expanded={open}
          className="border border-line px-3 py-2 text-[11px] tracking-[0.2em] text-ink">
          MENU
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-ivory md:hidden" role="dialog" aria-modal="true" aria-label="CMS navigation">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="font-serif text-lg tracking-[0.2em] text-ink">NARA CMS</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close CMS navigation"
              className="border border-line px-3 py-2 text-[11px] tracking-[0.2em] text-ink">CLOSE</button>
          </div>
          <nav aria-label="CMS sections" className="flex-1 overflow-y-auto py-4">
            <NavItems onNavigate={() => setOpen(false)} />
          </nav>
          <div className="border-t border-line">
            <Identity onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="md:pl-56">
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function FullScreenStatus({ label }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-6 text-center" role="status" aria-live="polite">
      <p className="font-serif text-2xl tracking-[0.2em] text-ink">NARA</p>
      <p className="text-[12px] tracking-[0.25em] text-stone">{label}</p>
      <span className="block h-px w-32 bg-line" aria-hidden="true" />
    </div>
  )
}

export function AccessDenied({ onLogout, error }) {
  const unverified = Boolean(error)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="font-serif text-2xl tracking-[0.2em] text-ink">NARA CMS</p>
      <h1 className="mt-8 font-serif text-3xl text-ink">{unverified ? 'Access could not be verified' : 'Access denied'}</h1>
      <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ink-soft">
        {unverified
          ? error
          : 'This account does not have permission to manage NARA content. Ask an owner to add your account to the admin list.'}
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={onLogout}>LOG OUT</Button>
        <a href="/" className="inline-flex items-center border border-line px-4 py-2.5 text-[11px] tracking-[0.18em] text-ink hover:border-ink">BACK TO SITE</a>
      </div>
    </main>
  )
}
