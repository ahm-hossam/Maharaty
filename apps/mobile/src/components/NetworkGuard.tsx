import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, FONT, RADIUS, FS } from '@/constants/theme'

interface NetworkGuardProps {
  onContinue: () => void
  onSkip: () => void
}

export default function NetworkGuard({ onContinue, onSkip }: NetworkGuardProps) {
  const insets = useSafeAreaInsets()
  const pulseAnim = useRef(new Animated.Value(1)).current
  const pulseOpacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim, pulseOpacity])

  return (
    <View style={styles.container}>
      {/* Background decoration orbs */}
      <LinearGradient
        colors={[COLORS.primary, 'transparent']}
        style={styles.orbTopRight}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[COLORS.secondary, 'transparent']}
        style={styles.orbBottomLeft}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
      />

      {/* Top 60% — Illustration area */}
      <View style={styles.illustrationArea}>
        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Icon container */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="wifi" size={80} color="#fff" />
        </LinearGradient>

        {/* Title */}
        <Text style={styles.title}>اتصال الإنترنت مطلوب</Text>

        {/* Stats chips row */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Ionicons name="flash" size={14} color={COLORS.textSecondary} />
            <Text style={styles.chipText}>4G/5G</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="cellular" size={14} color={COLORS.textSecondary} />
            <Text style={styles.chipText}>بيانات</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="wifi" size={14} color={COLORS.textSecondary} />
            <Text style={styles.chipText}>WiFi</Text>
          </View>
        </View>
      </View>

      {/* Info box — glass card */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          يرجى ضمان اتصال ثابت بالإنترنت عن طريق الواي فاي أو بيانات المحمول من أجل استخدام هذا التطبيق بشكل صحيح.
        </Text>
        <Ionicons
          name="information-circle"
          size={22}
          color={COLORS.primary}
          style={styles.infoIcon}
        />
      </View>

      {/* Bottom buttons */}
      <View style={[styles.buttonsContainer, { marginBottom: insets.bottom + 16 }]}>
        {/* Primary button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onContinue}
          style={styles.primaryButtonWrapper}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>التالي</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSkip}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>تخطي</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },

  // ── Background orbs ──────────────────────────────────────────
  orbTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: RADIUS.full,
    opacity: 0.08,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: RADIUS.full,
    opacity: 0.06,
  },

  // ── Illustration area ─────────────────────────────────────────
  illustrationArea: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.black,
    fontSize: FS.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: {
    fontFamily: FONT.semibold,
    fontSize: FS.xs,
    color: COLORS.textSecondary,
  },

  // ── Info box ──────────────────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(47, 108, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 108, 255, 0.22)',
    borderRadius: RADIUS.xl,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  infoIcon: {
    marginTop: 1,
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FS.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'right',
  },

  // ── Bottom buttons ────────────────────────────────────────────
  buttonsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonWrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  primaryButton: {
    height: 56,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FONT.black,
    fontSize: FS.lg,
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontFamily: FONT.semibold,
    fontSize: FS.md,
    color: COLORS.textMuted,
  },
})
