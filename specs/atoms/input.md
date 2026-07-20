# Input Atom

## Metadata
- **Name:** Input / Textarea
- **Category:** Atom
- **Status:** Active

## Overview
Text inputs for data entry. Two visual variants exist, each for a specific context.

### Variants
1. **Underline:** Used inside calculator/output cards. Minimal, just a bottom border.
2. **Bordered:** Used in full forms (pawn shop mode, gold-loan form). Full border with rounded corners.

## Anatomy
1. Container (group/icon wrapper)
2. Leading icon or symbol (optional, e.g., ₹, Scale icon)
3. Input element
4. Trailing unit label (optional, e.g., "g" for grams)

## Tokens Used
| Part | Token |
|---|---|
| Text color | `text-[#0A192F]` → `--color-text` |
| Placeholder | `placeholder:text-gray-300` or `placeholder:text-gray-500` |
| Font | `font-black text-sm md:text-base` |
| Icon default color | `text-gray-400` → `--color-text-muted` |
| Icon hover color | `text-[#A67C00]` → `--color-gold` |
| Icon focus color | `text-[#A67C00]` → `--color-gold` |
| Transition | `transition-all` (covers border + color) |

## States

### Underline Variant (calculator cards)

| State | Classes |
|---|---|
| Default | `bg-transparent border-b border-gray-100` |
| Hover | `hover:border-gray-200` |
| Focus | `focus:border-[var(--color-gold)] outline-none` |
| Icon (default) | `text-gray-400` |
| Icon (group hover) | `group-hover/icon:text-[var(--color-gold)]` |
| Icon (group focus) | `group-focus-within/icon:text-[var(--color-gold)]` |

**Full class string:**
```
w-full pl-7 py-2 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[var(--color-gold)] outline-none transition-all font-black text-sm md:text-base text-[var(--color-text)]
```

### Bordered Variant (form pages)

| State | Classes |
|---|---|
| Default | `bg-white border border-gray-200 rounded-2xl` |
| Hover | (default — no explicit hover border change) |
| Focus | `focus:border-[var(--color-gold)] outline-none` |
| Icon (default) | `text-gray-400` |
| Icon (group hover) | `group-hover/icon:text-[var(--color-gold)]` |
| Icon (group focus) | `group-focus-within/icon:text-[var(--color-gold)]` |

**Full class string:**
```
w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-gold)] outline-none transition-all font-bold text-lg text-[var(--color-text)]
```

## Code Example

```tsx
{/* Underline variant */}
<div className="relative group/icon">
  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover/icon:text-[var(--color-gold)] group-focus-within/icon:text-[var(--color-gold)] transition-colors">
    <Scale size={18} />
  </span>
  <input
    type="text"
    className="w-full pl-7 py-2 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[var(--color-gold)] outline-none transition-all font-black text-sm md:text-base text-[var(--color-text)]"
  />
</div>

{/* Bordered variant */}
<div className="relative group/icon">
  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/icon:text-[var(--color-gold)] group-focus-within/icon:text-[var(--color-gold)] transition-colors" size={18} />
  <input
    type="text"
    className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-gold)] outline-none transition-all font-bold text-lg text-[var(--color-text)]"
  />
</div>
```

## Rules
1. **Icon color animation** is mandatory: `group-hover/icon:text-[var(--color-gold)] group-focus-within/icon:text-[var(--color-gold)] transition-colors`
2. Focus border is ALWAYS `--color-border-focus` (#A67C00). No other focus color.
3. Never mix variants — underline in calculator cards, bordered in full form pages.
4. The wrapping `div` must have `group/icon` class for icon color transitions.

## Cross-references
- Uses: [color](../foundations/color.md), [motion](../foundations/motion.md), [typography](../foundations/typography.md)
- Used by: [card](../molecules/card.md), [form-layout](../patterns/form-layout.md)
