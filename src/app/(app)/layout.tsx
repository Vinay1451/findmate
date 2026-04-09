import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-10">
        {children}
      </main>
    </div>
  )
}
