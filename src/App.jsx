import { useState, useCallback, useEffect, useRef } from 'react'
import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import convert from 'color-convert'
import Color from 'color'
import chroma from 'chroma-js'
import { instantiate, TYPE_RGB_8, TYPE_CMYK_8, INTENT_PERCEPTUAL } from 'lcms-wasm'
import wasmFileURI from 'lcms-wasm/dist/lcms.wasm?url'
import { converter } from 'culori'
import bridge from '@vkontakte/vk-bridge'
import './App.css'

// Extend colord with CMYK support
extend([cmykPlugin])

// Translations
const i18n = {
  en: {
    title: 'Color\nConverter',
    subtitle: 'HEX / RGB → CMYK + 10 Color Spaces // Multi-library comparison',
    inputLabel: 'INPUT',
    previewLabel: 'PREVIEW',
    cmykOutputLabel: 'CMYK OUTPUT',
    hexPlaceholder: '#RRGGBB',
    rgbPlaceholder: 'R, G, B',
    invalidHex: 'Invalid HEX // Expected: #RRGGBB or RRGGBB',
    invalidRgb: 'Invalid RGB // Expected: R, G, B (0-255)',
    loadingIcc: 'Loading ICC profiles...',
    allMatch: (n) => `All ${n} libraries produce identical results`,
    uniqueResults: (u, n) => `${u} unique results among ${n} libraries`,
    iccNote: 'ICC Profiles use device-specific conversion (like Adobe Photoshop)',
    colorSpacesTitle: 'Color Spaces',
    colorSpacesSubtitle: '10 color space conversions via culori',
    footer: 'Built for testing color conversion accuracy',
  },
  ru: {
    title: 'Конвертер\nЦветов',
    subtitle: 'HEX / RGB → CMYK + 10 цветовых пространств // Сравнение библиотек',
    inputLabel: 'ВВОД',
    previewLabel: 'ПРЕДПРОСМОТР',
    cmykOutputLabel: 'CMYK РЕЗУЛЬТАТ',
    hexPlaceholder: '#RRGGBB',
    rgbPlaceholder: 'R, G, B',
    invalidHex: 'Неверный HEX // Ожидается: #RRGGBB или RRGGBB',
    invalidRgb: 'Неверный RGB // Ожидается: R, G, B (0-255)',
    loadingIcc: 'Загрузка ICC профилей...',
    allMatch: (n) => `Все ${n} библиотек дают одинаковый результат`,
    uniqueResults: (u, n) => `${u} уникальных результатов из ${n} библиотек`,
    iccNote: 'ICC профили используют аппаратное преобразование (как в Adobe Photoshop)',
    colorSpacesTitle: 'Цветовые пространства',
    colorSpacesSubtitle: '10 преобразований цветовых пространств через culori',
    footer: 'Создано для проверки точности конвертации цветов',
  },
}

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

