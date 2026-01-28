import { useState, useMemo } from 'react'
import { i18n, defaultLang } from './i18n'
import { COLOR_SPACES } from './config/colorSpaces'
import { ICC_PROFILES } from './config/iccProfiles'
import { useVkBridge } from './hooks/useVkBridge'
import { useIccProfiles } from './hooks/useIccProfiles'
import { useColorInput } from './hooks/useColorInput'
import { CMYK_LIBRARIES } from './utils/cmykConverters'
import { InputSection } from './components/InputSection'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { ResultCard } from './components/ResultCard'
import { IccResultCard } from './components/IccResultCard'
import { ColorSpaceCard } from './components/ColorSpaceCard'
import { InfoSection } from './components/InfoSection'
import './App.css'

function App() {
  const [lang, setLang] = useState(defaultLang)
  const t = i18n[lang]

  const { isVK } = useVkBridge()
  const { iccError, convertWithIcc } = useIccProfiles()
  const {
    colorInput,
    inputType,
    colorValue,
    setColorInput,
    handleInputChange,
    handleTypeChange,
  } = useColorInput()

  // Compute all CMYK library results
  const cmykResults = useMemo(() => {
    if (!colorValue) return []
    return CMYK_LIBRARIES.map((lib) => ({
      ...lib,
      result: lib.convert(colorValue),
    }))
  }, [colorValue])

  // First CMYK result (colord) is used for preview
  const primaryResult = cmykResults[0]?.result

  // Compute ICC profile results
  const iccResults = useMemo(() => {
    if (!colorValue) return []
    return ICC_PROFILES.map((profile) => ({
      ...profile,
      result: convertWithIcc(colorValue, profile.key),
    }))
  }, [colorValue, convertWithIcc])

  // Compute culori color space conversions
  const culoriResults = useMemo(() => {
    if (!colorValue) return null
    const input = colorValue.hex || `rgb(${colorValue.rgb.r}, ${colorValue.rgb.g}, ${colorValue.rgb.b})`
    return COLOR_SPACES.map((space) => {
      try {
        const converted = space.convert(input)
        return { ...space, result: space.format(converted) }
      } catch {
        return { ...space, result: { values: ['-', '-', '-'], css: '' } }
      }
    })
  }, [colorValue])

  // Comparison statistics
  const { allResults, allIdentical, uniqueCount, hasIccResults } = useMemo(() => {
    const mathResults = cmykResults.map((r) => r.result).filter(Boolean)
    const iccVals = iccResults.map((r) => r.result).filter(Boolean)
    const all = [...mathResults, ...iccVals]
    const identical =
      all.length > 1 && all.every((r) => r.c === all[0].c && r.m === all[0].m && r.y === all[0].y && r.k === all[0].k)
    const unique = new Set(all.map((r) => `${r.c},${r.m},${r.y},${r.k}`)).size
    return { allResults: all, allIdentical: identical, uniqueCount: unique, hasIccResults: iccVals.length > 0 }
  }, [cmykResults, iccResults])

  const previewColor = primaryResult?.hex || '#ffffff'

  return (
    <div className={`app${isVK ? ' app--vk' : ''}`}>
      <header className="header">
        <div className="header-top">
          <h1>
            {t.title.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <LanguageSwitcher lang={lang} onLangChange={setLang} />
        </div>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <InputSection
        colorInput={colorInput}
        inputType={inputType}
        colorValue={colorValue}
        previewHex={previewColor}
        t={t}
        onInputChange={handleInputChange}
        onTypeChange={handleTypeChange}
        onColorInput={setColorInput}
      />

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

      {colorValue && primaryResult && (
        <div className="content-grid">
          <section className="preview-section">
            <div className="color-preview" style={{ backgroundColor: previewColor }} />
            <div className="preview-values">
              <p className="preview-hex">{primaryResult.hex.toUpperCase()}</p>
              <p className="preview-rgb">
                RGB({primaryResult.rgb.r}, {primaryResult.rgb.g}, {primaryResult.rgb.b})
              </p>
            </div>
          </section>

          <section className="results-section">
            <div className="results-grid">
              {cmykResults.map(
                (lib) =>
                  lib.result && (
                    <ResultCard key={lib.id} title={lib.title} url={lib.url} result={lib.result} badge={lib.badge} />
                  )
              )}

              {iccResults.map((profile) => (
                <IccResultCard
                  key={profile.key}
                  profile={profile}
                  result={profile.result}
                  iccError={iccError}
                  loadingText={t.loadingIcc}
                />
              ))}
            </div>

            {allResults.length > 1 && (
              <div className="comparison">
                {allIdentical ? (
                  <p className="match">{t.allMatch(allResults.length)}</p>
                ) : (
                  <p className="diff">{t.uniqueResults(uniqueCount, allResults.length)}</p>
                )}
                {hasIccResults && <p className="icc-note">{t.iccNote}</p>}
              </div>
            )}
          </section>
        </div>
      )}

      <InfoSection t={t} />

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  )
}

export default App
