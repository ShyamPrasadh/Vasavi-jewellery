# Modal Molecule

## Metadata
- **Name:** Modal Dialog
- **Category:** Molecule
- **Status:** Active

## Overview
Full-screen overlay dialogs. Used for: confirm delete, loan details, edit loan, print preview.

## Tokens Used
| Part | Token | Value |
|---|---|---|
| Backdrop | `bg-black/60 backdrop-blur-sm` | — |
| Container bg | `bg-white` | — |
| Container radius | `rounded-3xl` | 24px |
| Container shadow | `--shadow-modal` | — |
| Z-index | `--z-modal` | 100 |
| Entry animation | `animate-in fade-in zoom-in-95 duration-200` | — |

## Anatomy
1. **Backdrop** — fixed overlay with blur
2. **Container** — centered card with max-width
3. **Header** — title + close button (optional icon)
4. **Body** — scrollable content
5. **Footer** — action buttons

## Consistent Structure

```tsx
<div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div className="bg-white w-full max-w-md rounded-3xl shadow-[var(--shadow-modal)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    {/* Header */}
    <div className="p-6 pb-4 flex items-start gap-4">
      {/* icon + title + close button */}
    </div>
    {/* Body */}
    <div className="px-6 overflow-y-auto">
      {/* content */}
    </div>
    {/* Footer */}
    <div className="p-6 pt-2 flex gap-3">
      {/* buttons: Ghost cancel + Primary/Danger confirm */}
    </div>
  </div>
</div>
```

## Rules
1. All modals use `rounded-3xl`, `shadow-2xl`, `bg-black/60 backdrop-blur-sm`.
2. Close button is always an icon button: `p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl`.
3. Footer buttons follow the button atom spec (Ghost for cancel, Primary/Danger for action).
4. Large modals (print preview) can use `max-w-3xl` and `rounded-[2.5rem]`.

## Cross-references
- Uses: [button](../atoms/button.md), [icon-button](../atoms/icon-button.md)
- Used by: gold-loan page, pawn page
