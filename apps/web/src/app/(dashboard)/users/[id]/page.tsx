'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser, useUpdateUser, type UserDetail, type UserActivity } from '@/lib/queries'
import { Toggle } from '@/components/ui/Toggle'
import { toast } from 'sonner'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  USER: 'مستخدم',
  ADMIN: 'مشرف',
  SUPER_ADMIN: 'مشرف رئيسي',
}

const ACTIVITY_META: Record<string, { label: string; icon: string; color: string }> = {
  REGISTER:             { label: 'تسجيل جديد',         icon: '🎉', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LOGIN:                { label: 'تسجيل دخول',          icon: '🔐', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  VIEW_COURSE:          { label: 'مشاهدة محتوى',        icon: '👁️', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  COMPLETE_COURSE:      { label: 'أكمل محتوى',          icon: '✅', color: 'bg-green-50 text-green-700 border-green-200' },
  START_ASSESSMENT:     { label: 'بدأ تقييم',           icon: '📝', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  COMPLETE_ASSESSMENT:  { label: 'أكمل تقييم',          icon: '🏆', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  BUILD_CV:             { label: 'بناء السيرة الذاتية', icon: '📄', color: 'bg-[#EBF0FF] text-[#002880] border-blue-100' },
  PRACTICE_INTERVIEW:   { label: 'تدريب مقابلة',        icon: '🎙️', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  VIEW_JOBS:            { label: 'تصفح وظائف',          icon: '💼', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  VIEW_COMMUNITY:       { label: 'زيارة المجتمع',       icon: '👥', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  PATH_STEP_COMPLETE:   { label: 'خطوة مسار مكتملة',   icon: '⭐', color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  COURSE: 'كورس',
  VIDEO: 'فيديو',
  ARTICLE: 'مقال',
}

const CONTENT_TYPE_ICONS: Record<string, string> = {
  COURSE: '📚',
  VIDEO: '🎬',
  ARTICLE: '📝',
}

const SKILL_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'مبتدئ',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'متقدم',
  EXPERT: 'خبير',
}

const SKILL_LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-slate-100 text-slate-600',
  INTERMEDIATE: 'bg-blue-50 text-blue-700',
  ADVANCED: 'bg-[#EBF0FF] text-[#002880]',
  EXPERT: 'bg-violet-100 text-violet-700',
}

const AVATAR_COLORS = [
  '#4F46E5', '#8B5CF6', '#06B6D4', '#F43F5E',
  '#10B981', '#F97316', '#EC4899', '#0EA5E9',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 30) return new Date(date).toLocaleDateString('ar-EG')
  if (days > 0) return `منذ ${days} يوم`
  if (hours > 0) return `منذ ${hours} ساعة`
  if (mins > 0) return `منذ ${mins} دقيقة`
  return 'الآن'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 text-right ${color}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

function ActivityTimeline({ activities }: { activities: UserActivity[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? activities : activities.slice(0, 20)

  if (!activities.length) {
    return <EmptyState icon="📭" text="لا توجد أنشطة مسجلة بعد" />
  }

  return (
    <div className="space-y-2">
      {visible.map((act) => {
        const meta = ACTIVITY_META[act.type] ?? { label: act.type, icon: '•', color: 'bg-slate-50 text-slate-600 border-slate-200' }
        return (
          // RTL: icon RIGHT, text MIDDLE, timestamp LEFT — DOM order matches RTL flex
          <div key={act.id} className={`flex items-start gap-3 p-3 rounded-xl border ${meta.color}`}>
            <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-semibold text-sm">{meta.label}</p>
              {act.content && (
                <p className="text-xs opacity-70 mt-0.5 truncate">
                  {CONTENT_TYPE_ICONS[act.content.type]} {act.content.titleAr}
                </p>
              )}
              {!act.content && act.meta && typeof act.meta === 'object' && 'title' in (act.meta as object) && (
                <p className="text-xs opacity-70 mt-0.5 truncate">
                  {String((act.meta as Record<string, unknown>).title)}
                </p>
              )}
            </div>
            <span className="text-xs opacity-60 flex-shrink-0 mt-0.5">{timeAgo(act.createdAt)}</span>
          </div>
        )
      })}
      {activities.length > 20 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-2.5 text-sm font-semibold text-[#0033A0] hover:text-[#001E60] border border-blue-100 rounded-xl hover:bg-[#EBF0FF] transition-all"
        >
          {showAll ? 'إخفاء' : `عرض ${activities.length - 20} نشاط إضافي`}
        </button>
      )}
    </div>
  )
}

function ContentProgressSection({ items }: { items: UserDetail['contentProgress'] }) {
  if (!items.length) {
    return <EmptyState icon="📖" text="لم يبدأ أي محتوى بعد" />
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item, i) => {
        const completed = item.progress >= 100
        const typeIcon = CONTENT_TYPE_ICONS[item.content.type] ?? '📄'
        const typeLabel = CONTENT_TYPE_LABELS[item.content.type] ?? item.content.type

        return (
          // RTL: thumbnail RIGHT, info MIDDLE, badge LEFT
          <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {item.content.thumbnail ? (
              <img src={item.content.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#E0E8FF] flex items-center justify-center text-2xl flex-shrink-0">
                {typeIcon}
              </div>
            )}

            <div className="flex-1 min-w-0 text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-semibold">{typeLabel}</span>
                {item.content.category && (
                  <span className="text-xs text-slate-400">{item.content.category}</span>
                )}
              </div>
              <p className="font-semibold text-slate-800 text-sm mt-1 truncate">{item.content.titleAr}</p>
              {/* progress: % on right, bar on left in RTL */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold flex-shrink-0 ${completed ? 'text-emerald-600' : 'text-[#0033A0]'}`}>
                  {item.progress}%
                </span>
                <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${completed ? 'bg-emerald-500' : 'bg-[#0033A0]'}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {completed ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">مكتمل ✓</span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">جارٍ</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AssessmentsSection({ results }: { results: UserDetail['assessmentResults'] }) {
  if (!results.length) {
    return <EmptyState icon="📋" text="لم يؤدِّ أي تقييم بعد" />
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        // RTL: icon RIGHT, name MIDDLE, score LEFT
        <div key={r.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${r.passed ? 'bg-emerald-100' : 'bg-red-50'}`}>
            {r.passed ? '🏆' : '📝'}
          </div>
          <div className="flex-1 text-right">
            <p className="font-semibold text-slate-800 text-sm">{r.assessment.titleAr || r.assessment.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{new Date(r.completedAt).toLocaleDateString('ar-EG')}</p>
          </div>
          <div className="text-left flex-shrink-0">
            <p className={`text-xl font-black ${r.passed ? 'text-emerald-600' : 'text-red-500'}`}>{r.score}%</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {r.passed ? 'نجح' : 'لم ينجح'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkillsSection({ skills }: { skills: UserDetail['userSkills'] }) {
  if (!skills.length) {
    return <EmptyState icon="🌱" text="لا توجد مهارات مسجلة بعد" />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {skills.map((item, i) => (
        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-right">
          {/* RTL: skill name+icon on RIGHT, level badge on LEFT via justify-between */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SKILL_LEVEL_COLORS[item.level] ?? 'bg-slate-100 text-slate-600'}`}>
              {SKILL_LEVEL_LABELS[item.level] ?? item.level}
            </span>
            <div className="flex items-center gap-2">
              {item.skill.icon && <span className="text-lg">{item.skill.icon}</span>}
              <p className="font-semibold text-slate-800 text-sm">{item.skill.nameAr}</p>
            </div>
          </div>
          {/* RTL: % on RIGHT, bar on LEFT */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0033A0] w-8 text-right">{item.progress}%</span>
            <div className="flex-1 bg-slate-200 rounded-full h-2">
              <div className="bg-[#0033A0] h-2 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'activity',    label: 'النشاط' },
  { key: 'content',     label: 'المحتوى' },
  { key: 'assessments', label: 'التقييمات' },
  { key: 'skills',      label: 'المهارات' },
] as const

type TabKey = typeof TABS[number]['key']

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [activeTab, setActiveTab] = useState<TabKey>('activity')

  const { data: user, isLoading, isError } = useUser(id)
  const updateUser = useUpdateUser()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#0033A0] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-500">تعذّر تحميل بيانات المستخدم</p>
        <button onClick={() => router.back()} className="text-sm text-[#0033A0] underline">عودة</button>
      </div>
    )
  }

  const avatarColor = AVATAR_COLORS[user.name.charCodeAt(0) % AVATAR_COLORS.length]
  const completedContent = user.contentProgress.filter((c) => c.progress >= 100).length
  const passedAssessments = user.assessmentResults.filter((r) => r.passed).length

  const handleToggleActive = async (v: boolean) => {
    try {
      await updateUser.mutateAsync({ id: user.id, isActive: v })
      toast.success(v ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب')
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* ── Breadcrumb — RTL: المستخدمون RIGHT, / MIDDLE, user.name LEFT ── */}
      <div className="flex items-center gap-2 px-6 pt-6 pb-2 text-sm">
        <Link href="/users" className="text-slate-400 hover:text-[#0033A0] transition-colors">المستخدمون</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold truncate max-w-xs">{user.name}</span>
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto space-y-5">

        {/* ── Profile header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/*
            RTL flex (no reverse): first in DOM = rightmost visually.
            Avatar RIGHT → Info MIDDLE → Toggle LEFT
          */}
          <div className="flex items-start gap-5">

            {/* Avatar — rightmost in RTL */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(user.name)}
            </div>

            {/* Info */}
            <div className="flex-1 text-right">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role !== 'USER' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">{user.email}</p>
              {user.phone && <p className="text-slate-400 text-sm">{user.phone}</p>}
              <p className="text-xs text-slate-400 mt-1">
                انضم في {new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {(user.governorate || user.gender || user.education || user.fieldOfStudy) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.governorate && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      📍 {user.governorate}
                    </span>
                  )}
                  {user.gender && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      👤 {user.gender}
                    </span>
                  )}
                  {user.education && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      🎓 {user.education}
                    </span>
                  )}
                  {user.fieldOfStudy && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      📚 {user.fieldOfStudy}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Toggle — leftmost in RTL */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <Toggle checked={user.isActive} onChange={handleToggleActive} size="md" />
              <span className={`text-xs font-semibold ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {user.isActive ? 'نشط' : 'معطّل'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={user._count.activities}      label="إجمالي الأنشطة"     color="bg-[#EBF0FF] text-[#002880]" />
          <StatCard value={user._count.contentProgress} label="محتوى بدأه"          color="bg-blue-50 text-blue-700" />
          <StatCard value={completedContent}            label="محتوى أكمله"         color="bg-emerald-50 text-emerald-700" />
          <StatCard value={passedAssessments}           label="تقييمات نجح فيها"    color="bg-amber-50 text-amber-700" />
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Tab bar — RTL flex, no reverse */}
          <div className="flex border-b border-slate-100">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'text-[#0033A0] border-b-2 border-[#0033A0] bg-[#EBF0FF]/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                {tab.key === 'activity' && user._count.activities > 0 && (
                  <span className="mr-1.5 text-xs bg-[#E0E8FF] text-[#0033A0] px-1.5 py-0.5 rounded-full">
                    {user._count.activities}
                  </span>
                )}
                {tab.key === 'content' && user._count.contentProgress > 0 && (
                  <span className="mr-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {user._count.contentProgress}
                  </span>
                )}
                {tab.key === 'assessments' && user._count.assessmentResults > 0 && (
                  <span className="mr-1.5 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                    {user._count.assessmentResults}
                  </span>
                )}
                {tab.key === 'skills' && user.userSkills.length > 0 && (
                  <span className="mr-1.5 text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                    {user.userSkills.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'activity'     && <ActivityTimeline activities={user.activities} />}
            {activeTab === 'content'      && <ContentProgressSection items={user.contentProgress} />}
            {activeTab === 'assessments'  && <AssessmentsSection results={user.assessmentResults} />}
            {activeTab === 'skills'       && <SkillsSection skills={user.userSkills} />}
          </div>
        </div>

      </div>
    </div>
  )
}
