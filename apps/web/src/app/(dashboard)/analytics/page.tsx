'use client'

import { useAnalytics, useActivities } from '@/lib/queries'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

const ACTIVITY_LABELS: Record<string, string> = {
  REGISTER: 'تسجيل جديد',
  LOGIN: 'تسجيل دخول',
  VIEW_COURSE: 'مشاهدة دورة',
  COMPLETE_COURSE: 'إتمام دورة',
  START_ASSESSMENT: 'بدء تقييم',
  COMPLETE_ASSESSMENT: 'إتمام تقييم',
  BUILD_CV: 'بناء سيرة ذاتية',
  PRACTICE_INTERVIEW: 'تدريب مقابلة',
  VIEW_JOBS: 'تصفح وظائف',
  VIEW_COMMUNITY: 'تصفح المجتمع',
  PATH_STEP_COMPLETE: 'خطوة مسار مكتملة',
}

const CHART_COLORS = [
  '#4F46E5', '#8B5CF6', '#F97316', '#EC4899',
  '#10B981', '#06B6D4', '#F59E0B', '#EF4444',
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
        <div className="w-12 h-5 bg-slate-200 rounded-full" />
      </div>
      <div className="w-24 h-8 bg-slate-200 rounded mb-2" />
      <div className="w-32 h-4 bg-slate-200 rounded" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28" /><div className="h-3 bg-slate-100 rounded w-36 mt-1" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-24" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
    </tr>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics()
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    page: 1,
    limit: 10,
  })

  const topActivitiesChart = (data?.topActivities ?? []).map((a, i) => ({
    name: ACTIVITY_LABELS[a.type] ?? a.type,
    count: a.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const mostUsedFeature =
    data?.topActivities?.[0]
      ? ACTIVITY_LABELS[data.topActivities[0].type] ?? data.topActivities[0].type
      : '—'

  const metricCards = data
    ? [
        {
          label: 'إجمالي المستخدمين',
          value: data.totalUsers.toLocaleString('ar-EG'),
          sub: `+${data.newUsersToday} اليوم`,
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          lightBg: 'bg-[#EBF0FF]',
          textColor: 'text-[#0033A0]',
        },
        {
          label: 'نشط هذا الأسبوع',
          value: data.newUsersThisWeek.toLocaleString('ar-EG'),
          sub: `من ${data.totalUsers} إجمالي`,
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          lightBg: 'bg-emerald-50',
          textColor: 'text-emerald-600',
        },
        {
          label: 'إجمالي الأنشطة',
          value: data.totalActivities.toLocaleString('ar-EG'),
          sub: `+${data.activitiesThisWeek} هذا الأسبوع`,
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          lightBg: 'bg-amber-50',
          textColor: 'text-amber-600',
        },
        {
          label: 'أكثر الميزات استخداماً',
          value: mostUsedFeature,
          sub: data.topActivities?.[0] ? `${data.topActivities[0].count} مرة` : '',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
          lightBg: 'bg-rose-50',
          textColor: 'text-rose-600',
        },
      ]
    : []

  const recentActivities =
    activitiesData?.activities ?? activitiesData?.data ?? activitiesData ?? []

  return (
    <div>
      <DashboardHeader
        title="التحليلات"
        subtitle="إحصاءات وتقارير تفصيلية"
      />

      {isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-right">
          <p className="text-sm font-semibold text-red-700">
            تعذّر تحميل التحليلات
          </p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : metricCards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${card.lightBg} ${card.textColor} p-3 rounded-xl`}
                  >
                    {card.icon}
                  </div>
                  {card.sub && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                      {card.sub}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800 mb-1 truncate">
                  {card.value}
                </p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* User Growth Line Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {/* Title RIGHT (first in DOM), badge LEFT (second) */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">نمو المستخدمين</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              آخر 30 يوماً
            </span>
          </div>
          {isLoading ? (
            <div className="h-[220px] bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.userGrowth ?? []}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontFamily: 'inherit',
                  }}
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fill="url(#analyticsGradient)"
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Activities Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 text-right mb-6">
            الأنشطة الأكثر استخداماً
          </h3>
          {isLoading ? (
            <div className="h-[220px] bg-slate-100 rounded-xl animate-pulse" />
          ) : topActivitiesChart.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-slate-400 text-sm">لا توجد بيانات</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topActivitiesChart} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topActivitiesChart.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 text-right">
            آخر الأنشطة
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {/* RTL order: المستخدم rightmost, الوقت leftmost */}
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">المستخدم</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">النشاط</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activitiesLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : Array.isArray(recentActivities) && recentActivities.length > 0
                ? recentActivities.map(
                    (
                      a: {
                        id: string
                        type: string
                        createdAt: string
                        user?: { name?: string; email?: string }
                      },
                      i: number
                    ) => (
                      <tr
                        key={a.id ?? i}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* المستخدم — rightmost */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800 text-right">{a.user?.name ?? '—'}</p>
                          <p className="text-xs text-slate-400 text-right">{a.user?.email ?? ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF0FF] text-[#002880]">
                            {ACTIVITY_LABELS[a.type] ?? a.type}
                          </span>
                        </td>
                        {/* الوقت — leftmost */}
                        <td className="px-6 py-4 text-sm text-slate-400 text-right">
                          {new Date(a.createdAt).toLocaleString('ar-EG', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    )
                  )
                : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <p className="text-slate-400 text-sm">لا توجد أنشطة</p>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
