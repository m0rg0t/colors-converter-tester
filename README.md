# Colors Converter Tester

Comparison tool for RGB-to-CMYK color conversion across JavaScript libraries and ICC profiles, with extended color space support.

## About

Colors Converter Tester is a VK Mini App designed for developers and designers who need to understand the differences between color conversion methods. The application takes a color in HEX or RGB format and simultaneously converts it using four JavaScript libraries (colord, color-convert, color, chroma-js), three ICC profiles (Generic CMYK, Photoshop 4 Default, Photoshop 5 Default), and renders the result in ten additional color spaces (HSL, HSV, HWB, Lab, LCH, OKLab, OKLCH, XYZ D65, Linear RGB, Display P3) via the culori library.

The core problem the tool addresses is that there is no single correct way to convert RGB to CMYK. Mathematical formulas, device-independent profiles, and device-specific profiles all produce different values for the same input color. This application puts those results side by side so you can evaluate which method suits your workflow, whether that is web design, prepress preparation, or color science research.

The interface supports Russian and English, detects the user language automatically via VK Bridge, and runs entirely in the browser with no server-side processing. ICC profile transforms are handled by lcms-wasm, a WebAssembly port of the Little CMS engine used in GIMP, Firefox, and professional printing software.

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Create production build in `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to VK hosting |

## Tech Stack

- React 19, Vite 7
- colord, color-convert, color, chroma-js -- CMYK conversion
- culori -- extended color spaces
- lcms-wasm -- ICC profile support (WebAssembly)
- VK Bridge, VKUI -- VK Mini Apps platform integration

## App Icon Generation Prompts

Prompts for generating a square application icon in a minimalist style: a flat single-color symbol on a soft gradient background.

### English

```
A square app icon, minimalist flat design. A single solid-color glyph in the center: an abstract
color wheel made of four overlapping quarter-circles representing CMYK channels (cyan, magenta,
yellow, black). The glyph is white. The background is a smooth vertical linear gradient from
#3A1C71 (deep violet) at the top to #D76D77 (muted rose) at the bottom. No text, no outlines,
no shadows, no extra decoration. Perfectly centered composition. Suitable for a 512x512 px
app store icon. Clean vector look.
```

### Russian

```
Квадратная иконка приложения, минималистичный плоский дизайн. В центре -- одноцветный
символ: абстрактное цветовое колесо из четырёх пересекающихся четвертей окружности,
представляющих каналы CMYK (циан, маджента, жёлтый, чёрный). Символ белого цвета. Фон --
плавный вертикальный линейный градиент от #3A1C71 (глубокий фиолетовый) сверху до #D76D77
(приглушённый розовый) снизу. Без текста, без обводок, без теней, без лишних деталей. Строго
по центру. Подходит для иконки 512x512 px. Чистый векторный стиль.
```

## License

MIT
