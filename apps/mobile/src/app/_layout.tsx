import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { useAuthStore } from '../store/authStore'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
})

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular:   require('../../assets/fonts/Cairo_400Regular.ttf'),
    Cairo_500Medium:    require('../../assets/fonts/Cairo_500Medium.ttf'),
    Cairo_600SemiBold:  require('../../assets/fonts/Cairo_600SemiBold.ttf'),
    Cairo_700Bold:      require('../../assets/fonts/Cairo_700Bold.ttf'),
    Cairo_800ExtraBold: require('../../assets/fonts/Cairo_800ExtraBold.ttf'),
    Cairo_900Black:     require('../../assets/fonts/Cairo_900Black.ttf'),
  })

  const { initialize, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (fontsLoaded || fontError) {
      initialize()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    if ((fontsLoaded || fontError) && !authLoading) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError, authLoading])

  if ((!fontsLoaded && !fontError) || authLoading) return null

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
