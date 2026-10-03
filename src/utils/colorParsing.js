const HEX_REGEX = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
const RGB_CHANNELS = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/
const validRgb = (rgb) => rgb && ['r', 'g', 'b'].every((key) => Number.isInteger(rgb[key]) && rgb[key] >= 0 && rgb[key] <= 255)

/** Parse supported HEX or comma-separated RGB without coercing invalid channels. */
export function parseColorInput(input, inputType) {
  if (typeof input !== 'string') return null
  const value = input.trim()
  if (inputType === 'hex') {
    const match = value.match(HEX_REGEX)
    if (!match) return null
    const hex = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1]
    return { hex: `#${hex.toLowerCase()}`, rgb: null }
  }
  if (inputType !== 'rgb') return null
  // A functional form must have both parentheses; bare comma-separated channels are also accepted.
  const functional = value.match(/^rgb\s*\((.*)\)$/i)
  const channels = functional ? functional[1].trim() : value
  const match = channels.match(RGB_CHANNELS)
  if (!match) return null
  const rgb = { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
  return validRgb(rgb) ? { hex: null, rgb } : null
}

/** Return only validated 8-bit RGB channels, including expanded three-digit HEX. */
export function extractRgb(colorValue) {
  if (!colorValue || typeof colorValue !== 'object') return null
  if (colorValue.rgb) return validRgb(colorValue.rgb) ? { ...colorValue.rgb } : null
  const parsed = parseColorInput(colorValue.hex, 'hex')
  if (!parsed) return null
  const hex = parsed.hex.slice(1)
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }
}
