import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Animated } from 'react-native'
import { WebView } from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useState, useRef, useEffect } from 'react'
import { COLORS, FONT, RADIUS, FS } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function InternalBrowserScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { url, name, accent } = useLocalSearchParams<{ url: string; name: string; accent: string }>()

  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const webViewRef = useRef<WebView>(null)

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current
  const progressOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (loading) {
      progressOpacity.setValue(1)
      progressAnim.setValue(0)
      Animated.timing(progressAnim, {
        toValue: 0.8,
        duration: 2000,
        useNativeDriver: false,
      }).start()
    } else {
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(progressOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        progressAnim.setValue(0)
        progressOpacity.setValue(1)
      })
    }
  }, [loading])

  const accentColor = accent || COLORS.primary

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View
        style={[S.header, { paddingTop: insets.top, height: 56 + insets.top }]}
      >
        <View style={S.headerRow}>
          {/* RIGHT: back button */}
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </TouchableOpacity>

          {/* CENTER: portal name */}
          <Text style={S.headerTitle} numberOfLines={1}>{name}</Text>

          {/* LEFT: close button */}
          <TouchableOpacity style={S.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <Animated.View style={[S.progressBar, { opacity: progressOpacity }]}>
          <Animated.View
            style={[
              S.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[accentColor, COLORS.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Animated.View>
      </View>

      {/* ── WebView ── */}
      <View style={S.webviewWrap}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={S.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
          onLoadStart={() => {
            setLoading(true)
            setHasError(false)
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setHasError(true)
          }}
        />

        {/* ── Error overlay ── */}
        {hasError && (
          <View style={S.errorOverlay}>
            <Ionicons name="wifi-outline" size={60} color={COLORS.textMuted} />
            <Text style={S.errorTitle}>تعذّر تحميل الصفحة</Text>
            <Text style={S.errorSub}>تحقق من اتصالك بالإنترنت</Text>
            <TouchableOpacity
              onPress={() => webViewRef.current?.reload()}
              style={S.retryBtn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[accentColor, COLORS.teal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={S.retryGrad}
              >
                <Text style={S.retryText}>إعادة المحاولة</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },

  header: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15,18,33,0.07)',
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.canvasAlt,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: FS.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.canvasAlt,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressBar: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    overflow: 'hidden',
  },

  webviewWrap: { flex: 1 },
  webview: { flex: 1, backgroundColor: COLORS.canvas },

  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontFamily: FONT.bold,
    fontSize: FS.lg,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorSub: {
    fontFamily: FONT.regular,
    fontSize: FS.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  retryGrad: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: FONT.bold,
    fontSize: FS.md,
    color: '#fff',
  },
})
