import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import YoutubePlayer from 'react-native-youtube-iframe'
import { api } from '../../../services/api'
import { FONT, FS, COLORS, RADIUS } from '../../../constants/theme'


const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  id: string; title: string; url: string; youtubeId?: string; duration?: number; order: number
}
interface Lecture {
  id: string; title: string; description?: string; videoUrl?: string; youtubeId?: string
  duration?: number; isFree: boolean; order: number
}
interface VideoMeta { videos: VideoItem[] }
interface CourseMeta {
  level?: 'beginner' | 'intermediate' | 'advanced'
  whatYouLearn?: string[]; requirements?: string[]; lectures?: Lecture[]
}
interface ArticleMeta { content?: string; readTime?: number; tags?: string[] }

interface Content {
  id: string; type: 'COURSE' | 'VIDEO' | 'ARTICLE'; titleAr: string
  description?: string; category?: string; thumbnail?: string
  duration?: number; meta?: VideoMeta | CourseMeta | ArticleMeta
  isPublished: boolean; createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} د`
  return `${Math.floor(minutes / 60)}س ${minutes % 60}د`
}

// ─── YouTube Player ────────────────────────────────────────────────────────────

const PLAYER_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16)

function YouTubePlayer({ youtubeId }: { youtubeId: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <View style={styles.playerContainer}>
      <YoutubePlayer
        height={PLAYER_HEIGHT}
        width={SCREEN_WIDTH}
        videoId={youtubeId}
        play={playing}
        onChangeState={state => {
          if (state === 'ended') setPlaying(false)
        }}
        webViewProps={{
          allowsFullscreenVideo: true,
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
        initialPlayerParams={{
          controls: true,
          rel: false,
          modestbranding: true,
          preventFullScreen: false,
        }}
      />
    </View>
  )
}

// ─── Video Content ─────────────────────────────────────────────────────────────

function VideoContent({ meta }: { meta: VideoMeta }) {
  const videos = meta.videos ?? []
  const [activeIdx, setActiveIdx] = useState(0)
  const active = videos[activeIdx]

  if (!active) return <Text style={styles.empty}>لا توجد فيديوهات متاحة</Text>

  const ytId = active.youtubeId ?? null
  const isExternal = !ytId && !!active.url

  return (
    <View>
      {ytId ? (
        <YouTubePlayer youtubeId={ytId} title={active.title} />
      ) : isExternal ? (
        <TouchableOpacity style={styles.externalLinkBtn} onPress={() => Linking.openURL(active.url)}>
          <Text style={styles.externalLinkText}>▶ مشاهدة الفيديو</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.playerContainer, { backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#94a3b8', fontSize: FS.sm, fontFamily: FONT.regular }}>لا يوجد رابط لهذا الفيديو</Text>
        </View>
      )}

      <View style={styles.contentPad}>
      {active.title ? (
        <Text style={styles.videoTitle}>{active.title}</Text>
      ) : null}
      {active.duration ? (
        <Text style={styles.videoDuration}>{formatDuration(active.duration)}</Text>
      ) : null}

      {videos.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جميع الفيديوهات</Text>
          {videos.map((v, i) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.lectureCard, activeIdx === i && styles.lectureCardActive]}
              onPress={() => setActiveIdx(i)}
            >
              <View style={styles.lectureLeft}>
                <View style={[styles.lectureNum, activeIdx === i && styles.lectureNumActive]}>
                  <Text style={[styles.lectureNumText, activeIdx === i && styles.lectureNumTextActive]}>{i + 1}</Text>
                </View>
              </View>
              <View style={styles.lectureRight}>
                <Text style={[styles.lectureName, activeIdx === i && styles.lectureNameActive]}>
                  {v.title || `فيديو ${i + 1}`}
                </Text>
                {v.duration ? <Text style={styles.lectureDur}>{formatDuration(v.duration)}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      </View>
    </View>
  )
}

// ─── Course Content ────────────────────────────────────────────────────────────

function CourseContent({ meta }: { meta: CourseMeta }) {
  const lectures = meta.lectures ?? []
  const [activeLec, setActiveLec] = useState<Lecture | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const ytId = activeLec?.youtubeId ?? null

  return (
    <View>
      {activeLec && (
        <View>
          {ytId ? (
            <YouTubePlayer youtubeId={ytId} title={activeLec.title} />
          ) : activeLec.videoUrl ? (
            <View style={styles.contentPad}>
              <TouchableOpacity style={styles.externalLinkBtn} onPress={() => Linking.openURL(activeLec.videoUrl!)}>
                <Text style={styles.externalLinkText}>▶ مشاهدة المحاضرة</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.contentPad}>
            <Text style={styles.videoTitle}>{activeLec.title}</Text>
            {activeLec.description ? <Text style={styles.lectureDesc}>{activeLec.description}</Text> : null}
            <TouchableOpacity onPress={() => setActiveLec(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← قائمة المحاضرات</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!activeLec && (
        <View style={styles.contentPad}>
          {/* Meta badges */}
          <View style={styles.badgeRow}>
            {meta.level && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{LEVEL_LABELS[meta.level] ?? meta.level}</Text>
              </View>
            )}
            {lectures.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{lectures.length} محاضرة</Text>
              </View>
            )}
          </View>

          {/* What you'll learn */}
          {(meta.whatYouLearn?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ماذا ستتعلم</Text>
              <View style={styles.bulletBox}>
                {meta.whatYouLearn!.map((item, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>✓</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Requirements */}
          {(meta.requirements?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المتطلبات</Text>
              <View style={styles.bulletBox}>
                {meta.requirements!.map((item, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Lectures */}
          {lectures.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المحاضرات</Text>
              {lectures.map((lec, i) => (
                <TouchableOpacity
                  key={lec.id}
                  style={styles.lectureCard}
                  onPress={() => {
                    if (lec.videoUrl || lec.youtubeId) setActiveLec(lec)
                    else setExpandedId(expandedId === lec.id ? null : lec.id)
                  }}
                >
                  <View style={styles.lectureLeft}>
                    <View style={styles.lectureNum}>
                      <Text style={styles.lectureNumText}>{i + 1}</Text>
                    </View>
                  </View>
                  <View style={styles.lectureRight}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        {lec.isFree && (
                          <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>مجاني</Text></View>
                        )}
                        {(lec.videoUrl || lec.youtubeId) && (
                          <Text style={{ color: '#6366f1', fontSize: FS.md, fontFamily: FONT.regular }}>▶</Text>
                        )}
                      </View>
                      <Text style={styles.lectureName}>{lec.title}</Text>
                    </View>
                    {lec.duration ? <Text style={styles.lectureDur}>{formatDuration(lec.duration)}</Text> : null}
                    {expandedId === lec.id && lec.description ? (
                      <Text style={styles.lectureDesc}>{lec.description}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// ─── Article Content ───────────────────────────────────────────────────────────

function ArticleContent({ meta }: { meta: ArticleMeta }) {
  const words = (meta.content ?? '').split(/\s+/).filter(Boolean).length
  const readTime = meta.readTime ?? Math.max(1, Math.ceil(words / 200))

  return (
    <View>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{readTime} د قراءة</Text>
        </View>
        {(meta.tags?.length ?? 0) > 0 && meta.tags!.map((tag, i) => (
          <View key={i} style={[styles.badge, styles.tagBadge]}>
            <Text style={[styles.badgeText, styles.tagBadgeText]}>{tag}</Text>
          </View>
        ))}
      </View>
      {meta.content ? (
        <View style={styles.section}>
          <Text style={styles.articleBody}>{meta.content}</Text>
        </View>
      ) : (
        <Text style={styles.empty}>لا يوجد محتوى نصي لهذا المقال</Text>
      )}
    </View>
  )
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery<Content>({
    queryKey: ['content', id],
    queryFn: () => api.get(`/content/${id}`).then(r => r.data.data),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>تعذّر تحميل المحتوى</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← رجوع</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const meta = data.meta ?? {}

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>{data.titleAr}</Text>
          {data.category ? <Text style={styles.headerCategory}>{data.category}</Text> : null}
        </View>
      </View>

      {data.description ? (
        <Text style={styles.description}>{data.description}</Text>
      ) : null}

      {data.type === 'VIDEO' && <VideoContent meta={meta as VideoMeta} />}
      {data.type === 'COURSE' && <CourseContent meta={meta as CourseMeta} />}
      {data.type === 'ARTICLE' && (
        <View style={styles.contentPad}>
          <ArticleContent meta={meta as ArticleMeta} />
        </View>
      )}
    </ScrollView>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.canvas, gap: 12 },
  errorText: { fontSize: FS.md, color: COLORS.textMuted, fontFamily: FONT.semibold },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16,
    paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.surfaceBorder, gap: 12,
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.canvas,
    justifyContent: 'center', alignItems: 'center', marginTop: 2, flexShrink: 0,
  },
  headerBackText: { fontSize: FS.lg, color: COLORS.textSecondary, fontFamily: FONT.bold },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  headerTitle: { fontSize: FS.lg, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right', lineHeight: 26 },
  headerCategory: { fontSize: FS.sm - 1, color: COLORS.primary, fontFamily: FONT.semibold, marginTop: 4 },
  description: {
    fontSize: FS.sm, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22,
    fontFamily: FONT.regular,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.surfaceBorder,
  },

  playerContainer: { width: SCREEN_WIDTH, backgroundColor: '#000', overflow: 'hidden' },
  contentPad: { paddingHorizontal: 16, paddingTop: 8 },

  externalLinkBtn: {
    marginHorizontal: 0, marginBottom: 12, backgroundColor: '#6366f1',
    paddingVertical: 14, alignItems: 'center', borderRadius: 14,
  },
  externalLinkText: { color: COLORS.surface, fontSize: FS.md, fontFamily: FONT.bold },

  videoTitle: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right', marginTop: 12 },
  videoDuration: { fontSize: FS.sm - 2, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: FS.md, fontFamily: FONT.extrabold, color: COLORS.text, textAlign: 'right', marginBottom: 12 },

  lectureCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14,
    marginBottom: 10, padding: 14, borderWidth: 1.5, borderColor: COLORS.surfaceBorder,
    alignItems: 'flex-start',
  },
  lectureCardActive: { borderColor: '#6366f1', backgroundColor: '#f5f3ff' },
  lectureLeft: { marginLeft: 12, flexShrink: 0 },
  lectureRight: { flex: 1 },
  lectureNum: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.canvas,
    justifyContent: 'center', alignItems: 'center',
  },
  lectureNumActive: { backgroundColor: '#6366f1' },
  lectureNumText: { fontSize: FS.sm - 1, fontFamily: FONT.extrabold, color: COLORS.textMuted },
  lectureNumTextActive: { color: COLORS.surface },
  lectureName: { fontSize: FS.sm, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right' },
  lectureNameActive: { color: '#6366f1' },
  lectureDur: { fontSize: FS.sm - 2, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
  lectureDesc: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', marginTop: 8, lineHeight: 20 },

  backBtn: { marginTop: 12, paddingVertical: 10 },
  backBtnText: { fontSize: FS.sm, color: COLORS.primary, fontFamily: FONT.bold, textAlign: 'right' },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginBottom: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#e0e7ff', borderRadius: 20 },
  badgeText: { fontSize: FS.sm - 1, fontFamily: FONT.bold, color: '#4338ca' },
  tagBadge: { backgroundColor: '#fef3c7' },
  tagBadgeText: { color: '#92400e' },

  freeBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  freeBadgeText: { fontSize: FS.sm - 3, fontFamily: FONT.bold, color: '#16a34a' },

  bulletBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  bulletDot: { fontSize: FS.sm, color: '#6366f1', fontFamily: FONT.extrabold, width: 18, textAlign: 'center' },
  bulletText: { flex: 1, fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 21 },

  articleBody: {
    fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text, textAlign: 'right', lineHeight: 28,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
  },

  empty: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.regular, textAlign: 'center', marginTop: 20 },
})
