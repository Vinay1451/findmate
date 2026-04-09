'use client'

import { createClient } from '@/lib/supabase/client'
import { LogIn } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const [appleMsg, setAppleMsg] = useState(false)

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb-1 absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none" />
      <div className="orb-2 absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-400/15 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm scale-in">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
          ← Back to home
        </Link>

        <div className="w-full bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-black">

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg">
            <LogIn className="w-7 h-7 text-gray-900" />
          </div>

          <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900">Sign in to FindIt</h2>
          <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
            Report lost or found items and let AI match them instantly. Free forever.
          </p>

          {/* Divider */}
          <div className="flex items-center w-full mb-5">
            <div className="flex-grow border-t border-dashed border-gray-200" />
            <span className="mx-3 text-xs text-gray-400 font-medium">Sign in with</span>
            <div className="flex-grow border-t border-dashed border-gray-200" />
          </div>

          {/* Auth buttons */}
          <div className="flex gap-3 w-full">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-amber-300 transition-all shadow-sm font-semibold text-sm text-gray-700"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>

            {/* Apple — coming soon */}
            <button
              onClick={() => setAppleMsg(true)}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm text-gray-700 relative"
            >
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" />
              Apple
            </button>
          </div>

          {/* Apple coming soon message */}
          {appleMsg && (
            <div className="mt-4 w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center font-medium">
              Apple Sign-in coming soon — please use Google for now.
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}
