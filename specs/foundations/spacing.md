# Spacing Foundation

## Metadata
- **Name:** Spacing
- **Category:** Foundation
- **Status:** Active

## Overview
A 4px-based grid system for consistent internal and external spacing across all pages and components.


## Scale (4px base grid)

| Token | Value | Common Use |
|---|---|---|
| `--space-50` | 2px | Micro gaps (badge padding, indicator dots) |
| `--space-100` | 4px | Tight gaps (icon-to-text in compact elements) |
| `--space-150` | 6px | Small gaps (button group spacing) |
| `--space-200` | 8px | Default small padding (inline elements) |
| `--space-300` | 12px | Medium padding (card inner padding mobile) |
| `--space-400` | 16px | Standard padding (card inner padding, form field spacing) |
| `--space-500` | 20px | Comfortable padding (card desktop padding) |
| `--space-600` | 24px | Large padding (section spacing, modal padding) |
| `--space-700` | 32px | XL spacing (between major sections) |
| `--space-800` | 40px | 2XL spacing (page-level spacing) |
| `--space-900` | 48px | 3XL spacing |
| `--space-1000` | 64px | Maximum spacing |

## Component Spacing Rules

| Element | Mobile | Desktop |
|---|---|---|
| Card padding | `--space-400` (16px) | `--space-500` (20px) |
| Card gap (between cards) | `--space-400` (16px) | `--space-500` (20px) |
| Form field vertical spacing | `--space-500` (20px) | `--space-500` (20px) |
| Label to input | `--space-400` (16px) | `--space-400` (16px) |
| Section gap | `--space-600` (24px) | `--space-600` (24px) |
| Page lateral padding | `--space-400` (16px) | `--space-600` (24px) |
| Modal body padding | `--space-600` (24px) | `--space-700` (32px) |

## Rules

1. All spacing must use tokens from this scale. No arbitrary pixel values.
2. Use `gap` for flexbox/grid spacing instead of margins where possible.
3. Mobile padding is generally one step smaller than desktop padding.

## Cross-references
- Uses: [tokens.css](../../src/app/tokens.css)
- Used by: All atoms and molecules
