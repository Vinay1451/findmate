'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import ItemCard from '@/components/ItemCard'
import SkeletonCard from '@/components/SkeletonCard'
import ChatAssistant from '@/components/ChatAssistant'
import { Item } from '@/lib/types'
import Link from 'next/link'
import { Plus, Search, TrendingUp, Package, AlertCircle } from 'lucide-react'

type ItemWithPoster = Item & { poster_name?: string; poster_email?: string }

export default function DashboardPage() {
  const [items, setItems] = useState<ItemWithPoster[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [search, setSearch] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setItems(data)
      }
      setLoading(false)
    }
    load()
    const ch = supabase.channel('items-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const handleDelete = async (id: string) => {
    await supabase.from('items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = items
    .filter(i => filter === 'all' || i.type === filter)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase()))

  const lostCount  = items.filter(i => i.type === 'lost').length
  const foundCount = items.filter(i => i.type === 'found').length

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Items', value: items.length, icon: Package,      gradient: 'from-amber-50 to-orange-50',   border: 'border-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400' },
            { label: 'Lost',        value: lostCount,    icon: AlertCircle,  gradient: 'from-red-50 to-rose-50',       border: 'border-red-100',     text: 'text-red-600',     dot: 'bg-red-400' },
            { label: 'Found',       value: foundCount,   icon: TrendingUp,   gradient: 'from-emerald-50 to-teal-50',   border: 'border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl border ${s.border} px-4 py-4 shadow-sm`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-slate-500 font-semibold">{s.label}</span>
              </div>
              <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900">Live Feed</h1>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Real-time updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent w-44 sm:w-52"
              />
            </div>
            <Link href="/upload" className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">
              <Plus className="w-4 h-4" /> Report
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'lost', 'found'] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? tab === 'lost'  ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                  : tab === 'found' ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                  : 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
              }`}>
              {tab === 'all' ? `All (${items.length})` : tab === 'lost' ? `Lost (${lostCount})` : `Found (${foundCount})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-bold text-slate-700">No items found</p>
            <p className="text-slate-400 text-sm mt-1">{search ? 'Try a different search term' : 'Be the first to report a lost or found item.'}</p>
            {!search && (
              <Link href="/upload" className="mt-5 btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">
                Report Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} currentUserId={userId} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
      <ChatAssistant />
    </>
  )
}
