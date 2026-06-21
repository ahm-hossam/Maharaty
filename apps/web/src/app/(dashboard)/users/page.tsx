'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import {
  useUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
  type User,
} from '@/lib/queries'

const ROLE_LABELS: Record<string, string> = {
  USER: 'مستخدم',
  ADMIN: 'مشرف',
  SUPER_ADMIN: 'مشرف رئيسي',
}

const AVATAR_COLORS = [
  '#4F46E5', '#8B5CF6', '#06B6D4', '#F43F5E',
  '#10B981', '#F97316', '#EC4899', '#0EA5E9',
]

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-20" />
        </td>
      ))}
    </tr>
  )
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
}

interface EditFormData {
  name: string
  email: string
  role: string
  isActive: boolean
}

function AddUserModal({
  onClose,
}: {
  onClose: () => void
}) {
  const createUser = useCreateUser()
  const [form, setForm] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser.mutateAsync(form)
      toast.success('تم إنشاء المستخدم بنجاح')
      onClose()
    } catch {
      toast.error('فشل إنشاء المستخدم')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-slate-800">إضافة مستخدم جديد</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الاسم
            </label>
            <input
              required
              dir="rtl"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              البريد الإلكتروني
            </label>
            <input
              required
              type="email"
              dir="rtl"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              كلمة المرور
            </label>
            <input
              required
              type="password"
              dir="rtl"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الدور
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              dir="rtl"
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            >
              <option value="USER">مستخدم</option>
              <option value="ADMIN">مشرف</option>
              <option value="SUPER_ADMIN">مشرف رئيسي</option>
            </select>
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
              disabled={createUser.isPending}
              className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-70 hover:from-indigo-700 hover:to-violet-700 transition-all"
            >
              {createUser.isPending ? 'جارٍ الإنشاء...' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditUserModal({
  user,
  onClose,
}: {
  user: User
  onClose: () => void
}) {
  const updateUser = useUpdateUser()
  const [form, setForm] = useState<EditFormData>({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateUser.mutateAsync({ id: user.id, ...form })
      toast.success('تم تحديث المستخدم بنجاح')
      onClose()
    } catch {
      toast.error('فشل تحديث المستخدم')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-slate-800">تعديل المستخدم</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الاسم
            </label>
            <input
              required
              dir="rtl"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              البريد الإلكتروني
            </label>
            <input
              required
              type="email"
              dir="rtl"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-right mb-1">
              الدور
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              dir="rtl"
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
            >
              <option value="USER">مستخدم</option>
              <option value="ADMIN">مشرف</option>
              <option value="SUPER_ADMIN">مشرف رئيسي</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-1">
            <div
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
                form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                  form.isActive ? 'translate-x-1' : 'translate-x-5'
                }`}
              />
            </div>
            <label className="text-sm font-semibold text-slate-700">
              حالة الحساب — {form.isActive ? 'نشط' : 'غير نشط'}
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
              disabled={updateUser.isPending}
              className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold disabled:opacity-70 hover:from-indigo-700 hover:to-violet-700 transition-all"
            >
              {updateUser.isPending ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const { data, isLoading, isError } = useUsers({
    page,
    search: debouncedSearch,
    isActive: statusFilter,
  })

  const deleteUser = useDeleteUser()

  const handleDelete = async (user: User) => {
    if (!confirm(`هل أنت متأكد من حذف "${user.name}"؟`)) return
    try {
      await deleteUser.mutateAsync(user.id)
      toast.success('تم حذف المستخدم')
    } catch {
      toast.error('فشل حذف المستخدم')
    }
  }

  const users = data?.users ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div>
      <DashboardHeader
        title="المستخدمون"
        subtitle={isLoading ? 'جارٍ التحميل...' : `${total} مستخدم مسجل`}
      />

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-row-reverse">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            dir="rtl"
            className="w-full h-11 pr-10 pl-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          {[
            { label: 'الكل', value: '' },
            { label: 'نشط', value: 'true' },
            { label: 'غير نشط', value: 'false' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                statusFilter === f.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Add User */}
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة مستخدم
        </button>
      </div>

      {isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-right">
          <p className="text-sm font-semibold text-red-700">تعذّر تحميل المستخدمين</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">إجراءات</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الدور</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">الحالة</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">تقدم المسار</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">تاريخ الانضمام</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">البريد الإلكتروني</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-6 py-4">المستخدم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : users.map((user, i) => {
                  const initials = getInitials(user.name)
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
                  const pathSteps =
                    user.activities?.filter(
                      (a) => a.type === 'PATH_STEP_COMPLETE'
                    ).length ?? 0
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            user.role !== 'USER'
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            user.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {user.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(pathSteps * 10, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            {pathSteps}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-right">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">
                            {user.name}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>

        {!isLoading && users.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">لا توجد نتائج مطابقة</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed"
          >
            التالي →
          </button>
          <span className="text-sm text-slate-500">
            صفحة {page} من {totalPages} — {total} مستخدم
          </span>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed"
          >
            ← السابق
          </button>
        </div>
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  )
}
