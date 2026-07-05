import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import YoutubePlayer from 'react-native-youtube-iframe'
import { WebView } from 'react-native-webview'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { FONT, FS, COLORS, RADIUS, SHADOW } from '@/constants/theme'

const { width: W } = Dimensions.get('window')
const PLAYER_H = Math.round((W * 9) / 16)

// ─── Static demo data ──────────────────────────────────────────────────────────

const DEMO_CONTENT: Record<string, any> = {
  default: {
    id: 'demo',
    type: 'COURSE',
    titleAr: 'دورة تعليمية',
    category: 'مهارات مهنية',
    description: 'محتوى تعليمي متميز يساعدك في تطوير مهاراتك المهنية.',
    meta: {
      whatYouLearn: ['أساسيات المجال', 'تطبيقات عملية', 'مهارات احترافية'],
      requirements: ['لا يوجد متطلبات مسبقة'],
    },
    sections: [
      {
        id: 's1',
        title: 'المقدمة والأساسيات',
        order: 0,
        lectures: [
          { id: 'l1', title: 'مقدمة الدورة', youtubeId: null, videoUrl: null, duration: 5, isFree: true, isPublished: true, order: 0 },
          { id: 'l2', title: 'ما ستتعلمه في هذه الدورة', youtubeId: null, videoUrl: null, duration: 8, isFree: true, isPublished: true, order: 1 },
        ],
      },
      {
        id: 's2',
        title: 'المحتوى الرئيسي',
        order: 1,
        lectures: [
          { id: 'l3', title: 'المفاهيم الأساسية', youtubeId: null, videoUrl: null, duration: 15, isFree: false, isPublished: true, order: 0 },
          { id: 'l4', title: 'التطبيق العملي', youtubeId: null, videoUrl: null, duration: 20, isFree: false, isPublished: true, order: 1 },
          { id: 'l5', title: 'أمثلة من الواقع', youtubeId: null, videoUrl: null, duration: 18, isFree: false, isPublished: true, order: 2 },
        ],
      },
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(min?: number | null) {
  if (!min) return null
  return min < 60 ? `${min} د` : `${Math.floor(min / 60)}س${min % 60 ? ` ${min % 60}د` : ''}`
}

function buildVideoHtml(url: string) {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:#000;overflow:hidden}video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain}</style></head><body><video controls playsinline webkit-playsinline src="${url}"></video></body></html>`
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// ─── Video Player ──────────────────────────────────────────────────────────────

function VideoPlayer({ lecture }: { lecture: any }) {
  const [playing, setPlaying] = useState(false)

  // Resolve YouTube ID from the dedicated field OR by parsing a full YouTube URL
  const ytId = lecture.youtubeId ?? (lecture.videoUrl ? extractYouTubeId(lecture.videoUrl) : null)

  if (ytId) {
    return (
      <View style={{ width: W, height: PLAYER_H, backgroundColor: '#000' }}>
        <YoutubePlayer
          height={PLAYER_H}
          width={W}
          videoId={ytId}
          play={playing}
          onChangeState={(s: string) => { if (s === 'ended') setPlaying(false) }}
          webViewProps={{
            allowsFullscreenVideo: true,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          initialPlayerParams={{ controls: true, rel: false }}
        />
      </View>
    )
  }

  if (lecture.videoUrl) {
    return (
      <WebView
        source={{ html: buildVideoHtml(lecture.videoUrl) }}
        style={{ width: W, height: PLAYER_H, backgroundColor: '#000' }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        scrollEnabled={false}
        originWhitelist={['*']}
      />
    )
  }

  return (
    <View style={S.noVideoPlaceholder}>
      <Ionicons name="videocam-off-outline" size={36} color="rgba(255,255,255,0.25)" />
      <Text style={S.noVideoText}>لا يوجد رابط لهذه المحاضرة</Text>
    </View>
  )
}

// ─── Section Accordion ────────────────────────────────────────────────────────

function SectionAccordion({
  section,
  sectionIdx,
  activeLectureId,
  onSelectLecture,
  completedIds,
}: {
  section: any
  sectionIdx: number
  activeLectureId: string | null
  onSelectLecture: (lec: any) => void
  completedIds: Set<string>
}) {
  const [expanded, setExpanded] = useState(sectionIdx === 0)
  const doneCount = section.lectures.filter((l: any) => completedIds.has(l.id)).length
  const allDone = doneCount === section.lectures.length && section.lectures.length > 0
  const sectionDur = section.lectures.reduce((a: number, l: any) => a + (l.duration ?? 0), 0)

  return (
    <View style={S.sCard}>
      <TouchableOpacity
        style={S.sHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
      >
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
        />
        <View style={S.sTitleArea}>
          <Text style={S.sTitle}>{section.title}</Text>
          <View style={S.sMeta}>
            <View style={[S.sProgressPill, allDone && S.sProgressPillDone]}>
              <Ionicons
                name={allDone ? 'checkmark' : 'school-outline'}
                size={10}
                color={allDone ? '#fff' : COLORS.textMuted}
              />
              <Text style={[S.sProgressText, allDone && { color: '#fff' }]}>
                {doneCount}/{section.lectures.length}
              </Text>
            </View>
            {sectionDur > 0 && <Text style={S.sDurText}>{fmt(sectionDur)}</Text>}
          </View>
        </View>
        <View style={[S.sNumBadge, allDone && S.sNumBadgeDone]}>
          {allDone
            ? <Ionicons name="checkmark" size={14} color="#fff" />
            : <Text style={S.sNumText}>{sectionIdx + 1}</Text>
          }
        </View>
      </TouchableOpacity>

      {expanded && section.lectures.map((lec: any, li: number) => {
        const isActive = activeLectureId === lec.id
        const isDone = completedIds.has(lec.id)
        const hasVideo = !!(lec.youtubeId || lec.videoUrl)

        return (
          <TouchableOpacity
            key={lec.id}
            style={[S.lRow, isActive && S.lRowActive, isDone && S.lRowDone]}
            onPress={() => onSelectLecture(lec)}
            activeOpacity={0.7}
          >
            {isActive && <View style={S.lActiveMark} />}
            <View style={S.lInfo}>
              <View style={S.lTitleRow}>
                {lec.isFree && !isDone && (
                  <View style={S.freePill}>
                    <Text style={S.freePillText}>مجاني</Text>
                  </View>
                )}
                <Text
                  style={[S.lName, isActive && S.lNameActive, isDone && S.lNameDone]}
                  numberOfLines={2}
                >
                  {lec.title}
                </Text>
              </View>
              {lec.duration ? <Text style={S.lDur}>{fmt(lec.duration)}</Text> : null}
            </View>
            <View style={[S.lIcon, isDone && S.lIconDone, isActive && !isDone && S.lIconActive]}>
              {isDone ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : hasVideo ? (
                <Ionicons name="play" size={10} color={isActive ? COLORS.primary : COLORS.textMuted} />
              ) : (
                <Text style={S.lIconNum}>{li + 1}</Text>
              )}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function LearningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [activeLecture, setActiveLecture] = useState<any | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'curriculum' | 'about'>('curriculum')

  const data = DEMO_CONTENT[id ?? ''] ?? DEMO_CONTENT.default
  const sections: any[] = data.sections ?? []
  const allLectures = sections.flatMap((s: any) => s.lectures)
  const totalLectures = allLectures.length
  const totalMinutes = allLectures.reduce((a: number, l: any) => a + (l.duration ?? 0), 0)
  const progressPct = totalLectures > 0 ? Math.round((completedIds.size / totalLectures) * 100) : 0

  const activeLectureIdx = allLectures.findIndex((l: any) => l.id === activeLecture?.id)
  const hasPrev = activeLectureIdx > 0
  const hasNext = activeLectureIdx !== -1 && activeLectureIdx < allLectures.length - 1
  const isCurrentDone = activeLecture ? completedIds.has(activeLecture.id) : false

  const handleSelectLecture = (lec: any) => setActiveLecture(lec)

  const handleMarkDone = () => {
    if (!activeLecture || isCurrentDone) return
    setCompletedIds((prev) => new Set([...prev, activeLecture.id]))
  }

  const handleNext = () => {
    if (!isCurrentDone) handleMarkDone()
    if (hasNext) setActiveLecture(allLectures[activeLectureIdx + 1])
  }

  const handlePrev = () => {
    if (hasPrev) setActiveLecture(allLectures[activeLectureIdx - 1])
  }

  return (
    <View style={S.root}>
      <ScrollView
        style={S.scroll}
        contentContainerStyle={{ paddingBottom: activeLecture ? 90 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top: Player or Hero ─────────────────────────────────── */}
        {activeLecture ? (
          <View style={[S.playerWrap, { paddingTop: insets.top }]}>
            <VideoPlayer lecture={activeLecture} />
            <TouchableOpacity style={[S.playerBackBtn, { top: insets.top + 8 }]} onPress={() => setActiveLecture(null)}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={S.lecInfoPanel}>
              <View style={S.lecInfoTop}>
                {isCurrentDone && (
                  <View style={S.doneBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.teal} />
                    <Text style={S.doneBadgeText}>مكتملة</Text>
                  </View>
                )}
                <Text style={S.lecInfoTitle}>{activeLecture.title}</Text>
                {activeLecture.description ? (
                  <Text style={S.lecInfoDesc} numberOfLines={2}>{activeLecture.description}</Text>
                ) : null}
              </View>
              <View style={S.lecInfoMeta}>
                {fmt(activeLecture.duration) && (
                  <View style={S.metaChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                    <Text style={S.metaChipText}>{fmt(activeLecture.duration)}</Text>
                  </View>
                )}
                {activeLecture.isFree && (
                  <View style={[S.metaChip, S.metaChipFree]}>
                    <Text style={S.metaChipFreeText}>مجاني</Text>
                  </View>
                )}
                <Text style={S.lecCounter}>{activeLectureIdx + 1} / {totalLectures}</Text>
              </View>
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={['#1A4FCC', COLORS.secondary]}
            start={{ x: 0.8, y: 0 }}
            end={{ x: 0.2, y: 1 }}
            style={S.hero}
          >
            <TouchableOpacity style={[S.heroBackBtn, { top: insets.top + 8 }]} onPress={() => router.navigate('/(main)/learning/hub')}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={S.heroBody}>
              <View style={S.heroPills}>
                <View style={S.heroPill}>
                  <Text style={S.heroPillText}>{data.type === 'COURSE' ? 'دورة' : 'سلسلة فيديو'}</Text>
                </View>
                {data.category && (
                  <View style={[S.heroPill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                    <Text style={S.heroPillText}>{data.category}</Text>
                  </View>
                )}
              </View>
              <Text style={S.heroTitle}>{data.titleAr}</Text>
              <View style={S.heroStats}>
                {totalLectures > 0 && (
                  <View style={S.heroStat}>
                    <Ionicons name="play-circle-outline" size={13} color="rgba(255,255,255,0.75)" />
                    <Text style={S.heroStatTxt}>{totalLectures} محاضرة</Text>
                  </View>
                )}
                {totalMinutes > 0 && (
                  <View style={S.heroStat}>
                    <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.75)" />
                    <Text style={S.heroStatTxt}>{fmt(totalMinutes)}</Text>
                  </View>
                )}
                {sections.length > 1 && (
                  <View style={S.heroStat}>
                    <Ionicons name="layers-outline" size={13} color="rgba(255,255,255,0.75)" />
                    <Text style={S.heroStatTxt}>{sections.length} أقسام</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ── Progress strip ────────────────────────────────────────── */}
        {totalLectures > 0 && (
          <View style={S.progressStrip}>
            <View style={S.progressRow}>
              <Text style={S.progressLabel}>{completedIds.size}/{totalLectures} مكتملة</Text>
              <Text style={S.progressPct}>{progressPct}%</Text>
            </View>
            <View style={S.progressTrack}>
              <View style={[S.progressFill, { width: `${progressPct}%` as any }]} />
            </View>
          </View>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <View style={S.tabBar}>
          {(['curriculum', 'about'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[S.tabItem, activeTab === tab && S.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[S.tabLabel, activeTab === tab && S.tabLabelActive]}>
                {tab === 'curriculum' ? 'المنهج الدراسي' : 'عن الدورة'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Curriculum Tab ───────────────────────────────────────── */}
        {activeTab === 'curriculum' && (
          <View style={S.pad}>
            {sections.length === 0 ? (
              <View style={S.emptyBox}>
                <Ionicons name="book-outline" size={40} color={COLORS.textMuted} />
                <Text style={S.emptyText}>لا يوجد محتوى بعد</Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {sections.map((section: any, si: number) => (
                  <SectionAccordion
                    key={section.id}
                    section={section}
                    sectionIdx={si}
                    activeLectureId={activeLecture?.id ?? null}
                    onSelectLecture={handleSelectLecture}
                    completedIds={completedIds}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── About Tab ────────────────────────────────────────────── */}
        {activeTab === 'about' && (
          <View style={S.pad}>
            {data.description ? (
              <View style={S.aboutCard}>
                <Text style={S.aboutHeading}>وصف الدورة</Text>
                <Text style={S.aboutBody}>{data.description}</Text>
              </View>
            ) : null}
            {data.meta?.whatYouLearn?.length > 0 && (
              <View style={S.aboutCard}>
                <Text style={S.aboutHeading}>ماذا ستتعلم</Text>
                {data.meta.whatYouLearn.map((item: string, i: number) => (
                  <View key={i} style={S.bulletRow}>
                    <Text style={S.bulletCheck}>✓</Text>
                    <Text style={S.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {data.meta?.requirements?.length > 0 && (
              <View style={S.aboutCard}>
                <Text style={S.aboutHeading}>المتطلبات</Text>
                {data.meta.requirements.map((item: string, i: number) => (
                  <View key={i} style={S.bulletRow}>
                    <Text style={[S.bulletCheck, { color: COLORS.textMuted }]}>•</Text>
                    <Text style={S.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Action Bar ─────────────────────────────────────── */}
      {activeLecture && (
        <View style={S.actionBar}>
          {/* السابق — LEFT */}
          <TouchableOpacity
            style={[S.actionBtn, S.actionBtnPrev, !hasPrev && S.actionBtnDisabled]}
            onPress={handlePrev}
            disabled={!hasPrev}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={16} color={hasPrev ? COLORS.primary : COLORS.textMuted} />
            <Text style={[S.actionBtnTxt, { color: hasPrev ? COLORS.primary : COLORS.textMuted }]}>
              السابق
            </Text>
          </TouchableOpacity>

          {/* اكتملت — CENTER */}
          <TouchableOpacity
            style={[S.actionBtn, S.actionBtnDone, isCurrentDone && S.actionBtnDoneFill]}
            onPress={isCurrentDone ? undefined : handleMarkDone}
            activeOpacity={isCurrentDone ? 1 : 0.8}
          >
            <Ionicons
              name={isCurrentDone ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={isCurrentDone ? '#fff' : COLORS.teal}
            />
            <Text style={[S.actionBtnTxt, { color: isCurrentDone ? '#fff' : COLORS.teal }]}>
              {isCurrentDone ? 'مكتملة' : 'اكتملت'}
            </Text>
          </TouchableOpacity>

          {/* التالي — RIGHT */}
          <TouchableOpacity
            style={[S.actionBtn, S.actionBtnNext, !hasNext && S.actionBtnDisabled]}
            onPress={handleNext}
            disabled={!hasNext}
            activeOpacity={0.8}
          >
            <Text style={[S.actionBtnTxt, !hasNext && { color: COLORS.textMuted }]}>التالي</Text>
            <Ionicons name="chevron-forward" size={16} color={hasNext ? '#fff' : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },
  scroll: { flex: 1 },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  noVideoPlaceholder: { width: W, height: PLAYER_H, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', gap: 10 },
  noVideoText: { color: 'rgba(255,255,255,0.35)', fontFamily: FONT.regular, fontSize: FS.sm },

  hero: { height: 240, justifyContent: 'flex-end', paddingBottom: 28, paddingHorizontal: 20 },
  heroBackBtn: {
    position: 'absolute', left: 16,
    width: 38, height: 38, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroBody: { alignItems: 'flex-end' },
  heroPills: { flexDirection: 'row', gap: 8, marginBottom: 10, justifyContent: 'flex-end' },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  heroPillText: { color: '#fff', fontSize: FS.xs, fontFamily: FONT.bold },
  heroTitle: { color: '#fff', fontSize: FS.h3, fontFamily: FONT.black, textAlign: 'right', lineHeight: 32 },
  heroStats: { flexDirection: 'row', gap: 14, marginTop: 10, justifyContent: 'flex-end' },
  heroStat: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  heroStatTxt: { color: 'rgba(255,255,255,0.78)', fontSize: FS.xs, fontFamily: FONT.medium },

  playerWrap: { backgroundColor: '#000' },
  playerBackBtn: {
    position: 'absolute', left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },

  lecInfoPanel: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceBorder },
  lecInfoTop: { alignItems: 'flex-end' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6, alignSelf: 'flex-end' },
  doneBadgeText: { fontSize: FS.xs, fontFamily: FONT.bold, color: COLORS.teal },
  lecInfoTitle: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right', lineHeight: 22 },
  lecInfoDesc: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4, lineHeight: 20 },
  lecInfoMeta: { flexDirection: 'row', gap: 8, marginTop: 10, justifyContent: 'flex-end', alignItems: 'center' },
  metaChip: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: COLORS.canvas, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  metaChipText: { fontSize: FS.xs, fontFamily: FONT.semibold, color: COLORS.textMuted },
  metaChipFree: { backgroundColor: '#dcfce7' },
  metaChipFreeText: { fontSize: FS.xs, fontFamily: FONT.bold, color: '#16a34a' },
  lecCounter: { fontSize: FS.xs, fontFamily: FONT.bold, color: COLORS.textMuted },

  progressStrip: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceBorder },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: FS.xs, fontFamily: FONT.semibold, color: COLORS.textSecondary },
  progressPct: { fontSize: FS.xs, fontFamily: FONT.extrabold, color: COLORS.primary },
  progressTrack: { height: 7, backgroundColor: COLORS.surfaceBorder, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: COLORS.primary, borderRadius: 4 },

  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceBorder },
  tabItem: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2.5, borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: FS.sm, fontFamily: FONT.semibold, color: COLORS.textMuted },
  tabLabelActive: { color: COLORS.primary, fontFamily: FONT.bold },

  sCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, overflow: 'hidden' },
  sHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  sTitleArea: { flex: 1, alignItems: 'flex-end', gap: 4 },
  sTitle: { fontSize: FS.sm, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right' },
  sMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'flex-end' },
  sProgressPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.canvas, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.surfaceBorder,
  },
  sProgressPillDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  sProgressText: { fontSize: FS.micro, fontFamily: FONT.bold, color: COLORS.textMuted },
  sDurText: { fontSize: FS.micro, fontFamily: FONT.regular, color: COLORS.textMuted },
  sNumBadge: { width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  sNumBadgeDone: { backgroundColor: COLORS.teal },
  sNumText: { color: '#fff', fontSize: FS.xs, fontFamily: FONT.extrabold },

  lRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10, borderTopWidth: 1, borderTopColor: COLORS.surfaceBorder },
  lRowActive: { backgroundColor: `${COLORS.primary}08` },
  lRowDone: { backgroundColor: `${COLORS.teal}06` },
  lActiveMark: { position: 'absolute', right: 0, top: 8, bottom: 8, width: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  lInfo: { flex: 1 },
  lTitleRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  lName: { fontSize: FS.sm, fontFamily: FONT.semibold, color: COLORS.text, textAlign: 'right' },
  lNameActive: { color: COLORS.primary, fontFamily: FONT.bold },
  lNameDone: { color: COLORS.textMuted },
  lDur: { fontSize: FS.micro, color: COLORS.textMuted, textAlign: 'right', marginTop: 3, fontFamily: FONT.regular },
  freePill: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  freePillText: { fontSize: FS.micro, fontFamily: FONT.bold, color: '#16a34a' },
  lIcon: { width: 30, height: 30, borderRadius: RADIUS.sm, backgroundColor: COLORS.canvas, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  lIconActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}0F` },
  lIconDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  lIconNum: { color: COLORS.textMuted, fontSize: FS.micro, fontFamily: FONT.bold },

  aboutCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.surfaceBorder, marginBottom: 12 },
  aboutHeading: { fontSize: FS.sm, fontFamily: FONT.extrabold, color: COLORS.text, textAlign: 'right', marginBottom: 10 },
  aboutBody: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  bulletCheck: { color: COLORS.primary, fontFamily: FONT.extrabold, fontSize: FS.sm, width: 18, textAlign: 'center' },
  bulletText: { flex: 1, fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 21 },

  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.semibold },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11, borderRadius: RADIUS.md },
  actionBtnTxt: { fontFamily: FONT.bold, fontSize: FS.sm, color: '#fff' },
  actionBtnNext: { flex: 1.1, backgroundColor: COLORS.primary },
  actionBtnDone: { flex: 1.4, borderWidth: 1.5, borderColor: COLORS.teal, backgroundColor: COLORS.surface },
  actionBtnDoneFill: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  actionBtnPrev: { flex: 1, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, backgroundColor: COLORS.surface },
  actionBtnDisabled: { opacity: 0.32 },
})
