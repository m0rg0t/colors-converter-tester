# Colors Converter Tester

A developer tool for comparing RGB to CMYK color conversion results across different JavaScript libraries and ICC profiles.

**[Live Demo](https://colors-converter-tester.vercel.app/)**

## The Problem

Converting colors from RGB to CMYK is not as straightforward as it seems. Here's why:

- **RGB and CMYK are fundamentally different color spaces.** RGB is additive (light-based, used for screens), while CMYK is subtractive (ink-based, used for printing).
- **There's no single "correct" conversion.** Mathematical formulas give different results than device-specific profiles.
- **Professional applications use ICC profiles.** Adobe Photoshop doesn't use simple math—it uses ICC color profiles that account for specific printing conditions.
- **JavaScript libraries vary in their approach.** Each library implements its own conversion algorithm, producing different CMYK values for the same input color.

This tool lets you see these differences side-by-side, helping you understand which conversion method best fits your needs.

## Features

- **4 JavaScript libraries compared**: colord, color-convert, color, chroma-js
- **3 ICC profiles**: Generic CMYK, Photoshop 4, Photoshop 5
- **Real-time conversion** as you type
- **Visual comparison** with CMYK value bars
- **Support for HEX and RGB input formats**
- **Shows when results match or differ** across all methods

## Why These Technical Decisions?

### Why Multiple Color Libraries?

Each library uses a different approach to RGB→CMYK conversion:

| Library | Approach | Why It's Different |
|---------|----------|-------------------|
| [colord](https://github.com/omgovich/colord) | Plugin-based with CMYK extension | Modern API, tree-shakeable |
| [color-convert](https://github.com/Qix-/color-convert) | Pure mathematical formulas | Lightweight, no dependencies |
| [color](https://github.com/Qix-/color) | Full-featured color manipulation | Comprehensive color operations |
| [chroma-js](https://github.com/gka/chroma.js) | Returns CMYK as 0-1 decimals | Designed for color scales and gradients |

**Key insight:** The same hex color `#FF5733` will produce different CMYK values in each library because they use different mathematical formulas. None is "wrong"—they're just different approaches.

### Why ICC Profiles?

**ICC (International Color Consortium) profiles** are the industry standard for professional color management. They define how colors should be transformed for specific devices.

**Why this matters:**
- Mathematical conversion ignores real-world printing behavior
- ICC profiles encode device-specific color characteristics
- Photoshop uses ICC profiles for all CMYK conversions

**Profiles included:**

| Profile | Description |
|---------|-------------|
| Generic CMYK | Device-agnostic standard profile |
| Photoshop 4 Default CMYK | Legacy Adobe standard (pre-2000) |
| Photoshop 5 Default CMYK | Modern Adobe standard |

**The difference is significant:** An ICC profile conversion might give you `C:0 M:65 Y:80 K:0` while a mathematical conversion gives `C:0 M:66 Y:80 K:0` for the same color. For professional printing, the ICC result is what will actually appear on paper.

### Why lcms-wasm?

[Little CMS](https://www.littlecms.com/) is the industry-standard open-source color management engine used by:
- GIMP
- Firefox
- Scribus
- Many professional printing applications

**[lcms-wasm](https://nicolo-ribaudo.github.io/nicolo-ribaudo/lcms-wasm/)** is a WebAssembly port that brings this professional-grade engine to the browser.

**Implementation details:**
- Uses **perceptual rendering intent** (`INTENT_PERCEPTUAL`) for visually accurate conversions
- Loads ICC profiles asynchronously via fetch
- Creates sRGB→CMYK transforms using the profile data
- Converts 8-bit RGB (0-255) to percentage CMYK (0-100%)

### Why React + Vite?

- **Vite** provides instant HMR (Hot Module Replacement) during development
- **React 19** with hooks for simple state management
- **Single-component architecture** keeps all logic in one place for easy debugging
- **No routing needed**—this is a focused utility, not a multi-page app

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Create production build in `dist/` |
| `npm run lint` | Run ESLint on all JS/JSX files |
| `npm run preview` | Preview production build locally |

## Project Structure

```
colors-converter-tester/
├── src/
│   ├── App.jsx          # Main component with all conversion logic
│   ├── App.css          # Component styles (brutalist design)
│   └── index.css        # Global styles and CSS variables
├── public/
│   └── profiles/        # ICC profile files
│       ├── GenericCMYK.icc
│       ├── Photoshop4DefaultCMYK.icc
│       └── Photoshop5DefaultCMYK.icc
├── package.json
├── vite.config.js
└── eslint.config.js
```

## Tech Stack

- **[React 19](https://react.dev/)** — UI framework
- **[Vite 7](https://vite.dev/)** — Build tool and dev server
- **[colord](https://github.com/omgovich/colord)** — Color manipulation with CMYK plugin
- **[color-convert](https://github.com/Qix-/color-convert)** — Color space conversions
- **[color](https://github.com/Qix-/color)** — Color manipulation library
- **[chroma-js](https://github.com/gka/chroma.js)** — Color scales and manipulation
- **[lcms-wasm](https://nicolo-ribaudo.github.io/lcms-wasm/)** — Professional ICC profile support

## How It Works

1. **Input** — User enters a color in HEX (`#FF5733`) or RGB (`255, 87, 51`) format
2. **Validate** — Input is validated against regex patterns
3. **Convert (Libraries)** — Color is converted to CMYK using 4 different JS libraries
4. **Convert (ICC)** — Color is converted using 3 ICC profiles via lcms-wasm
5. **Compare** — Results are displayed side-by-side with visual indicators
6. **Analyze** — App shows if all results match or how many unique results exist

## Input Validation

The app accepts two input formats:

- **HEX**: `#FF5733`, `FF5733`, `#F53`, `F53`
- **RGB**: `255, 87, 51`, `rgb(255, 87, 51)`, `255 87 51`

## License

MIT
