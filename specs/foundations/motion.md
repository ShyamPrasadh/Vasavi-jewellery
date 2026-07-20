# Motion Foundation

## Metadata
- **Name:** Motion
- **Category:** Foundation
- **Status:** Active

## Overview
Defines the timing and curves for transitions and animations to ensure a smooth, premium user experience.


## Duration Scale

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | 0ms | Immediate state changes |
| `--duration-fast` | 150ms | Color transitions (hover, focus), opacity |
| `--duration-normal` | 200ms | Border transitions, icon color |
| `--duration-slow` | 300ms | Panel slide-in, dropdown appear, layout shifts |
| `--duration-slower` | 500ms | Page-level animations (fade-in, slide-in) |

## Easing Curves

| Token | Value | Usage |
|---|---|---|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions (not used currently) |

## Micro-Interaction Standards

### Hover Effects
- **Color transitions**: `transition-all duration-200` (or `--duration-normal`)
- **No scale on hover** for standard buttons. Exception: mobile FAB (`hover:scale-110`)
- **Border color change**: `border-gray-200 → hover:border-[var(--color-gold)]`

### Active / Press Effects
- **All clickable elements**: `active:scale-[0.98]` — subtle press-down
- Exception: Mobile floating action button uses `active:scale-95`
- Never use `active:scale-[0.98]` AND `hover:scale-[1.02]` on the same element

### Focus Effects
- **Inputs**: Border changes to `--color-border-focus` (gold)
- **Icon within input group**: Color changes to gold via `group-focus-within`
- No outline ring — use border color change only

### Entry Animations
- Page content: `animate-in fade-in slide-in-from-bottom-6 duration-500`
- Dropdown/modal: `animate-in fade-in slide-in-from-top-2` or `zoom-in-95 duration-200`
- Filter panel: `animate-in slide-in-from-right duration-300`

## Rules

1. Use `transition-all` with the appropriate duration token. Avoid listing individual properties.
2. Every button gets `active:scale-[0.98]` for press feedback.
3. Every input gets `transition-all` for border color changes on hover/focus.
4. Never combine scale-up hover with scale-down active (except mobile FAB).
5. Use `--duration-fast` for color-only changes, `--duration-slow` for layout changes.

## Cross-references
- Uses: [tokens.css](../../src/app/tokens.css)
- Used by: [button](../atoms/button.md), [input](../atoms/input.md), [modal](../molecules/modal.md)
