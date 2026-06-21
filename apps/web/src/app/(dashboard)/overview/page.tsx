'use client'

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

const GROWTH_DATA = [
  { month: 'يناير', users: 120 },
  { month: 'فبراير', users: 280 },
  { month: 'مارس', users: 450 },
  { month: 'أبريل', users: 680 },
  { month: 'مايو', users: 920 },
  { month: 'يونيو', users: 1247 },
]

const SKILLS_DATA = [
  { name: 'تقنية', count: 342, color: '#3B82F6' },
  { name: 'إدارة', count: 218, color: '#8B5CF6' },
  { name: 'تسويق', count: 189, color: '#F97316' },
  { name: 'تصميم', count: 156, color: '#EC4899' },
  { name: 'مبيعات', count: 134, color: '#10B981' },
]

const STATS = [
  {
    label: 'إجمالي المستخدمين',
    value: '1,247',
    change: '+12%',
    positive: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bg: 'from-indigo-500 to-violet-600',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    label: 'المستخدمون النشطون',
    value: '842',
    change: '+8%',
    positive: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bg: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    label: 'المهارات المتاحة',
    value: '24',
    change: '+3',
    positive: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    bg: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    label: 'التقييمات المكتملة',
    value: '3,891',
    change: '+24%',
    positive: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50',
    textColor: 'text-rose-600',
  },
]

const RECENT_USERS = [
  { name: 'أحمد الحسن', email: 'ahmed@example.com', skills: 4, status: 'نشط', joined: 'اليوم', avatar: 'AH', color: '#4F46E5' },
  { name: 'سارة إبراهيم', email: 'sara@example.com', skills: 2, status: 'نشط', joined: 'أمس', avatar: 'SI', color: '#8B5CF6' },
  { name: 'محمد علي', email: 'm.ali@example.com', skills: 6, status: 'غير نشط', joined: 'منذ 3 أيام', avatar: 'MA', color: '#06B6D4' },
  { name: 'نور الحسن', email: 'nour@example.com', skills: 1, status: 'نشط', joined: 'منذ 5 أيام', avatar: 'NH', color: '#F43F5E' },
  { name: 'خالد عمر', email: 'khaled@example.com', skills: 3, status: 'نشط', joined: 'منذ أسبوع', avatar: 'KO', color: '#10B981' },
]

export default function OverviewPage() {
  return (
    <div>
      <DashboardHeader
        title="نظرة عامة"
        subtitle={`يونيو 2026 — مرحباً بك في لوحة التحكم`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.lightBg} ${stat.textColor} p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Area Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">آخر 6 أشهر</span>
            <h3 className="text-lg font-bold text-slate-800">نمو المستخدمين</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={GROWTH_DATA}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'inherit' }}
                labelStyle={{ fontWeight: 700, color: '#0F172A' }}
              />
              <Area type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={3} fill="url(#userGradient)" dot={{ fill: '#4F46E5', strokeWidth: 2, r: 5, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 text-right mb-6">المستخدمون حسب المهارة</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SKILLS_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {SKILLS_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <a href="/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            عرض الكل ←
          </a>
          <h3 className="text-lg font-bold text-slate-800">أحدث المستخدمين</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">الحالة</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">المهارات</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">تاريخ الانضمام</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">البريد الإلكتروني</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">المستخدم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_USERS.map((user, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'نشط' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.status === 'نشط' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1.5" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${(user.skills / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 font-medium">{user.skills}/6</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">{user.joined}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: user.color }}>
                        {user.avatar}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
