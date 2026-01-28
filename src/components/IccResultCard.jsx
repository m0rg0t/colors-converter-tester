import { ResultCard } from './ResultCard'

/**
 * ICC profile result card with loading/error states
 */
export function IccResultCard({ profile, result, iccError, loadingText }) {
  // If we have a result, show the regular result card
  if (result) {
    return (
      <ResultCard
        title={profile.title}
        url={profile.url}
        result={result}
        badge={profile.badge}
      />
    )
  }

  // Don't show loading state for non-generic profiles if there's an error
  if (iccError && profile.key !== 'generic') {
    return null
  }

  // Show loading/error state
  return (
    <div className="result-card result-card-loading">
      <div className="result-card-header">
        <h3>{profile.title}</h3>
        <span className="library-badge">{iccError ? 'error' : 'loading...'}</span>
      </div>
      <div className="icc-status">
        {iccError ? (
          <p className="icc-error">{iccError}</p>
        ) : (
          <p className="icc-loading">{loadingText}</p>
        )}
      </div>
    </div>
  )
}
