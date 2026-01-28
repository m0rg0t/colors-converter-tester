import { useState } from 'react'
import { parseMarkdownContent } from '../utils/markdownParser'

/**
 * Collapsible info/reference section
 */
export function InfoSection({ t }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <section className="info-section">
      <button
        className={`info-toggle ${showInfo ? 'active' : ''}`}
        onClick={() => setShowInfo(!showInfo)}
      >
        <span className="info-toggle-icon">{showInfo ? '−' : '+'}</span>
        {t.infoToggle}
      </button>

      {showInfo && (
        <div className="info-content">
          <div className="info-block">
            <h3>{t.infoColorSpaces.title}</h3>
            <p>{parseMarkdownContent(t.infoColorSpaces.content)}</p>
          </div>

          <div className="info-block">
            <h3>{t.infoWhyDifferent.title}</h3>
            <p>{parseMarkdownContent(t.infoWhyDifferent.content)}</p>
          </div>

          <div className="info-block">
            <h3>{t.infoProfiles.title}</h3>
            <p>{parseMarkdownContent(t.infoProfiles.content)}</p>
          </div>

          <p className="info-tip">{t.infoTip}</p>
        </div>
      )}
    </section>
  )
}
