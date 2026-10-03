import { describe, expect, it } from 'vitest'
import { extractRgb, parseColorInput } from '../src/utils/colorParsing.js'

describe('color normalization', () => {
  it.each([['#fff', {r:255,g:255,b:255}], ['abc', {r:170,g:187,b:204}], ['#000', {r:0,g:0,b:0}]])('expands %s for the ICC pipeline', (input, expected) => {
    expect(extractRgb(parseColorInput(input, 'hex'))).toEqual(expected)
  })
  it('normalizes trimmed mixed-case HEX', () => {
    expect(parseColorInput(' #AbC ', 'hex')).toEqual({ hex: '#aabbcc', rgb: null })
  })
  it.each(['rgb(1,2,3', '1,2,3)', 'rgb1,2,3', '256,0,0', '-1,0,0'])('rejects malformed RGB %s', (input) => {
    expect(parseColorInput(input, 'rgb')).toBeNull()
  })
  it.each(['1, 2, 3', 'rgb(1, 2, 3)', ' RGB(1,2,3) '])('accepts %s', (input) => {
    expect(parseColorInput(input, 'rgb')).toEqual({ hex: null, rgb: {r:1,g:2,b:3} })
  })
  it('rejects unknown input types', () => expect(parseColorInput('1,2,3', 'other')).toBeNull())
  it.each([null, {}, {hex:'#ggg'}, {rgb:{r:NaN,g:0,b:0}}, {rgb:{r:256,g:0,b:0}}])('does not coerce invalid channels to Uint8', (input) => {
    expect(extractRgb(input)).toBeNull()
  })
})
