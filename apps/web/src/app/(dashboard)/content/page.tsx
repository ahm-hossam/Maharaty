'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Toggle } from '@/components/ui/Toggle'
import { api } from '@/lib/axios'
import {
  useAllContent,
  useCategories,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
  type Content,
} from '@/lib/queries'

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentType = 'COURSE' | 'VIDEO'
type TabFilter = 'ALL' | ContentType

interface VideoItem {
  id: string; title: string; url: string; youtubeId?: string; duration?: number; description?: string; order: number
}
interface Lecture {
  id: string; title: string; description?: string; videoUrl?: string; youtubeId?: string
  duration?: number; isFree: boolean; order: number
}
interface VideoMeta { videos: VideoItem[] }
interface CourseMeta {
  level?: 'beginner' | 'intermediate' | 'advanced'
  whatYouLearn?: string[]; requirements?: string[]; lectures?: Lecture[]
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
  ]
  for (const p of patterns) { const m = url.match(p); if (m) return m[1] }
  return null
}

function uid() { return Math.random().toString(36).slice(2, 9) }

const TYPE_LABELS: Record<ContentType, string> = { COURSE: 'دورة', VIDEO: 'فيديو' }
const TYPE_COLORS: Record<ContentType, string> = {
  COURSE: 'bg-[#EBF0FF] text-[#002880]',
  VIDEO: 'bg-violet-50 text-violet-700',
}
const TABS: { label: string; value: TabFilter }[] = [
  { label: 'الكل', value: 'ALL' },
  { label: 'دورة', value: 'COURSE' },
  { label: 'فيديو', value: 'VIDEO' },
]

// ─── Shared base fields ────────────────────────────────────────────────────────

interface BaseFields {
  titleAr: string; description: string; category: string; thumbnail: string; isPublished: boolean
}
const emptyBase: BaseFields = { titleAr: '', description: '', category: '', thumbnail: '', isPublished: false }

