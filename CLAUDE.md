# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev` - Start Vite development server (localhost:5173 with HMR)
- `npm run build` - Create production build in `dist/`
- `npm run lint` - Run ESLint on all JS/JSX files
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to VK Mini Apps hosting (interactive, requires terminal)

## Tech Stack

- React 19 with Vite 7 (ES Modules, `"type": "module"`)
- CMYK conversion: colord (with CMYK plugin), color-convert, color, chroma-js
- Extended color spaces: culori (HSL, HSV, HWB, Lab, LCH, OKLab, OKLCH, XYZ D65, Linear RGB, Display P3)
- ICC profiles: lcms-wasm (WebAssembly port of Little CMS)
- VK Mini Apps: @vkontakte/vk-bridge, @vkontakte/vkui, @vkontakte/vk-miniapps-deploy (dev)
- ESLint 9 flat config with React Hooks and React Refresh plugins

## Architecture

VK Mini App for comparing color conversion results across multiple libraries and ICC profiles. Modular structure with separated concerns.

**`src/App.jsx`** — Main orchestration component (~177 lines), imports and wires together all modules.

**`src/i18n/index.js`** — EN/RU translations, exports `i18n` object and `defaultLang`.

**`src/config/`**
- `colorSpaces.js` — 10 culori color space configs with factory-pattern format functions
- `iccProfiles.js` — ICC profile metadata (key, path, title, url, badge)

**`src/hooks/`**
- `useVkBridge.js` — VK Bridge init and banner ad
- `useIccProfiles.js` — lcms-wasm init, ICC profile loading, `convertWithIcc(colorValue, profileKey)`
- `useColorInput.js` — Color input state management with memoized parsing

**`src/utils/`**
- `colorParsing.js` — `parseColorInput(input, type)`, `extractRgb(colorValue)`
- `cmykConverters.js` — 4 CMYK library converters + `CMYK_LIBRARIES` config array
- `markdownParser.jsx` — `parseMarkdownContent(content)` for **bold** text rendering

**`src/components/`**
- `CmykValue.jsx` — CMYK channel with progress bar
- `ResultCard.jsx` — Library result card with CMYK values
- `IccResultCard.jsx` — ICC result with loading/error states
- `ColorSpaceCard.jsx` — Color space conversion display
- `InfoSection.jsx` — Collapsible reference guide
- `InputSection.jsx` — Color input controls
- `LanguageSwitcher.jsx` — EN/RU toggle

**Styling:**
- `src/App.css` — Component styles (brutalist design)
- `src/index.css` — Global styles and CSS variables
- Responsive grid layout using CSS Grid auto-fit

**VK Hosting:**
- `vk-hosting-config.json` — Deploy config (app_id: 54434879, static_path: dist)
- `predeploy` script runs `npm run build` before deploy
- Vite `base: './'` ensures relative asset paths for VK CDN

## Validation Patterns

- HEX: `/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/` (in `src/utils/colorParsing.js`)
- RGB: `/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i`

## Notes

- No testing framework currently configured
- Single-page app with no routing
- State managed via React useState hooks and custom hooks
- ICC profiles stored in `public/profiles/` (GenericCMYK.icc, FOGRA39.icc, GRACoL2013_CRPC6.icc, SWOP2013C3_CRPC5.icc)
