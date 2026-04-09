'use client'

import { useState } from 'react'
import { MapPin, Clock, ImageOff, Trash2, User } from 'lucide-react'
import { Item } from '@/lib/types'

interface Props {
  item: Item & { poster_name?: string; poster_email?: string }
  showMatch?: boolean
  currentUserId?: string | null
  onDelete?: (id: string) => void
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function ItemCard({ item, showMatch = false, currentUserId, onDelete }: Props) {
  const isLost = item.type === 'lost'
  const [imgFailed, setImgFailed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwner = currentUserId && currentUserId === item.user_id

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    onDelete?.(item.id)
  }

  const posterName = item.poster_name || item.poster_email?.split('@')[0] || 'Anonymous'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm card-hover overflow-hidden flex flex-col ${
      deleting ? 'opacity-50 pointer-events-none' : ''
    } ${isLost ? 'border-red-100' : 'border-emerald-100'}`}>

      {/* Image */}
      <div className="relative bg-slate-100 overflow-hidden shrink-0" style={{ height: 160 }}>
        {item.image_url && !imgFailed ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
            <ImageOff className="w-8 h-8 text-slate-300" />
            <span className="text-xs text-slate-400 font-medium">No photo</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Type badge */}
        <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
          isLost
            ? 'bg-red-500 text-white'
            : 'bg-emerald-500 text-white'
        }`}>
          {isLost ? '🔴 Lost' : '🟢 Found'}
        </span>

        {/* Match badge */}
        {showMatch && item.match_percentage !== undefined && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-white shadow-sm">
            {item.match_percentage}% match
          </span>
        )}

        {/* Delete */}
        {isOwner && (
          <button
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            className={`absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              confirming ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-red-500'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            {confirming ? 'Confirm?' : 'Delete'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{item.title}</h3>
          <p className="text-slate-400 text-xs line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3 shrink-0 text-amber-500" />
            <span className="truncate font-medium">{item.location}</span>
          </div>

          {/* Posted by + time */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <User className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="truncate font-medium text-slate-500">{posterName}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Clock className="w-3 h-3" />
              <span>{timeAgo(item.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
