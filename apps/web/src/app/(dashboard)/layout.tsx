'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { accessToken, isAdmin } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!accessToken || !isAdmin()) {
      router.replace('/login')
    }
  }, [accessToken, isAdmin, router])

  if (!accessToken || !isAdmin()) return null

  return (
    <div className="min-h-screen bg-slate-50 font-arabic" dir="rtl">
      <Sidebar />
      <main className="mr-64 min-h-screen p-8">{children}</main>
    </div>
  )
}
