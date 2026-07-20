# Select Atom

## Metadata
- **Name:** Select / Dropdown
- **Category:** Atom
- **Status:** Active

## Overview
Native `<select>` element styled consistently with input atoms. Uses `appearance-none` with a custom chevron icon.

## Anatomy
1. Container (group/icon wrapper)
2. Leading icon (optional, matches input pattern)
3. Select element (appearance-none)
4. Trailing ChevronDown icon (pointer-events-none)

## States

### Underline Variant (calculator cards)
Same border/focus behavior as Input underline variant.

```
w-full pl-7 py-2 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[var(--color-gold)] outline-none transition-all font-black text-sm md:text-base text-[var(--color-text)] appearance-none cursor-pointer
```

### Bordered Variant (form pages)
Same border/focus behavior as Input bordered variant.

```
w-full pl-12 pr-10 py-4.5 bg-white border border-gray-200 rounded-2xl focus:border-[var(--color-gold)] outline-none transition-all font-bold text-lg text-[var(--color-text)] appearance-none cursor-pointer
```

## Code Example

```tsx
<div className="relative group/icon">
  <ProductIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover/icon:text-[var(--color-gold)] group-focus-within/icon:text-[var(--color-gold)] transition-colors" size={18} />
  <select className="w-full pl-7 py-2 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[var(--color-gold)] outline-none transition-all font-black text-sm md:text-base text-[var(--color-text)] appearance-none cursor-pointer">
    <option>Ring</option>
  </select>
  <ChevronDown size={14} strokeWidth={3} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/icon:text-[var(--color-gold)] group-focus-within/icon:text-[var(--color-gold)] transition-colors" />
</div>
```

## Rules
1. ChevronDown icon always uses same group color transitions as leading icon.
2. Select always has `appearance-none cursor-pointer`.

## Cross-references
- Uses: [input](./input.md), [color](../foundations/color.md)
- Used by: [card](../molecules/card.md), [form-layout](../patterns/form-layout.md)
