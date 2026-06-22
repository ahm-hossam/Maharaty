'use client'

import { useEffect, useState } from 'react'
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
  // Wait for client mount so Zustand can read from localStorage before auth check
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!accessToken || !isAdmin()) {
      router.replace('/login')
    }
  }, [mounted, accessToken, isAdmin, router])

  if (!mounted) return null
  if (!accessToken || !isAdmin()) return null

  return (
    <div className="min-h-screen bg-slate-50 font-arabic" dir="rtl">
      <Sidebar />
      <main className="mr-64 min-h-screen p-8">{children}</main>
    </div>
  )
}
