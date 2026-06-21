'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { useSendNotification, useUsers } from '@/lib/queries'

type NotifType = 'in-app' | 'push' | 'both'
type TabMode = 'individual' | 'bulk'

const TYPE_OPTIONS: { label: string; value: NotifType }[] = [
  { label: 'داخل التطبيق', value: 'in-app' },
  { label: 'إشعار Push', value: 'push' },
  { label: 'كلاهما', value: 'both' },
]

function NotifPreview({
  title,
  body,
  type,
}: {
  title: string
  body: string
  type: NotifType
}) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white">
      <p className="text-xs text-slate-400 mb-3 text-right">معاينة الإشعار</p>
      <div className="bg-white/10 rounded-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1 text-right min-w-0">
          <p className="font-bold text-sm truncate">
            {title || 'عنوان الإشعار'}
          </p>
          <p className="text-xs text-white/70 mt-0.5 line-clamp-2">
            {body || 'نص الإشعار سيظهر هنا...'}
          </p>
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-xs text-white/40">الآن</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10">
              {type === 'in-app' ? 'داخل التطبيق' : type === 'push' ? 'Push' : 'كلاهما'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<TabMode>('individual')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<NotifType>('both')
  const [bulkAll, setBulkAll] = useState(true)
  const [bulkIds, setBulkIds] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedUserName, setSelectedUserName] = useState('')

  const sendNotification = useSendNotification()
  const { data: usersData } = useUsers({
    page: 1,
    search: userSearch,
    isActive: 'true',
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('أدخل العنوان ونص الإشعار')
      return
    }

    let payload: Parameters<typeof sendNotification.mutateAsync>[0]

    if (tab === 'bulk') {
      if (bulkAll) {
        payload = { bulk: true, title, body, type }
      } else {
        const ids = bulkIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (ids.length === 0) {
          toast.error('أدخل معرّفات المستخدمين')
          return
        }
        payload = { userIds: ids, title, body, type }
      }
    } else {
      if (!selectedUserId) {
        toast.error('اختر مستخدماً')
        return
      }
      payload = { userIds: [selectedUserId], title, body, type }
    }

    try {
      await sendNotification.mutateAsync(payload)
      toast.success('تم إرسال الإشعار بنجاح')
      setTitle('')
      setBody('')
      setSelectedUserId('')
      setSelectedUserName('')
      setBulkIds('')
    } catch {
      toast.error('فشل إرسال الإشعار')
    }
  }

  return (
    <div>
      <DashboardHeader
        title="الإشعارات"
        subtitle="إرسال إشعارات للمستخدمين"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 w-fit">
            {[
              { label: 'إشعار فردي', value: 'individual' as TabMode },
              { label: 'إشعار جماعي', value: 'bulk' as TabMode },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5"
          >
            {/* Individual: user search */}
            {tab === 'individual' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 text-right mb-2">
                  اختر المستخدم
                </label>
                <div className="relative">
                  <svg
                    className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    dir="rtl"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value)
                      setSelectedUserId('')
                    }}
                    placeholder="ابحث باسم المستخدم..."
                    className="w-full h-11 pr-10 pl-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors text-sm"
                  />
                </div>
                {selectedUserId && (
                  <p className="text-xs font-semibold text-emerald-600 text-right mt-2">
                    تم اختيار: {selectedUserName}
                  </p>
                )}
                {userSearch && !selectedUserId && usersData?.users && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {usersData.users.length === 0 && (
                      <p className="text-sm text-slate-400 p-4 text-center">لا نتائج</p>
                    )}
                    {usersData.users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(u.id)
                          setSelectedUserName(u.name)
                          setUserSearch(u.name)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors flex-row-reverse text-right"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bulk options */}
            {tab === 'bulk' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 text-right mb-2">
                  المستلمون
                </label>
                <div className="flex items-center gap-3 mb-3 flex-row-reverse">
                  <input
                    type="checkbox"
                    id="bulk-all"
                    checked={bulkAll}
                    onChange={(e) => setBulkAll(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <label htmlFor="bulk-all" className="text-sm font-semibold text-slate-700">
                    إرسال لجميع المستخدمين
                  </label>
                </div>
                {!bulkAll && (
                  <textarea
                    dir="ltr"
                    value={bulkIds}
                    onChange={(e) => setBulkIds(e.target.value)}
                    placeholder="أدخل معرّفات المستخدمين مفصولة بفواصل..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-left text-slate-800 bg-slate-50 focus:bg-white transition-colors resize-none text-sm font-mono"
                  />
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 text-right mb-2">
                عنوان الإشعار
              </label>
              <input
                required
                dir="rtl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الإشعار..."
                className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 text-right mb-2">
                نص الإشعار
              </label>
              <textarea
                required
                dir="rtl"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="نص الإشعار..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 text-right mb-2">
                نوع الإشعار
              </label>
              <div className="flex items-center gap-2 flex-row-reverse">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all border-2 ${
                      type === opt.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={sendNotification.isPending}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-base hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {sendNotification.isPending ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  إرسال الإشعار
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview + History */}
        <div className="space-y-6">
          <NotifPreview title={title} body={body} type={type} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 text-right mb-4">
              آخر الإشعارات المرسلة
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: 'تذكير بإتمام التقييم',
                  body: 'لا تنسَ إتمام تقييم المهارات',
                  time: 'منذ ساعة',
                  type: 'both',
                },
                {
                  title: 'مرحباً بك في مهاراتي',
                  body: 'ابدأ رحلتك التعليمية الآن',
                  time: 'أمس',
                  type: 'in-app',
                },
                {
                  title: 'محتوى جديد متاح',
                  body: 'تم إضافة دورة جديدة في التقنية',
                  time: 'منذ يومين',
                  type: 'push',
                },
              ].map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{n.body}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
