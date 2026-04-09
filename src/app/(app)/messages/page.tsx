'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Match, Message } from '@/lib/types'
import { Send, MessageSquare, ArrowLeft, ImageOff } from 'lucide-react'

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [matches, setMatches] = useState<Match[]>([])
  const [selected, setSelected] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('matches')
        .select('*, lost_item:items!matches_lost_item_id_fkey(*), found_item:items!matches_found_item_id_fkey(*)')
        .order('created_at', { ascending: false })
      setMatches(data ?? [])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!selected) return
    setMessages([])
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(email, full_name, avatar_url)')
        .eq('match_id', selected.id)
        .order('created_at', { ascending: true })
      setMessages(data ?? [])
    }
    fetchMessages()
    const ch = supabase
      .channel('messages-' + selected.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'match_id=eq.' + selected.id },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !selected || !userId) return
    setInput('')
    await supabase.from('messages').insert({ match_id: selected.id, sender_id: userId, content: text })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex gap-3 h-[calc(100svh-10rem)] sm:h-[calc(100vh-7rem)]">
      <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden shrink-0`}>
        <div className="px-4 py-3 border-b border-orange-100">
          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" /> Messages
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{matches.length} match{matches.length !== 1 ? 'es' : ''}</p>
        </div>
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <MessageSquare className="w-10 h-10 text-orange-100 mb-3" />
            <p className="text-sm text-gray-600 font-medium">No matches yet</p>
            <p className="text-xs text-gray-400 mt-1">When someone finds your lost item, you will see it here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 divide-y divide-orange-50">
            {matches.map(match => {
              const isLostOwner = match.lost_item?.user_id === userId
              const theirItem = isLostOwner ? match.found_item : match.lost_item
              const active = selected?.id === match.id
              return (
                <button key={match.id} onClick={() => setSelected(match)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active ? 'bg-orange-50' : 'hover:bg-orange-50/60'}`}>
                  {/* Both photos stacked */}
                  <div className="relative w-11 h-11 shrink-0">
                    <div className="absolute bottom-0 left-0 w-8 h-8 rounded-lg overflow-hidden bg-orange-50 border border-orange-100">
                      {match.lost_item?.image_url
                        ? <img src={match.lost_item.image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-3 h-3 text-orange-200" /></div>
                      }
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8 rounded-lg overflow-hidden bg-orange-50 border-2 border-white">
                      {match.found_item?.image_url
                        ? <img src={match.found_item.image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-3 h-3 text-orange-200" /></div>
                      }
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{theirItem?.title}</p>
                    <p className="text-xs text-gray-400 truncate">{theirItem?.location}</p>
                    <span className={`inline-block mt-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${match.match_score >= 70 ? 'bg-emerald-100 text-emerald-600' : match.match_score >= 40 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      {match.match_score}% match
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected ? (
        <div className="flex flex-col flex-1 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-orange-100 shrink-0">
            <button onClick={() => setSelected(null)} className="md:hidden text-gray-400 hover:text-gray-700 mr-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            {/* Both item photos side by side */}
            <div className="flex items-center shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 border border-orange-100">
                {selected.lost_item?.image_url
                  ? <img src={selected.lost_item.image_url} alt="Lost" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-3.5 h-3.5 text-orange-200" /></div>
                }
              </div>
              <div className="w-5 h-5 rounded-full bg-white border border-orange-100 flex items-center justify-center -mx-1.5 z-10 shadow-sm">
                <span className="text-orange-400 text-xs font-bold">↔</span>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 border border-orange-100">
                {selected.found_item?.image_url
                  ? <img src={selected.found_item.image_url} alt="Found" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-3.5 h-3.5 text-orange-200" /></div>
                }
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{selected.lost_item?.title} · {selected.found_item?.title}</p>
              <p className="text-xs text-orange-500 font-medium">{selected.match_score}% match confidence</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-orange-50/20">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello!</div>
            )}
            {messages.map(msg => {
              const isMe = msg.sender_id === userId
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-orange-100 shadow-sm'}`}>
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 text-orange-500">{msg.sender?.full_name || msg.sender?.email || 'User'}</p>
                    )}
                    {msg.content}
                    <p className={`text-xs mt-1 ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-orange-100 flex gap-2 shrink-0 bg-white">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-orange-50/50" />
            <button onClick={sendMessage} disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-2xl border border-orange-100 shadow-sm">
          <div className="text-center">
            <MessageSquare className="w-10 h-10 text-orange-100 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">Select a match to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
