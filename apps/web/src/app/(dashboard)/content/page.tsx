'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import {
  useAllContent,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
  type Content,
} from '@/lib/queries'

type ContentType = 'COURSE' | 'VIDEO' | 'ARTICLE'
type TabFilter = 'ALL' | ContentType

const TYPE_LABELS: Record<ContentType, string> = {
  COURSE: 'دورة',
  VIDEO: 'فيديو',
  ARTICLE: 'مقال',
}

const TYPE_COLORS: Record<ContentType, string> = {
  COURSE: 'bg-indigo-50 text-indigo-700',
  VIDEO: 'bg-violet-50 text-violet-700',
  ARTICLE: 'bg-amber-50 text-amber-700',
}

const TABS: { label: string; value: TabFilter }[] = [
  { label: 'الكل', value: 'ALL' },
  { label: 'دورة', value: 'COURSE' },
  { label: 'فيديو', value: 'VIDEO' },
  { label: 'مقال', value: 'ARTICLE' },
]

interface ContentFormState {
  type: ContentType
  titleAr: string
  description: string
  category: string
  url: string
  duration: string
  isPublished: boolean
}

const defaultForm: ContentFormState = {
  type: 'COURSE',
  titleAr: '',
  description: '',
  category: '',
  url: '',
  duration: '',
  isPublished: false,
}

function ContentModal({
  initial,
  onClose,
}: {
  initial?: Content
  onClose: () => void
}) {
  const createContent = useCreateContent()
  const updateContent = useUpdateContent()
  const [form, setForm] = useState<ContentFormState>(
    initial
      ? {
          type: initial.type,
          titleAr: initial.titleAr,
          description: initial.description ?? '',
          category: initial.category ?? '',
          url: initial.url ?? '',
          duration: initial.duration?.toString() ?? '',
          isPublished: initial.isPublished,
        }
      : defaultForm
  )

  const isEditing = !!initial

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      type: form.type,
      titleAr: form.titleAr,
      description: form.description || undefined,
      category: form.category || undefined,
      url: form.url || undefined,
      duration: form.duration ? parseInt(form.duration) : undefined,
      isPublished: form.isPublished,
    }
    try {
      if (isEditing) {
        await updateContent.mutateAsync({ id: initial.id, ...payload })
        toast.success('تم تحديث المحتوى بنجاح')
      } else {
        await createContent.mutateAsync(payload)
        toast.success('تم إضافة المحتوى بنجاح')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'فشل تحديث المحتوى' : 'فشل إضافة المحتوى')
    }
  }

  const isPending = createContent.isPending || updateContent.isPending

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              النوع
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ContentType })
              }
              dir="rtl"
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            >
              <option value="COURSE">دورة</option>
              <option value="VIDEO">فيديو</option>
              <option value="ARTICLE">مقال</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              العنوان (بالعربية)
            </label>
            <input
              required
              dir="rtl"
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              placeholder="عنوان المحتوى..."
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الوصف
            </label>
            <textarea
              dir="rtl"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              placeholder="وصف المحتوى..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الفئة
            </label>
            <input
              dir="rtl"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="مثال: تقنية، إدارة..."
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الرابط (URL)
            </label>
            <input
              dir="ltr"
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-left text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              المدة (بالدقائق)
            </label>
            <input
              type="number"
              min="0"
              dir="rtl"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="0"
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <div
              onClick={() =>
                setForm({ ...form, isPublished: !form.isPublished })
              }
              className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
                form.isPublished ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                  form.isPublished ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
            <label className="text-sm font-semibold text-slate-700">
              {form.isPublished ? 'منشور' : 'مسودة'}
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-70 hover:from-indigo-700 hover:to-violet-700 transition-all"
            >
              {isPending ? 'جارٍ الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-16" />
        </td>
      ))}
    </tr>
  )
}

export default function ContentPage() {
  const { data: allContent, isLoading, isError } = useAllContent()
  const deleteContent = useDeleteContent()
  const updateContent = useUpdateContent()
  const [tab, setTab] = useState<TabFilter>('ALL')
  const [showAdd, setShowAdd] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)

  const filtered =
    allContent?.filter((c) => tab === 'ALL' || c.type === tab) ?? []

  const handleDelete = async (c: Content) => {
    if (!confirm(`هل أنت متأكد من حذف "${c.titleAr}"؟`)) return
    try {
      await deleteContent.mutateAsync(c.id)
      toast.success('تم حذف المحتوى')
    } catch {
      toast.error('فشل حذف المحتوى')
    }
  }

  const handleTogglePublish = async (c: Content) => {
    try {
      await updateContent.mutateAsync({
        id: c.id,
        isPublished: !c.isPublished,
      })
      toast.success(c.isPublished ? 'تم إلغاء النشر' : 'تم النشر')
    } catch {
      toast.error('فشلت العملية')
    }
  }

  return (
    <div>
      <DashboardHeader
        title="المحتوى"
        subtitle={
          isLoading
            ? 'جارٍ التحميل...'
            : `${allContent?.length ?? 0} عنصر محتوى`
        }
      />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة محتوى
        </button>
      </div>

      {isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-right">
          <p className="text-sm font-semibold text-red-700">تعذّر تحميل المحتوى</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">إجراءات</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">تاريخ الإنشاء</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الحالة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">المدة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الفئة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">النوع</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">العنوان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingContent(c)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">
                        {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(c)}
                          className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 ${
                            c.isPublished ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={c.isPublished ? 'إلغاء النشر' : 'نشر'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                              c.isPublished ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">
                        {c.duration ? `${c.duration} د` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">
                        {c.category ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            TYPE_COLORS[c.type]
                          }`}
                        >
                          {TYPE_LABELS[c.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 text-sm text-right max-w-xs truncate">
                          {c.titleAr}
                        </p>
                        {c.description && (
                          <p className="text-xs text-slate-400 text-right truncate max-w-xs mt-0.5">
                            {c.description}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">لا يوجد محتوى في هذا التصنيف</p>
          </div>
        )}
      </div>

      {showAdd && <ContentModal onClose={() => setShowAdd(false)} />}
      {editingContent && (
        <ContentModal
          initial={editingContent}
          onClose={() => setEditingContent(null)}
        />
      )}
    </div>
  )
}
