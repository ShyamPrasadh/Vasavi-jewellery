# Typography Foundation

## Metadata
- **Name:** Typography
- **Category:** Foundation
- **Status:** Active

## Overview
The typography system uses a mix of serif (Playfair Display, Cinzel) and sans-serif (Inter, Poppins) fonts to create a premium, balanced aesthetic.


## Font Families

| Token | Value | Usage |
|---|---|---|
| `--font-display` | Playfair Display, serif | Brand name in header, receipt headers |
| `--font-heading` | Cinzel, serif | Page titles (Gold Calculator, Gold Loan) |
| `--font-body` | Inter, sans-serif | All body text, labels, values |
| `--font-label` | Poppins, sans-serif | Subtitles, secondary labels |
| `--font-mono` | SF Mono, Fira Code | Numeric breakdowns, formulas |

## Size Scale

| Token | Value | Usage |
|---|---|---|
| `--font-size-2xs` | 7px | Ultra-small captions (VA sub-labels) |
| `--font-size-xs` | 9px | Labels, tracking labels, field labels |
| `--font-size-sm` | 10px | Sub-labels, subtitles |
| `--font-size-base` | 11px | Small body text, compact labels |
| `--font-size-md` | 12px | Standard body text, value labels |
| `--font-size-lg` | 14px | Input text, prominent values |
| `--font-size-xl` | 16px | Desktop input text, button text |
| `--font-size-2xl` | 18px | Section headers |
| `--font-size-3xl` | 22px | Page titles |
| `--font-size-4xl` | 28px | Large totals |
| `--font-size-5xl` | 36px | Hero totals |

## Weight Usage

| Token | Semantic Usage |
|---|---|
| `--font-weight-normal` (400) | Long-form text, terms & conditions |
| `--font-weight-medium` (500) | Dropdown items, secondary text |
| `--font-weight-semibold` (600) | Page titles, section headers |
| `--font-weight-bold` (700) | Value labels, table cells |
| `--font-weight-black` (900) | Field labels (uppercase), large values, buttons |

## Tracking (letter-spacing)

| Token | Usage |
|---|---|
| `--tracking-tight` | Large numbers, totals |
| `--tracking-normal` | Page titles |
| `--tracking-wide` | — |
| `--tracking-wider` | Sort/filter button labels |
| `--tracking-widest` | Field labels (uppercase), button text, nav items |
| `--tracking-ultra` | Subtitle lines |

## Rules

1. **Labels are always**: `font-weight-black` (900), `uppercase`, `tracking-widest` (0.15em), size `font-size-xs` to `font-size-sm`.
2. **Page titles** use `font-heading` (Cinzel) with `font-weight-semibold` (600).
3. **Brand elements** use `font-display` (Playfair Display).
4. **Body text and values** use `font-body` (Inter).
5. **Never mix weight and tracking arbitrarily** — use the combinations defined in the state tables of atoms.

## Cross-references
- Uses: [tokens.css](../../src/app/tokens.css)
- Used by: [button](../atoms/button.md), [input](../atoms/input.md), [modal](../molecules/modal.md)
