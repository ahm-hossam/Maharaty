'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import {
  useCurriculum,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
  useCreateLecture,
  useUpdateLecture,
  useDeleteLecture,
  useReorderLectures,
  useUpdateContent,
  useDeleteContent,
  useCategories,
  type LmsSection,
  type LmsLecture,
  type LmsAttachment,
} from '@/lib/queries'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMin(min?: number | null) {
  if (!min) return null
  if (min < 60) return `${min} د`
  return `${Math.floor(min / 60)}س ${min % 60 > 0 ? `${min % 60}د` : ''}`
}

const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30 focus:border-[#0033A0] bg-slate-50 focus:bg-white transition-colors'
const TEXTAREA = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-right text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30 focus:border-[#0033A0] bg-slate-50 focus:bg-white transition-colors'

function CategoryInput({ value, onChange, categories }: { value: string; onChange: (v: string) => void; categories: string[] }) {
  const [open, setOpen] = useState(false)
  const filtered = categories.filter((c) => !value || c.toLowerCase().includes(value.toLowerCase()))

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={INPUT + ' pl-9'}
        placeholder="اختر من القائمة أو اكتب تصنيفاً جديداً..."
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </span>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.length > 0 && (
            <div className="max-h-44 overflow-y-auto">
              {filtered.map((c) => (
                <button key={c} type="button"
                  className={`w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${value === c ? 'bg-[#0033A0] text-white' : 'text-slate-700 hover:bg-[#EBF0FF] hover:text-[#002880]'}`}
                  onMouseDown={() => { onChange(c); setOpen(false) }}>
                  {value === c && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  )}
                  <span className="flex-1">{c}</span>
                </button>
              ))}
            </div>
          )}
          {value.trim() && !categories.includes(value.trim()) && (
            <button type="button"
              className="w-full text-right px-4 py-2.5 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-end gap-2 border-t border-slate-100"
              onMouseDown={() => { onChange(value.trim()); setOpen(false) }}>
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

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

const RTL_TOOLS = [
  { cmd: 'bold', icon: <strong>ب</strong>, title: 'غامق' },
  { cmd: 'italic', icon: <em>م</em>, title: 'مائل' },
  { cmd: 'underline', icon: <u>خ</u>, title: 'تسطير' },
] as const

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = value
      initialized.current = true
    }
  }, [value])

  const exec = useCallback((cmd: string, val?: string) => {
    ref.current?.focus()
    document.execCommand(cmd, false, val ?? undefined)
    onChange(ref.current?.innerHTML ?? '')
  }, [onChange])

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0033A0]/30 focus-within:border-[#0033A0] transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
        {RTL_TOOLS.map((t) => (
          <button key={t.cmd} type="button" title={t.title}
            onMouseDown={(e) => { e.preventDefault(); exec(t.cmd) }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all text-sm font-bold">
            {t.icon}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button type="button" title="عنوان كبير" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h2') }}
          className="px-2 h-8 rounded-lg text-xs font-black text-slate-600 hover:bg-white hover:shadow-sm transition-all">H2</button>
        <button type="button" title="عنوان صغير" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h3') }}
          className="px-2 h-8 rounded-lg text-xs font-black text-slate-600 hover:bg-white hover:shadow-sm transition-all">H3</button>
        <button type="button" title="فقرة" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'p') }}
          className="px-2 h-8 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white hover:shadow-sm transition-all">¶</button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button type="button" title="قائمة نقطية" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </button>
        <button type="button" title="قائمة مرقمة" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList') }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h11M9 12h11M9 19h11M4 5v.01M4 12v.01M4 19v.01" /></svg>
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button type="button" title="مسح التنسيق" onMouseDown={(e) => { e.preventDefault(); exec('removeFormat') }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm transition-all text-xs">✕</button>
      </div>
      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir="rtl"
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        className="min-h-[180px] max-h-[360px] overflow-y-auto p-4 text-sm text-slate-700 text-right focus:outline-none leading-relaxed
          [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-800 [&_h2]:mt-3 [&_h2]:mb-1
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:mt-2 [&_h3]:mb-1
          [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pr-5 [&_ol]:space-y-1
          [&_strong]:font-bold [&_em]:italic [&_u]:underline"
      />
    </div>
  )
}

// ─── Attachment Uploader ───────────────────────────────────────────────────────

function AttachmentUploader({ attachments, onChange }: { attachments: LmsAttachment[]; onChange: (a: LmsAttachment[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded: LmsAttachment[] = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await api.post('/upload/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:3001'
        uploaded.push({
          url: res.data.url.startsWith('http') ? res.data.url : `${BASE}${res.data.url}`,
          name: res.data.name ?? file.name,
          type: res.data.type ?? (file.type === 'application/pdf' ? 'pdf' : 'image'),
          size: res.data.size ?? file.size,
        })
      }
      onChange([...attachments, ...uploaded])
    } catch { toast.error('فشل رفع الملف') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const remove = (idx: number) => onChange(attachments.filter((_, i) => i !== idx))

  const fmtSize = (b?: number) => {
    if (!b) return ''
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-[#0033A0] hover:bg-[#EBF0FF]/30 transition-all cursor-pointer"
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-[#0033A0]">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span className="text-sm font-medium">جارٍ الرفع...</span>
          </div>
        ) : (
          <>
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            <span className="text-xs text-slate-500 font-medium">اضغط لإرفاق PDF أو صورة</span>
          </>
        )}
        <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
      </div>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 group">
              {/* Icon */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${att.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {att.type === 'pdf' ? (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17h-1v-5h1v5zm3.5 0h-1v-5h1v5zm3.5 0h-1v-5h1v5z"/></svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-semibold text-slate-700 truncate">{att.name}</p>
                {att.size && <p className="text-xs text-slate-400">{fmtSize(att.size)}</p>}
              </div>
              {/* Remove */}
              <button type="button" onClick={() => remove(i)}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Lecture Form Modal ────────────────────────────────────────────────────────

type ContentTab = 'video' | 'article' | 'attachments'

const CONTENT_TABS: { key: ContentTab; label: string; icon: string }[] = [
  { key: 'video', label: 'فيديو', icon: '▶' },
  { key: 'article', label: 'مقال', icon: '✏️' },
  { key: 'attachments', label: 'مرفقات', icon: '📎' },
]

interface LectureFormProps {
  sectionId: string
  contentId: string
  lecture?: LmsLecture
  onClose: () => void
}

function LectureFormModal({ sectionId, contentId, lecture, onClose }: LectureFormProps) {
  const isEdit = !!lecture
  const createLecture = useCreateLecture(contentId)
  const updateLecture = useUpdateLecture(contentId)

  const detectInitialTab = (): ContentTab => {
    if (lecture?.content) return 'article'
    if (lecture?.attachments?.length) return 'attachments'
    return 'video'
  }

  const [contentTab, setContentTab] = useState<ContentTab>(detectInitialTab)
  const [form, setForm] = useState({
    title: lecture?.title ?? '',
    description: lecture?.description ?? '',
    youtubeId: lecture?.youtubeId ?? '',
    videoUrl: lecture?.videoUrl ?? '',
    duration: lecture?.duration ? String(lecture.duration) : '',
    isFree: lecture?.isFree ?? false,
    isPublished: lecture?.isPublished ?? true,
  })
  const [richContent, setRichContent] = useState(lecture?.content ?? '')
  const [attachments, setAttachments] = useState<LmsAttachment[]>(lecture?.attachments ?? [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const payload = {
      title: form.title,
      description: form.description || undefined,
      youtubeId: contentTab === 'video' ? (form.youtubeId || undefined) : undefined,
      videoUrl: contentTab === 'video' ? (form.videoUrl || undefined) : undefined,
      content: contentTab === 'article' ? (richContent || undefined) : undefined,
      attachments: (contentTab === 'attachments' || contentTab === 'article') ? (attachments.length ? attachments : undefined) : undefined,
      duration: form.duration ? parseInt(form.duration) : undefined,
      isFree: form.isFree,
      isPublished: form.isPublished,
    }

    try {
      if (isEdit) {
        await updateLecture.mutateAsync({ id: lecture.id, ...payload })
        toast.success('تم تحديث المحاضرة')
      } else {
        await createLecture.mutateAsync({ sectionId, ...payload })
        toast.success('تمت إضافة المحاضرة')
      }
      onClose()
    } catch {
      toast.error('فشلت العملية')
    }
  }

  const isPending = createLecture.isPending || updateLecture.isPending

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h3 className="font-bold text-slate-800">{isEdit ? 'تعديل المحاضرة' : 'إضافة محاضرة'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">العنوان *</label>
            <input value={form.title} onChange={set('title')} required className={INPUT} placeholder="عنوان المحاضرة أو الحلقة" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">وصف مختصر</label>
            <textarea value={form.description} onChange={set('description')} rows={2} className={TEXTAREA} placeholder="ما ستغطيه هذه المحاضرة..." />
          </div>

          {/* Content type tabs */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 text-right">نوع المحتوى</label>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-4">
              {CONTENT_TABS.map((tab) => (
                <button key={tab.key} type="button" onClick={() => setContentTab(tab.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    contentTab === tab.key ? 'bg-white text-[#0033A0] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Video tab */}
            {contentTab === 'video' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 text-right">YouTube ID أو رابط</label>
                    <input value={form.youtubeId} onChange={set('youtubeId')} className={INPUT + ' text-left font-mono text-sm'} placeholder="dQw4w9WgXcQ" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 text-right">المدة (دقيقة)</label>
                    <input value={form.duration} onChange={set('duration')} type="number" min="0" className={INPUT} placeholder="15" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 text-right">رابط فيديو مباشر (mp4 / stream)</label>
                  <input value={form.videoUrl} onChange={set('videoUrl')} className={INPUT + ' text-left font-mono text-sm'} placeholder="https://..." dir="ltr" />
                </div>
              </div>
            )}

            {/* Article tab */}
            {contentTab === 'article' && (
              <div className="space-y-4">
                <RichTextEditor value={richContent} onChange={setRichContent} />
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 text-right">مرفقات المقال (PDF أو صور)</label>
                  <AttachmentUploader attachments={attachments} onChange={setAttachments} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 text-right">وقت القراءة التقديري (دقيقة)</label>
                  <input value={form.duration} onChange={set('duration')} type="number" min="0" className={INPUT} placeholder="5" />
                </div>
              </div>
            )}

            {/* Attachments tab */}
            {contentTab === 'attachments' && (
              <div className="space-y-3">
                <AttachmentUploader attachments={attachments} onChange={setAttachments} />
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 text-right">المدة / وقت المراجعة (دقيقة) — اختياري</label>
                  <input value={form.duration} onChange={set('duration')} type="number" min="0" className={INPUT} placeholder="0" />
                </div>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-end gap-6 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-slate-700">منشور</span>
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded accent-[#0033A0]" />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-slate-700">مجاني</span>
              <input type="checkbox" checked={form.isFree} onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))} className="w-4 h-4 rounded accent-emerald-500" />
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#0033A0] to-[#002880] text-white rounded-xl font-bold text-sm disabled:opacity-50">
              {isPending ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المحاضرة'}
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

// ─── Section Row ──────────────────────────────────────────────────────────────

interface SectionRowProps {
  section: LmsSection
  index: number
  total: number
  contentId: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

function SectionRow({ section, index, contentId, isFirst, isLast, onMoveUp, onMoveDown }: SectionRowProps) {
  const [expanded, setExpanded] = useState(true)
  const [editTitle, setEditTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title)
  const [addingLecture, setAddingLecture] = useState(false)
  const [editingLecture, setEditingLecture] = useState<LmsLecture | null>(null)

  const updateSection = useUpdateSection(contentId)
  const deleteSection = useDeleteSection(contentId)
  const deleteLecture = useDeleteLecture(contentId)
  const reorderLectures = useReorderLectures(contentId)

  const saveTitle = async () => {
    if (!titleDraft.trim() || titleDraft === section.title) { setEditTitle(false); return }
    try {
      await updateSection.mutateAsync({ id: section.id, title: titleDraft })
      toast.success('تم تحديث القسم')
    } catch { toast.error('فشل التحديث') }
    setEditTitle(false)
  }

  const handleDeleteSection = async () => {
    if (!confirm(`حذف القسم "${section.title}" وجميع محاضراته؟`)) return
    try {
      await deleteSection.mutateAsync(section.id)
      toast.success('تم حذف القسم')
    } catch { toast.error('فشل الحذف') }
  }

  const handleDeleteLecture = async (lec: LmsLecture) => {
    if (!confirm(`حذف "${lec.title}"؟`)) return
    try {
      await deleteLecture.mutateAsync(lec.id)
      toast.success('تم حذف المحاضرة')
    } catch { toast.error('فشل الحذف') }
  }

  const moveLecture = async (idx: number, dir: -1 | 1) => {
    const lectures = [...section.lectures]
    const [moved] = lectures.splice(idx, 1)
    lectures.splice(idx + dir, 0, moved)
    await reorderLectures.mutateAsync({
      sectionId: section.id,
      items: lectures.map((l, i) => ({ id: l.id, order: i })),
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
        <div className="flex flex-col gap-0.5">
          <button disabled={isFirst} onClick={onMoveUp} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button disabled={isLast} onClick={onMoveDown} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        <div className="w-8 h-8 rounded-lg bg-[#0033A0] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 text-right">
          {editTitle ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditTitle(false)} className="text-xs text-slate-400 hover:text-slate-600">إلغاء</button>
              <button onClick={saveTitle} className="text-xs text-[#0033A0] font-bold hover:text-[#002880]">حفظ</button>
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(false) }}
                className="flex-1 border border-[#0033A0]/50 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30"
              />
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-slate-400">{section.lectures.length} محاضرة</span>
              <span className="font-bold text-slate-800 text-sm">{section.title}</span>
            </div>
          )}
        </div>

        {!editTitle && (
          <div className="flex items-center gap-1">
            <button onClick={() => setAddingLecture(true)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="إضافة محاضرة">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={() => { setTitleDraft(section.title); setEditTitle(true) }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="تعديل العنوان">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={handleDeleteSection} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="حذف القسم">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button onClick={() => setExpanded((v) => !v)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors ml-1">
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Lectures */}
      {expanded && (
        <div className="divide-y divide-slate-50">
          {section.lectures.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm">
              لا توجد محاضرات بعد —{' '}
              <button onClick={() => setAddingLecture(true)} className="text-[#0033A0] font-semibold hover:underline">
                أضف أول محاضرة
              </button>
            </div>
          ) : (
            section.lectures.map((lec, li) => (
              <div key={lec.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group transition-colors">
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button disabled={li === 0} onClick={() => moveLecture(li, -1)} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button disabled={li === section.lectures.length - 1} onClick={() => moveLecture(li, 1)} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

                <div className="w-7 h-7 rounded-lg border-2 border-slate-200 text-slate-400 text-xs font-black flex items-center justify-center flex-shrink-0 bg-white">
                  {li + 1}
                </div>

                {(lec.youtubeId || lec.videoUrl) ? (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                ) : lec.content ? (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                ) : lec.attachments && (lec.attachments as unknown[]).length > 0 ? (
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
                  </div>
                )}

                <div className="flex-1 text-right min-w-0">
                  <div className="flex items-center justify-end gap-2">
                    {lec.isFree && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">مجاني</span>}
                    {!lec.isPublished && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">مسودة</span>}
                    <span className="text-sm font-semibold text-slate-700 truncate">{lec.title}</span>
                  </div>
                  {lec.description && <p className="text-xs text-slate-400 truncate mt-0.5">{lec.description}</p>}
                </div>

                {lec.duration && <span className="text-xs text-slate-400 font-medium flex-shrink-0">{fmtMin(lec.duration)}</span>}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingLecture(lec)} className="p-1.5 text-slate-400 hover:text-[#0033A0] hover:bg-[#0033A0]/5 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteLecture(lec)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="px-5 py-3">
            <button onClick={() => setAddingLecture(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 font-semibold hover:border-[#0033A0]/40 hover:text-[#0033A0] hover:bg-[#0033A0]/5 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              إضافة محاضرة
            </button>
          </div>
        </div>
      )}

      {(addingLecture || editingLecture) && (
        <LectureFormModal
          sectionId={section.id}
          contentId={contentId}
          lecture={editingLecture ?? undefined}
          onClose={() => { setAddingLecture(false); setEditingLecture(null) }}
        />
      )}
    </div>
  )
}

// ─── Details Tab ──────────────────────────────────────────────────────────────

function DetailsTab({ contentId }: { contentId: string }) {
  const router = useRouter()
  const { data, isLoading } = useCurriculum(contentId)
  const updateContent = useUpdateContent()
  const deleteContent = useDeleteContent()
  const { data: existingCategories = [] } = useCategories()
  const fileRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [thumbTab, setThumbTab] = useState<'upload' | 'url'>('upload')
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    titleAr: '',
    description: '',
    category: '',
    thumbnail: '',
    type: 'COURSE' as 'COURSE' | 'VIDEO',
    isPublished: false,
  })

  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([''])
  const [requirements, setRequirements] = useState<string[]>([''])

  useEffect(() => {
    if (!data) return
    setForm({
      titleAr: data.titleAr ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
      thumbnail: data.thumbnail ?? '',
      type: data.type,
      isPublished: data.isPublished,
    })
    const m = data.meta as any
    setLevel(m?.level ?? 'beginner')
    setWhatYouLearn(m?.whatYouLearn?.length ? m.whatYouLearn : [''])
    setRequirements(m?.requirements?.length ? m.requirements : [''])
  }, [data])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url: string = res.data.url
      setForm((f) => ({ ...f, thumbnail: url.startsWith('http') ? url : `http://localhost:3001${url}` }))
    } catch { toast.error('فشل رفع الصورة') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const handleSave = async () => {
    if (!form.titleAr.trim()) { toast.error('العنوان مطلوب'); return }
    setSaving(true)
    try {
      const currentMeta = (data?.meta ?? {}) as Record<string, unknown>
      const newMeta: Record<string, unknown> = {
        ...currentMeta,
        level,
        whatYouLearn: whatYouLearn.filter(Boolean),
        requirements: requirements.filter(Boolean),
      }
      await updateContent.mutateAsync({
        id: contentId,
        titleAr: form.titleAr.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        thumbnail: form.thumbnail || undefined,
        type: form.type,
        isPublished: form.isPublished,
        meta: newMeta,
      })
      toast.success('تم حفظ التفاصيل')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`حذف "${data?.titleAr}"؟ سيتم حذف جميع الأقسام والمحاضرات نهائياً.`)) return
    setDeleting(true)
    try {
      await deleteContent.mutateAsync(contentId)
      toast.success('تم حذف المحتوى')
      router.push('/lms')
    } catch { toast.error('فشل الحذف'); setDeleting(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-[#0033A0]/30 border-t-[#0033A0] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 text-right uppercase tracking-wider">معلومات أساسية</h2>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">العنوان *</label>
          <input value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} className={INPUT} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">الوصف</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={TEXTAREA} />
        </div>

        {/* Category with dropdown */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-right">الفئة</label>
          <CategoryInput
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            categories={existingCategories}
          />
        </div>

        {/* Thumbnail */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
              <button type="button" onClick={() => setThumbTab('upload')}
                className={`px-3 py-1.5 font-semibold transition-colors ${thumbTab === 'upload' ? 'bg-[#0033A0] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                رفع صورة
              </button>
              <button type="button" onClick={() => setThumbTab('url')}
                className={`px-3 py-1.5 font-semibold transition-colors ${thumbTab === 'url' ? 'bg-[#0033A0] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                رابط URL
              </button>
            </div>
            <label className="text-sm font-semibold text-slate-700">الصورة المصغرة</label>
          </div>

          {thumbTab === 'upload' ? (
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
                  <span className="text-xs text-slate-500">اضغط لاختيار صورة</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          ) : (
            <input dir="ltr" value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://..." className={INPUT + ' text-left'} />
          )}

          {form.thumbnail && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100 group mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.thumbnail} alt="thumbnail" className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')} />
              <button type="button" onClick={() => setForm((f) => ({ ...f, thumbnail: '' }))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 text-right">نوع المحتوى</label>
          <div className="grid grid-cols-2 gap-3">
            {(['COURSE', 'VIDEO'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${form.type === t ? 'border-[#0033A0] bg-[#0033A0]/5 text-[#0033A0]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {t === 'COURSE' ? '📚 دورة تعليمية' : '🎬 سلسلة فيديو'}
              </button>
            ))}
          </div>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-semibold text-slate-700">{form.isPublished ? 'منشور' : 'مسودة'}</span>
        </div>
      </div>

      {/* Course-specific meta */}
      {form.type === 'COURSE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-xs font-bold text-slate-400 text-right uppercase tracking-wider">تفاصيل الدورة</h2>

          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 text-right">المستوى</label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((lv) => (
                <button key={lv} type="button" onClick={() => setLevel(lv)}
                  className={`flex-1 h-10 rounded-xl text-sm font-semibold border-2 transition-all ${level === lv ? 'border-[#0033A0] bg-[#EBF0FF] text-[#002880]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {lv === 'beginner' ? 'مبتدئ' : lv === 'intermediate' ? 'متوسط' : 'متقدم'}
                </button>
              ))}
            </div>
          </div>

          {/* What you'll learn */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setWhatYouLearn((w) => [...w, ''])}
                className="text-xs font-semibold text-[#0033A0] hover:text-[#001E60]">+ إضافة</button>
              <label className="text-sm font-semibold text-slate-700">ماذا ستتعلم</label>
            </div>
            <div className="space-y-2">
              {whatYouLearn.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => setWhatYouLearn((w) => w.filter((_, j) => j !== i))}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <input dir="rtl" value={item} onChange={(e) => { const a = [...whatYouLearn]; a[i] = e.target.value; setWhatYouLearn(a) }}
                    placeholder={`نقطة تعليمية ${i + 1}...`} className={INPUT + ' flex-1'} />
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setRequirements((r) => [...r, ''])}
                className="text-xs font-semibold text-[#0033A0] hover:text-[#001E60]">+ إضافة</button>
              <label className="text-sm font-semibold text-slate-700">المتطلبات السابقة</label>
            </div>
            <div className="space-y-2">
              {requirements.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => setRequirements((r) => r.filter((_, j) => j !== i))}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <input dir="rtl" value={item} onChange={(e) => { const a = [...requirements]; a[i] = e.target.value; setRequirements(a) }}
                    placeholder={`متطلب ${i + 1}...`} className={INPUT + ' flex-1'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pb-8">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-3 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          {deleting ? 'جارٍ الحذف...' : 'حذف المحتوى'}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-[#0033A0] to-[#002880] text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:from-[#002880] hover:to-[#001E60] transition-all shadow-lg shadow-[#0033A0]/25"
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CurriculumBuilderPage() {
  const params = useParams<{ id: string }>()
  const contentId = params.id
  const router = useRouter()

  const { data, isLoading, isError } = useCurriculum(contentId)
  const createSection = useCreateSection(contentId)
  const reorderSections = useReorderSections(contentId)
  const updateContent = useUpdateContent()

  const [activeTab, setActiveTab] = useState<'curriculum' | 'details'>('curriculum')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [addingSection, setAddingSection] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionTitle.trim()) return
    try {
      await createSection.mutateAsync({ title: newSectionTitle })
      setNewSectionTitle('')
      setAddingSection(false)
      toast.success('تمت إضافة القسم')
    } catch { toast.error('فشل إضافة القسم') }
  }

  const moveSection = async (idx: number, dir: -1 | 1) => {
    if (!data) return
    const sections = [...data.sections]
    const [moved] = sections.splice(idx, 1)
    sections.splice(idx + dir, 0, moved)
    await reorderSections.mutateAsync(sections.map((s, i) => ({ id: s.id, order: i })))
  }

  const togglePublish = async () => {
    if (!data) return
    setPublishing(true)
    try {
      await updateContent.mutateAsync({ id: contentId, isPublished: !data.isPublished })
      toast.success(data.isPublished ? 'تم إلغاء النشر' : 'تم نشر المحتوى')
    } catch { toast.error('فشلت العملية') } finally { setPublishing(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-[#0033A0]/30 border-t-[#0033A0] rounded-full animate-spin" />
        <span className="text-sm font-medium">جارٍ التحميل...</span>
      </div>
    </div>
  )

  if (isError || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-slate-500 font-semibold">تعذّر تحميل المحتوى</p>
      <button onClick={() => router.push('/lms')} className="px-5 py-2.5 bg-[#0033A0] text-white rounded-xl text-sm font-bold">
        العودة للقائمة
      </button>
    </div>
  )

  const totalLectures = data.sections.reduce((acc, s) => acc + s.lectures.length, 0)
  const totalMinutes = data.sections.reduce((acc, s) =>
    acc + s.lectures.reduce((la, l) => la + (l.duration ?? 0), 0), 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
              data.isPublished
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            {publishing ? '...' : data.isPublished ? 'إلغاء النشر' : 'نشر الآن'}
          </button>
          <button onClick={() => router.push('/lms')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#0033A0] text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            العودة
          </button>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${data.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {data.isPublished ? 'منشور' : 'مسودة'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${data.type === 'COURSE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {data.type === 'COURSE' ? 'دورة' : 'سلسلة فيديو'}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-800 leading-tight">{data.titleAr}</h1>
          {data.category && <p className="text-sm text-[#0033A0] font-semibold mt-0.5">{data.category}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'الأقسام', value: data.sections.length },
          { label: 'المحاضرات', value: totalLectures },
          { label: 'إجمالي المدة', value: fmtMin(totalMinutes) ?? '—' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4 text-center">
            <div className="text-2xl font-black text-[#0033A0]">{s.value}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 mb-6 gap-1">
        {([
          { key: 'curriculum', label: 'المنهج الدراسي' },
          { key: 'details', label: 'تفاصيل الدورة' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-[#0033A0] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'curriculum' ? (
        <div className="space-y-3">
          {data.sections.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-slate-500 font-semibold mb-1">لا يوجد منهج بعد</p>
              <p className="text-slate-400 text-sm mb-5">أضف أول قسم لبدء بناء المنهج الدراسي</p>
              <button onClick={() => setAddingSection(true)}
                className="px-6 py-3 bg-[#0033A0] text-white rounded-xl font-bold text-sm">
                إضافة أول قسم
              </button>
            </div>
          ) : (
            data.sections.map((section, idx) => (
              <SectionRow
                key={section.id}
                section={section}
                index={idx}
                total={data.sections.length}
                contentId={contentId}
                isFirst={idx === 0}
                isLast={idx === data.sections.length - 1}
                onMoveUp={() => moveSection(idx, -1)}
                onMoveDown={() => moveSection(idx, 1)}
              />
            ))
          )}

          {addingSection ? (
            <form onSubmit={handleAddSection}
              className="bg-white rounded-2xl border-2 border-[#0033A0]/30 p-5">
              <p className="text-sm font-bold text-slate-700 text-right mb-3">إضافة قسم جديد</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAddingSection(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50">
                  إلغاء
                </button>
                <button type="submit" disabled={createSection.isPending}
                  className="px-5 py-2.5 bg-[#0033A0] text-white rounded-xl text-sm font-bold disabled:opacity-50">
                  {createSection.isPending ? 'جارٍ...' : 'إضافة'}
                </button>
                <input
                  autoFocus
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30 focus:border-[#0033A0]"
                  placeholder={data.type === 'COURSE' ? 'مثال: المقدمة والأسس' : 'مثال: الحلقات الأولى'}
                />
              </div>
            </form>
          ) : (
            <button onClick={() => setAddingSection(true)}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-[#0033A0]/40 hover:text-[#0033A0] hover:bg-[#0033A0]/5 transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {data.type === 'COURSE' ? 'إضافة قسم جديد' : 'إضافة قائمة تشغيل'}
            </button>
          )}
        </div>
      ) : (
        <DetailsTab contentId={contentId} />
      )}
    </div>
  )
}
