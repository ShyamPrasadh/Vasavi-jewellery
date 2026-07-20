# Color Foundation

## Metadata
- **Name:** Color
- **Category:** Foundation
- **Status:** Active

## Overview
The color system for Vasavi Jewellery is built on a 3-layer architecture. Components should only reference Layer 2 (Project Aliases) tokens.


## Brand Palette

| Token | Value | Usage |
|---|---|---|
| `--color-gold` | `#A67C00` | Primary brand. CTA buttons, links, accents, active states |
| `--color-gold-hover` | `#B8860B` | Hover state for gold elements |
| `--color-gold-dark` | `#8C6B00` | Subdued gold for subtitles, labels |
| `--color-gold-light` | `#F4E4BC` | Light gold for badges, highlights |
| `--color-gold-muted` | `#F9F5EC` | Very light gold for backgrounds, borders |
| `--color-maroon` | `#8B2332` | Sidebar active state, brand accent |
| `--color-maroon-hover` | `#A02A3C` | Hover state for maroon elements |

## Neutral Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FDFCFB` | Page background |
| `--color-bg-alt` | `#F9FAFB` | Alternate background (gold-loan page, filter panel) |
| `--color-bg-card` | `#FFFFFF` | Card surfaces |
| `--color-text` | `#1A202C` | Primary text, headings, values |
| `--color-text-secondary` | `#6B7280` | Secondary labels |
| `--color-text-muted` | `#9CA3AF` | Muted labels, placeholders |
| `--color-text-faint` | `#D1D5DB` | Extremely light text, dividers |
| `--color-border` | `#E5E7EB` | Default borders |
| `--color-border-light` | `#F3F4F6` | Subtle borders, dividers |
| `--color-border-focus` | `#A67C00` | Focus ring / focus border for inputs |
| `--color-dark` | `#111827` | Dark buttons (Request Quote, Print Bill) |
| `--color-dark-hover` | `#000000` | Hover for dark buttons |

## Feedback Colors

| Token | Value | Usage |
|---|---|---|
| `--color-danger` | `#EF4444` | Delete buttons, error states |
| `--color-danger-hover` | `#DC2626` | Hover for danger buttons |
| `--color-danger-light` | `#FEE2E2` | Danger background (alert icon) |
| `--color-danger-text` | `#DC2626` | Danger text color |
| `--color-success` | `#22C55E` | Live indicator dot |
| `--color-success-light` | `#4ADE80` | Light success background |
| `--color-warning` | `#F59E0B` | Syncing indicator |
| `--color-warning-light` | `#FBBF24` | Light warning background |

## Rules

1. **Never use raw hex colors** — always reference `var(--color-*)` in CSS or use the corresponding Tailwind class.
2. **One gold**: `--color-gold` (#A67C00) is the only gold for interactive elements.
3. **One dark**: `--color-dark` (#111827) for dark buttons.
4. **Focus = gold**: All inputs and interactive elements use `--color-border-focus` (#A67C00) on focus.
5. **Layered access**: Only reference Layer 2 tokens (e.g., `--color-gold`) in component styles, never Layer 1 brand primitives.

## Cross-references
- Uses: [tokens.css](../../src/app/tokens.css)
- Used by: [button](../atoms/button.md), [input](../atoms/input.md), [card](../molecules/card.md)
