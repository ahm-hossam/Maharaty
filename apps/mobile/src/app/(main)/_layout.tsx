import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { COLORS, FONT, RADIUS } from '@/constants/theme'
import { DrawerProvider } from '../../context/DrawerContext'
import { useLanguage } from '../../i18n/LanguageContext'

function TabIcon({ name, focused, label, S }: { name: any; focused: boolean; label: string; S: ReturnType<typeof createStyles> }) {
  return (
    <View style={S.item}>
      <View style={[S.iconPill, focused && S.iconPillActive]}>
        <Ionicons
          name={name}
          size={22}
          color={focused ? COLORS.primary : 'rgba(15,18,33,0.30)'}
        />
      </View>
      <Text
        style={focused ? S.labelActive : S.labelInactive}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  )
}

const TAB_DEFS = [
  { name: 'search', iconOn: 'search', iconOff: 'search-outline', labelKey: 'search' },
  { name: 'community', iconOn: 'people', iconOff: 'people-outline', labelKey: 'community' },
  { name: 'jobs', iconOn: 'briefcase', iconOff: 'briefcase-outline', labelKey: 'jobs' },
  { name: 'home', iconOn: 'home', iconOff: 'home-outline', labelKey: 'home' },
] as const

function MainTabs() {
  const { t, isRTL } = useLanguage()
  const S = useMemo(() => createStyles(), [])

  // Tab order is RTL-authored (Home rightmost, Search leftmost). Native tab
  // bars don't auto-mirror since this app never enables I18nManager RTL, so
  // reverse the physical order ourselves for LTR.
  const tabs = isRTL ? TAB_DEFS : [...TAB_DEFS].reverse()

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: S.tabBar,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? tab.iconOn : tab.iconOff}
                focused={focused}
                label={t(`tabs.${tab.labelKey}`)}
                S={S}
              />
            ),
          }}
        />
      ))}
      {/* Hidden screens — not in tab bar */}
      <Tabs.Screen name="cv/builder"            options={{ href: null }} />
      <Tabs.Screen name="interview/simulator"   options={{ href: null }} />
      <Tabs.Screen name="quiz"                  options={{ href: null }} />
      <Tabs.Screen name="self-assessment"       options={{ href: null }} />
      <Tabs.Screen name="jobs/portals"          options={{ href: null }} />
      <Tabs.Screen name="jobs/InternalBrowser"  options={{ href: null }} />
      <Tabs.Screen name="learning"              options={{ href: null }} />
    </Tabs>
  )
}

export default function MainLayout() {
  return (
    <DrawerProvider>
      <MainTabs />
    </DrawerProvider>
  )
}

const createStyles = () => StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 90 : 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,18,33,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 24,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 8,
  },

  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },

  iconPill: {
    width: 52,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPillActive: {},

  labelActive: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  labelInactive: {
    fontSize: 11,
    color: 'rgba(15,18,33,0.32)',
    fontFamily: FONT.medium,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
})
