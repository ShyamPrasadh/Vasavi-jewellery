# Card Molecule

## Metadata
- **Name:** Card
- **Category:** Molecule
- **Status:** Active

## Overview
Content containers. Used for input groups, output sections, and loan list items.

## Standard Card

```
bg-white p-4 md:p-5 rounded-xl md:rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)]
```

| Property | Mobile | Desktop |
|---|---|---|
| Padding | `p-4` (16px) | `p-5` (20px) |
| Radius | `rounded-xl` (12px) | `rounded-2xl` (16px) |
| Shadow | `shadow-[0_2px_12px_rgb(0,0,0,0.03)]` | Same |
| Background | `bg-white` | Same |
| Border | None by default | None |

## Output Card (full-height)

```
bg-white rounded-xl md:rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] w-full p-5 md:p-7 flex flex-col justify-between border-0
```

Larger padding for output/summary cards: `p-5 md:p-7`.

## Sub-card (inside output card)

```
bg-transparent rounded-xl md:rounded-2xl p-5 md:p-6 border border-[var(--color-gold-muted)]
```
Gold-muted border, transparent bg — used for VA info boxes.

## Form Card (expanded)

```
bg-white rounded-xl md:rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-200 overflow-hidden
```
With a colored header bar.

## Rules
1. ALL cards use `rounded-xl md:rounded-2xl` — never just `rounded-xl` or `rounded-2xl` alone.
2. Shadow is always `shadow-[0_2px_12px_rgb(0,0,0,0.03)]` (`--shadow-card`).
3. No `shadow-lg`, `shadow-xl` on cards. Only on modals, dropdowns, and sidebar.

## Cross-references
- Uses: [radius](../foundations/radius.md), [elevation](../foundations/elevation.md), [spacing](../foundations/spacing.md)
- Used by: All pages
