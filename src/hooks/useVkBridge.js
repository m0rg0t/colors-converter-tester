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
      try {
        await bridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom' })
        setIsVK(true)
      } catch {
        // Not inside VK or banner not available
      }
    }
    showVKBanner()
  }, [])

  return { isVK }
}
