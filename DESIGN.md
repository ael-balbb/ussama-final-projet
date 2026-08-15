# NasriPhone design system

## Direction

The storefront is deliberately simple: true-black structural bands, a true-white catalogue, and warm yellow used only for decisive actions, promotions, and focus. The physical Nasri Phone shop remains the visual anchor. Content and product photography carry the page; decoration stays restrained.

## Principles

- Purpose: each section either introduces the shop, helps customers find a product, explains an offer, or builds purchase confidence.
- Agency: motion confirms a user action and is immediately reversible. Drawers close along the path they opened.
- Simplicity: use open bands, grids, and tables. Avoid nested card collections, ornamental pills, gradients, and invented marketing data.
- Craft: align edges, use consistent optical spacing, keep copy concise, and test every breakpoint.

## Tokens

- Structural black: `#000000`
- Primary text: `#1d1d1f`
- Catalogue canvas: `#ffffff`
- Secondary canvas: `#f5f5f7`
- Hairline: `#e0e0e0`
- Action yellow: `#e9c153`
- Accessible yellow text/focus companion: `#8a6400` / `#a97800`
- Error: `#d70015`

Use the system font stack. Headlines use display metrics at weight 600; body and controls use text metrics. Keep headings tight and body copy comfortable.

## Interaction and motion

- Give pointer-down feedback immediately.
- Use interruptible Framer Motion springs for sheets, menus, and primary reveals.
- Product quick view and admin editors are right-anchored drawers on large screens.
- Preserve the opening/closing path and return keyboard focus to the trigger.
- Respect reduced motion, reduced transparency, and forced-colour modes.
- Continuous brand movement pauses on hover and stops under reduced motion.

## Storefront

- Header: compact black navigation with search, cart, and mobile menu.
- Hero: one H1, one supporting paragraph, two actions, store media, and no eyebrow label.
- Catalogue: search, category tabs, direct brand filters, four-column desktop grid, and two-column phone grid.
- Product cards: Supabase image, name, brand, authoritative price, real promo data, stock, and configured colors only.
- Quick view: gallery, color/stock selection, quantity, reassurance, and accessible details.
- Footer: real shop contact and social destinations.

## Admin

The admin uses a black work surface, dense tables, and right-side editors. It is the source of truth for prices, compare-at prices, promotion labels, product and pack visibility, ordering, stock, images, and color availability. Hidden records remain visible here but never appear in the public catalogue.

## Responsive and accessibility

- Breakpoints cover wide desktop, tablet, and narrow phones down to 390 CSS pixels.
- Touch targets are at least 36–44 pixels depending on context.
- Visible focus is mandatory; dialogs trap focus and support Escape.
- Text never depends on colour alone for status.
- Store media has a static poster fallback; product images have semantic alternatives or visible fallbacks.
