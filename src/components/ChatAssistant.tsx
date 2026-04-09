'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { createAgentChat, AgentChat } from '@21st-sdk/nextjs'
import '@21st-sdk/react/styles.css'
import { MessageCircle, X } from 'lucide-react'
import type { Chat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'

const SUGGESTIONS = [
  'How does matching work?',
  'How do I report a lost item?',
  'How do I find my lost item?',
  'How do I contact a finder?',
]

function ChatPanel({ sandboxId, onClose }: { sandboxId: string; onClose: () => void }) {
  const chat = useMemo(() => createAgentChat({
    agent: 'lost-found-assistant',
    tokenUrl: '/api/agent/token',
    sandboxId,
  }), [sandboxId])

  const { messages, sendMessage, status, stop, error } = useChat({ chat: chat as Chat<UIMessage> })
  const hasMessages = messages.length > 0

  return (
    <div
      className="fixed bottom-36 right-4 sm:bottom-24 sm:right-6 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
      style={{ width: 'min(380px, calc(100vw - 2rem))', height: 500 }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">F</span>
          </div>
          <span className="text-sm font-bold text-gray-800">FindIt Assistant Powered by Claude</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      {/* Suggestions — show only before first message */}
      {!hasMessages && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <p className="text-xs text-gray-400 mb-2 font-medium">Quick questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage({ text: s })}
                className="text-xs px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <AgentChat
          messages={messages}
          onSend={(msg) => sendMessage({ text: msg.content })}
          status={status}
          onStop={stop}
          error={error ?? undefined}
          colorMode="light"
        />
      </div>
    </div>
  )
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (!open || initRef.current) return
    initRef.current = true
    setLoading(true)

    async function init() {
      try {
        // Always create fresh sandbox to avoid stale/expired sandbox errors
        const sbRes = await fetch('/api/agent/sandbox', { method: 'POST' })
        const sbData = await sbRes.json()
        const sbId: string = sbData.sandboxId
        setSandboxId(sbId)
        setThreadId('default')
      } catch (e) {
        console.error('Chat init failed:', e)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle assistant"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 rounded-full bg-amber-500 text-white shadow-md hover:bg-amber-600 transition-colors flex items-center justify-center active:scale-95"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {open && (loading || !sandboxId ? (
        <div
          className="fixed bottom-36 right-4 sm:bottom-24 sm:right-6 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center"
          style={{ width: 'min(380px, calc(100vw - 2rem))', height: 100 }}
        >
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Starting assistant...</span>
          </div>
        </div>
      ) : (
        <ChatPanel sandboxId={sandboxId} onClose={() => setOpen(false)} />
      ))}
    </>
  )
}
