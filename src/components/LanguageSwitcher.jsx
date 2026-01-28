/**
 * EN/RU language toggle buttons
 */
export function LanguageSwitcher({ lang, onLangChange }) {
  return (
    <div className="lang-switcher">
      <button
        className={`lang-button ${lang === 'en' ? 'active' : ''}`}
        onClick={() => onLangChange('en')}
      >
        EN
      </button>
      <button
        className={`lang-button ${lang === 'ru' ? 'active' : ''}`}
        onClick={() => onLangChange('ru')}
      >
        RU
      </button>
    </div>
  )
}
