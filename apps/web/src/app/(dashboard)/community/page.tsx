'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import {
  useCommunityPosts,
  useCommunityStats,
  useCreatePost,
  useDeletePost,
  usePostComments,
  useAddComment,
  type CommunityPost,
  type CommunityComment,
} from '@/lib/queries'

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diff < 60) return `منذ ${diff} دقيقة`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  return `منذ ${days} يوم`
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ─── Comments Sheet ────────────────────────────────────────────────────────────

function CommentsSheet({
  postId,
  onClose,
}: {
  postId: string
  onClose: () => void
}) {
  const { data, isLoading } = usePostComments(postId)
  const addComment = useAddComment()
  const [text, setText] = useState('')

  const comments: CommunityComment[] = (data as any)?.comments ?? []

  const submit = async () => {
    if (!text.trim()) return
    try {
      await addComment.mutateAsync({ postId, content: text.trim() })
      setText('')
    } catch {
      toast.error('فشل إرسال التعليق')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-xl bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="font-bold text-slate-800">التعليقات</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && comments.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">لا توجد تعليقات بعد</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {initials(c.author.name)}
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-semibold text-slate-800">{c.author.name}</p>
                <p className="text-sm text-slate-600 mt-0.5">{c.content}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatTime(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              disabled={!text.trim() || addComment.isPending}
              className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <input
              dir="rtl"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="اكتب تعليقاً..."
              className="flex-1 h-10 px-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-right text-sm bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onDelete,
  onOpenComments,
}: {
  post: CommunityPost
  onDelete: (id: string) => void
  onOpenComments: (id: string) => void
}) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
        post.isAdminPost
          ? 'border-amber-300 ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/60 to-white'
          : 'border-slate-200'
      }`}
    >
      {post.isAdminPost && (
        <div className="flex items-center gap-1.5 mb-3 justify-end">
          <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
            إدارة مهاراتي ✦
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex flex-col items-end gap-1.5 text-right">
          <p className="text-sm font-bold text-slate-800">{post.author.name}</p>
          <p className="text-xs text-slate-400">{formatTime(post.createdAt)}</p>
          {post.isPinned && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
              📌 مثبّت
            </span>
          )}
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
            post.isAdminPost
              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
              : 'bg-gradient-to-br from-indigo-500 to-violet-600'
          }`}
        >
          {initials(post.author.name)}
        </div>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed text-right mt-3 pr-0">{post.content}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => onDelete(post.id)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          حذف
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <span>{post._count.comments}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{post._count.reactions}</span>
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create Post Form ─────────────────────────────────────────────────────────

function CreatePostForm() {
  const [content, setContent] = useState('')
  const createPost = useCreatePost()

  const submit = async () => {
    if (!content.trim()) return
    try {
      await createPost.mutateAsync({ content: content.trim(), isAdminPost: true })
      setContent('')
      toast.success('تم نشر المنشور بنجاح')
    } catch {
      toast.error('فشل النشر')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3 justify-end">
        <h3 className="font-bold text-slate-800">منشور جديد من الإدارة</h3>
        <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
          ✦ مميّز
        </span>
      </div>
      <p className="text-xs text-slate-500 text-right mb-3">
        المنشورات من هنا تظهر بتصميم مميّز في تطبيق الجوال
      </p>
      <textarea
        dir="rtl"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب رسالة أو إعلاناً للمجتمع..."
        rows={4}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-400 focus:outline-none text-right text-slate-800 bg-slate-50 focus:bg-white transition-colors resize-none text-sm"
      />
      <button
        onClick={submit}
        disabled={!content.trim() || createPost.isPending}
        className="mt-3 w-full h-11 bg-gradient-to-l from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg shadow-amber-200"
      >
        {createPost.isPending ? 'جاري النشر...' : 'نشر للمجتمع ✦'}
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [page, setPage] = useState(1)
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
  const { data, isLoading } = useCommunityPosts(page)
  const { data: stats } = useCommunityStats()
  const deletePost = useDeletePost()

  const posts: CommunityPost[] = data?.posts ?? []

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المنشور؟')) return
    try {
      await deletePost.mutateAsync(id)
      toast.success('تم حذف المنشور')
    } catch {
      toast.error('فشل الحذف')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader
        title="المجتمع"
        subtitle="إدارة منشورات المجتمع والتفاعل مع الأعضاء"
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'إجمالي المنشورات', value: stats?.total ?? '—', icon: '💬' },
              { label: 'منشورات الإدارة', value: stats?.adminPosts ?? '—', icon: '✦' },
              { label: 'إجمالي التعليقات', value: posts.reduce((s, p) => s + p._count.comments, 0), icon: '🗨️' },
              { label: 'إجمالي الإعجابات', value: posts.reduce((s, p) => s + p._count.reactions, 0), icon: '❤️' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-right">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {data && data.totalPages > 1 && (
                    <>
                      <button
                        onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
                        disabled={page >= data.totalPages}
                        className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 border border-slate-200 rounded-lg"
                      >
                        ‹ التالي
                      </button>
                      <span className="text-xs text-slate-400">
                        {page} / {data.totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page <= 1}
                        className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 border border-slate-200 rounded-lg"
                      >
                        السابق ›
                      </button>
                    </>
                  )}
                </div>
                <h2 className="font-bold text-slate-800 text-right">
                  {data ? `${data.total} منشور` : 'المنشورات'}
                </h2>
              </div>

              {isLoading && (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && posts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-slate-600 font-semibold">لا توجد منشورات بعد</p>
                  <p className="text-slate-400 text-sm mt-1">كن أول من ينشر في المجتمع!</p>
                </div>
              )}

              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDelete}
                  onOpenComments={(id) => setCommentsPostId(id)}
                />
              ))}
            </div>

            {/* Sidebar: Create Post */}
            <div className="space-y-4">
              <CreatePostForm />

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-right mb-3">دليل المشرف</h3>
                <ul className="space-y-2 text-right">
                  {[
                    'منشورات الإدارة تظهر بإطار ذهبي مميز',
                    'يمكن للمستخدمين الإعجاب والتعليق',
                    'بإمكانك حذف أي منشور من القائمة',
                    'المنشورات مرتبة حسب الأحدث',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {commentsPostId && (
        <CommentsSheet
          postId={commentsPostId}
          onClose={() => setCommentsPostId(null)}
        />
      )}
    </div>
  )
}
