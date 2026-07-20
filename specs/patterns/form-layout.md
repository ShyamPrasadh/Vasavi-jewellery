# Form Layout Pattern

## Metadata
- **Name:** Form Layout
- **Category:** Pattern
- **Status:** Active

## Overview
Standard rules for arranging input fields, labels, and submit buttons within forms.


## When to Use
Any page section that collects user input: new loan form, pawn shop customer details, edit modal form.

## Label Placement
- Labels are ABOVE the input field.
- Label classes: `block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4`
- Labels in bordered form variant: `text-xs font-black text-gray-600 uppercase tracking-widest block ml-1`

## Grid Rules
| Fields per row | Mobile | Desktop |
|---|---|---|
| 1 field | `grid-cols-1` | `grid-cols-1` |
| 2 fields | `grid-cols-1` | `grid-cols-2` |
| 3 fields | `grid-cols-1` | `grid-cols-3` |
| 4 fields | `grid-cols-2` | `grid-cols-4` |

## Spacing
- Gap between fields in a row: `gap-5` (underline) or `gap-8` (bordered)
- Gap between field rows: `space-y-8` (bordered) or implicit from card gaps
- Required field marker: append ` *` to label text

## Submit Button
Full-width, placed at the bottom of the form:
- Primary gold for "Save & Print": `bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-white py-4 rounded-2xl font-black uppercase`
- Dark for "Request Quote": `bg-[var(--color-dark)] hover:bg-[var(--color-dark-hover)] text-white py-4 rounded-xl md:rounded-2xl font-bold uppercase`

All submit buttons get `active:scale-[0.98]`.

## Cross-references
- Uses: [input](../atoms/input.md), [select](../atoms/select.md), [button](../atoms/button.md), [card](../molecules/card.md)
