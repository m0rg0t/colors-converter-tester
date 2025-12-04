import { useState, useCallback } from 'react'
import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import convert from 'color-convert'
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

  const colorValue = getColorValue()
  const colordResult = colorValue ? convertWithColord(colorValue) : null
  const colorConvertResult = colorValue ? convertWithColorConvert(colorValue) : null

  const handleInputChange = (e) => {
    setColorInput(e.target.value)
    setError('')
  }

  const handleTypeChange = (e) => {
    setInputType(e.target.value)
    // Reset input when switching types
    if (e.target.value === 'hex') {
      setColorInput('#3498db')
    } else {
      setColorInput('52, 152, 219')
    }
    setError('')
  }

  const previewColor = colordResult?.hex || '#ffffff'

  return (
    <div className="app">
      <h1>Color Converter</h1>
      <p className="subtitle">Convert HEX/RGB colors to CMYK using different libraries</p>
      
      <div className="input-section">
        <div className="input-type-selector">
          <label>
            <input
              type="radio"
              value="hex"
              checked={inputType === 'hex'}
              onChange={handleTypeChange}
            />
            HEX
          </label>
          <label>
            <input
              type="radio"
              value="rgb"
              checked={inputType === 'rgb'}
              onChange={handleTypeChange}
            />
            RGB
          </label>
        </div>

        <div className="color-input-wrapper">
          <input
            type="text"
            value={colorInput}
            onChange={handleInputChange}
            placeholder={inputType === 'hex' ? '#RRGGBB' : 'R, G, B'}
            className="color-input"
          />
          {inputType === 'hex' && (
            <input
              type="color"
              value={colordResult?.hex || '#ffffff'}
              onChange={(e) => setColorInput(e.target.value)}
              className="color-picker"
            />
          )}
        </div>

        {error && <p className="error">{error}</p>}
        {!colorValue && colorInput && (
          <p className="error">
            {inputType === 'hex' 
              ? 'Invalid HEX format. Use #RRGGBB or RRGGBB' 
              : 'Invalid RGB format. Use R, G, B (0-255)'}
          </p>
        )}
      </div>

      {colorValue && colordResult && (
        <>
          <div className="preview-section">
            <h2>Color Preview</h2>
            <div 
              className="color-preview" 
              style={{ backgroundColor: previewColor }}
            />
            <p className="preview-hex">{colordResult.hex.toUpperCase()}</p>
            <p className="preview-rgb">
              RGB({colordResult.rgb.r}, {colordResult.rgb.g}, {colordResult.rgb.b})
            </p>
          </div>

          <div className="results-section">
            <h2>CMYK Conversion Results</h2>
            
            <div className="results-grid">
              <div className="result-card">
                <h3>
                  <a href="https://github.com/omgovich/colord" target="_blank" rel="noopener noreferrer">
                    colord
                  </a>
                </h3>
                <div className="cmyk-values">
                  <div className="cmyk-value">
                    <span className="label">C</span>
                    <span className="value">{colordResult.c}%</span>
                  </div>
                  <div className="cmyk-value">
                    <span className="label">M</span>
                    <span className="value">{colordResult.m}%</span>
                  </div>
                  <div className="cmyk-value">
                    <span className="label">Y</span>
                    <span className="value">{colordResult.y}%</span>
                  </div>
                  <div className="cmyk-value">
                    <span className="label">K</span>
                    <span className="value">{colordResult.k}%</span>
                  </div>
                </div>
                <p className="cmyk-string">
                  cmyk({colordResult.c}%, {colordResult.m}%, {colordResult.y}%, {colordResult.k}%)
                </p>
              </div>

              <div className="result-card">
                <h3>
                  <a href="https://www.npmjs.com/package/color-convert" target="_blank" rel="noopener noreferrer">
                    color-convert
                  </a>
                </h3>
                {colorConvertResult && (
                  <>
                    <div className="cmyk-values">
                      <div className="cmyk-value">
                        <span className="label">C</span>
                        <span className="value">{colorConvertResult.c}%</span>
                      </div>
                      <div className="cmyk-value">
                        <span className="label">M</span>
                        <span className="value">{colorConvertResult.m}%</span>
                      </div>
                      <div className="cmyk-value">
                        <span className="label">Y</span>
                        <span className="value">{colorConvertResult.y}%</span>
                      </div>
                      <div className="cmyk-value">
                        <span className="label">K</span>
                        <span className="value">{colorConvertResult.k}%</span>
                      </div>
                    </div>
                    <p className="cmyk-string">
                      cmyk({colorConvertResult.c}%, {colorConvertResult.m}%, {colorConvertResult.y}%, {colorConvertResult.k}%)
                    </p>
                  </>
                )}
              </div>
            </div>

            {colordResult && colorConvertResult && (
              <div className="comparison">
                {colordResult.c === colorConvertResult.c &&
                 colordResult.m === colorConvertResult.m &&
                 colordResult.y === colorConvertResult.y &&
                 colordResult.k === colorConvertResult.k ? (
                  <p className="match">✓ Both libraries produce identical results</p>
                ) : (
                  <p className="diff">⚠ Libraries produce different results (due to rounding differences)</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
