'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

const ALL_USERS = [
  { name: 'أحمد الحسن', email: 'ahmed@example.com', skills: 4, status: 'نشط', joined: '2026-06-17', role: 'مستخدم', avatar: 'AH', color: '#4F46E5' },
  { name: 'سارة إبراهيم', email: 'sara@example.com', skills: 2, status: 'نشط', joined: '2026-06-16', role: 'مستخدم', avatar: 'SI', color: '#8B5CF6' },
  { name: 'محمد علي', email: 'm.ali@example.com', skills: 6, status: 'غير نشط', joined: '2026-06-14', role: 'مستخدم', avatar: 'MA', color: '#06B6D4' },
  { name: 'نور الحسن', email: 'nour@example.com', skills: 1, status: 'نشط', joined: '2026-06-12', role: 'مستخدم', avatar: 'NH', color: '#F43F5E' },
  { name: 'خالد عمر', email: 'khaled@example.com', skills: 3, status: 'نشط', joined: '2026-06-10', role: 'مستخدم', avatar: 'KO', color: '#10B981' },
  { name: 'فاطمة يوسف', email: 'fatima@example.com', skills: 5, status: 'نشط', joined: '2026-06-08', role: 'مستخدم', avatar: 'FY', color: '#F97316' },
  { name: 'عمر عبدالله', email: 'omar@example.com', skills: 2, status: 'غير نشط', joined: '2026-06-05', role: 'مستخدم', avatar: 'OA', color: '#EC4899' },
  { name: 'ليلى أحمد', email: 'layla@example.com', skills: 4, status: 'نشط', joined: '2026-06-02', role: 'مشرف', avatar: 'LA', color: '#0EA5E9' },
]

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'الكل' | 'نشط' | 'غير نشط'>('الكل')

  const filtered = ALL_USERS.filter(u => {
    const matchSearch = u.name.includes(search) || u.email.includes(search)
    const matchFilter = filter === 'الكل' || u.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <DashboardHeader title="المستخدمون" subtitle={`${ALL_USERS.length} مستخدم مسجل`} />

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-row-reverse">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            dir="rtl"
            className="w-full h-11 pr-10 pl-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {(['الكل', 'نشط', 'غير نشط'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Add User */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة مستخدم
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">إجراءات</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الدور</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الحالة</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">المهارات</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">تاريخ الانضمام</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">البريد الإلكتروني</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">المستخدم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    user.role === 'مشرف' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    user.status === 'نشط' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'نشط' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-20 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(user.skills / 6) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{user.skills}/6</span>
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

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">لا توجد نتائج مطابقة</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            التالي →
          </button>
          <span className="text-sm text-slate-500">
            عرض {filtered.length} من {ALL_USERS.length} مستخدم
          </span>
          <button className="text-sm font-semibold text-slate-400 cursor-not-allowed">
            ← السابق
          </button>
        </div>
      </div>
    </div>
  )
}
