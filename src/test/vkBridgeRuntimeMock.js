const scenario = new URLSearchParams(window.location.search).get('vk_mock')
const calls = []
window.__VK_BRIDGE_MOCK__ = { calls }
export default {
  send: async (method, params) => {
    calls.push({ method, params })
    if (method === 'VKWebAppInit') {
      if (scenario === 'init-unavailable') throw new Error('Synthetic initialization refusal')
      return {}
    }
    if (method === 'VKWebAppShowBannerAd') {
      if (scenario === 'ads-unavailable') throw new Error('Synthetic ads unavailable')
      return { result: true, banner_width: 320, banner_height: 64 }
    }
    throw new Error(`Unsupported synthetic Bridge method: ${method}`)
  },
}
