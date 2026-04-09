'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import SkeletonCard from '@/components/SkeletonCard'
import { Sparkles, MapPin, Clock, ImageOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface MatchWithItems {
  id: string
  match_score: number
  lost_item: { id: string; title: string; description: string; location: string; image_url: string | null; created_at: string }
  found_item: { id: string; title: string; description: string; location: string; image_url: string | null; created_at: string }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('matches')
        .select('*, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)')
        .order('match_score', { ascending: false })
      setMatches(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">AI Matches</h1>
          <p className="text-gray-400 text-xs mt-0.5">Ranked by match confidence</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-amber-300" />
          </div>
          <p className="font-bold text-gray-700">No matches yet</p>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">Report a found item and the AI will automatically scan for matches.</p>
          <Link href="/upload" className="mt-5 btn-primary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
            Report an item <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.map(m => {
            const score = m.match_score
            const scoreColor = score >= 70 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : score >= 40 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-gray-500 bg-gray-50 border-gray-200'
            return (
              <Link key={m.id} href="/messages" className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden block">
                {/* Match score bar */}
                <div className="h-1 bg-gray-100">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${score}%` }} />
                </div>

                <div className="p-4">
                  {/* Score badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreColor}`}>
                      <Sparkles className="w-3 h-3" />
                      {score}% match
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(m.lost_item.created_at)}
                    </span>
                  </div>

                  {/* Two items side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {[{ item: m.lost_item, label: 'Lost', color: 'bg-red-500' }, { item: m.found_item, label: 'Found', color: 'bg-emerald-500' }].map(({ item, label, color }) => (
                      <div key={label}>
                        <div className="relative rounded-xl overflow-hidden bg-gray-50 mb-2" style={{ height: 90 }}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          <span className={`absolute top-1.5 left-1.5 ${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md`}>{label}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Click to open chat</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
