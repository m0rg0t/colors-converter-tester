// Translations for EN and RU languages
export const i18n = {
  en: {
    title: 'Color\nConverter',
    subtitle: 'HEX / RGB → CMYK + 10 Color Spaces // Multi-library comparison',
    inputLabel: 'INPUT',
    previewLabel: 'PREVIEW',
    cmykOutputLabel: 'CMYK OUTPUT',
    hexPlaceholder: '#RRGGBB',
    rgbPlaceholder: 'R, G, B',
    invalidHex: 'Invalid HEX // Expected: #RRGGBB or RRGGBB',
    invalidRgb: 'Invalid RGB // Expected: R, G, B (0-255)',
    loadingIcc: 'Loading ICC profiles...',
    allMatch: (n) => `All ${n} libraries produce identical results`,
    uniqueResults: (u, n) => `${u} unique results among ${n} libraries`,
    iccNote: 'ICC Profiles use industry-standard profiles for professional print workflows',
    genericDesc: 'Generic device profile (baseline)',
    fogra39Desc: 'European coated paper (ISO 12647-2)',
    gracolDesc: 'North American commercial printing',
    swopDesc: 'North American web offset printing',
    colorSpacesTitle: 'Color Spaces',
    colorSpacesSubtitle: '10 color space conversions via culori',
    footer: 'Built for testing color conversion accuracy',
    infoTitle: 'Reference Guide',
    infoToggle: 'Why do results differ?',
    infoColorSpaces: {
      title: 'Color Spaces',
      content: `Different color spaces represent colors using different mathematical models:
• **RGB** — additive model for screens (red + green + blue light)
• **CMYK** — subtractive model for print (cyan, magenta, yellow, black inks)
• **HSL/HSV** — human-friendly: Hue (color), Saturation, Lightness/Value
• **Lab** — perceptually uniform, device-independent (CIE 1976)
• **OKLab/OKLCH** — modern perceptual spaces with better uniformity
• **XYZ** — CIE 1931 reference space, basis for all others`,
    },
    infoWhyDifferent: {
      title: 'Why CMYK Results Differ',
      content: `RGB→CMYK conversion is not a simple formula — it depends on:
• **Ink behavior** — how inks mix and absorb light on paper
• **Paper type** — coated vs uncoated, white point, absorption
• **Printing method** — offset, digital, flexo, gravure
• **Black generation** — how much K (black) to use vs CMY mix

Mathematical libraries (colord, chroma.js) use a simplified formula. ICC profiles contain measured data from real printing conditions.`,
    },
    infoProfiles: {
      title: 'ICC Profiles Explained',
      content: `• **Generic CMYK** — basic device profile, no specific print condition
• **FOGRA39** — European standard for coated paper (ISO 12647-2), widely used in EU
• **GRACoL 2013** — US commercial printing on premium coated paper
• **SWOP 2013** — US web offset printing (magazines, catalogs)

Choose profile matching your print vendor's specification. When in doubt, ask your printer!`,
    },
    infoTip: 'Tip: For web/screen use, RGB values are definitive. CMYK values only matter when preparing files for professional print.',
  },
  ru: {
    title: 'Конвертер\nЦветов',
    subtitle: 'HEX / RGB → CMYK + 10 цветовых пространств // Сравнение библиотек',
    inputLabel: 'ВВОД',
    previewLabel: 'ПРЕДПРОСМОТР',
    cmykOutputLabel: 'CMYK РЕЗУЛЬТАТ',
    hexPlaceholder: '#RRGGBB',
    rgbPlaceholder: 'R, G, B',
    invalidHex: 'Неверный HEX // Ожидается: #RRGGBB или RRGGBB',
    invalidRgb: 'Неверный RGB // Ожидается: R, G, B (0-255)',
    loadingIcc: 'Загрузка ICC профилей...',
    allMatch: (n) => `Все ${n} библиотек дают одинаковый результат`,
    uniqueResults: (u, n) => `${u} уникальных результатов из ${n} библиотек`,
    iccNote: 'ICC профили используют отраслевые стандарты для профессиональной печати',
    genericDesc: 'Базовый профиль устройства',
    fogra39Desc: 'Европейская мелованная бумага (ISO 12647-2)',
    gracolDesc: 'Коммерческая печать (Сев. Америка)',
    swopDesc: 'Рулонная офсетная печать (Сев. Америка)',
    colorSpacesTitle: 'Цветовые пространства',
    colorSpacesSubtitle: '10 преобразований цветовых пространств через culori',
    footer: 'Создано для проверки точности конвертации цветов',
    infoTitle: 'Справка',
    infoToggle: 'Почему результаты отличаются?',
    infoColorSpaces: {
      title: 'Цветовые пространства',
      content: `Разные цветовые пространства описывают цвета разными математическими моделями:
• **RGB** — аддитивная модель для экранов (красный + зелёный + синий свет)
• **CMYK** — субтрактивная модель для печати (голубой, пурпурный, жёлтый, чёрный)
• **HSL/HSV** — интуитивные: Оттенок, Насыщенность, Светлота/Яркость
• **Lab** — перцептуально равномерное, аппаратно-независимое (CIE 1976)
• **OKLab/OKLCH** — современные перцептуальные пространства с лучшей равномерностью
• **XYZ** — эталонное пространство CIE 1931, основа для всех остальных`,
    },
    infoWhyDifferent: {
      title: 'Почему CMYK результаты отличаются',
      content: `Конвертация RGB→CMYK — это не простая формула, она зависит от:
• **Поведения красок** — как краски смешиваются и поглощают свет на бумаге
• **Типа бумаги** — мелованная/немелованная, белизна, впитываемость
• **Способа печати** — офсет, цифра, флексо, глубокая печать
• **Генерации чёрного** — сколько K (чёрного) использовать вместо смеси CMY

Математические библиотеки (colord, chroma.js) используют упрощённую формулу. ICC профили содержат измеренные данные реальных условий печати.`,
    },
    infoProfiles: {
      title: 'ICC профили',
      content: `• **Generic CMYK** — базовый профиль, без привязки к условиям печати
• **FOGRA39** — европейский стандарт для мелованной бумаги (ISO 12647-2)
• **GRACoL 2013** — коммерческая печать США на мелованной бумаге премиум
• **SWOP 2013** — рулонная офсетная печать США (журналы, каталоги)

Выбирайте профиль, соответствующий спецификации вашей типографии. Если не уверены — спросите у печатника!`,
    },
    infoTip: 'Совет: Для веба/экрана RGB значения — это истина. CMYK важен только при подготовке файлов для профессиональной печати.',
  },
}

export const defaultLang = 'ru'
