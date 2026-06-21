import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Providers } from '@/components/layout/providers'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'مهاراتي — لوحة التحكم',
  description: 'Maharaty Admin Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-arabic antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
