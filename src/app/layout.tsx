import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'FindIt — AI-Powered Lost & Found',
  description: 'Report lost or found items and let AI match them instantly. Free, fast, and secure.',
  keywords: 'lost and found, AI matching, find lost items, report found items',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
