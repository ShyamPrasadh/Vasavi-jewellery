# Date Picker Molecule

## Metadata
- **Name:** Custom Date Picker
- **Category:** Molecule
- **Status:** Active

## Overview
iOS-style wheel date picker rendered as a portal. Includes a text input for manual date entry.

## Input Section
Uses the **underline input variant** from the input atom — identical focus/hover behavior.

## Picker Popup
```
position: fixed; z-index: var(--z-picker); border-radius: var(--radius-xl); width: 240px;
box-shadow: var(--shadow-dropdown);
border: 1px solid var(--color-border-light);
```

## Confirm Button
Primary gold button: `bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-white rounded-xl`.

## Cross-references
- Uses: [input](../atoms/input.md), [button](../atoms/button.md)
