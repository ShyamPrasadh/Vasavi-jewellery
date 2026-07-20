# Button Atom

## Metadata
- **Name:** Button
- **Category:** Atom
- **Status:** Active

## Overview
Buttons trigger actions (submit, navigate, confirm, cancel). This project has four button variants.

### When to use
- **Primary (gold):** Main form submissions (Save & Print, Set Date)
- **Dark:** Secondary CTAs (Request Quote, Print Bill)
- **Ghost:** Toggle/filter buttons, cancel actions
- **Danger:** Destructive actions (Delete)

## Anatomy
1. Container (background, border, padding, radius)
2. Label (text, uppercase, tracking)
3. Leading icon (optional, lucide-react)
4. Trailing icon (optional)

## Tokens Used
| Part | Token | Value |
|---|---|---|
| Primary bg | `--color-gold` | #A67C00 |
| Primary hover bg | `--color-gold-hover` | #B8860B |
| Dark bg | `--color-dark` | #111827 |
| Dark hover bg | `--color-dark-hover` | #000000 |
| Ghost bg | `transparent` / `bg-white` | — |
| Ghost hover bg | `bg-gray-50` | — |
| Danger bg | `--color-danger` | #EF4444 |
| Danger hover bg | `--color-danger-hover` | #DC2626 |
| Text (primary/dark) | `white` | — |
| Text (ghost) | `--color-text-secondary` | #6B7280 |
| Radius | `--radius-lg` | 12px |
| Transition | `--duration-normal` | 200ms |

## States

### Primary (Gold)
| State | Classes |
|---|---|
| Default | `bg-[var(--color-gold)] text-white rounded-xl font-black uppercase text-xs tracking-widest` |
| Hover | `hover:bg-[var(--color-gold-hover)]` |
| Active | `active:scale-[0.98]` |
| Focus | `focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20` |
| Disabled | `disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed` |

### Dark
| State | Classes |
|---|---|
| Default | `bg-[var(--color-dark)] text-white rounded-xl font-black uppercase text-xs tracking-widest` |
| Hover | `hover:bg-[var(--color-dark-hover)]` |
| Active | `active:scale-[0.98]` |

### Ghost
| State | Classes |
|---|---|
| Default | `bg-white border border-gray-200 text-gray-500 rounded-xl font-black uppercase text-xs tracking-widest` |
| Hover | `hover:bg-gray-50 hover:border-[var(--color-gold)]/40` |
| Active | `active:scale-[0.98]` |
| Selected | `bg-[var(--color-gold)]/10 text-[var(--color-gold-hover)] border-[var(--color-gold)]/20` |

### Danger
| State | Classes |
|---|---|
| Default | `bg-[var(--color-danger)] text-white rounded-xl font-black uppercase text-xs tracking-widest` |
| Hover | `hover:bg-[var(--color-danger-hover)]` |
| Active | `active:scale-[0.98]` |

## Code Example

```tsx
{/* Primary */}
<button className="bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] active:scale-[0.98] text-white px-5 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-200 flex items-center gap-2">
  <Printer size={16} />
  Save & Print
</button>

{/* Dark */}
<button className="bg-[var(--color-dark)] hover:bg-[var(--color-dark-hover)] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-sm tracking-[0.15em] uppercase transition-all duration-200">
  Request Quote
</button>

{/* Ghost */}
<button className="bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-[var(--color-gold)]/40 active:scale-[0.98] rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-200">
  Cancel
</button>

{/* Ghost Selected */}
<button className="bg-[var(--color-gold-muted)] text-[var(--color-gold-hover)] border border-[var(--color-gold-light)] rounded-lg transition-all duration-200">
  Card View
</button>
```

## Cross-references
- Uses: [color](../foundations/color.md), [motion](../foundations/motion.md), [radius](../foundations/radius.md)
- Used by: [modal](../molecules/modal.md), [header](../molecules/header.md), [sidebar](../molecules/sidebar.md)
