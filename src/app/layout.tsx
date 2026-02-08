import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'F-47 SENTINEL // Sixth Generation Air Dominance',
  description:
    'The most advanced air superiority platform ever conceived. Sixth-generation stealth fighter with AI-driven combat systems.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-dark)] text-[var(--text-primary)] antialiased">{children}</body>
    </html>
  )
}
