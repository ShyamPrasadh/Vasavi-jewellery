# Page Layout Pattern

## Metadata
- **Name:** Page Layout
- **Category:** Pattern
- **Status:** Active

## Overview
Foundational structure for all top-level pages in the application.


## Standard Page Structure

Every page follows this vertical order:
1. `<Header />` component (fixed, z-55)
2. `<main>` with `pt-[70px] md:pt-[60px]` (below fixed header)
3. Page title section
4. Content area
5. Footer text (optional)

## Page Title

```tsx
<div className="flex items-start justify-between mb-4 md:mb-6">
  <div className="flex flex-col gap-1.5 pt-1">
    <h1 className="font-cinzel text-xl md:text-[22px] font-semibold text-[var(--color-text)] uppercase tracking-normal leading-none">
      Page Title
    </h1>
    <p className="font-poppins text-[9px] md:text-[10px] font-semibold text-[var(--color-gold-dark)] uppercase tracking-[0.2em] m-0 leading-none">
      Subtitle Text
    </p>
  </div>
  {/* Optional right-side action button */}
</div>
```

## Page Container
```
max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-6
```

## Background Colors
- Calculator pages: `bg-[#FDFCFB]` → `var(--color-bg)`
- Loan management pages: `bg-gray-50` → `var(--color-bg-alt)`

## Column Layout (Calculator pages)
```
flex flex-col lg:flex-row gap-6
```
- Left (inputs): `w-full lg:w-5/12`
- Right (output): `w-full lg:w-7/12`

## Footer Text
```tsx
<p className="mt-12 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">
  Sri Vasavi Jewellery
</p>
```

## Cross-references
- Uses: [card](../molecules/card.md), [header](../molecules/header.md), [spacing](../foundations/spacing.md)
