import { useState, useCallback } from 'react'
import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import convert from 'color-convert'
import Color from 'color'
import chroma from 'chroma-js'
import './App.css'

// Extend colord with CMYK support
extend([cmykPlugin])

function App() {
  const [colorInput, setColorInput] = useState('#3498db')
  const [inputType, setInputType] = useState('hex')
  const [error, setError] = useState('')

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

  const colorValue = getColorValue()
  const colordResult = colorValue ? convertWithColord(colorValue) : null
  const colorConvertResult = colorValue ? convertWithColorConvert(colorValue) : null
  const colorResult = colorValue ? convertWithColor(colorValue) : null
  const chromaResult = colorValue ? convertWithChroma(colorValue) : null

  // Collect all results for comparison
  const allResults = [colordResult, colorConvertResult, colorResult, chromaResult].filter(Boolean)

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

  return (
    <div className="app">
      <header className="header">
        <h1>Color<br />Converter</h1>
        <p className="subtitle">HEX / RGB → CMYK // 4-Library comparison tool</p>
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
              placeholder={inputType === 'hex' ? '#RRGGBB' : 'R, G, B'}
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
              {inputType === 'hex'
                ? 'Invalid HEX // Expected: #RRGGBB or RRGGBB'
                : 'Invalid RGB // Expected: R, G, B (0-255)'}
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
            </div>

            {allResults.length > 1 && (
              <div className="comparison">
                {allIdentical ? (
                  <p className="match">All {allResults.length} libraries produce identical results</p>
                ) : (
                  <p className="diff">{uniqueResults} unique results — rounding variance detected</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <footer className="footer">
        <p>Built for testing color conversion accuracy</p>
      </footer>
    </div>
  )
}

export default App
