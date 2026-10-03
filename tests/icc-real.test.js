// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { instantiate } from 'lcms-wasm'
import { loadIccTransforms } from '../src/utils/iccTransforms.js'
import { extractRgb, parseColorInput } from '../src/utils/colorParsing.js'

it('actual bundled Wasm transforms short and long HEX identically after closing profile handles', async () => {
  const lcms = await instantiate({ locateFile: () => fileURLToPath(new URL('../node_modules/lcms-wasm/dist/lcms.wasm', import.meta.url)) })
  const file = await readFile(new URL('../public/profiles/GenericCMYK.icc', import.meta.url))
  const loaded = await loadIccTransforms(lcms, [{ key: 'generic', path: '/synthetic-local-profile' }], {
    fetchProfile: async () => ({ ok: true, arrayBuffer: async () => file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) }),
  })
  try {
    for (const [short, long] of [['#fff', '#ffffff'], ['#abc', '#aabbcc'], ['#000', '#000000']]) {
      const convert = (input) => {
        const { r, g, b } = extractRgb(parseColorInput(input, 'hex'))
        return [...lcms.cmsDoTransform(loaded.transforms.generic, new Uint8Array([r, g, b]), 1)]
      }
      expect(convert(short)).toEqual(convert(long))
      expect(convert(short)).toHaveLength(4)
      expect(convert(short).every((value) => Number.isInteger(value) && value >= 0 && value <= 255)).toBe(true)
    }
  } finally { loaded.dispose() }
})
