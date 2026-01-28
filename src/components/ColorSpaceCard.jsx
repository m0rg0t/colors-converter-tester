/**
 * Color space conversion display card
 */
export function ColorSpaceCard({ space }) {
  return (
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
      {space.result.css && <p className="color-space-css">{space.result.css}</p>}
    </div>
  )
}
