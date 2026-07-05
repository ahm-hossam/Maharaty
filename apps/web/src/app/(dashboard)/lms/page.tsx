'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { useAllContent, useCreateContent, useDeleteContent, useSeedDemoContent, useCategories, type Content } from '@/lib/queries'

const TYPE_LABELS: Record<string, string> = { COURSE: 'دورة', VIDEO: 'فيديو' }
const TYPE_COLORS: Record<string, string> = {
  COURSE: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-purple-100 text-purple-700',
}

// ─── Add Content Modal ────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30 focus:border-[#0033A0]'

function CategoryInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: categories = [] } = useCategories()
  const [open, setOpen] = useState(false)

  const filtered = categories.filter(
    (c) => !value || c.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={INPUT_CLS}
        placeholder="اختر من القائمة أو اكتب تصنيفاً جديداً..."
      />
      {/* chevron icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </span>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Existing categories */}
          {filtered.length > 0 && (
            <div className="max-h-44 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                    value === c
                      ? 'bg-[#0033A0] text-white'
                      : 'text-slate-700 hover:bg-[#EBF0FF] hover:text-[#002880]'
                  }`}
                  onMouseDown={() => { onChange(c); setOpen(false) }}
                >
                  {value === c && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  )}
                  <span className="flex-1">{c}</span>
                </button>
              ))}
            </div>
          )}

          {/* Add new category option */}
          {value.trim() && !categories.includes(value.trim()) && (
            <button
              type="button"
              className="w-full text-right px-4 py-2.5 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-end gap-2 border-t border-slate-100"
              onMouseDown={() => { onChange(value.trim()); setOpen(false) }}
            >
              <span>إضافة تصنيف جديد: <strong>{value.trim()}</strong></span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          )}

          {filtered.length === 0 && !value.trim() && (
            <div className="px-4 py-3 text-sm text-slate-400 text-right">لا توجد تصنيفات بعد — اكتب لإضافة جديد</div>
          )}
        </div>
      )}
    </div>
  )
}

function AddContentModal({ onClose }: { onClose: () => void }) {
  const createContent = useCreateContent()
  const router = useRouter()
  const [form, setForm] = useState({
    titleAr: '',
    type: 'COURSE' as 'COURSE' | 'VIDEO',
    category: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titleAr.trim()) return
    try {
      const res = await createContent.mutateAsync({
        ...form,
        isPublished: false,
        meta: {},
      })
      toast.success('تم إنشاء المحتوى')
      onClose()
      const id = (res as any)?.data?.data?.id ?? (res as any)?.data?.id
      if (id) router.push(`/lms/${id}`)
    } catch {
      toast.error('فشل إنشاء المحتوى')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-lg font-bold text-slate-800">محتوى جديد</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">النوع</label>
            <div className="grid grid-cols-2 gap-3">
              {(['COURSE', 'VIDEO'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${form.type === t ? 'border-[#0033A0] bg-[#0033A0]/5 text-[#0033A0]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {t === 'COURSE' ? '📚 دورة تعليمية' : '🎬 سلسلة فيديو'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">العنوان *</label>
            <input value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
              className={INPUT_CLS} placeholder="عنوان الدورة أو السلسلة" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">التصنيف</label>
            <CategoryInput value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">وصف مختصر</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-right text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30 focus:border-[#0033A0]"
              placeholder="وصف مختصر للمحتوى..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createContent.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#0033A0] to-[#002880] text-white rounded-xl font-bold text-sm disabled:opacity-50">
              {createContent.isPending ? 'جارٍ الإنشاء...' : 'إنشاء وبدء التحرير'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Content Card ─────────────────────────────────────────────────────────────

function ContentCard({ item, onDelete }: { item: Content; onDelete: (item: Content) => void }) {
  const router = useRouter()
  const sectionCount = (item as any).sections?.length ?? 0
  const lectureCount = (item as any).sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length ?? 0), 0) ?? 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#0033A0]/30 transition-all group">
      {/* Thumbnail / placeholder */}
      <div className="h-36 bg-gradient-to-br from-[#0033A0]/10 to-[#1C1352]/10 relative flex items-center justify-center overflow-hidden">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl opacity-30">{item.type === 'COURSE' ? '📚' : '🎬'}</div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[item.type] ?? 'bg-slate-100 text-slate-600'}`}>
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
        </div>
        {!item.isPublished && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">مسودة</span>
          </div>
        )}
        {/* Delete button — top-left when published */}
        {item.isPublished && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item) }}
            className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm text-right leading-snug mb-1 line-clamp-2">{item.titleAr}</h3>
        {item.category && <p className="text-xs text-[#0033A0] font-semibold text-right mb-3">{item.category}</p>}

        {/* Stats */}
        <div className="flex items-center justify-end gap-3 text-xs text-slate-500 mb-4">
          {sectionCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              {sectionCount} {item.type === 'COURSE' ? 'قسم' : 'قائمة'}
            </span>
          )}
          {lectureCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {lectureCount} {item.type === 'COURSE' ? 'محاضرة' : 'حلقة'}
            </span>
          )}
          {sectionCount === 0 && <span className="text-amber-500 font-medium">لا يوجد محتوى بعد</span>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/lms/${item.id}`)}
            className="flex-1 py-2.5 bg-[#0033A0] text-white rounded-xl text-xs font-bold hover:bg-[#002880] transition-colors group-hover:shadow-md"
          >
            تعديل المنهج
          </button>
          <button
            onClick={() => onDelete(item)}
            className="w-9 py-2.5 border border-red-200 text-red-400 rounded-xl text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LmsPage() {
  const { data: allContent, isLoading } = useAllContent()
  const deleteContent = useDeleteContent()
  const seedDemo = useSeedDemoContent()
  const [showAdd, setShowAdd] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'COURSE' | 'VIDEO'>('ALL')

  const list: Content[] = Array.isArray(allContent)
    ? allContent
    : (allContent as any)?.content ?? []

  const filtered = list.filter((c) => typeFilter === 'ALL' || c.type === typeFilter)

  const stats = {
    total: list.length,
    courses: list.filter((c) => c.type === 'COURSE').length,
    videos: list.filter((c) => c.type === 'VIDEO').length,
    published: list.filter((c) => c.isPublished).length,
  }

  const handleDelete = async (item: Content) => {
    if (!confirm(`حذف "${item.titleAr}"؟ سيتم حذف جميع الأقسام والمحاضرات.`)) return
    try {
      await deleteContent.mutateAsync(item.id)
      toast.success('تم حذف المحتوى')
    } catch { toast.error('فشل الحذف') }
  }

  const handleSeedDemo = async () => {
    if (!confirm('سيتم حذف أي بيانات تجريبية سابقة وإضافة محتوى جديد. هل تريد المتابعة؟')) return
    try {
      const res = await seedDemo.mutateAsync()
      toast.success(`تم إضافة ${(res as any)?.data?.data?.seeded ?? 15} عنصر تجريبي`)
    } catch { toast.error('فشل تحميل البيانات التجريبية') }
  }

  return (
    <div>
      <DashboardHeader
        title="إدارة المحتوى التعليمي"
        subtitle="أنشئ وأدِر الدورات والسلاسل التعليمية بالكامل"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي المحتوى', value: stats.total, icon: '📦', color: 'from-[#0033A0] to-[#1C1352]' },
          { label: 'الدورات', value: stats.courses, icon: '📚', color: 'from-blue-500 to-blue-700' },
          { label: 'سلاسل الفيديو', value: stats.videos, icon: '🎬', color: 'from-purple-500 to-purple-700' },
          { label: 'منشور', value: stats.published, icon: '✅', color: 'from-emerald-500 to-emerald-700' },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs opacity-80 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0033A0] to-[#002880] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#0033A0]/25 hover:from-[#002880] hover:to-[#001E60] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            محتوى جديد
          </button>
          <button
            onClick={handleSeedDemo}
            disabled={seedDemo.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-[#0033A0] hover:text-[#0033A0] transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {seedDemo.isPending ? 'جارٍ التحميل...' : 'بيانات تجريبية'}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {([['ALL', 'الكل'], ['COURSE', 'دورات'], ['VIDEO', 'فيديو']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${typeFilter === v ? 'bg-[#0033A0] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4 ml-auto" />
                <div className="h-3 bg-slate-100 rounded w-1/2 ml-auto" />
                <div className="h-9 bg-slate-100 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-slate-500 font-semibold mb-2">لا يوجد محتوى بعد</p>
          <p className="text-slate-400 text-sm mb-6">أنشئ أول دورة أو سلسلة فيديو</p>
          <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-[#0033A0] text-white rounded-xl font-bold text-sm">
            إنشاء محتوى جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAdd && <AddContentModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
