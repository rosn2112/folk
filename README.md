# Ancient Residency — home page and guided tour

A redesign of Shivam80004/folk, with a self-contained copy of the existing Dunhill Corner 3D tour. Work is on `codex/residency-tour-redesign`. Hosting deployment is separate from this source checkout.

## Preview

No dependencies or build step:

```sh
python3 -m http.server 4181 --bind 127.0.0.1
```

Open http://127.0.0.1:4181. The standalone tour is at `/tour/`.

## Current design

- Instrument Serif headings, warm paper, terracotta, peach, butter yellow and pale blue. Charcoal is used for the tour, calculator result and footer.
- Rectangular model artwork in the opening. The guided tour is the next section.
- Tour links open a full-screen dialog; the section also supports starting inline and expanding. Models load only after a visitor chooses to enter. Closing the tour releases its iframe and restores focus.
- `Element.moveBefore`, where supported, retains iframe state during expansion/collapse. Other browsers may restart the iframe when it moves; the outer page position remains.
- The page lists the confirmed appliances and amenities, real room photos and transport routes. There is no stock-photo comparison or generic daily-routine section.
- Rates are discussed privately. The site mentions 2- and 3-sharing availability and differing rates. No universal room price is displayed, including inside the copied tour.
- The calculator is visible by default. Visitors edit current rent, food, help, bills, commuting and appliance rental costs. A positive room quote plus additional costs enables monthly/yearly savings, extra-cost or equal-cost results. No quote means no invented savings. Deposits and one-off purchases are excluded.
- Four enquiry choices: living at the residency, attending programmes, retreats, and learning about Ancient AI. Visit timing and the optional seven-day trial appear only for accommodation enquiries. Visitors can add a question and inspect the prepared WhatsApp message before opening it. Nothing is submitted to a server.

## Source and checks

- `index.html`, `style.css`, `main.js`: page, design and interactions.
- `site-logic.mjs`: calculator and enquiry-message logic.
- `tour/`: copied tour models, renderer, lighting, camera path and integration. Pricing and station captions reflect the current page; original parent files are untouched.
- `assets/`: supplied real photographs and a still captured from the actual 3D model.
- Existing `Main.*.html`, `support.js`, `motion.*`, `glass-carousel.js` and `vendor/` are retained upstream references, not runtime dependencies of this page. The original index remains in Git.

```sh
node tests/site-logic.test.mjs
node --check main.js
node --check tour/integration.js
node --check tour/main.js
```

See `docs/validation.md` for browser checks, evidence and limitations.

## Content sources

The owner confirmed Wi-Fi, laundry, refrigerator, microwave and air-conditioned rooms; room rates vary and are shared with prospects. Furniture, meals and supplied photography come from the source materials. Unconfirmed electricity, housekeeping and other terms are not advertised as included in a universal price.

Google Maps walking directions checked on 17 October 2026 show about 6 minutes / 450 m to Santacruz railway station and about 10 minutes / 700–750 m to Santacruz metro. Routes are linked next to the estimates. BKC has a journey-planning link without an invented travel time.

Ancient AI's description is based on https://ancientai.in/. Programmes and retreats are enquiry categories; no unconfirmed dates, locations or attendance promises are published.

The 3D tour is an illustration, not a measured plan. Its city placement was originally estimated; the scene does not independently verify the real walking routes. The parent Blender master and original `web/` tour remain untouched.

## Credits

Property photographs are retained from the source repository. Furniture and textures: Poly Haven, CC0. Tour map: © OpenStreetMap contributors, ODbL. Three.js licensing is in `tour/vendor/THREE-LICENSE.txt`. The upstream stock assets remain as unused references and are not loaded or compared on the page.
