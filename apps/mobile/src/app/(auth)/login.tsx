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
import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '../../constants/theme'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { t, isRTL, language, setLanguage } = useLanguage()
  const styles = useMemo(() => createStyles(isRTL), [isRTL])
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
      {/* Gradient header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
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
            <Ionicons name="bulb" size={40} color="#fff" />
          </View>
          <Text style={styles.logoTitle}>{t('common.appName')}</Text>
          <Text style={styles.logoSubtitle}>{t('common.appTagline')}</Text>
        </View>
      </LinearGradient>

      {/* Dark form card */}
      <ScrollView
        style={styles.card}
        contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formTitle}>{t('login.title')}</Text>
        <Text style={styles.formSubtitle}>{t('login.subtitle')}</Text>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('login.email')}</Text>
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

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('login.password')}</Text>
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

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
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
                <Text style={styles.loginBtnText}>{t('login.submit')}</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('common.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          {isRTL ? (
            <>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>{t('login.createAccount')}</Text>
              </TouchableOpacity>
              <Text style={styles.registerText}>{t('login.noAccount')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.registerText}>{t('login.noAccount')}</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>{t('login.createAccount')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity onPress={() => router.replace('/(main)/home')} style={styles.guestBtn} activeOpacity={0.7}>
          <Text style={styles.guestBtnText}>{t('register.continueAsGuest')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const createStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const end: 'left' | 'right' = isRTL ? 'left' : 'right'

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },

    gradientBg: { minHeight: 280, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 0 },
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

    logoSection: { alignItems: 'center', paddingBottom: 40 },
    logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    logoTitle: { fontSize: FS.h2, fontFamily: FONT.black, color: '#fff', marginBottom: 4 },
    logoSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.75)' },

    card: { flex: 1, backgroundColor: COLORS.canvasAlt, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24 },
    cardContent: { padding: 28 },

    formTitle: { fontSize: FS.h3, fontFamily: FONT.black, color: COLORS.text, textAlign: start, marginBottom: 6 },
    formSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: start, marginBottom: 28 },

    inputGroup: { marginBottom: 18 },
    inputLabel: { fontSize: FS.sm, fontFamily: FONT.semibold, color: COLORS.textSecondary, textAlign: start, marginBottom: 8 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, paddingHorizontal: 14, gap: 10 },
    inputIcon: { padding: 2 },
    input: { flex: 1, height: 52, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },

    forgotBtn: { alignSelf: isRTL ? 'flex-end' : 'flex-start', marginBottom: 16 },
    forgotText: { fontSize: FS.sm, color: COLORS.primary, fontFamily: FONT.semibold },

    errorWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: isRTL ? 'flex-end' : 'flex-start' },
    errorText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.error, textAlign: start },

    loginBtn: { height: 56, borderRadius: RADIUS.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, ...SHADOW.md },
    loginBtnText: { fontSize: FS.lg, fontFamily: FONT.bold, color: '#fff' },

    divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.surfaceBorder },
    dividerText: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.medium },

    registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted },
    registerLink: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.primary },

    guestBtn: { alignSelf: 'center', marginTop: 20, padding: 8 },
    guestBtnText: { fontSize: FS.md, fontFamily: FONT.semibold, color: COLORS.textMuted, textDecorationLine: 'underline' },
  })
}
