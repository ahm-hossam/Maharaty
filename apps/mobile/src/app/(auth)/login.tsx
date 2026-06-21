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
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '../../constants/theme'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
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
      {/* Gradient header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBg, { paddingTop: insets.top }]}
      >
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="bulb" size={40} color="#fff" />
          </View>
          <Text style={styles.logoTitle}>مهاراتي</Text>
          <Text style={styles.logoSubtitle}>منصة تطوير المهارات</Text>
        </View>
      </LinearGradient>

      {/* Dark form card */}
      <ScrollView
        style={styles.card}
        contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>تسجيل الدخول</Text>
        <Text style={styles.formSubtitle}>مرحباً بعودتك، ندار تطوير مهاراتك</Text>

        {/* Email */}
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

        {/* Password */}
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

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Login Button */}
        <TouchableOpacity onPress={handleLogin} activeOpacity={0.88} disabled={loading}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>أو</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
          <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },

  gradientBg: { minHeight: 280, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 0 },
  backBtn: {
    position: 'absolute', right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },

  logoSection: { alignItems: 'center', paddingBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  logoTitle: { fontSize: FS.h2, fontFamily: FONT.black, color: '#fff', marginBottom: 4 },
  logoSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.75)' },

  card: { flex: 1, backgroundColor: COLORS.canvasAlt, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24 },
  cardContent: { padding: 28 },

  formTitle: { fontSize: FS.h3, fontFamily: FONT.black, color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  formSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', marginBottom: 28 },

  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: FS.sm, fontFamily: FONT.semibold, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, paddingHorizontal: 14, gap: 10 },
  inputIcon: { padding: 2 },
  input: { flex: 1, height: 52, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },

  forgotBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  forgotText: { fontSize: FS.sm, color: COLORS.primary, fontFamily: FONT.semibold },

  errorWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'flex-end' },
  errorText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.error, textAlign: 'right' },

  loginBtn: { height: 56, borderRadius: RADIUS.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, ...SHADOW.md },
  loginBtnText: { fontSize: FS.lg, fontFamily: FONT.bold, color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.surfaceBorder },
  dividerText: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.medium },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted },
  registerLink: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.primary },
})
