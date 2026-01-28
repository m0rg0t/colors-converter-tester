import { useState, useEffect, useRef, useCallback } from 'react'
import { instantiate, TYPE_RGB_8, TYPE_CMYK_8, INTENT_PERCEPTUAL } from 'lcms-wasm'
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
    const initICC = async () => {
      try {
        // Instantiate lcms-wasm
        const lcms = await instantiate({
          locateFile: () => wasmFileURI,
        })
        lcmsRef.current = lcms

        // Create sRGB input profile (built-in)
        const srgbProfile = lcms.cmsCreate_sRGBProfile()
        if (!srgbProfile) {
          throw new Error('Failed to create sRGB profile')
        }

        // Load each CMYK profile and create transforms
        for (const profile of ICC_PROFILES) {
          const response = await fetch(profile.path)
          if (!response.ok) {
            throw new Error(`Failed to load ${profile.key} profile`)
          }
          const buffer = await response.arrayBuffer()
          const cmykProfile = lcms.cmsOpenProfileFromMem(
            new Uint8Array(buffer),
            buffer.byteLength
          )
          if (!cmykProfile) {
            throw new Error(`Failed to parse ${profile.key} profile`)
          }

          // Create transform: sRGB -> CMYK with perceptual intent
          const transform = lcms.cmsCreateTransform(
            srgbProfile,
            TYPE_RGB_8,
            cmykProfile,
            TYPE_CMYK_8,
            INTENT_PERCEPTUAL,
            0
          )
          if (!transform) {
            throw new Error(`Failed to create transform for ${profile.key}`)
          }
          transformsRef.current[profile.key] = transform
        }

        setIccReady(true)
      } catch (err) {
        console.error('ICC initialization error:', err)
        setIccError(err.message)
      }
    }

    initICC()
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
