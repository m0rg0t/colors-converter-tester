import { describe, expect, it } from 'vitest'
import { getAllCmykResults } from '../src/utils/cmykConverters.js'
import { parseColorInput } from '../src/utils/colorParsing.js'
import { COLOR_SPACES } from '../src/config/colorSpaces.js'

describe('all bundled mathematical converters', () => {
  it.each([['#fff', [0, 0, 0, 0]], ['#000', [0, 0, 0, 100]], ['#f00', [0, 100, 100, 0]]])('agree on the reference color %s', (hex, expected) => {
    const results = getAllCmykResults(parseColorInput(hex, 'hex'))
    expect(results).toHaveLength(4)
    for (const { result } of results) expect([result.c, result.m, result.y, result.k]).toEqual(expected)
  })
  it('formats every extended color space without non-finite output', () => {
    for (const hex of ['#000000', '#ffffff', '#aabbcc']) for (const space of COLOR_SPACES) {
      const result = space.format(space.convert(hex))
      expect(result.values).toHaveLength(3)
      expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
})
