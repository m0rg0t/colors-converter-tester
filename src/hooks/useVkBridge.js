import { useState, useEffect } from 'react'
import bridge from '@vkontakte/vk-bridge'

/**
 * Hook to initialize VK Bridge and show banner ad
 * @returns {{ isVK: boolean }} Whether running inside VK
 */
export function useVkBridge() {
  const [isVK, setIsVK] = useState(false)

  useEffect(() => {
    const showVKBanner = async () => {
      console.log('[VK Bridge] Attempting to show banner ad...')
      try {
        await bridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom' })
        console.log('[VK Bridge] Banner ad shown successfully')
        setIsVK(true)
      } catch (error) {
        console.log('[VK Bridge] Failed to show banner:', error)
        // Not inside VK or banner not available
      }
    }
    showVKBanner()
  }, [])

  return { isVK }
}
