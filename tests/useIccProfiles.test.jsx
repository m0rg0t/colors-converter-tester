import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { instantiate } from 'lcms-wasm'
import { loadIccTransforms } from '../src/utils/iccTransforms.js'
import { useIccProfiles } from '../src/hooks/useIccProfiles.js'

vi.mock('lcms-wasm', () => ({ instantiate: vi.fn() }))
vi.mock('../src/utils/iccTransforms.js', () => ({ loadIccTransforms: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('does not allocate profile handles after late Wasm initialization and unmount', async () => {
  let ready
  vi.mocked(instantiate).mockReturnValue(new Promise((resolve) => { ready = resolve }))
  const { unmount } = renderHook(useIccProfiles)
  unmount()
  await act(async () => { ready({}) })
  expect(loadIccTransforms).not.toHaveBeenCalled()
})

it('disposes late profile loading results and aborts their fetch signal', async () => {
  vi.mocked(instantiate).mockResolvedValue({})
  let ready
  const dispose = vi.fn()
  vi.mocked(loadIccTransforms).mockReturnValue(new Promise((resolve) => { ready = resolve }))
  const { unmount } = renderHook(useIccProfiles)
  await waitFor(() => expect(loadIccTransforms).toHaveBeenCalledOnce())
  const signal = vi.mocked(loadIccTransforms).mock.calls[0][2].signal
  unmount()
  expect(signal.aborted).toBe(true)
  await act(async () => { ready({ transforms: { generic: 1 }, dispose }) })
  expect(dispose).toHaveBeenCalledOnce()
})

it('converts only validated channels and releases ready transforms on unmount', async () => {
  const cmsDoTransform = vi.fn(() => new Uint8Array([0, 0, 0, 255]))
  vi.mocked(instantiate).mockResolvedValue({ cmsDoTransform })
  const dispose = vi.fn()
  vi.mocked(loadIccTransforms).mockResolvedValue({ transforms: { generic: 1 }, dispose })
  const { result, unmount } = renderHook(useIccProfiles)
  await waitFor(() => expect(result.current.iccReady).toBe(true))
  expect(result.current.convertWithIcc({ hex: '#000' }, 'generic')).toMatchObject({ c: 0, m: 0, y: 0, k: 100 })
  expect(cmsDoTransform).toHaveBeenCalledWith(1, new Uint8Array([0, 0, 0]), 1)
  expect(result.current.convertWithIcc({ rgb: { r: NaN, g: 0, b: 0 } }, 'generic')).toBeNull()
  expect(cmsDoTransform).toHaveBeenCalledOnce()
  unmount()
  expect(dispose).toHaveBeenCalledOnce()
})
