# Elevation Foundation

## Metadata
- **Name:** Elevation
- **Category:** Foundation
- **Status:** Active

## Overview
Defines depth through shadows for components like cards, modals, and dropdowns.


## Shadow Scale

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Flat elements (buttons without emphasis) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Header bar |
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.03)` | Content cards, form cards |
| `--shadow-dropdown` | `0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)` | Dropdown menus, date picker popup |
| `--shadow-modal` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Modal dialogs |

## Rules

1. Cards use `--shadow-card`. No `shadow-xl`, `shadow-2xl`, or `shadow-lg`.
2. Modals use `--shadow-modal` (`shadow-2xl` in Tailwind).
3. Dropdown menus use `--shadow-dropdown` (`shadow-xl` in Tailwind).
4. Buttons do NOT have shadows unless they are the danger confirm button.
5. Sidebar uses `shadow-xl shadow-gray-200/50` for the panel itself.

## Cross-references
- Uses: [tokens.css](../../src/app/tokens.css)
- Used by: [card](../molecules/card.md), [modal](../molecules/modal.md), [header](../molecules/header.md)
