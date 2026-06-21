import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  FlatList,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useRef, useCallback, useEffect } from 'react'
import { COLORS, RADIUS, SHADOW, FONT, FS } from '@/constants/theme'
import { useCvStore } from '@/store/cvStore'
import { getCvSuggestions, CvSuggestion } from '@/services/mockAi'
import type { ExperienceItem, EducationItem, SkillItem } from '@/store/cvStore'
import { useActivity } from '../../../hooks/useActivity'

const STEPS = [
  { id: 0, label: 'معلومات شخصية', icon: 'person' },
  { id: 1, label: 'الخبرة العملية', icon: 'briefcase' },
  { id: 2, label: 'التعليم', icon: 'school' },
  { id: 3, label: 'المهارات', icon: 'star' },
  { id: 4, label: 'الشهادات', icon: 'ribbon' },
  { id: 5, label: 'اللغات', icon: 'globe' },
]

const SKILL_LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'] as const

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Neon Progress Line ───────────────────────────────────────

function NeonProgressLine({ step }: { step: number }) {
  const fillAnim = useRef(new Animated.Value((step + 1) / STEPS.length)).current

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [step])

  const fillWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  return (
    <View>
      {/* Glowing track */}
      <View style={S.progressTrack}>
        <Animated.View style={[S.progressFill, { width: fillWidth }]} />
      </View>
      {/* Minimal step dots */}
      <View style={S.stepDots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              S.stepDot,
              i < step && S.stepDotDone,
              i === step && S.stepDotActive,
            ]}
          />
        ))}
      </View>
      <Text style={S.stepLabel}>{STEPS[step].label}</Text>
    </View>
  )
}

// ─── Floating Label Input ─────────────────────────────────────

interface FieldInputProps {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'
  editable?: boolean
  multiline?: boolean
  numberOfLines?: number
}

function FloatingLabelInput({
  label, value, onChangeText, keyboardType = 'default',
  editable = true, multiline = false, numberOfLines,
}: FieldInputProps) {
  const [focused, setFocused] = useState(false)
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }, [focused, value])

  const labelTop  = anim.interpolate({ inputRange: [0, 1], outputRange: [multiline ? 22 : 20, 2] })
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] })

  return (
    <View style={[S.floatWrap, multiline && { minHeight: 110, paddingBottom: 14 }]}>
      <Animated.Text
        style={[S.floatLabel, {
          top: labelTop,
          fontSize: labelSize,
          color: focused ? COLORS.primary : COLORS.textMuted,
        }]}
      >
        {label}
      </Animated.Text>

      <TextInput
        style={[S.floatInput, multiline && S.floatInputMulti, !editable && { opacity: 0.35 }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlign="right"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="transparent"
        selectionColor={COLORS.primary}
      />

      {/* Glowing bottom line */}
      <View style={[S.floatLine, focused && S.floatLineActive]} />
      {focused && <View style={S.floatGlow} />}
    </View>
  )
}

// ─── AI Suggest Sheet ─────────────────────────────────────────

interface AiSheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (text: string) => void
  fieldType: 'bullet' | 'summary'
  role?: string
}

