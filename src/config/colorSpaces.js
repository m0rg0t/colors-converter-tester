import { converter } from 'culori'

// Culori converters — created once at module level
const toHsl = converter('hsl')
const toHsv = converter('hsv')
const toHwb = converter('hwb')
const toLab = converter('lab')
const toLch = converter('lch')
const toOklab = converter('oklab')
const toOklch = converter('oklch')
const toXyz65 = converter('xyz65')
const toLrgb = converter('lrgb')
const toP3 = converter('p3')

// Factory: Hue + two percent values (HSL, HSV, HWB)
const createHuePercentFormat = (channels, cssName = null) => (v) => {
  if (!v) return { values: ['-', '-', '-'], css: '' }
  const h = (v[channels[0]] ?? 0).toFixed(1)
  const p1 = ((v[channels[1]] ?? 0) * 100).toFixed(1)
  const p2 = ((v[channels[2]] ?? 0) * 100).toFixed(1)
  return {
    values: [`${h}°`, `${p1}%`, `${p2}%`],
    css: cssName ? `${cssName}(${h} ${p1}% ${p2}%)` : '',
  }
}

// Factory: Three decimal values with configurable precision
// cssPrefix includes everything before the values, e.g. "oklab(" or "color(xyz-d65 "
const createDecimalFormat = (channels, precision, cssPrefix = null) => (v) => {
  if (!v) return { values: ['-', '-', '-'], css: '' }
  const vals = channels.map((c) => (v[c] ?? 0).toFixed(precision))
  return {
    values: vals,
    css: cssPrefix ? `${cssPrefix}${vals.join(' ')})` : '',
  }
}

// Factory: Lab-like with % suffix for first value
const createLabFormat = (channels, precision, cssName) => (v) => {
  if (!v) return { values: ['-', '-', '-'], css: '' }
  const vals = channels.map((c) => (v[c] ?? 0).toFixed(precision))
  return {
    values: vals,
    css: `${cssName}(${vals[0]}% ${vals[1]} ${vals[2]})`,
  }
}

// Factory: LCH-like (value, chroma, hue°)
const createLchFormat = (channels, precision, cssName) => (v) => {
  if (!v) return { values: ['-', '-', '-'], css: '' }
  const l = (v[channels[0]] ?? 0).toFixed(precision)
  const c = (v[channels[1]] ?? 0).toFixed(precision)
  const h = (v[channels[2]] ?? 0).toFixed(1)
  return {
    values: [l, c, `${h}°`],
    css: `${cssName}(${l}% ${c} ${h})`,
  }
}

// Color space configuration
export const COLOR_SPACES = [
  {
    id: 'hsl',
    name: 'HSL',
    convert: toHsl,
    labels: ['H', 'S', 'L'],
    format: createHuePercentFormat(['h', 's', 'l'], 'hsl'),
  },
  {
    id: 'hsv',
    name: 'HSV',
    convert: toHsv,
    labels: ['H', 'S', 'V'],
    format: createHuePercentFormat(['h', 's', 'v']),
  },
  {
    id: 'hwb',
    name: 'HWB',
    convert: toHwb,
    labels: ['H', 'W', 'B'],
    format: createHuePercentFormat(['h', 'w', 'b'], 'hwb'),
  },
  {
    id: 'lab',
    name: 'CIE Lab D50',
    convert: toLab,
    labels: ['L*', 'a*', 'b*'],
    format: createLabFormat(['l', 'a', 'b'], 2, 'lab'),
  },
  {
    id: 'lch',
    name: 'CIE LCH D50',
    convert: toLch,
    labels: ['L*', 'C*', 'h'],
    format: createLchFormat(['l', 'c', 'h'], 2, 'lch'),
  },
  {
    id: 'oklab',
    name: 'OKLab',
    convert: toOklab,
    labels: ['L', 'a', 'b'],
    format: createDecimalFormat(['l', 'a', 'b'], 4, 'oklab('),
  },
  {
    id: 'oklch',
    name: 'OKLCH',
    convert: toOklch,
    labels: ['L', 'C', 'h'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      const l = (v.l ?? 0).toFixed(4)
      const c = (v.c ?? 0).toFixed(4)
      const h = (v.h ?? 0).toFixed(1)
      return {
        values: [l, c, `${h}°`],
        css: `oklch(${l} ${c} ${h})`,
      }
    },
  },
  {
    id: 'xyz65',
    name: 'CIE XYZ D65',
    convert: toXyz65,
    labels: ['X', 'Y', 'Z'],
    format: createDecimalFormat(['x', 'y', 'z'], 5, 'color(xyz-d65 '),
  },
  {
    id: 'lrgb',
    name: 'Linear sRGB',
    convert: toLrgb,
    labels: ['R', 'G', 'B'],
    format: createDecimalFormat(['r', 'g', 'b'], 5, 'color(srgb-linear '),
  },
  {
    id: 'p3',
    name: 'Display P3',
    convert: toP3,
    labels: ['R', 'G', 'B'],
    format: createDecimalFormat(['r', 'g', 'b'], 5, 'color(display-p3 '),
  },
]
