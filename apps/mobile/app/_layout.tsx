import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { api } from '../src/services/api'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

async function registerPushToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission not granted')
      return
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId

    if (!projectId) {
      console.warn('[Push] No EAS projectId — run: cd apps/mobile && npx eas init')
      return
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    console.log('[Push] Token registered:', token.slice(0, 20) + '…')

    const platform = Platform.OS as 'ios' | 'android'
    await api.post('/auth/push-token', { token, platform })
  } catch (e) {
    console.error('[Push] Registration failed:', e)
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
})

export default function RootLayout() {
  const notifListener = useRef<any>(null)

  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular:  require('../assets/fonts/Cairo_400Regular.ttf'),
    Cairo_500Medium:   require('../assets/fonts/Cairo_500Medium.ttf'),
    Cairo_600SemiBold: require('../assets/fonts/Cairo_600SemiBold.ttf'),
    Cairo_700Bold:     require('../assets/fonts/Cairo_700Bold.ttf'),
    Cairo_800ExtraBold: require('../assets/fonts/Cairo_800ExtraBold.ttf'),
    Cairo_900Black:    require('../assets/fonts/Cairo_900Black.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    registerPushToken()

    // Refresh notification badge when a push is received while app is open
    notifListener.current = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current)
    }
  }, [])

  if (!fontsLoaded && !fontError) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
