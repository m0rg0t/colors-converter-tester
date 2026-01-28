/**
 * Color input controls with type selector and color picker
 */
export function InputSection({
  colorInput,
  inputType,
  colorValue,
  previewHex,
  t,
  onInputChange,
  onTypeChange,
  onColorInput,
}) {
  return (
    <section className="input-section">
      <div className="input-type-selector">
        <button
          className={`type-button ${inputType === 'hex' ? 'active' : ''}`}
          onClick={() => onTypeChange('hex')}
        >
          <span className="indicator" />
          HEX
        </button>
        <button
          className={`type-button ${inputType === 'rgb' ? 'active' : ''}`}
          onClick={() => onTypeChange('rgb')}
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
            onChange={onInputChange}
            placeholder={inputType === 'hex' ? t.hexPlaceholder : t.rgbPlaceholder}
            className="color-input"
            spellCheck="false"
            autoComplete="off"
          />
          {inputType === 'hex' && (
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={previewHex}
                onChange={(e) => onColorInput(e.target.value)}
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
      </div>
    </section>
  )
}
