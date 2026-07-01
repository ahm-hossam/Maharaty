'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useAnalytics } from '@/lib/queries'
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
  PieChart,
  Pie,
} from 'recharts'
import { type DemographicBreakdown } from '@/lib/queries'

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#F97316', '#EC4899', '#10B981']
const GENDER_COLORS: Record<string, string> = { 'ذكر': '#3B82F6', 'أنثى': '#EC4899' }
const EDU_COLORS = ['#0033A0', '#8B5CF6', '#F97316', '#10B981', '#EC4899']

function DemographicBar({ title, data, colors }: {
  title: string
  data: DemographicBreakdown[]
  colors?: string[]
}) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 text-right mb-4">{title}</h3>
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات بعد</div>
      </div>
    )
  }
  const chartData = data.map((d) => ({ name: d.label, count: d.count }))
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-base font-bold text-slate-800 text-right mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} layout="vertical" margin={{ right: 16, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors?.[i] ?? CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function GenderPie({ data }: { data: DemographicBreakdown[] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 text-right mb-4">توزيع الجنس</h3>
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات بعد</div>
      </div>
    )
  }
  const chartData = data.map((d) => ({ name: d.label, value: d.count, fill: GENDER_COLORS[d.label] ?? '#94A3B8' }))
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-base font-bold text-slate-800 text-right mb-2">توزيع الجنس</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={160}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={38}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">{((d.value / total) * 100).toFixed(0)}%</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{d.name}</span>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400 text-right mt-1">{total} مستخدم</p>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        {/* badge LEFT in RTL (second in DOM) */}
        <div className="w-12 h-5 bg-slate-200 rounded-full" />
        {/* icon RIGHT in RTL (first in DOM) */}
        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
      </div>
      <div className="w-24 h-8 bg-slate-200 rounded mb-2" />
      <div className="w-32 h-4 bg-slate-200 rounded" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {/* Reversed column order for RTL: user | email | date | activities | status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 ">
          <div className="w-9 h-9 bg-slate-200 rounded-xl" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="w-32 h-4 bg-slate-200 rounded" /></td>
      <td className="px-6 py-4"><div className="w-20 h-3 bg-slate-200 rounded-full" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <div className="w-24 bg-slate-100 rounded-full h-1.5" />
          <div className="w-6 h-3 bg-slate-200 rounded" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
    </tr>
  )
}

export default function OverviewPage() {
  const { data, isLoading, isError, error } = useAnalytics()
  const qc = useQueryClient()

  const stats = data
    ? [
        {
          label: 'إجمالي المستخدمين',
          value: data.totalUsers.toLocaleString('ar-EG'),
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          bg: 'from-[#0033A0] to-[#002880]',
          lightBg: 'bg-[#EBF0FF]',
          textColor: 'text-[#0033A0]',
          sub: `+${data.newUsersThisWeek} هذا الأسبوع`,
        },
        {
          label: 'المستخدمون النشطون',
          value: data.activeUsers.toLocaleString('ar-EG'),
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          bg: 'from-emerald-500 to-teal-600',
          lightBg: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          sub: `+${data.newUsersToday} اليوم`,
        },
        {
          label: 'إجمالي المحتوى',
          value: data.totalContent.toLocaleString('ar-EG'),
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          bg: 'from-amber-500 to-orange-600',
          lightBg: 'bg-amber-50',
          textColor: 'text-amber-600',
          sub: `${data.publishedContent} منشور`,
        },
        {
          label: 'إجمالي الأنشطة',
          value: data.totalActivities.toLocaleString('ar-EG'),
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bg: 'from-rose-500 to-pink-600',
          lightBg: 'bg-rose-50',
          textColor: 'text-rose-600',
          sub: `+${data.activitiesThisWeek} هذا الأسبوع`,
        },
      ]
    : []

  const contentChartData = data
    ? [
        { name: 'دورات', count: data.contentByType.COURSE ?? 0, color: '#0033A0' },
        { name: 'فيديو', count: data.contentByType.VIDEO ?? 0, color: '#8B5CF6' },
      ]
    : []

  return (
    <div>
      <DashboardHeader
        title="نظرة عامة"
        subtitle="مرحباً بك في لوحة التحكم"
      />

      {/* Refresh — justify-end = LEFT in RTL */}
      <div className="flex justify-end mb-6 -mt-4">
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['analytics'] })}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-[#0033A0] hover:text-[#0033A0] transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          تحديث
        </button>
      </div>

      {isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-right">
          <p className="text-sm font-semibold text-red-700">
            تعذّر تحميل البيانات —{' '}
            {(error as { message?: string })?.message ?? 'خطأ في الاتصال بالخادم'}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                {/* Icon RIGHT (first in DOM in RTL), badge LEFT (second) */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    {stat.sub}
                  </span>
                  <div className={`${stat.lightBg} ${stat.textColor} p-3 rounded-xl`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1 text-right">{stat.value}</p>
                <p className="text-sm text-slate-500 text-right">{stat.label}</p>
              </div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Area Chart — user growth */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {/* Title RIGHT (first), badge LEFT (second) */}
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
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0033A0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0033A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
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
                  labelStyle={{ fontWeight: 700, color: '#0F172A' }}
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
                  stroke="#0033A0"
                  strokeWidth={3}
                  fill="url(#userGradient)"
                  dot={{ fill: '#0033A0', strokeWidth: 2, r: 4, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart — content by type */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 text-right mb-6">
            المحتوى حسب النوع
          </h3>
          {isLoading ? (
            <div className="h-[220px] bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={contentChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {contentChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Demographics */}
      {data && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 text-right mb-4">التحليلات الديموغرافية</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GenderPie data={data.genderBreakdown ?? []} />
            <DemographicBar
              title="توزيع المحافظات (أعلى 10)"
              data={data.governorateBreakdown ?? []}
            />
            <DemographicBar
              title="المؤهل الدراسي"
              data={data.educationBreakdown ?? []}
              colors={EDU_COLORS}
            />
            <DemographicBar
              title="مجالات الدراسة (أعلى 10)"
              data={data.fieldOfStudyBreakdown ?? []}
            />
          </div>
        </div>
      )}

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Title RIGHT (first in DOM), link LEFT (second) */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">أحدث المستخدمين</h3>
          <a
            href="/users"
            className="text-sm font-semibold text-[#0033A0] hover:text-[#001E60] transition-colors"
          >
            عرض الكل ←
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {/* RTL column order: rightmost first in DOM */}
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">المستخدم</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">البريد الإلكتروني</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">تاريخ الانضمام</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">الأنشطة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : (data?.recentUsers ?? []).map((user, i) => {
                    const initials = user.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                    const color = CHART_COLORS[i % CHART_COLORS.length]
                    const activityCount =
                      user.activities?.filter((a) => a.type === 'PATH_STEP_COMPLETE').length ?? 0
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* المستخدم — rightmost */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right">
                          {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-start gap-1.5">
                            <span className="text-sm text-slate-500 font-medium">{activityCount}</span>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5">
                              <div
                                className="bg-[#0033A0] h-1.5 rounded-full"
                                style={{ width: `${Math.min(activityCount * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        {/* الحالة — leftmost */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              user.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {user.isActive && (
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                            )}
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
