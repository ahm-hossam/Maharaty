import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONT, RADIUS } from '@/constants/theme'

function TabIcon({ name, focused, label }: { name: any; focused: boolean; label: string }) {
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

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: S.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="الرئيسية" />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} focused={focused} label="وظائف" />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} label="المجتمع" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} label="بحث" />
          ),
        }}
      />
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

const S = StyleSheet.create({
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
