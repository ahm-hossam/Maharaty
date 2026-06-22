'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import {
  useSAQuestions,
  useSAStats,
  useCreateSAQuestion,
  useUpdateSAQuestion,
  useDeleteSAQuestion,
  useSeedSAQuestions,
  type SAQuestion,
} from '@/lib/queries'

const CATEGORIES = [
  { value: 'R', label: 'البراعة التنفيذية', color: 'bg-amber-100 text-amber-800' },
  { value: 'I', label: 'التفكير التحليلي', color: 'bg-blue-100 text-blue-800' },
  { value: 'A', label: 'الإبداع والابتكار', color: 'bg-pink-100 text-pink-800' },
  { value: 'S', label: 'الكفاءة التواصلية', color: 'bg-teal-100 text-teal-800' },
  { value: 'E', label: 'الكفاءة القيادية', color: 'bg-red-100 text-red-800' },
  { value: 'C', label: 'الدقة التنظيمية', color: 'bg-emerald-100 text-emerald-800' },
]

const INPUT = 'w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors text-sm'
const SELECT = 'w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors text-sm'
const TEXTAREA = 'w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors resize-none text-sm'

function catStyle(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.color ?? 'bg-slate-100 text-slate-600'
}
function catLabel(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat
}
function dimLabel(q: SAQuestion) {
  return q.dimensionLabel || catLabel(q.category)
}
function apiError(err: unknown, fallback: string) {
  const msg = (err as any)?.response?.data?.message
  if (Array.isArray(msg)) return msg[0]
  return msg ?? fallback
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ question, onClose }: { question: SAQuestion; onClose: () => void }) {
  const update = useUpdateSAQuestion()
  const [textAr, setTextAr]               = useState(question.textAr)
  const [category, setCategory]           = useState(question.category)
  const [dimensionLabel, setDimensionLabel] = useState(question.dimensionLabel)
  const [orderIndex, setOrderIndex]       = useState(question.orderIndex)
  const [isActive, setIsActive]           = useState(question.isActive)

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setDimensionLabel(CATEGORIES.find((c) => c.value === val)?.label ?? '')
  }

  const save = async () => {
    if (textAr.trim().length < 5) { toast.error('نص السؤال قصير جداً (5 أحرف على الأقل)'); return }
    try {
      await update.mutateAsync({ id: question.id, textAr, category, dimensionLabel, orderIndex, isActive })
      toast.success('تم حفظ السؤال')
      onClose()
    } catch (err) {
      toast.error(apiError(err, 'فشل الحفظ'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="font-bold text-slate-800">تعديل السؤال</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 text-right mb-1">
            نص السؤال <span className="text-slate-400">(5 أحرف على الأقل)</span>
          </label>
          <textarea dir="rtl" value={textAr} onChange={(e) => setTextAr(e.target.value)} rows={3} className={TEXTAREA} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 text-right mb-1">النوع</label>
            <select dir="rtl" value={category} onChange={(e) => handleCategoryChange(e.target.value)} className={SELECT}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.value} — {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 text-right mb-1">البُعد</label>
            <input dir="rtl" value={dimensionLabel} onChange={(e) => setDimensionLabel(e.target.value)} className={INPUT} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 text-right mb-1">رقم الترتيب</label>
            <input type="number" min={1} value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} className={INPUT} />
          </div>
          <div className="flex items-center justify-end gap-2 h-11">
            <span className="text-sm font-semibold text-slate-700">{isActive ? 'مفعّل' : 'معطّل'}</span>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <button
          onClick={save}
          disabled={textAr.trim().length < 5 || update.isPending}
          className="w-full h-11 bg-gradient-to-l from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
        >
          {update.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  )
}

// ─── Add Question Form ────────────────────────────────────────────────────────

function AddForm({ nextOrder }: { nextOrder: number }) {
  const create = useCreateSAQuestion()
  const [textAr, setTextAr]               = useState('')
  const [category, setCategory]           = useState('R')
  const [dimensionLabel, setDimensionLabel] = useState('البراعة التنفيذية')
  const [orderIndex, setOrderIndex]       = useState(nextOrder)
  const [isActive, setIsActive]           = useState(true)

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setDimensionLabel(CATEGORIES.find((c) => c.value === val)?.label ?? '')
  }

  const valid = textAr.trim().length >= 5

  const submit = async () => {
    if (!valid) { toast.error('نص السؤال قصير جداً (5 أحرف على الأقل)'); return }
    try {
      await create.mutateAsync({ textAr: textAr.trim(), category, dimensionLabel, orderIndex, isActive })
      setTextAr('')
      setOrderIndex((o) => o + 1)
      toast.success('تم إضافة السؤال')
    } catch (err) {
      toast.error(apiError(err, 'فشل الإضافة'))
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-slate-800 text-right">إضافة سؤال جديد</h3>

      <div>
        <label className="block text-xs font-semibold text-slate-500 text-right mb-1">
          نص السؤال <span className="text-slate-400">(5 أحرف على الأقل)</span>
        </label>
        <textarea
          dir="rtl"
          value={textAr}
          onChange={(e) => setTextAr(e.target.value)}
          placeholder="اكتب نص السؤال باللغة العربية..."
          rows={3}
          className={`${TEXTAREA} ${!valid && textAr.length > 0 ? 'border-red-300 focus:border-red-400' : ''}`}
        />
        {!valid && textAr.length > 0 && (
          <p className="text-xs text-red-500 text-right mt-1">يجب أن يكون النص 5 أحرف على الأقل</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 text-right mb-1">النوع RIASEC</label>
          <select dir="rtl" value={category} onChange={(e) => handleCategoryChange(e.target.value)} className={SELECT}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.value} — {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 text-right mb-1">البُعد</label>
          <input dir="rtl" value={dimensionLabel} onChange={(e) => setDimensionLabel(e.target.value)} className={INPUT} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 text-right mb-1">رقم الترتيب</label>
          <input
            type="number"
            min={1}
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            className={INPUT}
          />
        </div>
        <div className="flex items-center justify-end gap-2 h-11">
          <span className="text-sm font-semibold text-slate-700">{isActive ? 'مفعّل' : 'معطّل'}</span>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!valid || create.isPending}
        className="w-full h-11 bg-gradient-to-l from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
      >
        {create.isPending ? 'جاري الإضافة...' : '+ إضافة السؤال'}
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelfAssessmentPage() {
  const { data: questions = [], isLoading } = useSAQuestions()
  const { data: stats } = useSAStats()
  const deleteQ  = useDeleteSAQuestion()
  const updateQ  = useUpdateSAQuestion()
  const seed     = useSeedSAQuestions()
  const [editQ, setEditQ] = useState<SAQuestion | null>(null)

  const handleDelete = async (id: string, text: string) => {
    if (!confirm(`حذف السؤال: "${text.slice(0, 40)}..."؟`)) return
    try {
      await deleteQ.mutateAsync(id)
      toast.success('تم الحذف')
    } catch (err) {
      toast.error(apiError(err, 'فشل الحذف'))
    }
  }

  const handleToggleActive = async (q: SAQuestion) => {
    try {
      await updateQ.mutateAsync({ id: q.id, isActive: !q.isActive })
      toast.success(q.isActive ? 'تم تعطيل السؤال' : 'تم تفعيل السؤال')
    } catch (err) {
      toast.error(apiError(err, 'فشل التحديث'))
    }
  }

  const handleSeed = async () => {
    try {
      const res = await seed.mutateAsync()
      const d = (res as any).data?.data
      toast.success(d?.message ?? 'تم الاستيراد')
    } catch (err) {
      toast.error(apiError(err, 'فشل الاستيراد'))
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader title="التقييم الذاتي" subtitle="إدارة أسئلة تقييم RIASEC المهني" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'إجمالي الأسئلة', value: stats?.total ?? '—', icon: '📝' },
              { label: 'الأسئلة المفعّلة', value: stats?.active ?? '—', icon: '✅' },
              { label: 'نتائج المستخدمين', value: stats?.results ?? '—', icon: '📊' },
              { label: 'أبعاد RIASEC', value: 6, icon: '🧭' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-right">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={handleSeed}
                  disabled={seed.isPending || (stats?.total ?? 0) > 0}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {seed.isPending ? 'جاري الاستيراد...' : '↓ استيراد الأسئلة الافتراضية (15 سؤال)'}
                </button>
                <h2 className="font-bold text-slate-800">{questions.length} سؤال</h2>
              </div>

              {isLoading && (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && questions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-slate-600 font-semibold">لا توجد أسئلة بعد</p>
                  <p className="text-slate-400 text-sm mt-1">أضف سؤالاً أو استورد الأسئلة الافتراضية</p>
                </div>
              )}

              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${q.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}
                >
                  {/* Card row: actions on left, content on right */}
                  <div className="flex items-start gap-3">
                    {/* Content — right side in RTL */}
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs text-slate-400 font-mono tabular-nums">#{q.orderIndex}</span>
                        {!q.isActive && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">معطّل</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${catStyle(q.category)}`}>
                          {dimLabel(q)} · {q.category}
                        </span>
                      </div>
                      {/* Question text */}
                      <p className="text-sm text-slate-700 leading-relaxed text-right">{q.textAr}</p>
                    </div>

                    {/* Actions — left side in RTL */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {/* Edit */}
                      <button
                        onClick={() => setEditQ(q)}
                        title="تعديل"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {/* Toggle active/inactive */}
                      <button
                        onClick={() => handleToggleActive(q)}
                        title={q.isActive ? 'تعطيل' : 'تفعيل'}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                          q.isActive
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={q.isActive
                              ? 'M5 13l4 4L19 7'
                              : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                            }
                          />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(q.id, q.textAr)}
                        title="حذف"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar: Add + Guide */}
            <div className="space-y-4">
              <AddForm nextOrder={questions.length + 1} />

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-right mb-3">أنواع RIASEC</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <div key={c.value} className="flex items-center gap-2 justify-end">
                      <p className="text-xs text-slate-600 text-right">{c.label}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center ${c.color}`}>
                        {c.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editQ && <EditModal question={editQ} onClose={() => setEditQ(null)} />}
    </div>
  )
}
