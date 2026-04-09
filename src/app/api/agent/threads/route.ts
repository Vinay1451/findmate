import { AgentClient } from '@21st-sdk/node'
import { createClient } from '@/lib/supabase/server'

const client = new AgentClient({ apiKey: process.env.API_KEY_21ST! })

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sandboxId = searchParams.get('sandboxId')
  if (!sandboxId) return Response.json([], { status: 200 })

  try {
    const threads = await client.threads.list({ sandboxId })
    return Response.json(threads)
  } catch (e) {
    console.error('threads list error:', e)
    return Response.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { sandboxId, name } = await req.json()
  try {
    const thread = await client.threads.create({ sandboxId, name })
    return Response.json(thread)
  } catch (e) {
    console.error('threads create error:', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
