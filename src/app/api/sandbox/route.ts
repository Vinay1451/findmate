import { AgentClient } from '@21st-sdk/node'
import { createClient } from '@/lib/supabase/server'

const client = new AgentClient({ apiKey: process.env.API_KEY_21ST! })

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sandbox = await client.sandboxes.create({ agent: 'lost-found-assistant' })
  return Response.json({ sandboxId: sandbox.id })
}
