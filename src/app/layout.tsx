import type React from 'react'
import '@total-typescript/ts-reset'
import type { Metadata } from 'next'
import { Reddit_Mono } from 'next/font/google'
import '~/app/globals.css'

const redditMono = Reddit_Mono({
  variable: '--font-reddit-mono',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${redditMono.variable} [-webkit-overflow-scrolling: touch;] overflow-auto overscroll-none antialiased`}
      >
        {children}
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'music conductor simulator',
  description: 'music conductor simulator',
}
