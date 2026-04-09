import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Simple text similarity score 0-100
function scoreMatch(lost: { title: string; description: string; location: string },
                    found: { title: string; description: string; location: string }): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/)
  const lostWords  = new Set(normalize(lost.title  + ' ' + lost.description  + ' ' + lost.location))
  const foundWords = new Set(normalize(found.title + ' ' + found.description + ' ' + found.location))

  let common = 0
  for (const w of foundWords) if (lostWords.has(w) && w.length > 2) common++

  const locationMatch = lost.location.toLowerCase().includes(found.location.toLowerCase().split(',')[0]) ||
                        found.location.toLowerCase().includes(lost.location.toLowerCase().split(',')[0])

  const base = Math.round((common / Math.max(lostWords.size, 1)) * 100)
  const bonus = locationMatch ? 20 : 0
  return Math.min(base + bonus, 100)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { foundItemId } = await req.json()

  // Get the found item
  const { data: foundItem } = await supabase
    .from('items')
    .select('*')
    .eq('id', foundItemId)
    .eq('type', 'found')
    .single()

  if (!foundItem) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  // Get all lost items (not owned by same user)
  const { data: lostItems } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'lost')
    .neq('user_id', user.id)

  if (!lostItems?.length) return NextResponse.json({ matches: [] })

  const matches = []

  for (const lost of lostItems) {
    const score = scoreMatch(lost, foundItem)
    if (score >= 30) {
      // Upsert match
      const { data: match } = await supabase
        .from('matches')
        .upsert({ lost_item_id: lost.id, found_item_id: foundItem.id, match_score: score },
                 { onConflict: 'lost_item_id,found_item_id' })
        .select()
        .single()

      if (match) {
        // Send auto system message to notify the lost item owner
        await supabase.from('messages').insert({
          match_id: match.id,
          sender_id: user.id,
          content: `Potential match found for your lost item "${lost.title}". Someone reported finding "${foundItem.title}" at ${foundItem.location}. Match score: ${score}%. Reply to connect with them.`,
        })
        matches.push({ ...match, score })
      }
    }
  }

  return NextResponse.json({ matches })
}
