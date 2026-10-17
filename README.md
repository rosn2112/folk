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
- Rates are discussed through the enquiry flow. No universal room price or separate room/rate pitch is displayed inside the tour.
- The calculator is visible by default. Visitors edit current rent, food, help, bills, commuting and appliance rental costs. A positive room quote plus additional costs enables monthly/yearly savings, extra-cost or equal-cost results. No quote means no invented savings. Deposits and one-off purchases are excluded.
- Four enquiry choices: living at the residency, attending programmes, retreats, and learning about Ancient AI. Visit timing and the optional seven-day trial appear only for accommodation enquiries. Visitors can add a question before continuing to WhatsApp. Nothing is submitted to a server.

## Source and checks

- `index.html`, `style.css`, `main.js`: page, design and interactions.
- `site-logic.mjs`: calculator and enquiry-message logic.
- `tour/`: copied tour models, renderer, lighting and camera path; original parent files are untouched. `tour/copy.js` reads the owner’s current homepage copy for the scene captions and actions. Embedded tours read the parent document; standalone tours fetch the homepage without using an old cached copy. Deleted source text stays hidden. Refresh the website after saving copy edits; the embedded tour then reads that refreshed page. The standalone tour fetches the latest homepage when opened.
- `assets/`: supplied real photographs and a still captured from the actual 3D model.
- Existing `Main.*.html`, `support.js`, `motion.*`, `glass-carousel.js` and `vendor/` are retained upstream references, not runtime dependencies of this page. The original index remains in Git.

```sh
node tests/site-logic.test.mjs
node --check main.js
node --check tour/integration.js
node --check tour/main.js
```

The browser regression check at `/tests/tour-copy.test.html` verifies that current headings/descriptions appear in the tour, later edits are used, and deletions never fall back to the old promotional copy.

See `docs/validation.md` for browser checks, evidence and limitations.

## Content sources

The owner confirmed Wi-Fi, laundry, refrigerator, microwave and air-conditioned rooms; room rates vary and are shared with prospects. Furniture, meals and supplied photography come from the source materials. Unconfirmed electricity, housekeeping and other terms are not advertised as included in a universal price.

Google Maps walking directions checked on 17 October 2026 show about 6 minutes / 450 m to Santacruz railway station and about 10 minutes / 700–750 m to Santacruz metro. Routes are linked next to the estimates. BKC has a journey-planning link without an invented travel time.

Ancient AI's description is based on https://ancientai.in/. Programmes and retreats are enquiry categories; no unconfirmed dates, locations or attendance promises are published.

The 3D tour is an illustration, not a measured plan. Its city placement was originally estimated; the scene does not independently verify the real walking routes. The parent Blender master and original `web/` tour remain untouched.

## Credits

Property photographs are retained from the source repository. Furniture and textures: Poly Haven, CC0. Tour map: © OpenStreetMap contributors, ODbL. Three.js licensing is in `tour/vendor/THREE-LICENSE.txt`. The upstream stock assets remain as unused references and are not loaded or compared on the page.


## Production deployment

Vercel project: `ancient-residency` in `rosn2112s-projects`.

`node scripts/build.mjs` produces `dist/`, containing the current page, assets and 3D tour. Backup mockups, documentation and test pages are excluded from the production output. Vercel uses this command and output directory via `vercel.json`.

GitHub repository `rosn2112/folk` is connected to this Vercel project. The production branch is `codex/residency-tour-redesign`, which is also the current local working branch. Push commits to that branch to automatically update the production website and its attached domains:

```sh
git push origin codex/residency-tour-redesign
```

Other branches receive preview deployments. A manual production deployment remains available with `vercel deploy --prod --scope rosn2112s-projects`.

Add the desired subdomain in this Vercel project's Domains settings. The original `residency-tour` project is separate.
