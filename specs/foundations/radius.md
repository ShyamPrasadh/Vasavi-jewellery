# Border Radius Foundation

## Metadata
- **Name:** Border Radius
- **Category:** Foundation
- **Status:** Active

## Overview
Defines the corner curvature for all components. Larger radii are used for cards and modals, while smaller radii are used for buttons and interactive elements.


## Scale

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | — |
| `--radius-md` | 8px | Filter chips, small buttons, selection bar |
| `--radius-lg` | 12px | Buttons, dropdown items, sidebar items, icon elements |
| `--radius-xl` | 16px | Cards (mobile), modals, tooltips, date picker |
| `--radius-2xl` | 24px | Cards (desktop), large modals |
| `--radius-full` | 9999px | Indicator dots, avatar circles, FAB |

## Component Mapping

| Component | Mobile | Desktop |
|---|---|---|
| Card | `rounded-xl` (16px) | `rounded-2xl` (24px) |
| Button (standard) | `rounded-xl` (16px) | `rounded-xl` (16px) |
| Button (compact) | `rounded-lg` (12px) | `rounded-lg` (12px) |
| Input (bordered) | `rounded-2xl` (24px) | `rounded-2xl` (24px) |
| Modal | `rounded-3xl` (32px) | `rounded-3xl` (32px) |
| Sidebar item | `rounded-xl` (16px) | `rounded-xl` (16px) |

## Cross-references
- Uses: [tokens.css](../../src/app/tokens.css)
- Used by: [button](../atoms/button.md), [input](../atoms/input.md), [card](../molecules/card.md), [modal](../molecules/modal.md)

## Rules

1. Cards always use `rounded-xl md:rounded-2xl`.
2. Buttons are always `rounded-xl` unless they are small/inline, then `rounded-lg`.
3. Modals (full overlays) use `rounded-3xl`.
4. Never use `rounded-[2rem]` or arbitrary radius values.
