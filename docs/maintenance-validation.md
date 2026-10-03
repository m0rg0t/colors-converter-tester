# Maintenance verification (October 2026)

## Reproduced fixes

The parser accepted three-digit HEX, but ICC extraction sliced it as six digits:
`#fff` became `(255, 15, NaN)` and Uint8Array silently coerced the missing channel.
Twelve regression cases failed before normalization was fixed. Supported HEX now
normalizes to six lowercase digits; RGB requires balanced optional parentheses and
integer channels 0–255. Invalid objects cannot be coerced into ICC input bytes.

ICC loading now owns all native handles. Input/output profiles close after transform
creation; transforms are deleted on unmount, cancellation or partial initialization
failure. Late Wasm/profile requests cannot publish stale resources after unmount.
Tests also cover asynchronous VK initialization failure, which previously escaped
its synchronous try/catch. Standalone color conversion remains usable.

## Dependencies and compatibility

React 19.3 / Bridge 3.0.2 / VKUI 8.4.1 / Vite 8.3.2 / ESLint 10 / Colord 2.10.
Chroma 3.2, Color 5.0.3, color-convert 3.1.3, Culori 4.0.2 and lcms-wasm 1.0.5 are
already the registry's current stable releases. Their versions are retained.
Node 24 LTS development and Node 22/24 CI; current actions v7. No container images.

The repository initially had no tests; clean install, lint and build passed before
changes. Local lint, 30 tests and build now pass. Tests include actual bundled
lcms Wasm with the original GenericCMYK profile, validating that transforms remain
usable after profile closure and that short/long HEX produce identical bytes.

Eight desktop/mobile browser journeys exercise actual Wasm and all four existing
ICC profiles, all four mathematical converters, ten other color spaces, malformed
input recovery, language changes, failed-profile reload and rejected VK init.
Only Bridge host calls use an explicit serve-only fixture. Production builds use
the real SDK. The original ICC files, artwork and tracked archive are preserved.
No color profile, user file or converted payload is uploaded externally.

Install and CI commands disable npm audit; no dependency graph is submitted and
this report makes no zero-vulnerability claim. Existing lcms upstream build warnings
about its Node-only module branch are verified through both Node and browser paths.
Native VK banner/insets and device-specific rendering remain release checks. Numeric
profile consistency does not claim physical print calibration or printer accuracy.

API reference: https://github.com/mattdesl/lcms-wasm
