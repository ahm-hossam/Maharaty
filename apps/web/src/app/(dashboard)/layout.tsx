import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-arabic" dir="rtl">
      <Sidebar />
      <main className="mr-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  )
}
