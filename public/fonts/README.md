# Manrope font assets

Self-hosted, unmodified WOFF2 files from the official npm package [`@fontsource-variable/manrope@5.3.0`](https://www.npmjs.com/package/@fontsource-variable/manrope), downloaded on 28 September 2026. Package font version: v20. The upstream font is [Manrope](https://github.com/sharanda/manrope), distributed through Google Fonts and Fontsource.

- `manrope-latin-wght-normal.woff2`: Latin subset, 24,836 bytes.
- `manrope-latin-ext-wght-normal.woff2`: Latin Extended subset, 15,120 bytes.
- Both are upright variable fonts supporting the continuous `wght` range **200–800**, including 400, 500, 600 and 700.
- Declare the CSS family as `Manrope`, style `normal`, weight `200 800`, and `font-display: swap`. The served paths are `/fonts/manrope-latin-wght-normal.woff2` and `/fonts/manrope-latin-ext-wght-normal.woff2`.
- The original SIL Open Font License 1.1 and copyright notice are preserved verbatim in `Manrope-OFL.txt`.

For separate subset declarations, use the package's original Unicode ranges:

```text
Latin:
U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD

Latin Extended:
U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF
```

No browser-time request to Google Fonts or Fontsource is needed. No package dependency was added to the application manifest.
