'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/axios'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { accessToken, refreshToken, isAdmin, setAuth, clearAuth, user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // accessToken expired (15 min TTL) but refreshToken still in sessionStorage — silently restore
    if (!accessToken && refreshToken) {
      setRestoring(true)
      api.post('/auth/refresh', { refreshToken })
        .then((res) => {
          const { accessToken: newToken, refreshToken: newRefresh } = res.data.data
          setAuth(newToken, newRefresh, user!)
        })
        .catch(() => {
          clearAuth()
          router.replace('/login')
        })
        .finally(() => setRestoring(false))
      return
    }

    if (!accessToken || !isAdmin()) {
      router.replace('/login')
    }
  }, [mounted, accessToken, refreshToken, isAdmin, setAuth, clearAuth, user, router])

  if (!mounted || restoring) return null
  if (!accessToken || !isAdmin()) return null

  return (
    <div className="min-h-screen bg-slate-50 font-arabic" dir="rtl">
      <Sidebar />
      <main className="mr-64 min-h-screen p-8">{children}</main>
    </div>
  )
}
