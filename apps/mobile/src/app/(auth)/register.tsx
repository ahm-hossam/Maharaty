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
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '../../constants/theme'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

// ─── Data ────────────────────────────────────────────────────────────────────

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة',
  'الشرقية', 'القليوبية', 'الغربية', 'المنوفية', 'كفر الشيخ',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء',
  'جنوب سيناء', 'مطروح', 'الوادي الجديد', 'البحر الأحمر',
  'أسوان', 'قنا', 'الأقصر', 'سوهاج', 'أسيوط', 'المنيا',
  'بني سويف', 'الفيوم',
].map((v) => ({ label: v, value: v }))

const GENDERS = [
  { label: 'ذكر', value: 'ذكر' },
  { label: 'أنثى', value: 'أنثى' },
]

const EDUCATION_LEVELS = [
  { label: 'ثانوي فأقل', value: 'ثانوي فأقل' },
  { label: 'دبلوم', value: 'دبلوم' },
  { label: 'بكالوريوس / ليسانس', value: 'بكالوريوس / ليسانس' },
  { label: 'ماجستير', value: 'ماجستير' },
  { label: 'دكتوراه', value: 'دكتوراه' },
]

// ─── SelectField ─────────────────────────────────────────────────────────────

interface SelectOption { label: string; value: string }

function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder,
}: {
  label: string
  value: string
  options: SelectOption[]
  onSelect: (v: string) => void
  placeholder: string
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
          <Text style={[styles.input, { paddingVertical: 16, textAlign: 'right', color: selected ? COLORS.text : COLORS.textMuted }]}>
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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
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
    const needsFieldOfStudy = education !== 'ثانوي فأقل'
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
      setError(e.response?.data?.message ?? 'حدث خطأ، حاول مجدداً')
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
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={38} color="#fff" />
          </View>
          <Text style={styles.logoTitle}>إنشاء حساب</Text>
          <Text style={styles.logoSubtitle}>انضم إلى مجتمع مهاراتي</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.card}
        contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>حساب جديد</Text>
        <Text style={styles.formSubtitle}>أنشئ حسابك وابدأ رحلتك المهنية</Text>

        {/* ── Required fields ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>الاسم الكامل</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="أحمد محمد"
              placeholderTextColor={COLORS.textMuted}
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
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
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>كلمة المرور</Text>
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
              textAlign="right"
            />
          </View>
        </View>

        <SelectField
          label="المحافظة"
          value={governorate}
          options={GOVERNORATES}
          onSelect={setGovernorate}
          placeholder="اختر محافظتك"
        />

        <SelectField
          label="الجنس"
          value={gender}
          options={GENDERS}
          onSelect={setGender}
          placeholder="اختر الجنس"
        />

        <SelectField
          label="المؤهل الدراسي"
          value={education}
          options={EDUCATION_LEVELS}
          onSelect={(v) => { setEducation(v); if (v === 'ثانوي فأقل') setFieldOfStudy('') }}
          placeholder="اختر مؤهلك الدراسي"
        />

        {education !== 'ثانوي فأقل' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>مجال الدراسة</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="school-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fieldOfStudy}
                onChangeText={setFieldOfStudy}
                placeholder="مثال: هندسة، طب، تجارة..."
                placeholderTextColor={COLORS.textMuted}
                textAlign="right"
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
                <Text style={styles.registerBtnText}>إنشاء الحساب</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.terms}>
          بالتسجيل، أنت توافق على{' '}
          <Text style={styles.termsLink}>شروط الاستخدام</Text>
          {' '}و{' '}
          <Text style={styles.termsLink}>سياسة الخصوصية</Text>
        </Text>

        <View style={styles.loginRow}>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>تسجيل الدخول</Text>
          </TouchableOpacity>
          <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },

  gradientBg: { minHeight: 260, justifyContent: 'flex-end', alignItems: 'center' },
  backBtn: {
    position: 'absolute', right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },

  logoSection: { alignItems: 'center', paddingBottom: 36 },
  logoCircle: { width: 76, height: 76, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoTitle: { fontSize: FS.h2, fontFamily: FONT.black, color: '#fff', marginBottom: 4 },
  logoSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.75)' },

  card: { flex: 1, backgroundColor: COLORS.canvasAlt, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24 },
  cardContent: { padding: 28 },

  formTitle: { fontSize: FS.h3, fontFamily: FONT.black, color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  formSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', marginBottom: 24 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: FS.sm, fontFamily: FONT.semibold, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, paddingHorizontal: 14, gap: 10 },
  inputIcon: { padding: 2 },
  input: { flex: 1, height: 52, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },

  errorWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'flex-end' },
  errorText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.error, textAlign: 'right' },

  registerBtn: { height: 56, borderRadius: RADIUS.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, ...SHADOW.md },
  registerBtnText: { fontSize: FS.lg, fontFamily: FONT.bold, color: '#fff' },

  terms: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontFamily: FONT.semibold },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted },
  loginLink: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.primary },
})

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '72%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  itemSelected: { backgroundColor: COLORS.primary + '10' },
  itemText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },
  itemTextSelected: { fontFamily: FONT.bold, color: COLORS.primary },
})