function ThumbnailField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<'upload' | 'url'>('upload')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url: string = res.data.url
      onChange(url.startsWith('http') ? url : `http://localhost:3001${url}`)
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
          <button type="button" onClick={() => setTab('upload')}
            className={`px-3 py-1.5 font-semibold transition-colors ${tab === 'upload' ? 'bg-[#0033A0] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
            رفع صورة
          </button>
          <button type="button" onClick={() => setTab('url')}
            className={`px-3 py-1.5 font-semibold transition-colors ${tab === 'url' ? 'bg-[#0033A0] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
            رابط URL
          </button>
        </div>
        <label className="text-sm font-semibold text-slate-700">الصورة المصغرة</label>
      </div>

      {tab === 'upload' ? (
        <div
          className="relative flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-[#0033A0] hover:bg-[#EBF0FF]/30 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <span className="text-sm text-[#0033A0] font-medium">جاري الرفع...</span>
          ) : (
            <>
              <svg className="w-7 h-7 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-slate-500">اضغط لاختيار صورة (JPG, PNG, WebP)</span>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      ) : (
        <input dir="ltr" value={value} onChange={e => onChange(e.target.value)}
          placeholder="https://..." className={INPUT_CLS} />
      )}

      {value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="thumbnail" className="w-full h-full object-cover"
            onError={e => (e.currentTarget.style.display = 'none')} />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function BaseFieldsSection({ form, setForm }: { form: BaseFields; setForm: (f: BaseFields) => void }) {
  const { data: existingCategories = [] } = useCategories()
  const [catOpen, setCatOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 text-right mb-1">العنوان (بالعربية) *</label>
        <input dir="rtl" value={form.titleAr} onChange={e => setForm({ ...form, titleAr: e.target.value })}
          placeholder="عنوان المحتوى..." className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 text-right mb-1">الوصف</label>
        <textarea dir="rtl" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3} placeholder="وصف مختصر..." className={TEXTAREA_CLS} />
      </div>
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 text-right mb-1">الفئة</label>
        <input dir="rtl" value={form.category}
          onChange={e => { setForm({ ...form, category: e.target.value }); setCatOpen(true) }}
          onFocus={() => setCatOpen(true)}
          onBlur={() => setTimeout(() => setCatOpen(false), 150)}
          placeholder="اكتب فئة جديدة أو اختر من القائمة..." className={INPUT_CLS} />
        {catOpen && existingCategories.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {existingCategories
              .filter(c => !form.category || c.toLowerCase().includes(form.category.toLowerCase()))
              .map(c => (
                <button key={c} type="button"
                  className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-[#EBF0FF] hover:text-[#002880] transition-colors"
                  onMouseDown={() => { setForm({ ...form, category: c }); setCatOpen(false) }}>
                  {c}
                </button>
              ))}
          </div>
        )}
      </div>
      <ThumbnailField value={form.thumbnail} onChange={url => setForm({ ...form, thumbnail: url })} />
      <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
        <label className="text-sm font-semibold text-slate-700">{form.isPublished ? 'منشور' : 'مسودة'}</label>
        <Toggle checked={form.isPublished} onChange={v => setForm({ ...form, isPublished: v })} />
      </div>
    </div>
  )
}

const INPUT_CLS = 'w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-[#0033A0] focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors text-sm'
const TEXTAREA_CLS = 'w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#0033A0] focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors resize-none text-sm'

// ─── Video Form ────────────────────────────────────────────────────────────────

function VideoForm({ initial, onClose }: { initial?: Content; onClose: () => void }) {
  const createContent = useCreateContent()
  const updateContent = useUpdateContent()

  const initialMeta = (initial?.meta as unknown as VideoMeta | null) ?? null

  const [base, setBase] = useState<BaseFields>(
    initial ? { titleAr: initial.titleAr, description: initial.description ?? '', category: initial.category ?? '', thumbnail: initial.thumbnail ?? '', isPublished: initial.isPublished } : emptyBase
  )
  const [videos, setVideos] = useState<VideoItem[]>(
    initialMeta?.videos ?? [{ id: uid(), title: '', url: '', order: 0 }]
  )

  const addVideo = () => setVideos(v => [...v, { id: uid(), title: '', url: '', order: v.length }])
  const removeVideo = (id: string) => setVideos(v => v.filter(x => x.id !== id))
  const updateVideo = (id: string, patch: Partial<VideoItem>) =>
    setVideos(v => v.map(x => x.id === id ? { ...x, ...patch, youtubeId: patch.url !== undefined ? (extractYouTubeId(patch.url ?? x.url) ?? undefined) : x.youtubeId } : x))

  const totalDuration = videos.reduce((s, v) => s + (v.duration ?? 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!base.titleAr.trim()) { toast.error('يرجى إدخال عنوان الفيديو'); return }
    const payload = {
      type: 'VIDEO' as ContentType,
      titleAr: base.titleAr.trim(),
      description: base.description || undefined,
      category: base.category || undefined,
      thumbnail: base.thumbnail || undefined,
      isPublished: base.isPublished,
      duration: totalDuration || undefined,
      meta: { videos } as Record<string, unknown>,
    }
    try {
      if (initial) { await updateContent.mutateAsync({ id: initial.id, ...payload }); toast.success('تم تحديث الفيديو') }
      else { await createContent.mutateAsync(payload); toast.success('تم إضافة الفيديو') }
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل الحفظ — تحقق من الاتصال وحاول مرة أخرى'
      toast.error(msg, { duration: 6000 })
    }
  }

  const isPending = createContent.isPending || updateContent.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BaseFieldsSection form={base} setForm={setBase} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={addVideo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm font-semibold hover:bg-violet-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            إضافة فيديو
          </button>
          <h3 className="text-sm font-bold text-slate-700">الفيديوهات ({videos.length})</h3>
        </div>
        <div className="space-y-4">
          {videos.map((v, i) => {
            const ytId = extractYouTubeId(v.url)
            return (
              <div key={v.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => removeVideo(v.id)} disabled={videos.length === 1}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors rounded-lg hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <span className="text-xs font-bold text-slate-500">فيديو {i + 1}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">عنوان الفيديو</label>
                  <input dir="rtl" value={v.title} onChange={e => updateVideo(v.id, { title: e.target.value })}
                    placeholder="عنوان هذا الفيديو..." className={INPUT_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">رابط الفيديو (YouTube أو رابط مباشر)</label>
                  <input dir="ltr" value={v.url} onChange={e => updateVideo(v.id, { url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... أو رابط مباشر" className={INPUT_CLS + ' text-left'} />
                </div>
                {ytId && (
                  <div className="rounded-xl overflow-hidden border border-purple-200 aspect-video bg-black">
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen title={v.title} />
                  </div>
                )}
                {!ytId && v.url && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 rounded-lg p-2">
                    <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    رابط مباشر: {v.url.slice(0, 50)}{v.url.length > 50 ? '...' : ''}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">المدة (بالدقائق)</label>
                  <input type="number" min="0" dir="rtl" value={v.duration ?? ''} onChange={e => updateVideo(v.id, { duration: parseInt(e.target.value) || undefined })}
                    placeholder="0" className={INPUT_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">وصف الفيديو</label>
                  <textarea dir="rtl" rows={3} value={v.description ?? ''} onChange={e => updateVideo(v.id, { description: e.target.value })}
                    placeholder="وصف مختصر لمحتوى هذا الفيديو..." className={TEXTAREA_CLS} />
                </div>
              </div>
            )
          })}
        </div>
        {totalDuration > 0 && (
          <p className="text-xs text-slate-500 text-right mt-2">المدة الإجمالية: {totalDuration} دقيقة</p>
        )}
      </div>

      <FormActions onClose={onClose} isPending={isPending} isEditing={!!initial} />
    </form>
  )
}

// ─── Course Form ───────────────────────────────────────────────────────────────

const LEVEL_LABELS = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }

function CourseForm({ initial, onClose }: { initial?: Content; onClose: () => void }) {
  const createContent = useCreateContent()
  const updateContent = useUpdateContent()
  const initialMeta = (initial?.meta as unknown as CourseMeta | null) ?? null

  const [base, setBase] = useState<BaseFields>(
    initial ? { titleAr: initial.titleAr, description: initial.description ?? '', category: initial.category ?? '', thumbnail: initial.thumbnail ?? '', isPublished: initial.isPublished } : emptyBase
  )
  const [level, setLevel] = useState<CourseMeta['level']>(initialMeta?.level ?? 'beginner')
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(initialMeta?.whatYouLearn ?? [''])
  const [requirements, setRequirements] = useState<string[]>(initialMeta?.requirements ?? [''])
  const [lectures, setLectures] = useState<Lecture[]>(
    initialMeta?.lectures ?? [{ id: uid(), title: '', description: '', videoUrl: '', isFree: true, order: 0 }]
  )

  const addLecture = () => setLectures(l => [...l, { id: uid(), title: '', description: '', videoUrl: '', isFree: false, order: l.length }])
  const removeLecture = (id: string) => setLectures(l => l.filter(x => x.id !== id))
  const updateLecture = (id: string, patch: Partial<Lecture>) =>
    setLectures(l => l.map(x => x.id === id ? {
      ...x, ...patch,
      youtubeId: patch.videoUrl !== undefined ? (extractYouTubeId(patch.videoUrl ?? '') ?? undefined) : x.youtubeId
    } : x))

  const moveLecture = (id: string, dir: -1 | 1) => {
    setLectures(prev => {
      const idx = prev.findIndex(x => x.id === id)
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr.map((x, i) => ({ ...x, order: i }))
    })
  }

  const totalDuration = lectures.reduce((s, l) => s + (l.duration ?? 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!base.titleAr.trim()) { toast.error('يرجى إدخال عنوان الدورة'); return }
    const emptyLecture = lectures.find(l => !l.title.trim())
    if (emptyLecture) { toast.error('يرجى إدخال عنوان لكل محاضرة'); return }
    const payload = {
      type: 'COURSE' as ContentType,
      titleAr: base.titleAr.trim(),
      description: base.description || undefined,
      category: base.category || undefined,
      thumbnail: base.thumbnail || undefined,
      isPublished: base.isPublished,
      duration: totalDuration || undefined,
      meta: { level, whatYouLearn: whatYouLearn.filter(Boolean), requirements: requirements.filter(Boolean), lectures } as Record<string, unknown>,
    }
    try {
      if (initial) { await updateContent.mutateAsync({ id: initial.id, ...payload }); toast.success('تم تحديث الدورة') }
      else { await createContent.mutateAsync(payload); toast.success('تم إضافة الدورة') }
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل الحفظ — تحقق من الاتصال وحاول مرة أخرى'
      toast.error(msg, { duration: 6000 })
    }
  }

  const isPending = createContent.isPending || updateContent.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BaseFieldsSection form={base} setForm={setBase} />

      {/* Level */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 text-right mb-2">مستوى الدورة</label>
        <div className="flex gap-2 ">
          {(['beginner', 'intermediate', 'advanced'] as const).map(lv => (
            <button key={lv} type="button" onClick={() => setLevel(lv)}
              className={`flex-1 h-10 rounded-xl text-sm font-semibold border-2 transition-all ${level === lv ? 'border-[#0033A0] bg-[#EBF0FF] text-[#002880]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {LEVEL_LABELS[lv]}
            </button>
          ))}
        </div>
      </div>

      {/* What you'll learn */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setWhatYouLearn(w => [...w, ''])}
            className="text-xs font-semibold text-[#0033A0] hover:text-[#001E60]">+ إضافة</button>
          <label className="text-sm font-semibold text-slate-700">ماذا ستتعلم</label>
        </div>
        <div className="space-y-2">
          {whatYouLearn.map((item, i) => (
            <div key={i} className="flex items-center gap-2 ">
              <input dir="rtl" value={item} onChange={e => { const a = [...whatYouLearn]; a[i] = e.target.value; setWhatYouLearn(a) }}
                placeholder={`نقطة تعليمية ${i + 1}...`} className={INPUT_CLS + ' flex-1'} />
              <button type="button" onClick={() => setWhatYouLearn(w => w.filter((_, j) => j !== i))}
                className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setRequirements(r => [...r, ''])}
            className="text-xs font-semibold text-[#0033A0] hover:text-[#001E60]">+ إضافة</button>
          <label className="text-sm font-semibold text-slate-700">المتطلبات السابقة</label>
        </div>
        <div className="space-y-2">
          {requirements.map((item, i) => (
            <div key={i} className="flex items-center gap-2 ">
              <input dir="rtl" value={item} onChange={e => { const a = [...requirements]; a[i] = e.target.value; setRequirements(a) }}
                placeholder={`متطلب ${i + 1}...`} className={INPUT_CLS + ' flex-1'} />
              <button type="button" onClick={() => setRequirements(r => r.filter((_, j) => j !== i))}
                className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lectures */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={addLecture}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF0FF] text-[#002880] rounded-lg text-sm font-semibold hover:bg-[#E0E8FF] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            إضافة محاضرة
          </button>
          <h3 className="text-sm font-bold text-slate-700">المحاضرات ({lectures.length})</h3>
        </div>
        <div className="space-y-4">
          {lectures.map((lec, i) => {
            const ytId = extractYouTubeId(lec.videoUrl ?? '')
            return (
              <div key={lec.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveLecture(lec.id, 1)} disabled={i === lectures.length - 1}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button type="button" onClick={() => moveLecture(lec.id, -1)} disabled={i === 0}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" onClick={() => removeLecture(lec.id)} disabled={lectures.length === 1}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 rounded hover:bg-red-50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">محاضرة {i + 1}</span>
                    <Toggle size="sm" checked={lec.isFree} onChange={v => updateLecture(lec.id, { isFree: v })} />
                    <span className="text-xs text-slate-500">{lec.isFree ? 'مجانية' : 'مدفوعة'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">عنوان المحاضرة *</label>
                  <input dir="rtl" value={lec.title} onChange={e => updateLecture(lec.id, { title: e.target.value })}
                    placeholder="عنوان المحاضرة..." className={INPUT_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">وصف المحاضرة</label>
                  <textarea dir="rtl" value={lec.description} onChange={e => updateLecture(lec.id, { description: e.target.value })}
                    rows={2} placeholder="ما الذي سيتعلمه الطالب في هذه المحاضرة..." className={TEXTAREA_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">رابط الفيديو (YouTube أو مباشر)</label>
                  <input dir="ltr" value={lec.videoUrl} onChange={e => updateLecture(lec.id, { videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..." className={INPUT_CLS + ' text-left'} />
                </div>
                {ytId && (
                  <div className="rounded-xl overflow-hidden border border-blue-100 aspect-video bg-black">
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen title={lec.title} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 text-right mb-1">المدة (دقائق)</label>
                  <input type="number" min="0" dir="rtl" value={lec.duration ?? ''} onChange={e => updateLecture(lec.id, { duration: parseInt(e.target.value) || undefined })}
                    placeholder="0" className={INPUT_CLS} />
                </div>
              </div>
            )
          })}
        </div>
        {totalDuration > 0 && (
          <p className="text-xs text-slate-500 text-right mt-2">
            إجمالي مدة الدورة: {Math.floor(totalDuration / 60)} ساعة {totalDuration % 60} دقيقة ({lectures.length} محاضرة)
          </p>
        )}
      </div>

      <FormActions onClose={onClose} isPending={isPending} isEditing={!!initial} />
    </form>
  )
}

// ─── Shared form actions ────────────────────────────────────────────────────────

function FormActions({ onClose, isPending, isEditing }: { onClose: () => void; isPending: boolean; isEditing: boolean }) {
  return (
    <div className="flex gap-3 pt-2 border-t border-slate-100">
      <button type="button" onClick={onClose} className="flex-1 h-11 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all">إلغاء</button>
      <button type="submit" disabled={isPending}
        className="flex-1 h-11 bg-gradient-to-r from-[#0033A0] to-[#002880] text-white rounded-xl font-semibold disabled:opacity-70 hover:from-[#002880] hover:to-[#001E60] transition-all">
        {isPending ? 'جارٍ الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة'}
      </button>
    </div>
  )
}

// ─── Type Selector (new content) ───────────────────────────────────────────────

const TYPE_CONFIG = {
  VIDEO: {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'فيديو', desc: 'أضف فيديو واحد أو مجموعة فيديوهات من YouTube أو رابط مباشر',
    color: 'border-violet-300 bg-violet-50 text-violet-700', hover: 'hover:border-violet-500 hover:shadow-violet-100',
  },
  COURSE: {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    label: 'دورة تعليمية', desc: 'أضف دورة كاملة بمحاضرات مرتبة مع تفاصيل كل محاضرة',
    color: 'border-blue-200 bg-[#EBF0FF] text-[#002880]', hover: 'hover:border-[#0033A0] hover:shadow-blue-100',
  },
}

function TypeSelector({ onSelect }: { onSelect: (t: ContentType) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 text-right">اختر نوع المحتوى الذي تريد إضافته</p>
      <div className="grid grid-cols-1 gap-4">
        {(Object.entries(TYPE_CONFIG) as [ContentType, typeof TYPE_CONFIG.VIDEO][]).map(([type, cfg]) => (
          <button key={type} type="button" onClick={() => onSelect(type)}
            className={`flex items-center gap-4  p-4 border-2 rounded-2xl transition-all shadow-sm hover:shadow-md ${cfg.color} ${cfg.hover}`}>
            <div className="flex-shrink-0">{cfg.icon}</div>
            <div className="text-right flex-1">
              <p className="font-bold text-base">{cfg.label}</p>
              <p className="text-sm opacity-75 mt-0.5">{cfg.desc}</p>
            </div>
            <svg className="w-5 h-5 opacity-50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

function ContentModal({ initial, onClose }: { initial?: Content; onClose: () => void }) {
  const [selectedType, setSelectedType] = useState<ContentType | null>(initial?.type ?? null)

  const title = initial
    ? `تعديل ${TYPE_LABELS[initial.type]}`
    : selectedType
      ? `إضافة ${TYPE_LABELS[selectedType]}`
      : 'إضافة محتوى جديد'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            {selectedType && !initial && (
              <button type="button" onClick={() => setSelectedType(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            {selectedType && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[selectedType]}`}>{TYPE_LABELS[selectedType]}</span>}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {!selectedType ? (
            <TypeSelector onSelect={setSelectedType} />
          ) : selectedType === 'VIDEO' ? (
            <VideoForm initial={initial} onClose={onClose} />
          ) : (
            <CourseForm initial={initial} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
      ))}
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const { data: allContent, isLoading, isError } = useAllContent()
  const deleteContent = useDeleteContent()
  const updateContent = useUpdateContent()
  const [tab, setTab] = useState<TabFilter>('ALL')
  const [showAdd, setShowAdd] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)

  const list: Content[] = Array.isArray(allContent) ? allContent : (allContent as any)?.content ?? []

  const filtered = list.filter(c => tab === 'ALL' || c.type === tab)

  const handleDelete = async (c: Content) => {
    if (!confirm(`هل أنت متأكد من حذف "${c.titleAr}"؟`)) return
    try { await deleteContent.mutateAsync(c.id); toast.success('تم حذف المحتوى') }
    catch { toast.error('فشل حذف المحتوى') }
  }

  const handleTogglePublish = async (c: Content) => {
    try {
      await updateContent.mutateAsync({ id: c.id, isPublished: !c.isPublished })
      toast.success(c.isPublished ? 'تم إلغاء النشر' : 'تم النشر')
    } catch { toast.error('فشلت العملية') }
  }

  return (
    <div>
      <DashboardHeader
        title="المحتوى"
        subtitle={isLoading ? 'جارٍ التحميل...' : `${list.length} عنصر محتوى`}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {/* Tabs — RIGHT in RTL */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.value ? 'bg-[#0033A0] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Add — LEFT in RTL */}
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0033A0] to-[#002880] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#0033A0]/25 hover:from-[#002880] hover:to-[#001E60] transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
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
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">العنوان</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">النوع</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الفئة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">التفاصيل</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الحالة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">تاريخ الإنشاء</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map(c => {
                    const meta = c.meta as any
                    const detailText = c.type === 'COURSE'
                      ? `${meta?.lectures?.length ?? 0} محاضرة`
                      : `${meta?.videos?.length ?? 1} فيديو`

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800 text-sm text-right max-w-xs truncate">{c.titleAr}</p>
                          {c.description && <p className="text-xs text-slate-400 text-right truncate max-w-xs mt-0.5">{c.description}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[c.type]}`}>
                            {TYPE_LABELS[c.type]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right">{c.category ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right">
                          <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold">{detailText}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Toggle size="sm" checked={c.isPublished} onChange={() => handleTogglePublish(c)} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right">
                          {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingContent(c)} className="p-1.5 text-slate-400 hover:text-[#0033A0] hover:bg-[#EBF0FF] rounded-lg transition-all">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
      {editingContent && <ContentModal initial={editingContent} onClose={() => setEditingContent(null)} />}
    </div>
  )
}
