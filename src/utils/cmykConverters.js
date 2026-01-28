import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import convert from 'color-convert'
import Color from 'color'
import chroma from 'chroma-js'

// Extend colord with CMYK support
extend([cmykPlugin])

// Convert using colord library
function convertWithColord(colorValue) {
  try {
    const color = colorValue.hex ? colord(colorValue.hex) : colord(colorValue.rgb)
    if (!color.isValid()) return null

    const cmyk = color.toCmyk()
    return {
      c: Math.round(cmyk.c),
      m: Math.round(cmyk.m),
      y: Math.round(cmyk.y),
      k: Math.round(cmyk.k),
      hex: color.toHex(),
      rgb: color.toRgb(),
    }
  } catch {
    return null
  }
}

// Convert using color-convert library
function convertWithColorConvert(colorValue) {
  try {
    let rgb
    if (colorValue.hex) {
      const hex = colorValue.hex.replace('#', '')
      rgb = convert.hex.rgb(hex)
    } else {
      rgb = [colorValue.rgb.r, colorValue.rgb.g, colorValue.rgb.b]
    }

    const cmyk = convert.rgb.cmyk(rgb)
    const hexValue = colorValue.hex || `#${convert.rgb.hex(rgb)}`

    return {
      c: cmyk[0],
      m: cmyk[1],
      y: cmyk[2],
      k: cmyk[3],
      hex: hexValue.toLowerCase(),
      rgb: { r: rgb[0], g: rgb[1], b: rgb[2] },
    }
  } catch {
    return null
  }
}

// Convert using color library (Qix-)
function convertWithColor(colorValue) {
  try {
    const color = colorValue.hex
      ? Color(colorValue.hex)
      : Color.rgb(colorValue.rgb.r, colorValue.rgb.g, colorValue.rgb.b)

    const cmyk = color.cmyk().array()
    const rgb = color.rgb().array()

    return {
      c: Math.round(cmyk[0]),
      m: Math.round(cmyk[1]),
      y: Math.round(cmyk[2]),
      k: Math.round(cmyk[3]),
      hex: color.hex().toLowerCase(),
      rgb: { r: Math.round(rgb[0]), g: Math.round(rgb[1]), b: Math.round(rgb[2]) },
    }
  } catch {
    return null
  }
}

// Convert using chroma-js library
function convertWithChroma(colorValue) {
  try {
    const color = colorValue.hex
      ? chroma(colorValue.hex)
      : chroma(colorValue.rgb.r, colorValue.rgb.g, colorValue.rgb.b)

    const cmyk = color.cmyk()
    const rgb = color.rgb()

    return {
      c: Math.round(cmyk[0] * 100),
      m: Math.round(cmyk[1] * 100),
      y: Math.round(cmyk[2] * 100),
      k: Math.round(cmyk[3] * 100),
      hex: color.hex().toLowerCase(),
      rgb: { r: rgb[0], g: rgb[1], b: rgb[2] },
    }
  } catch {
    return null
  }
}

// Configuration array for all CMYK libraries
export const CMYK_LIBRARIES = [
  {
    id: 'colord',
    title: 'Colord',
    url: 'https://github.com/omgovich/colord',
    badge: 'npm: colord',
    convert: convertWithColord,
  },
  {
    id: 'color-convert',
    title: 'Color-Convert',
    url: 'https://github.com/Qix-/color-convert',
    badge: 'npm: color-convert',
    convert: convertWithColorConvert,
  },
  {
    id: 'color',
    title: 'Color',
    url: 'https://github.com/Qix-/color',
    badge: 'npm: color',
    convert: convertWithColor,
  },
  {
    id: 'chroma',
    title: 'Chroma.js',
    url: 'https://github.com/gka/chroma.js',
    badge: 'npm: chroma-js',
    convert: convertWithChroma,
  },
]

// Get results from all CMYK libraries
export function getAllCmykResults(colorValue) {
  return CMYK_LIBRARIES.map((lib) => ({
    ...lib,
    result: lib.convert(colorValue),
  }))
}
