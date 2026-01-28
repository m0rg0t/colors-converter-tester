/**
 * CMYK channel display with progress bar
 */
export function CmykValue({ label, value, type }) {
  return (
    <div className={`cmyk-value ${type}`}>
      <span className="label">{label}</span>
      <span className="value">
        {value}
        <span className="percent">%</span>
      </span>
      <div className="cmyk-bar">
        <div className="cmyk-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
