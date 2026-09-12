# Snitch — Design System

> This block is the contract. Paste it at the top of **every single Stitch generation**, unchanged.

---

### Brand
Snitch — premium menswear. The feeling is a quiet, confident, well-lit boutique: warm, tactile, expensive, unhurried. Editorial, not promotional. The design should feel like a fashion house's own site, not a marketplace template.

### Colour — warm, solid, flat. No gradients anywhere.
| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F7F3EE` | Default page background — warm bone, never pure white |
| `surface` | `#FDFBF8` | Cards, panels, raised areas |
| `ink` | `#1C1917` | Primary text, primary buttons, footer background |
| `ink-muted` | `#6B625B` | Secondary text, captions, helper copy |
| `hairline` | `#E4DCD2` | All borders and dividers, 1px |
| `sand` | `#C9B79C` | Subtle fills, tags, inactive states |
| `accent` | `#A8442A` | Terracotta. **Rare and deliberate** — sale price, active filter, one primary CTA per screen at most |
| `positive` | `#3F5D45` | Order confirmed, in stock, paid |
| `critical` | `#8C2F2A` | Errors, failed payment, out of stock |

Flat solid fills only, no gradients, no tints of tints. `sand` and `hairline` are fill and border tokens **only** — never text. All body copy is `ink` or `ink-muted`; every text/background pair in this palette must clear WCAG AA (4.5:1), and the ones above already do.

### Typography
- **Display / headings:** `Instrument Serif` (fallback: `Fraunces`). Editorial headlines, section titles, product names on the PDP. Tight leading (1.05–1.15), generous size, never bold — the weight comes from scale, not thickness.
- **UI / body:** `Inter Tight` (fallback: `Geist`, then `Inter`). Every functional element — navigation, buttons, forms, tables, prices, dashboard.
- **Eyebrows, labels, buttons:** UI font, 11–12px, uppercase, `letter-spacing: 0.14em`.
- **Desktop scale:** 72 / 56 / 40 / 28 / 20 / 16 / 14 / 12. Body 16px at 1.6 line-height, max 66ch measure.
- Two typefaces total. No third font anywhere.

### Layout & space
- 12-column grid, 1440px frame, 1280px max content width, 80px side gutters desktop / 20px mobile.
- 8pt spacing scale. Section rhythm: **120px** vertical padding desktop, 64px mobile. Be generous — whitespace is the primary luxury signal here. When in doubt, add space rather than content.
- Product grid: 4-up desktop / 2-up mobile, 24px gutters, 48px row gap.
- Corner radius: **2px** on inputs and cards, **0px** on buttons and all imagery. Sharp, not bubbly.
- Borders: 1px `hairline`. No drop shadows, with one exception — a barely-visible shadow on the sticky header once scrolled.

### Components
- **Buttons:** solid `ink` fill with `canvas` text for primary; 1px `hairline` outline with `ink` text for secondary; underlined text for tertiary. Uppercase letterspaced labels, 48px tall, square corners, generous horizontal padding.
- **Inputs:** bottom-rule or 1px hairline box on `surface`, floating or above-field label in the uppercase label style, 48px tall.
- **Product card:** 4:5 image, no border, no shadow, name in UI font 14px, price 14px, colour swatches as small squares. Hover swaps to the second product image.
- **Navigation:** slim top bar — wordmark centre or left, categories inline, search / account / bag as thin line icons on the right. Transparent over the hero, solid `canvas` once scrolled.
- **Tables (seller side):** hairline rows, no zebra striping, uppercase column headers, status as a small square-cornered tag — `sand` fill with `ink` text for neutral states, `positive` or `critical` fill with `canvas` text for resolved and failed states.
- **Icons:** thin line icons only, 1.25px stroke, used sparingly.

### Imagery
Editorial fashion photography on warm neutral backdrops. Product shots 4:5 portrait, full-bleed hero 3:2 or 16:9. Models in natural light. No white-background cut-outs, no illustrations, no 3D renders.

### Content
Real, specific copy using the actual field names and enums from `design/api-map.md`. Real product names, real Indian rupee prices, real sizes, real order IDs and statuses. **No Lorem ipsum. No placeholder text of any kind.**

### Explicitly banned
Gradients. Glassmorphism. Neon or saturated brights. Purple/indigo SaaS palettes. Heavy drop shadows. Fully rounded pill buttons. Emoji. Carousel dot indicators. Badge clutter. Decorative blobs. Dark mode (light only for this pass). Anything that reads as a generic AI-generated landing page.
