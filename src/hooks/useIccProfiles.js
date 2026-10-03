import { useState, useEffect, useRef, useCallback } from 'react'
import { instantiate } from 'lcms-wasm'
import { loadIccTransforms } from '../utils/iccTransforms'
import wasmFileURI from 'lcms-wasm/dist/lcms.wasm?url'
import { ICC_PROFILES } from '../config/iccProfiles'
import { extractRgb } from '../utils/colorParsing'

/**
 * Hook to initialize and manage ICC profile transforms
 * @returns {{
 *   iccReady: boolean,
 *   iccError: string,
 *   convertWithIcc: (colorValue: object, profileKey: string) => object | null
 * }}
 */
export function useIccProfiles() {
  const [iccReady, setIccReady] = useState(false)
  const [iccError, setIccError] = useState('')
  const lcmsRef = useRef(null)
  const transformsRef = useRef({})

  // Initialize lcms-wasm and ICC profiles
  useEffect(() => {
    const controller = new AbortController()
    let resources = null
    let active = true
    const initICC = async () => {
      try {
        const lcms = await instantiate({ locateFile: () => wasmFileURI })
        if (!active) return
        resources = await loadIccTransforms(lcms, ICC_PROFILES, { signal: controller.signal })
        if (!active) { resources.dispose(); return }
        lcmsRef.current = lcms
        transformsRef.current = resources.transforms
        setIccReady(true)
      } catch (err) {
        if (active) setIccError(err instanceof Error ? err.message : String(err))
      }
    }
    void initICC()
    return () => {
      active = false
      controller.abort()
      resources?.dispose()
      lcmsRef.current = null
      transformsRef.current = {}
    }

  }, [])

  // Convert color using ICC profile
  const convertWithIcc = useCallback(
    (colorValue, profileKey) => {
      const transform = transformsRef.current[profileKey]
      if (!iccReady || !lcmsRef.current || !transform) {
        return null
      }

      try {
        const lcms = lcmsRef.current
        const rgb = extractRgb(colorValue)
        if (!rgb) return null

        // Perform ICC transform
        const input = new Uint8Array([rgb.r, rgb.g, rgb.b])
        const output = lcms.cmsDoTransform(transform, input, 1)

        // Convert from 0-255 to 0-100 percentage
        return {
          c: Math.round((output[0] / 255) * 100),
          m: Math.round((output[1] / 255) * 100),
          y: Math.round((output[2] / 255) * 100),
          k: Math.round((output[3] / 255) * 100),
          hex:
            colorValue.hex ||
            `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`,
          rgb,
        }
      } catch (err) {
        console.error('ICC conversion error:', err)
        return null
      }
    },
    [iccReady]
  )

  return { iccReady, iccError, convertWithIcc }
}
