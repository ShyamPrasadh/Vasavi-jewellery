# Header Molecule

## Metadata
- **Name:** Header
- **Category:** Molecule
- **Status:** Active

## Overview
Fixed top navigation bar with logo, brand name, live gold rates, and profile dropdown.

## Structure
```
header: bg-white border-b border-gray-100 shadow-sm fixed top-0 z-[55] h-[70px] md:h-[60px]
```

## Profile Button
| State | Classes |
|---|---|
| Default | `w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg text-gray-600` |
| Hover | `hover:bg-gray-100 hover:border-[var(--color-gold)]/50` |

## Profile Dropdown
```
bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56
```

### Dropdown Items
| State | Classes |
|---|---|
| Default | `px-4 py-2.5 text-xs md:text-sm text-gray-700` |
| Hover | `hover:bg-gray-50` |
| Icon | `text-gray-400 group-hover:text-[var(--color-gold)]` |
| Danger item | `text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]` |

## Cross-references
- Uses: [icon-button](../atoms/icon-button.md), [color](../foundations/color.md)
