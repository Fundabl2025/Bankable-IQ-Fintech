# @bankable/design-tokens

Canonical BANKABLE IQ Brand v1 design tokens.

## Source of truth

The Figma file at `https://www.figma.com/design/y3wOnWeFZqJVUH8xi2MoLZ` (BANKABLE IQ Brand v1).

This package mirrors those tokens in machine-readable format so:
- The Next.js app (`apps/web-next/`) imports CSS custom properties.
- The legacy Vite app (`src/`) can pull values too.
- Storybook, Email templates, and PDF exports use a single source.

## Files

| File | What it is |
|------|------------|
| `tokens.json` | W3C Design Tokens Community Group format. Authoritative. |
| `README.md` | This file. |

## How tokens flow

```
Figma Variables (Source: file y3wOnWeFZqJVUH8xi2MoLZ)
  ↓ export via Figma Tokens plugin or bot-design agent
tokens.json (this package)
  ↓ manual mirror for now; bot-design automates via style-dictionary later
apps/web-next/app/_styles/brand.css  (CSS custom properties)
src/styles/tailwind.css (Tailwind preset)
```

## Updating tokens

1. Edit Figma file.
2. Re-export from Figma (bot-design when fleet runs; manual otherwise).
3. Update `tokens.json`.
4. Regenerate the CSS variables file (`apps/web-next/app/_styles/brand.css`).
5. Open a PR. `bot-design-sync` workflow notices and validates.
