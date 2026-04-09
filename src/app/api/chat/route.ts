import { createClient } from '@/lib/supabase/server'

const RELAY = 'https://relay.an.dev'
const API_KEY = process.env.API_KEY_21ST!

// Cache sandboxId per user in memory (resets on server restart, fine for dev/small scale)
const userSandboxMap = new Map<string, string>()

async function getOrCreateSandbox(userId: string): Promise<string> {
  if (userSandboxMap.has(userId)) return userSandboxMap.get(userId)!

  const res = await fetch(`${RELAY}/v1/sandboxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ agent: 'lost-found-assistant' }),
  })
  const body = await res.json()
  console.log('sandbox create response:', JSON.stringify(body))
  if (!res.ok) throw new Error(`Sandbox create failed: ${JSON.stringify(body)}`)
  const id = body.sandboxId ?? body.id
  if (!id) throw new Error(`No sandbox id in response: ${JSON.stringify(body)}`)
  userSandboxMap.set(userId, id)
  return id
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await req.json()

  // Relay only needs the last user message — send just that
  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  if (!lastUserMsg) return new Response('No user message', { status: 400 })

  const sandboxId = await getOrCreateSandbox(user.id)

  const payload = { sandboxId, messages: [lastUserMsg] }
  console.log('relay payload:', JSON.stringify(payload))

  const res = await fetch(`${RELAY}/v1/chat/lost-found-assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify(payload),
  })

  if (!res.ok || !res.body) {
    const err = await res.text()
    console.error('relay error:', res.status, err)
    // If sandbox expired, clear it so next request creates a new one
    if (res.status === 404 || res.status === 400) userSandboxMap.delete(user.id)
    return new Response(`relay:${res.status}:${err}`, { status: 200 })
  }

  // Parse SSE stream, forward only text-delta content as plain text
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'text-delta' && evt.delta) {
              controller.enqueue(encoder.encode(evt.delta))
            }
          } catch { /* skip malformed */ }
        }
      }
      controller.close()
    },
  })

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
