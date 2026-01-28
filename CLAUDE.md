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

VK Mini App (single-component React app) for comparing color conversion results across multiple libraries and ICC profiles.

**Core logic in `src/App.jsx`:**
- `getColorValue(input, type)` - Validates and parses HEX/RGB input
- `convertWithColord(colorValue)` - CMYK conversion using colord
- `convertWithColorConvert(colorValue)` - CMYK conversion using color-convert
- `convertWithColor(colorValue)` - CMYK conversion using color
- `convertWithChroma(colorValue)` - CMYK conversion using chroma-js
- `convertWithICC(colorValue)` - CMYK conversion via lcms-wasm with 3 ICC profiles
- `convertWithCulori(colorValue)` - 10 color space conversions via culori
- State: `colorInput`, `inputType` ("hex"/"rgb"), `error`, `lang` ("en"/"ru")
- i18n object with `en` and `ru` translations; language detected via VK Bridge
- VK Bridge initialized on mount (`bridge.send('VKWebAppInit')`)

**Styling:**
- `src/App.css` - Component styles (brutalist design)
- `src/index.css` - Global styles and CSS variables
- Responsive grid layout using CSS Grid auto-fit

**VK Hosting:**
- `vk-hosting-config.json` - Deploy config (app_id: 54434879, static_path: dist)
- `predeploy` script runs `npm run build` before deploy
- Vite `base: './'` ensures relative asset paths for VK CDN

## Validation Patterns

- HEX: `/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/`
- RGB: `/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i`

## Notes

- No testing framework currently configured
- Single-page app with no routing
- All state managed via React useState hooks
- ICC profiles stored in `public/profiles/` (GenericCMYK.icc, Photoshop4DefaultCMYK.icc, Photoshop5DefaultCMYK.icc)
