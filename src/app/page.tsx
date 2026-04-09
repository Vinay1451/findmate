'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, ArrowRight, MapPin, Zap, Shield, Users, CheckCircle, X } from 'lucide-react'

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="px-6 py-5 text-sm text-gray-600 leading-7 space-y-4">{children}</div>
      </div>
    </div>
  )
}

export default function RootPage() {
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null)

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {modal === 'terms' && (
        <Modal title="Terms of Service" onClose={() => setModal(null)}>
          <p>Welcome to FindIt. By using this platform, you agree to the following terms.</p>
          <p><strong className="text-gray-800 font-semibold">Use Responsibly.</strong> FindIt is a community platform for reporting lost and found items. You agree to post only genuine, accurate information.</p>
          <p><strong className="text-gray-800 font-semibold">No Guarantee.</strong> FindIt does not guarantee the recovery of any lost item. We provide a platform to connect people; outcomes depend on community participation.</p>
          <p><strong className="text-gray-800 font-semibold">Not Liable.</strong> FindIt is not responsible for any loss, damage, or disputes arising from interactions between users. All exchanges are at your own risk.</p>
          <p><strong className="text-gray-800 font-semibold">User Content.</strong> You are solely responsible for the content you post, including photos and descriptions. Do not post false, misleading, or harmful content.</p>
          <p><strong className="text-gray-800 font-semibold">Account.</strong> You are responsible for maintaining the security of your account. We reserve the right to suspend accounts that violate these terms.</p>
          <p className="text-xs text-gray-400 pt-2">Last updated: April 2026</p>
        </Modal>
      )}
      {modal === 'privacy' && (
        <Modal title="Privacy Policy" onClose={() => setModal(null)}>
          <p>Your privacy matters to us. Here is how FindIt handles your data.</p>
          <p><strong className="text-gray-800 font-semibold">What We Collect.</strong> We collect your email address and name via Google Sign-In, and the content you post such as item descriptions, photos, and location.</p>
          <p><strong className="text-gray-800 font-semibold">How We Use It.</strong> Your data is used solely to operate the FindIt platform, matching lost and found items, enabling messaging, and displaying your posts.</p>
          <p><strong className="text-gray-800 font-semibold">We Do Not Sell Data.</strong> We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          <p><strong className="text-gray-800 font-semibold">Photos and Storage.</strong> Uploaded photos are stored securely and are publicly visible to help identify items.</p>
          <p><strong className="text-gray-800 font-semibold">Your Rights.</strong> You can delete your posts at any time. To delete your account and all associated data, contact us.</p>
          <p className="text-xs text-gray-400 pt-2">Last updated: April 2026</p>
        </Modal>
      )}

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-amber-400/12 blur-[120px]" />
        <div className="orb-2 absolute top-[50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-400/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg">Findmate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium hidden sm:block transition-colors">Sign in</Link>
            <Link href="/login" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-8 uppercase tracking-wide">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          AI-Powered Lost &amp; Found
        </div>
        <h1 className="fade-up-1 text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6 text-gray-950">
          Lost something?<br />
          <span className="gradient-text-amber">We will find it.</span>
        </h1>
        <p className="fade-up-2 text-gray-500 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Report a lost or found item, upload a photo, and our AI instantly matches you with others nearby.
        </p>
        <div className="fade-up-3 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border-2 border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all">
            Report found item
          </Link>
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-y border-gray-100 bg-gray-50 py-3 mb-20">
        <div className="marquee-track flex gap-10 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-10 shrink-0">
              {['Lost Wallet','Found Keys','Lost Phone','Found Watch','Lost Bag','Found Laptop','Lost AirPods','Found Ring','Lost Passport','Found Glasses'].map(t => (
                <span key={t} className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Three steps to reunite</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: MapPin,        n: '01', title: 'Report your item',  body: 'Upload a photo and describe your lost or found item with the exact location.', bg: 'bg-amber-50',   border: 'border-amber-100',   ib: 'bg-amber-100',   ic: 'text-amber-600' },
            { icon: Zap,           n: '02', title: 'AI matching',       body: 'Our AI scans all items and ranks the best matches by similarity score.',        bg: 'bg-orange-50',  border: 'border-orange-100',  ib: 'bg-orange-100',  ic: 'text-orange-600' },
            { icon: MessageSquare, n: '03', title: 'Connect and recover', body: 'Chat directly with the finder through our secure in-app messaging.',          bg: 'bg-emerald-50', border: 'border-emerald-100', ib: 'bg-emerald-100', ic: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={s.n} className={`fade-up-${i+1} relative rounded-3xl ${s.bg} border ${s.border} p-7 overflow-hidden hover:-translate-y-1 transition-transform duration-300`}>
              <div className="absolute top-4 right-5 text-6xl font-black text-black/5 select-none">{s.n}</div>
              <div className={`w-12 h-12 rounded-2xl ${s.ib} flex items-center justify-center mb-5`}>
                <s.icon className={`w-6 h-6 ${s.ic}`} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Everything you need</h2>
            <p className="text-gray-400 mt-3 text-lg">Built for speed, security, and simplicity</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap,           title: 'AI Match Scoring',  body: 'Smart algorithm ranks matches by confidence percentage in real time.' },
              { icon: Shield,        title: 'Secure Messaging',  body: 'In-app chat between item owners with no personal info shared.' },
              { icon: MapPin,        title: 'Location Aware',    body: 'Location-based matching prioritizes nearby items for faster recovery.' },
              { icon: CheckCircle,   title: 'Photo Upload',      body: 'Drag and drop photo upload with instant preview and cloud storage.' },
              { icon: Users,         title: 'Community Feed',    body: 'Real-time public feed of all lost and found items.' },
              { icon: MessageSquare, title: 'Instant Alerts',    body: 'Get notified the moment a match is found for your lost item.' },
            ].map(f => (
              <div key={f.title} className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-amber-200 hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <f.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">Simple Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Affordable for everyone</h2>
          <p className="text-gray-400 mt-3 text-lg">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '₹0',
              period: 'forever',
              desc: 'Perfect for occasional use',
              features: ['3 active reports', 'AI matching', 'Community feed', 'Basic messaging'],
              cta: 'Get started',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '₹49',
              period: 'per month',
              desc: 'Best for regular users',
              features: ['Unlimited reports', 'Priority AI matching', 'Instant alerts', 'Secure messaging', 'Photo storage 5 GB'],
              cta: 'Start Pro',
              highlight: true,
            },
            {
              name: 'Annual',
              price: '₹399',
              period: 'per year',
              desc: 'Save 32% vs monthly',
              features: ['Everything in Pro', 'Early access features', 'Priority support', 'Photo storage 20 GB'],
              cta: 'Go Annual',
              highlight: false,
            },
          ].map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-200'
                  : 'bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-amber-100' : 'text-amber-500'}`}>{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-2 ${plan.highlight ? 'text-amber-100' : 'text-gray-400'}`}>/{plan.period}</span>
                </div>
                <p className={`text-sm mt-1 ${plan.highlight ? 'text-amber-100' : 'text-gray-400'}`}>{plan.desc}</p>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-amber-500'}`} />
                    <span className={plan.highlight ? 'text-white' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`w-full text-center py-3 rounded-2xl font-bold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-white text-orange-500 hover:bg-amber-50'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Search className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-gray-900">FindIt</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            A community platform to help reunite people with their lost belongings.
          </p>
          <div className="flex items-center gap-5">
            <button onClick={() => setModal('privacy')} className="text-xs text-gray-400 hover:text-amber-600 font-semibold transition-colors">Privacy Policy</button>
            <button onClick={() => setModal('terms')} className="text-xs text-gray-400 hover:text-amber-600 font-semibold transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
