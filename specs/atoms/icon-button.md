# Icon Button Atom

## Metadata
- **Name:** Icon Button
- **Category:** Atom
- **Status:** Active

## Overview
Square buttons containing only an icon. Used for filter toggles, close buttons, menu toggles, view mode switches.

## States

| State | Classes |
|---|---|
| Default | `bg-white border border-gray-200 text-gray-500 rounded-xl` |
| Hover | `hover:bg-gray-50 hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)]` |
| Active | `active:scale-[0.98]` |
| Selected/Active | `bg-[var(--color-gold)] text-white border-[var(--color-gold)]` |

## Sizing
- Standard: `h-[38px] w-[38px] md:h-[42px] md:w-[42px]`
- Compact: `p-2` (close buttons in modals/dropdowns)

## Close Button (special variant)
| State | Classes |
|---|---|
| Default | `p-2 text-gray-400 rounded-xl` |
| Hover | `hover:text-gray-600 hover:bg-gray-100` |

## Code Example

```tsx
{/* Filter icon button */}
<button className="flex items-center justify-center h-[38px] w-[38px] md:h-[42px] md:w-[42px] rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] active:scale-[0.98] transition-all duration-200">
  <Filter size={14} />
</button>

{/* Close button */}
<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
  <X size={20} />
</button>
```

## Cross-references
- Uses: [button](./button.md), [color](../foundations/color.md)
- Used by: [header](../molecules/header.md), [modal](../molecules/modal.md)