function AiSuggestSheet({ visible, onClose, onSelect, fieldType, role }: AiSheetProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<CvSuggestion[]>([])
  const slideAnim = useRef(new Animated.Value(500)).current

  const open = useCallback(async () => {
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true,
      damping: 22, stiffness: 200,
    }).start()
    setLoading(true)
    setSuggestions([])
    const result = await getCvSuggestions({ fieldType, currentText: '', role, jobTarget: role })
    setSuggestions(result)
    setLoading(false)
  }, [fieldType, role])

  const close = () => {
    Animated.timing(slideAnim, { toValue: 500, duration: 240, useNativeDriver: true }).start(() => onClose())
  }

  return (
    <Modal visible={visible} transparent animationType="none" onShow={open} onRequestClose={close}>
      <View style={S.sheetBg}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
      </View>
      <Animated.View style={[S.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={['rgba(248,249,255,0.99)', 'rgba(255,255,255,1.0)']}
          style={S.sheetGlass}
        >
          {/* Handle */}
          <View style={S.sheetHandle} />

          {/* Header */}
          <View style={S.sheetHeader}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.aiChip}
            >
              <Ionicons name="sparkles" size={13} color="#fff" />
              <Text style={S.aiChipText}>مساعد AI</Text>
            </LinearGradient>
            <Text style={S.sheetTitle}>
              {fieldType === 'summary' ? 'اقتراحات الملخص المهني' : 'اقتراحات إعادة صياغة الإنجاز'}
            </Text>
            <Text style={S.sheetSub}>اختر اقتراحاً وعدّله كما تشاء</Text>
          </View>

          {loading ? (
            <View style={S.sheetLoader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={S.sheetLoadingText}>يحلل AI نصّك...</Text>
            </View>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
              ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={S.suggestionCard}
                  activeOpacity={0.82}
                  onPress={() => { onSelect(item.text); close() }}
                >
                  <Text style={S.suggestionText}>{item.text}</Text>
                  <View style={S.suggestionAction}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.teal} />
                    <Text style={S.suggestionActionText}>استخدم هذا</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </LinearGradient>
      </Animated.View>
    </Modal>
  )
}

// ─── Shared sub-components ────────────────────────────────────

function StepSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

// ─── Step 0: Personal Info ────────────────────────────────────

function PersonalStep() {
  const { draft, updatePersonal } = useCvStore()
  const [aiVisible, setAiVisible] = useState(false)
  const p = draft.personal

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.stepContent}>
      <StepSection title="الاسم والمسمى الوظيفي">
        <FloatingLabelInput label="الاسم الكامل" value={p.fullName} onChangeText={(v) => updatePersonal({ fullName: v })} />
        <FloatingLabelInput label="المسمى الوظيفي" value={p.title} onChangeText={(v) => updatePersonal({ title: v })} />
      </StepSection>

      <StepSection title="التواصل">
        <FloatingLabelInput label="البريد الإلكتروني" value={p.email} onChangeText={(v) => updatePersonal({ email: v })} keyboardType="email-address" />
        <FloatingLabelInput label="رقم الهاتف" value={p.phone} onChangeText={(v) => updatePersonal({ phone: v })} keyboardType="phone-pad" />
        <FloatingLabelInput label="المدينة" value={p.city} onChangeText={(v) => updatePersonal({ city: v })} />
        <FloatingLabelInput label="LinkedIn" value={p.linkedIn} onChangeText={(v) => updatePersonal({ linkedIn: v })} />
      </StepSection>

      <StepSection title="الملخص المهني">
        <FloatingLabelInput
          label="اكتب ملخصك المهني..."
          value={p.summary}
          onChangeText={(v) => updatePersonal({ summary: v })}
          multiline
          numberOfLines={5}
        />
        <TouchableOpacity style={S.aiBtnWrap} onPress={() => setAiVisible(true)}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.aiBtnGrad}
          >
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={S.aiBtnText}>اقتراح AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </StepSection>

      <AiSuggestSheet
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
        onSelect={(text) => updatePersonal({ summary: text })}
        fieldType="summary"
        role={p.title}
      />
    </ScrollView>
  )
}

// ─── Step 1: Experience ───────────────────────────────────────

