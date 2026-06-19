'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/touren', label: 'Touren' },
  { href: '/import', label: 'Import' },
]

export default function NavBar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold text-primary-800">Royal Logistik</span>
          <div className="flex gap-1">
            {links.map((link) => {
              const isActive = pathname?.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{userEmail}</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
