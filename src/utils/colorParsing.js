// Validation patterns
const HEX_REGEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
const RGB_REGEX = /^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i

/**
 * Parse color input and return normalized hex/rgb value
 * @param {string} input - User input string
 * @param {'hex'|'rgb'} inputType - Type of input
 * @returns {{ hex: string|null, rgb: { r: number, g: number, b: number }|null } | null}
 */
export function parseColorInput(input, inputType) {
  try {
    if (inputType === 'hex') {
      if (!HEX_REGEX.test(input)) {
        return null
      }
      const hex = input.startsWith('#') ? input : `#${input}`
      return { hex, rgb: null }
    } else {
      const rgbMatch = input.match(RGB_REGEX)
      if (!rgbMatch) {
        return null
      }
      const r = parseInt(rgbMatch[1], 10)
      const g = parseInt(rgbMatch[2], 10)
      const b = parseInt(rgbMatch[3], 10)
      if (r > 255 || g > 255 || b > 255) {
        return null
      }
      return { hex: null, rgb: { r, g, b } }
    }
  } catch {
    return null
  }
}

/**
 * Extract RGB values from a colorValue object
 * @param {{ hex: string|null, rgb: { r: number, g: number, b: number }|null }} colorValue
 * @returns {{ r: number, g: number, b: number } | null}
 */
export function extractRgb(colorValue) {
  if (colorValue.rgb) {
    return colorValue.rgb
  }
  if (colorValue.hex) {
    const hex = colorValue.hex.replace('#', '')
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    }
  }
  return null
}
