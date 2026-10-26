# Auvrantis Create Design System

## Principles
- Apple product page meets pro creative tool
- Huge confident headlines, generous whitespace, product first
- Clean, bold, sleek, quietly futuristic
- Product over illustration; real Studio and real generated sites
- Chapters alternate white, light gray, pure black
- Glassy sticky nav, crisp depth
- Quietly futuristic, never neon, never cluttered

## Tokens

### Colors
- White: #FFFFFF
- Mist: #F5F5F7 (light chapters)
- Black: #000000 (dark chapters)
- Ink: #1D1D1F (text on light)
- Graphite: #6E6E73 (secondary text)
- Ultramarine: #2D45FF (primary actions and links, lighter tint on black for AA contrast)

### Typography
- Font: Variable grotesk, self-hosted via next/font. Mona Sans preferred, Instrument Sans fallback. Not Inter, Geist, or system defaults.
- Display: weight 600–800, tracking -0.02 to -0.04em, line-height 1.05, fluid sizes up to 112px
- Body: 17–19px, line-height 1.5, max width ~80 characters
- Sentence case everywhere

### Layout
- Full-bleed chapters
- Content max width: 1200px
- Vertical rhythm: 120–200px between chapters on desktop
- Center headlines in hero and chapter openers; left-align body text and all UI

### Motion
- Hero focused motion only
- Elsewhere: only motion that answers visitor (opening, switching tabs, previewing)
- No fade-up on every section
- Respect prefers-reduced-motion everywhere

## Wireframes

### Home Hero
```
[Glass Nav: Wordmark | Designs | Features | Pricing | Start building]

            LIVE BUILD DEMO
            Prompt → Website
            [Start building] [See the designs]
```

### Design Showcase Grid
- 2–3 column grid
- Browser frames for each design
- Industry filters
- Card shows name, category, preview

## Signature Moment
Live build demo in home hero: sentence types into prompt bar ("A plant shop in Chicago with weekend workshops"), real website assembles inside device frame (layout, words, palette, image placeholders) and settles. Built from actual template engine, no network. Smooth, starts after first paint, minimal JS, static frame fallback for reduced motion.

## Avoid List Review
Removed / revised:
- ✳ and ↗ decorative glyphs → use purposeful icons only
- Italicized or colored single word in headlines → use weight and spacing
- ALL-CAPS labels above headings → sentence case labels
- 01/06 counters → use only where content is a real sequence
- Middle-dot meta strings → simple line breaks
- Arrows on every link → only where navigation is explicit
- Scrolling marquee tickers → removed
- Rows of identical rounded cards with soft shadow → varied cards with crisp depth
- Gradient blobs → solid color blocks only
- Stock photos of people at laptops → product screenshots only
- Emoji icons → outline icons

Changes noted: design system shifts from current playful/branded look to Apple-style minimalism with defined tokens, reduced decorative elements, and product-first presentation.
