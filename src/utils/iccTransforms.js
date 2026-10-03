import { TYPE_RGB_8, TYPE_CMYK_8, INTENT_PERCEPTUAL } from 'lcms-wasm'

/** Build an owned set of transforms. Profiles are closed after transform creation. */
export async function loadIccTransforms(lcms, profiles, { signal, fetchProfile = fetch } = {}) {
  const transforms = {}
  const dispose = () => {
    for (const key of Object.keys(transforms)) {
      lcms.cmsDeleteTransform(transforms[key])
      delete transforms[key]
    }
  }
  const checkCancelled = () => {
    if (signal?.aborted) throw new DOMException('ICC loading cancelled', 'AbortError')
  }
  checkCancelled()
  const srgb = lcms.cmsCreate_sRGBProfile()
  if (!srgb) throw new Error('Failed to create sRGB profile')
  try {
    for (const profile of profiles) {
      checkCancelled()
      const response = await fetchProfile(profile.path, { signal })
      if (!response.ok) throw new Error(`Failed to load ${profile.key} profile`)
      const buffer = await response.arrayBuffer()
      checkCancelled()
      const output = lcms.cmsOpenProfileFromMem(new Uint8Array(buffer), buffer.byteLength)
      if (!output) throw new Error(`Failed to parse ${profile.key} profile`)
      try {
        const transform = lcms.cmsCreateTransform(srgb, TYPE_RGB_8, output, TYPE_CMYK_8, INTENT_PERCEPTUAL, 0)
        if (!transform) throw new Error(`Failed to create transform for ${profile.key}`)
        transforms[profile.key] = transform
      } finally {
        lcms.cmsCloseProfile(output)
      }
    }
    return { transforms, dispose }
  } catch (error) {
    dispose()
    throw error
  } finally {
    lcms.cmsCloseProfile(srgb)
  }
}
