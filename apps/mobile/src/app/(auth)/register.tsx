import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '../../constants/theme'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../i18n/LanguageContext'
import { GOVERNORATES_AR, GOVERNORATES_EN } from '../../i18n/strings'

// ─── SelectField ─────────────────────────────────────────────────────────────

interface SelectOption { label: string; value: string }

function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder,
  isRTL,
  styles,
  pickerStyles,
}: {
  label: string
  value: string
  options: SelectOption[]
  onSelect: (v: string) => void
  placeholder: string
  isRTL: boolean
  styles: ReturnType<typeof createStyles>
  pickerStyles: ReturnType<typeof createPickerStyles>
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.inputWrap}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-down-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
          <Text style={[styles.input, { paddingVertical: 16, textAlign: isRTL ? 'right' : 'left', color: selected ? COLORS.text : COLORS.textMuted }]}>
            {selected ? selected.label : placeholder}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={pickerStyles.overlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setOpen(false)} activeOpacity={1} />
          <View style={pickerStyles.sheet}>
            <View style={pickerStyles.header}>
              <TouchableOpacity onPress={() => setOpen(false)} style={pickerStyles.closeBtn}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={pickerStyles.title}>{label}</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const isSelected = value === opt.value
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => { onSelect(opt.value); setOpen(false) }}
                    style={[pickerStyles.item, isSelected && pickerStyles.itemSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[pickerStyles.itemText, isSelected && pickerStyles.itemTextSelected]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const HIGH_SCHOOL_VALUE = 'ثانوي فأقل'

export default function RegisterScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { t, isRTL, language, setLanguage } = useLanguage()
  const styles = useMemo(() => createStyles(isRTL), [isRTL])
  const pickerStyles = useMemo(() => createPickerStyles(isRTL), [isRTL])

  const GOVERNORATES: SelectOption[] = GOVERNORATES_AR.map((ar, i) => ({
    value: ar,
    label: language === 'ar' ? ar : GOVERNORATES_EN[i],
  }))
  const GENDERS: SelectOption[] = [
    { value: 'ذكر', label: t('genders.male') },
    { value: 'أنثى', label: t('genders.female') },
  ]
  const EDUCATION_LEVELS: SelectOption[] = [
    { value: HIGH_SCHOOL_VALUE, label: t('education.highSchoolOrBelow') },
    { value: 'دبلوم', label: t('education.diploma') },
    { value: 'بكالوريوس / ليسانس', label: t('education.bachelor') },
    { value: 'ماجستير', label: t('education.master') },
    { value: 'دكتوراه', label: t('education.phd') },
  ]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [governorate, setGovernorate] = useState('')
  const [gender, setGender] = useState('')
  const [education, setEducation] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    const needsFieldOfStudy = education !== HIGH_SCHOOL_VALUE
    if (!name || !email || !password || !governorate || !gender || !education) return
    if (needsFieldOfStudy && !fieldOfStudy) return
    setLoading(true)
    setError('')
    try {
      const payload: Record<string, string> = { name, email, password, governorate, gender, education }
      if (fieldOfStudy) payload.fieldOfStudy = fieldOfStudy

      const { data } = await api.post('/auth/register', payload)
      const { accessToken, refreshToken, user } = data.data
      await useAuthStore.getState().setTokens(accessToken, refreshToken)
      useAuthStore.getState().setUser(user)
      router.replace('/(main)/home')
    } catch (e: any) {
      setError(e.response?.data?.message ?? t('common.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBg, { paddingTop: insets.top }]}
      >
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, { top: insets.top + 10 }]}
          onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        >
          <Text style={styles.langBtnText}>{language === 'ar' ? 'EN' : 'AR'}</Text>
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={38} color="#fff" />
          </View>
          <Text style={styles.logoTitle}>{t('register.heroTitle')}</Text>
          <Text style={styles.logoSubtitle}>{t('register.heroSubtitle')}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.card}
        contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>{t('register.formTitle')}</Text>
        <Text style={styles.formSubtitle}>{t('register.formSubtitle')}</Text>

        {/* ── Required fields ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('register.fullName')}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('register.fullNamePlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('register.email')}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('register.password')}</Text>
          <View style={styles.inputWrap}>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        <SelectField
          label={t('register.governorate')}
          value={governorate}
          options={GOVERNORATES}
          onSelect={setGovernorate}
          placeholder={t('register.chooseGovernorate')}
          isRTL={isRTL}
          styles={styles}
          pickerStyles={pickerStyles}
        />

        <SelectField
          label={t('register.gender')}
          value={gender}
          options={GENDERS}
          onSelect={setGender}
          placeholder={t('register.chooseGender')}
          isRTL={isRTL}
          styles={styles}
          pickerStyles={pickerStyles}
        />

        <SelectField
          label={t('register.education')}
          value={education}
          options={EDUCATION_LEVELS}
          onSelect={(v) => { setEducation(v); if (v === HIGH_SCHOOL_VALUE) setFieldOfStudy('') }}
          placeholder={t('register.chooseEducation')}
          isRTL={isRTL}
          styles={styles}
          pickerStyles={pickerStyles}
        />

        {education !== HIGH_SCHOOL_VALUE && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('register.fieldOfStudy')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="school-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fieldOfStudy}
                onChangeText={setFieldOfStudy}
                placeholder={t('register.fieldOfStudyPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>
        )}

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={handleRegister} activeOpacity={0.88} style={{ marginTop: 8 }} disabled={loading}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.registerBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>{t('register.submit')}</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.terms}>
          {t('register.termsPrefix')}{' '}
          <Text style={styles.termsLink}>{t('register.termsOfUse')}</Text>
          {' '}{t('register.and')}{' '}
          <Text style={styles.termsLink}>{t('register.privacyPolicy')}</Text>
        </Text>

        <View style={styles.loginRow}>
          {isRTL ? (
            <>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>{t('register.login')}</Text>
              </TouchableOpacity>
              <Text style={styles.loginText}>{t('register.alreadyHaveAccount')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.loginText}>{t('register.alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>{t('register.login')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const createStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const end: 'left' | 'right' = isRTL ? 'left' : 'right'

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },

    gradientBg: { minHeight: 260, justifyContent: 'flex-end', alignItems: 'center' },
    backBtn: {
      position: 'absolute', [start]: 20,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
      justifyContent: 'center', alignItems: 'center',
    } as any,
    langBtn: {
      position: 'absolute', [end]: 20,
      minWidth: 40, height: 40, paddingHorizontal: 12, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
      justifyContent: 'center', alignItems: 'center',
    } as any,
    langBtnText: { color: '#fff', fontFamily: FONT.bold, fontSize: FS.sm },

    logoSection: { alignItems: 'center', paddingBottom: 36 },
    logoCircle: { width: 76, height: 76, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    logoTitle: { fontSize: FS.h2, fontFamily: FONT.black, color: '#fff', marginBottom: 4 },
    logoSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.75)' },

    card: { flex: 1, backgroundColor: COLORS.canvasAlt, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24 },
    cardContent: { padding: 28 },

    formTitle: { fontSize: FS.h3, fontFamily: FONT.black, color: COLORS.text, textAlign: start, marginBottom: 6 },
    formSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: start, marginBottom: 24 },

    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: FS.sm, fontFamily: FONT.semibold, color: COLORS.textSecondary, textAlign: start, marginBottom: 8 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, paddingHorizontal: 14, gap: 10 },
    inputIcon: { padding: 2 },
    input: { flex: 1, height: 52, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },

    errorWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: isRTL ? 'flex-end' : 'flex-start' },
    errorText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.error, textAlign: start },

    registerBtn: { height: 56, borderRadius: RADIUS.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, ...SHADOW.md },
    registerBtnText: { fontSize: FS.lg, fontFamily: FONT.bold, color: '#fff' },

    terms: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 20 },
    termsLink: { color: COLORS.primary, fontFamily: FONT.semibold },

    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    loginText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted },
    loginLink: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.primary },
  })
}

const createPickerStyles = (isRTL: boolean) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '72%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FS.lg, fontFamily: FONT.bold, color: COLORS.text },
  item: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  itemSelected: { backgroundColor: COLORS.primary + '10' },
  itemText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },
  itemTextSelected: { fontFamily: FONT.bold, color: COLORS.primary },
})
