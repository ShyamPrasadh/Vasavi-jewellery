---
name: Design System
description: How to use the Vasavi Jewellery design system — tokens, specs, and consistent micro-interactions
---

# Design System Skill

## Before Any UI Work

1. **Read the relevant spec file** in `specs/` before writing or modifying any UI component.
2. **Use only tokens** from `src/app/tokens.css`. Never hardcode hex colors, pixel spacing, or raw font sizes.
3. **Follow state patterns** exactly as defined in atom specs (`specs/atoms/`).

## File Structure

```
specs/
├── foundations/     # Visual primitives: color, spacing, typography, radius, elevation, motion
├── tokens/          # Master token reference
├── atoms/           # Button, input, select, icon-button
├── molecules/       # Modal, sidebar, header, card, date-picker
└── patterns/        # Form layout, page layout
```

## Key Rules

### Colors
- Gold brand color: `#A67C00` (`--color-gold`). Hover: `#B8860B` (`--color-gold-hover`).
- Dark buttons: `#111827` (`--color-dark`). Hover: `#000000` (`--color-dark-hover`).
- Sidebar active: `#8B2332` (`--color-maroon`).
- Focus border for ALL inputs: `#A67C00` (`--color-border-focus`).
- NEVER use `#333333`, `#0A192F`, `#b8962e`, or other off-brand colors.

### Buttons (see specs/atoms/button.md)
- **All buttons** get `active:scale-[0.98]` for press feedback.
- **All buttons** get `transition-all duration-200`.
- **Primary (gold):** `bg-[#A67C00] hover:bg-[#B8860B]`
- **Dark:** `bg-[#111827] hover:bg-black`
- **Ghost:** `bg-white border border-gray-200 hover:bg-gray-50`
- **Danger:** `bg-red-500 hover:bg-red-600`
- Border radius: `rounded-xl` (standard) or `rounded-lg` (compact).

### Inputs (see specs/atoms/input.md)
- **Underline variant** (calculator cards): `border-b border-gray-100 hover:border-gray-200 focus:border-[#A67C00]`
- **Bordered variant** (full forms): `border border-gray-200 rounded-2xl focus:border-[#A67C00]`
- Icon color transitions: `group-hover/icon:text-[#A67C00] group-focus-within/icon:text-[#A67C00]`

### Cards (see specs/molecules/card.md)
- ALL cards: `rounded-xl md:rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)]`

### Modals (see specs/molecules/modal.md)
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Container: `rounded-3xl shadow-2xl`
- Animation: `animate-in fade-in zoom-in-95 duration-200`

## Audit

Run the token audit script before committing:
```bash
node scripts/token-audit.js
```
Zero errors required. Fix hardcoded values, don't modify the audit script.
