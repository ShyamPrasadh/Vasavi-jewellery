# Token Reference

Master map of all CSS variables in `tokens.css`. Components should ONLY use Layer 2 aliases.

## Quick Lookup

### Colors

```
var(--color-gold)           → #A67C00   Primary brand, CTA backgrounds, accents
var(--color-gold-hover)     → #B8860B   Hover state for gold elements
var(--color-gold-dark)      → #8C6B00   Subdued gold, subtitles
var(--color-gold-light)     → #F4E4BC   Badge backgrounds
var(--color-gold-muted)     → #F9F5EC   Subtle gold borders/backgrounds

var(--color-maroon)         → #8B2332   Sidebar active state
var(--color-maroon-hover)   → #A02A3C   Sidebar active hover

var(--color-bg)             → #FDFCFB   Page background
var(--color-bg-alt)         → #F9FAFB   Alternate page background (gray-50)
var(--color-bg-card)        → #FFFFFF   Card surfaces

var(--color-text)           → #1A202C   Primary text
var(--color-text-secondary) → #6B7280   Secondary text (gray-500)
var(--color-text-muted)     → #9CA3AF   Muted text (gray-400)
var(--color-text-faint)     → #D1D5DB   Very light text (gray-300)

var(--color-border)         → #E5E7EB   Default borders (gray-200)
var(--color-border-light)   → #F3F4F6   Subtle borders (gray-100)
var(--color-border-focus)   → #A67C00   Focus borders

var(--color-dark)           → #111827   Dark button bg (gray-900)
var(--color-dark-hover)     → #000000   Hover for dark buttons

var(--color-danger)         → #EF4444   Danger buttons (red-500)
var(--color-danger-hover)   → #DC2626   Danger hover (red-600)
var(--color-danger-light)   → #FEE2E2   Danger badge bg (red-100)
```

### Spacing

```
var(--space-50)   → 2px      var(--space-600)  → 24px
var(--space-100)  → 4px      var(--space-700)  → 32px
var(--space-150)  → 6px      var(--space-800)  → 40px
var(--space-200)  → 8px      var(--space-900)  → 48px
var(--space-300)  → 12px     var(--space-1000) → 64px
var(--space-400)  → 16px
var(--space-500)  → 20px
```

### Typography

```
var(--font-display)  → Playfair Display    var(--font-weight-normal)   → 400
var(--font-heading)  → Cinzel              var(--font-weight-medium)   → 500
var(--font-body)     → Inter               var(--font-weight-semibold) → 600
var(--font-label)    → Poppins             var(--font-weight-bold)     → 700
var(--font-mono)     → SF Mono             var(--font-weight-black)    → 900
```

### Radius, Elevation, Z-Index, Motion

```
var(--radius-sm)  → 6px      var(--shadow-card)     → subtle card
var(--radius-md)  → 8px      var(--shadow-dropdown) → dropdown popup
var(--radius-lg)  → 12px     var(--shadow-modal)    → full modal
var(--radius-xl)  → 16px
var(--radius-2xl) → 24px     var(--z-header)   → 55
var(--radius-full)→ 9999px   var(--z-sidebar)  → 40
                              var(--z-modal)    → 100

var(--duration-fast)   → 150ms    var(--ease-default)
var(--duration-normal) → 200ms    var(--ease-out)
var(--duration-slow)   → 300ms
var(--active-scale)    → 0.98
```
