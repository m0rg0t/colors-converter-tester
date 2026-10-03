import { describe, expect, it, vi } from 'vitest'
import { loadIccTransforms } from '../src/utils/iccTransforms.js'

const profiles = [{ key: 'a', path: '/a.icc' }, { key: 'b', path: '/b.icc' }]
const engine = () => {
  let profile = 10, transform = 100
  return { cmsCreate_sRGBProfile: vi.fn(() => 1), cmsOpenProfileFromMem: vi.fn(() => ++profile),
    cmsCreateTransform: vi.fn(() => ++transform), cmsCloseProfile: vi.fn(), cmsDeleteTransform: vi.fn() }
}
const response = () => ({ ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer })

describe('ICC resource ownership', () => {
  it('closes all profiles and deletes owned transforms exactly once', async () => {
    const lcms = engine()
    const result = await loadIccTransforms(lcms, profiles, { fetchProfile: async () => response() })
    expect(lcms.cmsCloseProfile.mock.calls.flat()).toEqual([11, 12, 1])
    expect(lcms.cmsDeleteTransform).not.toHaveBeenCalled()
    expect(Object.keys(result.transforms)).toEqual(['a', 'b'])
    result.dispose(); result.dispose()
    expect(lcms.cmsDeleteTransform.mock.calls.flat()).toEqual([101, 102])
  })
  it('releases earlier transforms if a later profile fetch fails', async () => {
    const lcms = engine()
    const fetchProfile = vi.fn().mockResolvedValueOnce(response()).mockResolvedValueOnce({ ok: false })
    await expect(loadIccTransforms(lcms, profiles, { fetchProfile })).rejects.toThrow('Failed to load b')
    expect(lcms.cmsDeleteTransform.mock.calls.flat()).toEqual([101])
    expect(lcms.cmsCloseProfile.mock.calls.flat()).toEqual([11, 1])
  })
  it('closes the output and input profiles if transform creation fails', async () => {
    const lcms = engine(); lcms.cmsCreateTransform.mockReturnValue(0)
    await expect(loadIccTransforms(lcms, profiles, { fetchProfile: async () => response() })).rejects.toThrow('Failed to create transform')
    expect(lcms.cmsCloseProfile.mock.calls.flat()).toEqual([11, 1])
    expect(lcms.cmsDeleteTransform).not.toHaveBeenCalled()
  })
  it('cancels late fetch results without allocating another profile', async () => {
    const lcms = engine(), controller = new AbortController()
    await expect(loadIccTransforms(lcms, profiles, { signal: controller.signal, fetchProfile: async () => {
      controller.abort(); return response()
    } })).rejects.toThrow('cancelled')
    expect(lcms.cmsOpenProfileFromMem).not.toHaveBeenCalled()
    expect(lcms.cmsCloseProfile).toHaveBeenCalledExactlyOnceWith(1)
  })
})