function ExperienceStep() {
  const { draft, addExperience, updateExperience, removeExperience } = useCvStore()
  const [aiVisible, setAiVisible] = useState(false)
  const [aiTargetId, setAiTargetId] = useState<string | null>(null)
  const [aiTargetIndex, setAiTargetIndex] = useState(0)

  const addNew = () => {
    const item: ExperienceItem = {
      id: uid(), company: '', role: '', startDate: '', endDate: '', isCurrent: false, bullets: [''],
    }
    addExperience(item)
  }

  const openAi = (id: string, bulletIndex: number) => {
    setAiTargetId(id); setAiTargetIndex(bulletIndex); setAiVisible(true)
  }

  const handleAiSelect = (text: string) => {
    if (!aiTargetId) return
    const exp = draft.experiences.find((e) => e.id === aiTargetId)
    if (!exp) return
    const newBullets = [...exp.bullets]
    newBullets[aiTargetIndex] = text
    updateExperience(aiTargetId, { bullets: newBullets })
  }

  const currentRole = aiTargetId ? draft.experiences.find((e) => e.id === aiTargetId)?.role : undefined

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.stepContent}>
      {draft.experiences.map((exp, expIdx) => (
        <View key={exp.id} style={S.glassCard}>
          <View style={S.cardHeader}>
            <TouchableOpacity style={S.deleteBtn} onPress={() => removeExperience(exp.id)}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
            <Text style={S.cardNum}>خبرة #{expIdx + 1}</Text>
          </View>

          <FloatingLabelInput label="المسمى الوظيفي" value={exp.role} onChangeText={(v) => updateExperience(exp.id, { role: v })} />
          <FloatingLabelInput label="اسم الشركة" value={exp.company} onChangeText={(v) => updateExperience(exp.id, { company: v })} />

          <View style={S.row2}>
            <View style={{ flex: 1 }}>
              <FloatingLabelInput label="تاريخ البداية" value={exp.startDate} onChangeText={(v) => updateExperience(exp.id, { startDate: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <FloatingLabelInput
                label={exp.isCurrent ? 'حتى الآن' : 'تاريخ النهاية'}
                value={exp.isCurrent ? 'حتى الآن' : exp.endDate}
                onChangeText={(v) => updateExperience(exp.id, { endDate: v })}
                editable={!exp.isCurrent}
              />
            </View>
          </View>

          <TouchableOpacity style={S.checkRow} onPress={() => updateExperience(exp.id, { isCurrent: !exp.isCurrent })}>
            <View style={[S.checkbox, exp.isCurrent && S.checkboxActive]}>
              {exp.isCurrent && <Ionicons name="checkmark" size={11} color="#fff" />}
            </View>
            <Text style={S.checkLabel}>أعمل هنا حالياً</Text>
          </TouchableOpacity>

          <Text style={S.fieldSubLabel}>الإنجازات والمهام</Text>
          {exp.bullets.map((bullet, bIdx) => (
            <View key={bIdx} style={S.bulletRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={S.bulletInput}
                  value={bullet}
                  onChangeText={(v) => {
                    const nb = [...exp.bullets]; nb[bIdx] = v
                    updateExperience(exp.id, { bullets: nb })
                  }}
                  placeholder={`إنجاز ${bIdx + 1}...`}
                  placeholderTextColor={COLORS.textMuted}
                  textAlign="right"
                  multiline
                  selectionColor={COLORS.primary}
                />
              </View>
              <TouchableOpacity style={S.bulletAiBtn} onPress={() => openAi(exp.id, bIdx)}>
                <Ionicons name="sparkles" size={15} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={S.addBulletBtn}
            onPress={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })}
          >
            <Ionicons name="add-circle-outline" size={17} color={COLORS.teal} />
            <Text style={S.addBulletText}>إضافة إنجاز</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={S.addCardBtn} onPress={addNew}>
        <Ionicons name="add-circle" size={20} color={COLORS.primary} />
        <Text style={S.addCardText}>إضافة خبرة عملية</Text>
      </TouchableOpacity>

      <AiSuggestSheet
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
        onSelect={handleAiSelect}
        fieldType="bullet"
        role={currentRole}
      />
    </ScrollView>
  )
}

// ─── Step 2: Education ────────────────────────────────────────

function EducationStep() {
  const { draft, addEducation, updateEducation, removeEducation } = useCvStore()

  const addNew = () => {
    const item: EducationItem = { id: uid(), institution: '', degree: '', field: '', graduationYear: '', gpa: '' }
    addEducation(item)
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.stepContent}>
      {draft.education.map((edu, i) => (
        <View key={edu.id} style={S.glassCard}>
          <View style={S.cardHeader}>
            <TouchableOpacity style={S.deleteBtn} onPress={() => removeEducation(edu.id)}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
            <Text style={S.cardNum}>مؤهل #{i + 1}</Text>
          </View>
          <FloatingLabelInput label="المؤسسة التعليمية" value={edu.institution} onChangeText={(v) => updateEducation(edu.id, { institution: v })} />
          <FloatingLabelInput label="الدرجة العلمية" value={edu.degree} onChangeText={(v) => updateEducation(edu.id, { degree: v })} />
          <FloatingLabelInput label="التخصص" value={edu.field} onChangeText={(v) => updateEducation(edu.id, { field: v })} />
          <View style={S.row2}>
            <View style={{ flex: 1 }}>
              <FloatingLabelInput label="سنة التخرج" value={edu.graduationYear} onChangeText={(v) => updateEducation(edu.id, { graduationYear: v })} keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FloatingLabelInput label="المعدل (اختياري)" value={edu.gpa} onChangeText={(v) => updateEducation(edu.id, { gpa: v })} />
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity style={S.addCardBtn} onPress={addNew}>
        <Ionicons name="add-circle" size={20} color={COLORS.primary} />
        <Text style={S.addCardText}>إضافة مؤهل دراسي</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

// ─── Step 3: Skills ───────────────────────────────────────────

function SkillsStep() {
  const { draft, addSkill, removeSkill } = useCvStore()
  const [name, setName] = useState('')
  const [level, setLevel] = useState<SkillItem['level']>('متوسط')

  const add = () => {
    if (!name.trim()) return
    addSkill({ id: uid(), name: name.trim(), level })
    setName('')
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.stepContent}>
      <StepSection title="أضف مهاراتك التقنية والناعمة">
        <FloatingLabelInput label="اسم المهارة" value={name} onChangeText={setName} />
        <Text style={S.fieldSubLabel}>مستوى الإتقان</Text>
        <View style={S.levelRow}>
          {SKILL_LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              style={[S.levelChip, level === l && S.levelChipActive]}
              onPress={() => setLevel(l)}
            >
              <Text style={[S.levelChipText, level === l && S.levelChipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={S.addItemBtn} onPress={add}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.addItemGrad}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={S.addItemText}>إضافة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </StepSection>

      <View style={S.tagsWrap}>
        {draft.skills.map((sk) => (
          <View key={sk.id} style={S.tag}>
            <Text style={S.tagText}>{sk.name}</Text>
            <Text style={S.tagLevel}>{sk.level}</Text>
            <TouchableOpacity onPress={() => removeSkill(sk.id)}>
              <Ionicons name="close-circle" size={15} color="rgba(15,18,33,0.35)" />
            </TouchableOpacity>
          </View>
        ))}
        {draft.skills.length === 0 && (
          <Text style={S.emptyHint}>لا توجد مهارات بعد — أضف أولى مهاراتك أعلاه</Text>
        )}
      </View>
    </ScrollView>
  )
}

// ─── Step 4: Certifications ───────────────────────────────────

function CertificationsStep() {
  const { draft, addCertification, removeCertification } = useCvStore()
  const [form, setForm] = useState({ name: '', issuer: '', date: '' })

  const add = () => {
    if (!form.name.trim()) return
    addCertification({ id: uid(), ...form })
    setForm({ name: '', issuer: '', date: '' })
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.stepContent}>
      <StepSection title="أضف شهاداتك ودوراتك">
        <FloatingLabelInput label="اسم الشهادة" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
        <FloatingLabelInput label="الجهة المانحة" value={form.issuer} onChangeText={(v) => setForm((f) => ({ ...f, issuer: v }))} />
        <FloatingLabelInput label="تاريخ الحصول" value={form.date} onChangeText={(v) => setForm((f) => ({ ...f, date: v }))} />
        <TouchableOpacity style={S.addItemBtn} onPress={add}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.addItemGrad}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={S.addItemText}>إضافة شهادة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </StepSection>

      {draft.certifications.map((cert) => (
        <View key={cert.id} style={S.certCard}>
          <View style={S.certAccent} />
          <View style={{ flex: 1 }}>
            <Text style={S.certName}>{cert.name}</Text>
            <Text style={S.certIssuer}>{cert.issuer} · {cert.date}</Text>
          </View>
          <TouchableOpacity onPress={() => removeCertification(cert.id)}>
            <Ionicons name="trash-outline" size={17} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )
}

// ─── Step 5: Languages ────────────────────────────────────────

const LANG_LEVELS = ['أساسي', 'جيد', 'جيد جداً', 'ممتاز', 'لغة أم']

function LanguagesStep() {
  const { draft, addLanguage, removeLanguage } = useCvStore()
  const [langName, setLangName] = useState('')
  const [langLevel, setLangLevel] = useState(LANG_LEVELS[3])

  const add = () => {
    if (!langName.trim()) return
    addLanguage({ id: uid(), name: langName.trim(), level: langLevel })
    setLangName('')
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.stepContent}>
      <StepSection title="اللغات التي تتحدثها">
        <FloatingLabelInput label="اللغة" value={langName} onChangeText={setLangName} />
        <Text style={S.fieldSubLabel}>مستوى الإجادة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={S.levelRow}>
            {LANG_LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[S.levelChip, langLevel === l && S.levelChipActive]}
                onPress={() => setLangLevel(l)}
              >
                <Text style={[S.levelChipText, langLevel === l && S.levelChipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={S.addItemBtn} onPress={add}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.addItemGrad}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={S.addItemText}>إضافة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </StepSection>

      <View style={S.tagsWrap}>
        {draft.languages.map((lang) => (
          <View key={lang.id} style={[S.tag, {
            backgroundColor: 'rgba(0,245,212,0.12)',
            borderColor: 'rgba(0,245,212,0.28)',
          }]}>
            <Text style={S.tagText}>{lang.name}</Text>
            <Text style={[S.tagLevel, { borderLeftColor: 'rgba(0,245,212,0.25)', color: COLORS.teal }]}>{lang.level}</Text>
            <TouchableOpacity onPress={() => removeLanguage(lang.id)}>
              <Ionicons name="close-circle" size={15} color="rgba(15,18,33,0.35)" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

// ─── CV Preview Panel ─────────────────────────────────────────

function CvPreview() {
  const { draft } = useCvStore()
  const p = draft.personal

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={S.previewDoc}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={S.previewHeader}
        >
          <Text style={S.previewName}>{p.fullName || 'اسمك الكامل'}</Text>
          <Text style={S.previewTitle}>{p.title || 'المسمى الوظيفي'}</Text>
          <View style={S.previewContact}>
            {p.email ? <Text style={S.previewContactItem}>{p.email}</Text> : null}
            {p.phone ? <Text style={S.previewContactItem}>{p.phone}</Text> : null}
            {p.city ? <Text style={S.previewContactItem}>{p.city}</Text> : null}
          </View>
        </LinearGradient>

        {p.summary ? (
          <PreviewSection title="الملخص المهني">
            <Text style={S.previewBody}>{p.summary}</Text>
          </PreviewSection>
        ) : null}

        {draft.experiences.length > 0 && (
          <PreviewSection title="الخبرة العملية">
            {draft.experiences.map((exp) => (
              <View key={exp.id} style={S.previewItem}>
                <Text style={S.previewItemTitle}>{exp.role || '—'}</Text>
                <Text style={S.previewItemSub}>{exp.company} · {exp.startDate} — {exp.isCurrent ? 'حتى الآن' : exp.endDate}</Text>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <Text key={i} style={S.previewBullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </PreviewSection>
        )}

        {draft.education.length > 0 && (
          <PreviewSection title="التعليم">
            {draft.education.map((edu) => (
              <View key={edu.id} style={S.previewItem}>
                <Text style={S.previewItemTitle}>{edu.degree} — {edu.field}</Text>
                <Text style={S.previewItemSub}>{edu.institution} · {edu.graduationYear}</Text>
              </View>
            ))}
          </PreviewSection>
        )}

        {draft.skills.length > 0 && (
          <PreviewSection title="المهارات">
            <View style={S.previewSkillsWrap}>
              {draft.skills.map((sk) => (
                <View key={sk.id} style={S.previewSkillBadge}>
                  <Text style={S.previewSkillText}>{sk.name}</Text>
                </View>
              ))}
            </View>
          </PreviewSection>
        )}

        {draft.languages.length > 0 && (
          <PreviewSection title="اللغات">
            {draft.languages.map((lang) => (
              <Text key={lang.id} style={S.previewBody}>{lang.name} — {lang.level}</Text>
            ))}
          </PreviewSection>
        )}

        {draft.certifications.length > 0 && (
          <PreviewSection title="الشهادات والدورات">
            {draft.certifications.map((cert) => (
              <View key={cert.id} style={S.previewItem}>
                <Text style={S.previewItemTitle}>{cert.name}</Text>
                <Text style={S.previewItemSub}>{cert.issuer} · {cert.date}</Text>
              </View>
            ))}
          </PreviewSection>
        )}
      </View>
    </ScrollView>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={S.previewSection}>
      <View style={S.previewSectionHeader}>
        <Text style={S.previewSectionTitle}>{title}</Text>
        <View style={S.previewSectionLine} />
      </View>
      {children}
    </View>
  )
}

// ─── Format Selection Screen ──────────────────────────────────

type CvFormatType = 'زمنية' | 'وظيفية' | 'مختلطة'

const FORMAT_OPTIONS: Array<{
  value: CvFormatType
  icon: string
  title: string
  desc: string
}> = [
  {
    value: 'زمنية',
    icon: 'time-outline',
    title: 'زمنية',
    desc: 'مرتبة حسب الترتيب الزمني — الأنسب للمسارات المهنية المتواصلة',
  },
  {
    value: 'وظيفية',
    icon: 'briefcase-outline',
    title: 'وظيفية',
    desc: 'مرتبة حسب الكفاءات والمهارات — للتحولات المهنية',
  },
  {
    value: 'مختلطة',
    icon: 'git-merge-outline',
    title: 'مختلطة',
    desc: 'تجمع بين الزمني والوظيفي — الأفضل لمعظم المرشحين (موصى)',
  },
]

interface FormatSelectionScreenProps {
  cvFormat: CvFormatType
  setCvFormat: (f: CvFormatType) => void
  onContinue: () => void
}

function FormatSelectionScreen({ cvFormat, setCvFormat, onContinue }: FormatSelectionScreenProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [playingAudio, setPlayingAudio] = useState(false)

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={S.headerTitle}>منشئ السيرة الذاتية</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[S.stepContent, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Title block */}
        <Text style={S.fmtHeading}>اختر تنسيق السيرة الذاتية</Text>
        <Text style={S.fmtSubtitle}>اختر النمط الأنسب لمسارك المهني</Text>

        {/* Format option cards */}
        {FORMAT_OPTIONS.map((opt) => {
          const selected = cvFormat === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.82}
              style={[S.fmtCard, selected && S.fmtCardSelected]}
              onPress={() => setCvFormat(opt.value)}
            >
              <View style={S.fmtCardInner}>
                {/* Radio circle (right side in RTL) */}
                <View style={[S.fmtRadio, selected && S.fmtRadioSelected]}>
                  {selected && <View style={S.fmtRadioDot} />}
                </View>

                {/* Text block (center) */}
                <View style={{ flex: 1, marginHorizontal: 14 }}>
                  <Text style={S.fmtTitle}>{opt.title}</Text>
                  <Text style={S.fmtDesc}>{opt.desc}</Text>
                </View>

                {/* Icon (left side in RTL) */}
                <Ionicons
                  name={opt.icon as any}
                  size={28}
                  color={selected ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            </TouchableOpacity>
          )
        })}

        {/* Mock audio card */}
        <View style={S.audioCard}>
          <View style={S.audioRow}>
            <Ionicons name="volume-medium-outline" size={22} color={COLORS.teal} />
            <Text style={S.audioLabel}>استمع للشرح</Text>
            <TouchableOpacity
              style={S.audioBtn}
              activeOpacity={0.75}
              onPress={() => setPlayingAudio((p) => !p)}
            >
              <Ionicons
                name={playingAudio ? 'pause' : 'play'}
                size={18}
                color={COLORS.teal}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={S.fmtNextBtn}
          onPress={onContinue}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={S.fmtNextGrad}
          >
            <Text style={S.fmtNextText}>التالي — ابدأ بناء سيرتك</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

// ─── Main Builder Screen ──────────────────────────────────────

export default function CvBuilderScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { currentStep, setStep } = useCvStore()
  const { trackActivity } = useActivity()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [formatSelected, setFormatSelected] = useState(false)
  const [cvFormat, setCvFormat] = useState<CvFormatType>('زمنية')

  useEffect(() => {
    trackActivity('BUILD_CV')
  }, [])

  // Must be declared before any conditional return (Rules of Hooks)
  const scaleNext = useRef(new Animated.Value(1)).current
  const pressNext = () => Animated.spring(scaleNext, { toValue: 0.96, useNativeDriver: true, speed: 60 }).start()
  const releaseNext = () => Animated.spring(scaleNext, { toValue: 1, useNativeDriver: true, speed: 40 }).start()

  if (!formatSelected) {
    return (
      <FormatSelectionScreen
        cvFormat={cvFormat}
        setCvFormat={setCvFormat}
        onContinue={() => setFormatSelected(true)}
      />
    )
  }

  const StepComponents = [PersonalStep, ExperienceStep, EducationStep, SkillsStep, CertificationsStep, LanguagesStep]
  const ActiveStep = StepComponents[currentStep]

  const goNext = () => { if (currentStep < 5) setStep((currentStep + 1) as any) }
  const goPrev = () => { if (currentStep > 0) setStep((currentStep - 1) as any) }

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={S.headerTitle}>منشئ السيرة الذاتية</Text>
        </View>
        <TouchableOpacity onPress={() => setPreviewVisible(true)} style={S.previewBtn}>
          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
          <Text style={S.previewBtnText}>معاينة</Text>
        </TouchableOpacity>
      </View>

      {/* ── Neon progress line ── */}
      <NeonProgressLine step={currentStep} />

      {/* ── Active step ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={120}
      >
        <ActiveStep />
      </KeyboardAvoidingView>

      {/* ── Footer nav ── */}
      <View style={[S.footer, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity
          style={[S.navBtn, currentStep === 0 && { opacity: 0.25 }]}
          onPress={goPrev}
          disabled={currentStep === 0}
        >
          <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          <Text style={S.navBtnText}>السابق</Text>
        </TouchableOpacity>

        <Text style={S.stepCounter}>{currentStep + 1} / {STEPS.length}</Text>

        {currentStep < 5 ? (
          <Animated.View style={{ transform: [{ scale: scaleNext }] }}>
            <TouchableOpacity
              style={S.navBtnPrimary}
              onPress={goNext}
              onPressIn={pressNext}
              onPressOut={releaseNext}
              activeOpacity={1}
            >
              <Text style={S.navBtnPrimaryText}>التالي</Text>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={S.navBtnPrimary} onPress={() => setPreviewVisible(true)}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={S.navBtnPrimaryText}>معاينة نهائية</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Preview modal ── */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={[S.previewModal, { paddingTop: insets.top }]}>
          <View style={S.previewModalHeader}>
            <TouchableOpacity onPress={() => setPreviewVisible(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={S.previewModalTitle}>معاينة السيرة الذاتية</Text>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <CvPreview />
        </View>
      </Modal>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 18, gap: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FS.xl, fontWeight: '800', color: COLORS.text, textAlign: 'right', fontFamily: FONT.extrabold },
  previewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.primary + '55',
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(47,108,255,0.08)',
  },
  previewBtnText: { fontSize: FS.sm, color: COLORS.primary, fontWeight: '700', fontFamily: FONT.bold },

  // Neon progress line
  progressTrack: {
    height: 3, backgroundColor: 'rgba(15,18,33,0.08)', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8,
  },
  stepDots: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, paddingTop: 18, paddingBottom: 4,
  },
  stepDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(15,18,33,0.12)',
  },
  stepDotDone: { backgroundColor: COLORS.teal, width: 7 },
  stepDotActive: { backgroundColor: COLORS.primary, width: 28 },
  stepLabel: {
    textAlign: 'center', color: COLORS.textMuted,
    fontSize: FS.xs, fontWeight: '600', paddingBottom: 14,
    letterSpacing: 0.5, fontFamily: FONT.semibold,
  },

  // Floating Label Input
  floatWrap: { paddingTop: 26, marginBottom: 22, position: 'relative' },
  floatLabel: { position: 'absolute', right: 0, fontWeight: '600', letterSpacing: 0.2, fontFamily: FONT.semibold },
  floatInput: {
    fontSize: FS.lg, color: COLORS.text, textAlign: 'right',
    paddingVertical: 6, paddingHorizontal: 0,
    backgroundColor: 'transparent', fontFamily: FONT.regular,
  },
  floatInputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 4 },
  floatLine: {
    height: 1.5, backgroundColor: 'rgba(15,18,33,0.10)', marginTop: 4,
  },
  floatLineActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 6,
  },
  floatGlow: {
    height: 8, marginHorizontal: 0,
    backgroundColor: 'rgba(47,108,255,0.08)',
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },

  // AI Button
  aiBtnWrap: { borderRadius: RADIUS.full, overflow: 'hidden', alignSelf: 'flex-end', marginTop: 8 },
  aiBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10 },
  aiBtnText: { fontSize: FS.sm, color: '#fff', fontWeight: '700', fontFamily: FONT.bold },

  // Glass card
  glassCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xxl, padding: 24, marginBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  cardNum: { fontSize: FS.sm, color: COLORS.primary, fontWeight: '700', letterSpacing: 0.5, fontFamily: FONT.bold },
  deleteBtn: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,59,107,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,59,107,0.22)',
    justifyContent: 'center', alignItems: 'center',
  },

  row2: { flexDirection: 'row', gap: 16 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, justifyContent: 'flex-end' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.primary },
  checkLabel: { fontSize: FS.sm, color: COLORS.textSecondary, fontFamily: FONT.regular },

  fieldSubLabel: {
    fontSize: FS.xs, color: COLORS.textMuted,
    textAlign: 'right', marginBottom: 12,
    fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: FONT.semibold,
  },

  bulletRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)', paddingBottom: 8,
  },
  bulletInput: {
    fontSize: FS.md, color: COLORS.text, textAlign: 'right',
    paddingVertical: 4, backgroundColor: 'transparent', fontFamily: FONT.regular,
  },
  bulletAiBtn: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(47,108,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(47,108,255,0.28)',
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  addBulletBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'flex-end', marginTop: 8,
  },
  addBulletText: { fontSize: FS.sm, color: COLORS.teal, fontWeight: '600', fontFamily: FONT.semibold },

  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(47,108,255,0.4)',
    borderStyle: 'dashed', borderRadius: RADIUS.xxl,
    paddingVertical: 22, marginTop: 4,
    backgroundColor: 'rgba(47,108,255,0.06)',
  },
  addCardText: { fontSize: FS.md, color: COLORS.primary, fontWeight: '700', fontFamily: FONT.bold },

  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: FS.lg, fontWeight: '800', color: COLORS.text,
    textAlign: 'right', marginBottom: 20, fontFamily: FONT.extrabold,
  },

  stepContent: { padding: 24, paddingBottom: 48 },

  levelRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  levelChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(15,18,33,0.12)',
    backgroundColor: 'rgba(15,18,33,0.04)',
  },
  levelChipActive: { backgroundColor: 'rgba(47,108,255,0.22)', borderColor: COLORS.primary },
  levelChipText: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
  levelChipTextActive: { color: COLORS.text, fontFamily: FONT.semibold },

  addItemBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  addItemGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 16,
    borderRadius: RADIUS.full,
  },
  addItemText: { fontSize: FS.md, color: '#fff', fontWeight: '800', fontFamily: FONT.extrabold },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(47,108,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(47,108,255,0.3)',
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  tagText: { fontSize: FS.sm, color: COLORS.text, fontWeight: '600', fontFamily: FONT.semibold },
  tagLevel: {
    fontSize: FS.xs, color: COLORS.textMuted,
    borderLeftWidth: 1, borderLeftColor: 'rgba(15,18,33,0.15)', paddingLeft: 8, fontFamily: FONT.regular,
  },
  emptyHint: { fontSize: FS.sm, color: COLORS.textMuted, textAlign: 'center', flex: 1, paddingVertical: 12, fontFamily: FONT.regular },

  certCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xl, padding: 16, marginBottom: 12, gap: 14, overflow: 'hidden',
  },
  certAccent: { width: 3, height: '100%', borderRadius: 2, backgroundColor: COLORS.teal, position: 'absolute', right: 0, top: 0, bottom: 0 },
  certName: { fontSize: FS.md, color: COLORS.text, fontWeight: '700', textAlign: 'right', marginBottom: 3, fontFamily: FONT.bold },
  certIssuer: { fontSize: FS.sm, color: COLORS.textMuted, textAlign: 'right', fontFamily: FONT.regular },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 18,
    backgroundColor: COLORS.canvasAlt,
    borderTopWidth: 1, borderTopColor: 'rgba(15,18,33,0.07)',
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  navBtnText: { fontSize: FS.md, color: COLORS.primary, fontWeight: '600', fontFamily: FONT.semibold },
  navBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16,
  },
  navBtnPrimaryText: { fontSize: FS.md, color: '#fff', fontWeight: '800', fontFamily: FONT.extrabold },
  stepCounter: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },

  // AI Sheet
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl,
    overflow: 'hidden', maxHeight: '75%',
  },
  sheetGlass: { flex: 1, paddingTop: 14 },
  sheetHandle: {
    width: 38, height: 4, backgroundColor: 'rgba(15,18,33,0.18)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetHeader: { paddingHorizontal: 24, marginBottom: 20, alignItems: 'flex-end' },
  aiChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12,
  },
  aiChipText: { fontSize: FS.sm, color: '#fff', fontWeight: '800', fontFamily: FONT.extrabold },
  sheetTitle: { fontSize: FS.xl, fontWeight: '900', color: COLORS.text, textAlign: 'right', marginBottom: 4, fontFamily: FONT.black },
  sheetSub: { fontSize: FS.sm, color: COLORS.textMuted, textAlign: 'right', fontFamily: FONT.regular },
  sheetLoader: { alignItems: 'center', paddingVertical: 56, gap: 16 },
  sheetLoadingText: { fontSize: FS.md, color: COLORS.textMuted, fontFamily: FONT.regular },

  suggestionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xl, padding: 18,
  },
  suggestionText: {
    fontSize: FS.md, color: COLORS.text, lineHeight: 23,
    textAlign: 'right', marginBottom: 14, fontFamily: FONT.regular,
  },
  suggestionAction: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end',
  },
  suggestionActionText: { fontSize: FS.sm, color: COLORS.teal, fontWeight: '700', fontFamily: FONT.bold },

  // Preview modal
  previewModal: { flex: 1, backgroundColor: '#F8F9FA' },
  previewModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  previewModalTitle: { fontSize: FS.lg, fontWeight: '700', color: '#1F2937', fontFamily: FONT.bold },

  previewDoc: { margin: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', ...SHADOW.lg },
  previewHeader: { padding: 24, alignItems: 'flex-end' },
  previewName: { fontSize: FS.h3, fontWeight: '800', color: '#fff', textAlign: 'right', fontFamily: FONT.extrabold },
  previewTitle: { fontSize: FS.md, color: 'rgba(255,255,255,0.82)', textAlign: 'right', marginTop: 4, fontFamily: FONT.regular },
  previewContact: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, justifyContent: 'flex-end' },
  previewContactItem: { fontSize: FS.sm, color: 'rgba(255,255,255,0.75)', fontFamily: FONT.regular },

  previewSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  previewSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 12, justifyContent: 'flex-end',
  },
  previewSectionTitle: { fontSize: FS.sm, fontWeight: '800', color: '#1F2937', textAlign: 'right', fontFamily: FONT.extrabold },
  previewSectionLine: { flex: 1, height: 2, backgroundColor: COLORS.primary },

  previewItem: { marginBottom: 12 },
  previewItemTitle: { fontSize: FS.md, fontWeight: '700', color: '#1F2937', textAlign: 'right', fontFamily: FONT.bold },
  previewItemSub: { fontSize: FS.sm, color: '#6B7280', textAlign: 'right', marginTop: 2, fontFamily: FONT.regular },
  previewBullet: { fontSize: FS.sm, color: '#374151', textAlign: 'right', lineHeight: 20, marginTop: 4, paddingRight: 8, fontFamily: FONT.regular },
  previewBody: { fontSize: FS.sm, color: '#374151', textAlign: 'right', lineHeight: 20, fontFamily: FONT.regular },

  previewSkillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  previewSkillBadge: { backgroundColor: '#EEF2FF', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
  previewSkillText: { fontSize: FS.sm, color: '#4F46E5', fontWeight: '600', fontFamily: FONT.semibold },

  // Format Selection Screen
  fmtHeading: {
    fontSize: FS.h2, color: COLORS.text, fontFamily: FONT.black,
    textAlign: 'right', marginBottom: 8,
  },
  fmtSubtitle: {
    fontSize: FS.md, color: COLORS.textMuted, fontFamily: FONT.regular,
    textAlign: 'right', marginBottom: 28,
  },
  fmtCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xxl, padding: 18, marginBottom: 16,
  },
  fmtCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(47,108,255,0.10)',
  },
  fmtCardInner: {
    flexDirection: 'row-reverse', alignItems: 'center',
  },
  fmtRadio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.textMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  fmtRadioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  fmtRadioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#fff',
  },
  fmtTitle: {
    fontSize: FS.lg, color: COLORS.text, fontFamily: FONT.bold,
    textAlign: 'right', marginBottom: 4,
  },
  fmtDesc: {
    fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.regular,
    textAlign: 'right', lineHeight: 20,
  },
  fmtIcon: {},
  audioCard: {
    backgroundColor: 'rgba(0,245,212,0.06)',
    borderWidth: 1, borderColor: 'rgba(0,245,212,0.2)',
    borderRadius: RADIUS.xl, padding: 14, marginTop: 8, marginBottom: 32,
  },
  audioRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
  },
  audioLabel: {
    flex: 1, fontSize: FS.md, color: COLORS.teal,
    fontFamily: FONT.semibold, textAlign: 'right',
  },
  audioBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,245,212,0.12)',
    borderWidth: 1, borderColor: 'rgba(0,245,212,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  fmtNextBtn: {
    borderRadius: RADIUS.xl, overflow: 'hidden',
  },
  fmtNextGrad: {
    height: 56, borderRadius: RADIUS.xl,
    justifyContent: 'center', alignItems: 'center',
  },
  fmtNextText: {
    fontSize: FS.md, color: '#fff', fontFamily: FONT.extrabold, fontWeight: '800',
  },
})
