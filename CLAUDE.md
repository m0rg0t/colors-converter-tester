# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev` - Start Vite development server (localhost:5173 with HMR)
- `npm run build` - Create production build in `dist/`
- `npm run lint` - Run ESLint on all JS/JSX files
- `npm run preview` - Preview production build locally

## Tech Stack

- React 19 with Vite 7
- Color libraries: colord (with CMYK plugin), color-convert
- ESLint 9 flat config with React Hooks and React Refresh plugins
- ES Modules (`"type": "module"`)

## Architecture

This is a single-component React app for comparing color conversion results between two libraries (colord and color-convert).

**Core logic in `src/App.jsx`:**
- `getColorValue(input, type)` - Validates and parses HEX/RGB input
- `convertWithColord(colorValue)` - CMYK conversion using colord library
- `convertWithColorConvert(colorValue)` - CMYK conversion using color-convert library
- State: `colorInput`, `inputType` ("hex"/"rgb"), `error`
- Real-time validation with regex patterns for HEX and RGB formats

**Styling:**
- `src/App.css` - Component styles with dark mode support via `prefers-color-scheme`
- `src/index.css` - Global styles and CSS variables
- Responsive grid layout using CSS Grid auto-fit

## Validation Patterns

- HEX: `/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/`
- RGB: `/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i`

## Notes

- No testing framework currently configured
- Single-page app with no routing
- All state managed via React useState hooks
