'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Upload, Home, LogOut, Sparkles, MessageSquare, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState, useMemo } from 'react'

interface NavbarProps { user: User | null }

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { count } = await supabase.from('matches').select('*', { count: 'exact', head: true })
      setUnread(count ?? 0)
    }
    load()
    const ch = supabase.channel('nav-badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Home',     icon: Home },
    { href: '/upload',    label: 'Report',   icon: Upload },
    { href: '/matches',   label: 'Matches',  icon: Sparkles },
    { href: '/messages',  label: 'Messages', icon: MessageSquare, badge: unread },
  ]

  return (
    <>
      {/* ── Desktop nav ── */}
      <nav className="hidden sm:block sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm group-hover:shadow-amber-200 transition-shadow">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900 tracking-tight">Findmate</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-amber-50 text-amber-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-600' : ''}`} />
                  {label}
                  {badge && badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-600 max-w-[120px] truncate hidden md:block">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button onClick={handleSignOut}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile top bar ── */}
      <nav className="sm:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-slate-900">Findmate</span>
          </Link>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs">
                {user.email?.[0].toUpperCase()}
              </div>
              <button onClick={handleSignOut} className="p-1.5 text-slate-400 hover:text-red-500">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 h-[68px] px-2">
          {links.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl mx-0.5 my-1.5 transition-all ${
                  active ? 'text-amber-600' : 'text-slate-400'
                }`}>
                {active && <div className="absolute inset-0 bg-amber-50 rounded-xl" />}
                <div className="relative">
                  <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-amber-600' : ''}`} />
                  {badge && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white rounded-full flex items-center justify-center font-bold px-0.5" style={{ fontSize: 9 }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold relative z-10 ${active ? 'text-amber-600' : ''}`}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
