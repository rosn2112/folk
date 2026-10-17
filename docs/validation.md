# Current redesign validation — 17 October 2026

Local branch: `codex/residency-tour-redesign`, based on upstream `67fdc48`. This pass supersedes the earlier fixed-price calculator and stock-photo comparison.

## Logic and source checks

- Node assertions pass for quote-free totals, positive savings, greater costs, equal amounts, monthly/yearly arithmetic and additional costs. Blank, negative, sub-rupee, invalid or excessive quotes do not produce savings. Invalid current expenses do not poison totals.
- All four enquiry types generate the appropriate WhatsApp message. Visit date and trial interest only enter accommodation messages. Optional notes are bounded to 800 characters and encoded, including markup and URL punctuation.
- JavaScript syntax and application-file whitespace checks pass. Copied Three.js vendor files retain their original upstream whitespace.
- Static validation finds unique IDs, valid internal anchors and existing local resources. No static iframe, public ₹28,000 price or stock-photo comparison remains. The tour comes immediately after the hero.

## Browser checks

- Mobile/default-width opening, rectangular model artwork, four-choice enquiry cards, context information and calculator inspected.
- Desktop review at 1280 × 900: opening artwork, pastel amenities, calculator result and enquiry cards. Responsive checks at 320 px and 390 px show document width equal to viewport width.
- The unactivated page has no iframe.
- With current monthly expenses ₹32,000, an entered quote ₹28,000 and extras ₹1,000, the browser shows ₹3,000/month and ₹36,000/year savings and correctly states total monthly costs here of ₹29,000. The entered quote is test input, not an advertised price.
- Living enquiry includes a selected next-week visit and trial interest. Switching to retreats removes both automatic accommodation fields and hides/disables their controls. Programme and Ancient AI choices generate their own messages; Ancient AI displays the official-site link.
- Typed questions remain available when switching interests. No WhatsApp message was sent.
- A retreat link in the Ancient AI section preselects the retreat enquiry and hides visit controls.
- Full-screen and inline tour entry still work. Closing the inline tour removes its iframe. No errors or warnings appeared in the inspected page console.
- A quote of ₹40,000 against ₹32,000 expenses correctly shows an additional ₹8,000 monthly cost, not savings.

## Transport and content verification

Google Maps was inspected directly in walking mode, rather than inferring times from the illustrative city model:

- Dunhill Corner, Rd Number 4, Sen Nagar, Santacruz East → Santacruz railway station: 6 minutes, 450 m via 7th Road and Road No. 6; alternate 7 minutes, 500 m.
- Dunhill Corner → Santacruz metro, Western Express Highway: 10 minutes, 750 m via 7th Road and Pandit Jawaharlal Nehru Road/Station Road; alternate 10 minutes, 700 m via Road No. 10.
- Directions are linked in the page and identified as approximate. No BKC journey time is asserted.

Building identity: https://www.lalanigroup.in/projects/dunhill-corner and Google Maps. Ancient AI activities/meaning: https://ancientai.in/. Writing review: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing, with the Humanizer skill; vague slogans and fabricated routines were replaced with concrete descriptions.

## Limits

Responsive checks use desktop-browser viewports, not physical phones. Physical Android/iPhone performance, Safari-specific behaviour and poor-network recovery remain untested. Iframe state preservation depends on browser support. The original city's model placement is illustrative and is not treated as evidence for real-world distances. Original parent Blender/tour files are unchanged. No hosting deployment was performed during validation.