// Color space configuration
const COLOR_SPACES = [
  {
    id: 'hsl',
    name: 'HSL',
    convert: toHsl,
    channels: ['h', 's', 'l'],
    labels: ['H', 'S', 'L'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.h ?? 0).toFixed(1)}°`,
          `${((v.s ?? 0) * 100).toFixed(1)}%`,
          `${((v.l ?? 0) * 100).toFixed(1)}%`,
        ],
        css: `hsl(${(v.h ?? 0).toFixed(1)} ${((v.s ?? 0) * 100).toFixed(1)}% ${((v.l ?? 0) * 100).toFixed(1)}%)`,
      }
    },
  },
  {
    id: 'hsv',
    name: 'HSV',
    convert: toHsv,
    channels: ['h', 's', 'v'],
    labels: ['H', 'S', 'V'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.h ?? 0).toFixed(1)}°`,
          `${((v.s ?? 0) * 100).toFixed(1)}%`,
          `${((v.v ?? 0) * 100).toFixed(1)}%`,
        ],
        css: '',
      }
    },
  },
  {
    id: 'hwb',
    name: 'HWB',
    convert: toHwb,
    channels: ['h', 'w', 'b'],
    labels: ['H', 'W', 'B'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.h ?? 0).toFixed(1)}°`,
          `${((v.w ?? 0) * 100).toFixed(1)}%`,
          `${((v.b ?? 0) * 100).toFixed(1)}%`,
        ],
        css: `hwb(${(v.h ?? 0).toFixed(1)} ${((v.w ?? 0) * 100).toFixed(1)}% ${((v.b ?? 0) * 100).toFixed(1)}%)`,
      }
    },
  },
  {
    id: 'lab',
    name: 'CIE Lab D50',
    convert: toLab,
    channels: ['l', 'a', 'b'],
    labels: ['L*', 'a*', 'b*'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.l ?? 0).toFixed(2)}`,
          `${(v.a ?? 0).toFixed(2)}`,
          `${(v.b ?? 0).toFixed(2)}`,
        ],
        css: `lab(${(v.l ?? 0).toFixed(2)}% ${(v.a ?? 0).toFixed(2)} ${(v.b ?? 0).toFixed(2)})`,
      }
    },
  },
  {
    id: 'lch',
    name: 'CIE LCH D50',
    convert: toLch,
    channels: ['l', 'c', 'h'],
    labels: ['L*', 'C*', 'h'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.l ?? 0).toFixed(2)}`,
          `${(v.c ?? 0).toFixed(2)}`,
          `${(v.h ?? 0).toFixed(1)}°`,
        ],
        css: `lch(${(v.l ?? 0).toFixed(2)}% ${(v.c ?? 0).toFixed(2)} ${(v.h ?? 0).toFixed(1)})`,
      }
    },
  },
  {
    id: 'oklab',
    name: 'OKLab',
    convert: toOklab,
    channels: ['l', 'a', 'b'],
    labels: ['L', 'a', 'b'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.l ?? 0).toFixed(4)}`,
          `${(v.a ?? 0).toFixed(4)}`,
          `${(v.b ?? 0).toFixed(4)}`,
        ],
        css: `oklab(${(v.l ?? 0).toFixed(4)} ${(v.a ?? 0).toFixed(4)} ${(v.b ?? 0).toFixed(4)})`,
      }
    },
  },
  {
    id: 'oklch',
    name: 'OKLCH',
    convert: toOklch,
    channels: ['l', 'c', 'h'],
    labels: ['L', 'C', 'h'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.l ?? 0).toFixed(4)}`,
          `${(v.c ?? 0).toFixed(4)}`,
          `${(v.h ?? 0).toFixed(1)}°`,
        ],
        css: `oklch(${(v.l ?? 0).toFixed(4)} ${(v.c ?? 0).toFixed(4)} ${(v.h ?? 0).toFixed(1)})`,
      }
    },
  },
  {
    id: 'xyz65',
    name: 'CIE XYZ D65',
    convert: toXyz65,
    channels: ['x', 'y', 'z'],
    labels: ['X', 'Y', 'Z'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.x ?? 0).toFixed(5)}`,
          `${(v.y ?? 0).toFixed(5)}`,
          `${(v.z ?? 0).toFixed(5)}`,
        ],
        css: `color(xyz-d65 ${(v.x ?? 0).toFixed(5)} ${(v.y ?? 0).toFixed(5)} ${(v.z ?? 0).toFixed(5)})`,
      }
    },
  },
  {
    id: 'lrgb',
    name: 'Linear sRGB',
    convert: toLrgb,
    channels: ['r', 'g', 'b'],
    labels: ['R', 'G', 'B'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.r ?? 0).toFixed(5)}`,
          `${(v.g ?? 0).toFixed(5)}`,
          `${(v.b ?? 0).toFixed(5)}`,
        ],
        css: `color(srgb-linear ${(v.r ?? 0).toFixed(5)} ${(v.g ?? 0).toFixed(5)} ${(v.b ?? 0).toFixed(5)})`,
      }
    },
  },
  {
    id: 'p3',
    name: 'Display P3',
    convert: toP3,
    channels: ['r', 'g', 'b'],
    labels: ['R', 'G', 'B'],
    format: (v) => {
      if (!v) return { values: ['-', '-', '-'], css: '' }
      return {
        values: [
          `${(v.r ?? 0).toFixed(5)}`,
          `${(v.g ?? 0).toFixed(5)}`,
          `${(v.b ?? 0).toFixed(5)}`,
        ],
        css: `color(display-p3 ${(v.r ?? 0).toFixed(5)} ${(v.g ?? 0).toFixed(5)} ${(v.b ?? 0).toFixed(5)})`,
      }
    },
  },
]

function App() {
  const [colorInput, setColorInput] = useState('#3498db')
  const [inputType, setInputType] = useState('hex')
  const [error, setError] = useState('')
  const [iccReady, setIccReady] = useState(false)
  const [iccError, setIccError] = useState('')
  const [isVK, setIsVK] = useState(false)
  const [lang, setLang] = useState('en')
  const lcmsRef = useRef(null)
  const transformsRef = useRef({
    generic: null,
    photoshop4: null,
    photoshop5: null
  })

  const t = i18n[lang]

  // Try to show VK banner ad and detect VK environment
  useEffect(() => {
    const initVK = async () => {
      try {
        await bridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom' })
        setIsVK(true)
        setLang('ru')
      } catch {
        // Not inside VK or banner not available
      }
    }
    initVK()
  }, [])

  // Initialize lcms-wasm and ICC profiles
  useEffect(() => {
    const initICC = async () => {
      try {
        // Instantiate lcms-wasm
        const lcms = await instantiate({
          locateFile: () => wasmFileURI
        })
        lcmsRef.current = lcms

        // Create sRGB input profile (built-in)
        const srgbProfile = lcms.cmsCreate_sRGBProfile()
        if (!srgbProfile) {
          throw new Error('Failed to create sRGB profile')
        }

        // Define all CMYK profiles to load
        const profiles = [
          { key: 'generic', path: './profiles/GenericCMYK.icc' },
          { key: 'photoshop4', path: './profiles/Photoshop4DefaultCMYK.icc' },
          { key: 'photoshop5', path: './profiles/Photoshop5DefaultCMYK.icc' }
        ]

        // Load each CMYK profile and create transforms
        for (const profile of profiles) {
          const response = await fetch(profile.path)
          if (!response.ok) {
            throw new Error(`Failed to load ${profile.key} profile`)
          }
          const buffer = await response.arrayBuffer()
          const cmykProfile = lcms.cmsOpenProfileFromMem(
            new Uint8Array(buffer),
            buffer.byteLength
          )
          if (!cmykProfile) {
            throw new Error(`Failed to parse ${profile.key} profile`)
          }

          // Create transform: sRGB -> CMYK with perceptual intent
          const transform = lcms.cmsCreateTransform(
            srgbProfile,
            TYPE_RGB_8,
            cmykProfile,
            TYPE_CMYK_8,
            INTENT_PERCEPTUAL,
            0
          )
          if (!transform) {
            throw new Error(`Failed to create transform for ${profile.key}`)
          }
          transformsRef.current[profile.key] = transform
        }

        setIccReady(true)
      } catch (err) {
        console.error('ICC initialization error:', err)
        setIccError(err.message)
      }
    }

    initICC()
  }, [])

  // Parse input and get color value
  const getColorValue = useCallback(() => {
    try {
      if (inputType === 'hex') {
        const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexRegex.test(colorInput)) {
          return null
        }
        const hex = colorInput.startsWith('#') ? colorInput : `#${colorInput}`
        return { hex, rgb: null }
      } else {
        // RGB format: rgb(r, g, b) or r, g, b
        const rgbMatch = colorInput.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i)
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
  }, [colorInput, inputType])

  // Convert using colord library
  const convertWithColord = useCallback((colorValue) => {
    try {
      let color
      if (colorValue.hex) {
        color = colord(colorValue.hex)
      } else if (colorValue.rgb) {
        color = colord(colorValue.rgb)
      }

      if (!color.isValid()) {
        return null
      }

      const cmyk = color.toCmyk()
      return {
        c: Math.round(cmyk.c),
        m: Math.round(cmyk.m),
        y: Math.round(cmyk.y),
        k: Math.round(cmyk.k),
        hex: color.toHex(),
        rgb: color.toRgb()
      }
    } catch {
      return null
    }
  }, [])

  // Convert using color-convert library
  const convertWithColorConvert = useCallback((colorValue) => {
    try {
      let rgb
      if (colorValue.hex) {
        const hex = colorValue.hex.replace('#', '')
        rgb = convert.hex.rgb(hex)
      } else if (colorValue.rgb) {
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
        rgb: { r: rgb[0], g: rgb[1], b: rgb[2] }
      }
    } catch {
      return null
    }
  }, [])

  // Convert using color library (Qix-)
  const convertWithColor = useCallback((colorValue) => {
    try {
      let color
      if (colorValue.hex) {
        color = Color(colorValue.hex)
      } else if (colorValue.rgb) {
        color = Color.rgb(colorValue.rgb.r, colorValue.rgb.g, colorValue.rgb.b)
      }

      const cmyk = color.cmyk().array()
      const rgb = color.rgb().array()

      return {
        c: Math.round(cmyk[0]),
        m: Math.round(cmyk[1]),
        y: Math.round(cmyk[2]),
        k: Math.round(cmyk[3]),
        hex: color.hex().toLowerCase(),
        rgb: { r: Math.round(rgb[0]), g: Math.round(rgb[1]), b: Math.round(rgb[2]) }
      }
    } catch {
      return null
    }
  }, [])

  // Convert using chroma-js library
  const convertWithChroma = useCallback((colorValue) => {
    try {
      let color
      if (colorValue.hex) {
        color = chroma(colorValue.hex)
      } else if (colorValue.rgb) {
        color = chroma(colorValue.rgb.r, colorValue.rgb.g, colorValue.rgb.b)
      }

      const cmyk = color.cmyk()
      const rgb = color.rgb()

      return {
        c: Math.round(cmyk[0] * 100),
        m: Math.round(cmyk[1] * 100),
        y: Math.round(cmyk[2] * 100),
        k: Math.round(cmyk[3] * 100),
        hex: color.hex().toLowerCase(),
        rgb: { r: rgb[0], g: rgb[1], b: rgb[2] }
      }
    } catch {
      return null
    }
  }, [])

  // Convert using lcms-wasm with ICC profile (like Adobe Photoshop)
  const convertWithIccProfile = useCallback((colorValue, profileKey) => {
    const transform = transformsRef.current[profileKey]
    if (!iccReady || !lcmsRef.current || !transform) {
      return null
    }

    try {
      const lcms = lcmsRef.current

      // Get RGB values
      let r, g, b
      if (colorValue.hex) {
        const hex = colorValue.hex.replace('#', '')
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
      } else if (colorValue.rgb) {
        r = colorValue.rgb.r
        g = colorValue.rgb.g
        b = colorValue.rgb.b
      }

      // Perform ICC transform
      const input = new Uint8Array([r, g, b])
      const output = lcms.cmsDoTransform(transform, input, 1)

      // Convert from 0-255 to 0-100 percentage
      return {
        c: Math.round(output[0] / 255 * 100),
        m: Math.round(output[1] / 255 * 100),
        y: Math.round(output[2] / 255 * 100),
        k: Math.round(output[3] / 255 * 100),
        hex: colorValue.hex || `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
        rgb: { r, g, b }
      }
    } catch (err) {
      console.error('ICC conversion error:', err)
      return null
    }
  }, [iccReady])

  // Convert to all culori color spaces
  const convertWithCulori = useCallback((colorValue) => {
    try {
      // Build a culori-compatible color string
      let culoriInput
      if (colorValue.hex) {
        culoriInput = colorValue.hex
      } else if (colorValue.rgb) {
        culoriInput = `rgb(${colorValue.rgb.r}, ${colorValue.rgb.g}, ${colorValue.rgb.b})`
      }

      return COLOR_SPACES.map((space) => {
        try {
          const converted = space.convert(culoriInput)
          const formatted = space.format(converted)
          return { ...space, result: formatted }
        } catch {
          return { ...space, result: { values: ['-', '-', '-'], css: '' } }
        }
      })
    } catch {
      return null
    }
  }, [])

  const colorValue = getColorValue()
  const colordResult = colorValue ? convertWithColord(colorValue) : null
  const colorConvertResult = colorValue ? convertWithColorConvert(colorValue) : null
  const colorResult = colorValue ? convertWithColor(colorValue) : null
  const chromaResult = colorValue ? convertWithChroma(colorValue) : null
  const iccGenericResult = colorValue ? convertWithIccProfile(colorValue, 'generic') : null
  const iccPhotoshop4Result = colorValue ? convertWithIccProfile(colorValue, 'photoshop4') : null
  const iccPhotoshop5Result = colorValue ? convertWithIccProfile(colorValue, 'photoshop5') : null
  const culoriResults = colorValue ? convertWithCulori(colorValue) : null

  // Collect all results for comparison
  const mathResults = [colordResult, colorConvertResult, colorResult, chromaResult].filter(Boolean)
  const iccResults = [iccGenericResult, iccPhotoshop4Result, iccPhotoshop5Result].filter(Boolean)
  const allResults = [...mathResults, ...iccResults].filter(Boolean)

  // Check if all results are identical
  const allIdentical = allResults.length > 1 && allResults.every(r =>
    r.c === allResults[0].c &&
    r.m === allResults[0].m &&
    r.y === allResults[0].y &&
    r.k === allResults[0].k
  )

  // Count unique results
  const uniqueResults = new Set(allResults.map(r => `${r.c},${r.m},${r.y},${r.k}`)).size

  const handleInputChange = (e) => {
    setColorInput(e.target.value)
    setError('')
  }

  const handleTypeChange = (type) => {
    setInputType(type)
    // Reset input when switching types
    if (type === 'hex') {
      setColorInput('#3498db')
    } else {
      setColorInput('52, 152, 219')
    }
    setError('')
  }

  const previewColor = colordResult?.hex || '#ffffff'

  // CMYK Value component with progress bar
  const CmykValue = ({ label, value, type }) => (
    <div className={`cmyk-value ${type}`}>
      <span className="label">{label}</span>
      <span className="value">{value}<span className="percent">%</span></span>
      <div className="cmyk-bar">
        <div className="cmyk-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )

  // Result card component
  const ResultCard = ({ title, url, result, badge }) => (
    <div className="result-card">
      <div className="result-card-header">
        <h3>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
        <span className="library-badge">{badge}</span>
      </div>
      <div className="cmyk-values">
        <CmykValue label="C" value={result.c} type="cyan" />
        <CmykValue label="M" value={result.m} type="magenta" />
        <CmykValue label="Y" value={result.y} type="yellow" />
        <CmykValue label="K" value={result.k} type="key" />
      </div>
      <p className="cmyk-string">
        cmyk({result.c}%, {result.m}%, {result.y}%, {result.k}%)
      </p>
    </div>
  )

  // Color Space Card component for culori results
  const ColorSpaceCard = ({ space }) => (
    <div className="color-space-card">
      <div className="color-space-header">
        <h4>{space.name}</h4>
        <span className="color-space-badge">{space.id}</span>
      </div>
      <div className="color-space-channels">
        {space.labels.map((label, i) => (
          <div key={label} className="channel">
            <span className="channel-label">{label}</span>
            <span className="channel-value">{space.result.values[i]}</span>
          </div>
        ))}
      </div>
      {space.result.css && (
        <p className="color-space-css">{space.result.css}</p>
      )}
    </div>
  )

  return (
    <div className={`app${isVK ? ' app--vk' : ''}`}>
      <header className="header">
        <div className="header-top">
          <h1>{t.title.split('\n').map((line, i) => (
            <span key={i}>{i > 0 && <br />}{line}</span>
          ))}</h1>
          <div className="lang-switcher">
            <button
              className={`lang-button ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              className={`lang-button ${lang === 'ru' ? 'active' : ''}`}
              onClick={() => setLang('ru')}
            >
              RU
            </button>
          </div>
        </div>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <section className="input-section">
        <div className="input-type-selector">
          <button
            className={`type-button ${inputType === 'hex' ? 'active' : ''}`}
            onClick={() => handleTypeChange('hex')}
          >
            <span className="indicator" />
            HEX
          </button>
          <button
            className={`type-button ${inputType === 'rgb' ? 'active' : ''}`}
            onClick={() => handleTypeChange('rgb')}
          >
            <span className="indicator" />
            RGB
          </button>
        </div>

        <div className="color-input-group">
          <div className="color-input-wrapper">
            <input
              type="text"
              value={colorInput}
              onChange={handleInputChange}
              placeholder={inputType === 'hex' ? t.hexPlaceholder : t.rgbPlaceholder}
              className="color-input"
              spellCheck="false"
              autoComplete="off"
            />
            {inputType === 'hex' && (
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  value={colordResult?.hex || '#ffffff'}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="color-picker"
                />
              </div>
            )}
          </div>

          {!colorValue && colorInput && (
            <p className="error-message">
              {inputType === 'hex' ? t.invalidHex : t.invalidRgb}
            </p>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      </section>

      {colorValue && colordResult && (
        <div className="content-grid">
          <section className="preview-section">
            <div
              className="color-preview"
              style={{ backgroundColor: previewColor }}
            />
            <div className="preview-values">
              <p className="preview-hex">{colordResult.hex.toUpperCase()}</p>
              <p className="preview-rgb">
                RGB({colordResult.rgb.r}, {colordResult.rgb.g}, {colordResult.rgb.b})
              </p>
            </div>
          </section>

          <section className="results-section">
            <div className="results-grid">
              <ResultCard
                title="Colord"
                url="https://github.com/omgovich/colord"
                result={colordResult}
                badge="npm: colord"
              />

              {colorConvertResult && (
                <ResultCard
                  title="Color-Convert"
                  url="https://github.com/Qix-/color-convert"
                  result={colorConvertResult}
                  badge="npm: color-convert"
                />
              )}

              {colorResult && (
                <ResultCard
                  title="Color"
                  url="https://github.com/Qix-/color"
                  result={colorResult}
                  badge="npm: color"
                />
              )}

              {chromaResult && (
                <ResultCard
                  title="Chroma.js"
                  url="https://github.com/gka/chroma.js"
                  result={chromaResult}
                  badge="npm: chroma-js"
                />
              )}

              {/* ICC Profile-based conversions (like Adobe Photoshop) */}
              {iccGenericResult ? (
                <ResultCard
                  title="Generic CMYK"
                  url="https://www.littlecms.com/"
                  result={iccGenericResult}
                  badge="ICC Profile"
                />
              ) : (
                <div className="result-card result-card-loading">
                  <div className="result-card-header">
                    <h3>Generic CMYK</h3>
                    <span className="library-badge">
                      {iccError ? 'error' : 'loading...'}
                    </span>
                  </div>
                  <div className="icc-status">
                    {iccError ? (
                      <p className="icc-error">{iccError}</p>
                    ) : (
                      <p className="icc-loading">{t.loadingIcc}</p>
                    )}
                  </div>
                </div>
              )}

              {iccPhotoshop4Result ? (
                <ResultCard
                  title="Photoshop 4 CMYK"
                  url="https://www.color.org/registry/index.xalter"
                  result={iccPhotoshop4Result}
                  badge="ICC Profile"
                />
              ) : !iccError && (
                <div className="result-card result-card-loading">
                  <div className="result-card-header">
                    <h3>Photoshop 4 CMYK</h3>
                    <span className="library-badge">loading...</span>
                  </div>
                  <div className="icc-status">
                    <p className="icc-loading">{t.loadingIcc}</p>
                  </div>
                </div>
              )}

              {iccPhotoshop5Result ? (
                <ResultCard
                  title="Photoshop 5 CMYK"
                  url="https://www.color.org/registry/index.xalter"
                  result={iccPhotoshop5Result}
                  badge="ICC Profile"
                />
              ) : !iccError && (
                <div className="result-card result-card-loading">
                  <div className="result-card-header">
                    <h3>Photoshop 5 CMYK</h3>
                    <span className="library-badge">loading...</span>
                  </div>
                  <div className="icc-status">
                    <p className="icc-loading">{t.loadingIcc}</p>
                  </div>
                </div>
              )}
            </div>

            {allResults.length > 1 && (
              <div className="comparison">
                {allIdentical ? (
                  <p className="match">{t.allMatch(allResults.length)}</p>
                ) : (
                  <p className="diff">{t.uniqueResults(uniqueResults, allResults.length)}</p>
                )}
                {iccResults.length > 0 && (
                  <p className="icc-note">{t.iccNote}</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Extended Color Spaces via culori */}
      {colorValue && culoriResults && (
        <section className="color-spaces-section">
          <h2 className="color-spaces-title">{t.colorSpacesTitle}</h2>
          <p className="color-spaces-subtitle">{t.colorSpacesSubtitle}</p>
          <div className="color-spaces-grid">
            {culoriResults.map((space) => (
              <ColorSpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  )
}

export default App
