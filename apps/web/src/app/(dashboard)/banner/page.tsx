'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Toggle } from '@/components/ui/Toggle'
import { useBanner, useUpdateBanner, useAllContent, type BannerConfig } from '@/lib/queries'

const INPUT_CLS = 'w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors text-sm'

const PRESET_GRADIENTS = [
  { name: 'بنفسجي (افتراضي)', c1: '#6C63FF', c2: '#9C5CF7' },
  { name: 'فيروزي', c1: '#0EA5E9', c2: '#06B6D4' },
  { name: 'وردي', c1: '#EC4899', c2: '#F97316' },
  { name: 'أخضر', c1: '#10B981', c2: '#059669' },
  { name: 'داكن', c1: '#1E293B', c2: '#334155' },
  { name: 'ذهبي', c1: '#F59E0B', c2: '#EF4444' },
]

// ─── Live Banner Preview ───────────────────────────────────────────────────────

function BannerPreview({ form }: { form: BannerConfig }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg, ${form.bgColor1}, ${form.bgColor2})` }}>
      <div className="p-6 min-h-[140px] flex flex-col justify-between relative">
        {/* sparkle */}
        <div className="absolute top-4 left-4 opacity-70 text-2xl">✨</div>

        {/* text */}
        <div className="text-right space-y-2">
          <p className="text-white font-black text-xl leading-tight">
            {form.title || 'عنوان البانر'}
          </p>
          <p className="text-white/80 text-sm">
            {form.subtitle || 'النص الوصفي للبانر'}
          </p>
        </div>

        {/* bottom row */}
        <div className="flex items-center justify-between mt-4 ">
          {form.contentTitle && (
            <span className="text-white/80 text-xs bg-black/20 px-3 py-1 rounded-full">
              {form.contentTitle}
            </span>
          )}
          <span className="bg-white/20 border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-full">
            {form.ctaText || 'ابدأ التعلم ←'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BannerPage() {
  const { data: banner, isLoading } = useBanner()
  const updateBanner = useUpdateBanner()
  const { data: allContent = [] } = useAllContent()

  const [form, setForm] = useState<BannerConfig>({
    isActive: false,
    title: '',
    subtitle: '',
    ctaText: 'ابدأ التعلم ←',
    bgColor1: '#6C63FF',
    bgColor2: '#9C5CF7',
    contentId: null,
    contentType: null,
    contentTitle: null,
  })
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (banner) { setForm(banner); setDirty(false) }
  }, [banner])

  const patch = (partial: Partial<BannerConfig>) => {
    setForm(f => ({ ...f, ...partial }))
    setDirty(true)
  }

  const handleContentSelect = (id: string) => {
    if (!id) { patch({ contentId: null, contentType: null, contentTitle: null }); return }
    const item = allContent.find(c => c.id === id)
    if (!item) return
    patch({ contentId: item.id, contentType: item.type, contentTitle: item.titleAr })
  }

  const handleSave = async () => {
    try {
      await updateBanner.mutateAsync(form)
      toast.success('تم حفظ البانر بنجاح')
      setDirty(false)
    } catch {
      toast.error('فشل الحفظ')
    }
  }

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader title="البانر الترويجي" subtitle="تخصيص البانر الظاهر في تطبيق الجوال" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Editor ── */}
          <div className="space-y-5">

            {/* Active toggle */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between ">
                <div className="text-right">
                  <p className="font-bold text-slate-800">تفعيل البانر</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {form.isActive ? 'البانر مرئي للمستخدمين الآن' : 'البانر مخفي — لن يراه المستخدمون'}
                  </p>
                </div>
                <Toggle size="lg" checked={form.isActive} onChange={v => patch({ isActive: v })} />
              </div>
            </div>

            {/* Content link */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-right">ربط بمحتوى</h3>
              <p className="text-xs text-slate-500 text-right">اختر كورس أو فيديو أو مقال — الضغط على البانر سيفتحه</p>
              <select
                dir="rtl"
                value={form.contentId ?? ''}
                onChange={e => handleContentSelect(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">— بدون ربط —</option>
                {allContent.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'COURSE' ? '📚' : c.type === 'VIDEO' ? '🎬' : '📝'} {c.titleAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Text fields */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-right">النصوص</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 text-right mb-1">العنوان الرئيسي</label>
                <input dir="rtl" value={form.title} onChange={e => patch({ title: e.target.value })}
                  placeholder="مثال: مهارات الذكاء الاصطناعي 2026" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 text-right mb-1">النص الوصفي</label>
                <input dir="rtl" value={form.subtitle} onChange={e => patch({ subtitle: e.target.value })}
                  placeholder="مثال: دورة شاملة لإتقان أدوات AI في بيئة العمل" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 text-right mb-1">نص زر الدعوة</label>
                <input dir="rtl" value={form.ctaText} onChange={e => patch({ ctaText: e.target.value })}
                  placeholder="ابدأ التعلم ←" className={INPUT_CLS} />
              </div>
            </div>

            {/* Color presets */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-right">لون الخلفية</h3>

              {/* Preset swatches */}
              <div className="flex flex-wrap gap-2 justify-end">
                {PRESET_GRADIENTS.map(g => (
                  <button
                    key={g.name}
                    type="button"
                    title={g.name}
                    onClick={() => patch({ bgColor1: g.c1, bgColor2: g.c2 })}
                    className={`w-9 h-9 rounded-xl border-2 transition-transform hover:scale-110 ${form.bgColor1 === g.c1 ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }}
                  />
                ))}
              </div>

              {/* Custom color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 text-right mb-1">لون البداية</label>
                  <div className="flex items-center gap-2 ">
                    <input type="color" value={form.bgColor1} onChange={e => patch({ bgColor1: e.target.value })}
                      className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5 bg-white" />
                    <span className="text-xs text-slate-500 font-mono">{form.bgColor1}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 text-right mb-1">لون النهاية</label>
                  <div className="flex items-center gap-2 ">
                    <input type="color" value={form.bgColor2} onChange={e => patch({ bgColor2: e.target.value })}
                      className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5 bg-white" />
                    <span className="text-xs text-slate-500 font-mono">{form.bgColor2}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || updateBanner.isPending}
              className="w-full h-12 bg-gradient-to-l from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {updateBanner.isPending ? 'جاري الحفظ...' : dirty ? 'حفظ التغييرات' : 'لا توجد تغييرات'}
            </button>
          </div>

          {/* ── Right: Preview ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 text-right mb-4">معاينة مباشرة</h3>

              {/* Mobile frame */}
              <div className="bg-slate-100 rounded-2xl p-4">
                <div className="w-full max-w-xs mx-auto bg-white rounded-3xl overflow-hidden shadow-xl">
                  {/* status bar mock */}
                  <div className="h-8 bg-slate-50 flex items-center justify-center">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full" />
                  </div>

                  {/* header mock */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="h-5 w-28 bg-slate-200 rounded ml-auto" />
                    <div className="h-3 w-36 bg-slate-100 rounded mt-2 ml-auto" />
                  </div>

                  {/* category pills mock */}
                  <div className="px-4 py-3 flex gap-2  overflow-hidden">
                    {['الكل', 'برمجة', 'تسويق'].map(l => (
                      <span key={l} className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${l === 'الكل' ? 'text-white' : 'bg-slate-100 text-slate-500'}`}
                        style={l === 'الكل' ? { background: form.bgColor1 } : {}}>
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* banner preview */}
                  <div className="px-4 pb-4">
                    {form.isActive ? (
                      <BannerPreview form={form} />
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 min-h-[120px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-1">🚫</div>
                          <p className="text-xs text-slate-400">البانر غير مفعّل</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* course list mock */}
                  <div className="px-4 pb-6 space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 px-3 ">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-200 rounded w-4/5 ml-auto" />
                          <div className="h-2.5 bg-slate-100 rounded w-2/3 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* status pill */}
              <div className={`mt-4 text-center py-2 px-4 rounded-full text-sm font-semibold ${form.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {form.isActive ? '✓ البانر سيظهر في التطبيق' : 'البانر مخفي — فعّله للظهور في التطبيق'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
