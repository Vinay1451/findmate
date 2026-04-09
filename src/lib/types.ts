export type ItemType = 'lost' | 'found'

export interface Item {
  id: string
  user_id: string
  title: string
  description: string
  location: string
  type: ItemType
  image_url: string | null
  created_at: string
  match_percentage?: number
}

export interface Match {
  id: string
  lost_item_id: string
  found_item_id: string
  match_score: number
  created_at: string
  lost_item?: Item
  found_item?: Item
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: { email: string; full_name: string | null; avatar_url: string | null }
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
