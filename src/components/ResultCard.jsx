import { CmykValue } from './CmykValue'

/**
 * Library result card with CMYK values
 */
export function ResultCard({ title, url, result, badge }) {
  return (
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
}
