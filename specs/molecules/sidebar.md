# Sidebar Molecule

## Metadata
- **Name:** Sidebar Navigation
- **Category:** Molecule
- **Status:** Active

## Overview
Left-side navigation panel with collapsible desktop mode and slide-in mobile drawer.

## Anatomy
1. Container (aside, fixed position)
2. Menu items (Link elements)
3. Collapse toggle (desktop only)
4. Mobile backdrop + FAB toggle

## Navigation Item States

| State | Classes |
|---|---|
| Default | `text-gray-500 hover:bg-gray-50 hover:text-gray-900` |
| Active | `bg-[var(--color-maroon)] text-white shadow-md shadow-[var(--color-maroon)]/20` |
| Item shape | `h-11 rounded-xl` |
| Text | `text-xs font-black uppercase tracking-widest` |
| Icon | `size={20}`, `strokeWidth={active ? 2.5 : 2}` |

## Collapsed Tooltip
```
bg-[var(--color-dark)] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg
```
With arrow and hover transitions: `opacity-0 → group-hover:opacity-100`.

## Mobile FAB
```
p-3 bg-white rounded-full shadow-[var(--shadow-modal)] border border-gray-100/50 text-[var(--color-gold)]
hover:scale-110 active:scale-[var(--active-scale-lg)]
```

## Rules
1. Active state is always `--color-maroon` (#8B2332), not gold.
2. Hover state is always `bg-gray-50 text-gray-900` — never gold background on hover.
3. Collapse toggle: `text-gray-400 hover:text-[var(--color-gold)] hover:bg-gray-50 rounded-xl`.

## Cross-references
- Uses: [button](../atoms/button.md), [color](../foundations/color.md)
